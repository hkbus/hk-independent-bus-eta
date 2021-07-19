import React, { useState } from 'react'

const SearchContext = React.createContext()

export const SearchContextProvider = ( props ) => {
  const [locations, setLocations] = useState({ start: null, end: null })
  const [status, setStatus] = useState("ready")
  const [result, setResult] = useState([])
  const [resultIdx, setResultIdx] = useState({resultIdx: 0, stopIdx: [0, 0]})

  return (
    <SearchContext.Provider value={{
        locations, setLocations,
        status, setStatus,
        result, setResult,
        resultIdx, setResultIdx
      }}
    >
      {props.children}
    </SearchContext.Provider>
  )
}

export default SearchContext