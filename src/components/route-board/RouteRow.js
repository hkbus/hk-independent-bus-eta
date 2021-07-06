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
import { useHistory } from  'react-router-dom'
import { vibrate } from '../../utils'
import RouteNo from './RouteNo'

const RouteInfo = ( {route} ) => {
  const { t, i18n } = useTranslation()
  const classes = useStyles()

  return (
    <div className={classes.routeInfo}>
    { route.nlbId ?
      <>
        <span className={classes.fromToText}>{`${t('往')} `}</span>
          <b>{route.dest[i18n.language]}</b>
          <br />
          <span className={classes.fromToText}>{`${t('由')} `}</span>
          <b>{route.orig[i18n.language]}</b>
      </>
      : <>
          <span className={classes.fromToText}>{`${t('往')} `}</span>
          <b>{route.dest[i18n.language]}</b>
        </>
    }
    </div>
  )
}

const RouteRow = React.memo(( {data, index, style} ) => {
  const { t, i18n } = useTranslation()
  const { routeList } = data
  const route = routeList[index]
  const [routeNo, service_type] = route[0].split('+').slice(0,2)
  const classes = useStyles()
  const history = useHistory()
  const handleClick = () => {
    vibrate(1)
    setTimeout(() => {
      history.push(`/${i18n.language}/route/${route[0].replace(/ /g,'_')}`)
    }, 0)
  }

  return (
    <div onClick={handleClick} >
      <Card variant="outlined" key={route[0]} style={style} square>
        <CardActionArea>
          <CardContent className={classes.cardContent}>
            <div className={classes.busInfoContainer}>
              <div>
                <RouteNo routeNo={routeNo} />
                {service_type >= 2 && <Typography variant="caption" className={classes.specialTrip}>{t('特別班次')}</Typography>}
              </div>
              <Typography variant="caption" className={classes.company}>
                  {route[1].co.map(co => t(co)).join('+')}
              </Typography>
            </div>
            <RouteInfo route={route[1]} />
          </CardContent>
        </CardActionArea>
      </Card>
    </div>
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
  fromToText: {
    fontSize: '0.95rem'
  },
  company: {
    color: '#888'
  },
  specialTrip: {
    fontSize: '0.6rem',
    marginLeft: '8px'
  }
}))