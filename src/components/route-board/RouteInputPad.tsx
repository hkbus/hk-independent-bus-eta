import React, { useContext } from "react";
import { Box, Button, Grid, SxProps, Theme } from "@mui/material";
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";
import DoNotDisturbOnOutlinedIcon from "@mui/icons-material/DoNotDisturbOnOutlined";
import AppContext from "../../AppContext";
import { BoardTabType } from "./BoardTabbar";
import { TRANSPORT_SEARCH_OPTIONS } from "../../constants";

const KeyButton = ({ k, handleClick, disabled = false, sx }) => {
  return (
    <Button
      size="large"
      variant="contained"
      sx={{ ...buttonSx, ...sx }}
      onClick={() => handleClick(k)}
      disabled={disabled}
      disableRipple
    >
      {k === "b" ? (
        <BackspaceOutlinedIcon />
      ) : k === "c" ? (
        <DoNotDisturbOnOutlinedIcon />
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
            sx={numberSx}
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
              sx={alphabetSx}
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
    <Box sx={rootSx} padding={padding}>
      <Box sx={numPadContainerSx} padding={padding}>
        <RouteNumPad possibleChar={possibleChar} />
      </Box>
      <Box sx={alphabetPadContainerSx} padding={padding}>
        <RouteAlphabetPad possibleChar={possibleChar} />
      </Box>
    </Box>
  );
};

export default RouteInputPad;

const rootSx: SxProps<Theme> = {
  zIndex: 0,
  background: (theme) => theme.palette.background.default,
  display: "flex",
  flexDirection: "row",
  // TODO: increase to 258px or enable scroll
  height: "248px",
  justifyContent: "space-around",
};

const buttonSx: SxProps<Theme> = {
  background: (theme) => theme.palette.background.paper,
  color: (theme) => theme.palette.text.primary,
  width: "100%",
  fontSize: "1.8em",
  borderRadius: "unset",
  "&:selected": {
    color: (theme) => theme.palette.text.primary,
  },
  "&:hover": {
    backgroundColor: (theme) => theme.palette.background.paper,
  },
};

const numberSx: SxProps<Theme> = {
  height: "62px",
};

const alphabetSx: SxProps<Theme> = {
  height: "52px",
};

const alphabetPadContainerSx: SxProps<Theme> = {
  width: "20%",
  height: "246px",
  overflowX: "hidden",
  overflowY: "scroll",
};

const numPadContainerSx: SxProps<Theme> = {
  width: "72%",
};

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
