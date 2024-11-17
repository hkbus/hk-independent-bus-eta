# Docker

You can deploy hkbus using docker.

## Development

```bash
docker compose up -d
```

Check out https://localhost:5173 in the browser

* If you prefer port other than 5173, add `DEV_PORT=<PORT_NUMBER>` in `.env` file.

## Build

### Using docker

```bash
docker compose run dev yarn build
```

## Deploy

```bash
docker compose run dev yarn deploy
```
