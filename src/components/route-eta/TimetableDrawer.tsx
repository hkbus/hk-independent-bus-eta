import { Drawer, SxProps, Tab, Tabs, Theme } from "@mui/material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import TimeTable from "./timetableDrawer/TimeTable";
import JourneyTimePanel from "./timetableDrawer/JourneyTimePanel";

interface TimetableDrawerProps {
  routeId: string;
  open: boolean;
  onClose: () => void;
}

const TimetableDrawer = ({ routeId, open, onClose }: TimetableDrawerProps) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"schedule" | "jt">("jt");

  const modalProps = useMemo(() => {
    return {
      onClose: () => {
        onClose();
      },
    };
  }, [onClose]);
  const paperProps = useMemo(() => {
    return { sx: drawerSx };
  }, []);

  return (
    <Drawer
      open={open}
      ModalProps={modalProps}
      PaperProps={paperProps}
      anchor="right"
    >
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={tabbarSx}>
        <Tab label={t("車程")} value="jt" />
        <Tab value="schedule" label={t("時間表")} />
      </Tabs>
      {tab === "jt" && <JourneyTimePanel routeId={routeId} />}
      {tab === "schedule" && <TimeTable routeId={routeId} />}
    </Drawer>
  );
};

export default TimetableDrawer;

const drawerSx: SxProps<Theme> = {
  height: "100vh",
  width: "80%",
  maxWidth: "320px",
  paddingTop: "56px",
  paddingLeft: "20px",
  backgroundColor: (theme) => theme.palette.background.default,
  backgroundImage: "none",
  overflow: "hidden",
};

const tabbarSx: SxProps<Theme> = {
  background: (theme) => theme.palette.background.default,
  minHeight: "36px",
  [`& .MuiTab-root`]: {
    textTransform: "none",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 0,
    paddingBottom: 0,
    minHeight: "32px",
  },
  [`& .MuiTabs-flexContainer`]: {
    justifyContent: "flex-start",
  },
};
