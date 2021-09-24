import { act, render, screen } from "@testing-library/react";
import { MuiThemeProvider, createTheme } from "@mui/material/styles";
import "../../i18n";
import InstallDialog from "./InstallDialog";

test("renders App", async () => {
  act(() => {
    const theme = createTheme();
    render(
      <MuiThemeProvider theme={theme}>
        <InstallDialog open />
      </MuiThemeProvider>
    );
  });
  const initializingElement = screen.getByText(/iOS/);
  expect(initializingElement).toBeInTheDocument();
});
