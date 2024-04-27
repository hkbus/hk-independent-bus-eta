import { useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, SxProps, Theme } from "@mui/material";
import { Launch as LaunchIcon } from "@mui/icons-material";
import useLanguage from "../../../hooks/useTranslation";
import DbContext from "../../../context/DbContext";

interface RouteOffiicalUrlBtnProps {
  routeId: string;
}

const RouteOffiicalUrlBtn = ({ routeId }: RouteOffiicalUrlBtnProps) => {
  const {
    db: { routeList },
  } = useContext(DbContext);
  const { t } = useTranslation();
  const language = useLanguage();
  const { route, co, gtfsId } = routeList[routeId];

  const sites = useMemo(
    () =>
      co.map((c) => {
        switch (c) {
          case "ctb":
            return [
              c,
              `https://mobile.citybus.com.hk/nwp3/?f=1&ds=${route}&dsmode=1&l=${
                language === "zh" ? 0 : 1
              }`,
            ];
          case "kmb":
            return [
              c,
              `https://search.kmb.hk/KMBWebSite/?action=routesearch&route=${route}&lang=${
                language === "zh" ? "zh-hk" : "en"
              }`,
            ];
          case "gmb":
            return [
              c,
              `https://h2-app-rr.hkemobility.gov.hk/ris_page/get_gmb_detail.php?lang=${
                language === "zh" ? "TC" : "EN"
              }&route_id=${gtfsId}`,
            ];
          case "nlb":
            return [c, `https://www.nlb.com.hk/route?q=${route}`];
          case "lrtfeeder":
            return [
              c,
              `https://www.mtr.com.hk/${
                language === "zh" ? "ch" : "en"
              }/customer/services/searchBusRouteDetails.php?routeID=${route}`,
            ];
          case "lightRail":
            return [
              c,
              `https://www.mtr.com.hk/${
                language === "zh" ? "ch" : "en"
              }/customer/services/schedule_index.html`,
            ];
          case "mtr":
            return [
              c,
              `https://www.mtr.com.hk/${
                language === "zh" ? "ch" : "en"
              }/customer/services/train_service_index.html`,
            ];
          default:
            return [c, ""];
        }
      }),
    [co, route, language, gtfsId]
  );

  const handleClick = useCallback(
    (url: string) => () => {
      if (url) {
        window.open(url, "_blank");
      }
    },
    []
  );

  return (
    <Box sx={rootSx}>
      {sites.map(([c, url]) => (
        <Button
          key={c}
          onClick={handleClick(url)}
          variant="outlined"
          size="small"
          endIcon={<LaunchIcon />}
        >
          {t(c)}
        </Button>
      ))}
    </Box>
  );
};

export default RouteOffiicalUrlBtn;

const rootSx: SxProps<Theme> = {
  display: "flex",
  gap: 1,
};
