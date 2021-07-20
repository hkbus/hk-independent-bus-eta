import React from 'react'
import { ListItemText, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useTranslation } from 'react-i18next'
import { useEtas } from '../Etas'

const SuccinctEtas = ({routeId}) => {
  const { t, i18n } = useTranslation()
  const etas = useEtas(routeId)
  useStyles()

  const getEtaString = (eta) => {
    if ( !eta || !eta.eta ) return ''
    else {
      const waitTime = Math.round(((new Date(eta.eta)) - (new Date())) / 60 / 1000)
      if ( waitTime < 1 ) {
        return '- '+t('分鐘')
      } else if ( Number.isInteger(waitTime) ) {
        return waitTime+" "+t('分鐘')
      } else {
        return eta.remark[i18n.language]
      }
    }
  }

  return (
    <ListItemText
      primary={<Typography component="h5" color="textPrimary">{etas ? getEtaString(etas[0]) : ''}</Typography>}
      secondary={<Typography component="h6" color="textSecondary" className={"etas-secondaryEta"}>{etas ? getEtaString(etas[1]) : ''}</Typography>}
      className={"etas-routeEta"}
    />
  )
}

export default SuccinctEtas

const useStyles = makeStyles(theme => ({
  "@global": {
    ".etas-routeEta": {
      width: '20%',
      paddingLeft: '10px',
      textAlign: 'right',
    },
    ".etas-secondaryEta": {
      fontSize: '0.875rem',
      fontWeight: '400',
      lineHeight: '1.43'
}
  }
}))
