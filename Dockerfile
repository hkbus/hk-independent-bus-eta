FROM node:17 as build

ARG env
ENV env $env

WORKDIR /usr/src/app

COPY ./package.json ./
COPY ./yarn.lock ./
COPY ./tsconfig.json ./

RUN yarn install --ignore-optional

COPY ./src ./src
COPY ./public ./public
COPY ./.env ./.env

RUN if [ "$env" = "dev" ]; then mkdir build; else yarn build; fi;

FROM node:17

WORKDIR /usr/src/app

COPY ./package.json ./
COPY ./yarn.lock ./
COPY ./tsconfig.json ./

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/build ./build

CMD if [ "$env" = "dev" ]; then yarn start; else npx -y serve -s build; fi;
