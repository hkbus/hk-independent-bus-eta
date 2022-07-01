import { useContext } from "react";
import AppContext from "../../AppContext";
import CloseIcon from "@mui/icons-material/Close";
import { vibrate } from "../../utils";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import RouteRow from "./RouteRow";
import { styled } from "@mui/material/styles";

const RouteSearchHistory = () => {
  const {
    db: { routeList },
    vibrateDuration,
    routeSearchHistory,
    removeSearchHistoryByRouteId,
  } = useContext(AppContext);

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleClick = (e, routeId) => {
    e.preventDefault();
    vibrate(vibrateDuration);
    setTimeout(() => {
      navigate(`/${i18n.language}/route/${routeId.toLowerCase()}`);
    }, 0);
  };

  const handleCloseButtonClick = (e, routeId) => {
    e.preventDefault();
    removeSearchHistoryByRouteId(routeId);
  };

  const routeSearchHistoryList = Object.entries(routeList).filter(([routeNo]) =>
    routeSearchHistory.includes(routeNo.toUpperCase())
  );

  return (
    <StyledRouteSearchHistory>
      {Array.isArray(routeSearchHistoryList) &&
        routeSearchHistoryList.length > 0 && (
          <div className={classes.title}>{t("搜尋記錄")}</div>
        )}
      <div className={classes.historyItems}>
        {routeSearchHistoryList.map((route, index) => {
          return (
            <div className={classes.historyItem} key={index}>
              <RouteRow
                handleClick={(e) => handleClick(e, route[0])}
                route={route}
                style={{}}
              />
              <CloseIcon
                className={classes.closeIcon}
                onClick={(e) => handleCloseButtonClick(e, route[0])}
              />
            </div>
          );
        })}
      </div>
    </StyledRouteSearchHistory>
  );
};

export default RouteSearchHistory;

const PREFIX = "routeSearchHistory";

const classes = {
  title: `${PREFIX}-title`,
  historyItems: `${PREFIX}-historyItems`,
  historyItem: `${PREFIX}-historyItem`,
  closeIconWrapper: `${PREFIX}-closeIconWrapper`,
  closeIcon: `${PREFIX}-closeIcon`,
};

const StyledRouteSearchHistory = styled("div")(({ theme }) => ({
  [`& .${classes.title}`]: {
    padding: `0 ${theme.spacing(2)} ${theme.spacing(0.5)}`,
    fontSize: "0.75rem",
  },
  [`& .${classes.historyItems}`]: {
    background:
      theme.palette.mode === "dark"
        ? theme.palette.background.default
        : "white",
  },
  [`& .${classes.historyItem}`]: {
    display: "grid",
    gridTemplateColumns: "1fr max-content",
    alignItems: "center",
    borderBottom: `1px solid ${theme.palette.primary.contrastText}`,
  },
  [`& .${classes.closeIcon}`]: {
    marginRight: theme.spacing(2),
    cursor: "pointer",
  },
}));
