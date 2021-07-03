import './App.css'
import { 
  MuiThemeProvider, 
  unstable_createMuiStrictModeTheme as createMuiTheme 
} from '@material-ui/core/styles'
import React, { useContext } from 'react'
import {
  HashRouter as Router,
  Redirect,
  Switch,
  Route,
  useRouteMatch
} from "react-router-dom";
import {
  CircularProgress,
  Container,
  CssBaseline,
  Paper,
  Typography
} from '@material-ui/core'
import {
  makeStyles
} from '@material-ui/core/styles'
import { useTranslation } from 'react-i18next'
import Header from './components/layout/Header'
import Home from './components/Home'
import RouteBoard from './components/RouteBoard'
import RouteEta from './components/RouteEta'
import Settings from './components/Settings'
import AppContext from './AppContext'
import Footer from './components/layout/Footer'

const PageSwitch = () => {
  const { path } = useRouteMatch()
  return (
    <Switch>
      <Route path={`${path}/route/:id/:panel?`}>
        <RouteEta />
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
  const { routeList, stopList, stopMap } = useContext( AppContext )
  const { t } = useTranslation()
  const classes = useStyles()
  
  if ( routeList == null || stopList == null || stopMap == null ) {
    return (
      <Container maxWidth='xs' disableGutters className={classes.loadingContainer}>
        <CircularProgress size={40} />
        <br />
        <br />
        <Paper className={classes.loadingTextContainer} elevation={0}>
          { stopList == null ? 
              <>
                <Typography variant="subtitle2" align="center">{t('初始設定')}...</Typography>
                <Typography variant="subtitle2" align="center">{t('正在更新巴士路線資料')}...</Typography>
              </>      
          : <>{t('啟動中')}</>
          }
        </Paper>
      </Container>
    )
  } 

  return (
    <MuiThemeProvider theme={Theme}>
      <Container maxWidth='xs' disableGutters className={classes.container}>
        <Router>
          <Route exact path="/">
            <Redirect to="/zh/" />
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

const Theme = createMuiTheme({
  typography: {
    fontFamily: "Noto Sans TC, Chivo, sans-serif"
  },
  palette: {
    background: {
      default: "#ffff90" // yellow
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

const useStyles = makeStyles( theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100vh'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  }
}))
