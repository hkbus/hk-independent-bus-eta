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
import { Link } from  'react-router-dom'

const RouteRow = React.memo(( {data, index, style} ) => {
  const { t, i18n } = useTranslation()
  const { routeList } = data
  const route = routeList[index]
  const [routeNo, service_type] = route[0].split('+').slice(0,2)
  const classes = useStyles()

  return (
    <Link to={'/'+i18n.language+'/route/'+route[0]}>
      <Card variant="outlined" key={route[0]} style={style} square>
        <CardActionArea>
          <CardContent className={classes.cardContent}>
            <Typography variant="h5" display="inline">{routeNo}</Typography>
            <Typography variant="caption"> - {route[1].co.map(co => t(co)).join('+')}</Typography>
            <br/>
            <Typography variant="subtitle2" display="inline">{t('往')} {route[1].dest[i18n.language]}  </Typography>
            <Typography variant="caption">{service_type >= 2 ? t('特別班次') : '　'}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Link>
  )
}, areEqual)

export default RouteRow

const useStyles = makeStyles (theme => ({
  cardContent: {
    padding: '8px 16px',
  }
}))