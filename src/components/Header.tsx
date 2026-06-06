import { TextAttributes, type ThemeMode } from "@opentui/core";
import type { Palette } from "../theme";

type HeaderProps = {
  count: number;
  palette: Palette;
  status: string;
  themeMode: ThemeMode | null;
};

export function Header(props: HeaderProps) {
  return (
    <box height={4} flexDirection="row" alignItems="center" gap={2}>
      <box width={28} alignItems="center" justifyContent="center">
        <ascii_font color={props.palette.fg} font="tiny" text="Nutstore" />
      </box>
      <box flexDirection="column" flexGrow={1} justifyContent="center">
        <text attributes={TextAttributes.BOLD} fg={props.palette.fg}>
          WebDAV App Passwords
        </text>
        <text fg={props.palette.muted}>
          {props.count} secrets | {props.themeMode ?? "light"} | {props.status}
        </text>
      </box>
    </box>
  );
}
