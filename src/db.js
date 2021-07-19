import { fetchEtaObj, fetchEtaObjMd5 } from 'hk-bus-eta' 
import { decompress as decompressJson } from 'compressed-json'

// implant the DB Context logic into code to avoid loading error
export const DB_CONTEXT_VERSION = '1.1.0'

const decompressJsonString = (txt) => {
  try {
    const ret = decompressJson(JSON.parse(txt))
    return {
      ...ret,
      // sort the routeList object order based on the key
      routeList: Object.keys(ret.routeList).sort().reduce((acc, k) => {
        acc[k.replace(/\+/g, '-').replace(/ /g, '-').toUpperCase()] = ret.routeList[k]
        return acc
      }, {})
    }
  } catch (e) {
    // return empty object if no valid JSON string parsed
    return {routeList: {}, stopList: {}, stopMap: {}}
  }
}

// to optimize the data fetching significantly
// we define the fetchDbFunc outside the components
// and we hence able to fetch data before rendering
export const fetchDbFunc = (forceRenew = false) => {
  if ( localStorage.getItem('dbv') !== DB_CONTEXT_VERSION ) {
    console.log('New DB, will refetch data')
    localStorage.removeItem('db')
    localStorage.removeItem('versionMd5')
    localStorage.removeItem('routeList')
    localStorage.removeItem('stopList')
    localStorage.removeItem('stopMap')
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
    let needRenew = forceRenew
    if ( schemaVersion !== _schemaVersion ) {
      needRenew = true
    }
    if ( versionMd5 !== _md5 ) {
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
      .then((ret) => {
        localStorage.setItem('schemaVersion', _schemaVersion)
        localStorage.setItem('versionMd5', _md5)
        return ret
      })
    }
    
    return new Promise((resolve) => {
      resolve({
        schemaVersion, versionMd5,
        db: decompressJsonString(localStorage.getItem('db'))
      })
    })
  }).catch(r => {
    // mock data for App.test.js
    return new Promise((resolve) => {
      resolve({
        schemaVersion: '', versionMd5: '',
        db: {
          routeList: {}, 
          stopList: {}, 
          stopMap: {}
        }
      })
    })
  })
}

// actually start fetching DB once the script is runned 
export const initDb = {db: {routeList: {}, stopList: {}, stopMap: {}}}

