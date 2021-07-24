# 香港 - 獨立巴士預報

[![React](https://badges.aleen42.com/src/react.svg)](http://reactjs.org/) 
[![Test](https://github.com/chunlaw/hk-independent-bus-eta/actions/workflows/node.js.yml/badge.svg)](https://chunlaw.github.io/hk-independent-bus-eta)

無廣告的巴士預報站整合了九巴、新巴、城巴和新大嶼山巴士的到站預報，介面清晣直接，力求讓用戶快速獲得所需資訊。

註：本網站一切到站預報資料均來自[資料一站通](https://data.gov.hk)，路線及收費資料來自[HK Bus Crawling](https://github.com/hkbus/hk-bus-crawling/)

## 資料來源

新巴城巴新大嶼巴士的[資料來源](https://data.gov.hk/tc-data/dataset/nwfb-eta-transport-realtime-eta)和九巴的[資料來源](https://data.gov.hk/tc-data/dataset/hk-td-tis_21-etakmb)分別採用不同格式，本 app 就不同 api 的處理主要集中於 `data-api/` 內。

## Note

The project is a [React](https://reactjs.org/) web app with [Material-UI](https://material-ui.com/). You may clone the project and launch it by your own. Please note that there are specific setup in `package.json` (i.e., ***homepage***) and the Google Analytics Measure ID in `public/index.html`.

## Available Scripts

In the project directory, you can run:

### `npm run start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Contributors
Project owner [chunlaw](https://github.com/chunlaw) is the initiator of the whole project. Anyone is welcome to contribute in it. Other contributors are:
[lzwn128](https://github.com/lzwn128 )
[cswbrian](https://github.com/cswbrian)
[thomassth](https://github.com/thomassth)
