import { useContext } from "react";
import { Tabs, Tab, SxProps, Theme } from "@mui/material";
import {
  Star as StarIcon,
  NearMe as NearMeIcon,
  Bookmark as BookmarkIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { RouteCollection } from "../../@types/types";
import CollectionContext from "../../CollectionContext";

interface HomeTabbarProps {
  homeTab: HomeTabType | string;
  onChangeTab: (v: HomeTabType, rerenderList: boolean) => void;
}

const HomeTabbar = ({ homeTab, onChangeTab }: HomeTabbarProps) => {
  const { t } = useTranslation();
  const { collections } = useContext(CollectionContext);

  return (
    <Tabs
      value={homeTab}
      onChange={(_, v) => onChangeTab(v, true)}
      sx={tabbarSx}
      variant="scrollable"
      scrollButtons
    >
      <Tab
        iconPosition="start"
        icon={<NearMeIcon />}
        label={t("附近")}
        value="nearby"
        disableRipple
      />
      <Tab
        iconPosition="start"
        icon={<StarIcon />}
        label={t("常用")}
        value="saved"
        disableRipple
      />
      <Tab
        iconPosition="start"
        icon={<BookmarkIcon />}
        label={t("Collections")}
        value="collections"
        disableRipple
      />
      {collections.map((collection, idx) => (
        <Tab
          key={`collection-${idx}`}
          label={collection.name}
          value={collection.name}
          disableRipple
        />
      ))}
    </Tabs>
  );
};

export default HomeTabbar;

export type HomeTabType = "saved" | "nearby" | "collections";

export const isHomeTab = (
  input: unknown,
  collections: RouteCollection[]
): input is HomeTabType => {
  if (input === "saved" || input === "nearby" || input === "collections") {
    return true;
  }
  for (let i = 0; i < collections.length; ++i) {
    if (input === collections[i].name) {
      return true;
    }
  }
  return false;
};

const tabbarSx: SxProps<Theme> = {
  background: (theme) => theme.palette.background.default,
  minHeight: "36px",
  [`& .MuiTab-root`]: {
    textTransform: "none",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 0,
    paddingBottom: 0,
    minHeight: "32px",
  },
  [`& .MuiTabs-flexContainer`]: {
    justifyContent: "flex-start",
    "& svg": {
      fontSize: "1rem",
    },
    "& .MuiTab-root": {
      fontSize: "0.8em",
    },
  },
};
