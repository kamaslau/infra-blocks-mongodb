# infra-blocks-mongodb

[![Blocks](https://img.shields.io/badge/infra--blocks-index-555?style=flat-square)](https://github.com/kamaslau/infra-blocks)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![Repository size](https://img.shields.io/github/repo-size/kamaslau/infra-blocks-mongodb?color=56BEB8)

A unit, not a demo: one service, one port, one documented credential, disposable with a single command.

Typical use: document data, or a schema that is still moving and a migration per week would be wasted work.

[MongoDB](https://www.mongodb.com/docs/) with the [official Node.js driver](https://www.mongodb.com/docs/drivers/node/current/quick-start/). For a desktop GUI, use [MongoDB Compass](https://www.mongodb.com/products/compass).

## Service URL

- Database (MongoDB) `localhost:27017`

Ports can be changed in `.env`; see Usage.

## Default user

None by default — the container starts without auth. That is acceptable only while the port is not reachable from outside the machine; see *Why this shape* before putting this on a host with a public interface.

## Usage

### Start with [Docker Compose](https://docs.docker.com/compose/)

```bash
# Initiate .env file
cp .env.example .env
# Start services
docker compose up -d
```

Update existing composed containers with latest images:

```bash
docker compose pull && \
docker compose down && \
docker compose up -d
```

### Start services individually

```bash
docker run -p 27017:27017 -d --restart unless-stopped --name=mongo mongodb/mongodb-community-server:latest
```

### Further operations

```bash
# mongosh inside the container
docker exec -it mongo mongosh
```

## Verify

```bash
docker compose exec -T mongo mongosh --quiet --eval 'db.runCommand({ping:1})'
```

`{ ok: 1 }` means the server is answering. A driver-level check is in `src/` — `pnpm start` connects with the official Node.js driver and writes one document, which is the closer proof if the client is a Node service.

### What the demo reports when it fails

`src/index.ts` connects, inserts three documents, reads them back, and prints one line per step, using [http-response-text](https://github.com/kamaslau/http-response-text) for the status text:

```bash
cp .env.example .env
pnpm install
pnpm start
# Connect (200 OK) mongodb://localhost:27017
# Insert (201 Created) { insertedCount: 3 }
# FindAll (200 OK) { count: 3 }
```

A failure replaces the step's line, and the exit code says whether the run was usable:

| What happened | Line in the log | Exit code |
|---|---|---|
| Nothing answers on `DB_URL` | `Connect (503 Service Unavailable) connect ECONNREFUSED 127.0.0.1:27017` | `1` |
| Write refused as a duplicate key | `Insert (409 Conflict) E11000 duplicate key error …` | `1` |
| Write or read rejected by the server | `Insert (500 Internal Server Error) …` | `1` |
| Read comes back empty | `FindAll (404 Not Found) { count: 0 }` | `0` |

The connection attempt gives up after five seconds instead of the driver's default thirty, so a wrong `DB_URL` fails while you are still watching the terminal. Nothing is cleared between runs, so `count` grows by three each time — `docker compose down -v` is what empties it. `PORT` and `DB_URL` move together: changing the published port in `.env` without changing `DB_URL` reproduces the `503` above. Message language follows `LANG` / `LC_ALL` — `en`, `zh`, `ja`, anything else falls back to English.

## Why this shape

A single node with no replica set, deliberately. The question this unit answers is "can this app talk to a document store", not "does the cluster survive a node loss"; adding a replica set triples the setup and the memory for a question nobody asked at this stage.

The dashboard is the official driver rather than a bundled web UI: the thing that breaks in practice is the connection string, and a Node script that uses the same driver as the application fails in the same way the application will. `docker exec ... mongosh` covers the interactive case.

No auth means no credential to document, which is also why the compose file publishes only the one port and nothing else is exposed. If the host is reachable from outside, add `--auth` and create a user before the first `up` — doing it after the fact leaves the data written while the database was open.

Data is on a named volume at `/data/db`, so it survives `down` and only `down -v` removes it. That is also why the unit is safe to hand over: the disposal step is one flag, and it is written down.

## Notes for deployments in China

`mongodb/mongodb-community-server` is a large image and pulls slowly through a congested link; pull it before the machine moves behind a client firewall. If the app is also in this repo's `src/`, run `pnpm install` with a registry mirror configured, since the driver and its dependencies are not cached on a fresh host.

---

Part of [infrastructure blocks](https://github.com/kamaslau/infra-blocks) · ← back to index
