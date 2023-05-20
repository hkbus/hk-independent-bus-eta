import React from "react";
import { Box, SxProps, Theme, Container, CssBaseline } from "@mui/material";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import GACookieConsent from "./GACookieConsent";
import CollectionDrawer from "./CollectionDrawer";

const Main = () => {
  return (
    <Container maxWidth="xs" disableGutters sx={rootSx}>
      <CssBaseline />
      <Header />
      <Box sx={mainSx}>
        <GACookieConsent />
        <Outlet />
      </Box>
      <Footer />
      <CollectionDrawer />
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

export default Main;
