# trial-mongodb

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![Repository size](https://img.shields.io/github/repo-size/kamaslau/trial-mongodb?color=56BEB8)

A [MongoDB](https://www.mongodb.com/docs/) bootstraper, using [mongo-express](https://github.com/mongo-express/mongo-express) as dashboard UI, and [official Node.js client driver](https://www.mongodb.com/docs/drivers/node/current/quick-start/).

For desktop GUI, consider [MongoDB Compass](https://www.mongodb.com/products/compass).

## Service URL

- Database (MongoDB) [http://localhost:27017](http://localhost:27017)
- Web UI (mongo-express) [http://localhost:8081](http://localhost:8081)

## Default user

None, as default.

## Usage

### Start up with [Docker Compose](https://docs.docker.com/compose/)

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

Launch database first, then the UI.

#### MongoDB

```bash
docker run -p 27017:27017 -d --restart unless-stopped --name=mongo mongodb/mongodb-community-server:latest
```

#### mongo-express

Pass in to link the database container with param `--link database-container-name:db` .

```bash
docker run -p 8081:8081 -d --restart unless-stopped --link mongo:db --name mongo-express mongo-express:latest
```

## Test Drive

Requires Node.js 24 or newer; `.ts` files run natively without a build step.

```bash
# Run once
pnpm start
# Watch mode, restarts on file changes
pnpm start:dev
```

### Further operations

```bash
# Enter container and initiate shell
docker exec -it mongo mongosh
```

## References

- [MongoDB on DockerHub](https://hub.docker.com/r/mongodb/mongodb-community-server)
- [mongo-express on DockerHub](https://hub.docker.com/_/mongo-express/)
- https://www.mongodb.com/docs/manual/tutorial/install-mongodb-community-with-docker/
