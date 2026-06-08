import { useAtomValue } from "@effect/atom-solid";
import { Match, Switch, createMemo } from "solid-js";
import { AuthGate } from "./components/AuthGate";
import { SecretsPage } from "./components/SecretsPage";
import { authStateAtom, cookieAtom } from "./atom/auth";
import { useThemeMode } from "./hooks/useThemeMode";
import type { OpenTUIElement } from "./opentui-jsx";
import { getPalette } from "./theme";

function AuthChecking(props: {
  cookie: string | null;
  muted: string;
  fg: string;
}): OpenTUIElement {
  return (
    <box
      alignItems="center"
      flexDirection="column"
      flexGrow={1}
      gap={1}
      justifyContent="center"
      paddingX={2}
    >
      <text fg={props.fg}>Checking stored cookie...</text>
      <text fg={props.muted}>
        {props.cookie ? "Refreshing existing session..." : "Loading authentication state..."}
      </text>
    </box>
  );
}

export function App(): OpenTUIElement {
  const themeMode = useThemeMode();
  const palette = createMemo(() => getPalette(themeMode()));
  const authState = useAtomValue(() => authStateAtom);
  const cookie = useAtomValue(() => cookieAtom);

  return (
    <Switch>
      <Match when={authState() === "authenticated"}>
        <SecretsPage palette={palette()} themeMode={themeMode()} />
      </Match>

      <Match when={authState() === "checking"}>
        <AuthChecking
          cookie={cookie()}
          fg={palette().fg}
          muted={palette().muted}
        />
      </Match>

      <Match when={true}>
        <AuthGate palette={palette()} />
      </Match>
    </Switch>
  );
}
