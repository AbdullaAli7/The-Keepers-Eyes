# The Keeper's Eyes — Web App

A Vite + React build of the scouting interface. It loads the full player set from
`public/data.json` (generated from the trained models) and falls back to an
embedded subset if that file is missing, so the component also works standalone.

## Run locally

```bash
cd web
npm install
npm run dev          # http://localhost:5173
```

## Refresh the data

The site reads `public/data.json`. Regenerate it from the trained models:

```bash
# from the project root, after running train_model.py
python export_frontend_data.py --min-pens 5 --out web/public/data.json
```

This converts `models/player_profiles.json` (all players with >= min-pens
penalties) plus the raw penalty CSV into the compact shape the app consumes,
including the Phase 3 game-theory strategy and sequence pattern per player.

## Build

```bash
npm run build        # outputs to web/dist
npm run preview      # serve the production build locally
```

## Deploy

**GitHub Pages** — push to `main`; the workflow in `.github/workflows/deploy.yml`
builds with the correct base path (`/<repo-name>/`) and publishes. Enable it under
repo Settings → Pages → Source: "GitHub Actions".

**Vercel / Netlify** — `vercel.json` is included (build `cd web && npm run build`,
output `web/dist`, SPA rewrite to `index.html`). For a root-domain deploy leave
`VITE_BASE` unset; it defaults to `/`.

**Manual / any static host** — upload the contents of `web/dist`. If serving from
a subpath, build with `VITE_BASE="/subpath/" npm run build`.

## Features

- **Home** — population heatmap, key stats, leaderboards (most predictable, best
  converters).
- **Scout** — per-player heatmap, direction breakdown vs population, GK
  recommendation, **game-theory optimal dive mix** with commit timing, alternation
  tag, and a **Scout Card** export (opens a print-ready report → Save as PDF).
- **Compare** — side-by-side tendencies and optimal-dive reads for two takers.
