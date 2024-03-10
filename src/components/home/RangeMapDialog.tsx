import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Slider,
  SxProps,
  Theme,
} from "@mui/material";
import RangeMap from "./RangeMap";
import { useTranslation } from "react-i18next";
import { useCallback, useContext, useState } from "react";
import AppContext from "../../AppContext";
import { Location } from "hk-bus-eta";
import { Close as CloseIcon } from "@mui/icons-material";
import { getDistanceWithUnit } from "../../utils";

interface RangeMapDialogProps {
  open: boolean;
  onClose: () => void;
}

interface RangeMapDialogState {
  geolocation: Location;
  searchRange: number;
}

const RangeMapDialog = ({ open, onClose }: RangeMapDialogProps) => {
  const {
    geolocation,
    manualGeolocation,
    searchRange,
    setManualGeolocation,
    setSearchRange,
  } = useContext(AppContext);

  const { t } = useTranslation();

  const [state, setState] = useState<RangeMapDialogState>({
    geolocation: manualGeolocation ?? geolocation,
    searchRange,
  });

  const handleClose = useCallback(() => {
    setManualGeolocation(state.geolocation);
    setSearchRange(state.searchRange);
    onClose();
  }, [state, setManualGeolocation, setSearchRange, onClose]);

  const updateGeolocation = useCallback((geolocation: Location) => {
    setState((prev) => ({
      ...prev,
      geolocation,
    }));
  }, []);

  const updateRange = useCallback((searchRange: number) => {
    setState((prev) => ({
      ...prev,
      searchRange,
    }));
  }, []);

  const formatDistanceWithUnit = useCallback((
    val: number,
  ) => {
    const { distance, unit } = getDistanceWithUnit(val);
    return `${distance}${t(unit)}`;
  }, [t]);
  

  return (
    <Dialog open={open} onClose={handleClose} sx={rootSx}>
      <DialogTitle sx={titleSx}>
        {t("自訂搜尋範圍")}
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <RangeMap
          range={state.searchRange}
          value={state.geolocation}
          onChange={updateGeolocation}
        />
        <Box sx={{ px: 4, py: 5 }}>
          <Slider
            sx={sliderSx}
            aria-label="Range"
            value={convertScale(
              state.searchRange,
              searchRangeScale,
              sliderScale
            )}
            valueLabelDisplay="on"
            marks={sliderScale.map((val, index) => {
              return {
                label: formatDistanceWithUnit(searchRangeScale[index]),
                value: val,
              };
            })}
            min={sliderScale[0]}
            max={sliderScale[sliderScale.length - 1]}
            step={250}
            scale={(value) =>
              convertScale(value, sliderScale, searchRangeScale)
            }
            valueLabelFormat={(v) => formatDistanceWithUnit(v)}
            onChange={(_, value) =>
              updateRange(
                convertScale(
                  value as number,
                  sliderScale,
                  searchRangeScale
                ) as number
              )
            }
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default RangeMapDialog;

const rootSx: SxProps<Theme> = {
  "& .MuiPaper-root": {
    width: "100%",
    height: "calc(100dvh - 100px)",
  },
  "& .MuiDialogContent-root": {
    p: 0,
    display: "flex",
    flexDirection: "column",
  },
};

const titleSx: SxProps<Theme> = {
  backgroundColor: (theme) => theme.palette.background.default,
  color: (theme) => theme.palette.primary.main,
  display: "flex",
  justifyContent: "space-between",
};

const sliderSx: SxProps<Theme> = {
  "& .MuiSlider-mark": {
    backgroundColor: "#bfbfbf",
    height: 8,
  },
};

const sliderScale = [0, 1000, 2000, 3000, 4000, 5000];
const searchRangeScale = [20, 100, 200, 400, 2000, 4000];

const convertScale = (
  value: number,
  srcScale: number[],
  destScale: number[]
): number => {
  if (value <= srcScale[0]) {
    return destScale[0];
  }
  for (let i = 1; i < srcScale.length; ++i) {
    if (value <= srcScale[i]) {
      return (
        destScale[i - 1] +
        ((value - srcScale[i - 1]) * (destScale[i] - destScale[i - 1])) /
          (srcScale[i] - srcScale[i - 1])
      );
    }
  }
  return destScale[destScale.length - 1];
};