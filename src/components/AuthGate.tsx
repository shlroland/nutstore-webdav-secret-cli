import { TextAttributes } from "@opentui/core";
import { useKeyboard, useRenderer } from "@opentui/solid";
import { createSignal, onMount } from "solid-js";
import {
  mockAutoDetectCookie,
  mockStoredCookie,
  mockValidateCookie,
} from "../authMock";
import type { Palette } from "../theme";

export type AuthView = "checking" | "choice" | "auto" | "manual" | "validating";

type AuthGateProps = {
  onAuthenticated: () => void;
  palette: Palette;
};

export function AuthGate(props: AuthGateProps) {
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

    const valid = await mockValidateCookie(cookie);
    if (!valid) {
      setView("manual");
      setError("Cookie is empty. Paste a Cookie header to continue.");
      return;
    }

    props.onAuthenticated();
  };

  const checkStoredCookie = async () => {
    setView("checking");
    const cookie = await mockStoredCookie();

    if (!cookie) {
      setView("choice");
      return;
    }

    await authenticateCookie(cookie);
  };

  const autoDetectCookie = async () => {
    setView("auto");
    setError(null);
    const cookie = await mockAutoDetectCookie();
    setCookieInput(cookie);
    await authenticateCookie(cookie);
  };

  const selectManualInput = () => {
    setView("manual");
    setError(null);
  };

  const submitChoice = () => {
    if (choiceIndex() === 0) {
      void autoDetectCookie();
      return;
    }

    selectManualInput();
  };

  const submitManualCookie = () => {
    void authenticateCookie(cookieInput());
  };

  useKeyboard((key) => {
    const name = key.name.toLowerCase();

    if (name === "q") {
      renderer.destroy();
      return;
    }

    if (view() === "choice" && name === "a") {
      setChoiceIndex(0);
      void autoDetectCookie();
      return;
    }

    if (view() === "choice" && name === "m") {
      setChoiceIndex(1);
      selectManualInput();
      return;
    }

    if (view() === "choice" && name === "enter") {
      submitChoice();
      return;
    }

    if (view() === "manual" && name === "enter") {
      submitManualCookie();
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
          onChoiceChange={setChoiceIndex}
          onChoiceSubmit={submitChoice}
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
  onChoiceChange: (index: number) => void;
  onChoiceSubmit: () => void;
  onCookieInput: (value: string) => void;
  onManualSubmit: () => void;
  palette: Palette;
  view: AuthView;
};

function AuthBody(props: AuthBodyProps) {
  if (props.view === "checking") {
    return (
      <box flexDirection="column" gap={1}>
        <text attributes={TextAttributes.BOLD} fg={props.palette.fg}>
          Checking stored cookie...
        </text>
        <text fg={props.palette.muted}>
          Mock mode: no stored cookie will be found.
        </text>
      </box>
    );
  }

  if (props.view === "auto") {
    return (
      <box flexDirection="column" gap={1}>
        <text attributes={TextAttributes.BOLD} fg={props.palette.fg}>
          Auto detecting browser cookie...
        </text>
        <text fg={props.palette.muted}>
          Mock mode: this simulates reading a local browser session.
        </text>
      </box>
    );
  }

  if (props.view === "validating") {
    return (
      <box flexDirection="column" gap={1}>
        <text attributes={TextAttributes.BOLD} fg={props.palette.fg}>
          Validating cookie...
        </text>
        <text fg={props.palette.muted}>
          Mock mode: any non-empty cookie is accepted.
        </text>
      </box>
    );
  }

  if (props.view === "manual") {
    return (
      <box flexDirection="column" gap={1}>
        <text attributes={TextAttributes.BOLD} fg={props.palette.fg}>
          Paste Nutstore Cookie
        </text>
        <text fg={props.palette.muted}>
          Paste the full Cookie header, then press Enter.
        </text>
        <input
          focused
          onInput={props.onCookieInput}
          onSubmit={props.onManualSubmit}
          placeholder="nutstore_cookie=...; session=..."
          textColor={props.palette.fg}
          value={props.cookieInput}
        />
        <AuthError error={props.error} palette={props.palette} />
      </box>
    );
  }

  return (
    <box flexDirection="column" gap={1}>
      <text attributes={TextAttributes.BOLD} fg={props.palette.fg}>
        No stored cookie found
      </text>
      <text fg={props.palette.muted}>
        Choose how to provide a Nutstore browser cookie.
      </text>

      <select
        descriptionColor={props.palette.muted}
        focused
        focusedTextColor={props.palette.fg}
        height={5}
        onChange={props.onChoiceChange}
        onSelect={props.onChoiceSubmit}
        options={[
          {
            name: "Auto detect",
            description: "Mock browser cookie discovery, then continue",
            value: "auto",
          },
          {
            name: "Manual input",
            description: "Paste a Cookie header yourself",
            value: "manual",
          },
        ]}
        selectedBackgroundColor={props.palette.selectedBg}
        selectedDescriptionColor={props.palette.selectedFg}
        selectedIndex={props.choiceIndex}
        selectedTextColor={props.palette.selectedFg}
        textColor={props.palette.fg}
        width={56}
        wrapSelection
      />

      <box flexDirection="column" marginTop={1}>
        <text fg={props.palette.muted}>
          Auto detect will be wired to browser cookie discovery later.
        </text>
        <text fg={props.palette.muted}>
          Manual input accepts a pasted Cookie header.
        </text>
      </box>

      <AuthError error={props.error} palette={props.palette} />
    </box>
  );
}

function AuthError(props: { error: string | null; palette: Palette }) {
  if (!props.error) {
    return null;
  }

  return <text fg={props.palette.danger}>{props.error}</text>;
}
