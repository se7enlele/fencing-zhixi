# Pre-Event Registration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build manual backstage import and frontend display for pre-event project lists and paged registration rosters.

**Architecture:** Keep official result score data unchanged, and add a parallel pre-event data path for `projectlist` and `memberlistbytype`. The public payload will merge score-backed completed competitions with pre-event competitions, while registration rosters are stored as append-only batches plus de-duplicated roster records.

**Tech Stack:** Node.js ESM, static HTML/CSS/JS, local JSON analysis files, Cloudflare Worker generated data.

---

## File Structure

- `tools/parse-registration-roster.mjs`: parse `memberlistbytype` payloads, normalize records, dedupe keys, and build a preview/report.
- `tools/pre-event-data.mjs`: merge `projectlist-*` and `registration-roster-*` reports into public competition objects with `status`, `rosterStatus`, `registrationSummary`, and `roster`.
- `server.mjs`: detect registration roster imports, commit each page as an append batch, expose pre-event competitions through `/api/events`, `/api/competitions/:sportCode`, and `/api/events/:eventCode`.
- `cloudflare/edge-data.mjs` and `cloudflare/worker.mjs`: mirror preview/commit support for online manual imports.
- `tools/build-cloudflare-data.mjs`: include pre-event data in generated static Worker data.
- `web/admin-import.js`: display page-import counts, duplicate counts, cumulative roster counts, and roster completeness.
- `web/viewer.js`: add status filter, render pre-event status badges, pre-event cards, and roster-aware analysis blocks.
- `web/viewer.css` and `web/admin-import.css`: style status chips, import preview, and pre-event cards.
- `tools/pre-event-import-test.mjs`: cover project list + paged roster parsing/merging.
- `tools/pre-event-view-test.mjs`: cover frontend status labels and status filter behavior.
- `package.json`: include new tests in `npm run smoke`.

## Task 1: Registration Roster Parser

**Files:**
- Create: `tools/parse-registration-roster.mjs`
- Test: `tools/pre-event-import-test.mjs`

- [ ] **Step 1: Write failing parser test**

Create `tools/pre-event-import-test.mjs` with assertions that:

```js
import assert from 'node:assert/strict';
import { buildRegistrationRosterReport } from './parse-registration-roster.mjs';

const page = {
  code: 0,
  msg: '操作成功',
  data: {
    records: [
      {
        sigupId: '253478895',
        registerType: 'athlete',
        registerId: '20081001M202305181026',
        registerCode: '20081001M202305181026',
        organCode: 'YUNYN0001',
        organShortName: '云南',
        organName: '云南击剑队',
        approveStatus: '2',
        sigupTime: '2026-05-29 15:08:04',
        sportName: '2025-2026赛季全国击剑冠军赛',
        sportCode: 'D05GJSSAN0820260104',
        eventName: '青年组男子佩剑个人',
        eventCode: 'D05GJSSAN0820260104MSIPJ',
        birthday: '2008-10-01',
        sex: 'M',
        sexDes: '男',
        weapon: 'S',
        weaponDes: '佩剑',
        athleteName: '李才博',
        regType: '0',
        regTypeDes: '竞技',
        hand: 'R',
      },
    ],
    current: 1,
    size: 10,
    total: 11,
  },
};

const report = buildRegistrationRosterReport(page, { fileName: 'member-page-1.json' });
assert.equal(report.importType, 'registration-roster');
assert.equal(report.summary.recordCount, 1);
assert.equal(report.summary.sportCodes[0], 'D05GJSSAN0820260104');
assert.equal(report.summary.eventCodes[0], 'D05GJSSAN0820260104MSIPJ');
assert.equal(report.normalized.records[0].athleteName, '李才博');
assert.equal(report.normalized.records[0].dedupeKey, 'sigup:253478895');
```

Run: `node tools\pre-event-import-test.mjs`
Expected: FAIL because `parse-registration-roster.mjs` does not exist.

- [ ] **Step 2: Implement parser**

Create `tools/parse-registration-roster.mjs` with:

