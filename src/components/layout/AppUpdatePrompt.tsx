import { useEffect, useRef } from "react";
import { Button, Snackbar } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useRegisterSW } from "virtual:pwa-register/react";

const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000;

const AppUpdatePrompt = () => {
  const { t } = useTranslation();
  const registrationRef = useRef<ServiceWorkerRegistration>();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      registrationRef.current = registration;
    },
  });

  useEffect(() => {
    const check = () => {
      if (navigator.onLine) registrationRef.current?.update().catch(() => {});
    };
    // Standalone PWAs resume from background without a navigation, so the browser never re-checks sw.js on its own.
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    const timer = setInterval(check, UPDATE_CHECK_INTERVAL);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      open={needRefresh}
      message={t("有新版本")}
      onClose={(_, reason) => {
        if (reason !== "clickaway") setNeedRefresh(false);
      }}
      action={
        <Button
          color="error"
          size="small"
          onClick={() => updateServiceWorker(true)}
        >
          {t("立即更新")}
        </Button>
      }
    />
  );
};

export default AppUpdatePrompt;
