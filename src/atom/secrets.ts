import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Atom from "effect/unstable/reactivity/Atom";
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult";
import { MobileAspHttpError, MobileAspParseError, querySecretsList } from "../effect/list-secrets";
import type { SecretItem } from "../types";
import { cookieAtom } from "./auth";
import { runtimeAtom } from "./platform";

export type SecretsLoadState = "loading" | "ready" | "empty" | "error";
type SecretsError = MobileAspHttpError | MobileAspParseError;

const EMPTY_SECRETS: SecretItem[] = [];

export const secretsPageInfoAtom: Atom.Atom<
  AsyncResult.AsyncResult<SecretItem[], SecretsError>
> = runtimeAtom.atom((get): Effect.Effect<SecretItem[], SecretsError> => {
  const cookie = get(cookieAtom);

  if (!cookie) {
    return Effect.succeed(EMPTY_SECRETS);
  }

  return querySecretsList(cookie);
}).pipe(Atom.keepAlive);

export const secretsListAtom = Atom.make((get) =>
  AsyncResult.getOrElse(get(secretsPageInfoAtom), () => EMPTY_SECRETS),
).pipe(Atom.keepAlive);

export const secretsLoadStateAtom = Atom.make((get): SecretsLoadState => {
  const result = get(secretsPageInfoAtom);

  if (AsyncResult.isInitial(result) || result.waiting) {
    return "loading";
  }

  if (AsyncResult.isFailure(result)) {
    return "error";
  }

  return result.value.length > 0 ? "ready" : "empty";
}).pipe(Atom.keepAlive);

export const secretsStatusMessageAtom = Atom.make((get): string => {
  const result = get(secretsPageInfoAtom);

  if (AsyncResult.isInitial(result) || result.waiting) {
    return "Loading app passwords...";
  }

  if (AsyncResult.isFailure(result)) {
    return Option.match(AsyncResult.error(result), {
      onNone: () => "Failed to load app passwords",
      onSome: (error) => error.message,
    });
  }

  return `Loaded ${result.value.length} app passwords`;
}).pipe(Atom.keepAlive);
