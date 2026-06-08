import { Data, Effect } from "effect";
import { FetchHttpClient, HttpBody, HttpClient, UrlParams } from "effect/unstable/http";

const REVOKE_ASP_URL = "https://www.jianguoyun.com/d/ajax/userop/revokeAsp";

export class DeleteSecretHttpError extends Data.TaggedError("DeleteSecretHttpError")<{
  readonly cause: unknown;
  readonly message: string;
}> { }

export class DeleteSecretValidationError extends Data.TaggedError("DeleteSecretValidationError")<{
  readonly message: string;
}> { }

export const deleteSecret = (
  cookie: string,
  name: string,
): Effect.Effect<void, DeleteSecretHttpError | DeleteSecretValidationError> =>
  Effect.gen(function* () {
    const normalizedName = name.trim();

    if (normalizedName.length === 0) {
      return yield* Effect.fail(
        new DeleteSecretValidationError({
          message: "Secret name cannot be empty.",
        }),
      );
    }

    const client = yield* HttpClient.HttpClient;
    const response = yield* client.post(REVOKE_ASP_URL, {
      headers: {
        Accept: "*/*",
        Cookie: cookie,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Origin: "https://www.jianguoyun.com",
        Referer: "https://www.jianguoyun.com/d/mobile_asp",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: HttpBody.urlParams(
        UrlParams.fromInput({
          asp_name: normalizedName,
        }),
      ),
    }).pipe(
      Effect.mapError((cause) =>
        new DeleteSecretHttpError({
          cause,
          message: "Failed to request Nutstore revokeAsp endpoint.",
        }),
      ),
    );

    if (response.status < 200 || response.status >= 300) {
      return yield* Effect.fail(
        new DeleteSecretHttpError({
          cause: response.status,
          message: `revokeAsp returned ${response.status}.`,
        }),
      );
    }
  }).pipe(Effect.provide(FetchHttpClient.layer));
