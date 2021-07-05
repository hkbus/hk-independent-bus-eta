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
import RouteNo from '../RouteNo'

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
      history.push('/'+i18n.language+'/route/'+route[0])
    }, 0)
  }

  return (
    <div onClick={handleClick} >
      <Card variant="outlined" key={route[0]} style={style} square>
        <CardActionArea>
          <CardContent className={classes.cardContent}>
            <div>
              <div>
                <RouteNo routeNo={routeNo} />
                {service_type >= 2 && <Typography variant="caption" className={classes.specialTrip}>{t('特別班次')}</Typography>}
              </div>
              <div>
                {
                  route[1].co.map(co => {
                    return (
                      <span className={classes.company}>
                        {t(co)}
                      </span>
                    )
                  })
                }
              {/* <Typography variant="caption">
                  {route[1].co.map(co => t(co)).join('+')}
              </Typography> */}
              </div>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 16px',
  },
  routeInfo: {
    textAlign: 'right',
  },
  fromToText: {
    fontSize: '0.85rem'
  },
  specialTrip: {
    fontSize: '0.6rem',
    marginLeft: '8px'
  },
  company: {
    background: 'rgba(0, 0, 0, 0.12)',
    color: 'black',
    fontWeight: 600,
    fontSize: '0.6rem',
    padding: '2px 3px',
    marginRight: '2px'
  }
}))