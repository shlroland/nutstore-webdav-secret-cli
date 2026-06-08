import { useAtomSet } from "@effect/atom-solid";
import { TextAttributes } from "@opentui/core";
import { useKeyboard, useRenderer } from "@opentui/solid";
import { For, Match, Show, Switch, createSignal } from "solid-js";
import { saveCookieAtom } from "../atom/auth";
import { mockAutoDetectCookie } from "../authMock";
import type { OpenTUIElement } from "../opentui-jsx";
import type { Palette } from "../theme";
import { NutstoreLogo } from "./NutstoreLogo";

export type AuthView = "choice" | "auto" | "manual" | "validating";

type AuthGateProps = {
  palette: Palette;
};

export function AuthGate(props: AuthGateProps): OpenTUIElement {
  const renderer = useRenderer();
  const saveCookie = useAtomSet(() => saveCookieAtom, { mode: "promise" });
  const [view, setView] = createSignal<AuthView>("choice");
  const [choiceIndex, setChoiceIndex] = createSignal(0);
  const [cookieInput, setCookieInput] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);

  const persistCookie = async (cookie: string) => {
    setView("validating");
    setError(null);

    try {
      await saveCookie(cookie);
    } catch (cause) {
      setView("manual");
      setError(cause instanceof Error ? cause.message : "Cookie validation failed. Paste a Cookie header to continue.");
    }
  };

  const autoDetectCookie = async () => {
    setView("auto");
    setError(null);

    try {
      const cookie = await mockAutoDetectCookie();
      setCookieInput(cookie);
      await persistCookie(cookie);
    } catch {
      setView("choice");
      setError("Auto detect failed. Choose another method.");
    }
  };

  const selectManualInput = () => {
    setView("manual");
    setError(null);
  };

  const submitChoiceAt = (index: number) => {
    setChoiceIndex(index);

    if (index === 0) {
      void autoDetectCookie();
      return;
    }

    selectManualInput();
  };

  const submitChoice = () => {
    submitChoiceAt(choiceIndex());
  };

  const moveChoice = (direction: number) => {
    setChoiceIndex((current) => {
      const next = current + direction;
      if (next < 0) {
        return 1;
      }

      if (next > 1) {
        return 0;
      }

      return next;
    });
  };

  const submitManualCookie = () => {
    void persistCookie(cookieInput());
  };

  const isSubmitKey = (name: string) => name === "enter" || name === "return";

  useKeyboard((key) => {
    const name = key.name.toLowerCase();

    if (name === "q") {
      renderer.destroy();
      return;
    }

    if (view() === "choice" && (name === "up" || name === "k")) {
      moveChoice(-1);
      key.preventDefault();
      return;
    }

    if (view() === "choice" && (name === "down" || name === "j")) {
      moveChoice(1);
      key.preventDefault();
      return;
    }

    if (view() === "choice" && name === "a") {
      setChoiceIndex(0);
      void autoDetectCookie();
      key.preventDefault();
      return;
    }

    if (view() === "choice" && name === "m") {
      setChoiceIndex(1);
      selectManualInput();
      key.preventDefault();
      return;
    }

    if (view() === "choice" && isSubmitKey(name)) {
      submitChoice();
      key.preventDefault();
      return;
    }

    if (view() === "manual" && isSubmitKey(name)) {
      submitManualCookie();
      key.preventDefault();
    }
  });

  return (
    <box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1} gap={1}>
      <box height={7} flexDirection="row" alignItems="center">
        <box
          width={40}
          marginRight={2}
          alignItems="center"
          justifyContent="center"
        >
          <NutstoreLogo palette={props.palette} />
        </box>
        <box flexDirection="column" flexGrow={1} justifyContent="center">
          <text attributes={TextAttributes.BOLD} fg={props.palette.fg}>
            WebDAV Cookie Setup
          </text>
          <text fg={props.palette.muted} truncate>
            Prepare access before loading app passwords
          </text>
        </box>
      </box>

      <box
        border
        borderColor={props.palette.border}
        flexDirection="column"
        flexGrow={1}
        justifyContent="center"
        paddingX={3}
        paddingY={1}
        title="Authentication"
      >
        <AuthBody
          choiceIndex={choiceIndex()}
          cookieInput={cookieInput()}
          error={error()}
          onCookieInput={setCookieInput}
          onManualSubmit={submitManualCookie}
          palette={props.palette}
          view={view()}
        />
      </box>

      <box height={1}>
        <text fg={props.palette.muted}>
          Up/Down choose   Enter select   A auto detect   M manual input   Q quit
        </text>
      </box>
    </box>
  );
}

