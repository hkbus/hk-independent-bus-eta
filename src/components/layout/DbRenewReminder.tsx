import React, { useContext, useMemo } from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
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
      <Card variant="outlined" sx={rootSx} onClick={renewDb}>
        <CardActionArea>
          <CardContent>
            <Typography>{t("db-renew-text")}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  } else {
    return null;
  }
};

export default DbRenewReminder;

const rootSx: SxProps<Theme> = {
  borderRadius: (theme) => theme.shape.borderRadius,
  margin: 0.2,
  height: "100%",
  display: "flex",
};
