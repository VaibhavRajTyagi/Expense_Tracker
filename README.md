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
| **API** | `BE` | `npm install --omit=dev` | Start: `npm start` |
| **Static site** | `FE` | `npm install && npm run build` | Publish: `dist` |

**Important:** The API (`BE`) has no frontend build. If you set Root Directory to `BE`, do **not** use `npm run build` as the build command.

For the static site, set env var `VITE_API_URL` to your deployed API URL (e.g. `https://expense-tracker-api.onrender.com`).

## Production notes

- Build frontend: `npm run build` (from repo root) or `npm run build` inside `FE/`
- Start backend: `npm run start:be` (set `PORT` if needed)
