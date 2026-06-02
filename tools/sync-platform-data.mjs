import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { stableStringify } from './analyzer-core.mjs';
import { buildProjectListReport } from './parse-projectlist.mjs';
import { buildScoreReport } from './parse-score.mjs';

const execFileAsync = promisify(execFile);
const DEFAULT_PROXY_BASE = 'https://fencing-proxy.aixindiandian.workers.dev';
const DEFAULT_HEADERS = {
  Accept: 'application/json',
  Referer: 'https://fencing.yy-sport.com.cn/',
};

function parseArgs(argv) {
  const args = {
    input: 'data/analysis/frontsporteventlist-analysis.json',
    outputDir: 'data/analysis',
    proxyBase: DEFAULT_PROXY_BASE,
    status: 'completed',
    limit: 5,
    delayMs: 400,
    timeoutSec: 20,
    scoreLimit: 3,
    score: true,
    projectlist: true,
    forceProjectlist: false,
    forceScore: false,
    dryRun: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--input') args.input = argv[++i];
    if (arg === '--output-dir' || arg === '-o') args.outputDir = argv[++i];
    if (arg === '--proxy-base') args.proxyBase = argv[++i].replace(/\/$/, '');
    if (arg === '--status') args.status = argv[++i];
    if (arg === '--limit') args.limit = Number(argv[++i]);
    if (arg === '--delay-ms') args.delayMs = Number(argv[++i]);
    if (arg === '--timeout-sec') args.timeoutSec = Number(argv[++i]);
    if (arg === '--score-limit') args.scoreLimit = Number(argv[++i]);
    if (arg === '--no-score') args.score = false;
    if (arg === '--no-projectlist') args.projectlist = false;
    if (arg === '--force-projectlist') args.forceProjectlist = true;
    if (arg === '--force-score') args.forceScore = true;
    if (arg === '--dry-run') args.dryRun = true;
  }

  return args;
}

function parseDate(value) {
  const timestamp = Date.parse(String(value || '').replace(' ', 'T'));
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function inferPlatformStatus(event, now = Date.now()) {
  const start = parseDate(event.startDate);
  const end = parseDate(event.endDate);
  const signStart = parseDate(event.signStartDate);
  const signEnd = parseDate(event.signAthEndDate);

  if (String(event.sportactive) === '2' || (end && end < now)) return 'completed';
  if (String(event.sigupactive) === '1') return 'registration';
  if (signStart && signEnd && signStart <= now && signEnd >= now) return 'registration';
  if (start && end && start <= now && end >= now) return 'live';
  return 'upcoming';
}

function eventDateValue(event) {
  return parseDate(event.startDate) || parseDate(event.endDate) || 0;
}

export function selectEvents(events, { status = 'completed', limit = 5 } = {}) {
  const rows = events
    .map((event) => ({
      ...event,
      inferredStatus: inferPlatformStatus(event),
    }))
    .filter((event) => status === 'all' || event.inferredStatus === status)
    .sort((a, b) => eventDateValue(b) - eventDateValue(a));

  return Number.isFinite(limit) && limit > 0 ? rows.slice(0, limit) : rows;
}

function stripBom(text) {
  return String(text || '').replace(/^\uFEFF/, '');
}

function parseJsonOrJsObject(text) {
  const clean = stripBom(text).trim();
  try {
    return JSON.parse(clean);
  } catch {
    const match = clean.match(/=\s*({[\s\S]*}|\[[\s\S]*\])\s*;?\s*$/);
    if (!match) throw new Error('Unable to parse JSON or official score JS object.');
    return JSON.parse(match[1]);
  }
}

function projectRowsFromPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  throw new Error('projectlist payload is not an array or { data: [] }.');
}

async function loadPlatformEvents(input) {
  const report = JSON.parse(stripBom(await readFile(input, 'utf8')));
  if (!Array.isArray(report.normalizedEvents)) {
    throw new Error('Input must be frontsporteventlist-analysis.json.');
  }
  return report.normalizedEvents;
}

async function existingFileNames(outputDir) {
  return new Set(await readdir(outputDir).catch(() => []));
}

function projectlistFileName(sportId) {
  return `projectlist-${sportId}-analysis.json`;
}

function scoreFileName(eventCode) {
  return `score-${eventCode}-analysis.json`;
}

