import { act, render, screen } from '@testing-library/react';
import App from './App';
import { DbProvider } from './DbContext'
import { AppContextProvider } from './AppContext'
import { initDb, fetchDbFunc } from './db'
import './i18n'

test('renders App', async () => {
  await fetchDbFunc().then((db) => {
    Object.keys(db).forEach(k => initDb[k] = db[k])
    Object.freeze(initDb)
  })
  act(() => 
    render(
      <DbProvider>
        <AppContextProvider>
          <App />
        </AppContextProvider>
      </DbProvider>
    )
  );
  const initializingElement = screen.getByText(/繁/);
  expect(initializingElement).toBeInTheDocument();
});
