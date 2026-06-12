import {
  Box,
  SxProps,
  Theme,
  Container,
  CssBaseline,
  Link,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import GACookieConsent from "./GACookieConsent";
import CollectionDrawer from "./CollectionDrawer";
import CollectionDialog from "./collections/CollectionDialog";
import { Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PinDialog from "./PinDialog";

const Root = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  // Keep the document language in sync with the UI language so screen
  // readers announce content with the correct voice / pronunciation.
  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "zh-Hant";
  }, [language]);

  return (
    <Container maxWidth="xs" disableGutters sx={rootSx}>
      <CssBaseline />
      <Link href="#main-content" sx={skipLinkSx}>
        {t("跳至主要內容")}
      </Link>
      <Header />
      <Suspense fallback={null}>
        <Box component="main" id="main-content" sx={mainSx}>
          <GACookieConsent />
          <Outlet />
        </Box>
      </Suspense>
      <Footer />
      <CollectionDrawer />
      <CollectionDialog />
      <PinDialog />
    </Container>
  );
};

const rootSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  height: "100%",
};

// Visually hidden until it receives keyboard focus, then shown on top so
// keyboard / screen-reader users can jump straight to the content.
const skipLinkSx: SxProps<Theme> = {
  ...visuallyHidden,
  "&:focus": {
    position: "fixed",
    top: 8,
    left: 8,
    width: "auto",
    height: "auto",
    clip: "auto",
    zIndex: (theme) => theme.zIndex.tooltip + 1,
    p: 1,
    backgroundColor: (theme) => theme.palette.background.paper,
    color: (theme) => theme.palette.text.primary,
    borderRadius: 1,
  },
};

const mainSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  overflow: "hidden",
  backgroundColor: (theme) => theme.palette.background.default,
};

export default Root;
