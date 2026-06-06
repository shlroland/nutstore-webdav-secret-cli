import { CliRenderEvents, type ThemeMode } from "@opentui/core";
import { render, useKeyboard, useRenderer } from "@opentui/solid";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { SecretDetail } from "./components/SecretDetail";
import { SecretList } from "./components/SecretList";
import { initialSecrets, WEBDAV_URL } from "./mockSecrets";
import { getPalette } from "./theme";
import { clamp, copyToClipboard } from "./utils";

function App() {
  const renderer = useRenderer();
  const [items, setItems] = createSignal(initialSecrets);
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [statusMessage, setStatusMessage] = createSignal("Mock data ready");
  const [confirmingDelete, setConfirmingDelete] = createSignal(false);
  const [themeMode, setThemeMode] = createSignal<ThemeMode | null>(
    renderer.themeMode,
  );

  const selectedItem = createMemo(() => items()[selectedIndex()] ?? null);
  const palette = createMemo(() => getPalette(themeMode()));

  onMount(() => {
    const updateThemeMode = (mode: ThemeMode) => setThemeMode(mode);
    renderer.on(CliRenderEvents.THEME_MODE, updateThemeMode);
    void renderer.waitForThemeMode(500).then((mode) => {
      if (mode) {
        setThemeMode(mode);
      }
    });

    onCleanup(() => {
      renderer.off(CliRenderEvents.THEME_MODE, updateThemeMode);
    });
  });

  const moveSelection = (direction: number) => {
    setConfirmingDelete(false);
    setSelectedIndex((current) =>
      clamp(current + direction, 0, Math.max(0, items().length - 1)),
    );
  };

  const refresh = () => {
    setConfirmingDelete(false);
    setItems(initialSecrets);
    setSelectedIndex(0);
    setStatusMessage(`Refreshed ${initialSecrets.length} mock secrets`);
  };

  const copyValue = async (label: string, value: string) => {
    const copied = await copyToClipboard(value);
    setStatusMessage(copied ? `${label} copied` : `${label} ready to copy`);
  };

  const deleteSelected = () => {
    const item = selectedItem();
    if (!item) {
      return;
    }

    if (!confirmingDelete()) {
      setConfirmingDelete(true);
      setStatusMessage(`Confirm delete: ${item.name}`);
      return;
    }

    const nextItems = items().filter((secret) => secret.id !== item.id);
    setItems(nextItems);
    setSelectedIndex((current) =>
      clamp(current, 0, Math.max(0, nextItems.length - 1)),
    );
    setConfirmingDelete(false);
    setStatusMessage(`Deleted ${item.name}`);
  };

  useKeyboard((key) => {
    const name = key.name.toLowerCase();

    if (name === "up") {
      moveSelection(-1);
      key.preventDefault();
      return;
    }

    if (name === "down") {
      moveSelection(1);
      key.preventDefault();
      return;
    }

    if (name === "escape") {
      setConfirmingDelete(false);
      setStatusMessage("Delete cancelled");
      key.preventDefault();
      return;
    }

    if (name === "q") {
      renderer.destroy();
      return;
    }

    if (name === "r") {
      refresh();
      return;
    }

    if (name === "d") {
      deleteSelected();
      return;
    }

    if (name === "y" && confirmingDelete()) {
      deleteSelected();
      return;
    }

    const item = selectedItem();
    if (!item) {
      return;
    }

    if (name === "enter") {
      void copyValue("Password", item.password);
      return;
    }

    if (name === "u") {
      void copyValue("WebDAV URL", WEBDAV_URL);
    }
  });

  return (
    <box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1} gap={1}>
      <Header
        count={items().length}
        palette={palette()}
        status={statusMessage()}
        themeMode={themeMode()}
      />

      <box flexDirection="row" flexGrow={1} gap={1} minHeight={14}>
        <SecretList
          items={items()}
          palette={palette()}
          selectedIndex={selectedIndex()}
        />
        <SecretDetail
          confirmingDelete={confirmingDelete()}
          item={selectedItem()}
          palette={palette()}
        />
      </box>

      <Footer palette={palette()} />
    </box>
  );
}

render(() => <App />);
