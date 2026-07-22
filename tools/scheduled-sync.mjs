import { execFile } from 'node:child_process';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';
import { stableStringify } from './analyzer-core.mjs';
import { buildFrontSportEventListReport } from './parse-frontsporteventlist.mjs';
import { fetchText, inferPlatformStatus, normalizeConcurrency } from './sync-platform-data.mjs';

const execFileAsync = promisify(execFile);
const DEFAULT_PROXY_BASE = 'https://fencing-proxy.aixindiandian.workers.dev';

function parseArgs(argv) {
  const args = {
    input: 'data/analysis/frontsporteventlist-analysis.json',
    outputDir: 'data/analysis',
    reportDir: 'analysis-output/scheduled-sync',
    proxyBase: DEFAULT_PROXY_BASE,
    rosterBase: DEFAULT_PROXY_BASE,
    eventListUrl: `${DEFAULT_PROXY_BASE}/fencingapi/competition/frontsporteventlist?`,
    activeLimit: 8,
    completedLimit: 4,
    activeWindowDays: 120,
    recentCompletedDays: 45,
    delayMs: 400,
    timeoutSec: 25,
    rosterPageSize: 50,
    rosterMaxPages: 12,
    scoreLimit: 12,
    scoreConcurrency: 1,
    backfillLimit: 0,
    backfillBeforeDays: 45,
    dryRun: false,
    failOnTaskError: false,
    skipEventListRefresh: false,
    now: null,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--input') args.input = argv[++i];
    if (arg === '--output-dir' || arg === '-o') args.outputDir = argv[++i];
    if (arg === '--report-dir') args.reportDir = argv[++i];
    if (arg === '--proxy-base') args.proxyBase = argv[++i].replace(/\/$/, '');
    if (arg === '--roster-base') args.rosterBase = argv[++i].replace(/\/$/, '');
    if (arg === '--event-list-url') args.eventListUrl = argv[++i];
    if (arg === '--active-limit') args.activeLimit = Number(argv[++i]);
    if (arg === '--completed-limit') args.completedLimit = Number(argv[++i]);
    if (arg === '--active-window-days') args.activeWindowDays = Number(argv[++i]);
    if (arg === '--recent-completed-days') args.recentCompletedDays = Number(argv[++i]);
    if (arg === '--delay-ms') args.delayMs = Number(argv[++i]);
    if (arg === '--timeout-sec') args.timeoutSec = Number(argv[++i]);
    if (arg === '--roster-page-size') args.rosterPageSize = Number(argv[++i]);
    if (arg === '--roster-max-pages') args.rosterMaxPages = Number(argv[++i]);
    if (arg === '--score-limit') args.scoreLimit = Number(argv[++i]);
    if (arg === '--score-concurrency') args.scoreConcurrency = Number(argv[++i]);
    if (arg === '--backfill-limit') args.backfillLimit = Number(argv[++i]);
    if (arg === '--backfill-before-days') args.backfillBeforeDays = Number(argv[++i]);
    if (arg === '--now') args.now = argv[++i];
    if (arg === '--dry-run') args.dryRun = true;
    if (arg === '--fail-on-task-error') args.failOnTaskError = true;
    if (arg === '--skip-event-list-refresh') args.skipEventListRefresh = true;
  }

  return args;
}

function parseDate(value) {
  const timestamp = Date.parse(String(value || '').replace(' ', 'T'));
  return Number.isFinite(timestamp) ? timestamp : null;
}

function daysBetween(a, b) {
  return Math.floor((a - b) / 86400000);
}

