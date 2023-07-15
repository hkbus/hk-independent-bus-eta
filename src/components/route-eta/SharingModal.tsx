import React, { useCallback, useContext, useEffect, useState } from "react";
import { Box, Button, Container, Modal, SxProps, Theme } from "@mui/material";
import { useTranslation } from "react-i18next";
import domtoimage from "dom-to-image";
import mergeBase64 from "merge-base64";
import { toProperCase, triggerShare, triggerShareImg } from "../../utils";
import AppContext from "../../AppContext";
import { CircularProgress } from "../Progress";

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
  const [imgBase64, setImgBase64] = useState<string>("");

  useEffect(() => {
    if (isOpen === false) return;

    Promise.all([
      domtoimage.toPng(document.getElementById(`route-eta-header`), {
        bgcolor: colorMode === "light" ? "#fedb00" : "#000",
      }),
      document.getElementById(`route-map`) &&
        domtoimage.toPng(document.getElementById(`route-map`)),
      domtoimage.toPng(document.getElementById(`stop-${idx}`)),
    ])
      .then((rawBase64s) =>
        mergeBase64(
          rawBase64s.filter((v) => v).map((rawBase64) => rawBase64.substr(22)),
          { direction: true, isPng: true }
        )
      )
      .then((dataUrl) => {
        setImgBase64(dataUrl);
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
    <Modal sx={rootSx} onClose={() => setIsOpen(false)} open={isOpen}>
      <Container maxWidth="xs" sx={containerSx}>
        {imgBase64 && (
          <Box sx={boxContainerSx}>
            <img src={imgBase64} style={{ width: "100%" }} alt="" />
            <Box sx={buttonContainerSx}>
              <Button sx={buttonSx} onClick={handleShareLink}>
                {t("以鏈結分享")}
              </Button>
              <Button sx={buttonSx} onClick={handleShareImg}>
                {t("以圖片分享")}
              </Button>
            </Box>
          </Box>
        )}
        {!imgBase64 && <CircularProgress color="inherit" />}
      </Container>
    </Modal>
  );
};

export default SharingModal;

const rootSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
};

const containerSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  outline: "none",
};

const boxContainerSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const buttonContainerSx: SxProps<Theme> = {
  display: "flex",
  backgroundColor: (theme) =>
    theme.palette.mode === "dark"
      ? theme.palette.background.default
      : "#fedb00",
};

const buttonSx: SxProps<Theme> = {
  flex: 1,
  border: "1px solid rgba(255, 255, 255, 0.3)",
  color: (theme) =>
    theme.palette.mode === "dark"
      ? theme.palette.primary.main
      : theme.palette.text.primary,
};
