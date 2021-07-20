import React, { useEffect, useState } from 'react'
import { isEmptyObj } from './utils'
import { initDb, fetchDbFunc } from './db'
import {compress as compressJson} from 'compressed-json'

const DbContext = React.createContext()

export const DbProvider = ( props ) => {
  const AppTitle = '巴士到站預報 App'
  // route list & stop list & route-stop list
  const [db, setDb] = useState({
    routeList: initDb.db.routeList, stopList: initDb.db.stopList, stopMap: initDb.db.stopMap,
    schemaVersion: localStorage.getItem('schemaVersion') || '',
    versionMd5: localStorage.getItem('versionMd5') || '',
    updateTime: parseInt(localStorage.getItem('updateTime'), 10)
  })
  
  const loadData = ({db: {routeList, stopList, stopMap}, versionMd5, schemaVersion}) => {
    setDb({
      routeList,
      stopList, 
      stopMap,
      versionMd5,
      schemaVersion,
      updateTime: Date.now()
    })
  }

  const renewDb = () => {
    fetchDbFunc(true).then( loadData )
  }

  useEffect(() => {
    // skip if db is {}
    if ( db && !isEmptyObj(db.routeList) && !isEmptyObj(db.stopList) && !isEmptyObj(db.stopMap) ) {
      // TODO skip if db version is the same
      
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
