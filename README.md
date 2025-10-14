HOW TO RUN this project

This repository is a Next.js 15 project (React 19). Follow these steps to run it locally after cloning from GitHub.

Prerequisites (Windows):
- Node.js 20+ (install from https://nodejs.org)
- Git (to clone the repo)
- A PostgreSQL-compatible database if you plan to run database scripts (optional for static dev run)
- Optional: pnpm/npm/yarn — this repo uses npm scripts in package.json

Quick start (development):
1. Open a terminal (cmd.exe) in the project root (where package.json is).
2. Install dependencies:

   npm install

3. Add the .env.local file at the project root if you need environment variables. Example keys used by the app (check README or code for exact names):
   - DATABASE_URL
   - NEXT_PUBLIC_* variables
   - Any other secret keys required by your environment

Click here to download the .env file (https://drive.google.com/file/d/17EiqugN_7ksodOwKz8pLl93qYnKp4M34/view?usp=sharing)

4. Start the dev server:

   npm run dev

This runs Next.js in development mode (the project uses --turbopack in the scripts). Open http://localhost:3000 in your browser.

Build and production:
1. Build the app:

   npm run build

2. Start the production server:

   npm start

Other useful npm scripts (from package.json):
- npm run lint          — run ESLint
- npm run seed:admin    — run TypeScript script to seed admin user (uses tsx)
- npm run setup:auth    — run script to set up auth tables
- npm run db:seed       — run DB seed script (lib/db/seed.ts)
- npm run db:migrate    — run migrations (tsx scripts/run-migration.ts)
- npm run test:e2e      — run Playwright end-to-end tests (requires Playwright install)

If you run DB scripts, ensure your DATABASE_URL is set and the database is reachable.

Notes and troubleshooting:
- The codebase targets TypeScript; if your editor shows type errors, ensure you installed the project's types and restarted the TypeScript server.
- If you see Next.js or package mismatch errors, check node/npm versions and re-run npm install.
- For Playwright tests, first run:

   npm run playwright:install

- For any seeds/migrations, read the project's scripts in the `scripts/` folder to see what they expect.

Re-running the unused-components check (provided helper):
- There is a small helper script at `scripts/find-unused-components.js` that produces `COMPONENTS_UNUSED_REPORT.json`.
- Run it with:

   node scripts/find-unused-components.js

This uses a simple heuristic (searching for import strings) and is a starting point for cleanup — always manually verify before deleting code.

That's it — 
