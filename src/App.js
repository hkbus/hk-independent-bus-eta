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
  Container,
  CssBaseline
} from '@material-ui/core'
import Header from './components/Header'
import RouteBoard from './components/RouteBoard'
import RouteEta from './components/RouteEta'
import AppContext from './AppContext'
import Footer from './Footer'

const PageSwitch = () => {
  const { path } = useRouteMatch()
  return (
    <Switch>
      <Route path={`${path}/route/:id?`}>
        <RouteEta />
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
  const { routeList, stopList } = useContext( AppContext )
  if ( routeList == null || stopList == null ) {
    return (
      <>Loading</>
    )
  } 
  return (
    <MuiThemeProvider theme={Theme}>
      <Container maxWidth='xs' disableGutters>
        <Router basename={process.env.PUBLIC_URL}>
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
      default: "yellow"
    }
  }
})
