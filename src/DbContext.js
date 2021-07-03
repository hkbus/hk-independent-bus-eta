import React, { useEffect, useState } from 'react'
import { fetchEtaObj, fetchEtaObjMd5 } from 'hk-bus-eta' 
import { compressToBase64, decompressFromBase64 } from 'lz-string'

const DbContext = React.createContext()

export const DbProvider = ( props ) => {
  const [schemaVersion, setSchemaVersion] = useState(localStorage.getItem('schemaVersion'))
  const [versionMd5, setVersionMd5] = useState(localStorage.getItem('versionMd5'))
  // route list & stop list & route-stop list
  const [routeList, setRouteList] = useState(decompressJsonString(localStorage.getItem('routeList')))
  const [stopList, setStopList] = useState(decompressJsonString(localStorage.getItem('stopList')))
  const [stopMap, setStopMap] = useState(decompressJsonString(localStorage.getItem('stopMap')))
  const [updateTime, setUpdateTime] = useState(parseInt(localStorage.getItem('updateTime'), 10))
  
  const renewDb = () => {
    fetchEtaObj().then( ({routeList, stopList, stopMap}) => {
      setRouteList(routeList)
      setStopList(stopList)
      setStopMap(stopMap)
      setUpdateTime( Date.now() )
    })
  }

  useEffect(() => {
    // check app version and flush localstorage if outdated
    Promise.all([
      fetch(process.env.PUBLIC_URL+'/schema-version.txt').then(r => r.text()),
      fetchEtaObjMd5()
    ]).then( ([_schemaVersion, _md5] ) => {
      let needRenew = false
      if ( schemaVersion !== _schemaVersion ) {
        setSchemaVersion(_schemaVersion)
        localStorage.setItem('schemaVersion', _schemaVersion)
        needRenew = true
      }
      if ( versionMd5 !== _md5 ) {
        setVersionMd5(_md5)
        localStorage.setItem('versionMd5', _md5)
        needRenew = true
      }
      needRenew = needRenew || routeList == null || stopList == null
      if (needRenew) {
        renewDb()
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    localStorage.setItem('stopList', compressToBase64(JSON.stringify(stopList)))
  }, [stopList])

  useEffect(() => {
    localStorage.setItem('stopMap', compressToBase64(JSON.stringify(stopMap)))
  }, [stopMap])

  useEffect(() => {
    localStorage.setItem('routeList', compressToBase64(JSON.stringify(routeList)))
  }, [routeList])

  useEffect(() => {
    localStorage.setItem('updateTime', updateTime)
  }, [updateTime])

  return (
    <DbContext.Provider value={{
        routeList, stopList, stopMap,
        // settings
        renewDb, schemaVersion, versionMd5, updateTime
      }}
    >
      {props.children}
    </DbContext.Provider>
  )
}

export default DbContext

const decompressJsonString = (txt) => {
  let ret = decompressFromBase64(txt)
  if ( ret && ret.length && ret !== 'null' && txt.endsWith('=') ){
    return JSON.parse(ret)
  }
  return null
}