function numberOrDefault(value, fallback) {
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function taskBaseArgs(event, args) {
  return [
    'tools/sync-platform-data.mjs',
    '--input', args.input,
    '--output-dir', args.outputDir,
    '--sport-id', String(event.sportId),
    '--proxy-base', args.proxyBase,
    '--delay-ms', String(args.delayMs),
    '--timeout-sec', String(args.timeoutSec),
  ];
}

function preEventTask(event, args) {
  return {
    type: 'pre-event-roster',
    sportId: event.sportId,
    sportCode: event.sportCode,
    sportName: event.sportName,
    status: event.inferredStatus,
    startDate: event.startDate,
    scriptArgs: [
      ...taskBaseArgs(event, args),
      '--roster',
      '--no-score',
      '--force-projectlist',
      '--force-roster',
      '--roster-base', args.rosterBase,
      '--roster-limit', '0',
      '--roster-page-size', String(args.rosterPageSize),
      '--roster-max-pages', String(args.rosterMaxPages),
    ],
  };
}

function completedScoreTask(event, args) {
  return {
    type: 'completed-score',
    sportId: event.sportId,
    sportCode: event.sportCode,
    sportName: event.sportName,
    status: event.inferredStatus,
    startDate: event.startDate,
    scriptArgs: [
      ...taskBaseArgs(event, args),
      '--force-projectlist',
      '--force-score',
      '--score-limit', String(args.scoreLimit),
      '--score-concurrency', String(normalizeConcurrency(args.scoreConcurrency)),
    ],
  };
}

function scoreFileName(eventCode) {
  return `score-${eventCode}-analysis.json`;
}

function isIndividualItem(item) {
  const typeCode = String(item?.itemTypeCode || item?.itemType || '').toUpperCase();
  return typeCode !== 'T';
}

function isYouthItem(item) {
  const text = [
    item?.sourceEventCode,
    item?.eventCode,
    item?.itemName,
    item?.ageGroup,
    item?.ageGroupCode,
  ].join(' ');
  return /U\d{1,2}|青少|少儿/.test(text);
}

function backfillPriority(candidate) {
  const event = candidate.event || {};
  const year = Number(String(event.season || event.startDate || '').match(/\d{4}/)?.[0] || 0);
  const provinceBoost = /山东|天津|北京/.test(String(event.provinceName || event.cityName || event.sportName || '')) ? 30 : 0;
  const youthBoost = /U6|U8|U10|U12|U14|U16|青少/.test([
    candidate.item.itemName,
    candidate.item.ageGroup,
    event.sportName,
  ].join(' ')) ? 20 : 0;
  return year * 100 + provinceBoost + youthBoost;
}

function historicalScoreBackfillTask(candidate, args) {
  const event = candidate.event;
  return {
    type: 'historical-score-backfill',
    sportId: event.sportId,
    sportCode: event.sportCode,
    sportName: event.sportName,
    status: event.inferredStatus,
    startDate: event.startDate,
    endDate: event.endDate,
    eventCode: candidate.eventCode,
    itemName: candidate.item.itemName,
    scoreStart: candidate.index,
    scriptArgs: [
      ...taskBaseArgs(event, args),
      '--no-projectlist',
      '--score-start', String(candidate.index),
      '--score-limit', '1',
      '--score-concurrency', '1',
    ],
  };
}

function annotateEvents(events, nowMs) {
  return events
    .filter((event) => event && event.sportId)
    .map((event) => {
      const startMs = parseDate(event.startDate);
      const endMs = parseDate(event.endDate);
      return {
        ...event,
        inferredStatus: inferPlatformStatus(event, nowMs),
        startMs,
        endMs,
        daysUntilStart: startMs ? daysBetween(startMs, nowMs) : null,
        daysSinceEnd: endMs ? daysBetween(nowMs, endMs) : null,
      };
    });
}

function statusOrder(status) {
  return {
    registration: 0,
    live: 1,
    upcoming: 2,
    completed: 3,
  }[status] ?? 9;
}

export function buildScheduledSyncPlan(events, options = {}) {
  const args = {
    ...parseArgs(['node', 'tools/scheduled-sync.mjs']),
    ...options,
  };
  const nowMs = parseDate(args.now) || Date.now();
  const activeWindowDays = numberOrDefault(args.activeWindowDays, 120);
  const recentCompletedDays = numberOrDefault(args.recentCompletedDays, 45);
  const activeLimit = numberOrDefault(args.activeLimit, 8);
  const completedLimit = numberOrDefault(args.completedLimit, 4);
  const rows = annotateEvents(events, nowMs);

  const activeEvents = rows
    .filter((event) => ['registration', 'live', 'upcoming'].includes(event.inferredStatus))
    .filter((event) => event.daysUntilStart === null || event.daysUntilStart <= activeWindowDays)
    .filter((event) => event.daysUntilStart === null || event.daysUntilStart >= -7)
    .sort((a, b) => statusOrder(a.inferredStatus) - statusOrder(b.inferredStatus)
      || (a.startMs || 0) - (b.startMs || 0));

  const completedEvents = rows
    .filter((event) => event.inferredStatus === 'completed')
    .filter((event) => event.daysSinceEnd === null || event.daysSinceEnd <= recentCompletedDays)
    .sort((a, b) => (b.endMs || b.startMs || 0) - (a.endMs || a.startMs || 0));

  const tasks = [
    ...activeEvents.slice(0, activeLimit).map((event) => preEventTask(event, args)),
    ...completedEvents.slice(0, completedLimit).map((event) => completedScoreTask(event, args)),
  ];

  return {
    ok: true,
    generatedAt: new Date(nowMs).toISOString(),
    input: args.input,
    outputDir: args.outputDir,
    policy: {
      activeWindowDays,
      recentCompletedDays,
      activeLimit,
      completedLimit,
      rosterPageSize: args.rosterPageSize,
      rosterMaxPages: args.rosterMaxPages,
      scoreLimit: args.scoreLimit,
      scoreConcurrency: normalizeConcurrency(args.scoreConcurrency),
      backfillLimit: numberOrDefault(args.backfillLimit, 0),
      backfillBeforeDays: numberOrDefault(args.backfillBeforeDays, recentCompletedDays),
    },
    selected: {
      active: activeEvents.slice(0, activeLimit).map((event) => ({
        sportId: event.sportId,
        sportCode: event.sportCode,
        sportName: event.sportName,
        status: event.inferredStatus,
        startDate: event.startDate,
      })),
      completed: completedEvents.slice(0, completedLimit).map((event) => ({
        sportId: event.sportId,
        sportCode: event.sportCode,
        sportName: event.sportName,
        status: event.inferredStatus,
        endDate: event.endDate,
      })),
    },
    tasks,
  };
}

export function buildHistoricalBackfillTasks(events, projectReports, existingFileNames, options = {}) {
  const args = {
    ...parseArgs(['node', 'tools/scheduled-sync.mjs']),
    ...options,
  };
  const nowMs = parseDate(args.now) || Date.now();
  const limit = numberOrDefault(args.backfillLimit, 0);
  const backfillBeforeDays = numberOrDefault(args.backfillBeforeDays, numberOrDefault(args.recentCompletedDays, 45));
  if (limit <= 0) return [];

  const eventMap = new Map(annotateEvents(events, nowMs).map((event) => [String(event.sportId), event]));
  const files = existingFileNames instanceof Set ? existingFileNames : new Set(existingFileNames || []);
  const candidates = [];

  for (const report of projectReports || []) {
    const sportId = report?.source?.sportId || report?.normalizedItems?.[0]?.sourceSportId;
    const event = eventMap.get(String(sportId));
    if (!event || event.inferredStatus !== 'completed') continue;
    if (event.daysSinceEnd !== null && event.daysSinceEnd <= backfillBeforeDays) continue;

    (report.normalizedItems || []).forEach((item, index) => {
      const eventCode = item?.sourceEventCode || item?.eventCode;
      if (!eventCode || !isIndividualItem(item) || !isYouthItem(item)) return;
      if (files.has(scoreFileName(eventCode))) return;
      candidates.push({ event, item, index, eventCode });
    });
  }

  return candidates
    .sort((a, b) => backfillPriority(b) - backfillPriority(a)
      || (b.event.endMs || b.event.startMs || 0) - (a.event.endMs || a.event.startMs || 0)
      || String(a.eventCode).localeCompare(String(b.eventCode)))
    .slice(0, limit)
    .map((candidate) => historicalScoreBackfillTask(candidate, args));
}

function stripBom(value) {
  return String(value || '').replace(/^\uFEFF/, '');
}

function eventKeySet(events = []) {
  return new Set((events || [])
    .flatMap((event) => [String(event?.sportCode || ''), String(event?.sportId || '')])
    .filter(Boolean));
}

function compactEvent(row = {}) {
  return {
    sportId: row.sportId,
    sportCode: row.sportCode,
    sportName: row.sportName,
    startDate: row.startDate,
    endDate: row.endDate,
    provinceName: row.provinceName,
    cityName: row.cityName,
    sportactive: row.sportactive,
    sigupactive: row.sigupactive,
  };
}

export function compareEventListRefresh(localEvents = [], latestEvents = []) {
  const localKeys = eventKeySet(localEvents);
  const latestKeys = eventKeySet(latestEvents);
  const added = latestEvents
    .filter((event) => !localKeys.has(String(event?.sportCode || '')) && !localKeys.has(String(event?.sportId || '')))
    .map(compactEvent);
  const removed = localEvents
    .filter((event) => !latestKeys.has(String(event?.sportCode || '')) && !latestKeys.has(String(event?.sportId || '')))
    .map(compactEvent);

  return {
    ok: true,
    localCount: localEvents.length,
    latestCount: latestEvents.length,
    addedCount: added.length,
    removedCount: removed.length,
    added: added.slice(0, 20),
    removed: removed.slice(0, 20),
  };
}

async function loadProjectReports(outputDir) {
  const names = (await readdir(outputDir).catch(() => []))
    .filter((name) => /^projectlist-.+-analysis\.json$/.test(name));
  const reports = [];
  for (const name of names) {
    try {
      reports.push(JSON.parse(stripBom(await readFile(path.join(outputDir, name), 'utf8'))));
    } catch {
      // Ignore malformed historical import files; the normal sync report still records new failures.
    }
  }
  return reports;
}

async function buildLoadedHistoricalBackfillTasks(events, args) {
  const [projectReports, files] = await Promise.all([
    loadProjectReports(args.outputDir),
    readdir(args.outputDir).catch(() => []),
  ]);
  return buildHistoricalBackfillTasks(events, projectReports, new Set(files), args);
}

async function loadEvents(input) {
  const payload = JSON.parse(await readFile(input, 'utf8'));
  if (!Array.isArray(payload.normalizedEvents)) {
    throw new Error(`${input} must contain normalizedEvents.`);
  }
  return payload.normalizedEvents;
}

async function refreshEventList(args) {
  const payload = JSON.parse(await fetchText(args.eventListUrl, args.timeoutSec));
  const report = buildFrontSportEventListReport(payload, {
    input: args.eventListUrl,
    sourceUrl: args.eventListUrl,
    analyzedAt: new Date().toISOString(),
  });
  await mkdir(path.dirname(args.input), { recursive: true });
  await writeFile(args.input, stableStringify(report), 'utf8');
  return {
    ok: true,
    eventCount: report.summary.eventCount,
    outputPath: args.input,
  };
}

async function runTask(task) {
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, task.scriptArgs, {
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024 * 20,
    });
    return {
      ...task,
      ok: true,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
    };
  } catch (error) {
    return {
      ...task,
      ok: false,
      exitCode: error.code ?? 1,
      message: error.message,
      stdout: String(error.stdout || '').trim(),
      stderr: String(error.stderr || '').trim(),
    };
  }
}

