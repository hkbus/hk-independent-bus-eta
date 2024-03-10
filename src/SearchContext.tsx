import React, { useState } from "react";
import { Address } from "./components/route-search/AddressInput";

type SearchResult = Array<Array<{ routeId: string; on: number; off: number }>>;

interface SearchContextProps {
  locations: {
    start: Address | null;
    end: Address | null;
  };
  status: "ready" | "rendering" | "waiting";
  result: SearchResult;
  resultIdx: {
    resultIdx: number;
    stopIdx: number[];
  };
  setLocations: React.Dispatch<
    React.SetStateAction<{
      start: Address | null;
      end: Address | null;
    }>
  >;
  setStatus: React.Dispatch<
    React.SetStateAction<"ready" | "rendering" | "waiting">
  >;
  setResult: React.Dispatch<React.SetStateAction<SearchResult>>;
  setResultIdx: React.Dispatch<
    React.SetStateAction<{
      resultIdx: number;
      stopIdx: number[];
    }>
  >;
}

const SearchContext = React.createContext({} as SearchContextProps);

export const SearchContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [locations, setLocations] = useState<{
    start: Address | null;
    end: Address | null;
  }>({ start: null, end: null });
  const [status, setStatus] = useState<"ready" | "rendering" | "waiting">(
    "ready"
  );
  const [result, setResult] = useState<SearchResult>([]);
  const [resultIdx, setResultIdx] = useState<{
    resultIdx: number;
    stopIdx: number[];
  }>({ resultIdx: 0, stopIdx: [0, 0] });

  return (
    <SearchContext.Provider
      value={{
        locations,
        status,
        result,
        resultIdx,
        setLocations,
        setStatus,
        setResult,
        setResultIdx,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContext;
