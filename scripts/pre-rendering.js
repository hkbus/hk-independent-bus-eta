const express = require('express');
const fs = require('fs');
const resolve = require('path').resolve;
const puppeteer = require('puppeteer');
const jsdom = require('jsdom');
const CleanCSS = require('clean-css');
require('dotenv').config()
const cleanCss = new CleanCSS()
let app;

/**
 * @returns {object}
 */
async function readOptionsFromFile() {
  try {
    const config = await fs.readFileSync('./.rsp.json');
    const options = JSON.parse(config.toString());
    return options;
  } catch (err) {
    throw new Error(`Error: Failed to read options from '.rsp.json'.\nMessage: ${err}`);
  }
}

/**
 * @param {number} port 
 * @param {string} routes 
 * @param {string} dir 
 * @returns {string|boolean}
 */
async function runStaticServer(port, routes, dir) {
  try {
    app = express();
    const resolvedPath = resolve(dir); 
    app.use(express.static(resolvedPath));
    app.get("/*", (req, res) => {
      res.sendFile(`${resolvedPath}/index.html`);
    })
    await app.listen(port);
    return `http://localhost:${port}`;
  } catch(err) {
    throw new Error(`Error: Failed to run puppeteer server on port ${port}.\nMessage: ${err}`);
  }
}

/**
 * 
 * @param {string} route 
 * @param {string} html 
 * @param {string} dir 
 */
async function createNewHTMLPage(route, html, dir) {
  try {
    const fname = route === '/' ? '/index' : route;
    if (route.indexOf('/') !== route.lastIndexOf('/')) {
      const subDir = route.slice(0, route.lastIndexOf('/'));
      await ensureDirExists(`${dir}${subDir}`);
    }
    await fs.writeFileSync(`${dir}${fname}.html`, html, {encoding: 'utf-8', flag: 'w'});
    console.log(`Created ${fname}.html`);
  } catch (err) {
    throw new Error(`Error: Failed to create HTML page for ${route}.\nMessage: ${err}`);
  }
}

/**
 * 
 * @param {string} dir 
 * @returns {Promise}
 */
function ensureDirExists(dir) {
  try {
    return fs.mkdirSync(dir, {recursive: true});
  } catch (err) {
    throw new Error(`Error: Failed to create directory for path ${dir}.\nMessage: ${err}`);
  }
}

/**
 * @param {object} page
 * @param {string} pageUrl 
 * @returns {string|number}
 */
async function getHTMLfromPuppeteerPage(page, pageUrl, idx) {
  const url = new URL(pageUrl)
  try {
    if (!pageUrl.includes('/route/')) {
      if (pageUrl.includes('search')) {
        await page.waitForSelector(`a[href="${url.pathname}"]`)
        await page.click(`a[href="${url.pathname}"]`)
        await new Promise((resolve) => {setTimeout(resolve, 500)})
      } else if (pageUrl.endsWith('/board')) {
        await page.waitForSelector(`a[href="${url.pathname}"]`)
        await page.click(`a[href="${url.pathname}"]`)
        await new Promise((resolve) => {setTimeout(resolve, 500)})
      }
    } else {
        const lang = pageUrl.split('/').slice(-3)[0]
        const q = pageUrl.split('/').slice(-1)[0];
        await page.waitForSelector('style[prerender]', {timeout: 5000})
        await page.evaluate(`document.querySelector('style[prerender]').innerText = ''`)
        await page.click(`[id="${lang}-selector"]`)
        await page.evaluate((q) => {
            // programmatically change the search route value
            var input = document.getElementById('searchInput');
            var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(input, q);
            var ev2 = new Event('input', { bubbles: true});
            input.dispatchEvent(ev2);
        }, q)
        await page.waitForSelector(`input[id="${q}"][value="${q}"]`, {timeout: 5000});
    }
  } catch (err) {
    let content = '';
    try {
      const html = await page.content();
      const dom = new jsdom.JSDOM(html);
      content = dom.serialize();
    } catch (err2) {

    }
    throw new Error(`Error: Failed to build HTML for ${pageUrl}.\nMessage: ${err}\nContent: ${content}`);
  }
  try {
    const html = await page.content();
    if (!html) return 0;

    const dom = new jsdom.JSDOM(html)
    const css = cleanCss.minify(Array.prototype.map.call(dom.window.document.querySelectorAll('style[data-jss]'), e => e.textContent).join('')).styles
    dom.window.document.querySelectorAll('style[data-jss]').forEach(e => e.parentNode.removeChild(e))
    dom.window.document.querySelectorAll('img[role=presentation]').forEach(e => {e.style.opacity = 1; e.className = `${e.className} leaflet-tile-loaded`})
    dom.window.document.querySelector('style[prerender]').textContent = css
    
    return dom.serialize();
  } catch(err) {
    throw new Error(`Error: Failed to build HTML for ${pageUrl}.\nMessage: ${err}`);
  }
}

/**
 * @param {string} baseUrl 
 * @param {string[]} routes 
 * @param {string} dir 
 * @returns {number|undefined}
 */
async function runPuppeteer(baseUrl, routes, dir) {
  let start = Date.now();
  const instances = [0, 1];
  console.log(routes);
  const queue = [...routes.reverse()];
  const promised = instances.map(
    async (k) => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      page.setRequestInterception(true);
      page.on('request', (request) => {
        // block map loading
        if (request.url().includes(process.env.REACT_APP_OSM_PROVIDER_HOST))
          request.abort();
        else
          request.continue()
      })
      page.setUserAgent('prerendering');
      let route = queue.pop();
      let idx = 0;
      await page.goto(`${baseUrl}${route}`, {waitUntil: 'networkidle0'});
      await page.waitForTimeout(10000);
      do {
        try {
          console.log(`Processing route "${route}"`);
          let html = undefined;          
          for (let trial = 0; trial < 3; trial++) {
            try {
              html = await getHTMLfromPuppeteerPage(page, `${baseUrl}${route}`, idx);
              break;
            } catch (e) {
              console.log(`error on processing route "${route}". trial ${trial}`);
              if (trial === 2) {
                throw e;
              }
              await page.goto(`${baseUrl}${route}`, {waitUntil: 'networkidle0'});
              await page.waitForTimeout(10000);
              continue;
            }
          }
          if (html) createNewHTMLPage(route, html, dir);
          else return 0;
        } catch (err) {
          console.error(`Error: Failed to process route "${route}"\nMessage: ${err}`);
          process.exit(1);
        }
        idx = idx + 1;
        route = queue.pop();
      } while (route !== undefined)
      await browser.close();
    }
  )
  await Promise.all(promised);
  
  console.log( ( 'Finished in ' + (Date.now() - start ) / 1000) + "s.");
  start = Date.now();
  return;
} 

async function run() {
  const options = await readOptionsFromFile();
  const staticServerURL = await runStaticServer(options.port || 3000, options.routes || [], options.buildDirectory || './build');

  if (!staticServerURL) return 0;

  await runPuppeteer(staticServerURL, ["/"].concat(options.routes), options.buildDirectory || './build');
  console.log('Finish react-spa-prerender tasks!');
  process.exit();
}
   
run()
