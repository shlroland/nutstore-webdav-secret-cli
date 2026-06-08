import { TextAttributes } from "@opentui/core";
import type { OpenTUIElement } from "../opentui-jsx";
import type { Palette } from "../theme";

type NutstoreLogoProps = {
  palette: Palette;
};

const MARK_LINES = [
  ["  ▗▄▄▄  ", "brand"],
  [" ▟████▙ ", "brand"],
  [" ███▀▀  ", "accent"],
  [" ▜████▛ ", "brand"],
  ["  ▝▀▀▘  ", "muted"],
] as const;

const WORDMARK_LINES = [
  "NUTSTORE",
  "Personal cloud,",
  "without the noise",
] as const;

export function NutstoreLogo(props: NutstoreLogoProps): OpenTUIElement {
  return (
    <box alignItems="center" flexDirection="row" gap={2}>
      <box flexDirection="column">
        {MARK_LINES.map(([line, tone]) => (
          <text fg={toneColor(props.palette, tone)}>{line}</text>
        ))}
      </box>

      <box flexDirection="column" justifyContent="center">
        <text attributes={TextAttributes.BOLD} fg={props.palette.fg}>
          {WORDMARK_LINES[0]}
        </text>
        <text fg={props.palette.muted}>{WORDMARK_LINES[1]}</text>
        <text fg={props.palette.muted}>{WORDMARK_LINES[2]}</text>
      </box>
    </box>
  );
}

function toneColor(
  palette: Palette,
  tone: "brand" | "accent" | "muted",
): string {
  if (tone === "muted") {
    return palette.muted;
  }

  if (tone === "accent") {
    return palette.brandLogo[3] ?? palette.fg;
  }

  return palette.brandLogo[1] ?? palette.fg;
}