async function writeRunReport(reportDir, report) {
  await mkdir(reportDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.join(reportDir, `sync-run-${stamp}.json`);
  await writeFile(outputPath, stableStringify(report), 'utf8');
  return outputPath;
}

export function buildScheduledSyncStatus(report) {
  const results = Array.isArray(report?.results) ? report.results : [];
  const selected = report?.selected || {};
  const taskTypes = results.reduce((counts, result) => {
    counts[result.type] = (counts[result.type] || 0) + 1;
    return counts;
  }, {});
  const failures = results
    .filter((result) => !result.ok)
    .slice(0, 5)
    .map((result) => ({
      type: result.type,
      sportId: result.sportId,
      sportCode: result.sportCode,
      sportName: result.sportName,
      eventCode: result.eventCode,
      message: result.message || result.stderr || result.stdout || 'task failed',
    }));

  return {
    generatedAt: new Date().toISOString(),
    ok: Number(report?.summary?.failedCount || 0) === 0,
    summary: {
      taskCount: Number(report?.summary?.taskCount || results.length || 0),
      successCount: Number(report?.summary?.successCount || results.filter((result) => result.ok).length || 0),
      failedCount: Number(report?.summary?.failedCount || results.filter((result) => !result.ok).length || 0),
      activeCount: Array.isArray(selected.active) ? selected.active.length : 0,
      completedCount: Array.isArray(selected.completed) ? selected.completed.length : 0,
      backfillCount: Array.isArray(selected.backfill) ? selected.backfill.length : 0,
      taskTypes,
    },
    eventListRefresh: report?.eventListRefresh || null,
    failures,
  };
}

async function inspectEventListRefresh(args, localEvents) {
  if (args.skipEventListRefresh) return { ok: true, skipped: true };
  const payload = JSON.parse(stripBom(await fetchText(args.eventListUrl, args.timeoutSec)));
  const report = buildFrontSportEventListReport(payload, {
    input: args.eventListUrl,
    sourceUrl: args.eventListUrl,
    analyzedAt: new Date().toISOString(),
  });
  return {
    ...compareEventListRefresh(localEvents, report.normalizedEvents),
    skipped: false,
  };
}

async function writeSyncStatus(outputDir, report) {
  await mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'scheduled-sync-status.json');
  await writeFile(outputPath, stableStringify(buildScheduledSyncStatus(report)), 'utf8');
  return outputPath;
}

