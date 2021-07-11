import { fetchEtaObj, fetchEtaObjMd5 } from 'hk-bus-eta' 
import { decompress as decompressJson } from 'compressed-json'

// implant the DB Context logic into code to avoid loading error
export const DB_CONTEXT_VERSION = '1.1.0'

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
export const fetchDbFunc = () => {
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
      resolve({
        schemaVersion, versionMd5,
        db: decompressJsonString(localStorage.getItem('db'))
      })
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
      localStorage.setItem('updateTime', Date.now())
      return fetchEtaObj().then(db => ({db:{
        ...db,
        routeList: Object.keys(db.routeList).sort().reduce((acc, k) => {
          acc[k.replace(/\+/g, '-').replace(/ /g, '-').toUpperCase()] = db.routeList[k]
          return acc
        }, {})
      }, schemaVersion: _schemaVersion, versionMd5: _md5}))
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
export const initDb = {db: {routeList: {}, stopList: {}, stopMap: {}}}

