import {
  Box,
  SxProps,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { DEFAULT_SEARCH_RANGE_OPTIONS, getDistanceWithUnit } from "../../utils";
import { useContext, useState } from "react";
import AppContext from "../../context/AppContext";
import RangeMapDialog from "./RangeMapDialog";
import { grey } from "@mui/material/colors";

const SearchRangeController = () => {
  const { t } = useTranslation();
  const { searchRange, setSearchRange } = useContext(AppContext);
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Box sx={rootSx}>
      <Typography variant="caption">{t("搜尋範圍（米）")}:</Typography>
      <ToggleButtonGroup
        value={
          DEFAULT_SEARCH_RANGE_OPTIONS.includes(searchRange)
            ? searchRange
            : "custom"
        }
        onChange={(_, value) => {
          if (DEFAULT_SEARCH_RANGE_OPTIONS.includes(value)) {
            setSearchRange(value);
          } else {
            setOpen(true);
          }
        }}
        aria-label="search range"
        size="small"
        exclusive
      >
        {DEFAULT_SEARCH_RANGE_OPTIONS.map((range) => {
          const { distance } = getDistanceWithUnit(range);
          return (
            <ToggleButton
              key={`range-${range}`}
              sx={toggleButtonSx}
              disableRipple
              value={range}
              aria-label={range.toString()}
            >
              {distance}
            </ToggleButton>
          );
        })}
        <ToggleButton
          key={`range-custom`}
          sx={toggleButtonSx}
          disableRipple
          value={"custom"}
          aria-label={"custom"}
        >
          {t("自訂")}
          {!DEFAULT_SEARCH_RANGE_OPTIONS.includes(searchRange) &&
            `(${searchRange})`}
        </ToggleButton>
      </ToggleButtonGroup>
      <RangeMapDialog open={open} onClose={() => setOpen(false)} />
    </Box>
  );
};

export default SearchRangeController;

const rootSx: SxProps<Theme> = {
  position: "sticky",
  top: 0,
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  flexWrap: "wrap",
  listStyle: "none",
  px: 0,
  py: 1,
  m: 0,
  borderRadius: 0,
  fontSize: 14,
  borderBottomWidth: 1,
  borderBottomColor: (t) => (t.palette.mode === "dark" ? grey[900] : grey[200]),
  borderBottomStyle: "solid",
};

const toggleButtonSx: SxProps<Theme> = {
  height: 30,
  px: 2,
  // Selected range reads in the brand yellow (#fedb00) instead of plain grey
  "&.Mui-selected": {
    backgroundColor: (t) =>
      t.palette.mode === "dark"
        ? "rgba(254, 219, 0, 0.14)"
        : "rgba(254, 219, 0, 0.2)",
    color: (t) => t.palette.text.primary,
    // Gate hover to pointer devices so it can't stick after a tap on old Android
    "@media (hover: hover)": {
      "&:hover": {
        backgroundColor: (t) =>
          t.palette.mode === "dark"
            ? "rgba(254, 219, 0, 0.2)"
            : "rgba(254, 219, 0, 0.28)",
      },
    },
  },
};
