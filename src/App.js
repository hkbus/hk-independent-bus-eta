import './App.css'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import React, { useContext } from 'react'
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
import Header from './components/Header'
import RouteBoard from './components/RouteBoard'
import RouteEta from './components/RouteEta'
import AppContext from './AppContext'

const PageSwitch = () => {
  const { path } = useRouteMatch()
  return (
    <Switch>
      <Route path={`${path}/route/:id?`}>
        <RouteEta />
      </Route>
      <Route >
        <RouteBoard />
      </Route>
    </Switch>
  )
}

const App = () => {
  navigator.geolocation.getCurrentPosition(position => {
    console.log(position.coords.latitude, position.coords.longitude)
  })
  const { routeList } = useContext( AppContext )
  if ( routeList == null ) {
    return (
      <>Loading</>
    )
  } 
  return (
    <MuiThemeProvider theme={Theme}>
      <Container maxWidth='xs' disableGutters>
        <Router>
          <Route exact path="/">
            <Redirect to="/zh/" />
          </Route>
          <Route path="/:lang">
            <CssBaseline />
            <Header />
            <PageSwitch />
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
