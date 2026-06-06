# gitbit

Try me: <https://gitbit.mthy.dev>

A self-hosted, ephemeral git server with a built-in web UI. Generate throwaway repositories on demand, push to them over HTTP, browse them in the browser. Repos auto-expire after 30 days.

Built with Nuxt 3 and `git-http-backend`.

## Features

- One-click repo generation with a single-use credential
- HTTP push/pull via `git-http-backend` (Basic auth on push, public clone)
- Web UI to browse repositories, commits, trees, blobs, and diffs
- Daily cron-driven cleanup of repos older than 30 days

## Running with Docker

```bash
docker compose up -d
```

## Usage

1. Open the UI and click **Generate Repo**.
2. Copy the clone URL and credential (the credential is shown once).
3. Push as instructed:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://user:<credential>@<host>/<repo>.git
   git push -u origin main
   ```

Cloning is unauthenticated; pushing requires the credential as the HTTP password.

## Configuration

Environment variables:

| Variable        | Default            | Purpose                                 |
| --------------- | ------------------ | --------------------------------------- |
| `PORT`          | `3000`             | HTTP port                               |
| `GITBIT_ROOT`   | `~/gitbit-repos`   | Directory where bare repos are stored   |
| `GIT_BINARY`    | `git`              | Path to the `git` executable            |

## Cleanup

`scripts/cleanup.mjs` removes repos older than 30 days and prunes their credentials. In Docker it runs daily at midnight via `cron`. Run it manually with:

```bash
node scripts/cleanup.mjs [maxAgeDays]
```

## Project layout

- `pages/` — UI routes (repo list, tree, blob, commits, diff)
- `server/api/repos/` — REST endpoints for listing and generating repos
- `server/middleware/git.ts` — proxies git smart-HTTP requests to `git-http-backend`
- `server/utils/` — config, credential store, git helpers
- `scripts/cleanup.mjs` — expiry cron job
