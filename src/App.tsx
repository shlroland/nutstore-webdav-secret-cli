import { createMemo, createSignal, Show } from "solid-js";
import { AuthGate } from "./components/AuthGate";
import { SecretsPage } from "./components/SecretsPage";
import { useThemeMode } from "./hooks/useThemeMode";
import { getPalette } from "./theme";

export function App() {
  const themeMode = useThemeMode();
  const palette = createMemo(() => getPalette(themeMode()));
  const [authenticated, setAuthenticated] = createSignal(false);

  return (
    <Show
      when={authenticated()}
      fallback={
        <AuthGate
          onAuthenticated={() => setAuthenticated(true)}
          palette={palette()}
        />
      }
    >
      <SecretsPage palette={palette()} themeMode={themeMode()} />
    </Show>
  );
}
