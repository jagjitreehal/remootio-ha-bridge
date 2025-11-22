# Remootio → Home Assistant Bridge

Small Node.js service that connects to a Remootio 3 gate/garage opener via its
encrypted WebSocket API and exposes a simple HTTP interface that Home Assistant
can talk to via `rest` and `template cover`.

## Features

- Uses the official `remootio-api-client` package
- Tracks gate state via Remootio events
- Exposes `/state`, `/open`, `/close`, `/trigger` endpoints
- Docker image with `.env` configuration
- Example Home Assistant YAML for `sensor` + `rest_command` + `cover`

## Configuration

Create a `.env` file based on `.env.example`:

```env
REMOOTIO_HOST=192.168.1.123
REMOOTIO_SECRET=YOUR_SECRET_KEY_HERE
REMOOTIO_AUTH=YOUR_AUTH_KEY_HERE
PORT=3000
