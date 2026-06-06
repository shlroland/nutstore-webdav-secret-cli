import { TextAttributes } from "@opentui/core";
import { useKeyboard, useRenderer } from "@opentui/solid";
import { For, Match, Switch, createSignal, onMount } from "solid-js";
import {
  mockAutoDetectCookie,
  mockStoredCookie,
  mockValidateCookie,
} from "../authMock";
import type { OpenTUIElement } from "../opentui-jsx";
import type { Palette } from "../theme";

export type AuthView = "checking" | "choice" | "auto" | "manual" | "validating";

type AuthGateProps = {
  onAuthenticated: () => void;
  palette: Palette;
};

export function AuthGate(props: AuthGateProps): OpenTUIElement {
  const renderer = useRenderer();
  const [view, setView] = createSignal<AuthView>("checking");
  const [choiceIndex, setChoiceIndex] = createSignal(0);
  const [cookieInput, setCookieInput] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);

  onMount(() => {
    void checkStoredCookie();
  });

  const authenticateCookie = async (cookie: string) => {
    setView("validating");
    setError(null);

    try {
      const valid = await mockValidateCookie(cookie);
      if (!valid) {
        setView("manual");
        setError("Cookie is empty. Paste a Cookie header to continue.");
        return;
      }

      props.onAuthenticated();
    } catch {
      setView("manual");
      setError("Cookie validation failed. Paste a Cookie header to continue.");
    }
  };

  const checkStoredCookie = async () => {
    setView("checking");
    setError(null);

    try {
      const cookie = await mockStoredCookie();
      if (!cookie) {
        setView("choice");
        return;
      }

      setCookieInput(cookie);
      await authenticateCookie(cookie);
    } catch {
      setView("choice");
      setError("Stored cookie check failed. Choose another method.");
    }
  };

  const autoDetectCookie = async () => {
    setView("auto");
    setError(null);

    try {
      const cookie = await mockAutoDetectCookie();
      setCookieInput(cookie);
      await authenticateCookie(cookie);
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
    void authenticateCookie(cookieInput());
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
      <box height={4} flexDirection="row" alignItems="center" gap={2}>
        <box width={28} alignItems="center" justifyContent="center">
          <ascii_font color={props.palette.fg} font="tiny" text="Nutstore" />
        </box>
        <box flexDirection="column" flexGrow={1} justifyContent="center">
          <text attributes={TextAttributes.BOLD} fg={props.palette.fg}>
            WebDAV Cookie Setup
          </text>
          <text fg={props.palette.muted}>
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
      <Match when={props.view === "checking"}>
        <box flexDirection="column" gap={1}>
          <text attributes={TextAttributes.BOLD} fg={props.palette.fg}>
            Checking stored cookie...
          </text>
          <text fg={props.palette.muted}>
            Mock mode: no stored cookie will be found.
          </text>
        </box>
      </Match>

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
                {selected() ? " > " : "   "}
                {choice.name.padEnd(52, " ")}
              </text>
              <text bg={bg()} fg={mutedFg()}>
                {"   "}
                {choice.description.padEnd(52, " ")}
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
  if (!props.error) {
    return null;
  }

  return <text fg={props.palette.danger}>{props.error}</text>;
}
