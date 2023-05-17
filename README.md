# 香港 - 獨立巴士預報 HK Bus ETA

[![React](https://badges.aleen42.com/src/react.svg)](http://reactjs.org/) 
[![Test](https://github.com/hkbus/hk-independent-bus-eta/actions/workflows/node.js.yml/badge.svg)](https://hkbus.app)


無廣告的巴士預報站整合了香港巴士（城巴新巴九巴嶼巴）、小巴及輕鐵港鐵的到站預報，介面清晣直接，力求讓用戶快速獲得所需資訊。

An ad-free bus ETA site for Hong Kong, with arrival times from KMB, CTB, NWFB, LNB, minibus, lightrail, and MTR, with a clutter-free UI that lets you get what you need, fast.

## 資料來源 Data Sources

本網站一切到站預報資料均來自[資料一站通](https://data.gov.hk)及相關機構，路線及收費資料來自[HK Bus Crawling](https://github.com/hkbus/hk-bus-crawling/)

ETA data is from [DATA.GOV.HK](https://data.gov.hk) and respective providers. Route and fare data from [HK Bus Crawling](https://github.com/hkbus/hk-bus-crawling/).

## Note

The project is a [React](https://reactjs.org/) web app with [Material-UI](https://material-ui.com/). You can clone the project and host it by your own, for personal use. Please note that there are specific setups for `package.json` (i.e., ***homepage***) and Google Analytics Measure ID in `public/index.html`.

## Docker

See docker.md for more information about using docker for deployment / development.

## Available Scripts

> ***Note***: It is assumed that you are running the scripts in a unix-like environment. Windows is not supported.

In the project directory, you can run:

### `yarn start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload if you make edits.\
You will also see lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn predeploy`

Build the app with SEO optimized pages.

## Contributors

Project owner [chunlaw](https://github.com/chunlaw) is the initiator of the whole project. Everyone is welcome to contribute. Other contributors are:

[lzwn128](https://github.com/lzwn128 )
[cswbrian](https://github.com/cswbrian)
[thomassth](https://github.com/thomassth)
[hk-ng](https://github.com/hk-ng)
[sdip15fa](https://github.com/sdip15fa)
[thomassth](https://github.com/thomassth)
[skpracta](https://github.com/skpracta)