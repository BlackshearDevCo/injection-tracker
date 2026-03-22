# Injection Tracker

Simple PWA I built to track my weekly injection sites. Replaces the growing list in my notes app.

Open it, see where the last injection was, tap to log the next one. Suggests the opposite thigh automatically.

**Live:** https://injection-tracker-bice.vercel.app

## Stack

React, TypeScript, Vite, Tailwind, vite-plugin-pwa. No backend — everything lives in localStorage. JSON export/import for backup.

## Running locally

```bash
npm install
npm run dev
```

## Deploys

Auto-deploys from `master` via Vercel.