async function main() {
  const args = parseArgs(process.argv);
  const eventsBeforeRefresh = await loadEvents(args.input);
  const eventListRefresh = args.dryRun
    ? await inspectEventListRefresh(args, eventsBeforeRefresh)
    : args.skipEventListRefresh
      ? { ok: true, skipped: true }
      : await refreshEventList(args);
  const events = await loadEvents(args.input);
  const plan = buildScheduledSyncPlan(events, args);
  const backfillTasks = await buildLoadedHistoricalBackfillTasks(events, args);
  plan.tasks.push(...backfillTasks);
  plan.selected.backfill = backfillTasks.map((task) => ({
    sportId: task.sportId,
    sportCode: task.sportCode,
    sportName: task.sportName,
    eventCode: task.eventCode,
    itemName: task.itemName,
    scoreStart: task.scoreStart,
  }));
  plan.eventListRefresh = eventListRefresh;

  if (args.dryRun) {
    console.log(stableStringify(plan));
    return;
  }

  const results = [];
  for (const task of plan.tasks) {
    console.error(stableStringify({
      at: new Date().toISOString(),
      message: 'scheduled sync task start',
      type: task.type,
      sportId: task.sportId,
      sportName: task.sportName,
    }));
    results.push(await runTask(task));
  }

  const report = {
    ...plan,
    results,
    summary: {
      taskCount: results.length,
      successCount: results.filter((result) => result.ok).length,
      failedCount: results.filter((result) => !result.ok).length,
    },
  };
  const outputPath = await writeRunReport(args.reportDir, report);
  const statusPath = await writeSyncStatus(args.outputDir, report);

  console.log(stableStringify({
    ok: report.summary.failedCount === 0,
    outputPath,
    statusPath,
    ...report.summary,
  }));

  if (args.failOnTaskError && report.summary.failedCount > 0) {
    process.exitCode = 1;
  }
}

function isMainModule() {
  return path.basename(process.argv[1] || '') === 'scheduled-sync.mjs';
}

if (isMainModule()) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
