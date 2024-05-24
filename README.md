# Persistent Cache API

This project implements a persistent cache API using TypeScript, Express, and SQLite. It provides an API for creating, retrieving, updating, and deleting cache entries with time-to-live (TTL) functionality.

## Features

- Create Cache Entry: Add a new cache entry with a key, value, and TTL.
- Get Cache Entry: Retrieve a cache entry by its key.
- Get TTL: Retrieve the time-to-live (TTL) of a cache entry.
- Update TTL: Update the TTL of a cache entry.
- Delete Cache Entry: Delete a cache entry by its key.
- Persistent Storage: Use SQLite for persistent storage of cache entries.

## Installation

Node version 18.12.0

```sh
npm install
```

## Usage

```sh
npm run dev
```

The server will start on port 3000 by default. You can access the API at `http://localhost:3000`.

Swagger documentation is available at `http://localhost:3000/api-docs`.

Http file is available at `src/http`
