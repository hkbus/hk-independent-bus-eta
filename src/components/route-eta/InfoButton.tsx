import { useContext } from "react";
import { Button, SxProps, Theme } from "@mui/material";
import { Public as PublicIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";

const InfoButton = ({ routeId }: { routeId: string }) => {
  const { t } = useTranslation();
  const {
    db: { routeList },
  } = useContext(AppContext);
  const { url } = routeList[routeId];

  return (
    url && (
      <>
        <Button
          variant="text"
          aria-label="open-information"
          sx={buttonSx}
          size="small"
          startIcon={<PublicIcon />}
          onClick={() => window.open(url, "_blank")}
        >
          {t("資訊")}
        </Button>
      </>
    )
  );
};

export default InfoButton;

const buttonSx: SxProps<Theme> = {
  color: (theme) =>
    theme.palette.getContrastText(theme.palette.background.default),
  flexDirection: "column",
  justifyContent: "center",
  minWidth: "50px",
  "& > .MuiButton-label": {
    flexDirection: "column",
    justifyContent: "center",
  },
  "& > .MuiButton-startIcon": {
    margin: 0,
  },
};
