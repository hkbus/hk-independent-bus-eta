import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  ButtonBase,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Switch,
  SxProps,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  Check as CheckIcon,
  FormatSize as FormatSizeIcon,
  Palette as PaletteIcon,
  RestartAlt as RestartAltIcon,
  WbTwilight as WbTwilightIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import FontSizeSlider from "./FontSizeSlider";
import AppContext from "../../context/AppContext";
import {
  CUSTOM_THEME_ID,
  THEME_COLOR_KEYS,
  THEME_COLOR_LABELS,
  THEME_PRESETS,
  ThemeColors,
  getEditableThemeColors,
} from "../../theme";
import { vibrate } from "../../utils";
import { ColorMode } from "../../data";

type Mode = "light" | "dark";

const AppearanceSettings = () => {
  const {
    themeId,
    customTheme,
    colorMode,
    _colorMode,
    updateColorMode,
    setThemeId,
    setCustomThemeColor,
    resetCustomTheme,
    vibrateDuration,
  } = useContext(AppContext);
  const { t } = useTranslation();
  // edit the palette of the mode currently shown by default
  const [editMode, setEditMode] = useState<Mode>(colorMode);

  const customColors = useMemo(
    () => getEditableThemeColors(themeId, customTheme),
    [themeId, customTheme]
  );

  const options = useMemo(
    () => [
      ...THEME_PRESETS.map(({ id, name, colors }) => ({ id, name, colors })),
      { id: CUSTOM_THEME_ID, name: "自訂", colors: customColors },
    ],
    [customColors]
  );

  return (
    <List sx={rootSx}>
      <ListSubheader disableSticky sx={subheaderSx}>
        {t("顯示模式")}
      </ListSubheader>
      <ListItem>
        <ToggleButtonGroup
          value={_colorMode === "sun" ? null : _colorMode}
          exclusive
          fullWidth
          size="small"
          onChange={(_, v: ColorMode | null) => {
            if (v) {
              vibrate(vibrateDuration);
              updateColorMode(v);
            }
          }}
        >
          <ToggleButton value="system">{t("color-system")}</ToggleButton>
          <ToggleButton value="light">{t("color-light")}</ToggleButton>
          <ToggleButton value="dark">{t("color-dark")}</ToggleButton>
        </ToggleButtonGroup>
      </ListItem>

      <ListSubheader disableSticky sx={subheaderSx}>
        {t("預設主題")}
      </ListSubheader>
      <Box sx={presetGridSx}>
        {options.map(({ id, name, colors }) => (
          <ButtonBase
            key={id}
            sx={presetSx}
            aria-pressed={themeId === id}
            onClick={() => {
              vibrate(vibrateDuration);
              setThemeId(id);
            }}
          >
            <Box
              sx={{
                ...swatchSx,
                borderColor: themeId === id ? "text.primary" : "transparent",
              }}
            >
              <Swatch colors={colors.light} />
              <Swatch colors={colors.dark} />
              {themeId === id && <CheckIcon sx={checkSx} fontSize="small" />}
            </Box>
            <Typography variant="caption">{t(name)}</Typography>
          </ButtonBase>
        ))}
      </Box>

      <ListSubheader disableSticky sx={subheaderSx}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PaletteIcon fontSize="small" />
          {t("自訂顏色")}
        </Box>
      </ListSubheader>
      <ListItem>
        <ToggleButtonGroup
          value={editMode}
          exclusive
          fullWidth
          size="small"
          onChange={(_, v: Mode | null) => v && setEditMode(v)}
        >
          <ToggleButton value="light">{t("color-light")}</ToggleButton>
          <ToggleButton value="dark">{t("color-dark")}</ToggleButton>
        </ToggleButtonGroup>
      </ListItem>
      {THEME_COLOR_KEYS.map((key) => (
        <ColorRow
          key={`${editMode}-${key}`}
          label={t(THEME_COLOR_LABELS[key])}
          value={customColors[editMode][key]}
          onChange={(color) => setCustomThemeColor(editMode, key, color)}
        />
      ))}
      <ListItem>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {t("修改任何顏色會自動切換至自訂主題")}
        </Typography>
      </ListItem>
      <ListItem>
        <Button
          startIcon={<RestartAltIcon />}
          color="inherit"
          onClick={() => {
            vibrate(vibrateDuration);
            resetCustomTheme();
          }}
        >
          {t("重設自訂顏色")}
        </Button>
      </ListItem>

      <ListSubheader disableSticky sx={subheaderSx}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FormatSizeIcon fontSize="small" />
          {t("字體大小")}
        </Box>
      </ListSubheader>
      <ListItem>
        <FontSizeSlider hideLabel />
      </ListItem>

      <ListSubheader disableSticky sx={subheaderSx}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WbTwilightIcon fontSize="small" />
          {t("自動切換")}
        </Box>
      </ListSubheader>
      <ListItem
        secondaryAction={
          <Switch
            edge="end"
            checked={_colorMode === "sun"}
            inputProps={{ "aria-labelledby": "sun-color-mode-label" }}
            onChange={(_, checked) => {
              vibrate(vibrateDuration);
              updateColorMode(checked ? "sun" : "system");
            }}
          />
        }
      >
        <ListItemText
          id="sun-color-mode-label"
          primary={t("color-sun")}
          secondary={t("日間使用日照模式，日落後使用黑夜模式")}
        />
      </ListItem>
    </List>
  );
};

