import { mkdir, readFile, readdir, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { stableStringify } from './analyzer-core.mjs';
import { buildProjectListReport } from './parse-projectlist.mjs';
import { buildRegistrationRosterReport } from './parse-registration-roster.mjs';
import { buildScoreReport } from './parse-score.mjs';

const execFileAsync = promisify(execFile);
const DEFAULT_PROXY_BASE = 'https://fencing-proxy.aixindiandian.workers.dev';
const DEFAULT_ROSTER_BASE = 'https://fencing.yy-sport.com.cn';
const DEFAULT_HEADERS = {
  Accept: 'application/json',
  Referer: 'https://fencing.yy-sport.com.cn/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36',
};

function curlSourceHeaders(url) {
  // The forwarding Worker sets origin headers; send them only to the origin itself.
  return new URL(url).hostname === 'fencing.yy-sport.com.cn'
    ? Object.entries(DEFAULT_HEADERS).flatMap(([key, value]) => ['--header', `${key}: ${value}`])
    : [];
}

function parseArgs(argv) {
  const args = {
    input: 'data/analysis/frontsporteventlist-analysis.json',
    outputDir: 'data/analysis',
    proxyBase: DEFAULT_PROXY_BASE,
    rosterBase: DEFAULT_ROSTER_BASE,
    status: 'completed',
    limit: 5,
    delayMs: 400,
    timeoutSec: 20,
    scoreStart: 0,
    scoreLimit: 3,
    scoreConcurrency: 1,
    rosterLimit: 5,
    rosterConcurrency: 2,
    rosterPageSize: 10,
    rosterMaxPages: 3,
    rosterAgeGroups: [],
    rosterWeapons: [],
    rosterItemTypes: [],
    sportId: null,
    startAfterSportId: null,
    progress: true,
    score: true,
    projectlist: true,
    roster: false,
    forceProjectlist: false,
    forceRoster: false,
    forceScore: false,
    dryRun: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--input') args.input = argv[++i];
    if (arg === '--output-dir' || arg === '-o') args.outputDir = argv[++i];
    if (arg === '--proxy-base') args.proxyBase = argv[++i].replace(/\/$/, '');
    if (arg === '--roster-base') args.rosterBase = argv[++i].replace(/\/$/, '');
    if (arg === '--status') args.status = argv[++i];
    if (arg === '--limit') args.limit = Number(argv[++i]);
    if (arg === '--delay-ms') args.delayMs = Number(argv[++i]);
    if (arg === '--timeout-sec') args.timeoutSec = Number(argv[++i]);
    if (arg === '--score-start') args.scoreStart = Number(argv[++i]);
    if (arg === '--score-limit') args.scoreLimit = Number(argv[++i]);
    if (arg === '--score-concurrency') args.scoreConcurrency = Number(argv[++i]);
    if (arg === '--roster-limit') args.rosterLimit = Number(argv[++i]);
    if (arg === '--roster-concurrency') args.rosterConcurrency = Number(argv[++i]);
    if (arg === '--roster-page-size') args.rosterPageSize = Number(argv[++i]);
    if (arg === '--roster-max-pages') args.rosterMaxPages = Number(argv[++i]);
    if (arg === '--roster-age-groups') args.rosterAgeGroups = argv[++i].split(',').map((value) => value.trim()).filter(Boolean);
    if (arg === '--roster-weapons') args.rosterWeapons = argv[++i].split(',').map((value) => value.trim()).filter(Boolean);
    if (arg === '--roster-item-types') args.rosterItemTypes = argv[++i].split(',').map((value) => value.trim()).filter(Boolean);
    if (arg === '--sport-id') args.sportId = Number(argv[++i]);
    if (arg === '--start-after-sport-id') args.startAfterSportId = Number(argv[++i]);
    if (arg === '--quiet') args.progress = false;
    if (arg === '--no-score') args.score = false;
    if (arg === '--no-projectlist') args.projectlist = false;
    if (arg === '--roster') args.roster = true;
    if (arg === '--force-projectlist') args.forceProjectlist = true;
    if (arg === '--force-roster') args.forceRoster = true;
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
  if (String(event.sportactive) === '1') return 'live';
  if (String(event.sigupactive) === '1') return 'registration';
  if (signStart && signEnd && signStart <= now && signEnd >= now) return 'registration';
  if (start && end && start <= now && end >= now) return 'live';
  return 'upcoming';
}

function eventDateValue(event) {
  return parseDate(event.startDate) || parseDate(event.endDate) || 0;
}

export function selectEvents(events, { status = 'completed', limit = 5, startAfterSportId = null } = {}) {
  let rows = events
    .map((event) => ({
      ...event,
      inferredStatus: inferPlatformStatus(event),
    }))
    .filter((event) => status === 'all' || event.inferredStatus === status)
    .sort((a, b) => eventDateValue(b) - eventDateValue(a));

  if (startAfterSportId) {
    const index = rows.findIndex((event) => Number(event.sportId) === Number(startAfterSportId));
    if (index >= 0) rows = rows.slice(index + 1);
  }

  return Number.isFinite(limit) && limit > 0 ? rows.slice(0, limit) : rows;
}

export function selectEventsForSync(events, args = {}) {
  if (args.sportId) {
    const event = events.find((row) => Number(row.sportId) === Number(args.sportId));
    return event ? [{ ...event, inferredStatus: inferPlatformStatus(event) }] : [];
  }
  return selectEvents(events, args);
}

function progress(args, message, detail = {}) {
  if (!args.progress) return;
  console.error(stableStringify({
    at: new Date().toISOString(),
    message,
    ...detail,
  }));
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

function rosterFileName(sportCode, eventCode, page) {
  return `registration-roster-${sportCode || 'unknown'}-${eventCode || 'unknown'}-${page}.json`;
}

export async function fetchTextWithNode(url, timeoutSec) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.max(1, timeoutSec) * 1000);
  let response;
  try {
    response = await fetch(url, { headers: DEFAULT_HEADERS, signal: controller.signal });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    return text;
  } finally {
    clearTimeout(timeout);
  }
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

async function fetchTextWithCurl(url, timeoutSec) {
  const timeout = Math.max(1, Number(timeoutSec) || 20);
  const { stdout } = await execFileAsync('curl', [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--retry', '2',
    '--retry-delay', '1',
    '--retry-max-time', String(timeout * 2),
    '--max-time',
    String(timeout),
    ...curlSourceHeaders(url),
    url,
  ], {
    maxBuffer: 25 * 1024 * 1024,
    timeout: (timeout * 3 + 5) * 1000,
    killSignal: 'SIGTERM',
  });
  return stdout;
}

async function fetchTextWithCommand(url, timeoutSec) {
  return fetchTextWithCurl(url, timeoutSec);
}

export function useProxyTransport(url) {
  const host = new URL(url).hostname;
  return !['localhost', '127.0.0.1', '[::1]'].includes(host)
    && (host === new URL(DEFAULT_PROXY_BASE).hostname
      || Boolean(process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.ALL_PROXY));
}

export function isHttpStatusError(error) {
  return /^HTTP \d{3}\b/.test(error?.message || '');
}

export async function fetchText(url, timeoutSec = 20) {
  if (useProxyTransport(url)) return fetchTextWithCommand(url, timeoutSec);
  try {
    return await fetchTextWithNode(url, timeoutSec);
  } catch (error) {
    if (isHttpStatusError(error)) throw error;
    try {
      return await fetchTextWithCommand(url, timeoutSec);
    } catch (fallbackError) {
      throw new Error(`${error.message}; command fallback failed: ${fallbackError.message}`);
    }
  }
}

function classmentRankToScorePayload(payload, item, event = {}) {
  const rows = payload?.data;
  if (!Array.isArray(rows)) {
    throw new Error('classmentrank payload must include data array.');
  }
  const eventCode = item.sourceEventCode || item.eventCode || rows.find((row) => row?.ecode)?.ecode;
  return {
    General: [{
      SportName: event.sportName || item.sportName || item.sourceSportCode || event.sportCode || '',
      EventName: item.itemName || item.eventName || eventCode || '',
      OpenDate: item.startDate || event.startDate || null,
      Venue: event.venue || event.cityName || event.provinceName || null,
      CompetitionNo: rows.length,
      ExemptionNo: null,
      PoolFencerNo: null,
      PoolQualifyNo: null,
      PDEstartPhase: null,
      DEstartPhase: null,
      Scode: item.sourceSportCode || item.sportCode || event.sportCode || null,
      Ecode: eventCode,
    }],
    Classment: rows.map((row) => ({
      EventRank: row.eventrank,
      EventShowRank: row.eventshowrank,
      Fencer: row.fencer,
      Licence: row.licence,
      NOCCode: row.noccode,
      Birthday: row.birthday,
      Medal: row.medal,
      Statut: row.statut,
      F_EventDisPos: row.feventdispos,
      QualifyStatusId: row.qualifystatusid,
    })),
    Pools: [],
    PoolStanding: [],
    PoolResults: [],
    PRDetails: [],
    Tableaus: [],
    Matchs: [],
    IniStarts: [],
  };
}

export async function postJsonTextWithNode(url, body, timeoutSec) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.max(1, timeoutSec) * 1000);
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        ...DEFAULT_HEADERS,
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify(body || {}),
      signal: controller.signal,
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

async function postJsonTextWithPowerShell(url, body, timeoutSec) {
  const quotedUrl = String(url).replace(/'/g, "''");
  const jsonBody = JSON.stringify(body || {}).replace(/'/g, "''");
  const timeout = Math.max(1, Number(timeoutSec) || 20);
  const script = [
    "$ProgressPreference = 'SilentlyContinue'",
    `$uri = '${quotedUrl}'`,
    `$body = '${jsonBody}'`,
    "$headers = @{ Accept = 'application/json'; Referer = 'https://fencing.yy-sport.com.cn/'; 'Content-Type' = 'application/json;charset=UTF-8'; 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36' }",
    `$response = Invoke-WebRequest -Uri $uri -Method POST -Headers $headers -Body $body -UseBasicParsing -TimeoutSec ${timeout}`,
    '$response.Content',
  ].join('; ');
  const { stdout } = await execFileAsync('powershell.exe', ['-NoProfile', '-Command', script], {
    maxBuffer: 25 * 1024 * 1024,
    timeout: (timeout + 5) * 1000,
    killSignal: 'SIGTERM',
  });
  return stdout;
}

async function postJsonTextWithCurl(url, body, timeoutSec) {
  const timeout = Math.max(1, Number(timeoutSec) || 20);
  const { stdout } = await execFileAsync('curl', [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--max-time',
    String(timeout),
    '--request',
    'POST',
    ...curlSourceHeaders(url),
    '--header',
    'Content-Type: application/json;charset=UTF-8',
    '--data',
    JSON.stringify(body || {}),
    url,
  ], {
    maxBuffer: 25 * 1024 * 1024,
    timeout: (timeout + 5) * 1000,
    killSignal: 'SIGTERM',
  });
  return stdout;
}

async function postJsonTextWithCommand(url, body, timeoutSec) {
  return postJsonTextWithCurl(url, body, timeoutSec);
}

async function postJsonText(url, body, timeoutSec = 20) {
  if (useProxyTransport(url)) return postJsonTextWithCommand(url, body, timeoutSec);
  try {
    return await postJsonTextWithNode(url, body, timeoutSec);
  } catch (error) {
    if (isHttpStatusError(error)) throw error;
    try {
      return await postJsonTextWithCommand(url, body, timeoutSec);
    } catch (fallbackError) {
      throw new Error(`${error.message}; command fallback failed: ${fallbackError.message}`);
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
  const target = path.join(outputDir, fileName);
  const temporary = `${target}.${process.pid}.tmp`;
  await writeFile(temporary, stableStringify(report), 'utf8');
  await rename(temporary, target);
}

async function fetchJsonTextWithRetry(url, args, context = {}) {
  const attempts = 3;
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return parseJsonOrJsObject(await fetchText(url, args.timeoutSec));
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        progress(args, 'fetch retry', { ...context, attempt, message: error.message });
        await sleep(Math.max(args.delayMs, 500) * attempt);
      }
    }
  }
  throw lastError;
}

async function syncProjectlist(event, args, files, log) {
  const fileName = projectlistFileName(event.sportId);
  if (!args.forceProjectlist && files.has(fileName)) {
    log.projectlists.skipped += 1;
    progress(args, 'projectlist skipped', { sportId: event.sportId, sportCode: event.sportCode });
    return JSON.parse(stripBom(await readFile(path.join(args.outputDir, fileName), 'utf8')));
  }

  const url = `${args.proxyBase}/fencingapi/competition/projectlist?sportId=${encodeURIComponent(event.sportId)}`;
  if (args.dryRun) {
    log.projectlists.dryRun.push({ sportId: event.sportId, url });
    return null;
  }

  progress(args, 'projectlist fetch', { sportId: event.sportId, sportCode: event.sportCode, sportName: event.sportName });
  const payload = await fetchJsonTextWithRetry(url, args, { sportId: event.sportId, sportCode: event.sportCode, type: 'projectlist' });
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
  progress(args, 'projectlist imported', { sportId: event.sportId, items: report.summary.itemCount });
  return report;
}

export function buildScorePayloadFromClassmentRank(payload, item, event = {}) {
  return classmentRankToScorePayload(payload, item, event);
}

export function hasScoreRankingRows(report) {
  return Number(report?.summary?.classmentCount) > 0;
}

export function sliceScoreItems(items, args) {
  const start = Math.max(0, Number(args.scoreStart) || 0);
  const sourceItems = (items || []).slice(start);
  return Number.isFinite(args.scoreLimit) && args.scoreLimit > 0
    ? sourceItems.slice(0, args.scoreLimit)
    : sourceItems;
}

export function shouldSyncScores(event, args = {}) {
  return event?.inferredStatus === 'completed' || Boolean(args.forceScore);
}

export function normalizeConcurrency(value) {
  const concurrency = Math.floor(Number(value) || 1);
  return Math.max(1, Math.min(concurrency, 8));
}

async function runConcurrent(items, concurrency, worker) {
  let nextIndex = 0;
  const workerCount = normalizeConcurrency(concurrency);
  await Promise.all(Array.from({ length: workerCount }, async () => {
    while (nextIndex < items.length) {
      const item = items[nextIndex];
      nextIndex += 1;
      await worker(item);
    }
  }));
}

export function isUnpublishedScore(scoreError, rankPayload) {
  return /(?:HTTP 404|error: 404)/i.test(scoreError?.message || '')
    && Number(rankPayload?.code) === 0
    && Array.isArray(rankPayload?.data) && rankPayload.data.length === 0;
}

async function fetchScorePayload(item, event, url, args) {
  try {
    return {
      payload: parseJsonOrJsObject(await fetchText(url, args.timeoutSec)),
      sourceUrl: url,
      sourceType: 'score-resource',
    };
  } catch (scoreError) {
    const eventCode = item.sourceEventCode || item.eventCode;
    const rankUrl = `${args.proxyBase}/fencingapi/matchresult/classmentrank/${encodeURIComponent(eventCode)}`;
    progress(args, 'score fallback classmentrank fetch', { eventCode, message: scoreError.message });
    const rankPayload = parseJsonOrJsObject(await fetchText(rankUrl, args.timeoutSec));
    if (rankPayload?.code !== undefined && Number(rankPayload.code) !== 0) {
      throw new Error(rankPayload.msg || `classmentrank API code ${rankPayload.code}`);
    }
    return {
      payload: classmentRankToScorePayload(rankPayload, item, event),
      unavailable: isUnpublishedScore(scoreError, rankPayload),
      sourceUrl: rankUrl,
      sourceType: 'classmentrank',
      fallbackFrom: url,
      fallbackMessage: scoreError.message,
    };
  }
}

async function syncScoreItem(item, event, args, files, log) {
  const eventCode = item.sourceEventCode || item.eventCode;
  if (!eventCode) return;
  const fileName = scoreFileName(eventCode);
  if (!args.forceScore && files.has(fileName)) {
    log.scores.skipped += 1;
    progress(args, 'score skipped', { eventCode });
    return;
  }

  const url = `${args.proxyBase}/Resource/score/${encodeURIComponent(eventCode)}.js`;
  if (args.dryRun) {
    log.scores.dryRun.push({
      eventCode,
      url,
      fallbackUrl: `${args.proxyBase}/fencingapi/matchresult/classmentrank/${encodeURIComponent(eventCode)}`,
    });
    return;
  }

  try {
    progress(args, 'score fetch', { eventCode });
    const fetched = await fetchScorePayload(item, event, url, args);
    if (fetched.unavailable) {
      log.scores.unavailable.push({ eventCode, reason: 'Official score resource is absent and ranking list is empty.' });
      progress(args, 'score not published', { eventCode });
      return;
    }
    const report = buildScoreReport(fetched.payload, {
      sourceUrl: fetched.sourceUrl,
      sourceType: fetched.sourceType,
      fallbackFrom: fetched.fallbackFrom,
      fallbackMessage: fetched.fallbackMessage,
      importedAt: new Date().toISOString(),
    });
    if (!hasScoreRankingRows(report)) {
      throw new Error(`score payload has no ranking rows from ${fetched.sourceType}`);
    }
    await writeReport(args.outputDir, fileName, report);
    files.add(fileName);
    log.scores.imported += 1;
    progress(args, 'score imported', { eventCode, sourceType: fetched.sourceType, athletes: report.summary.classmentCount });
  } catch (error) {
    log.scores.failed.push({ eventCode, message: error.message });
    progress(args, 'score failed', { eventCode, message: error.message });
  }
}

function rosterUserType(item) {
  return item.itemTypeCode === 'T' || item.itemType === '团体' ? 'team' : 'athlete';
}

function filterRosterItems(items, args) {
  return (items || []).filter((item) => {
    if (args.rosterAgeGroups.length && !args.rosterAgeGroups.includes(item.ageGroup)) return false;
    if (args.rosterWeapons.length && !args.rosterWeapons.includes(item.weapon)) return false;
    if (args.rosterItemTypes.length && !args.rosterItemTypes.includes(item.itemType)) return false;
    return true;
  });
}

function expectedRosterPages(report, pageSize) {
  const total = Number(report?.page?.total) || 0;
  return total > 0 ? Math.ceil(total / pageSize) : null;
}

async function fetchRosterReport(url, body, source, args) {
  const attempts = 3;
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const payload = parseJsonOrJsObject(await postJsonText(url, body, args.timeoutSec));
      if (payload?.code !== undefined && Number(payload.code) !== 0) {
        throw new Error(payload.msg || `roster API code ${payload.code}`);
      }
      return buildRegistrationRosterReport(payload, source);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        progress(args, 'roster retry', { eventCode: source.eventCode, page: source.page, attempt, message: error.message });
        await sleep(Math.max(args.delayMs, 500) * attempt);
      }
    }
  }
  throw lastError;
}

