import { render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import "../../i18n";
import InstallDialog from "./InstallDialog";

test("renders App", async () => {
  const theme = createTheme();
  render(
    <ThemeProvider theme={theme}>
      <InstallDialog open />
    </ThemeProvider>
  );
  const initializingElement = screen.getByText(/App/);
  expect(initializingElement).toBeInTheDocument();
});
