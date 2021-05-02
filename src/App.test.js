import { render, screen } from '@testing-library/react';
import App from './App';
import { AppContextProvider } from './AppContext'
import './i18n'

test('renders App', () => {
  render(
    <AppContextProvider>
      <App />
    </AppContextProvider>
  );
  const initializingElement = screen.getByText(/初始設定/);
  expect(initializingElement).toBeInTheDocument();
});
