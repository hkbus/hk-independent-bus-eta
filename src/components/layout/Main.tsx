import React from "react";
import { Box, SxProps, Theme, Container, CssBaseline } from "@mui/material";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

const Main = () => {
  return (
    <Container maxWidth="xs" disableGutters sx={rootSx}>
      <CssBaseline />
      <Header />
      <Box sx={mainSx}>
        <Outlet />
      </Box>
      <Footer />
    </Container>
  );
};

const rootSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  height: "100vh",
};

const mainSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  overflow: "hidden",
};

export default Main;
