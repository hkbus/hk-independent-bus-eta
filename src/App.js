import './App.css'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
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
import Header from './Header'
import RouteBoard from './components/RouteBoard'
import RouteEta from './components/RouteEta'
import Settings from './components/Settings'
import AppContext from './AppContext'
import Footer from './Footer'
import Countdown from 'react-countdown'

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
    </Switch>
  )
}

const App = () => {
  /*
  navigator.geolocation.getCurrentPosition(position => {
    console.log(position.coords.latitude, position.coords.longitude)
  })
  */
  
  const classes = useStyles()
  const { routeList, stopList } = useContext( AppContext )
  if ( routeList == null || stopList == null ) {
    return (
      <Container maxWidth='xs' disableGutters className={classes.loadingContainer}>
        <CircularProgress size={40} />
        <br />
        <br />
        <Paper className={classes.loadingTextContainer} elevation={0}>
          <Countdown 
            date={Date.now() + 20000}
            renderer={({seconds, completed}) => {
              if ( completed ) {
                return <Typography variant="subtitle2" align="center">介面開啟中...</Typography>
              } else {
                return (
                  <>
                    <Typography variant="subtitle2" align="center">初始設定...</Typography>
                    <Typography variant="subtitle2" align="center">正在更新巴士路線資料...</Typography>
                    <Typography variant="subtitle2" align="center">約需{seconds}秒</Typography>
                  </>
                )
              }
            }}
          />
            
        </Paper>
      </Container>
    )
  } 

  return (
    <MuiThemeProvider theme={Theme}>
      <Container maxWidth='xs' disableGutters className={classes.container}>
        <Router>
          <Route exact path="/">
            <Redirect to="/zh/search" />
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
      default: "#ffff00" // yellow
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
  },
  loadingText: {

  }
}))
