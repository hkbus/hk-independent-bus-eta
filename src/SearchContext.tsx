import React, { useState } from "react";
import type { Location as GeoLocation } from "hk-bus-eta";
type SearchStatus = "ready" | "rendering" | "waiting";
interface ResultIndex {
  resultIdx: number;
  stopIdx: number[];
}
interface SearchLocation {
  start: { location: GeoLocation } | null;
  end: { location: GeoLocation } | null;
}
interface SearchContextProps {
  locations: SearchLocation;
  status: SearchStatus;
  result: any[];
  resultIdx: ResultIndex;
  setLocations: ReturnType<typeof useState<SearchLocation>>[1];
  setStatus: ReturnType<typeof useState<SearchStatus>>[1];
  setResult: ReturnType<typeof useState<any[]>>[1];
  setResultIdx: ReturnType<typeof useState<ResultIndex>>[1];
}

const SearchContext = React.createContext({} as SearchContextProps);

export const SearchContextProvider = (props) => {
  const [locations, setLocations] = useState<SearchLocation>({
    start: null,
    end: null,
  });
  const [status, setStatus] = useState<"ready" | "rendering" | "waiting">(
    "ready"
  );
  const [result, setResult] = useState([]);
  const [resultIdx, setResultIdx] = useState<ResultIndex>({
    resultIdx: 0,
    stopIdx: [0, 0],
  });

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