```js
export function extractRosterRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.records)) return payload.data.records;
  if (Array.isArray(payload?.records)) return payload.records;
  return null;
}

export function looksLikeRegistrationRoster(payload) {
  const rows = extractRosterRows(payload);
  return Array.isArray(rows)
    && rows.length > 0
    && rows.every((row) => row && typeof row === 'object')
    && rows.some((row) => row.eventCode && row.sportCode && (row.athleteName || row.registerCode));
}

export function rosterDedupeKey(row) {
  if (row.sigupId) return `sigup:${row.sigupId}`;
  if (row.sportCode && row.eventCode && row.registerCode) return `entry:${row.sportCode}:${row.eventCode}:${row.registerCode}`;
  return `fallback:${row.sportCode || ''}:${row.eventCode || ''}:${row.athleteName || ''}:${row.birthday || ''}:${row.organCode || ''}`;
}

export function normalizeRosterRecord(row) {
  return {
    sigupId: row.sigupId || null,
    registerType: row.registerType || null,
    registerId: row.registerId || null,
    registerCode: row.registerCode || null,
    athleteName: row.athleteName || '',
    birthday: row.birthday || null,
    sex: row.sex || null,
    sexDes: row.sexDes || null,
    weapon: row.weapon || null,
    weaponDes: row.weaponDes || null,
    hand: row.hand || null,
    sportCode: row.sportCode || null,
    sportName: row.sportName || null,
    eventCode: row.eventCode || null,
    eventName: row.eventName || null,
    organCode: row.organCode || null,
    organShortName: row.organShortName || null,
    organName: row.organName || null,
    approveStatus: row.approveStatus || null,
    sigupTime: row.sigupTime || null,
    sigupPoints: row.sigupPoints ?? null,
    sigupRank: row.sigupRank ?? null,
    regType: row.regType || null,
    regTypeDes: row.regTypeDes || null,
    dedupeKey: rosterDedupeKey(row),
  };
}

export function buildRegistrationRosterReport(payload, source = {}) {
  const rows = extractRosterRows(payload);
  if (!Array.isArray(rows)) throw new Error('报名名单数据应该包含 data.records 或 records。');
  const records = rows.map(normalizeRosterRecord);
  return {
    ok: true,
    importType: 'registration-roster',
    source,
    page: {
      current: payload?.data?.current ?? payload?.current ?? null,
      size: payload?.data?.size ?? payload?.size ?? records.length,
      total: payload?.data?.total ?? payload?.total ?? null,
    },
    summary: {
      recordCount: records.length,
      sportCodes: [...new Set(records.map((row) => row.sportCode).filter(Boolean))],
      eventCodes: [...new Set(records.map((row) => row.eventCode).filter(Boolean))],
      athleteCount: new Set(records.map((row) => row.registerCode || row.athleteName).filter(Boolean)).size,
      clubCount: new Set(records.map((row) => row.organName || row.organCode).filter(Boolean)).size,
    },
    normalized: { records },
  };
}
```

- [ ] **Step 3: Run parser test**

Run: `node tools\pre-event-import-test.mjs`
Expected: PASS.

## Task 2: Pre-Event Merge Model

**Files:**
- Create: `tools/pre-event-data.mjs`
- Modify: `tools/pre-event-import-test.mjs`

- [ ] **Step 1: Extend failing test**

Append to `tools/pre-event-import-test.mjs`:

```js
import { buildPreEventCompetitions } from './pre-event-data.mjs';

const projectListReport = {
  ok: true,
  summary: { itemCount: 1, totalParticipants: 1000 },
  normalizedItems: [{
    sourceSportId: 101265,
    sourceSportCode: 'D05GJSSAN0820260104',
    sourceEventCode: 'D05GJSSAN0820260104MSIPJ',
    itemName: '青年组男子佩剑个人',
    weapon: '佩剑',
    gender: '男',
    ageGroup: '青年组',
    itemType: '个人',
    startDate: '2026-06-06 00:00:00',
    endDate: '2026-06-08 00:00:00',
    participantCount: 1000,
  }],
};

const competitions = buildPreEventCompetitions({
  projectLists: [{ fileName: 'projectlist-101265-analysis.json', report: projectListReport }],
  rosterBatches: [{ fileName: 'registration-roster-D05GJSSAN0820260104-1.json', report }],
});
assert.equal(competitions.length, 1);
assert.equal(competitions[0].status, 'upcoming');
assert.equal(competitions[0].rosterStatus, 'partial');
assert.equal(competitions[0].items[0].registrationCount, 1);
assert.equal(competitions[0].items[0].roster.length, 1);
```

