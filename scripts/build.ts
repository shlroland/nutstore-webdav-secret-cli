import solidPlugin from "@opentui/solid/bun-plugin";
import { writeFile } from "node:fs/promises";

const APP_NAME = "nswds";
const BUILD_MODE = process.env.BUILD_MODE ?? "bundle";
const runBuild = Bun.build as (config: unknown) => Promise<unknown>;
if (BUILD_MODE === "compile") {
  const target =
    (process.env.BUILD_TARGET as BuildTarget | undefined) ?? inferBuildTarget();
  const outfile = process.env.BUILD_OUTFILE ?? `dist/${APP_NAME}`;

  await runBuild({
    entrypoints: ["./src/cli.tsx"],
    plugins: [solidPlugin],
    compile: {
      target,
      outfile,
    },
  });

  console.log(`Built ${outfile} for ${target}`);
} else {
  const outdir = process.env.BUILD_OUTDIR ?? "dist";
  const appOutfile = `${outdir}/main.js`;
  const cliOutfile = `${outdir}/cli.js`;

  await runBuild({
    entrypoints: ["./src/main.tsx"],
    plugins: [solidPlugin],
    target: "bun",
    format: "esm",
    minify: true,
    packages: "external",
    outdir,
    naming: {
      entry: "[name].js",
    },
  });

  await writeFile(
    cliOutfile,
    [
      "#!/usr/bin/env bun",
      "",
      'import "@opentui/solid/preload";',
      'await import("./main.js");',
      "",
    ].join("\n"),
  );

  console.log(`Built ${cliOutfile} and ${appOutfile} for npm distribution`);
}

function inferBuildTarget(): BuildTarget {
  const platform = process.platform;
  const arch = process.arch;

  if (platform === "darwin" && arch === "arm64") {
    return "bun-darwin-arm64";
  }

  if (platform === "darwin" && arch === "x64") {
    return "bun-darwin-x64";
  }

  if (platform === "linux" && arch === "x64") {
    return "bun-linux-x64";
  }

  if (platform === "linux" && arch === "arm64") {
    return "bun-linux-arm64";
  }

  if (platform === "win32" && arch === "x64") {
    return "bun-windows-x64";
  }

  if (platform === "win32" && arch === "arm64") {
    return "bun-windows-arm64";
  }

  throw new Error(`Unsupported build target for ${platform}-${arch}`);
}

type BuildTarget =
  | "bun-darwin-arm64"
  | "bun-darwin-x64"
  | "bun-linux-arm64"
  | "bun-linux-x64"
  | "bun-windows-arm64"
  | "bun-windows-x64";
