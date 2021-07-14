import React, {useState, useRef} from 'react'
import { useTranslation } from 'react-i18next'
import debounce from 'lodash.debounce'
import AsyncSelect from 'react-select/async'
import proj4 from 'proj4'

const AddressInput = ({placeholder = '', onChange}) => {
  const [state, setState] = useState({
    value: '',
    suggestions: []
  })
  const { i18n } = useTranslation()

  const loadAddress = useRef(debounce((addr, callback) => {
    loadAddressFromGeodata(addr).then(suggestions => {
      callback(suggestions.map(s => ({
        label: [s.name[i18n.language], s.address[i18n.language]].filter( e => e ).join(' - '),
        value: s.name[i18n.language],
        ...s
      })))
    })
  }, 2000)).current

  const handleInputChange = (newValue) => {
    setState({
      ...state,
      value: newValue
    })
    return newValue
  }

  return (
    <AsyncSelect
      cacheOptions
      loadOptions={loadAddress}
      placeholder={placeholder}
      onInputChange={handleInputChange}
      onChange={onChange}
    />
  )
}

const loadAddressFromGeodata = (addr) => {
  if ( !addr ) return new Promise(resolve => resolve([]))
  // use geodata.gov.hk api, potentially add als.ogcio.gov.hk api
  return fetch(`https://geodata.gov.hk/gs/api/v1.0.0/locationSearch?q=${encodeURI(addr)}`)
    .then(res => res.json())
    .then(suggestions => (
      suggestions.map((sug) => {
        const [lng, lat] = proj4(
          // from EPSG:2326 to EPSG:4326
          '+proj=tmerc +lat_0=22.31213333333334 +lon_0=114.1785555555556 +k=1 +x_0=836694.05 +y_0=819069.8 +ellps=intl +towgs84=-162.619,-276.959,-161.764,0.067753,-2.24365,-1.15883,-1.09425 +units=m +no_defs', 
          '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs', 
          [sug.x, sug.y]
        )
        return {
          address: {zh: sug.addressZH, en: sug.addressEN},
          name: {zh: sug.nameZH, en: sug.nameEN},
          lat: lat, lng: lng
        }
      }
    )))
}

export default AddressInput