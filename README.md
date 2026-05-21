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

## Production notes

- Build frontend: `npm run build`
- Start backend: `npm run start:be` (set `PORT` if needed)
- Deploy `BE/` and `FE/dist/` separately, or host the API and serve the static frontend from your provider.
