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

  return (
    <>
    { route.nlbId ?
      <Typography variant="subtitle2" display="inline">{t('往')} {route.dest[i18n.language]} {t('由')+" "+route.orig[i18n.language]}</Typography>
      : <Typography variant="subtitle2" display="inline">{t('往')} {route.dest[i18n.language]}</Typography>
    }
    </>
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
            <Typography variant="h5" display="inline">{<RouteNo routeNo={routeNo} />}</Typography>
            <Typography variant="caption"> - {route[1].co.map(co => t(co)).join('+')}</Typography>
            <br/>
            <RouteInfo route={route[1]} />
            <Typography variant="caption">{service_type >= 2 ? t('特別班次') : '　'}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </div>
  )
}, areEqual)

export default RouteRow

const useStyles = makeStyles (theme => ({
  cardContent: {
    padding: '8px 16px',
  }
}))