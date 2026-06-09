import solidPlugin from "@opentui/solid/bun-plugin";

const APP_NAME = "nswds";

type BuildTarget =
  | "bun-darwin-arm64"
  | "bun-darwin-x64"
  | "bun-linux-arm64"
  | "bun-linux-x64"
  | "bun-windows-arm64"
  | "bun-windows-x64";

const target = (process.env.BUILD_TARGET as BuildTarget | undefined) ?? inferBuildTarget();
const outfile = process.env.BUILD_OUTFILE ?? `dist/${APP_NAME}`;

await Bun.build({
  entrypoints: ["./src/cli.tsx"],
  plugins: [solidPlugin],
  compile: {
    target,
    outfile,
  },
});

console.log(`Built ${outfile} for ${target}`);

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
