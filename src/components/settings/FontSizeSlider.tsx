import { ListItemText, Slider, Typography } from "@mui/material";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";

const FontSizeSlider = () => {
  const { fontSize: _fontSize, setFontSize: setAppFontSize } =
    useContext(AppContext);
  const { t } = useTranslation();
  const [fontSize, setFontSize] = useState<number>(_fontSize);
  const value = useRef<number>(fontSize);

  useEffect(() => {
    return () => {
      setAppFontSize(value.current);
    };
  }, [setAppFontSize]);

  const handleChange = useCallback((_: Event, v: number | number[]) => {
    setFontSize(v as number);
    value.current = v as number;
  }, [])

  return (
    <ListItemText
      primary={<Typography sx={{ fontSize }}>{t("字體大小")}</Typography>}
      secondary={
        <Slider
          step={2}
          min={10}
          max={26}
          value={fontSize}
          valueLabelDisplay="auto"
          size="small"
          onChange={handleChange}
        />
      }
    />
  );
};

export default FontSizeSlider;
