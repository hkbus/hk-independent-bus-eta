import React, { useCallback, useContext, useEffect, useState } from "react";
import { Box, Button, Container, CircularProgress, Modal } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import domtoimage from "dom-to-image";
import { toProperCase, triggerShare, triggerShareImg } from "../../utils";
import AppContext from "../../AppContext";

const SharingModal = ({
  id,
  route,
  idx = -1,
  dest,
  stop,
  setIsCopied,
  event,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { AppTitle, colorMode } = useContext(AppContext);
  const { t, i18n } = useTranslation();
  // eslint-disable-next-line
  const [imgBase64, setImgBase64] = useState<string>("");

  useEffect(() => {
    if (isOpen === false) return;

    Promise.all([
      domtoimage.toPng(document.getElementById(`stop-${idx}`)),
    ]).then((dataUrl) => {
      setImgBase64(`${dataUrl}`);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  const handleShareLink = useCallback(() => {
    triggerShare(
      `https://${window.location.hostname}/${i18n.language}/route/${id}`,
      `${idx + 1}. ${toProperCase(stop.name[i18n.language])} - ${route} ${t(
        "往"
      )} ${toProperCase(dest[i18n.language])} - ${t(AppTitle)}`
    )
      .then(() => {
        if (navigator.clipboard) setIsCopied(true);
      })
      .finally(() => {
        setIsOpen(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerShare, i18n.language, id, idx, stop.name, route]);

  const handleShareImg = useCallback(() => {
    triggerShareImg(
      imgBase64,
      `https://${window.location.hostname}/${i18n.language}/route/${id}`,
      `${idx + 1}. ${toProperCase(stop.name[i18n.language])} - ${route} ${t(
        "往"
      )} ${toProperCase(dest[i18n.language])} - https://hkbus.app/`
    )
      .then(() => {
        if (navigator.clipboard) setIsCopied(true);
      })
      .finally(() => {
        setIsOpen(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerShareImg, imgBase64, i18n.language, id, idx, route]);

  return (
    <RootModal
      className={classes.root}
      onClose={() => setIsOpen(false)}
      open={isOpen}
    >
      <Container maxWidth="xs" className={classes.container}>
        {imgBase64 && (
          <Box className={classes.boxContainer}>
            <img src={imgBase64} style={{ width: "100%" }} alt="" />
            <Box className={classes.buttonContainer}>
              <Button className={classes.button} onClick={handleShareLink}>
                {t("以鏈結分享")}
              </Button>
              <Button className={classes.button} onClick={handleShareImg}>
                {t("以圖片分享")}
              </Button>
            </Box>
          </Box>
        )}
        {!imgBase64 && <CircularProgress color="inherit" />}
      </Container>
    </RootModal>
  );
};

export default SharingModal;

const PREFIX = "sharingModal";

const classes = {
  root: `${PREFIX}-root`,
  container: `${PREFIX}-container`,
  boxContainer: `${PREFIX}-boxContainer`,
  buttonContainer: `${PREFIX}-buttonContainer`,
  button: `${PREFIX}-button`,
};

const RootModal = styled(Modal)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    alignItems: "center",
  },
  [`& .${classes.container}`]: {
    display: "flex",
    justifyContent: "center",
    outline: "none",
  },
  [`& .${classes.boxContainer}`]: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  [`& .${classes.buttonContainer}`]: {
    display: "flex",
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.background.default
        : "#fedb00",
  },
  [`& .${classes.button}`]: {
    flex: 1,
    border: "1px solid rgba(255, 255, 255, 0.3)",
    color:
      theme.palette.mode === "dark"
        ? theme.palette.primary.main
        : theme.palette.text.primary,
  },
}));
