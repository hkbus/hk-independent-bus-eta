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
  const classes = useStyles()
  const history = useHistory()
  const handleClick = (link, e) => {
    e.preventDefault()
    vibrate(1)
    setTimeout(() => history.push(link), 0)
  }

  return (
    <BottomNavigation
      value={location.pathname}
      showLabels={true}
      className={classes.root}
    >
      <BottomNavigationAction
        label={t("常用")}
        component={Link}
        to={`/${i18n.language}`}
        onClick={(e) => handleClick(`/${i18n.language}`, e)}
        value={`/${i18n.language}`}
        icon={<HomeIcon />}
      />
      <BottomNavigationAction 
        label={t("搜尋")}
        component={Link}
        to={`/${i18n.language}/search`}
        onClick={(e) => handleClick(`/${i18n.language}/search`, e)}
        value={`/${i18n.language}/search`}
        icon={<SearchIcon />} 
      />
      <BottomNavigationAction
       label={selectedRoute.split('+')[0]}
       component={Link}
       to={`/${i18n.language}/route/${selectedRoute}`}
       onClick={(e) => handleClick(`/${i18n.language}/route/${selectedRoute}`, e)}
       value={`/${i18n.language}/route/${selectedRoute}`}
       icon={<TimerIcon />} 
      />
      <BottomNavigationAction
       label={t("設定")}
       component={Link}
       to={`/${i18n.language}/settings`}
       onClick={(e) => handleClick(`/${i18n.language}/settings`, e)}
       value={`/${i18n.language}/settings`}
       icon={<SettingsIcon />} 
      />
    </BottomNavigation>
  )
}

export default Footer

const useStyles = makeStyles(theme => ({
  root: {
    position: "sticky",
    bottom: "0"
  }
}))