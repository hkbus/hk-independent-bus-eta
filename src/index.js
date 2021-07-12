import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { DbProvider } from './DbContext'
import { AppContextProvider } from './AppContext'
import './i18n'
import { initDb, fetchDbFunc } from './db'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import reportWebVitals from './reportWebVitals';

const isHuman = () => {
  const agents = ['googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot', 'facebot', 'ia_archiver', 'sitecheckerbotcrawler']
  return !navigator.userAgent.match(new RegExp(agents.join('|'), 'i'))
}

// content is render only for human
if (isHuman()){
  // performance consideration
  // the app is highly orientated by the routes data
  // fetching should be done to avoid unnecessary rendering
  fetchDbFunc().then((db) => {
    Object.keys(db).forEach(k => initDb[k] = db[k])
    Object.freeze(initDb)

    // Target: render only if development or prerendering or in registered app 
    if ( 
      process.env.NODE_ENV === 'development' || 
      navigator.userAgent === 'prerendering' || 
      !document.querySelector('link[rel="canonical"]').href.endsWith(window.location.pathname)
    ) {
      // remove prerendered style
      document.querySelector('style[prerender]').innerText = ''
      ReactDOM.render(
        <React.StrictMode>
          <DbProvider>
            <AppContextProvider>
              <App />
            </AppContextProvider>
          </DbProvider>
        </React.StrictMode>,
        document.getElementById('root')
      )
    } else {
      // hydrate in production
      ReactDOM.hydrate(
        <React.StrictMode>
          <DbProvider>
            <AppContextProvider>
              <App />
            </AppContextProvider>
          </DbProvider>
        </React.StrictMode>,
        document.getElementById('root'), 
        () => {
          document.querySelector('style[prerender]').innerText = ''
        }
      )
    }
  })

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: https://cra.link/PWA
  serviceWorkerRegistration.register();

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals();
}
