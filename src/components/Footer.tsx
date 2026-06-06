import type { Palette } from "../theme";

export function Footer(props: { palette: Palette }) {
  return (
    <box height={1} flexDirection="row">
      <text fg={props.palette.muted}>
        Up/Down select   Enter copy password   U copy URL   D delete   R refresh   Q quit
      </text>
    </box>
  );
}
