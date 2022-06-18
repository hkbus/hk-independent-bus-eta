# Docker

You can deploy hkbus using docker.

## Env

```bash
cp docker/docker.env docker/.env
# copy template
```

```bash
# docker/.env

env=
# set this to true to enable hot reload

port=3000
# you must set a port. the app is deployed on this port

PRERENDER=
# set to true to enable prerender of pages (warning: takes about 30 minutes)
# this is only for local building

# do not change other variables
```

## Build

### Using docker

```bash
yarn docker:build -t hkbus
```

### Using docker-compose

```bash
cd docker && docker-compose build
```

## Deploy

### Using yarn

```bash
yarn docker
```

### Manually

```bash
cd docker && docker-compose up -d --build
```

## Prebuilt images

> For reference only. It is recommended to build locally.

> **_WARNING:_** The images are built by wcyat on [gitlab](https://gitlab.com/wcyat/hkbus).
> The image might be different (very likely) from what you can build from here.

### Latest

The latest lag contains the latest build (by wcyat), but WITHOUT any prerendered html (so you might expect bad seo).

#### Pull

```bash
docker pull registry.gitlab.com/wcyat/hkbus/master:latest
```

#### Run

```bash
docker run -t -d -p 3000:3000 registry.gitlab.com/wcyat/hkbus/master:latest
# deploys on port 3000
```

### Full

The "full" tag contains a random build and is built every week,
with prerendered html (better seo, should have a same behavior as [hkbus.app](https://hkbus.app)).

#### Pull

```bash
docker pull registry.gitlab.com/wcyat/hkbus/master:full
```

#### Run

```bash
docker run -t -d -p 3000:3000 registry.gitlab.com/wcyat/hkbus/master:full
# deploys on port 3000
```
