# Bluebird POS

A local-first point-of-sale desktop app for small drink shops, built with
Next.js and packaged as an Electron app. Data (products, sales, users) is
stored on-device — in SQLite when running as a packaged desktop app, or in
`localStorage` when running as a plain web app.

## Stack

- **Next.js** (App Router, Turbopack) for the UI, running in `output: "standalone"` mode.
- **Electron** hosts the packaged desktop app: it boots the Next.js standalone
  server internally and loads it in a `BrowserWindow`.
- **better-sqlite3** persists application state and the current session,
  accessed from the renderer only through `contextBridge`/IPC
  (`electron/preload.ts` → `electron/database.ts`).
- **Vitest** for unit tests of the domain logic in `src/lib/`.

## Getting started (web, no Electron)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Data persists to your
browser's `localStorage`.

The default seeded admin login is `owner@bluebird.test` / `bluebird`.

## Running as a desktop app

```bash
# Dev: runs `next dev` + the Electron shell against it, with hot reload
npm run electron:dev

# Production-style local run: builds the Next standalone server + Electron
# main/preload bundle, then launches Electron against the built output
npm run electron:prod:build
npm run electron:prod:start
```

## Packaging a distributable

```bash
npm run electron:package       # macOS (.dmg)
npm run electron:package:win   # Windows (nsis)
```

This builds the Next.js standalone server, bundles the Electron main/preload
scripts with esbuild, and packages everything with `electron-builder`
(output in `release/`). `better-sqlite3`'s native binding is unpacked from
the `asar` archive (`asarUnpack` in `package.json`) so it can still be
`dlopen`'d at runtime.

## Tests & linting

```bash
npm test    # vitest
npm run lint
```
