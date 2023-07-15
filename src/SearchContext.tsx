import React, { useState } from "react";
import { Location as GeoLocation } from "hk-bus-eta";

interface SearchContextProps {
  locations: {
    start: { location: GeoLocation } | null;
    end: { location: GeoLocation } | null;
  };
  status: "ready" | "rendering" | "waiting";
  result: any[];
  resultIdx: {
    resultIdx: number;
    stopIdx: number[];
  };
  setLocations: any;
  setStatus: any;
  setResult: any;
  setResultIdx: any;
}

const SearchContext = React.createContext({} as SearchContextProps);

export const SearchContextProvider = (props) => {
  const [locations, setLocations] = useState({ start: null, end: null });
  const [status, setStatus] = useState<"ready" | "rendering" | "waiting">(
    "ready"
  );
  const [result, setResult] = useState([]);
  const [resultIdx, setResultIdx] = useState({ resultIdx: 0, stopIdx: [0, 0] });

  return (
    <SearchContext.Provider
      value={{
        locations,
        setLocations,
        status,
        setStatus,
        result,
        setResult,
        resultIdx,
        setResultIdx,
      }}
    >
      {props.children}
    </SearchContext.Provider>
  );
};

export default SearchContext;
