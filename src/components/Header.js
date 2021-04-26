import React, { useContext } from "react"
import {
  Input,
  Tabs,
  Tab,
  Toolbar,
  Typography
} from "@material-ui/core"
import { withStyles, makeStyles } from '@material-ui/core/styles'
import { useLocation, useHistory, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useRouteMatch } from 'react-router-dom'
import AppContext from '../AppContext'

const Header = (props) => {
  const { searchRoute, setSearchRoute } = useContext( AppContext )
  
  const { path } = useRouteMatch()
  const { t, i18n } = useTranslation()
  const classes = useStyles()
  let location = useLocation()
  const history = useHistory()

  const handleLanguageChange = lang => {
    history.replace( location.pathname.replace('/'+i18n.language+'/', '/'+lang+'/') )
    i18n.changeLanguage(lang)
  }

  return (
    <Toolbar
      className={classes.toolbar}
    >
      <div className={classes.tabsContainer}>
        <Link
          to={{
            pathname: `/${i18n.language}/search`
          }}
        >
          <Typography variant="h6">香港</Typography>
          <Typography variant='subtitle2'>獨立巴士預報</Typography>
        </Link>
      </div>
      <Input 
        type="text"
        value={searchRoute}
        placeholder={t('搜尋巴士線')}
        onChange={e => setSearchRoute(e.target.value)}
        disabled={path.includes('route')}
      />
      <div
        className={classes.tabsContainer}
      >
        <LanguageTabs
            value={i18n.language}
            onChange={(e, v) => handleLanguageChange(v)}
          >
          <LanguageTab value="en" label="En" />
          <LanguageTab value="zh" label="繁" />
        </LanguageTabs>
      </div>
    </Toolbar>
  );
}

const useStyles = makeStyles(theme => ({
  tabsContainer: {
    display: 'flex',
    [theme.breakpoints.down('sm')]:{
      flexDirection: "row-reverse"
    }
  },
  toolbar: {
    '& a': {
      color: 'black',
      textDecoration: 'none',
    },
    display: 'flex',
    justifyContent: 'space-between',
    zIndex: theme.zIndex.drawer * 2
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
  },
}))((props) => <Tab disableRipple {...props} />);

export default Header;