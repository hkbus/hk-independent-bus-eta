import React, { useCallback, useContext, useEffect, useState } from "react";
import { Box, Button, Container, Modal, SxProps, Theme } from "@mui/material";
import { useTranslation } from "react-i18next";
import domtoimage from "dom-to-image";
import mergeImages from "merge-images";
import { toProperCase, triggerShare, triggerShareImg } from "../../utils";
import AppContext from "../../AppContext";
import { CircularProgress } from "../Progress";

const SharingModal = ({
  id,
  route,
  idx = -1,
  dest,
  stopId,
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
      domToImage("route-eta-header", colorMode),
      domToImage("route-map", colorMode),
      domToImage(`stop-${idx}`, colorMode),
    ])
      .then((rawBase64s) => {
        let baseH = 0;
        return mergeImages(
          rawBase64s
            .filter(([v]) => v)
            .map(([rawBase64, h, w], idx) => {
              baseH += h;
              return {
                src: rawBase64,
                x: 0,
                y: baseH - h,
              };
            }),
          {
            height: baseH,
          }
        );
      })
      .then((b64) => {
        setImgBase64(b64);
      });
  }, [isOpen, colorMode, idx]);

  useEffect(() => {
    setIsOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  const handleShareLink = useCallback(() => {
    triggerShare(
      `https://${window.location.hostname}/${i18n.language}/route/${id}/${stopId}%2C${idx}`,
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
  }, [
    AppTitle,
    dest,
    t,
    setIsCopied,
    i18n.language,
    id,
    idx,
    stop.name,
    stopId,
    route,
  ]);

  const handleShareImg = useCallback(() => {
    triggerShareImg(
      imgBase64,
      `https://${window.location.hostname}/${i18n.language}/route/${id}/${stopId}%2C${idx}`,
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

const domToImage = (domId: string, colorMode: "dark" | "light") => {
  if (document.getElementById(domId)) {
    return domtoimage
      .toPng(document.getElementById(domId), {
        bgcolor: colorMode === "light" ? "#fedb00" : "#000",
      })
      .then((base64) => [
        base64,
        document.getElementById(domId).clientHeight,
        document.getElementById(domId).clientWidth,
      ]);
  } else {
    return Promise.resolve([null, 0, 0]);
  }
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
