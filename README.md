# CivicLens

A full-stack community-issue tracker built as a Codecademy bootcamp capstone. Users can report and discuss local issues (potholes, broken streetlights, graffiti, etc.).

**Live:** https://civic-lens.fly.dev/

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite + react-router-dom + axios |
| Styling | Bootstrap 5 (vanilla classes, no React-Bootstrap wrapper) |
| Backend | Node + Express + Sequelize |
| Database | PostgreSQL (Neon-hosted in prod, local Homebrew Postgres in dev) |
| Auth | bcrypt + JWT (stored client-side in `localStorage`) |
| Web server | Caddy (serves static frontend, proxies `/api/*` to the backend) |
| Container | Docker (multi-stage build) |
| Hosting | Fly.io |
| Tests | Jest + Supertest (backend smoke tests) |
| CI/CD | GitHub Actions — run tests, then `fly deploy` on push to main |

---

## Repository layout

```
civic-lens/
├── .github/workflows/
│   └── fly-deploy.yml             Two-stage CI: backend tests → fly deploy
├── backend/                       Express API
│   ├── src/
│   │   ├── config/database.js     Sequelize connection (DATABASE_URL in prod, DB_* vars locally)
│   │   ├── constants/categories.js Canonical list of issue categories
│   │   ├── controllers/           issues.js, auth.js
│   │   ├── middleware/            auth.js (required), optionalAuth.js (sets req.user if token present, no rejection)
│   │   ├── models/                Issue, User, Vote
│   │   ├── routes/                /issues (incl. /mine, /categories, /:id/vote), /auth
│   │   └── app.js
│   ├── tests/api.test.js          Backend smoke tests
│   ├── server.js                  Entry point (loads .env or .env.test, syncs DB, listens)
│   └── requests.http              VS Code REST Client test scenarios
├── frontend/                      Vite + React
│   └── src/
│       ├── pages/                 Login, Register, IssueList, IssueDetail, CreateIssue
│       ├── components/            ProtectedRoute (Nav lives in App.jsx)
│       └── services/              api.js, auth.js, issues.js, categories.js
├── Dockerfile                     Multi-stage build: frontend build → runtime image
├── Caddyfile                      Reverse proxy + static file serving
├── start.sh                       Launches node + caddy in the container
├── fly.toml                       Fly app config
└── civic-lens.md                  Original assignment spec (6 phases)
```

---

## Features

- **Auth** — register, login, JWT-based session, logout
- **Issues** — list, view, create, update, delete with ownership enforcement
- **Open/close lifecycle** — owners can close (and reopen) their own issues without deleting them
- **Voting** — any logged-in user can vote on an issue once; clicking again removes the vote. Enforced by a unique constraint in the `Votes` table.
- **Filtering** — by category and status; combinable
- **My Issues toggle** — switch the list to only the logged-in user's issues
- **Category enum** — backend enforces a canonical list (`backend/src/constants/categories.js`); frontend fetches it from `/issues/categories`
- **Protected routes** — `/issues/new` redirects unauthenticated users to `/login`
- **Conditional nav** — Login/Register hidden when authenticated; Logout shown
- **Responsive UI** — Bootstrap forms with floating labels, table view with status badges, mobile-friendly grid

---

## Local development

### Prerequisites
- Node.js 20+
- PostgreSQL running locally (`brew install postgresql && brew services start postgresql`)
- A `civiclens` database (`createdb civiclens` or via `psql -U $(whoami) postgres` then `CREATE DATABASE civiclens;`)
- A `civiclens_test` database for the test suite (`CREATE DATABASE civiclens_test;`)

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

### Running tests
```bash
cd backend
npm test
```

Runs five smoke tests against `civiclens_test`. The schema is wiped (`sync({ force: true })`) before each run, so the suite is idempotent.

### Testing endpoints manually
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

## CI/CD

GitHub Actions runs on every push to `main`:

1. **Test job** — spins up a Postgres 16 service container, installs backend deps, writes a temp `.env.test`, runs `npm test`. If any test fails, the workflow stops here.
2. **Deploy job** — `flyctl deploy --remote-only`. Only runs if the test job passed.

