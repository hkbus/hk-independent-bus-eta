import React from 'react'
import {
  Card,
  CardActionArea,
  CardContent,
  Typography
} from '@mui/material'
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next'
import { areEqual } from 'react-window'
import { Link, useHistory } from  'react-router-dom'
import { vibrate, toProperCase } from '../../utils'
import RouteNo from './RouteNo'
import { RouteListEntry } from 'hk-bus-eta';

const RouteInfo = ( {route} ) => {
  const { t, i18n } = useTranslation()

  return (
    <Typography component="h3" variant="body1" className={classes.routeInfo}>
      <div>
        <div className={classes.fromToWrapper}>
          <span className={classes.fromToText}>{`${t('往')} `}</span>
          <b>{toProperCase(route.dest[i18n.language])}</b>
        </div>
        <div className={classes.fromWrapper}>
          <span className={classes.fromText}>{t('由')}</span>
          <span>{toProperCase(route.orig[i18n.language])}</span>
        </div>
      </div>
    </Typography>
  )
}

interface RouteRowProps {
  data: { routeList: [string, RouteListEntry][] },
  index: number,
  style: React.CSSProperties
}

const RouteRow = React.memo(( {data, index, style}: RouteRowProps ) => {
  const { t, i18n } = useTranslation()
  const { routeList } = data
  const route = routeList[index]
  const [routeNo, serviceType] = route[0].split('-').slice(0,2)
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
      <RowCard className={classes.card} variant="outlined" key={route[0]} style={style} square>
        <CardActionArea>
          <CardContent className={classes.cardContent}>
            <div className={classes.busInfoContainer}>
              <div>
                <RouteNo routeNo={routeNo} />
                {parseInt(serviceType, 10) >= 2 && <Typography variant="caption" className={classes.specialTrip}>{t('特別班')}</Typography>}
              </div>
              <Typography component="h4" variant="caption" className={classes.company}>
                  {route[1].co.map(co => t(co)).join('+')}
              </Typography>
            </div>
            <RouteInfo route={route[1]} />
          </CardContent>
        </CardActionArea>
      </RowCard>
    </Link>
  )
}, areEqual)

export default RouteRow

const PREFIX = 'routeRow'

const classes = {
  card: `${PREFIX}-card`,
  cardContent: `${PREFIX}-cardContent`,
  busInfoContainer: `${PREFIX}-busInfoContainer`,
  routeInfo: `${PREFIX}-routeInfo`,
  company: `${PREFIX}-company`,
  fromToWrapper: `${PREFIX}-fromToWrapper`,
  fromToText: `${PREFIX}-fromToText`,
  fromWrapper: `${PREFIX}-fromWrapper`,
  fromText: `${PREFIX}-fromText`,
  specialTrip: `${PREFIX}-specialTrip`
}

const RowCard = styled(Card)(({theme}) => ({
  [`&.${classes.card}`]: {
    background: theme.palette.mode === 'dark' ? theme.palette.background.default : 'white',
  },
  [`& .${classes.cardContent}`]: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '4px 16px',
  },
  [`& .${classes.busInfoContainer}`]: {
    width: '25%'
  },
  [`& .${classes.routeInfo}`]: {
    textAlign: 'left',
    fontSize: '1rem',
    width: '75%'
  },
  [`& .${classes.company}`]: {
    color: theme.palette.text.secondary
  },
  [`& .${classes.fromToWrapper}`]: {
    display: 'flex',
    alignItems: 'baseline',
    whiteSpace: 'nowrap',
    overflowX: 'hidden'
  },
  [`& .${classes.fromToText}`]: {
    fontSize: '0.95rem',
    marginRight: theme.spacing(0.5)
  },
  [`& .${classes.fromWrapper}`]: {
    display: 'flex',
    alignItems: 'baseline',
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    fontSize: '0.75rem',
  },
  [`& .${classes.fromText}`]: {
    marginRight: theme.spacing(0.5)
  },
  [`& .${classes.specialTrip}`]: {
    fontSize: '0.6rem',
    marginLeft: '8px'
  }
}))