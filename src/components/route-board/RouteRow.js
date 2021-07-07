import React from 'react'
import {
  Card,
  CardActionArea,
  CardContent,
  Typography
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useTranslation } from 'react-i18next'
import { areEqual } from 'react-window'
import { Link, useHistory } from  'react-router-dom'
import { vibrate } from '../../utils'
import RouteNo from './RouteNo'

const RouteInfo = ( {route} ) => {
  const { t, i18n } = useTranslation()
  const classes = useStyles()

  return (
    <Typography component="h3" variant="body1" className={classes.routeInfo}>
    { route.nlbId ?
      <div>
        <div className={classes.fromToWrapper}>
          <Typography variant="subtitle2" color="textPrimary" component="h4" className={classes.fromToText}>{`${t('往')} `}</Typography>
          <Typography variant="h4" color="textPrimary" component="h4">{route.dest[i18n.language]}</Typography>
        </div>
        <div className={classes.fromToWrapper}>
          <Typography variant="subtitle2" color="textPrimary" component="h4" className={classes.fromToText}>{`${t('由')} `}</Typography>
          <Typography variant="h4" color="textPrimary" component="h4">{route.orig[i18n.language]}</Typography>
        </div>
      </div>
      : <div className={classes.fromToWrapper}>
          <Typography variant="subtitle2" color="textPrimary" component="h4" className={classes.fromToText}>{`${t('往')} `}</Typography>
          <Typography variant="h4" color="textPrimary" component="h4">{route.dest[i18n.language]}</Typography>
        </div>
    }
    </Typography>
  )
}

const RouteRow = React.memo(( {data, index, style} ) => {
  const { t, i18n } = useTranslation()
  const { routeList } = data
  const route = routeList[index]
  const [routeNo, serviceType] = route[0].split('-').slice(0,2)
  const classes = useStyles()
  const history = useHistory()
  const handleClick = (e) => {
    e.preventDefault()
    vibrate(1)
    setTimeout(() => {
      history.push(`/${i18n.language}/route/${route[0].toLowerCase()}`)
    }, 0)
  }

  return (
    <Link onClick={handleClick} to={`/${i18n.language}/route/${route[0].toLowerCase()}`}>
      <Card variant="outlined" key={route[0]} style={style} square>
        <CardActionArea>
          <CardContent className={classes.cardContent}>
            <div className={classes.busInfoContainer}>
              <div>
                <RouteNo routeNo={routeNo} />
                {serviceType >= 2 && <Typography variant="caption" className={classes.specialTrip}>{t('特別班')}</Typography>}
              </div>
              <Typography component="h4" variant="caption" className={classes.company}>
                  {route[1].co.map(co => t(co)).join('+')}
              </Typography>
            </div>
            <RouteInfo route={route[1]} />
          </CardContent>
        </CardActionArea>
      </Card>
    </Link>
  )
}, areEqual)

export default RouteRow

const useStyles = makeStyles (theme => ({
  cardContent: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '4px 16px',
  },
  busInfoContainer: {
    width: '25%'
  },
  routeInfo: {
    textAlign: 'left',
    fontSize: '1rem'
  },
  company: {
    color: theme.palette.text.secondary
  },
  fromToWrapper: {
    display: 'flex',
    alignItems: 'baseline',
  },
  fromToText: {
    marginRight: theme.spacing(0.5)
  },
  specialTrip: {
    fontSize: '0.6rem',
    marginLeft: '8px'
  }
}))