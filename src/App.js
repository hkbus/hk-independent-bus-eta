import React, { useContext } from 'react'
import loadable from '@loadable/component'
import './App.css'
import { 
  MuiThemeProvider, 
  unstable_createMuiStrictModeTheme as createMuiTheme 
} from '@material-ui/core/styles'
import {
  BrowserRouter as Router,
  Redirect,
  Switch,
  Route,
  useRouteMatch
} from "react-router-dom";
import {
  Container,
  CssBaseline
} from '@material-ui/core'
import {
  makeStyles
} from '@material-ui/core/styles'
import AppContext from './AppContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import RouteEta from './pages/RouteEta'
import { SearchContextProvider } from './SearchContext'
const RouteBoard = loadable(() =>  import('./pages/RouteBoard'))
const RouteSearch = loadable(() => import('./pages/RouteSearch'))
const Settings = loadable(() => import('./pages/Settings'))

const PageSwitch = () => {
  const { path } = useRouteMatch()

  return (
    <SearchContextProvider>
      <Switch>
        <Route path={`${path}/route/:id/:panel?`}>
          <RouteEta />
        </Route>
        <Route path={`${path}/settings`}>
          <Settings />
        </Route>
        <Route path={`${path}/board`}>
          <RouteBoard />
        </Route>
        <Route path={`${path}/search`}>
          <RouteSearch />
        </Route>
        <Route path={`${path}`}>
          <Home />
        </Route>
      </Switch>
    </SearchContextProvider>
  )
}

const App = () => { 
  const { colorMode } = useContext( AppContext )
  useStyles()

  return (
    <MuiThemeProvider theme={colorMode === 'dark' ? DarkTheme : LightTheme}>
      <Container maxWidth='xs' disableGutters className={"AppContainer"}>
        <Router>
          <Route exact path="/">
            <Redirect to="/zh" />
          </Route>
          <Route path="/:lang">
            <CssBaseline />
            <Header />
            <PageSwitch />
            <Footer />
          </Route>
        </Router>
      </Container>
    </MuiThemeProvider>
  );
}
 
export default App;

const useStyles = makeStyles( theme => ({
  "@global":{
    ".AppContainer": {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100vh'
    }
  }
}))

const LightTheme = createMuiTheme({
  typography: {
    fontFamily: "Noto Sans TC, Chivo, sans-serif",
  },
  palette: {
    type: 'light',
    background: {
      default: '#fedb00'
    },
    primary: {
      main: '#fedb00' // yellow
    },
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        html: {
          userSelect: 'none'
        }
      }
    }
  }
}, ['light'])

const DarkTheme = createMuiTheme({
  typography: {
    fontFamily: "Noto Sans TC, Chivo, sans-serif",
  },
  palette: {
    type: 'dark',
    primary: {
      main: '#fedb00' // yellow
    },
    background: {
      default: '#000'
    }
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        html: {
          userSelect: 'none'
        }
      }
    }
  }
})