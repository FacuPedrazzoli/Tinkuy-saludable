# Docker — Tinkuy-saludable

## Canonical Dokploy file

`docker-compose.yml` (this directory) is the **canonical file for Dokploy**.

Point Dokploy at this repo and select `docker-compose.yml` as the compose file.
Supply environment variables via Dokploy's environment panel — use
`env.example.dokploy` as the reference for every required variable.

Dokploy's built-in Traefik instance handles domain routing and SSL.
No nginx service is included.

**The frontend calls the backend via the public `NEXT_PUBLIC_GRAPHQL_URL`.**
There is no Docker network link between this repo and the backend repo — each
repo is an independent Dokploy application.

## Local development

`docker-compose.override.yml` is loaded **automatically** by `docker compose`
when you run locally. It publishes the host port so you can reach the frontend:

| Service    | Host port |
|------------|-----------|
| `frontend` | 3000      |

```bash
cp env.example.dokploy .env
# Fill in .env (at minimum: NEXT_PUBLIC_GRAPHQL_URL, NEXT_PUBLIC_TENANT_ID)
docker compose up -d
```

For local end-to-end development, start the backend repo first (its override
publishes port 4000) and set `NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql`.

Dokploy uses only `docker-compose.yml` — the override is never deployed.

## Services

| Service    | Build file   | Port | Notes                     |
|------------|--------------|------|---------------------------|
| `frontend` | `Dockerfile` | 3000 | Next.js standalone server |

No database. No Redis. No `depends_on`.

## NEXT_PUBLIC_* build-arg requirement

`NEXT_PUBLIC_*` variables are baked into the JavaScript bundle at build time.
They are declared as both `build.args` (for the `npm run build` stage) and as
`environment` entries (for SSR code paths that read `process.env` at request
time). Changing any `NEXT_PUBLIC_*` value requires a **full image rebuild** —
a container restart alone will not pick up the new value.

## Superseded / reference-only compose files

These files are kept for historical reference. Do not use them for new deployments.

| File                          | Status                                                                  |
|-------------------------------|-------------------------------------------------------------------------|
| `docker-compose.production.yml` | Superseded — earlier unified root compose (frontend + backend + nginx) |
| `docker-compose.root.yml`       | Superseded — earlier dev root compose                                   |
| `docker-compose.prod.root.yml`  | Superseded — earlier production root compose with nginx                 |
