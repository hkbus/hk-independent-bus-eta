import React, { useState } from "react";
import { Button, Divider, SxProps, Theme } from "@mui/material";
import { Schedule as ScheduleIcon } from "@mui/icons-material";
import TimetableDrawer from "./TimetableDrawer";
import { useTranslation } from "react-i18next";

const TimeTableButton = ({ routeId }: { routeId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
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
        routeId={routeId}
        open={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
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
