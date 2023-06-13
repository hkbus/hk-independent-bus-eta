import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const TimetableDrawer = ({ freq, jt, open, onClose }) => {
  const { t } = useTranslation();

  const list = useMemo(() => {
    return Object.entries(freq).map(([serviceId, dayFreq]) => (
      <ListItem key={`${serviceId}`} sx={entriesSx}>
        <Typography variant="subtitle1">{t(ServiceIds[serviceId])}</Typography>
        {Object.entries(dayFreq)
          .sort((a, b) => (a[0] < b[0] ? -1 : 1))
          .map(([start, details]) => (
            <Box key={`${serviceId}-${start}`} sx={freqContainerSx}>
              <Typography variant="body1">
                {start} {details ? `- ${details[0]}` : ""}
              </Typography>
              {details ? (
                <Typography variant="body1">
                  {parseInt(details[1], 10) / 60}
                  {t("分鐘")}
                </Typography>
              ) : (
                <></>
              )}
            </Box>
          ))}
      </ListItem>
    ));
  }, [freq, t]);
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
      {jt ? (
        <>
          <ListItem sx={entriesSx}>
            <Box sx={jtContainerSx}>
              <Typography variant="subtitle1">{t("車程")}</Typography>
              <Typography variant="subtitle1">
                {Math.round(jt)}
                {t("分鐘")}
              </Typography>
            </Box>
          </ListItem>
          <Divider sx={{ width: "80%" }} />
        </>
      ) : null}
      <List>{list}</List>
    </Drawer>
  );
};

export default TimetableDrawer;

const ServiceIds = {
  31: "星期一至五",
  287: "星期一至五",
  415: "星期一至五",
  63: "星期一至六",
  319: "星期一至六",
  447: "星期一至六",
  416: "星期六至日",
  480: "星期六至日",
  266: "星期二至四",
  271: "星期一至四",
  272: "星期五",
  288: "星期六",
  320: "星期日及公眾假期",
  448: "星期日及公眾假期",
  511: "所有日子",
  111: "除星期三外",
  1: "星期一",
  2: "星期二",
  4: "星期三",
  8: "星期四",
  16: "星期五",
  32: "星期六",
  64: "星期日",
  257: "星期一",
  258: "星期二",
  260: "星期三",
  264: "星期四",
  999: "未知日子",
};

const drawerSx: SxProps<Theme> = {
  height: "100vh",
  width: "80%",
  maxWidth: "320px",
  paddingTop: "56px",
  paddingLeft: "20px",
  backgroundColor: (theme) =>
    theme.palette.mode === "dark"
      ? theme.palette.background.default
      : theme.palette.primary.main,
  backgroundImage: "none",
};

const entriesSx: SxProps<Theme> = {
  flexDirection: "column",
  alignItems: "flex-start",
};

const jtContainerSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  width: "80%",
};

const freqContainerSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  width: "80%",
};
