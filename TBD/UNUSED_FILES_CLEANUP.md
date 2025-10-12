UNUSED FILES CLEANUP REPORT

This document summarizes a heuristic scan for potentially unused files across `src/` and `scripts/`, and gives safe next steps for archiving or removing them.

How the scan works
- The helper script `scripts/find-unused-files.js` scans files under `src/` and `scripts/` (searchable code extensions) and searches the entire repo for references to each file's path/name.
- It treats Next.js `app/` and `pages/` routing files (e.g., `page.tsx`, `route.ts`) as auto-used.
- This is a conservative, text-search-based heuristic — it can have false-positives and false-negatives. Always verify before deleting.

Summary (scanner output):
- Total files scanned: 235
- Heuristic-detected USED: 210
- Heuristic-detected UNUSED: 25

Detected potentially unused files (heuristic):

- scripts/add-aurora-tour.ts
- scripts/add-created-by-column.ts
- scripts/check-tours.ts
- scripts/create-custom-tour.ts
- scripts/create-missing-tables.ts
- scripts/find-unused-components.js
- scripts/find-unused-files.js
- scripts/migrate-custom-tour-requests.ts
- scripts/run-custom-migration.ts
- scripts/seed-notifications.ts
- scripts/setup-database.ts
- scripts/test-cancel-logic.ts
- scripts/test-tour-page.ts
- scripts/update-sessions-table.ts
- src/lib/db/migrate-schema.ts
- src/lib/db/migrations/meta/0000_snapshot.json
- src/lib/db/migrations/meta/0001_snapshot.json
- src/lib/db/migrations/meta/0002_snapshot.json
- src/lib/db/migrations/meta/0003_snapshot.json
- src/lib/db/migrations/meta/0004_snapshot.json
- src/lib/db/migrations/meta/0005_snapshot.json
- src/lib/db/migrations/meta/0006_snapshot.json
- src/lib/db/migrations/meta/0007_snapshot.json
- src/lib/db/migrations/meta/_journal.json
- src/lib/db/seed-data.ts

Notes about the findings
- Many of the detected items are developer scripts under `scripts/`. These may be intended for one-off migrations, seeding, or maintenance tasks and often aren't referenced by other code — that doesn't mean they're safe to delete.
- The `src/lib/db/migrations/meta/*` files are migration snapshots and a journal — they are rarely referenced by code but are important for database migrations/history. Deleting them could make reproducing or inspecting migrations difficult.
- `scripts/find-unused-components.js` and `scripts/find-unused-files.js` are the scanner scripts themselves; the heuristic flags them because they aren't imported by other files. Do not remove these unless you no longer need them.

Manual verification checklist (do this BEFORE deleting anything):
1. For each file, search the entire repo for the filename and for unique identifiers used inside the file (functions, exported names). Use your IDE/global search for reliability.
2. Check CI/CD configs, deployment scripts, or external tooling that might invoke scripts by path or name.
3. For migration snapshot files, confirm whether your DB tooling or CI uses them — if they’re generated artifacts, they can be archived, but keep at least a backup.
4. Review git history to see when/why the file was added — that gives context whether it's safe to delete.
5. If a script is only used occasionally, prefer moving it to `archive/` (see safe deletion procedure) rather than permanent deletion.

Safe archival procedure (recommended)
1. Create a new git branch for cleanup:

```bash
git checkout -b cleanup/unused-files
```

2. Create an archive folder (preserve directory structure if useful):

```bash
mkdir -p src/components/archive
mkdir -p scripts/archive
```

3. Move the candidate files into the archive folder using `git mv` so changes are tracked. Example (Windows cmd.exe):

```bash
git mv scripts\add-aurora-tour.ts scripts\archive\
git mv src\lib\db\seed-data.ts src\lib\db\archive\
```

4. Run a quick build/typecheck and your test suite to detect missing imports/uses:

```bash
npm install
npm run build
npm run test:e2e
```

5. If nothing breaks, keep the archive for a while and consider deleting after a safe retention period. If something breaks, restore the file with `git mv` or `git restore`.

Automated options I can run for you (choose one):
- Option A (recommended, safe): I create the `cleanup/unused-files` branch and move all heuristic-detected files into `scripts/archive/` and `src/lib/db/archive/` using `git mv` (I will not delete any files). Then I run `npm run build` to check for missing imports and report back.
- Option B (analysis-only): I run a TypeScript build (`npm run build`) on the current tree to see if any of the moved files would cause type/build failures (I would simulate deletion by temporarily moving files and running the build). This is riskier but detects missing imports.
- Option C: I produce a more advanced static analysis script that uses the TypeScript compiler API to find symbol references; this reduces false positives but takes longer.

Which option would you like me to run? If you want none, you can follow the Safe archival procedure above.

Report file
- The scanner wrote `UNUSED_FILES_REPORT.json` at the repo root. You can open it for machine-readable results.

Would you like me to proceed with Option A and create the git branch + archive the files automatically? If yes, I'll continue and report back the git operations and build results.
