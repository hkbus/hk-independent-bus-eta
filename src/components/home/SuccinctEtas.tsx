import React, {useContext} from 'react'
import { ListItemText, Typography } from '@mui/material'
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next'
import { useEtas } from '../Etas'
import AppContext from '../../AppContext'
import { Eta } from 'hk-bus-eta'

const SuccinctEtas = ({routeId}) => {
  const { t, i18n } = useTranslation()
  const { etaFormat } = useContext( AppContext )
  const etas = useEtas(routeId)

  const getEtaString = (eta: Eta | null) => {
    if ( !eta || !eta.eta ) {
      return ''
    } else {
      const waitTime = Math.round(((new Date(eta.eta)).getTime() - (new Date()).getTime()) / 60 / 1000)
      if ( etaFormat === 'exact' && Number.isInteger(waitTime) ) {
        return eta.eta.substr(11,5)
      }
      if ( waitTime < 1 ) {
        return `- ${t('分鐘')}`
      } else if ( Number.isInteger(waitTime) ) {
        return `${waitTime} ${t('分鐘')}`
      } else {
        return eta.remark[i18n.language]
      }
    }
  }

  return (
    <EtaListItemText
      primary={<Typography component="h5" color="textPrimary">{etas ? getEtaString(etas[0]) : ''}</Typography>}
      secondary={<Typography component="h6" color="textSecondary" className={classes.secondary}>{etas ? getEtaString(etas[1]) : ''}</Typography>}
      className={classes.root}
    />
  )
}

export default SuccinctEtas

const PREFIX = 'etas'

const classes = {
  root: `${PREFIX}-root`,
  secondary: `${PREFIX}-secondary`
}

const EtaListItemText = styled(ListItemText)(({theme}) => ({
  [`&.${classes.root}`]: {
    width: '20%',
    paddingLeft: '10px',
    textAlign: 'right',
  },
  [`& .${classes.secondary}`]: {
    fontSize: '0.875rem',
    fontWeight: '400',
    lineHeight: '1.43'
  }
}))