async function fetchTextWithNode(url, timeoutSec) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.max(1, timeoutSec) * 1000);
  let response;
  try {
    response = await fetch(url, { headers: DEFAULT_HEADERS, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
  const text = await response.text();
  if (!response.ok) {
    const excerpt = text.slice(0, 200).replace(/\s+/g, ' ');
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${excerpt}`);
  }
  return text;
}

async function fetchTextWithPowerShell(url, timeoutSec) {
  const quotedUrl = String(url).replace(/'/g, "''");
  const timeout = Math.max(1, Number(timeoutSec) || 20);
  const script = [
    "$ProgressPreference = 'SilentlyContinue'",
    `$uri = '${quotedUrl}'`,
    "$headers = @{ Accept = 'application/json'; Referer = 'https://fencing.yy-sport.com.cn/' }",
    `$response = Invoke-WebRequest -Uri $uri -Headers $headers -UseBasicParsing -TimeoutSec ${timeout}`,
    '$response.Content',
  ].join('; ');
  const { stdout } = await execFileAsync('powershell.exe', ['-NoProfile', '-Command', script], {
    maxBuffer: 25 * 1024 * 1024,
    timeout: (timeout + 5) * 1000,
    killSignal: 'SIGTERM',
  });
  return stdout;
}

async function fetchText(url, timeoutSec = 20) {
  try {
    return await fetchTextWithNode(url, timeoutSec);
  } catch (error) {
    try {
      return await fetchTextWithPowerShell(url, timeoutSec);
    } catch (fallbackError) {
      throw new Error(`${error.message}; PowerShell fallback failed: ${fallbackError.message}`);
    }
  }
}

async function sleep(ms) {
  if (!ms) return;
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function writeReport(outputDir, fileName, report) {
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, fileName), stableStringify(report), 'utf8');
}

async function syncProjectlist(event, args, files, log) {
  const fileName = projectlistFileName(event.sportId);
  if (!args.forceProjectlist && files.has(fileName)) {
    log.projectlists.skipped += 1;
    return JSON.parse(stripBom(await readFile(path.join(args.outputDir, fileName), 'utf8')));
  }

  const url = `${args.proxyBase}/fencingapi/competition/projectlist?sportId=${encodeURIComponent(event.sportId)}`;
  if (args.dryRun) {
    log.projectlists.dryRun.push({ sportId: event.sportId, url });
    return null;
  }

  const payload = parseJsonOrJsObject(await fetchText(url, args.timeoutSec));
  const rows = projectRowsFromPayload(payload);
  const report = buildProjectListReport(rows, {
    sourceUrl: url,
    sportId: event.sportId,
    sportCode: event.sportCode,
    importedAt: new Date().toISOString(),
  });
  await writeReport(args.outputDir, fileName, report);
  files.add(fileName);
  log.projectlists.imported += 1;
  return report;
}

async function syncScoreItem(item, args, files, log) {
  const eventCode = item.sourceEventCode || item.eventCode;
  if (!eventCode) return;
  const fileName = scoreFileName(eventCode);
  if (!args.forceScore && files.has(fileName)) {
    log.scores.skipped += 1;
    return;
  }

  const url = `${args.proxyBase}/Resource/score/${encodeURIComponent(eventCode)}.js`;
  if (args.dryRun) {
    log.scores.dryRun.push({ eventCode, url });
    return;
  }

  try {
    const payload = parseJsonOrJsObject(await fetchText(url, args.timeoutSec));
    const report = buildScoreReport(payload, {
      sourceUrl: url,
      importedAt: new Date().toISOString(),
    });
    await writeReport(args.outputDir, fileName, report);
    files.add(fileName);
    log.scores.imported += 1;
  } catch (error) {
    log.scores.failed.push({ eventCode, message: error.message });
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const events = await loadPlatformEvents(args.input);
  const selected = selectEvents(events, args);
  const files = await existingFileNames(args.outputDir);
  const log = {
    ok: true,
    input: args.input,
    outputDir: args.outputDir,
    proxyBase: args.proxyBase,
    status: args.status,
    limit: args.limit,
    timeoutSec: args.timeoutSec,
    scoreLimit: args.scoreLimit,
    selected: selected.map((event) => ({
      sportId: event.sportId,
      sportCode: event.sportCode,
      sportName: event.sportName,
      status: event.inferredStatus,
      startDate: event.startDate,
    })),
    projectlists: {
      imported: 0,
      skipped: 0,
      failed: [],
      dryRun: [],
    },
    scores: {
      imported: 0,
      skipped: 0,
      failed: [],
      dryRun: [],
    },
  };

  for (const event of selected) {
    let projectReport = null;
    try {
      if (args.projectlist) {
        projectReport = await syncProjectlist(event, args, files, log);
        await sleep(args.delayMs);
      } else {
        const fileName = projectlistFileName(event.sportId);
        if (files.has(fileName)) {
          projectReport = JSON.parse(stripBom(await readFile(path.join(args.outputDir, fileName), 'utf8')));
        }
      }

      if (args.score && event.inferredStatus === 'completed' && projectReport) {
        const scoreItems = Number.isFinite(args.scoreLimit) && args.scoreLimit > 0
          ? (projectReport.normalizedItems || []).slice(0, args.scoreLimit)
          : (projectReport.normalizedItems || []);
        for (const item of scoreItems) {
          await syncScoreItem(item, args, files, log);
          await sleep(args.delayMs);
        }
      }
    } catch (error) {
      log.projectlists.failed.push({
        sportId: event.sportId,
        sportCode: event.sportCode,
        message: error.message,
      });
    }
  }

  console.log(stableStringify(log));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
