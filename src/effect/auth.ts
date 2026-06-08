import { Effect, Data } from 'effect'
import { FileSystem } from 'effect/FileSystem'
import path from 'node:path'
import os from 'node:os'

class ConfigFileError extends Data.TaggedError('ConfigFileError')<{
  readonly cause: unknown
  readonly message: string
}> { }

class CookieNotFoundError extends Data.TaggedError('CookieNotFoundError') { }

const resolveConfigPaths = Effect.sync(function () {
  const configDir = path.join(os.homedir(), '.config', 'nswds')
  const configFile = path.join(configDir, 'cookie')

  return { configDir, configFile }
})

export const readCookie = Effect.gen(function* () {
  const { configDir, configFile } = yield* resolveConfigPaths
  const fs = yield* FileSystem
  const fileContent = yield* fs.readFileString(configFile).pipe(
    Effect.catchTag("PlatformError", err => {
      return new CookieNotFoundError()
    })
  )

  if (!fileContent || !fileContent.trim()) {
    return yield* Effect.fail(new CookieNotFoundError())
  }

  return fileContent
})

export const saveCookie = Effect.fnUntraced(function* (cookie: string) {
  const { configDir, configFile } = yield* resolveConfigPaths
  const fs = yield* FileSystem

  yield* Effect.gen((function* () {
    yield* fs.makeDirectory(configDir, { recursive: true })
    yield* fs.writeFileString(configFile, cookie)
  })).pipe(
    Effect.mapError(systemError => new ConfigFileError({ cause: systemError, message: "write file failed" }))
  )
})
