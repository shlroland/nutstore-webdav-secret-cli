import { CliRenderEvents, type ThemeMode } from "@opentui/core";
import { useRenderer } from "@opentui/solid";
import { createSignal, onCleanup, onMount } from "solid-js";

export function useThemeMode() {
  const renderer = useRenderer();
  const [themeMode, setThemeMode] = createSignal<ThemeMode | null>(
    renderer.themeMode,
  );

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

  return themeMode;
}
