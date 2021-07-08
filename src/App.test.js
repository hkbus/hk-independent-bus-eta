import { render, screen } from '@testing-library/react';
import App from './App';
import { DbProvider } from './DbContext'
import { AppContextProvider } from './AppContext'
import './i18n'

test('renders App', () => {
  render(
    <DbProvider>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </DbProvider>
  );
  const initializingElement = screen.getByText(/繁/);
  expect(initializingElement).toBeInTheDocument();
});
