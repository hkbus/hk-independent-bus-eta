import React, { useContext, useMemo } from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  styled,
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
      <DbRenewCard
        variant="outlined"
        className={classes.card}
        onClick={renewDb}
      >
        <CardActionArea>
          <CardContent>
            <Typography>{t("db-renew-text")}</Typography>
          </CardContent>
        </CardActionArea>
      </DbRenewCard>
    );
  } else {
    return null;
  }
};

export default DbRenewReminder;

const PREFIX = "db-renew";

const classes = {
  card: `${PREFIX}-card`,
};

const DbRenewCard = styled(Card)(({ theme }) => ({
  [`&.${classes.card}`]: {
    borderRadius: theme.shape.borderRadius,
    margin: 0.2,
    height: "100%",
    display: "flex",
  },
}));
