import React, { useState } from "react";
import { Button, Divider, SxProps, Theme } from "@mui/material";
import { Schedule as ScheduleIcon } from "@mui/icons-material";
import TimetableDrawer from "./TimetableDrawer";
import { useTranslation } from "react-i18next";
import type { RouteListEntry } from "hk-bus-eta";

const TimeTableButton = ({
  routeListEntry,
}: {
  routeListEntry: RouteListEntry;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { freq, jt } = routeListEntry;

  return (
    freq && (
      <>
        <Divider orientation="vertical" sx={buttonDividerSx} />
        <Button
          variant="text"
          aria-label="open-timetable"
          sx={buttonSx}
          size="small"
          startIcon={<ScheduleIcon />}
          onClick={() => setIsOpen(true)}
        >
          {t("時間表")}
        </Button>
        <TimetableDrawer
          freq={freq}
          jt={jt}
          open={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </>
    )
  );
};

export default TimeTableButton;

const buttonDividerSx: SxProps<Theme> = {
  position: "absolute",
  top: "0",
  right: "calc(64px + 2%)",
};

const buttonSx: SxProps<Theme> = {
  color: (theme) =>
    theme.palette.getContrastText(theme.palette.background.default),
  position: "absolute",
  top: "0",
  right: "2%",
  flexDirection: "column",
  justifyContent: "center",
  "& > .MuiButton-label": {
    flexDirection: "column",
    justifyContent: "center",
  },
  "& > .MuiButton-startIcon": {
    margin: 0,
  },
};
