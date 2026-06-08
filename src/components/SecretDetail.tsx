import { TextAttributes } from "@opentui/core";
import { Show } from "solid-js";
import { WEBDAV_URL } from "../constants";
import type { OpenTUIElement } from "../opentui-jsx";
import type { Palette } from "../theme";
import type { SecretItem } from "../types";
import { truncate } from "../utils";

type SecretDetailProps = {
  confirmingDelete: boolean;
  item: SecretItem | null;
  palette: Palette;
};

export function SecretDetail(props: SecretDetailProps): OpenTUIElement {
  return (
    <box
      border
      borderColor={props.confirmingDelete ? props.palette.danger : props.palette.border}
      flexDirection="column"
      flexGrow={1}
      paddingX={2}
      paddingY={1}
      title={props.confirmingDelete ? "Confirm Delete" : "Detail"}
    >
      <Show
        when={props.item !== null}
        fallback={
          <box flexGrow={1} alignItems="center" justifyContent="center">
            <text fg={props.palette.muted}>
              Select an app password to inspect
            </text>
          </box>
        }
      >
        <SecretDetailContent
          confirmingDelete={props.confirmingDelete}
          item={props.item as SecretItem}
          palette={props.palette}
        />
      </Show>
    </box>
  );
}

function SecretDetailContent(props: {
  confirmingDelete: boolean;
  item: SecretItem;
  palette: Palette;
}): OpenTUIElement {
  return (
    <box flexDirection="column" gap={1}>
      <text attributes={TextAttributes.BOLD} fg={props.palette.fg} truncate>
        {truncate(props.item.name, 36)}
      </text>

      <box flexDirection="column">
        <DetailRow
          label="WebDAV"
          maxLength={27}
          palette={props.palette}
          value={WEBDAV_URL}
        />
        <DetailRow
          label="Account"
          palette={props.palette}
          value={props.item.account ?? "Unavailable"}
        />
        <DetailRow
          label="Password"
          palette={props.palette}
          value={props.item.password}
        />
        <DetailRow
          label="Created"
          palette={props.palette}
          value={props.item.createdAt}
        />
      </box>

      <Show
        when={props.confirmingDelete}
        fallback={
          <text fg={props.palette.muted}>Enter copy | U URL | D delete</text>
        }
      >
        <box border borderColor={props.palette.danger} paddingX={1}>
          <text fg={props.palette.danger}>Press Y to delete, Esc to cancel</text>
        </box>
      </Show>
    </box>
  );
}

function DetailRow(props: {
  label: string;
  palette: Palette;
  value: string;
  maxLength?: number;
}): OpenTUIElement {
  return (
    <box flexDirection="row">
      <text width={9} fg={props.palette.muted}>
        {props.label}
      </text>
      <text flexGrow={1} fg={props.palette.fg} truncate>
        {truncate(props.value, props.maxLength ?? 29)}
      </text>
    </box>
  );
}