Workflow: [`.github/workflows/fly-deploy.yml`](.github/workflows/fly-deploy.yml).

Secrets needed in the GitHub repo (Settings → Secrets and variables → Actions):
- `FLY_API_TOKEN` — generated via `fly tokens create deploy`

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
A push to `main` triggers GitHub Actions. To deploy manually:
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

### 7. Floating labels needed the right child order and a placeholder

Bootstrap's `form-floating` uses CSS sibling selectors and `:placeholder-shown` to detect focus and emptiness. Two non-obvious requirements:

- **Input must come before label** in the markup. Reverse them and the float animation doesn't fire.
- **Every input needs a `placeholder` attribute** (even a single character). Without it, `:placeholder-shown` is always false and the label stays floated up even when the field is empty.

### 8. Category enum drift after switching to a canonical list

After introducing `backend/src/constants/categories.js` with capitalized names ("Roads", "Streetlights", etc.), existing rows that had lowercase categories ("roads") still rendered fine on read but caused tests and writes to fail validation. The schema didn't change — the validator was added in-app — but the data didn't match.

**Fix:** truncate the affected tables and start fresh:
```bash
psql "<DATABASE_URL>" -c 'TRUNCATE "Issues" RESTART IDENTITY CASCADE;'
```

Lesson: when introducing data-shape constraints to an existing app, decide upfront whether to enforce in DB (with a migration) or in app code (with a one-off cleanup). I went with app-level validation (`Sequelize`'s `validate.isIn`) + manual cleanup.

---

## Future work / known gaps

- **Cold start on first visit.** `fly.toml` has `min_machines_running = 0`, so Fly auto-stops the machines after idle. The first request after a quiet period takes ~5–15 seconds while a machine wakes up, and the page may render empty during the hang. A refresh always works. The fix is `min_machines_running = 1` (keeps one machine warm 24/7); left at 0 deliberately to stay safely inside the free tier.
- **Admin users and roles.** Currently authorization is binary — you either own a resource or you don't. A real civic app would have moderators (close anyone's issue, edit miscategorized ones) and admins (delete users, manage the category list). That'd need a `role` field on the User model, role-aware middleware, and a way to manage roles. Worth doing alongside an `/admin` page that lists pending moderation work.
- **Issue comments.** No discussion thread yet. Would need a `Comment` model with `userId` + `issueId`, plus UI on the detail page.
- **Reverse-chronological ordering by default.** The issues list currently shows oldest first because that's Postgres's natural insertion order. Newer-first would need an `order: [["createdAt", "DESC"]]` on the `findAll` calls.
- **Pagination.** All issues are returned in one response — fine at 32 rows, ugly at 3,200. Would need offset/limit query params and frontend pagination controls.
- **Hide the Delete button for non-owners.** Currently the detail page only shows it to owners (since #2026-06-09 refactor), but anonymous viewers can still try via the API (and get a 401). Could simplify the API by making the route ownership-aware.

---

## What I'd do differently next time

- **Set up build-time env injection from day one**, even if it's just a `.env.production` file. Adding it later means discovering bundler quirks under deployment pressure.
- **Add CORS earlier.** I removed `app.use(cors())` from `backend/src/app.js` during cleanup (it was unused while the frontend didn't exist yet) and forgot it. Wasted time debugging "no token" when the actual error was CORS-failed during cross-origin preflight in local dev.
- **Use Docker Compose for local dev with Postgres in a container.** Would have made the "swap from local Postgres to Neon" transition more obvious — same connection string pattern in both environments.
- **Write the test suite before the deployment hurdles.** I added Jest + Supertest in Phase 6 — after CI was already deploying without checks. Having even one smoke test from day one would have caught the production-URL bug before manual verification did.
- **Treat constants as schema.** I introduced the categories list mid-project and had to clean up existing data. Defining enums (even loose, app-level ones) up front keeps the schema consistent with the validators.
