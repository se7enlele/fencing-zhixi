import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';
import { stableStringify } from './analyzer-core.mjs';
import { buildFrontSportEventListReport } from './parse-frontsporteventlist.mjs';
import { inferPlatformStatus, normalizeConcurrency } from './sync-platform-data.mjs';

const execFileAsync = promisify(execFile);

function parseArgs(argv) {
  const args = {
    input: 'data/analysis/frontsporteventlist-analysis.json',
    outputDir: 'data/analysis',
    reportDir: 'analysis-output/scheduled-sync',
    eventListUrl: 'https://fencing-proxy.aixindiandian.workers.dev/fencingapi/competition/frontsporteventlist?',
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

async function loadEvents(input) {
  const payload = JSON.parse(await readFile(input, 'utf8'));
  if (!Array.isArray(payload.normalizedEvents)) {
    throw new Error(`${input} must contain normalizedEvents.`);
  }
  return payload.normalizedEvents;
}

async function refreshEventList(args) {
  const response = await fetch(args.eventListUrl, {
    headers: {
      Accept: 'application/json',
      Referer: 'https://fencing.yy-sport.com.cn/',
    },
  });
  if (!response.ok) {
    throw new Error(`event list refresh failed: HTTP ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
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

async function main() {
  const args = parseArgs(process.argv);
  const eventListRefresh = args.dryRun || args.skipEventListRefresh
    ? { ok: true, skipped: true }
    : await refreshEventList(args);
  const events = await loadEvents(args.input);
  const plan = buildScheduledSyncPlan(events, args);
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

  console.log(stableStringify({
    ok: report.summary.failedCount === 0,
    outputPath,
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
