import { Data, Effect } from "effect";
import { FetchHttpClient, HttpClient } from "effect/unstable/http";
import type { SecretItem } from "../types";

const MOBILE_ASP_URL = "https://www.jianguoyun.com/d/mobile_asp";
const USER_ASPS_PATTERN = /userAspsStr\s*:\s*'((?:\\'|[^'])*)'/;

export class MobileAspHttpError extends Data.TaggedError("MobileAspHttpError")<{
  readonly cause: unknown;
  readonly message: string;
}> { }

export class MobileAspParseError extends Data.TaggedError("MobileAspParseError")<{
  readonly message: string;
}> { }

export type MobileAspRecord = {
  credential: string;
  creationTime: string;
  name: string;
};

export const parseSecretsHtml = (html: string): SecretItem[] => {
  const userAspsMatch = html.match(USER_ASPS_PATTERN);

  if (!userAspsMatch) {
    throw new MobileAspParseError({
      message: "Could not extract userAspsStr from mobile_asp HTML.",
    });
  }

  const userAspsLiteral = userAspsMatch[1];
  if (userAspsLiteral === undefined) {
    throw new MobileAspParseError({
      message: "userAspsStr capture group was empty.",
    });
  }

  const rawUserAsps = decodeJsSingleQuotedString(userAspsLiteral);
  const records = parseMobileAspRecords(rawUserAsps);

  return records.map(toSecretItem);
};

export const querySecretsList = (
  cookie: string,
): Effect.Effect<SecretItem[], MobileAspHttpError | MobileAspParseError> =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient;
    const response = yield* client.get(MOBILE_ASP_URL, {
      headers: {
        Cookie: cookie,
        Accept: "text/html,application/xhtml+xml",
      },
    }).pipe(
      Effect.mapError((cause) =>
        new MobileAspHttpError({
          cause,
          message: "Failed to fetch Nutstore mobile_asp page.",
        }),
      ),
    );

    const html = yield* response.text.pipe(
      Effect.mapError((cause) =>
        new MobileAspHttpError({
          cause,
          message: "Failed to read Nutstore mobile_asp response body.",
        }),
      ),
    );

    if (response.status < 200 || response.status >= 300) {
      return yield* Effect.fail(
        new MobileAspHttpError({
          cause: response.status,
          message: `mobile_asp returned ${response.status}: ${formatHtmlSnippet(html)}`,
        }),
      );
    }

    return yield* Effect.try({
      try: () => parseSecretsHtml(html),
      catch: (cause) =>
        cause instanceof MobileAspParseError
          ? cause
          : new MobileAspParseError({
            message: `Failed to parse Nutstore mobile_asp HTML: ${formatHtmlSnippet(html)}`,
          }),
    });
  }).pipe(Effect.provide(FetchHttpClient.layer));

function decodeJsSingleQuotedString(value: string): string {
  return value
    .replace(/\\\\/g, "\\")
    .replace(/\\'/g, "'");
}

function formatHtmlSnippet(html: string): string {
  return html
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

function parseMobileAspRecords(value: string): MobileAspRecord[] {
  const parsed = JSON.parse(value) as unknown;

  if (!Array.isArray(parsed)) {
    throw new MobileAspParseError({
      message: "userAspsStr is not a JSON array.",
    });
  }

  return parsed.map((item, index) => {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof item.credential !== "string" ||
      typeof item.creationTime !== "string" ||
      typeof item.name !== "string"
    ) {
      throw new MobileAspParseError({
        message: `Invalid ASP record at index ${index}.`,
      });
    }

    return item;
  });
}

function toSecretItem(record: MobileAspRecord): SecretItem {
  const normalizedName = record.name.trim() || "Untitled App Password";

  return {
    id: `secret_${record.creationTime}_${normalizedName}`,
    name: normalizedName,
    password: record.credential,
    createdAt: record.creationTime,
  };
}
