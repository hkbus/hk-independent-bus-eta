import { SxProps, Theme } from "@mui/material";

export const inputSx: SxProps<Theme> = {
  "& input::before": {
    borderBottom: (theme) => `1px ${theme.palette.text.primary} solid`,
  },
  "&.Mui-focused": {
    "::after": {
      borderBottomColor: ({ palette }) =>
        palette.mode === "dark" ? palette.primary.main : palette.text.primary,
    },
  },
};
