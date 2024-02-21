import React, { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { Locations, SearchResultIdx, SearchResultType, StatusType } from './typing';

interface SearchContextProps {
  locations: Locations;
  status: "ready" | "rendering" | "waiting";
  result: SearchResultType[];
  resultIdx: SearchResultIdx;
  setLocations: (loctions: Locations) => void;
  setStatus: (status: StatusType) => void;
  setResult: Dispatch<SetStateAction<SearchResultType[]>>;
  setResultIdx: Dispatch<SetStateAction<SearchResultIdx>>;
}

const SearchContext = React.createContext({} as SearchContextProps);

export const SearchContextProvider = (props: { children: ReactNode }) => {
  const [locations, setLocations] = useState<Locations>({ start: null, end: null });
  const [status, setStatus] = useState<StatusType>(
    "ready"
  );
  const [result, setResult] = useState<SearchResultType[]>([]);
  const [resultIdx, setResultIdx] = useState<SearchResultIdx>({ resultIdx: 0, stopIdx: [0, 0] });

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
