# CivicLens

A full-stack community-issue tracker built as a Codecademy bootcamp capstone. Users can report and discuss local issues (potholes, broken streetlights, graffiti, etc.).

**Live:** https://civic-lens.fly.dev/
**Repo:** https://github.com/jacobjeffery/civic-lens

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite + react-router-dom + axios |
| Backend | Node + Express + Sequelize |
| Database | PostgreSQL (Neon-hosted in prod, local Homebrew Postgres in dev) |
| Auth | bcrypt + JWT (stored client-side in `localStorage`) |
| Web server | Caddy (serves static frontend, proxies `/api/*` to the backend) |
| Container | Docker (multi-stage build) |
| Hosting | Fly.io |

---

## Repository layout

```
civic-lens/
├── backend/                    Express API
│   ├── src/
│   │   ├── config/database.js  Sequelize connection (uses DATABASE_URL in prod)
│   │   ├── controllers/        issues.js, auth.js
│   │   ├── middleware/auth.js  JWT verification
│   │   ├── models/             Issue, User
│   │   ├── routes/             /issues, /auth
│   │   └── app.js
│   ├── server.js               Entry point (loads dotenv, syncs DB, starts listening)
│   └── requests.http           VS Code REST Client test scenarios
├── frontend/                   Vite + React
│   └── src/
│       ├── pages/              Login, Register, IssueList, IssueDetail, CreateIssue
│       ├── components/         ProtectedRoute, Nav (in App.jsx)
│       └── services/           api.js, auth.js, issues.js
├── Dockerfile                  Multi-stage build: frontend build → runtime image
├── Caddyfile                   Reverse proxy + static file serving
├── start.sh                    Launches node + caddy in the container
├── fly.toml                    Fly app config
└── civic-lens.md               Original assignment spec (6 phases)
```

---

## Local development

### Prerequisites
- Node.js 20+
- PostgreSQL running locally (`brew install postgresql && brew services start postgresql`)
- A `civiclens` database (`createdb civiclens` or via `psql -U $(whoami) postgres` then `CREATE DATABASE civiclens;`)

### Backend
```bash
cd backend
npm install
cp .env.example .env       # fill in DB credentials and a JWT_SECRET
npm run dev                # listens on 127.0.0.1:4000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                # listens on 127.0.0.1:5173
```

Visit http://localhost:5173.

### Testing endpoints
`backend/requests.http` — open in VS Code with the **REST Client** extension; click "Send Request" above any block. Token from login is captured automatically and reused on protected requests.

---

## Production architecture

A single Fly machine runs **both** Node (backend) and Caddy (reverse proxy + static file server) in one container. Postgres is hosted separately on Neon (free tier) and reached over the public internet via SSL.

```
                       ┌────────────────────────────────────┐
   Browser ─── HTTPS ──▶│  Fly edge                          │
                       │  (TLS termination)                  │
                       └─────────────┬──────────────────────┘
                                     │ HTTP :8080
                                     ▼
                       ┌────────────────────────────────────┐
                       │  Container                          │
                       │                                     │
                       │  Caddy :8080                        │
                       │   /        → /app/frontend/dist     │
                       │   /api/*   → localhost:4000 (strip) │
                       │                                     │
                       │  Express :4000                      │
                       │   /issues, /auth/...                │
                       └─────────────┬──────────────────────┘
                                     │ TLS
                                     ▼
                       ┌────────────────────────────────────┐
                       │  Neon Postgres                      │
                       └────────────────────────────────────┘
```

---

## Deployment

### One-time setup
```bash
brew install flyctl
fly auth login
fly launch                       # generates fly.toml; skip Postgres when prompted
```

Sign up for a Neon Postgres database and copy its connection string.

```bash
fly secrets set --stage \
  DATABASE_URL="postgresql://..." \
  JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")" \
  DB_SSL=true
```

### Subsequent deploys
```bash
fly deploy
```

Check status:
```bash
fly status
fly logs
```

---

## Hurdles and how they were solved

### 1. Vite environment variables refused to bake into the production bundle

