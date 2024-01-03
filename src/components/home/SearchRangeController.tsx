import {
  Paper,
  SxProps,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { DEFAULT_SEARCH_RANGE_OPTIONS, getDistanceWithUnit } from "../../utils";
import { useContext, useState } from "react";
import AppContext from "../../AppContext";
import RangeMapDialog from "./RangeMapDialog";

const SearchRangeController = () => {
  const { t } = useTranslation();
  const { isRangeController, searchRange, setSearchRange } =
    useContext(AppContext);
  const [open, setOpen] = useState<boolean>(false);

  if (isRangeController === false) {
    return null;
  }

  return (
    <Paper sx={paperSx}>
      <Typography variant="body2">{t("搜尋範圍（米）")}:</Typography>
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
    </Paper>
  );
};

export default SearchRangeController;

const paperSx: SxProps<Theme> = {
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
};

const toggleButtonSx: SxProps<Theme> = {
  height: 30,
  borderRadius: 15,
  px: 1.5,
  "&.MuiButtonBase-root&.Mui-selected": {
    backgroundColor: ({ palette }) => palette.primary.main,
    color: "black",
  },
};
