import React, { useContext } from "react"
import {
  Input,
  Tabs,
  Tab,
  Toolbar,
  Typography
} from "@material-ui/core"
import { withStyles, makeStyles } from '@material-ui/core/styles'
import { Link, useLocation, useHistory, useRouteMatch } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AppContext from '../../AppContext'
import { vibrate, checkMobile } from '../../utils'

const Header = (props) => {
  const { searchRoute, setSearchRoute, routeList } = useContext( AppContext )
  
  const { path } = useRouteMatch()
  const { t, i18n } = useTranslation()
  const classes = useStyles()
  let location = useLocation()
  const history = useHistory()

  const handleLanguageChange = lang => {
    vibrate(1)
    history.replace( location.pathname.replace('/'+i18n.language, '/'+lang) )
    i18n.changeLanguage(lang)
  }

  return (
    <Toolbar
      className={classes.toolbar}
    >
      <Link 
        to={`/${i18n.language}`}
        onClick={(e) => {
          e.preventDefault()
          vibrate(1)
          history.push(`/${i18n.language}/search`)
        }}
      >
        <Typography variant='subtitle2'>{t('巴士到站預報')}</Typography>
      </Link> 
      <Input 
        id="searchInput"
        className={classes.searchRouteInput}
        type="text"
        value={searchRoute}
        placeholder={t('巴士線')}
        onChange={e => {
          if ( e.target.value in routeList || e.target.value.replace(/_/g, ' ') in routeList) {
            document.activeElement.blur()
            history.push(`/${i18n.language}/route/${e.target.value.replace(/ /g, '_')}`)
          }
          setSearchRoute(e.target.value.replace(/_/g, ' '))
        }}
        onFocus={e => {
          vibrate(1)
          if ( navigator.userAgent !== 'prerendering' && checkMobile() ) {
            document.activeElement.blur()
          }
          history.replace(`/${i18n.language}/search`)
        }}
        disabled={path.includes('route')}
      />
      <LanguageTabs
          value={i18n.language}
          onChange={(e, v) => handleLanguageChange(v)}
        >
        <LanguageTab 
          id="en-selector" value="en" label="En"
          component={Link} to={`${window.location.pathname.replace('/zh', '/en')}`}  
          onClick={(e) => e.preventDefault()}
        />
        <LanguageTab 
          id="zh-selector" value="zh" label="繁" 
          component={Link} to={`${window.location.pathname.replace('/en', '/zh')}`}  
          onClick={(e) => e.preventDefault()}
        />
      </LanguageTabs>
    </Toolbar>
  );
}

const useStyles = makeStyles(theme => ({
  toolbar: {
    '& a': {
      color: 'black',
      textDecoration: 'none',
    },
    display: 'flex',
    justifyContent: 'space-between',
    zIndex: theme.zIndex.drawer * 2
  },
  searchRouteInput: {
    maxWidth: '50px',
    "& input": {
      textAlign: 'center'
    }
  }
}))

const LanguageTabs = withStyles({
  root: {
    borderBottom: 'none',
    minHeight: 24
  },
  indicator: {
    backgroundColor: 'transparent'
  }
})(Tabs);

const LanguageTab = withStyles((theme) => ({
  root: {
    textTransform: 'none',
    minWidth: 36,
    fontWeight: 900,
    marginRight: theme.spacing(0),
    fontSize: '15px',
    opacity: 1,
    padding: '6px 6px'
  },
  selected:{
    '& > .MuiTab-wrapper':{
      color: '#3B3C45',
      backgroundColor: '#FEFBFA'
    }
  },
  wrapper: {
    color: '#3B3C45',
    borderRadius: '30px',
    padding: '2px 10px 0px 10px'
  }
}))((props) => <Tab disableRipple {...props} />);

export default Header;
