import React, { useEffect, useState } from 'react'
import { fetchEtaObj, fetchEtaObjMd5 } from 'hk-bus-eta' 
import { isEmptyObj } from './utils'
import {compress as compressJson, decompress as decompressJson} from 'compressed-json'

// implant the DB Context logic into code to avoid loading error
const DB_CONTEXT_VERSION = '1.1.0'

const DbContext = React.createContext()

export const DbProvider = ( props ) => {
  const AppTitle = '巴士到站預報 App'
  // route list & stop list & route-stop list
  const [db, setDb] = useState({
    routeList: {}, stopList: {}, stopMap: {},
    schemaVersion: localStorage.getItem('schemaVersion') || '',
    versionMd5: localStorage.getItem('versionMd5') || '',
    updateTime: parseInt(localStorage.getItem('updateTime'), 10)
  })
  
  
  const loadData = ({db: {routeList, stopList, stopMap}, versionMd5, schemaVersion}) => {
    setDb({
      routeList: Object.keys(routeList).sort().reduce((acc, k) => {
        acc[k.replace(/\+/g, '-').replace(/ /g, '-').toUpperCase()] = routeList[k]
        return acc
      }, {}),
      stopList, 
      stopMap,
      versionMd5,
      schemaVersion,
      updateTime: Date.now()
    })
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
        localStorage.setItem('db', JSON.stringify(compressJson(db)))
      }, 0)
    }
  }, [db])

  return (
    <DbContext.Provider value={{
        AppTitle, db, renewDb
      }}
    >
      {props.children}
    </DbContext.Provider>
  )
}

export default DbContext

const decompressJsonString = (txt) => {
  try {
    return decompressJson(JSON.parse(txt))
  } catch (e) {
    // return empty object if no valid JSON string parsed
    return {routeList: {}, stopList: {}, stopMap: {}}
  }
}

// to optimize the data fetching significantly
// we define the fetchDbFunc outside the components
// and we hence able to fetch data before rendering
const fetchDbFunc = () => {
  if ( localStorage.getItem('dbv') !== DB_CONTEXT_VERSION ) {
    console.log('New DB, will refetch data')
    localStorage.removeItem('db')
    localStorage.removeItem('versionMd5')
    localStorage.setItem('dbv', DB_CONTEXT_VERSION)
  }
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