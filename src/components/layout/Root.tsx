import { Box, SxProps, Theme, Container, CssBaseline } from "@mui/material";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import GACookieConsent from "./GACookieConsent";
import CollectionDrawer from "./CollectionDrawer";
import CollectionDialog from "./collections/CollectionDialog";
import { Suspense } from "react";
import PinDialog from "./PinDialog";

const Root = () => {
  return (
    <Container maxWidth="xs" disableGutters sx={rootSx}>
      <CssBaseline />
      <Header />
      <Suspense fallback={null}>
        <Box sx={mainSx}>
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

const mainSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  overflow: "hidden",
  backgroundColor: (theme) => theme.palette.background.default,
};

export default Root;
