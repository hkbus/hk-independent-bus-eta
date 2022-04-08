import React, { useContext } from "react";
import { Box, Button, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";
import AppContext from "../../AppContext";
import { useTranslation } from "react-i18next";

const KeyButton = ({ k, handleClick, disabled = false, className }) => {
  const { t } = useTranslation();
  return (
    <Button
      size="large"
      variant="contained"
      className={`${classes.button} ${className}`}
      onClick={() => handleClick(k)}
      disabled={disabled}
      disableRipple
    >
      {k === "b" ? (
        <BackspaceOutlinedIcon />
      ) : k === "c" ? (
        <div className={classes.cancel}>{t("C")}</div>
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
            className={classes.number}
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

  return (
    <Grid container spacing={1}>
      {possibleChar
        .filter((k) => isNaN(parseInt(k, 10)))
        .map((k) => (
          <Grid item xs={12} key={"input-" + k}>
            <KeyButton
              k={k}
              handleClick={updateSearchRouteByButton}
              className={classes.alphabet}
            />
          </Grid>
        ))}
    </Grid>
  );
};

const RouteInputPad = () => {
  const padding = 0;
  if (navigator.userAgent === "prerendering") {
    return <></>;
  }

  return (
    <InputPadBox className={classes.root} padding={padding}>
      <Box className={classes.numPadContainer} padding={padding}>
        <RouteNumPad />
      </Box>
      <Box className={classes.alphabetPadContainer} padding={padding}>
        <RouteAlphabetPad />
      </Box>
    </InputPadBox>
  );
};

export default RouteInputPad;

const PREFIX = "inputpad";

const classes = {
  root: `${PREFIX}-boxContainer`,
  numPadContainer: `${PREFIX}-numPadContainer`,
  alphabetPadContainer: `${PREFIX}-alphabetPadContainer`,
  button: `${PREFIX}-button`,
  alphabet: `${PREFIX}-alphabet`,
  cancel: `${PREFIX}-cancel`,
  number: `${PREFIX}-number`,
};

const InputPadBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "row",
    height: "248px",
    justifyContent: "space-around",
  },
  [`& .${classes.numPadContainer}`]: {
    width: "72%",
  },
  [`& .${classes.alphabetPadContainer}`]: {
    width: "20%",
    height: "246px",
    overflowX: "hidden",
    overflowY: "scroll",
  },
  [`& .${classes.button}`]: {
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    width: "100%",
    fontSize: "1.8em",
    borderRadius: "unset",
    "&:selected": {
      color: theme.palette.text.primary,
    },
    "&:hover": {
      backgroundColor: theme.palette.background.paper,
    },
  },
  [`& .${classes.cancel}`]: {
    fontSize: "0.9em",
  },
  [`& .${classes.alphabet}`]: {
    height: "52px",
  },
  [`& .${classes.number}`]: {
    height: "62px",
  },
}));
