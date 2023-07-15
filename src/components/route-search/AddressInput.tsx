import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import debounce from "lodash.debounce";
import AsyncSelect from "react-select/async";
import { styled } from "@mui/material/styles";
import proj4 from "proj4";
import { StopList } from "hk-bus-eta";

interface AddressInputProps {
  placeholder?: string;
  onChange: any;
  stopList: StopList;
  value: any;
}

const AddressInput = ({
  placeholder = "",
  onChange,
  stopList,
  value,
}: AddressInputProps) => {
  const { t, i18n } = useTranslation();
  const abortController = useRef(new AbortController());

  const loadAddress = useRef(
    debounce((addr, callback) => {
      const stopAddresses = Object.values(stopList)
        .filter(
          (stop) =>
            stop.name.zh.includes(addr) ||
            stop.name.en.toLowerCase().includes(addr.toLowerCase())
        )
        .map((stop) => ({
          label: `${stop.name[i18n.language]} - ${t("車站")}`,
          location: stop.location,
        }))
        .slice(0, 10);
      abortController.current.abort();
      abortController.current = new AbortController();
      loadAddressFromGeodata(addr, {
        signal: abortController.current.signal,
      }).then((suggestions) => {
        callback(
          stopAddresses.concat(
            suggestions.map(({ name, address, lat, lng }) => ({
              label: [name[i18n.language], address[i18n.language]]
                .filter((e) => e)
                .join(" - "),
              location: { lat, lng },
            }))
          )
        );
      });
    }, 200)
  ).current;

  return (
    <AddressAsyncSelect
      isClearable
      value={value}
      loadOptions={loadAddress}
      placeholder={placeholder}
      onChange={onChange}
      classNamePrefix="react-select"
    />
  );
};

interface Suggestion {
  address: { zh: string; en: string };
  name: { zh: string; en: string };
  lat: number;
  lng: number;
}

interface GeoAddrData {
  x: number;
  y: number;
  addressZH: string;
  addressEN: string;
  nameZH: string;
  nameEN: string;
}

const loadAddressFromGeodata = async (
  addr: string,
  options
): Promise<Suggestion[]> => {
  if (!addr) return new Promise((resolve) => resolve([]));

  // use geodata.gov.hk api, potentially add als.ogcio.gov.hk api
  const suggestions: GeoAddrData[] = await fetch(
    `https://geodata.gov.hk/gs/api/v1.0.0/locationSearch?q=${encodeURI(addr)}`,
    options
  ).then((res) => res.json());

  return suggestions.map((sug) => {
    const [lng, lat] = proj4(
      // from EPSG:2326 to EPSG:4326
      "+proj=tmerc +lat_0=22.31213333333334 +lon_0=114.1785555555556 +k=1 +x_0=836694.05 +y_0=819069.8 +ellps=intl +towgs84=-162.619,-276.959,-161.764,0.067753,-2.24365,-1.15883,-1.09425 +units=m +no_defs",
      "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs",
      [sug.x, sug.y]
    );
    return {
      address: { zh: sug.addressZH, en: sug.addressEN },
      name: { zh: sug.nameZH, en: sug.nameEN },
      lat: lat,
      lng: lng,
    };
  });
};

export default AddressInput;

const AddressAsyncSelect = styled(AsyncSelect)(({ theme }) => ({
  ".react-select__control": {
    background: `${
      theme.palette.mode === "dark" ? theme.palette.background.default : "white"
    } !important`,
    border: "none !important",
    borderRadius: "unset !important",
    borderBottom: "1px hsl(0, 0%, 80%) solid !important",
  },
  ".react-select__input": {
    color: `${
      theme.palette.mode === "dark"
        ? theme.palette.primary.main
        : theme.palette.text.primary
    } !important`,
  },
  ".react-select__valueContainer": {
    color: `${
      theme.palette.mode === "dark"
        ? theme.palette.primary.main
        : theme.palette.text.primary
    } !important`,
  },
  ".react-select__single-value": {
    color: `${
      theme.palette.mode === "dark"
        ? theme.palette.primary.main
        : theme.palette.text.primary
    } !important`,
  },
  ".react-select__option:hover": {
    filter: "grayscale(1) !important",
  },
  ".react-select__option--is-focused": {
    background: `${
      theme.palette.mode === "dark" ? theme.palette.background.default : "white"
    } !important`,
  },
  ".react-select__option--is-selected": {
    background: `${
      theme.palette.mode === "dark" ? theme.palette.background.default : "white"
    } !important`,
    color: `${
      theme.palette.mode === "dark"
        ? theme.palette.primary.main
        : theme.palette.text.primary
    } !important`,
  },
  ".react-select__menu": {
    background: `${
      theme.palette.mode === "dark" ? theme.palette.background.default : "white"
    } !important`,
    color: `${
      theme.palette.mode === "dark"
        ? theme.palette.primary.main
        : theme.palette.text.primary
    } !important`,
  },
  ".react-select__meauList": {
    background: `${
      theme.palette.mode === "dark" ? theme.palette.background.default : "white"
    } !important`,
    color: `${
      theme.palette.mode === "dark"
        ? theme.palette.primary.main
        : theme.palette.text.primary
    } !important`,
  },
}));
