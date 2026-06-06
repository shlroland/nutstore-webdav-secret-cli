import type { ThemeMode } from "@opentui/core";
import { useKeyboard, useRenderer } from "@opentui/solid";
import { createMemo, createSignal } from "solid-js";
import { initialSecrets, WEBDAV_URL } from "../mockSecrets";
import type { Palette } from "../theme";
import { clamp, copyToClipboard } from "../utils";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { SecretDetail } from "./SecretDetail";
import { SecretList } from "./SecretList";

type SecretsPageProps = {
  palette: Palette;
  themeMode: ThemeMode | null;
};

export function SecretsPage(props: SecretsPageProps) {
  const renderer = useRenderer();
  const [items, setItems] = createSignal(initialSecrets);
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [statusMessage, setStatusMessage] = createSignal(
    "Authenticated with mock cookie",
  );
  const [confirmingDelete, setConfirmingDelete] = createSignal(false);

  const selectedItem = createMemo(() => items()[selectedIndex()] ?? null);

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
        palette={props.palette}
        status={statusMessage()}
        themeMode={props.themeMode}
      />

      <box flexDirection="row" flexGrow={1} gap={1} minHeight={14}>
        <SecretList
          items={items()}
          palette={props.palette}
          selectedIndex={selectedIndex()}
        />
        <SecretDetail
          confirmingDelete={confirmingDelete()}
          item={selectedItem()}
          palette={props.palette}
        />
      </box>

      <Footer palette={props.palette} />
    </box>
  );
}
