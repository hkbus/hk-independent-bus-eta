import { ListItemText, Slider, Typography } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
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
          onChange={(_, v: number) => {
            setFontSize(v);
            value.current = v;
          }}
        />
      }
    />
  );
};

export default FontSizeSlider;
