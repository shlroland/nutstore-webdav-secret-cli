import { TextAttributes } from "@opentui/core";
import type { OpenTUIElement } from "../opentui-jsx";
import type { Palette } from "../theme";

export function Footer(props: { palette: Palette }): OpenTUIElement {
  return (
    <box height={1} flexDirection="row" flexWrap="wrap" columnGap={1}>
      <FooterHint action="select" keyLabel="Up/Down" palette={props.palette} />
      <FooterHint action="copy secret" keyLabel="Enter" palette={props.palette} />
      <FooterHint action="copy URL" keyLabel="U" palette={props.palette} />
      <FooterHint action="copy account" keyLabel="A" palette={props.palette} />
      <FooterHint action="new secret" keyLabel="N" palette={props.palette} />
      <FooterHint action="delete" keyLabel="D" palette={props.palette} />
      <FooterHint action="refresh" keyLabel="R" palette={props.palette} />
      <FooterHint action="quit" keyLabel="Q" palette={props.palette} />
    </box>
  );
}

function FooterHint(props: {
  action: string;
  keyLabel: string;
  palette: Palette;
}): OpenTUIElement {
  return (
    <box flexDirection="row" marginRight={1}>
      <text
        attributes={TextAttributes.BOLD}
        bg={props.palette.selectedBg}
        fg={props.palette.selectedFg}
      >
        {" "}{props.keyLabel}{" "}
      </text>
      <text fg={props.palette.muted}> {props.action}</text>
    </box>
  );
}
