const fs = require('fs')
const request = require("request")

host = 'https://'+fs.readFileSync('public/CNAME', 'utf8')

// constant pages
content = [`/`, '/search', '/settings']
zhPages = content.map(path => `${host}/zh${path}`)
enPages = content.map(path => `${host}/en${path}`)

// route pages
request('https://hkbus.github.io/hk-bus-crawling/routeFareList.min.json', (e, r, b) => {
  var routeList = JSON.parse(b)['routeList']
  zhRoutes = Object.entries(routeList).map(route => `${host}/zh/route/${encodeURIComponent(route[0])}`)
  enRoutes = Object.entries(routeList).map(route => `${host}/en/route/${encodeURIComponent(route[0])}`)
  
  // write to file
  fs.writeFileSync('build/sitemap.txt', [].concat(zhPages, enPages, zhRoutes, enRoutes).join("\n"))
})

