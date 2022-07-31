FROM node:18-alpine as build

ARG env
ENV env $env

ARG GENERATE_SOURCEMAP
ENV GENERATE_SOURCEMAP $GENERATE_SOURCEMAP

ARG CI
ENV CI $CI

ARG PRERENDER
ENV PRERENDER $PRERENDER

ARG NEXT_PUBLIC_OSM_PROVIDER_HOST
ENV NEXT_PUBLIC_OSM_PROVIDER_HOST $NEXT_PUBLIC_OSM_PROVIDER_HOST

ARG NEXT_PUBLIC_OSM_PROVIDER_URL
ENV NEXT_PUBLIC_OSM_PROVIDER_URL $NEXT_PUBLIC_OSM_PROVIDER_URL

ARG NEXT_PUBLIC_OSM_PROVIDER_URL_DARK
ENV NEXT_PUBLIC_OSM_PROVIDER_URL_DARK $NEXT_PUBLIC_OSM_PROVIDER_URL_DARK

ARG NEXT_PUBLIC_CI_JOB_ID
ENV NEXT_PUBLIC_CI_JOB_ID $NEXT_PUBLIC_CI_JOB_ID

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

RUN if [ "$env" = "dev" ]; then mkdir build; else yarn build; fi;

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

CMD if [ "$env" = "dev" ]; then yarn start; else serve -s out; fi;