async function syncRosterItem(item, args, files, log) {
  const eventCode = item.sourceEventCode || item.eventCode;
  const sportCode = item.sourceSportCode || item.sportCode;
  if (!eventCode) return;

  const pageSize = Number.isFinite(args.rosterPageSize) && args.rosterPageSize > 0 ? args.rosterPageSize : 100;
  const maxPages = Number.isFinite(args.rosterMaxPages) && args.rosterMaxPages > 0 ? args.rosterMaxPages : 1;
  const body = {
    eventCode,
    searchName: '',
    userType: rosterUserType(item),
  };

  for (let page = 1; page <= maxPages; page += 1) {
    const fileName = rosterFileName(sportCode, eventCode, page);
    if (!args.forceRoster && files.has(fileName)) {
      log.rosters.skipped += 1;
      progress(args, 'roster skipped', { eventCode, page });
      const existingReport = JSON.parse(stripBom(await readFile(path.join(args.outputDir, fileName), 'utf8')));
      const expectedPages = expectedRosterPages(existingReport, pageSize);
      if (expectedPages && page >= expectedPages) break;
      continue;
    }

    const url = `${args.rosterBase}/fencingapi/sigup/memberlistbytype?current=${encodeURIComponent(page)}&size=${encodeURIComponent(pageSize)}`;
    if (args.dryRun) {
      log.rosters.dryRun.push({ eventCode, page, url, body });
      continue;
    }

    try {
      progress(args, 'roster fetch', { eventCode, page, userType: body.userType });
      const report = await fetchRosterReport(url, body, {
        sourceUrl: url,
        eventCode,
        sportCode,
        page,
        pageSize,
        importedAt: new Date().toISOString(),
      }, args);
      await writeReport(args.outputDir, fileName, report);
      files.add(fileName);
      log.rosters.imported += 1;
      progress(args, 'roster imported', { eventCode, page, records: report.summary.recordCount, total: report.page.total });

      const expectedPages = expectedRosterPages(report, pageSize) || page;
      if (report.summary.recordCount === 0 || page >= expectedPages) break;
      await sleep(args.delayMs);
    } catch (error) {
      log.rosters.failed.push({ eventCode, page, message: error.message });
      progress(args, 'roster failed', { eventCode, page, message: error.message });
      break;
    }
  }
}

