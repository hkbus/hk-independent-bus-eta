import{j as e,a4 as R,a5 as _,r as t,ae as D,a6 as M,aa as r,$ as z,ac as O}from"./index-kqgpsvLZ.js";import{r as k,i as w,d as H}from"./App-CwC2QIXX.js";import{l as T}from"./lzutf8-light-DPLs0qPI.js";import{S as q}from"./Snackbar-B-PwnpX1.js";var s={},B=w;Object.defineProperty(s,"__esModule",{value:!0});var b=s.default=void 0,F=B(k()),V=e;b=s.default=(0,F.default)((0,V.jsx)("path",{d:"M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"}),"ContentCopy");const J=()=>{const{t:a}=R(),n=_(),{savedStops:i,savedEtas:l,collections:c}=t.useContext(D),{_colorMode:u,energyMode:d,platformMode:p,refreshInterval:x,annotateScheduled:h,vibrateDuration:m,etaFormat:f,numPadOrder:v,isRouteFilter:g,busSortOrder:C,analytics:j,isRecentSearchShown:S}=t.useContext(M),o=t.useMemo(()=>`https://${window.location.hostname}/${n}/import/`+encodeURIComponent(T.compress(JSON.stringify({savedStops:i,savedEtas:l,collections:c,_colorMode:u,energyMode:d,platformMode:p,refreshInterval:x,annotateScheduled:h,vibrateDuration:m,etaFormat:f,numPadOrder:v,isRouteFilter:g,busSortOrder:C,analytics:j,isRecentSearchShown:S},null,0),{outputEncoding:"Base64"})),[c,l,i,u,d,p,x,h,m,f,v,g,C,n,j,S]),[I,y]=t.useState(!1);return e.jsxs(r,{sx:$,children:[e.jsx(z,{variant:"h6",sx:{textAlign:"center"},children:a("資料匯出")}),e.jsxs(r,{sx:{display:"flex",flexDirection:"column",alignItems:"center",m:1},children:[e.jsx(H,{variant:"outlined",value:o,fullWidth:!0,spellCheck:!1}),e.jsx(r,{sx:{m:1},children:e.jsx(O,{startIcon:e.jsx(b,{}),onClick:()=>{var E;navigator.share?navigator.share({title:"Export hkbus.app",url:o}):(E=navigator.clipboard)==null||E.writeText(o).then(()=>{y(!0)})},size:"large",variant:"outlined",children:a("複制匯出網址")})})]}),e.jsx(q,{anchorOrigin:{vertical:"bottom",horizontal:"center"},open:I,autoHideDuration:1500,onClose:()=>{y(!1)},message:a("已複製到剪貼簿")})]})},$={justifyContent:"center",flex:1};export{J as default};
