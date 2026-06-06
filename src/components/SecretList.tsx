import { For, Show } from "solid-js";
import type { OpenTUIElement } from "../opentui-jsx";
import type { Palette } from "../theme";
import type { SecretItem } from "../types";
import { maskPassword, truncate } from "../utils";

type SecretListProps = {
  items: SecretItem[];
  palette: Palette;
  selectedIndex: number;
};

export function SecretList(props: SecretListProps): OpenTUIElement {
  return (
    <box
      border
      borderColor={props.palette.border}
      flexDirection="column"
      paddingX={1}
      title="Secrets"
      width={34}
    >
      <Show
        when={props.items.length > 0}
        fallback={
          <box flexGrow={1} alignItems="center" justifyContent="center">
            <text fg={props.palette.muted}>No app passwords</text>
          </box>
        }
      >
        <For each={props.items}>
          {(item, index) => {
            const selected = () => index() === props.selectedIndex;
            const prefix = () => String(index() + 1).padStart(2, "0");

            return (
              <text
                bg={selected() ? props.palette.selectedBg : undefined}
                fg={selected() ? props.palette.selectedFg : props.palette.fg}
                truncate
              >
                {prefix()}  {truncate(item.name.padEnd(14), 14)}{" "}
                {maskPassword(item.password)}
              </text>
            );
          }}
        </For>
      </Show>
    </box>
  );
}
