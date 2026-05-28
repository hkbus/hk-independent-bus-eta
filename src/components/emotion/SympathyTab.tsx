import { Box, SxProps, Theme } from "@mui/material";
import { useContext } from "react";
import AppContext from "../../context/AppContext";

const SYMPATHY_IMAGE_COUNT = 34;

const SympathyTab = () => {
  const { openUrl } = useContext(AppContext);
  const startDate = new Date("1991-12-02");
  const endDate = new Date(); // Or specify a target end date

  const differenceInMs = endDate.getTime() - startDate.getTime();
  const imgIdx =
    `${(Math.floor(differenceInMs / (1000 * 60 * 60 * 24)) % SYMPATHY_IMAGE_COUNT) + 2}`.padStart(
      3,
      "0"
    );

  return (
    <Box sx={rootSx}>
      <img src={`/img/sympathy/${imgIdx}.png`} style={{ width: "100%" }} />
      <img
        src={`/img/sympathy/logo.png`}
        style={{
          width: 56,
          height: 56,
          marginTop: -80,
        }}
        onClick={() => openUrl("https://www.ediversity.org/")}
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          gap: 1,
        }}
      >
        <img
          src={`/img/sympathy/text.png`}
          style={{
            width: 231,
            height: 28,
          }}
        />
        <img
          src={`/img/sympathy/button.png`}
          style={{
            width: 28,
            height: 28,
          }}
          onClick={() => openUrl("https://wa.me/85253634035")}
        />
      </Box>
    </Box>
  );
};

export default SympathyTab;

const rootSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  flex: 1,
  gap: 4,
  p: 2,
  background: "#fff8da",
};
