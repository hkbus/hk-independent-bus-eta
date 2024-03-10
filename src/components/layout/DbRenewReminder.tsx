import { useContext, useMemo } from "react";
import { Box, SxProps, Theme, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";

const DbRenewReminder = () => {
  const { t } = useTranslation();

  const {
    db: { updateTime },
    renewDb,
  } = useContext(AppContext);

  const isOutdated = useMemo(
    () => Date.now() > updateTime + 28 * 24 * 3600 * 1000,
    [updateTime]
  );

  if (navigator.userAgent !== "prerendering" && isOutdated) {
    return (
      <Box sx={rootSx} onClick={renewDb}>
        <Typography>{t("db-renew-text")}</Typography>
      </Box>
    );
  } else {
    return null;
  }
};

export default DbRenewReminder;

const rootSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  flex: 1,
  width: "100%",
  p: 2,
  borderStyle: "solid",
  borderWidth: 1,
  borderRadius: (theme) => theme.shape.borderRadius / 2,
  cursor: "pointer",
};
