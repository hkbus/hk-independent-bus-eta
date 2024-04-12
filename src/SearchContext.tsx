import React, { useState } from "react";
import { Address } from "./components/route-search/AddressInput";

type SearchResult = Array<Array<{ routeId: string; on: number; off: number }>>;

interface SearchContextState {
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
}

interface SearchContextValue extends SearchContextState {
  setState: React.Dispatch<React.SetStateAction<SearchContextState>>;
}

const SearchContext = React.createContext({} as SearchContextValue);

export const SearchContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, setState] = useState<SearchContextState>(DEFAULT_STATE);

  return (
    <SearchContext.Provider
      value={{
        ...state,
        setState,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContext;

const DEFAULT_STATE: SearchContextState = {
  locations: {
    start: null,
    end: null,
  },
  status: "ready",
  result: [],
  resultIdx: {
    resultIdx: 0,
    stopIdx: [0, 0],
  },
};
