# Event Distribution Manager

[![CI](https://github.com/zamine-dots/EventPauseManager/actions/workflows/ci.yml/badge.svg)](https://github.com/zamine-dots/EventPauseManager/actions/workflows/ci.yml)

A QR-based dashboard for organizing food and coffee collection at events. Built with **Next.js 16, React 19, TypeScript, and SQLite**.

Organizers maintain a participant list, generate QR codes, and record each person's collection status. The project demonstrates a dashboard, REST endpoints, database operations, and a mobile scanning workflow.

## What it does

- Add, edit, search, and delete participants and their orders.
- Generate and download participant QR codes.
- Open a participant from a QR link or the built-in camera scanner.
- Mark food and coffee as collected and update the interface from the saved result.
- View totals, export the participant list as CSV, and reset collection statuses.

## Run locally

Use **Node.js 24 LTS** and npm. The SQLite binding requires a compatible native binary or a local C/C++ build toolchain.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. SQLite creates its storage directory and tables on first use. The default database is `data/event.db`. To select a different location, copy `.env.example` to `.env.local` and set `EVENT_DB_PATH`.

For a production build:

```bash
npm run build
npm start
```

The build downloads the configured Geist fonts from Google, so it requires network access at build time.

## QR workflow

1. Open the dashboard at the address staff will use.
2. Add participants and generate their QR codes.
3. Scan a code to open `/scan/<participant-id>`, or use **Scan QR Code** in the dashboard.
4. Mark food and coffee after collection; the saved status appears in the interface.

Generated QR links use the browser's current origin. Codes created on `localhost` will point to that same hostname on a phone, so generate them from the address reachable by staff. Camera access requires HTTPS or localhost and browser permission.

## Storage and deployment limits

This application currently has **no built-in authentication or staff authorization**. Use it on a trusted local network or behind an authenticated gateway until access controls are implemented. Participant IDs and QR codes are not authorization credentials.

Host the app in a Node.js process with a writable, persistent disk. Set `EVENT_DB_PATH` to a file on the persistent volume, back it up, and protect access to participant records. Ephemeral serverless filesystems, including a default Vercel Functions deployment, do not provide durable SQLite storage for this implementation.

The dashboard refreshes after actions in the current page. It does not synchronize multiple staff devices through a live subscription, and it is not a fiscal POS or payment-processing system. Avoid treating this prototype as a production event system without testing access control, concurrent staff activity, backups, and recovery.

Runtime database files are excluded from source control. Use synthetic records for demos and tests.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/participants` | List participants |
| POST | `/api/participant` | Add a participant |
| GET / PUT / DELETE | `/api/participant/:id` | Read, update, or remove a participant |
| POST | `/api/mark-food/:id` | Record food collection |
| POST | `/api/mark-coffee/:id` | Record coffee collection |
| POST | `/api/reset` | Reset all collection statuses |

The SQLite `participants` table stores names, orders, collection flags, and QR data. A `logs` table records collection actions. Database code lives in `src/db/init.ts`; routes live in `src/app/api`.

## Checks

```bash
npm run lint
npm test
npm run build
npm audit --audit-level=high
```

The database smoke test forces a fresh **in-memory database** and checks creation, reads, updates, food/coffee collection, deletion, and missing records. It never opens your event database. GitHub Actions runs these checks on Node.js 24. Camera hardware and multiple-device workflows require separate manual testing.
