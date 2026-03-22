# Injection Tracker

A minimal PWA for tracking weekly injection sites. Open the app, see where your last injection was, tap to log the next one. That's it.

## Features

- **Quick logging** — Two-tap workflow: open app, tap a side. Logged.
- **Site suggestion** — Automatically suggests the opposite thigh from your last injection
- **Visual diagram** — SVG thigh diagram highlights the recommended site
- **History** — Reverse-chronological log with inline editing and delete
- **Duplicate warning** — Alerts you if you've already logged an injection today, with option to confirm
- **Backup** — Export/import your data as JSON
- **PWA** — Installable on your phone, works offline

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- vite-plugin-pwa
- localStorage (no backend)

## Development

```bash
npm install
npm run dev
```

## Deployment

Hosted on Vercel with automatic deploys from `master`. Any push triggers a new production build.

```bash
npm run build    # local production build
npm run preview  # preview production build locally
```
