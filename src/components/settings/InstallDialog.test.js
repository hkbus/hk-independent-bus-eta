import { act, render, screen } from "@testing-library/react";
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";
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
