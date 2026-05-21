# Expense Tracker

Monorepo layout with separate backend and frontend folders.

## Project structure

```
├── BE/          # Express API + SQLite database
│   ├── data/    # Local SQLite files (gitignored)
│   └── index.js
├── FE/          # React + Vite + Tailwind UI
│   ├── src/
│   └── public/
└── package.json # Workspace root scripts
```

## Setup

From the repository root:

```bash
npm install
```

## Development

Run both API and UI:

```bash
npm run dev
```

Or run individually:

```bash
npm run dev:be   # API on http://localhost:8787
npm run dev:fe   # UI on http://localhost:5173
```

The frontend proxies `/api` requests to the backend during development.

## Deploy on Render

Use **two separate services** (or the root `render.yaml` Blueprint):

| Service | Root Directory | Build Command | Start / Publish |
|---------|----------------|---------------|-----------------|
| **API** | `BE` | `npm install` | Start: `npm start` |
| **Static site** | `FE` | `npm install && npm run build` | Publish: `dist` |

**Important:**
- Do **not** use `yarn install; yarn build` — this project uses **npm** (`package-lock.json`).
- The API (`BE`) has no frontend build. Do **not** run `npm run build` on the API service.
- Set **Node.js version** to `22` in Render (Settings → Environment).
- **Do not set `PORT` manually** on the API service — Render injects it automatically.
- API health check URL: `https://your-api.onrender.com/api/health`
- Set env var `VITE_API_URL` on the static site to your API URL (e.g. `https://expense-tracker-api.onrender.com`), then redeploy.

**If build still fails:** In Render → your static site → Settings → Build & Deploy, set:
- Root Directory: `FE`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

## Production notes

- Build frontend: `npm run build` (from repo root) or `npm run build` inside `FE/`
- Start backend: `npm run start:be` (set `PORT` if needed)