export default AppearanceSettings;

const Swatch = ({ colors }: { colors: ThemeColors }) => (
  <Box sx={{ flex: 1, bgcolor: colors.background, position: "relative" }}>
    <Box sx={{ ...dotSx, bgcolor: colors.primary, left: "20%" }} />
    <Box sx={{ ...dotSx, bgcolor: colors.eta, left: "55%" }} />
  </Box>
);

interface ColorRowProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

/**
 * Colour input that only commits once the user pauses, so dragging inside
 * the native picker does not rebuild the MUI theme on every frame.
 */
const ColorRow = ({ label, value, onChange }: ColorRowProps) => {
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => setLocal(value), [value]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const handleChange = (color: string) => {
    setLocal(color);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChangeRef.current(color), 150);
  };

  return (
    <ListItem
      secondaryAction={
        <Box component="label" sx={colorInputWrapperSx}>
          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
            {local.toUpperCase()}
          </Typography>
          <Box
            component="input"
            type="color"
            value={local}
            aria-label={label}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(e.target.value)
            }
            sx={colorInputSx}
          />
        </Box>
      }
    >
      <ListItemText primary={label} />
    </ListItem>
  );
};

const rootSx: SxProps<Theme> = {
  overflow: "auto",
};

const subheaderSx: SxProps<Theme> = {
  bgcolor: "inherit",
  lineHeight: "36px",
};

const presetGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
  gap: 1.5,
  px: 2,
  pb: 2,
};

const presetSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 0.5,
  borderRadius: 1,
};

const swatchSx = {
  position: "relative",
  display: "flex",
  width: "100%",
  height: 48,
  borderRadius: 1,
  overflow: "hidden",
  border: "2px solid",
  boxShadow: 1,
} as const;

const dotSx = {
  position: "absolute",
  top: "50%",
  width: 10,
  height: 10,
  borderRadius: "50%",
  transform: "translateY(-50%)",
} as const;

const checkSx: SxProps<Theme> = {
  position: "absolute",
  top: 2,
  right: 2,
  color: "#fff",
  bgcolor: "rgba(0, 0, 0, 0.6)",
  borderRadius: "50%",
};

const colorInputWrapperSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  cursor: "pointer",
};

const colorInputSx: SxProps<Theme> = {
  width: 40,
  height: 32,
  p: 0,
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  bgcolor: "transparent",
  cursor: "pointer",
};
