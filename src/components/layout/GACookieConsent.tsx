import React, { useCallback, useContext, useState } from "react";
import {
  Box,
  Button,
  SxProps,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";

const GACookieConsent = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { analytics, toggleAnalytics } = useContext(AppContext);
  const [show, setShow] = useState<boolean>(
    !analytics && !Boolean(localStorage.getItem("consent"))
  );

  const handleAccept = useCallback(() => {
    toggleAnalytics();
    setShow(() => {
      localStorage.setItem("consent", "yes");
      return false;
    });
  }, [setShow, toggleAnalytics]);

  const handleReject = useCallback(() => {
    setShow(() => {
      localStorage.setItem("consent", "no");
      return false;
    });
  }, [setShow]);

  if (!show) {
    return <></>;
  }

  return (
    <Box sx={rootSx}>
      <Typography variant="subtitle2" sx={{ p: 1 }}>
        {t(
          "We'd like to set analytics cookies that help us improve hkbus.app by measuring how you use it."
        )}
      </Typography>
      <Box sx={btnContainerSx}>
        <Button size="small" variant="contained" onClick={handleAccept}>
          {t("Accept")}
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={handleReject}
        >
          {t("Reject")}
        </Button>
      </Box>
    </Box>
  );
};

export default GACookieConsent;

const rootSx: SxProps<Theme> = {
  background: "#333",
  display: "flex",
  alignSelf: "flex-end",
};

const btnContainerSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  p: 1,
};
