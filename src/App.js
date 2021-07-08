import './App.css'
import { 
  MuiThemeProvider, 
  unstable_createMuiStrictModeTheme as createMuiTheme 
} from '@material-ui/core/styles'
import React, { useContext } from 'react'
import {
  BrowserRouter as Router,
  Redirect,
  Switch,
  Route,
  useRouteMatch
} from "react-router-dom";
import {
  CircularProgress,
  Container,
  CssBaseline
} from '@material-ui/core'
import {
  makeStyles
} from '@material-ui/core/styles'
import Header from './components/layout/Header'
import Home from './components/Home'
import RouteBoard from './components/RouteBoard'
import RouteEta from './components/RouteEta'
import Settings from './components/Settings'
import AppContext from './AppContext'
import Footer from './components/layout/Footer'
import { isEmptyObj } from './utils'

const PageSwitch = () => {
  const { path } = useRouteMatch()
  const { db: {routeList} } = useContext(AppContext)
  return (
    <Switch>
      <Route path={`${path}/route/:id/:panel?`}>
        {!isEmptyObj(routeList) ? <RouteEta /> : <CircularProgress size={40} />}
      </Route>
      <Route path={`${path}/settings`}>
        <Settings />
      </Route>      
      <Route path={`${path}/search`}>
        <RouteBoard />
      </Route>
      <Route path={`${path}`}>
        <Home />
      </Route>
    </Switch>
  )
}

const App = () => { 
  const { colorMode } = useContext( AppContext )
  const classes = useStyles()

  return (
    <MuiThemeProvider theme={colorMode === 'dark' ? DarkTheme : LightTheme}>
      <Container maxWidth='xs' disableGutters className={classes.container}>
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
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100vh'
  },
  loadingTextContainer: {
    background: theme.palette.background.default,
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