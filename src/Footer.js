import React, { useContext } from 'react'
import {
  BottomNavigation,
  BottomNavigationAction
} from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import TimerIcon from '@material-ui/icons/Timer'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AppContext from './AppContext'

const Footer = () => {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const { selectedRoute } = useContext ( AppContext ) 
  
  return (
    <BottomNavigation
      value={location.pathname}
      showLabels={true}
    >
      <BottomNavigationAction 
        label={t("搜尋")}
        component={Link}
        to={`/${i18n.language}/search`}
        value={`/${i18n.language}/search`}
        icon={<SearchIcon />} 
      />
      <BottomNavigationAction
       label={selectedRoute.split('+')[0]}
       component={Link}
       to={`/${i18n.language}/route/${selectedRoute}`}
       value={`/${i18n.language}/route/${selectedRoute}`}
       icon={<TimerIcon />} 
      />
    </BottomNavigation>
  )
}

export default Footer