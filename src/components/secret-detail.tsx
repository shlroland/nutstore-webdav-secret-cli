import { TextAttributes } from "@opentui/core";
import { Show } from "solid-js";
import { WEBDAV_URL } from "../constants";
import type { OpenTUIElement } from "../opentui-jsx";
import type { Palette } from "../theme";
import type { SecretItem } from "../types";
import { truncate } from "../utils";

type SecretDetailProps = {
  addName: string;
  addSecretMode: boolean;
  addError: string | null;
  addingSecret: boolean;
  confirmingDelete: boolean;
  item: SecretItem | null;
  onAddNameInput: (value: string) => void;
  onAddSubmit: () => void;
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
      title={props.addSecretMode ? "Add Secret" : props.confirmingDelete ? "Confirm Delete" : "Detail"}
    >
      <Show when={props.addSecretMode}>
        <AddSecretContent
          addError={props.addError}
          addName={props.addName}
          addingSecret={props.addingSecret}
          onAddNameInput={props.onAddNameInput}
          onAddSubmit={props.onAddSubmit}
          palette={props.palette}
        />
      </Show>
      <Show when={!props.addSecretMode}>
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
      </Show>
    </box>
  );
}

function AddSecretContent(props: {
  addError: string | null;
  addName: string;
  addingSecret: boolean;
  onAddNameInput: (value: string) => void;
  onAddSubmit: () => void;
  palette: Palette;
}): OpenTUIElement {
  return (
    <box flexDirection="column" gap={1}>
      <text attributes={TextAttributes.BOLD} fg={props.palette.fg}>
        Create App Password
      </text>
      <text fg={props.palette.muted}>
        Enter a name, then press Enter to create a new app password.
      </text>
      <input
        cursorColor={props.palette.cursor}
        focused
        focusedTextColor={props.palette.fg}
        onInput={props.onAddNameInput}
        onSubmit={props.onAddSubmit}
        placeholder="NICE-APP-PASSWORD"
        placeholderColor={props.palette.muted}
        textColor={props.palette.fg}
        value={props.addName}
      />
      <Show when={props.addingSecret}>
        <text fg={props.palette.muted}>Creating app password...</text>
      </Show>
      <Show when={props.addError}>
        <text fg={props.palette.danger}>{props.addError}</text>
      </Show>
      <box flexDirection="row" flexWrap="wrap" columnGap={1}>
        <ShortcutHint action="create secret" keyLabel="Enter" palette={props.palette} />
        <ShortcutHint action="cancel" keyLabel="Esc" palette={props.palette} />
      </box>
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
          shouldTruncate={false}
        />
        <DetailRow
          label="Account"
          palette={props.palette}
          value={props.item.account ?? "Unavailable"}
          shouldTruncate={false}
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
          <box flexDirection="row" flexWrap="wrap" columnGap={1}>
            <ShortcutHint action="copy secret" keyLabel="Enter" palette={props.palette} />
            <ShortcutHint action="copy URL" keyLabel="U" palette={props.palette} />
            <ShortcutHint action="copy account" keyLabel="A" palette={props.palette} />
            <ShortcutHint action="new secret" keyLabel="N" palette={props.palette} />
            <ShortcutHint action="delete" keyLabel="D" palette={props.palette} />
          </box>
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
  shouldTruncate?: boolean;
}): OpenTUIElement {
  return (
    <box flexDirection="row">
      <text width={9} fg={props.palette.muted}>
        {props.label}
      </text>
      <text flexGrow={1} fg={props.palette.fg} truncate={props.shouldTruncate !== false}>
        {props.shouldTruncate !== false ? truncate(props.value, props.maxLength ?? 29) : props.value}
      </text>
    </box>
  );
}

function ShortcutHint(props: {
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
