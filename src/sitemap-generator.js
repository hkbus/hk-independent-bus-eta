const fs = require('fs')
const request = require("request")

host = 'https://'+fs.readFileSync('public/CNAME', 'utf8')

// constant pages
content = [``, '/search', '/settings']
zhPages = content.map(path => `/zh${path}`)
enPages = content.map(path => `/en${path}`)

// route pages
request('https://hkbus.github.io/hk-bus-crawling/routeFareList.min.json', (e, r, b) => {
  var routeList = JSON.parse(b)['routeList']
  zhRoutes = Object.entries(routeList).map(route => `/zh/route/${route[0].replace(/ /g, '_')}`)
  enRoutes = Object.entries(routeList).map(route => `/en/route/${route[0].replace(/ /g, '_')}`)
  
  // write to file
  fs.writeFileSync('sitemap.txt', host+"\n"+[].concat(zhPages, enPages, zhRoutes, enRoutes).map(p => `${host}${p}`).join("\n"))
  fs.writeFileSync('.rsp.json', JSON.stringify({
    port: 3001, 
    routes: [].concat(zhPages, enPages, zhRoutes, enRoutes)
  }))
})

