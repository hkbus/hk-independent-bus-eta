import React, { useState, useEffect } from 'react'
import {
  CircularProgress,
  Typography
} from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { 
  fetchEtas as fetchEtasViaApi 
} from '../../data-api'

const TimeReport = ( { route, routeStops, seq, bound, serviceType, co } ) => {
  const { t, i18n } = useTranslation()
  const [ etas, setEtas ] = useState(null)

  useEffect( () => {
    let isMounted = true
    const fetchData = () => {
      fetchEtasViaApi({route, routeStops, seq, bound, serviceType, co}).then(_etas => {
        if (isMounted) setEtas(_etas)
      })
    }
    fetchData()
    const fetchEtaInterval = setInterval(() => {
      fetchData()
    }, 30000)

    return () => {
      isMounted = false
      clearInterval(fetchEtaInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if ( etas == null ) {
    return (
      <CircularProgress size={20} style={{}} />
    )
  }

  const displayMsg = (eta) => {
    let ret = ''
    switch (eta) {
      case null: 
        break
      case 0: 
        ret = '- '+t('分鐘')
        break
      default:
        ret = eta + " " + t('分鐘')
        break
    }
    return ret
  }
  
  return (
    <div>
      {
        etas.length === 0 ? t('暫無班次') : (
          etas.map((eta, idx) => (
            <Typography variant="subtitle1" key={`route-${idx}`}>
              {displayMsg(eta.eta)} - { eta.remark[i18n.language] ? eta.remark[i18n.language] : '' } {t(eta.co)}
            </Typography>
          ))
        )
      }
    </div>
  )
}

export default TimeReport