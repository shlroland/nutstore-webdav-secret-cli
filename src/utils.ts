export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

export const truncate = (value: string, maxLength: number) => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 3))}...`;
};

export const maskPassword = (password: string) =>
  `********${password.slice(-3)}`;

export const copyToClipboard = async (value: string) => {
  if (typeof Bun === "undefined") {
    return false;
  }

  const process = Bun.spawn(["pbcopy"], {
    stdin: "pipe",
    stdout: "ignore",
    stderr: "ignore",
  });

  process.stdin.write(value);
  process.stdin.end();

  const exitCode = await process.exited;
  return exitCode === 0;
};
