# WOW Burger — Interactive Digital Menu

A full-featured restaurant digital menu app for WOW Burger (Addis Ababa) with a customer-facing menu, admin dashboard, Firebase Firestore sync, and email notifications.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/wow-burger run dev` — run the frontend (port 23006)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (optional, only needed for DB features)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (not currently used — app uses Firebase Firestore)
- Frontend: React + Vite + Tailwind CSS v4
- Firebase: Firestore (real-time data), Firebase Auth
- Email: Nodemailer via Express route `/api/send-email`

## Where things live

- `artifacts/wow-burger/` — React + Vite frontend (customer menu + admin dashboard)
- `artifacts/api-server/` — Express API server (email endpoint)
- `artifacts/wow-burger/src/components/` — UI components (MenuView, AdminDashboard, etc.)
- `artifacts/wow-burger/src/dbService.ts` — Firebase Firestore + localStorage data service
- `artifacts/wow-burger/src/firebase.ts` — Firebase initialization
- `artifacts/wow-burger/firebase-applet-config.json` — Firebase project config
- `artifacts/api-server/src/routes/email.ts` — Email sending route

## Architecture decisions

- App uses Firebase Firestore as the live database with localStorage as a local-first cache for zero-latency initial paint.
- Admin routing is handled via URL path/hash matching in the root App component (no router library needed — single-page app with custom routing).
- Email is sent server-side via the Express API at `/api/send-email` using Nodemailer (requires SMTP env vars).
- Firebase config is stored in `firebase-applet-config.json` at the artifact root (imported via `resolveJsonModule`).

## Product

- **Customer view**: Browse menu by category (Burger, Chicken, Wrap, Pizza, etc.), view item details, mark favorites, browse popular items.
- **Info view**: Restaurant mission, opening hours, contact details, social links.
- **Payment view**: Bank account/QR code payment info.
- **Admin dashboard**: Manage menu items and categories, edit restaurant info, view analytics, change admin credentials.
- **Admin login**: Password/email-protected admin access via hash routing.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Firebase config (`firebase-applet-config.json`) must stay at `artifacts/wow-burger/` root (not inside `src/`) because `firebase.ts` imports it with `../firebase-applet-config.json`.
- SMTP env vars (`SMTP_USER`, `SMTP_PASS`, `SMTP_HOST`, `SMTP_PORT`) must be set for the email feature to work. Without them, the server gracefully returns an instructional error.
- The app uses `experimentalForceLongPolling: true` on Firestore to work reliably in web preview iframes.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
