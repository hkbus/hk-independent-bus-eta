import React, { useContext } from "react";
import { Box, Button, Grid } from "@mui/material";
import { makeStyles } from "@mui/styles";
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";
import AppContext from "../../AppContext";
import { useTranslation } from "react-i18next";

const KeyButton = ({ k, handleClick, disabled = false, className }) => {
  useStyles();
  const { t } = useTranslation();
  return (
    <Button
      size="large"
      variant="contained"
      className={`inputpad-button ${className}`}
      onClick={() => handleClick(k)}
      disabled={disabled}
      disableRipple
    >
      {k === "b" ? (
        <BackspaceOutlinedIcon />
      ) : k === "c" ? (
        <div className={"inputpad-cancelButton"}>{t("C")}</div>
      ) : (
        k
      )}
    </Button>
  );
};

const RouteNumPad = () => {
  const { searchRoute, updateSearchRouteByButton, possibleChar } =
    useContext(AppContext);

  return (
    <Grid container spacing={0}>
      {"789456123c0b".split("").map((k) => (
        <Grid item xs={4} key={"input-" + k}>
          <KeyButton
            k={k}
            handleClick={updateSearchRouteByButton}
            className={"inputpad-numberButton"}
            disabled={
              (k === "b" && searchRoute === "") ||
              (!"bc".includes(k) && !possibleChar.includes(k)) ||
              (k === "c" && searchRoute === "")
            }
          />
        </Grid>
      ))}
    </Grid>
  );
};

const RouteAlphabetPad = () => {
  const { updateSearchRouteByButton, possibleChar } = useContext(AppContext);
  useStyles();

  return (
    <Grid container spacing={1}>
      {possibleChar
        .filter((k) => isNaN(k))
        .map((k) => (
          <Grid item xs={12} key={"input-" + k}>
            <KeyButton
              k={k}
              handleClick={updateSearchRouteByButton}
              className={"inputpad-alphabetButton"}
            />
          </Grid>
        ))}
    </Grid>
  );
};

const RouteInputPad = () => {
  useStyles();
  const padding = 0;
  if (navigator.userAgent === "prerendering") {
    return <></>;
  }

  return (
    <Box className={"inputpad-boxContainer"} padding={padding}>
      <Box className={"inputpad-numPadContainer"} padding={padding}>
        <RouteNumPad />
      </Box>
      <Box className={"inputpad-alphabetPadContainer"} padding={padding}>
        <RouteAlphabetPad />
      </Box>
    </Box>
  );
};

export default RouteInputPad;

const useStyles = makeStyles((theme) => ({
  "@global": {
    ".inputpad-boxContainer": {
      display: "flex",
      flexDirection: "row",
      height: "208px",
      justifyContent: "space-around",
    },
    ".inputpad-numPadContainer": {
      width: "60%",
    },
    ".inputpad-alphabetPadContainer": {
      width: "20%",
      height: "206px",
      overflowX: "hidden",
      overflowY: "scroll",
    },
    ".inputpad-button": {
      background: theme.palette.background.paper,
      color: theme.palette.text.primary,
      width: "100%",
      height: "44px",
      fontSize: "1.2em",
      borderRadius: "unset",
      "&:selected": {
        color: theme.palette.text.primary,
      },
      "&:hover": {
        backgroundColor: theme.palette.background.paper,
      },
    },
    ".inputpad-cancelButton": {
      fontSize: "0.8em",
    },
    ".inputpad-alphabetButton": {
      height: "42px",
    },
    ".inputpad-numberButton": {
      height: "52px",
    },
  },
}));
