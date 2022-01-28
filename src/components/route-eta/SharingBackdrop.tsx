import React, { useContext, useEffect, useState } from "react";
import { Backdrop, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import domtoimage from "dom-to-image";
import mergeBase64 from "merge-base64";
import { toProperCase, triggerShare, triggerShareImg } from "../../utils";
import AppContext from "../../AppContext";

const SharingBackdrop = ({
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

  useEffect(() => {
    if (isOpen === false) return;
    if (navigator.share) {
      Promise.all([
        domtoimage.toPng(document.getElementById(`route-eta-header`), {
          bgcolor: colorMode === "light" ? "#fedb00" : "#000",
        }),
        domtoimage.toPng(document.getElementById(`route-map`)),
        domtoimage.toPng(document.getElementById(`stop-${idx}`)),
      ])
        .then((rawBase64s) =>
          mergeBase64(
            rawBase64s.map((rawBase64) => rawBase64.substr(22)),
            { direction: true, isPng: true }
          )
        )
        .then((dataUrl) => {
          triggerShareImg(
            dataUrl,
            `https://${window.location.hostname}/${i18n.language}/route/${id}`,
            `${idx + 1}. ${toProperCase(
              stop.name[i18n.language]
            )} - ${route} ${t("往")} ${toProperCase(
              dest[i18n.language]
            )} - https://hkbus.app/`
          );
        })
        .finally(() => {
          setIsOpen(false);
        });
    } else {
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={isOpen}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default SharingBackdrop;
