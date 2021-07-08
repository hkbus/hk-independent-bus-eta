import React, { useContext } from 'react'
import {
  BottomNavigation,
  BottomNavigationAction
} from '@material-ui/core'
import HomeIcon from '@material-ui/icons/Home'
import SearchIcon from '@material-ui/icons/Search'
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
  const { selectedRoute } = useContext ( AppContext ) 

  const history = useHistory()
  const handleClick = (link, e) => {
    e.preventDefault()
    vibrate(1)
    setTimeout(() => history.push(link), 0)
  }

  const classes = useStyles()

  return (
    <BottomNavigation
      value={location.pathname.replace(/(.*)\/[0-9]*?$/, "$1")}
      showLabels={true}
      classes={{
        root: classes.root,
      }}
    >
      <BottomNavigationAction
        label={t("常用")}
        component={Link}
        to={`/${i18n.language}`}
        onClick={(e) => handleClick(`/${i18n.language}`, e)}
        value={`/${i18n.language}`}
        icon={<HomeIcon />}
        classes={{
          root: classes.actionItem,
          selected: classes.selected
        }}
      />
      <BottomNavigationAction 
        label={t("搜尋")}
        component={Link}
        to={`/${i18n.language}/search`}
        onClick={(e) => handleClick(`/${i18n.language}/search`, e)}
        value={`/${i18n.language}/search`}
        icon={<SearchIcon />} 
        classes={{
          root: classes.actionItem,
          selected: classes.selected
        }}
      />
      <BottomNavigationAction
       label={selectedRoute.split('-')[0]}
       component={Link}
       to={`/${i18n.language}/route/${selectedRoute.replace(/(.*)\/.*$/, "$1").toLowerCase()}`}
       onClick={(e) => handleClick(`/${i18n.language}/route/${selectedRoute.toLowerCase()}`, e)}
       value={`/${i18n.language}/route/${selectedRoute.replace(/(.*)\/.*$/, "$1").toLowerCase()}`}
       icon={<TimerIcon />} 
       classes={{
        root: classes.actionItem,
        selected: classes.selected
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
        root: classes.actionItem,
        selected: classes.selected
       }}
      />
    </BottomNavigation>
  )
}

export default Footer

const useStyles = makeStyles(theme => ({
  root: {
    background: theme.palette.type === 'dark' ? theme.palette.background.main: theme.palette.primary.main,
    // background: theme.palette.primary.main,
    // color: theme.palette.text.secondary,
    position: "sticky",
    bottom: "0",
  },
  actionItem: {
    '&$selected': {
      color: theme.palette.type === 'dark' ? theme.palette.primary.main: theme.palette.text.primary,
    },
  },
  selected: {}
}))