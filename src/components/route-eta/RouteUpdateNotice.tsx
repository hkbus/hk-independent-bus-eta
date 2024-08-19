import { Box, SxProps, Theme, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import DbContext from "../../context/DbContext";
import { fetchRouteUpdatedAt, RouteListEntry } from "hk-bus-eta";
import { useTranslation } from "react-i18next";

interface RouteUpdateNoticeProps {
  route: RouteListEntry;
}

const RouteUpdateNotice = ({ route }: RouteUpdateNoticeProps) => {
  const [show, setShow] = useState<boolean>(false);
  const {
    db: { updateTime },
    renewDb,
  } = useContext(DbContext);
  const { t } = useTranslation();

  useEffect(() => {
    fetchRouteUpdatedAt(route)
      .then(updatedAt => setShow(updatedAt > updateTime))
  }, [route, updateTime]);

  if (!show) {
    return null;
  }

  return (
    <Box sx={rootSx} onClick={renewDb}>
      <Typography>{t("db-renew-text")}</Typography>
    </Box>
  );
};

export default RouteUpdateNotice;

const rootSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  flex: 1,
  width: "100%",
  p: 2,
  my: 1,
  borderStyle: "solid",
  borderWidth: 1,
  borderRadius: (theme) => theme.shape.borderRadius / 2,
  cursor: "pointer",
};
