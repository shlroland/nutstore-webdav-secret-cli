import { useAtomRefresh, useAtomSet, useAtomValue } from "@effect/atom-solid";
import type { ThemeMode } from "@opentui/core";
import { useKeyboard, useRenderer } from "@opentui/solid";
import { createMemo, createSignal } from "solid-js";
import { addSecretAtom, secretsListAtom, secretsLoadStateAtom, secretsPageInfoAtom, secretsStatusMessageAtom } from "../atom/secrets";
import { WEBDAV_URL } from "../constants";
import type { OpenTUIElement } from "../opentui-jsx";
import type { Palette } from "../theme";
import { clamp, copyToClipboard } from "../utils";
import { Footer } from "./footer";
import { Header } from "./header";
import { SecretDetail } from "./secret-detail";
import { SecretList } from "./secret-list";

type SecretsPageProps = {
  palette: Palette;
  themeMode: ThemeMode | null;
};

export function SecretsPage(props: SecretsPageProps): OpenTUIElement {
  const renderer = useRenderer();
  const items = useAtomValue(() => secretsListAtom);
  const secretsLoadState = useAtomValue(() => secretsLoadStateAtom);
  const remoteStatusMessage = useAtomValue(() => secretsStatusMessageAtom);
  const refreshSecrets = useAtomRefresh(() => secretsPageInfoAtom);
  const createSecret = useAtomSet(() => addSecretAtom, { mode: "promise" });
  const [addSecretMode, setAddSecretMode] = createSignal(false);
  const [addSecretName, setAddSecretName] = createSignal("");
  const [addSecretError, setAddSecretError] = createSignal<string | null>(null);
  const [addingSecret, setAddingSecret] = createSignal(false);
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [statusMessage, setStatusMessage] = createSignal("");
  const [confirmingDelete, setConfirmingDelete] = createSignal(false);

  const selectedItem = createMemo(() => items()[selectedIndex()] ?? null);
  const headerStatus = createMemo(() =>
    statusMessage().length > 0 ? statusMessage() : remoteStatusMessage(),
  );

  const moveSelection = (direction: number) => {
    if (addSecretMode()) {
      return;
    }
    setConfirmingDelete(false);
    setSelectedIndex((current) =>
      clamp(current + direction, 0, Math.max(0, items().length - 1)),
    );
  };

  const refresh = () => {
    setAddSecretMode(false);
    setAddSecretError(null);
    setConfirmingDelete(false);
    setSelectedIndex(0);
    setStatusMessage("");
    refreshSecrets();
  };

  const copyValue = async (label: string, value: string) => {
    const copied = await copyToClipboard(value);
    setStatusMessage(copied ? `${label} copied` : `${label} ready to copy`);
  };

  const deleteSelected = () => {
    if (addSecretMode()) {
      return;
    }
    const item = selectedItem();
    if (!item) {
      return;
    }

    if (!confirmingDelete()) {
      setConfirmingDelete(true);
      setStatusMessage(`Confirm delete: ${item.name}`);
      return;
    }

    setConfirmingDelete(false);
    setStatusMessage(`Delete is not wired yet for ${item.name}`);
  };

  const openAddSecret = () => {
    setConfirmingDelete(false);
    setAddSecretError(null);
    setAddSecretName("");
    setAddSecretMode(true);
  };

  const cancelAddSecret = () => {
    setAddSecretMode(false);
    setAddSecretError(null);
    setAddingSecret(false);
  };

  const submitAddSecret = async () => {
    setAddingSecret(true);
    setAddSecretError(null);

    try {
      const created = await createSecret(addSecretName());
      setAddSecretMode(false);
      setAddSecretName("");
      setStatusMessage(`Created ${created.name}`);
      refreshSecrets();
    } catch (cause) {
      setAddSecretError(
        cause instanceof Error ? cause.message : "Failed to create app password.",
      );
    } finally {
      setAddingSecret(false);
    }
  };

  useKeyboard((key) => {
    const name = key.name.toLowerCase();

    if (name === "q") {
      renderer.destroy();
      return;
    }

    if (addSecretMode()) {
      if (name === "escape") {
        cancelAddSecret();
        key.preventDefault();
      }

      return;
    }

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
      if (addSecretMode()) {
        cancelAddSecret();
        key.preventDefault();
        return;
      }

      setConfirmingDelete(false);
      setStatusMessage("Delete cancelled");
      key.preventDefault();
      return;
    }

    if (name === "r") {
      refresh();
      return;
    }

    if (name === "n") {
      openAddSecret();
      key.preventDefault();
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
    if (!item || secretsLoadState() !== "ready") {
      return;
    }

    if (name === "enter") {
      void copyValue("Password", item.password);
      return;
    }

    if (name === "u") {
      void copyValue("WebDAV URL", WEBDAV_URL);
      return;
    }

    if (name === "a") {
      if (!item.account) {
        setStatusMessage("Account unavailable");
        return;
      }

      void copyValue("Account", item.account);
    }
  });

  return (
    <box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1} gap={1}>
      <Header
        count={items().length}
        palette={props.palette}
        status={headerStatus()}
        themeMode={props.themeMode}
      />

      <box flexDirection="row" flexGrow={1} gap={1} minHeight={14}>
        <SecretList
          palette={props.palette}
          selectedIndex={selectedIndex()}
        />
        <SecretDetail
          addError={addSecretError()}
          addName={addSecretName()}
          addSecretMode={addSecretMode()}
          addingSecret={addingSecret()}
          confirmingDelete={confirmingDelete()}
          item={selectedItem()}
          onAddNameInput={setAddSecretName}
          onAddSubmit={() => {
            void submitAddSecret();
          }}
          palette={props.palette}
        />
      </box>

      <Footer palette={props.palette} />
    </box>
  );
}
