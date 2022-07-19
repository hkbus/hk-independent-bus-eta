FROM node:18-alpine as build

ARG env
ENV env $env

ARG GENERATE_SOURCEMAP
ENV GENERATE_SOURCEMAP $GENERATE_SOURCEMAP

ARG CI
ENV CI $CI

ARG PRERENDER
ENV PRERENDER $PRERENDER

ARG REACT_APP_OSM_PROVIDER_HOST
ENV REACT_APP_OSM_PROVIDER_HOST $REACT_APP_OSM_PROVIDER_HOST

ARG REACT_APP_OSM_PROVIDER_URL
ENV REACT_APP_OSM_PROVIDER_URL $REACT_APP_OSM_PROVIDER_URL

ARG REACT_APP_OSM_PROVIDER_URL_DARK
ENV REACT_APP_OSM_PROVIDER_URL_DARK $REACT_APP_OSM_PROVIDER_URL_DARK

ARG REACT_APP_CI_JOB_ID
ENV REACT_APP_CI_JOB_ID $REACT_APP_CI_JOB_ID

ARG REACT_APP_COMMIT_HASH
ENV REACT_APP_COMMIT_HASH $REACT_APP_COMMIT_HASH

ARG REACT_APP_COMMIT_MESSAGE
ENV REACT_APP_COMMIT_MESSAGE $REACT_APP_COMMIT_MESSAGE

ARG REACT_APP_COMMIT_VERSION
ENV REACT_APP_COMMIT_VERSION $REACT_APP_COMMIT_VERSION

ARG REACT_APP_REPO_URL
ENV REACT_APP_REPO_URL $REACT_APP_REPO_URL

WORKDIR /usr/src/app

COPY ./package.json ./
COPY ./yarn.lock ./
COPY ./tsconfig.json ./

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN if [ "$PRERENDER" = "true" ] || [ "$env" = "dev" ]; then yarn install; else yarn install --production --ignore-optional; fi;

COPY ./src ./src
COPY ./public ./public
COPY ./scripts ./scripts

RUN if [ "$env" = "dev" ]; then mkdir build; else yarn build; fi;

COPY ./scripts ./scripts
RUN if [ "$PRERENDER" = "true" ]; then ./scripts/puppeteer-deps.sh; fi;
RUN if [ "$PRERENDER" = "true" ] && [ "$env" != "dev" ]; then node scripts/sitemap-generator.js && node scripts/pre-rendering.js; fi;

FROM node:18-alpine

ARG env
ENV env $env

WORKDIR /usr/src/app

COPY ./package.json ./
COPY ./yarn.lock ./
COPY ./tsconfig.json ./

COPY --from=build /usr/src/app/build ./build

RUN yarn global add serve
RUN if [ "$env" = "dev" ]; then yarn install && yarn cache clean; fi;

CMD if [ "$env" = "dev" ]; then yarn start; else serve -s build; fi;