Run: `node tools\pre-event-import-test.mjs`
Expected: FAIL because `pre-event-data.mjs` does not exist.

- [ ] **Step 2: Implement merge module**

Create `tools/pre-event-data.mjs` with functions:

```js
function inferStatusFromDates(items) {
  const now = Date.now();
  const starts = items.map((item) => Date.parse(item.openDate || item.startDate || '')).filter(Number.isFinite);
  const ends = items.map((item) => Date.parse(item.closeDate || item.endDate || '')).filter(Number.isFinite);
  if (ends.length && Math.max(...ends) < now) return 'completed';
  if (starts.length && Math.min(...starts) > now) return 'upcoming';
  return 'registration';
}

export function buildPreEventCompetitions({ projectLists = [], rosterBatches = [], completeRosters = new Set() }) {
  const rosterByEvent = new Map();
  for (const batch of rosterBatches) {
    for (const row of batch.report.normalized?.records || []) {
      if (!row.eventCode) continue;
      if (!rosterByEvent.has(row.eventCode)) rosterByEvent.set(row.eventCode, new Map());
      rosterByEvent.get(row.eventCode).set(row.dedupeKey, row);
    }
  }

  const competitions = new Map();
  for (const { report } of projectLists) {
    for (const item of report.normalizedItems || []) {
      const sportCode = item.sourceSportCode;
      if (!sportCode) continue;
      if (!competitions.has(sportCode)) {
        competitions.set(sportCode, {
          sportCode,
          sportName: item.sportName || `赛前赛事 ${sportCode}`,
          venue: item.venue || '',
          region: '',
          status: 'upcoming',
          rosterStatus: 'none',
          items: [],
        });
      }
      const roster = [...(rosterByEvent.get(item.sourceEventCode)?.values() || [])];
      competitions.get(sportCode).items.push({
        eventCode: item.sourceEventCode,
        eventName: item.itemName,
        shortEventName: item.itemName,
        openDate: item.startDate,
        closeDate: item.endDate,
        competitionNo: item.participantCount || roster.length,
        registrationCount: roster.length,
        roster,
        status: 'upcoming',
        isPreEvent: true,
      });
    }
  }

  return [...competitions.values()].map((competition) => {
    const rosterCount = competition.items.reduce((sum, item) => sum + item.registrationCount, 0);
    const isComplete = completeRosters.has(competition.sportCode);
    return {
      ...competition,
      itemCount: competition.items.length,
      dateLabel: competition.items.map((item) => item.openDate).filter(Boolean).sort().join(' / ') || '日期待确认',
      status: inferStatusFromDates(competition.items),
      rosterStatus: rosterCount ? (isComplete ? 'complete' : 'partial') : 'none',
      registrationSummary: {
        rosterCount,
        itemCount: competition.items.length,
      },
    };
  });
}
```

- [ ] **Step 3: Run merge test**

Run: `node tools\pre-event-import-test.mjs`
Expected: PASS.

## Task 3: Server Import Support

**Files:**
- Modify: `server.mjs`
- Test: `tools/smoke-test.mjs`

- [ ] **Step 1: Write failing smoke coverage**

In `tools/smoke-test.mjs`, after admin preview score coverage, POST a synthetic `memberlistbytype` payload to `/api/admin/import/preview?token=...` and assert:

```js
if (rosterPreviewResult.preview.importType !== 'registration-roster') throw new Error('roster preview type missing');
if (rosterPreviewResult.preview.summary.recordCount !== 1) throw new Error('roster preview count missing');
```

Run: `npm.cmd run smoke`
Expected: FAIL because server preview does not detect registration rosters.

- [ ] **Step 2: Wire parser into server preview**

Modify `server.mjs`:

```js
import { buildRegistrationRosterReport, looksLikeRegistrationRoster } from './tools/parse-registration-roster.mjs';
```

Add `previewRegistrationRosterImport(payload, meta)` and update `previewImportPayload` to test roster after projectlist and before score. Set `targetFile` to `registration-roster-${sportCode}-${Date.now()}.json`, `eventCode` to null, and summary fields from parser report.

- [ ] **Step 3: Commit each page as batch**

