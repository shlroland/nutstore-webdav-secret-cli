import type { ThemeMode } from "@opentui/core";

const DANGER_FG = "#dc2626";
const NUTSTORE_LOGO_COLORS = [
  "#D89F44",
  "#C78A3D",
  "#B67535",
  "#9E5726",
  "#965B25",
  "#854A21",
  "#713F1D",
  "#623718",
];

export type Palette = {
  fg: string;
  muted: string;
  border: string;
  brandLogo: string[];
  cursor: string;
  selectedFg: string;
  selectedBg: string;
  danger: string;
};

const lightPalette: Palette = {
  fg: "#111827",
  muted: "#4b5563",
  border: "#6b7280",
  brandLogo: NUTSTORE_LOGO_COLORS,
  cursor: "#111827",
  selectedFg: "#ffffff",
  selectedBg: "#111827",
  danger: DANGER_FG,
};

const darkPalette: Palette = {
  fg: "#f9fafb",
  muted: "#9ca3af",
  border: "#9ca3af",
  brandLogo: NUTSTORE_LOGO_COLORS,
  cursor: "#f9fafb",
  selectedFg: "#111827",
  selectedBg: "#f9fafb",
  danger: "#f87171",
};

export const getPalette = (mode: ThemeMode | null): Palette =>
  mode === "dark" ? darkPalette : lightPalette;
