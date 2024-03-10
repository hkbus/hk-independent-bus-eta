import { useCallback, useContext } from "react";
import {
  Avatar,
  Box,
  Checkbox,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import { Watch as WatchIcon, Launch as LaunchIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import AppContext from "../../../AppContext";
import ReactNativeContext from "../../../ReactNativeContext";

const WatchEntry = () => {
  const {
    collectionDrawerRoute,
    db: { routeList },
  } = useContext(AppContext);
  const { os } = useContext(ReactNativeContext);
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    if (collectionDrawerRoute === null) return;
    const [routeId, seq] = collectionDrawerRoute.split("/");
    const isApple =
      os === "ios" || /iPad|iPhone|iPod|Mac/.test(navigator.userAgent);
    const subdomain = isApple ? "watch" : "wear";
    try {
      const stopId = seq
        ? routeList[routeId].stops[routeList[routeId].co[0]][Number(seq)]
        : undefined;
      const url = `https://${subdomain}.hkbus.app/route/${routeId.toLowerCase()}/${
        stopId ? stopId + "%2C" + seq : seq
      }`;
      console.log(url);
      window.open(url, "_blank");
    } catch (error) {
      console.error(error);
      const url = `https://${subdomain}.hkbus.app/route/${routeId.toLowerCase()}`;
      window.open(url, "_blank");
    }
  }, [os, collectionDrawerRoute, routeList]);

  return (
    <Box sx={collectionSx}>
      <Box sx={leftContainerSx} onClick={handleClick}>
        <Avatar>
          <WatchIcon />
        </Avatar>
        <Box sx={nameContainerSx}>
          <Typography variant="body1">{t("智能手錶應用程式")}</Typography>
        </Box>
      </Box>
      <Box>
        <Checkbox icon={<LaunchIcon />} checked={false} onClick={handleClick} />
      </Box>
    </Box>
  );
};

export default WatchEntry;

const collectionSx: SxProps<Theme> = {
  flex: 1,
  display: "flex",
  justifyContent: "space-between",
};

const leftContainerSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 2,
  flex: 1,
  "& .MuiAvatar-colorDefault": {
    color: (theme) =>
      theme.palette.mode === "dark"
        ? theme.palette.background.default
        : "white",
  },
  cursor: "pointer",
};

const nameContainerSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
};
