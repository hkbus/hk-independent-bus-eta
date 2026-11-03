import type { PaletteMode, ThemeOptions } from "@mui/material";

/**
 * Colour slots exposed to users for customisation. Each slot maps onto the
 * MUI palette so every component that already reads from the theme picks up
 * the change automatically.
 */
export interface ThemeColors {
  /** app background (palette.background.default) */
  background: string;
  /** main accent for text / icons / selected items (palette.primary.main) */
  primary: string;
  /** highlighted ETA text (palette.warning.main) */
  eta: string;
  /** secondary accent (palette.secondary.main) */
  secondary: string;
}

export type ThemeColorKey = keyof ThemeColors;

export const THEME_COLOR_KEYS: ThemeColorKey[] = [
  "background",
  "primary",
  "eta",
  "secondary",
];

/** translation keys for each colour slot */
export const THEME_COLOR_LABELS: Record<ThemeColorKey, string> = {
  background: "背景顏色",
  primary: "主要顏色",
  eta: "到站時間顏色",
  secondary: "次要顏色",
};

export interface ModeThemeColors {
  light: ThemeColors;
  dark: ThemeColors;
}

export interface ThemePreset {
  id: string;
  /** translation key */
  name: string;
  colors: ModeThemeColors;
}

export const CUSTOM_THEME_ID = "custom";
export const DEFAULT_THEME_ID = "classic";

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "classic",
    name: "經典",
    colors: {
      light: {
        background: "#fedb00",
        primary: "#444444",
        // deepened from #3285e3 so the highlighted ETA text meets WCAG AA
        eta: "#1b6bc5",
        secondary: "#000000",
      },
      dark: {
        background: "#000000",
        primary: "#fedb00",
        eta: "#fedb00",
        secondary: "#fedb00",
      },
    },
  },
  {
    id: "ocean",
    name: "海洋",
    colors: {
      light: {
        background: "#90caf9",
        primary: "#0d47a1",
        eta: "#c2185b",
        secondary: "#0d47a1",
      },
      dark: {
        background: "#0a1929",
        primary: "#90caf9",
        eta: "#90caf9",
        secondary: "#90caf9",
      },
    },
  },
  {
    id: "forest",
    name: "森林",
    colors: {
      light: {
        background: "#a5d6a7",
        primary: "#1b5e20",
        eta: "#1565c0",
        secondary: "#1b5e20",
      },
      dark: {
        background: "#0b1f0e",
        primary: "#81c784",
        eta: "#a5d6a7",
        secondary: "#81c784",
      },
    },
  },
  {
    id: "sakura",
    name: "櫻花",
    colors: {
      light: {
        background: "#f8bbd0",
        primary: "#880e4f",
        eta: "#1b6bc5",
        secondary: "#880e4f",
      },
      dark: {
        background: "#1a0a12",
        primary: "#f48fb1",
        eta: "#f48fb1",
        secondary: "#f48fb1",
      },
    },
  },
  {
    id: "mono",
    name: "黑白",
    colors: {
      light: {
        background: "#eeeeee",
        primary: "#212121",
        eta: "#1b6bc5",
        secondary: "#000000",
      },
      dark: {
        background: "#121212",
        primary: "#e0e0e0",
        eta: "#ffffff",
        secondary: "#e0e0e0",
      },
    },
  },
];

export const DEFAULT_THEME_COLORS: ModeThemeColors = THEME_PRESETS[0].colors;

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export const isHexColor = (input: unknown): input is string =>
  typeof input === "string" && HEX_COLOR_RE.test(input);

const isThemeColors = (input: unknown): input is ThemeColors =>
  input instanceof Object &&
  THEME_COLOR_KEYS.every((key) =>
    isHexColor((input as Record<string, unknown>)[key])
  );

export const isModeThemeColors = (input: unknown): input is ModeThemeColors =>
  input instanceof Object &&
  isThemeColors((input as Record<string, unknown>).light) &&
  isThemeColors((input as Record<string, unknown>).dark);

export const isThemeId = (input: unknown): input is string =>
  input === CUSTOM_THEME_ID ||
  THEME_PRESETS.some((preset) => preset.id === input);

export const getPreset = (themeId: string): ThemePreset =>
  THEME_PRESETS.find((preset) => preset.id === themeId) ?? THEME_PRESETS[0];

/**
 * Colours of the active theme. The custom theme falls back to the classic
 * palette until the user has set it up.
 */
export const resolveThemeColors = (
  themeId: string,
  customTheme: ModeThemeColors | null
): ModeThemeColors => {
  if (themeId === CUSTOM_THEME_ID) {
    return customTheme ?? DEFAULT_THEME_COLORS;
  }
  return getPreset(themeId).colors;
};

/**
 * Starting point for the colour editor: the saved custom colours, or a copy of
 * the theme in use so customising begins from what the user currently sees.
 * Always returns a fresh object so presets are never mutated.
 */
export const getEditableThemeColors = (
  themeId: string,
  customTheme: ModeThemeColors | null
): ModeThemeColors => {
  const colors = customTheme ?? resolveThemeColors(themeId, null);
  return { light: { ...colors.light }, dark: { ...colors.dark } };
};

declare module "@mui/material/styles" {
  interface TypeBackground {
    contrast: string;
  }
}

export const getThemeTokens = (
  mode: PaletteMode,
  fontSize: number,
  colors: ThemeColors,
  isClassic: boolean
): ThemeOptions =>
  ({
    typography: {
      fontFamily: "'Chiron Hei HK WS'",
      h6: {
        fontWeight: 700,
      },
      fontSize,
    },
    avatar: {
      default: {
        color: mode === "light" ? "#000" : "white",
      },
    },
    palette: {
      mode,
      background: {
        default: colors.background,
        contrast: "rgba(255, 255, 255, 0.12)",
      },
      primary: {
        main: colors.primary,
        // keep the long-standing look of the classic theme, let MUI compute a
        // readable contrast colour for every other theme
        ...(isClassic
          ? { contrastText: mode === "light" ? "rgba(0, 0, 0, 0.12)" : "#000" }
          : {}),
      },
      warning: {
        main: colors.eta,
      },
      secondary: {
        main: colors.secondary,
      },
    },
    elements: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontSize: "0.875rem",
            lineHeight: 1.43,
            scrollbarColor: "#3f3f3f",
            scrollbarWidth: "thin",
          },
        },
      },
    },
  }) as ThemeOptions;
