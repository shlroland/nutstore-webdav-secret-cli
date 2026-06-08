import { Data } from "effect";
import * as Effect from "effect/Effect";
import * as Atom from "effect/unstable/reactivity/Atom";
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult";
import { ConfigFileError, readCookie, saveCookie } from "../effect/auth";
import { runtimeAtom } from "./platform";

export type AuthState = "checking" | "anonymous" | "authenticated";
export type SaveCookieError = InvalidCookieError | ConfigFileError;

class InvalidCookieError extends Data.TaggedError("InvalidCookieError")<{
  readonly message: string;
}> {}

export const storedCookieAtom = runtimeAtom.atom(
  readCookie.pipe(Effect.map((cookie) => cookie.trim())),
).pipe(Atom.keepAlive);

export const saveCookieAtom = runtimeAtom.fn((cookie: string) => {
  const normalized = cookie.trim();

  if (normalized.length === 0) {
    return Effect.fail<SaveCookieError>(
      new InvalidCookieError({
        message: "Cookie is empty. Paste a Cookie header to continue.",
      }),
    );
  }

  return saveCookie(normalized).pipe(
    Effect.as(normalized),
    Effect.mapError((error): SaveCookieError => error),
  );
}).pipe(Atom.keepAlive);

export const authStateAtom = Atom.make((get): AuthState => {
  const storedResult = get(storedCookieAtom);
  const saveResult = get(saveCookieAtom);

  if (AsyncResult.isInitial(storedResult) || storedResult.waiting) {
    return "checking";
  }

  const cookie = AsyncResult.getOrElse(saveResult, () =>
    AsyncResult.getOrElse(storedResult, () => null as string | null),
  );

  return cookie && cookie.trim().length > 0 ? "authenticated" : "anonymous";
}).pipe(Atom.keepAlive);

export const cookieAtom = Atom.make((get) =>
  AsyncResult.getOrElse(get(saveCookieAtom), () =>
    AsyncResult.getOrElse(get(storedCookieAtom), () => null as string | null),
  ),
).pipe(Atom.keepAlive);
