import { fonts } from "@opentui/core";
import { For } from "solid-js";
import type { OpenTUIElement } from "../opentui-jsx";
import type { Palette } from "../theme";

const LOGO_TEXT = "Nutstore";
const LOGO_FONT = fonts.grid;
const COLOR_TAG_PATTERN = /<\/?c\d+>/g;

type NutstoreLogoProps = {
  palette: Palette;
};

export function NutstoreLogo(props: NutstoreLogoProps): OpenTUIElement {
  const lines = renderLogoLines();

  return (
    <box flexDirection="column">
      <For each={lines}>
        {(line, index) => (
          <text fg={gradientColor(props.palette.brandLogo, index(), lines.length)}>
            {line}
          </text>
        )}
      </For>
    </box>
  );
}

function renderLogoLines(): string[] {
  return Array.from({ length: LOGO_FONT.lines }, (_, lineIndex) =>
    LOGO_TEXT.toUpperCase()
      .split("")
      .map((letter) => {
        const glyph = LOGO_FONT.chars[letter as keyof typeof LOGO_FONT.chars];
        return (glyph?.[lineIndex] ?? "").replace(COLOR_TAG_PATTERN, "");
      })
      .join(" ".repeat(LOGO_FONT.letterspace_size)),
  );
}

function gradientColor(colors: string[], index: number, total: number): string {
  if (colors.length === 0) {
    return "#D89F44";
  }

  if (total <= 1) {
    return colors[0] ?? "#D89F44";
  }

  const colorIndex = Math.round((index * (colors.length - 1)) / (total - 1));
  return colors[colorIndex] ?? colors[0] ?? "#D89F44";
}
