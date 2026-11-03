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
    id: "mtr",
    name: "港鐵",
    colors: {
      light: {
        background: "#f5f5f5",
        primary: "#b3130f",
        eta: "#1b5aa6",
        secondary: "#b3130f",
      },
      dark: {
        background: "#1a0a0a",
        primary: "#ff8a80",
        eta: "#ffffff",
        secondary: "#ff8a80",
      },
    },
  },
  {
    id: "tram",
    name: "電車",
    colors: {
      light: {
        background: "#f3ecc8",
        primary: "#00573f",
        eta: "#8a3b00",
        secondary: "#00573f",
      },
      dark: {
        background: "#0a1a14",
        primary: "#7fd1b0",
        eta: "#ffd54f",
        secondary: "#7fd1b0",
      },
    },
  },
  {
    id: "kcr",
    name: "九鐵",
    colors: {
      light: {
        background: "#fdd9a8",
        primary: "#7a3e00",
        eta: "#1565c0",
        secondary: "#7a3e00",
      },
      dark: {
        background: "#1a1208",
        primary: "#ffb74d",
        eta: "#5eb6e4",
        secondary: "#ffb74d",
      },
    },
  },
  {
    id: "starferry",
    name: "天星小輪",
    colors: {
      light: {
        background: "#e8f5ec",
        primary: "#006b3f",
        eta: "#b3261e",
        secondary: "#006b3f",
      },
      dark: {
        background: "#071a12",
        primary: "#81c9a3",
        eta: "#ffffff",
        secondary: "#81c9a3",
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
