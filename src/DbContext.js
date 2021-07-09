import React, { useEffect, useState } from 'react'
import { fetchEtaObj, fetchEtaObjMd5 } from 'hk-bus-eta' 
import { compressToBase64, decompressFromBase64 } from 'lz-string'
import { isEmptyObj } from './utils'


const DbContext = React.createContext()

export const DbProvider = ( props ) => {
  const AppTitle = '巴士到站預報 App'
  const [schemaVersion, setSchemaVersion] = useState(localStorage.getItem('schemaVersion') || '')
  const [versionMd5, setVersionMd5] = useState(localStorage.getItem('versionMd5') || '')
  // route list & stop list & route-stop list
  const [db, setDb] = useState({routeList: {}, stopList: {}, stopMap: {}})
  const [updateTime, setUpdateTime] = useState(parseInt(localStorage.getItem('updateTime'), 10))
  
  const loadData = (data) => {
    const {db: {routeList, stopList, stopMap}, versionMd5, schemaVersion} = data
    setVersionMd5(versionMd5)
    setSchemaVersion(schemaVersion)
    setDb({
      routeList: Object.entries(routeList).reduce((acc, [k, v]) => {
        acc[k.replace(/\+/g, '-').replace(/ /g, '-').toUpperCase()] = v
        return acc
      }, {}),
      stopList, 
      stopMap
    })
    setUpdateTime( Date.now() )
  }

  const renewDb = () => {
    fetchDbFunc().then( loadData )
  }

  useEffect(() => {
    initDb.then(loadData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if ( db && !isEmptyObj(db.routeList) && !isEmptyObj(db.stopList) && !isEmptyObj(db.stopMap) ) {
      // skip if db is {}
      // make costly compression async
      setTimeout( () => {
        localStorage.setItem('db', compressToBase64(JSON.stringify(db)))
      }, 0)
    }
  }, [db])

  useEffect(() => {
    localStorage.setItem('updateTime', updateTime)
  }, [updateTime])

  return (
    <DbContext.Provider value={{
        AppTitle, db, renewDb, 
        schemaVersion, versionMd5, updateTime
      }}
    >
      {props.children}
    </DbContext.Provider>
  )
}

export default DbContext

const decompressJsonString = (txt) => {
  try {
    let ret = decompressFromBase64(txt)
    return JSON.parse(ret)
  } catch (e) {
    // return empty object if no valid JSON string parsed
    return {routeList: {}, stopList: {}, stopMap: {}}
  }
}

// to optimize the data fetching significantly
// we define the fetchDbFunc outside the components
// and we hence able to fetch data before rendering
const fetchDbFunc = () => {
  const schemaVersion = localStorage.getItem('schemaVersion')
  const versionMd5 = localStorage.getItem('versionMd5')
  if ( !navigator.onLine ) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        schemaVersion, versionMd5,
        db: decompressJsonString(localStorage.getItem('db'))
      }), 0)
    })
  }

  return Promise.all([
    fetch(process.env.PUBLIC_URL+'/schema-version.txt').then(r => r.text()),
    fetchEtaObjMd5()
  ]).then( ([_schemaVersion, _md5] ) => {
    let needRenew = false
    if ( schemaVersion !== _schemaVersion ) {
      localStorage.setItem('schemaVersion', _schemaVersion)
      needRenew = true
    }
    if ( versionMd5 !== _md5 ) {
      localStorage.setItem('versionMd5', _md5)
      needRenew = true
    }

    if (needRenew) {
      return fetchEtaObj().then(db => ({db, schemaVersion: _schemaVersion, versionMd5: _md5}))
    }
    
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        schemaVersion, versionMd5,
        db: decompressJsonString(localStorage.getItem('db'))
      }), 0)
    })
  })
}

// actually start fetching DB once the script is runned 
const initDb = fetchDbFunc()