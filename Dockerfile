FROM node:lts as build-deps
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn set version latest
RUN yarn
COPY . ./
RUN yarn build

FROM nginx:alpine
COPY ./build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]