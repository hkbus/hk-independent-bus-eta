import { useRef } from "react";
import { useTranslation } from "react-i18next";
import debounce from "lodash.debounce";
import AsyncSelect from "react-select/async";
import { alpha, styled } from "@mui/material/styles";
import proj4 from "proj4";
import { Location, StopList } from "hk-bus-eta";
import useLanguage from "../../hooks/useTranslation";

export interface Address {
  label: string;
  location: Location;
}

interface AddressInputProps {
  placeholder?: string;
  onChange: (newValue: Address | null) => void;
  stopList: StopList;
  value: any;
}

const AddressInput = ({
  placeholder = "",
  onChange,
  stopList,
  value,
}: AddressInputProps) => {
  const { t } = useTranslation();
  const language = useLanguage();
  const abortController = useRef(new AbortController());

  const loadAddress = useRef(
    debounce((addr: string, callback: any) => {
      const stopAddresses = Object.values(stopList)
        .filter(
          (stop) =>
            stop.name.zh.includes(addr) ||
            stop.name.en.toLowerCase().includes(addr.toLowerCase())
        )
        .map((stop) => ({
          label: `${stop.name[language]} - ${t("車站")}`,
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
              label: [name[language], address[language]]
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
      aria-label={placeholder}
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
  options: any
): Promise<Suggestion[]> => {
  if (!addr) return new Promise((resolve) => resolve([]));

  // use www.map.gov.hk api, potentially add als.ogcio.gov.hk api
  const suggestions: GeoAddrData[] = await fetch(
    `https://www.map.gov.hk/gs/api/v1.0.0/locationSearch?q=${encodeURI(addr)}`,
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

const AddressAsyncSelect = styled(AsyncSelect<Address>)(({ theme }) => {
  const { palette } = theme;
  const bg =
    palette.mode === "dark"
      ? palette.background.default
      : palette.background.paper;
  const fg =
    palette.mode === "dark" ? palette.primary.main : palette.text.primary;
  return {
    ".react-select__control": {
      background: `${bg} !important`,
      border: "none !important",
      borderRadius: "unset !important",
      borderBottom: `1px solid ${palette.divider} !important`,
      boxShadow: "none !important",
    },
    ".react-select__input-container, .react-select__input, .react-select__single-value":
      { color: `${fg} !important` },
    ".react-select__placeholder": {
      color: `${palette.text.secondary} !important`,
    },
    ".react-select__indicator": {
      color: `${palette.text.secondary} !important`,
    },
    ".react-select__indicator-separator": {
      backgroundColor: `${palette.divider} !important`,
    },
    ".react-select__menu": {
      background: `${bg} !important`,
      color: `${fg} !important`,
      border: `1px solid ${palette.divider}`,
    },
    ".react-select__menu-list": {
      background: `${bg} !important`,
      color: `${fg} !important`,
    },
    ".react-select__menu-notice--no-options, .react-select__menu-notice--loading":
      { color: `${palette.text.secondary} !important` },
    ".react-select__option": {
      background: "transparent !important",
      color: `${fg} !important`,
    },
    ".react-select__option--is-focused": {
      background: `${alpha(palette.primary.main, 0.12)} !important`,
    },
    ".react-select__option--is-selected": {
      background: `${alpha(palette.primary.main, 0.2)} !important`,
      color: `${fg} !important`,
    },
  };
});