**What I expected:** `import.meta.env.VITE_API_URL` would pick up the value set by Docker's `ENV VITE_API_URL=/api` line, so production calls would go to `/api` and local dev would fall back to `http://127.0.0.1:4000`.

**What actually happened:** the built JS bundle always inlined `http://127.0.0.1:4000`, regardless of:
- `ENV VITE_API_URL=/api` in the Dockerfile
- `RUN echo "VITE_API_URL=/api" > .env.production` before `npm run build`
- A `vite.config.js` `define: { 'import.meta.env.VITE_API_URL': JSON.stringify(...) }` block

Vite 8 appears to handle `import.meta.env.*` specially — `define` overrides are not honored for that namespace, and `.env.production` wasn't being picked up either (possibly a regression or undocumented change in v8). The build hash never changed, no matter what env var we set.

**The fix that actually worked:** ditch build-time env injection. Detect the environment at runtime in `services/api.js` by reading `window.location.hostname`:

```js
const isLocal = typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")

const api = axios.create({
    baseURL: isLocal ? "http://127.0.0.1:4000" : "/api"
})
```

This sidesteps Vite's env-handling entirely. It also keeps the bundle identical across environments — only behavior differs at runtime.

### 2. Fly's `Managed Postgres` is no longer free

Fly deprecated their unmanaged free Postgres tier and now only offer "Managed Postgres" at ~$38/month. Not viable for a learning project.

**Fix:** swap to **Neon** (https://neon.tech) — free tier with 3GB storage, Postgres-native, no card on file. Connection string format works with Sequelize as-is.

### 3. Sequelize SSL required for Neon but breaks locally

Neon requires SSL connections. My initial `database.js` enabled SSL whenever `DATABASE_URL` was set, which broke local testing against Homebrew Postgres (which doesn't speak SSL).

**Fix:** make SSL conditional on a separate env var. Default to off; set `DB_SSL=true` as a Fly secret in production only:

```js
const sslOptions = process.env.DB_SSL === "true"
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {}
```

### 4. `npm ci` was strict about platform-specific transitive deps

The Dockerfile initially used `npm ci`, which is the recommended approach for reproducible Docker builds. It failed with `Missing: @emnapi/core, @emnapi/runtime from lock file` because those packages are platform-specific (Linux-only helpers that don't get resolved on macOS, where the lockfile was generated).

**Fix:** switch to `npm install` in the Dockerfile. Slightly slower; tolerant of platform differences. Acceptable trade-off for a learning project.

### 5. `wait -n` not supported in dash

`start.sh` uses `wait -n` to exit if either Node or Caddy crashes. The `node:20-slim` base image's default shell is dash, which doesn't support `-n`. Original `#!/bin/sh` shebang failed with `Illegal option`.

**Fix:** changed shebang to `#!/bin/bash`. Bash is preinstalled in node:20-slim.

### 6. Vite cache trip-up on the first deploy

After the initial `fly deploy`, even `--no-cache` deploys produced the same bundle hash because Vite's content-based hashing meant no actual code change → identical output. Made the "is the env var fix working?" debugging very confusing.

**Lesson:** Vite bundle hash is content-derived; if the source code doesn't change, the hash doesn't either, even after `rm -rf dist`. The proof that `define` wasn't working came from `grep`-ing the bundle for the URL, not from rebuilding.

---

## What I'd do differently next time

- **Set up build-time env injection from day one**, even if it's just a `.env.production` file. Adding it later means discovering bundler quirks under deployment pressure.
- **Add CORS earlier.** I removed `app.use(cors())` from `backend/src/app.js` during cleanup (it was unused while the frontend didn't exist yet) and forgot it. Wasted time debugging "no token" when the actual error was CORS-failed during cross-origin preflight in local dev.
- **Use Docker Compose for local dev with Postgres in a container.** Would have made the "swap from local Postgres to Neon" transition more obvious — same connection string pattern in both environments.
- **Wire up at least one smoke test in CI before deploying.** A 30-second test that hits `/auth/register` and `/issues` would have caught the production-URL bug long before I noticed it manually.
