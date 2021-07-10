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
import { vibrate, toProperCase } from '../../utils'
import RouteNo from './RouteNo'

const RouteInfo = ( {route} ) => {
  const { t, i18n } = useTranslation()
  const classes = useStyles()

  return (
    <Typography component="h3" variant="body1" className={classes.routeInfo}>
      <div>
        <div className={classes.fromToWrapper}>
          <span className={classes.fromToText}>{`${t('往')} `}</span>
          <b>{toProperCase(route.dest[i18n.language])}</b>
        </div>
        <div className={classes.fromToWrapper}>
          <span className={classes.fromToText}>{`${route.nlbId ? t('由') : ''} `}</span>
          <b>{route.nlbId ? toProperCase(route.orig[i18n.language]) : ''}</b>
        </div>
      </div>
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
      <Card className={classes.card} variant="outlined" key={route[0]} style={style} square>
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
  card: {
    background: theme.palette.type === 'dark' ? theme.palette.background.default : 'white',
  },
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
    fontSize: '0.95rem',
    marginRight: theme.spacing(0.5)
  },
  specialTrip: {
    fontSize: '0.6rem',
    marginLeft: '8px'
  }
}))