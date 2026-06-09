import { TextAttributes, type ThemeMode } from "@opentui/core";
import type { OpenTUIElement } from "../opentui-jsx";
import type { Palette } from "../theme";
import { NutstoreLogo } from "./nutstore-logo";

type HeaderProps = {
  count: number;
  palette: Palette;
  status: string;
  themeMode: ThemeMode | null;
};

export function Header(props: HeaderProps): OpenTUIElement {
  return (
    <box height={7} flexDirection="row" alignItems="center">
      <box
        width={40}
        marginRight={2}
        alignItems="center"
        justifyContent="center"
      >
        <NutstoreLogo palette={props.palette} />
      </box>
      <box
        flexDirection="column"
        flexGrow={1}
        justifyContent="center"
        rowGap={1}
      >
        <text attributes={TextAttributes.BOLD} fg={props.palette.fg}>
          WebDAV App Passwords
        </text>
        <text fg={props.palette.muted} truncate>
          {props.count} secrets | {props.themeMode ?? "light"} | {props.status}
        </text>
      </box>
    </box>
  );
}
