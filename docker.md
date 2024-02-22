# Docker

You can deploy hkbus using docker.

## Development

```bash
docker compose up -d
```

Check out http://localhost:3000 in the browser

* If you prefer port other than 3000, add `DEV_PORT=<PORT_NUMBER>` in `.env` file.

## Build

### Using docker

```bash
docker compose run dev yarn build
```

## Deploy

```bash
docker compose run dev yarn deploy
```
