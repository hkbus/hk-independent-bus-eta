import { SxProps, Theme } from "@mui/material";

type CustomSxProps<T> = (theme: T, colorMode: string) => void;

export const dialogRootSx: CustomSxProps<Theme> = ({ palette }, colorMode) => {
  return {
    "& .MuiPaper-root": {
      width: "100%",
      marginTop: "90px",
      height: "calc(100vh - 100px)",
      border:
        colorMode === "dark" && `1px solid ${palette.background.contrast}`,
    },
    "& .MuiDialogContent-root": {
      padding: 0,
    },
  };
};

export const dialogTitleSx: SxProps<Theme> = {
  backgroundColor: (theme) =>
    theme.palette.mode === "dark"
      ? theme.palette.background.default
      : theme.palette.primary.main,
  color: (theme) =>
    theme.palette.mode === "dark"
      ? theme.palette.primary.main
      : theme.palette.text.primary,
};
