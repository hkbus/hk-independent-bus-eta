import React, { useContext } from "react"
import {
  Input,
  Tabs,
  Tab,
  Toolbar,
  Typography
} from "@material-ui/core"
import { withStyles, makeStyles } from '@material-ui/core/styles'
import { useLocation, useHistory, useRouteMatch } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AppContext from '../../AppContext'
import { vibrate, checkMobile } from '../../utils'

const Header = (props) => {
  const { searchRoute, setSearchRoute } = useContext( AppContext )
  
  const { path } = useRouteMatch()
  const { t, i18n } = useTranslation()
  const classes = useStyles()
  let location = useLocation()
  const history = useHistory()

  const handleLanguageChange = lang => {
    vibrate(1)
    history.replace( location.pathname.replace('/'+i18n.language+'/', '/'+lang+'/') )
    i18n.changeLanguage(lang)
  }

  return (
    <Toolbar
      className={classes.toolbar}
    >
      <div onClick={() => {
          vibrate(1)
          history.push(`/${i18n.language}/search`)}
        }
      >
        <Typography component="h1" variant='subtitle2'>巴士到站預報</Typography>
      </div> 
      <Input 
        className={classes.searchRouteInput}
        type="text"
        value={searchRoute}
        placeholder={t('巴士線')}
        onChange={e => setSearchRoute(e.target.value)}
        onFocus={e => {
          vibrate(1)
          if ( checkMobile() ) {
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
        <LanguageTab value="en" label="En" />
        <LanguageTab value="zh" label="繁" />
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
