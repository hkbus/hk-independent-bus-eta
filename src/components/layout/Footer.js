import React, { useContext, useMemo } from 'react'
import {
  BottomNavigation,
  BottomNavigationAction
} from '@material-ui/core'
import HomeIcon from '@material-ui/icons/Home'
import SearchIcon from '@material-ui/icons/Search'
import NearMeIcon from '@material-ui/icons/NearMe'
import TimerIcon from '@material-ui/icons/Timer'
import SettingsIcon from '@material-ui/icons/Settings';
import { Link, useLocation, useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AppContext from '../../AppContext'
import {
  makeStyles
} from '@material-ui/core/styles'
import { vibrate } from '../../utils'


const Footer = () => {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const { selectedRoute, colorMode } = useContext ( AppContext ) 

  const history = useHistory()
  const handleClick = (link, e) => {
    e.preventDefault()
    vibrate(1)
    setTimeout(() => history.push(link), 0)
  }

  useStyles()

  return useMemo(() => (
    <BottomNavigation
      value={location.pathname.replace(/(.*)\/[0-9]*?$/, "$1")}
      showLabels={true}
      classes={{root: "footer-root"}}
    >
      <BottomNavigationAction
        label={t("常用")}
        component={Link}
        to={`/${i18n.language}`}
        onClick={(e) => handleClick(`/${i18n.language}`, e)}
        value={`/${i18n.language}`}
        icon={<HomeIcon />}
        classes={{
          root: "footer-actionItem",
          selected: "footer-selected"
        }}
      />
      <BottomNavigationAction 
        label={t("搜尋")}
        component={Link}
        to={`/${i18n.language}/board`}
        onClick={(e) => handleClick(`/${i18n.language}/board`, e)}
        value={`/${i18n.language}/board`}
        icon={<SearchIcon />} 
        classes={{
          root: "footer-actionItem",
          selected: "footer-selected"
        }}
      />
      <BottomNavigationAction
       label={selectedRoute.split('-')[0]}
       component={Link}
       to={`/${i18n.language}/route/${selectedRoute.replace(/(.*)\/.*$/, "$1").toLowerCase()}`}
       onClick={(e) => handleClick(`/${i18n.language}/route/${selectedRoute.toLowerCase()}`, e)}
       value={`/${i18n.language}/route/${selectedRoute.replace(/(.*)\/.*$/, "$1").toLowerCase()}`}
       icon={<TimerIcon />} 
       style={{textTransform: 'uppercase'}}
       classes={{
        root: "footer-actionItem",
        selected: "footer-selected"
       }}
      />
      <BottomNavigationAction 
        label={t("規劃路線")}
        component={Link}
        to={`/${i18n.language}/search`}
        onClick={(e) => handleClick(`/${i18n.language}/search`, e)}
        value={`/${i18n.language}/search`}
        icon={<NearMeIcon />} 
        classes={{
          root: "footer-actionItem",
          selected: "footer-selected"
        }}
      />
      <BottomNavigationAction
       label={t("設定")}
       component={Link}
       to={`/${i18n.language}/settings`}
       onClick={(e) => handleClick(`/${i18n.language}/settings`, e)}
       value={`/${i18n.language}/settings`}
       icon={<SettingsIcon />} 
       classes={{
        root: "footer-actionItem",
        selected: "footer-selected"
       }}
      />
    </BottomNavigation>
    // eslint-disable-next-line
  ), [location.pathname, i18n.langauage, colorMode])
}


export default Footer

const useStyles = makeStyles(theme => ({
  '@global': {
    ".footer-root": {
      background: theme.palette.type === 'dark' ? theme.palette.background.default: theme.palette.primary.main,
      position: "sticky",
      bottom: "0",
    },
    '.Mui-selected.footer-selected': {
      color: theme.palette.type === 'dark' ? theme.palette.primary.main: theme.palette.text.primary,
      width: "20vw"
    },
  }
}))
