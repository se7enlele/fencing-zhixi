# Scheduled Data Sync

This project currently uses a file-build data pipeline:

1. `tools/sync-platform-data.mjs` imports platform project, roster, and score data into `data/analysis`.
2. `tools/three-year-analysis.mjs` refreshes analysis outputs from the imported data.
3. `tools/build-cloudflare-data.mjs` builds `web/data` chunks and `cloudflare/data/public-data.mjs`.
4. Cloudflare Worker serves the static assets and merges small KV-backed dynamic imports.

Because the production dataset is built into files, Cloudflare Cron alone cannot update the visible site. The scheduled sync therefore runs in GitHub Actions, commits generated data files, and deploys the Worker.

## Jobs

`.github/workflows/scheduled-sync.yml` runs four times per day and can also be started manually.

Default cadence:

- 00:20 Asia/Shanghai
- 06:20 Asia/Shanghai
- 12:20 Asia/Shanghai
- 18:20 Asia/Shanghai

The workflow:

1. Runs `npm run sync:scheduled`.
2. Refreshes the full platform competition list through the proxy.
3. Imports project, roster, and score data for the selected events.
4. Runs `npm run analysis:three-year`.
5. Runs `npm run cf:build-data`.
6. Runs `npm run smoke`.
7. Commits generated changes under `data/analysis`, `web/data`, and `cloudflare/data`.
8. Pushes the commit.
9. Deploys with Wrangler.

## Sync Policy

`tools/scheduled-sync.mjs` selects a bounded set of tasks on each run.

Before selecting tasks, the script refreshes:

- `data/analysis/frontsporteventlist-analysis.json`

This keeps newly published competitions visible to the sync planner. Use `--skip-event-list-refresh` only for local debugging.
All scheduled platform requests use `https://fencing-proxy.aixindiandian.workers.dev` by default, including project lists, score resources, and registration rosters. This avoids direct official-site requests from GitHub Actions.

Pre-event tasks:

- Status: `registration`, `live`, or `upcoming`.
- Window: starts within the next 120 days, or recently started within 7 days.
- Action: refresh project list and roster pages.
- Purpose: keep registration and upcoming match intelligence current.

Completed-event tasks:

- Status: `completed`.
- Window: ended within the last 45 days.
- Action: refresh project list and score packages.
- Purpose: capture recently published results without rescanning the whole history.

Default limits:

- `--active-limit 8`
- `--completed-limit 4`
- `--roster-page-size 50`
- `--roster-max-pages 12`
- `--score-limit 12`

These limits protect the origin API and keep each scheduled run predictable. Increase them only when the proxy and official endpoints are stable.

## Commands

Dry run:

```bash
npm run sync:scheduled:dry
```

Run locally:

```bash
npm run sync:scheduled
npm run analysis:three-year
npm run cf:build-data
npm run smoke
```

Manual high-volume run for a specific event:

```bash
node tools/sync-platform-data.mjs --sport-id 101318 --roster --no-score --roster-limit 0 --roster-max-pages 20 --roster-page-size 50 --timeout-sec 25
```

Use the proxy explicitly if running `sync-platform-data.mjs` outside the scheduled wrapper:

```bash
node tools/sync-platform-data.mjs --sport-id 101318 --proxy-base https://fencing-proxy.aixindiandian.workers.dev --roster-base https://fencing-proxy.aixindiandian.workers.dev --roster --no-score --roster-limit 0 --roster-max-pages 20 --roster-page-size 50 --timeout-sec 25
```

## Required Secret

GitHub Actions needs this repository secret:

- `CLOUDFLARE_API_TOKEN`

The token must be able to deploy the `fencingai` Worker.

## When to Move to Worker Cron

Move to Cloudflare Cron plus Queue plus R2/D1 when the file-build pipeline becomes too large or too slow.

That migration requires a storage change:

- Raw API responses in R2.
- Normalized query tables in D1 or KV-indexed objects.
- Worker `scheduled()` handler that enqueues sync tasks.
- Frontend API reads from runtime storage instead of static `web/data` chunks.

Until that storage migration is done, GitHub Actions is the correct automation layer.

## Failure handling and acceptance (2026-09-23)

- `fetchTextWithNode` keeps its timeout active through reading the response body.
- Each scheduled child has a 600-second budget (`--task-timeout-sec`). A failed import returns a nonzero exit status, including failures caught inside the import loop.
- The catalogue refresh rejects empty or malformed rows and atomically replaces the old file only after validation. Refresh failure preserves the old catalogue and writes a failed sync status.
- The scheduler saves an atomic checkpoint after each task. `phase=running` is not a successful update; an interrupted run retains that state. Successful task execution and the count of imported files are separate fields.
- GitHub Actions uploads diagnostics even on failure; a failed sync still blocks deployment. Diagnostics are not a substitute for a successful production refresh.
- `scheduled-sync-status.json` is excluded from source-data freshness calculations, so a failed check cannot make source data appear newly fetched.

Run `npm run test:data-trust` for catalogue preservation, failed child exits, stalled bodies, task timeouts, expiry boundaries, coverage tiers and individual/team separation. Use `CF_BUILD_OUTPUT_ROOT=output/review-20260923` with `npm run cf:build-data` to inspect a build without replacing the existing generated files. After an explicitly authorized deployment, verify production `generatedAt`, expected records and the last sync report through the public APIs.

## Transport repair (2026-09-24)

- The deployed forwarding Worker omitted `Content-Type` on POST requests. Its maintained source is now `cloudflare/source-proxy.mjs`; deploy with `npx wrangler deploy --config cloudflare/wrangler.proxy.toml`. Preserve the incoming JSON content type and body. `tools/source-proxy-test.mjs` checks this contract.
- Public forwarding requests and machines with proxy environment variables use curl, which honors the configured network proxy. Local test requests remain direct. GET transport retries transient failures twice within a bounded budget; POST body reads have the same timeout protection as GET.
- A missing score resource (HTTP 404) plus a successful, empty official ranking list is recorded as `unavailableCount`, separately from failed requests and imported files. Timeouts and nonzero source API codes remain failures. A completed sync never proves every project's results have been published.
- Publish the same revision to the default branch used by scheduled workflows and to the Worker; otherwise a later automatic run can restore an older application version.
