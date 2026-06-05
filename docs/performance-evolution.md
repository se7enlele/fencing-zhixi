# FencingAI Performance Evolution

## Current State

The app now uses layered public APIs instead of a single heavy home payload:

- `/api/competitions`: competition index for the home page, filters, and competition entry cards.
- `/api/events`: event/project index only.
- `/api/search`: athlete and club search index.
- `/api/competitions/:sportCode`: competition detail.
- `/api/events/:eventCode`: event detail.
- `/api/athletes/:athleteId`: athlete detail.
- `/api/clubs/:clubId`: club detail.
- `/api/me/follows`: user-specific follow state stored in KV.

Public stable data is CDN-cacheable. User-specific follow data remains isolated and `no-store`.

## Cache Policy

Use these Worker cache classes:

- Public indexes: `public, max-age=60, s-maxage=3600, stale-while-revalidate=86400`.
- Public details: `public, max-age=300, s-maxage=86400, stale-while-revalidate=604800`.
- User data, admin import, and mutation endpoints: `no-store`.

This keeps the mobile home page responsive while allowing new imports to become visible after a short freshness window.

## Data Layer Boundaries

The JSON asset layer should stay split by read pattern:

- Competition index: home, filters, role entry points.
- Event index: project-level browsing and coverage reporting.
- Search index: compact athlete and club search records.
- Event detail: matches, pools, participants, analysis cards.
- Athlete detail: cross-event growth profile.
- Club detail: roster, project investment, coach/club analysis.

Do not add full athlete, club, or event detail payloads back into the home index. New UI features should request the smallest matching layer.

## Database Migration Trigger

Keep the current JSON + Worker + KV architecture until at least one of these becomes true:

- Search index exceeds 15 MB compressed or mobile search noticeably stalls.
- Public data build time regularly exceeds 10 minutes.
- Admin imports need partial updates without rebuilding large JSON assets.
- Coach/club pages require multi-dimensional joins across athlete, club, event, weapon, age group, and season.
- User-specific features need accounts, permissions, paid entitlements, or team-level sharing.

## Recommended Database Direction

Use the database in this order:

1. **Cloudflare D1** for the first structured-data step if the app stays Worker-first and mostly read-heavy.
2. **Supabase/Postgres** if admin workflows, richer joins, dashboards, auth, or back-office tooling become primary.
3. Keep KV only for lightweight user state such as anonymous follows, short-lived imports, and feature flags.

The first database schema should preserve the current API boundaries:

- `competitions`
- `events`
- `athletes`
- `clubs`
- `event_results`
- `pool_bouts`
- `elimination_matches`
- `registrations`
- `follows`

The migration should be incremental: write database-backed readers behind the same public API routes, compare output with current JSON assets, then switch one route at a time.
