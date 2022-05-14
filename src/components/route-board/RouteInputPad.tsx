import React, { useContext } from "react";
import { Box, Button, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";
import AppContext from "../../AppContext";
import { useTranslation } from "react-i18next";
import { BoardTabType } from "./BoardTabbar";
import { TRANSPORT_SEARCH_OPTIONS } from "../../constants";

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

const RouteNumPad = ({ possibleChar }) => {
  const { numPadOrder, searchRoute, updateSearchRouteByButton } =
    useContext(AppContext);

  return (
    <Grid container spacing={0}>
      {numPadOrder.split("").map((k) => (
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

const RouteAlphabetPad = ({ possibleChar }) => {
  const { updateSearchRouteByButton } = useContext(AppContext);

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

const RouteInputPad = ({ boardTab }) => {
  const {
    searchRoute,
    db: { routeList },
  } = useContext(AppContext);

  const possibleChar = getPossibleChar(searchRoute, routeList, boardTab);

  const padding = 0;
  if (navigator.userAgent === "prerendering") {
    return <></>;
  }

  return (
    <InputPadBox className={classes.root} padding={padding}>
      <Box className={classes.numPadContainer} padding={padding}>
        <RouteNumPad possibleChar={possibleChar} />
      </Box>
      <Box className={classes.alphabetPadContainer} padding={padding}>
        <RouteAlphabetPad possibleChar={possibleChar} />
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
    zIndex: 0,
    background: theme.palette.background.default,
    display: "flex",
    flexDirection: "row",
    // TODO: increase to 258px or enable scroll
    height: "248px",
    justifyContent: "space-around",
    paddingTop: "8px",
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

const getPossibleChar = (
  searchRoute: string,
  routeList: Record<string, unknown>,
  boardTab: BoardTabType
) => {
  if (routeList == null) return [];
  let possibleChar = {};
  Object.entries(routeList).forEach(([routeNo, meta]) => {
    if (
      routeNo.startsWith(searchRoute.toUpperCase()) &&
      meta["co"].some((c) =>
        TRANSPORT_SEARCH_OPTIONS[boardTab as BoardTabType].includes(c)
      )
    ) {
      let c = routeNo.slice(searchRoute.length, searchRoute.length + 1);
      possibleChar[c] = isNaN(possibleChar[c]) ? 1 : possibleChar[c] + 1;
    }
  });
  return Object.entries(possibleChar)
    .map((k) => k[0])
    .filter((k) => k !== "-");
};