export function summarizeImportLog(log) {
  const groups = [log.projectlists, log.scores, log.rosters];
  return {
    importedCount: groups.reduce((n, group) => n + (Number(group?.imported) || 0), 0),
    skippedCount: groups.reduce((n, group) => n + (Number(group?.skipped) || 0), 0),
    failedCount: groups.reduce((n, group) => n + (group?.failed?.length || 0), 0),
    unavailableCount: groups.reduce((n, group) => n + (group?.unavailable?.length || 0), 0),
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const events = await loadPlatformEvents(args.input);
  const selected = selectEventsForSync(events, args);
  const files = await existingFileNames(args.outputDir);
  const log = {
    ok: true,
    input: args.input,
    outputDir: args.outputDir,
    proxyBase: args.proxyBase,
    rosterBase: args.rosterBase,
    status: args.status,
    limit: args.limit,
    timeoutSec: args.timeoutSec,
    scoreStart: args.scoreStart,
    scoreLimit: args.scoreLimit,
    scoreConcurrency: normalizeConcurrency(args.scoreConcurrency),
    rosterLimit: args.rosterLimit,
    rosterPageSize: args.rosterPageSize,
    rosterMaxPages: args.rosterMaxPages,
    rosterAgeGroups: args.rosterAgeGroups,
    rosterWeapons: args.rosterWeapons,
    rosterItemTypes: args.rosterItemTypes,
    sportId: args.sportId,
    startAfterSportId: args.startAfterSportId,
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
      unavailable: [],
      dryRun: [],
    },
    rosters: {
      imported: 0,
      skipped: 0,
      failed: [],
      dryRun: [],
    },
  };

  for (const event of selected) {
    let projectReport = null;
    try {
      progress(args, 'event start', { sportId: event.sportId, sportCode: event.sportCode, sportName: event.sportName, status: event.inferredStatus });
      if (args.projectlist) {
        projectReport = await syncProjectlist(event, args, files, log);
        await sleep(args.delayMs);
      } else {
        const fileName = projectlistFileName(event.sportId);
        if (files.has(fileName)) {
          projectReport = JSON.parse(stripBom(await readFile(path.join(args.outputDir, fileName), 'utf8')));
        }
      }

      if (args.score && shouldSyncScores(event, args) && projectReport) {
        const scoreItems = sliceScoreItems(projectReport.normalizedItems || [], args);
        await runConcurrent(scoreItems, args.scoreConcurrency, async (item) => {
          await syncScoreItem(item, event, args, files, log);
          await sleep(args.delayMs);
        });
      }
      if (args.roster && projectReport) {
        const filteredRosterItems = filterRosterItems(projectReport.normalizedItems || [], args);
        const rosterItems = Number.isFinite(args.rosterLimit) && args.rosterLimit > 0
          ? filteredRosterItems.slice(0, args.rosterLimit)
          : filteredRosterItems;
        await runConcurrent(rosterItems, args.rosterConcurrency, async (item) => {
          await syncRosterItem(item, args, files, log);
          await sleep(args.delayMs);
        });
      }
      progress(args, 'event done', { sportId: event.sportId });
    } catch (error) {
      log.projectlists.failed.push({
        sportId: event.sportId,
        sportCode: event.sportCode,
        message: error.message,
      });
      progress(args, 'event failed', { sportId: event.sportId, message: error.message });
    }
  }

  log.summary = summarizeImportLog(log);
  log.ok = log.summary.failedCount === 0;
  console.log(stableStringify(log));
  if (!log.ok) process.exitCode = 1;
}

if (path.basename(process.argv[1] || '') === 'sync-platform-data.mjs') {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
