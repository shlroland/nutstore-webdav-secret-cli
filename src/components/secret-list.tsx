import { useAtomValue } from "@effect/atom-solid";
import { For, Match, Switch } from "solid-js";
import { secretsListAtom, secretsLoadStateAtom, secretsStatusMessageAtom } from "../atom/secrets";
import type { OpenTUIElement } from "../opentui-jsx";
import type { Palette } from "../theme";
import { maskPassword, truncate } from "../utils";

type SecretListProps = {
  palette: Palette;
  selectedIndex: number;
};

export function SecretList(props: SecretListProps): OpenTUIElement {
  const items = useAtomValue(() => secretsListAtom);
  const loadState = useAtomValue(() => secretsLoadStateAtom);
  const statusMessage = useAtomValue(() => secretsStatusMessageAtom);

  return (
    <box
      border
      borderColor={props.palette.border}
      flexDirection="column"
      flexShrink={0}
      paddingX={1}
      title="Secrets"
      width={44}
    >
      <Switch
        fallback={
          <For each={items()}>
            {(item, index) => {
              const selected = () => index() === props.selectedIndex;
              const prefix = () => String(index() + 1).padStart(2, "0");

              return (
                <box flexDirection="row" justifyContent="space-between">
                  <text
                    bg={selected() ? props.palette.selectedBg : undefined}
                    fg={selected() ? props.palette.selectedFg : props.palette.fg}
                    flexGrow={1}
                    truncate
                  >
                    {prefix()}  {truncate(item.name.padEnd(18), 18)}{" "}

                  </text>
                  <text
                    truncate>
                    {maskPassword(item.password).padStart(12)}
                  </text>
                </box>

              );
            }}
          </For>
        }
      >
        <Match when={loadState() === "loading"}>
          <box flexGrow={1} alignItems="center" justifyContent="center">
            <text fg={props.palette.muted}>Loading app passwords...</text>
          </box>
        </Match>
        <Match when={loadState() === "error"}>
          <box flexDirection="column" flexGrow={1} justifyContent="center" paddingX={1}>
            <text fg={props.palette.muted}>Failed to load app passwords</text>
            <text fg={props.palette.muted} truncate>
              {statusMessage()}
            </text>
          </box>
        </Match>
        <Match when={loadState() === "empty"}>
          <box flexGrow={1} alignItems="center" justifyContent="center">
            <text fg={props.palette.muted}>No app passwords</text>
          </box>
        </Match>
      </Switch>
    </box>
  );
}