type AuthBodyProps = {
  choiceIndex: number;
  cookieInput: string;
  error: string | null;
  onCookieInput: (value: string) => void;
  onManualSubmit: () => void;
  palette: Palette;
  view: AuthView;
};

function AuthBody(props: AuthBodyProps): OpenTUIElement {
  return (
    <Switch>
      <Match when={props.view === "auto"}>
        <box flexDirection="column" gap={1}>
          <text attributes={TextAttributes.BOLD} fg={props.palette.fg}>
            Auto detecting browser cookie...
          </text>
          <text fg={props.palette.muted}>
            Mock mode: this simulates reading a local browser session.
          </text>
        </box>
      </Match>

      <Match when={props.view === "validating"}>
        <box flexDirection="column" gap={1}>
          <text attributes={TextAttributes.BOLD} fg={props.palette.fg}>
            Validating cookie...
          </text>
          <text fg={props.palette.muted}>
            Mock mode: any non-empty cookie is accepted.
          </text>
        </box>
      </Match>

      <Match when={props.view === "manual"}>
        <box flexDirection="column" gap={1}>
          <text attributes={TextAttributes.BOLD} fg={props.palette.fg}>
            Paste Nutstore Cookie
          </text>
          <text fg={props.palette.muted}>
            Paste the full Cookie header, then press Enter.
          </text>
          <input
            cursorColor={props.palette.cursor}
            focused
            focusedTextColor={props.palette.fg}
            onInput={props.onCookieInput}
            onSubmit={props.onManualSubmit}
            placeholder="nutstore_cookie=...; session=..."
            placeholderColor={props.palette.muted}
            textColor={props.palette.fg}
            value={props.cookieInput}
          />
          <AuthError error={props.error} palette={props.palette} />
        </box>
      </Match>

      <Match when={props.view === "choice"}>
        <box flexDirection="column" gap={1}>
          <text attributes={TextAttributes.BOLD} fg={props.palette.fg}>
            No stored cookie found
          </text>
          <text fg={props.palette.muted}>
            Choose how to provide a Nutstore browser cookie.
          </text>

          <AuthChoiceList
            choiceIndex={props.choiceIndex}
            palette={props.palette}
          />

          <AuthError error={props.error} palette={props.palette} />
        </box>
      </Match>
    </Switch>
  );
}

const AUTH_CHOICES = [
  {
    name: "Auto detect",
    description: "Mock browser cookie discovery, then continue",
  },
  {
    name: "Manual input",
    description: "Paste a Cookie header yourself",
  },
];

function AuthChoiceList(props: {
  choiceIndex: number;
  palette: Palette;
}): OpenTUIElement {
  return (
    <box flexDirection="column" height={5} width={56}>
      <For each={AUTH_CHOICES}>
        {(choice, index) => {
          const selected = () => props.choiceIndex === index();
          const bg = () =>
            selected() ? props.palette.selectedBg : "transparent";
          const fg = () =>
            selected() ? props.palette.selectedFg : props.palette.fg;
          const mutedFg = () =>
            selected() ? props.palette.selectedFg : props.palette.muted;

          return (
            <box flexDirection="column">
              <text bg={bg()} fg={fg()}>
                {selected() ? ">" : " "} {choice.name}
              </text>
              <text bg={bg()} fg={mutedFg()} truncate>
                {"  "}
                {choice.description}
              </text>
            </box>
          );
        }}
      </For>
    </box>
  );
}

function AuthError(props: {
  error: string | null;
  palette: Palette;
}): OpenTUIElement {
  return (
    <Show when={props.error}>
      <text fg={props.palette.danger}>
        {props.error}
      </text>
    </Show>
  );
}
