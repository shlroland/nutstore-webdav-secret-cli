import { Data, Effect, Schema } from "effect";
import { FetchHttpClient, HttpBody, HttpClient, HttpClientResponse, UrlParams } from "effect/unstable/http";
import type { SecretItem } from "../types";

const GENERATE_ASP_URL = "https://www.jianguoyun.com/d/ajax/userop/generateAsp";

export class AddSecretHttpError extends Data.TaggedError("AddSecretHttpError")<{
  readonly cause: unknown;
  readonly message: string;
}> { }

export class AddSecretParseError extends Data.TaggedError("AddSecretParseError")<{
  readonly message: string;
}> { }

const AddSecretResponseSchema = Schema.Struct({
  credential: Schema.String,
  creationTime: Schema.String,
  name: Schema.String,
});

export type AddSecretResponse = Schema.Schema.Type<typeof AddSecretResponseSchema>;

export const addSecret = (
  cookie: string,
  name: string,
): Effect.Effect<SecretItem, AddSecretHttpError | AddSecretParseError> =>
  Effect.gen(function* () {
    const normalizedName = name.trim();

    if (normalizedName.length === 0) {
      return yield* Effect.fail(
        new AddSecretParseError({
          message: "Secret name cannot be empty.",
        }),
      );
    }

    const client = yield* HttpClient.HttpClient;
    const response = yield* client.post(GENERATE_ASP_URL, {
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
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
        new AddSecretHttpError({
          cause,
          message: "Failed to request Nutstore generateAsp endpoint.",
        }),
      ),
    );

    if (response.status < 200 || response.status >= 300) {
      return yield* Effect.fail(
        new AddSecretHttpError({
          cause: response.status,
          message: `generateAsp returned ${response.status}.`,
        }),
      );
    }

    const record = yield* HttpClientResponse.schemaBodyJson(AddSecretResponseSchema)(
      response,
    ).pipe(
      Effect.mapError((cause) =>
        new AddSecretParseError({
          message: "generateAsp response is not a valid ASP record.",
        }),
      ),
    );

    return toSecretItem(record);
  }).pipe(Effect.provide(FetchHttpClient.layer));

function toSecretItem(record: AddSecretResponse): SecretItem {
  const normalizedName = record.name.trim() || "Untitled App Password";

  return {
    id: `secret_${record.creationTime}_${normalizedName}`,
    name: normalizedName,
    password: record.credential,
    createdAt: record.creationTime,
  };
}
