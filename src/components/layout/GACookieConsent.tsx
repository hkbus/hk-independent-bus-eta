import React, { useCallback, useContext, useState } from "react";
import { useTheme } from "@mui/material";
import CookieConsent from "react-cookie-consent";
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

  return (
    <CookieConsent
      visible={show ? "show" : "hidden"}
      location="none"
      buttonText={t("Accept")}
      declineButtonText={t("Reject")}
      style={{ position: "unset", flexWrap: "unset" }}
      buttonStyle={{
        fontSize: theme.typography.fontSize,
        margin: theme.spacing(0.5),
      }}
      declineButtonStyle={{
        fontSize: theme.typography.fontSize,
        margin: theme.spacing(0.5),
      }}
      onAccept={handleAccept}
      onDecline={handleReject}
      enableDeclineButton
      flipButtons
    >
      {t(
        "We'd like to set analytics cookies that help us improve hkbus.app by measuring how you use it."
      )}
    </CookieConsent>
  );
};

export default GACookieConsent;
