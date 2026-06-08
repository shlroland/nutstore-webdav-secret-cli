import { useAtomSet } from "@effect/atom-solid";
import { TextAttributes } from "@opentui/core";
import { useKeyboard, useRenderer } from "@opentui/solid";
import { Match, Show, Switch, createSignal } from "solid-js";
import { saveCookieAtom } from "../atom/auth";
import type { OpenTUIElement } from "../opentui-jsx";
import type { Palette } from "../theme";
import { NutstoreLogo } from "./nutstore-logo";

export type AuthView = "choice" | "manual" | "validating";

type AuthGateProps = {
  palette: Palette;
};

export function AuthGate(props: AuthGateProps): OpenTUIElement {
  const renderer = useRenderer();
  const saveCookie = useAtomSet(() => saveCookieAtom, { mode: "promise" });
  const [view, setView] = createSignal<AuthView>("choice");
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

  const selectManualInput = () => {
    setView("manual");
    setError(null);
  };

  const submitChoice = () => {
    selectManualInput();
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

    if (view() === "choice" && name === "m") {
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
          Enter continue   M manual input   Q quit
        </text>
      </box>
    </box>
  );
}

type AuthBodyProps = {
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
      <Match when={props.view === "validating"}>
        <box flexDirection="column" gap={1}>
          <text attributes={TextAttributes.BOLD} fg={props.palette.fg}>
            Validating cookie...
          </text>
          <text fg={props.palette.muted}>
            Saving cookie and validating local session state.
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
            Manual input is the only available authentication method right now.
          </text>
          <text fg={props.palette.fg}>
            Press Enter to paste a Cookie header manually.
          </text>
          <text fg={props.palette.muted}>
            Automatic browser cookie detection is hidden until the experimental flow is ready.
          </text>

          <AuthError error={props.error} palette={props.palette} />
        </box>
      </Match>
    </Switch>
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
