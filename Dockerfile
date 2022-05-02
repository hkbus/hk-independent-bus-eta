FROM node:lts as build-deps
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
RUN yarn set version latest
RUN yarn install
COPY . ./
RUN yarn run build

FROM nginx:alpine
COPY --from=build-deps /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]