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
import AppContext from "../../AppContext";
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
  borderBottomColor: grey[900],
  borderBottomStyle: "solid",
};

const toggleButtonSx: SxProps<Theme> = {
  height: 30,
  px: 2,
};