In `handleAdminCommit`, keep the current write path, but use the new target file. For roster imports, write one batch file per confirmation. Do not overwrite existing roster batches unless the exact generated target exists.

- [ ] **Step 4: Run smoke**

Run: `npm.cmd run smoke`
Expected: PASS.

## Task 4: Public Pre-Event Payload

**Files:**
- Modify: `server.mjs`
- Modify: `tools/build-cloudflare-data.mjs`
- Test: `tools/pre-event-import-test.mjs`

- [ ] **Step 1: Load pre-event reports**

In `server.mjs`, add loaders for:

```js
projectlist-*-analysis.json
registration-roster-*.json
registration-roster-complete.json
```

Use `buildPreEventCompetitions()` to create pre-event competitions.

- [ ] **Step 2: Merge into `/api/events`**

In `getPublicEventsPayload()`, append pre-event competitions to `competitions`. If a score-backed competition has the same `sportCode`, score data wins and status becomes `completed`.

- [ ] **Step 3: Support competition detail**

In `/api/competitions/:sportCode`, search the merged public payload first instead of only score reports.

- [ ] **Step 4: Run smoke**

Run: `npm.cmd run smoke`
Expected: PASS.

## Task 5: Admin Import UI

**Files:**
- Modify: `web/admin-import.js`
- Modify: `web/admin-import.css`

- [ ] **Step 1: Add preview fields**

Render `registration-roster` as `报名名单分页`, and display current page count, new count, duplicate count if returned, cumulative count if returned, sport codes, and event codes.

- [ ] **Step 2: Add status text**

After commit, show:

```text
报名名单分页已入库：新增 X 条，重复跳过 Y 条
```

- [ ] **Step 3: Run smoke**

Run: `npm.cmd run smoke`
Expected: PASS.

## Task 6: Frontend Status Filter and Cards

**Files:**
- Modify: `web/viewer.js`
- Modify: `web/viewer.css`
- Test: `tools/pre-event-view-test.mjs`

- [ ] **Step 1: Write failing view test**

Create `tools/pre-event-view-test.mjs` to assert helper outputs:

```js
assert.equal(statusLabel('registration'), '报名中');
assert.equal(statusLabel('upcoming'), '未开赛');
assert.equal(statusLabel('completed'), '已结束');
assert.equal(rosterStatusLabel('partial'), '报名名单更新中');
```

Run: `node tools\pre-event-view-test.mjs`
Expected: FAIL.

- [ ] **Step 2: Add status helpers and filter**

In `web/viewer.js`, add:

```js
function statusLabel(status) { ... }
function rosterStatusLabel(status) { ... }
```

Add a fourth filter type `status`, with options `全部状态`, `报名中`, `未开赛`, `进行中`, `已结束`.

- [ ] **Step 3: Render pre-event cards**

In `renderCompetitionList`, show status badge, roster status, registration count, and analysis availability.

- [ ] **Step 4: Run frontend tests**

Run: `node tools\pre-event-view-test.mjs && npm.cmd run smoke`
Expected: PASS.

## Task 7: Cloudflare Worker Mirror

**Files:**
- Modify: `cloudflare/edge-data.mjs`
- Modify: `cloudflare/worker.mjs`
- Modify: `tools/build-cloudflare-data.mjs`

- [ ] **Step 1: Mirror parser support**

Copy registration roster detection and preview support into `cloudflare/edge-data.mjs`.

- [ ] **Step 2: Allow online roster commit**

Update `cloudflare/worker.mjs` so `registration-roster` imports are accepted and stored as KV batch records. Keep score imports unchanged.

- [ ] **Step 3: Merge KV roster batches**

Extend `getMergedData(env)` to read roster batch keys and include pre-event competitions in public events.

- [ ] **Step 4: Deploy verification**

Run:

```powershell
npm.cmd run smoke
npm.cmd run cf:build-data
npm.cmd run cf:deploy
```

Expected: all pass, Worker deploys.

## Self-Review

- Spec coverage: covers manual project list import, paged roster import, batch logs, de-duplication, roster completeness state, frontend status filter, and child-relative pre-event analysis foundations.
- Placeholder scan: no unresolved TBD/TODO placeholders.
- Type consistency: uses `registration-roster`, `status`, `rosterStatus`, `registrationSummary`, `roster`, and `dedupeKey` consistently.
