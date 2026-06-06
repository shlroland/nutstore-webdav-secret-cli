import { CliRenderEvents, TextAttributes, type ThemeMode } from "@opentui/core";
import { render, useKeyboard, useRenderer } from "@opentui/solid";
import { createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js";

type SecretItem = {
  id: string;
  name: string;
  password: string;
  createdAt: string;
  lastUsedAt: string;
  note: string;
};

const WEBDAV_URL = "https://dav.jianguoyun.com/dav/";
const ACCOUNT = "user@example.com";
const DANGER_FG = "#dc2626";

type Palette = {
  fg: string;
  muted: string;
  border: string;
  selectedFg: string;
  selectedBg: string;
  danger: string;
};

const lightPalette: Palette = {
  fg: "#111827",
  muted: "#4b5563",
  border: "#6b7280",
  selectedFg: "#ffffff",
  selectedBg: "#111827",
  danger: DANGER_FG,
};

const darkPalette: Palette = {
  fg: "#f9fafb",
  muted: "#9ca3af",
  border: "#9ca3af",
  selectedFg: "#111827",
  selectedBg: "#f9fafb",
  danger: "#f87171",
};

const getPalette = (mode: ThemeMode | null): Palette =>
  mode === "dark" ? darkPalette : lightPalette;

const initialSecrets: SecretItem[] = [
  {
    id: "sec_raycast",
    name: "Raycast",
    password: "nsc_app_9vK3pQ7Lm2Xz",
    createdAt: "2026-05-28",
    lastUsedAt: "2026-06-06",
    note: "macOS launcher sync",
  },
  {
    id: "sec_obsidian",
    name: "Obsidian Sync Backup",
    password: "nsc_app_B8mN4tYw6QaR",
    createdAt: "2026-04-12",
    lastUsedAt: "2026-06-01",
    note: "Notes attachment backup",
  },
  {
    id: "sec_alfred",
    name: "Alfred Workflow",
    password: "nsc_app_U2hK7dPq5VzE",
    createdAt: "2026-03-09",
    lastUsedAt: "2026-05-30",
    note: "Quick upload script",
  },
  {
    id: "sec_backup",
    name: "Server Backup",
    password: "nsc_app_H4xT8rLm1CyN",
    createdAt: "2026-01-21",
    lastUsedAt: "2026-06-05",
    note: "Scheduled archive job",
  },
  {
    id: "sec_mobile",
    name: "Mobile WebDAV",
    password: "nsc_app_M6qP2zLf8TaK",
    createdAt: "2025-12-18",
    lastUsedAt: "2026-05-18",
    note: "Phone file manager",
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

const truncate = (value: string, maxLength: number) => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 3))}...`;
};

const maskPassword = (password: string) => `********${password.slice(-3)}`;

const copyToClipboard = async (value: string) => {
  if (typeof Bun === "undefined") {
    return false;
  }

  const process = Bun.spawn(["pbcopy"], {
    stdin: "pipe",
    stdout: "ignore",
    stderr: "ignore",
  });

  process.stdin.write(value);
  process.stdin.end();

  const exitCode = await process.exited;
  return exitCode === 0;
};

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
    setSelectedIndex((current) => clamp(current, 0, Math.max(0, nextItems.length - 1)));
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

function Header(props: {
  count: number;
  palette: Palette;
  status: string;
  themeMode: ThemeMode | null;
}) {
  return (
    <box height={4} flexDirection="row" alignItems="center" gap={2}>
      <box width={28} alignItems="center" justifyContent="center">
        <ascii_font color={props.palette.fg} font="tiny" text="Nutstore" />
      </box>
      <box flexDirection="column" flexGrow={1} justifyContent="center">
        <text attributes={TextAttributes.BOLD} fg={props.palette.fg}>
          WebDAV App Passwords
        </text>
        <text fg={props.palette.muted}>
          {props.count} secrets | {props.themeMode ?? "light"} | {props.status}
        </text>
      </box>
    </box>
  );
}

function SecretList(props: {
  items: SecretItem[];
  palette: Palette;
  selectedIndex: number;
}) {
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

function SecretDetail(props: {
  confirmingDelete: boolean;
  item: SecretItem | null;
  palette: Palette;
}) {
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
}) {
  return (
    <box flexDirection="column" gap={1}>
      <text attributes={TextAttributes.BOLD} fg={props.palette.fg}>
        {props.item.name}
      </text>

      <box flexDirection="column">
        <DetailRow
          label="WebDAV"
          maxLength={27}
          palette={props.palette}
          value={WEBDAV_URL}
        />
        <DetailRow label="Account" palette={props.palette} value={ACCOUNT} />
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
        <DetailRow
          label="Used"
          palette={props.palette}
          value={props.item.lastUsedAt}
        />
        <DetailRow label="Note" palette={props.palette} value={props.item.note} />
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
}) {
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

function Footer(props: { palette: Palette }) {
  return (
    <box height={1} flexDirection="row">
      <text fg={props.palette.muted}>
        Up/Down select   Enter copy password   U copy URL   D delete   R refresh   Q quit
      </text>
    </box>
  );
}

render(() => <App />);
