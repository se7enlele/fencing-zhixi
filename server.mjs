import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeRecords, parseOfficialResultUrl, stableStringify } from './tools/analyzer-core.mjs';
import { buildScoreReport } from './tools/parse-score.mjs';
import { buildProjectListReport } from './tools/parse-projectlist.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 5177);
const MAX_BODY_BYTES = 20 * 1024 * 1024;
const APP_VERSION = 'fencingai-product-20260528-1';
const ADMIN_TOKEN = process.env.FENCINGAI_ADMIN_TOKEN || 'fencingai-admin-2026';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

function sendJson(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(stableStringify(payload));
}

function hasAdminAccess(url) {
  return url.searchParams.get('token') === ADMIN_TOKEN;
}

function safePublicPath(urlPath) {
  const pathname = urlPath === '/' ? '/index.html' : urlPath;
  const resolved = path.resolve(__dirname, 'web', `.${pathname}`);
  const publicRoot = path.resolve(__dirname, 'web');
  if (!resolved.startsWith(publicRoot)) return null;
  return resolved;
}

function toEventSummary(report, fileName) {
  const eventName = report.general?.eventName;
  const athleteNames = [...new Set((report.normalized?.classment ?? [])
    .map((row) => row.name)
    .filter(Boolean))];
  return {
    fileName,
    eventCode: report.general?.eventCode,
    sportCode: report.general?.sportCode,
    sportName: report.general?.sportName,
    eventName,
    shortEventName: formatShortEventName(eventName),
    openDate: report.general?.openDate,
    venue: report.general?.venue,
    competitionNo: report.general?.competitionNo,
    poolCount: report.summary?.poolCount,
    poolQualifyNo: report.general?.poolQualifyNo,
    deStartPhase: report.general?.deStartPhase,
    eliminationMatchCount: report.summary?.eliminationMatchCount,
    playedEliminationMatchCount: report.summary?.playedEliminationMatchCount,
    byeMatchCount: report.summary?.byeMatchCount,
    athleteNames,
  };
}

function formatShortEventName(name) {
  const text = String(name || '').trim();
  const age = text.match(/U\d+|\d+\+/)?.[0] || '';
  const gender = text.includes('男子') || text.includes('男') ? '男' : text.includes('女子') || text.includes('女') ? '女' : '';
  const weapon = text.includes('花剑') ? '花' : text.includes('重剑') ? '重' : text.includes('佩剑') ? '佩' : '';
  const type = text.includes('团体') ? '团体' : '';
  return [age, `${gender}${weapon}`.trim(), type].filter(Boolean).join(' ') || text;
}

function birthHalfYear(birthday) {
  if (!birthday) return null;
  const match = String(birthday).match(/^(20\d{2})-(\d{2})-/);
  if (!match) return null;
  const month = Number(match[2]);
  if (!Number.isFinite(month)) return null;
  return `${match[1]} ${month <= 6 ? '上半年' : '下半年'}`;
}

function inferRegionFromVenue(venue) {
  if (!venue) return '待确认';
  const normalized = String(venue).replace(/[·\s]/g, '');
  const city = normalized.split(/[市区县]/)[0];
  return city || normalized;
}

async function loadScoreReports() {
  const analysisDir = path.join(__dirname, 'data', 'analysis');
  const files = await readdir(analysisDir);
  const scoreFiles = files.filter((file) => file.startsWith('score-') && file.endsWith('-analysis.json'));
  const reports = [];

  for (const fileName of scoreFiles) {
    const raw = await readFile(path.join(analysisDir, fileName), 'utf8');
    reports.push({
      fileName,
      report: JSON.parse(raw),
    });
  }

  return reports;
}

let scoreReportsCache = null;
let publicEventsCache = null;
let athleteDirectoryCache = null;
let clubDirectoryCache = null;

async function getScoreReports() {
  if (!scoreReportsCache) {
    scoreReportsCache = await loadScoreReports();
  }
  return scoreReportsCache;
}

async function getPublicEventsPayload() {
  if (!publicEventsCache) {
    const reports = await getScoreReports();
    const analysisDir = path.join(__dirname, 'data', 'analysis');
    const analysisFiles = await readdir(analysisDir).catch(() => []);
    const athletes = buildAthleteDirectory(reports);
    const clubs = buildClubDirectory(reports);
    publicEventsCache = {
      ok: true,
      version: APP_VERSION,
      events: reports
        .map(({ fileName, report }) => toEventSummary(report, fileName))
        .sort((a, b) => String(a.sportName).localeCompare(String(b.sportName), 'zh-CN') || String(a.eventName).localeCompare(String(b.eventName), 'zh-CN')),
      competitions: groupReportsBySport(reports),
      athletes,
      clubs,
      dataCoverage: {
        scorePackages: reports.length,
        analysisFiles: analysisFiles.filter((file) => file.endsWith('.json')).length,
        previewFiles: analysisFiles.filter((file) => file.startsWith('web-analysis-')).length,
      },
    };
  }
  return publicEventsCache;
}

async function getAthleteDirectory() {
  if (!athleteDirectoryCache) {
    athleteDirectoryCache = buildAthleteDirectory(await getScoreReports());
  }
  return athleteDirectoryCache;
}

async function getClubDirectory() {
  if (!clubDirectoryCache) {
    clubDirectoryCache = buildClubDirectory(await getScoreReports());
  }
  return clubDirectoryCache;
}

async function getEventDetailByCode(eventCode) {
  const reports = await getScoreReports();
  const found = reports.find(({ report }) => report.general?.eventCode === eventCode);
  return found ? buildEventDetail(found.report, found.fileName) : null;
}

function getFollowStorePath() {
  return path.join(__dirname, 'data', 'user-follows.json');
}

function normalizeDeviceId(deviceId) {
  const value = String(deviceId || '').trim();
  if (!/^[a-zA-Z0-9._-]{12,80}$/.test(value)) {
    throw new Error('deviceId 无效。');
  }
  return value;
}

async function readFollowStore() {
  try {
    return JSON.parse(await readFile(getFollowStorePath(), 'utf8'));
  } catch {
    return { devices: {} };
  }
}

async function writeFollowStore(store) {
  await mkdir(path.dirname(getFollowStorePath()), { recursive: true });
  await writeFile(getFollowStorePath(), stableStringify(store), 'utf8');
}

async function handleGetFollows(response, url) {
  try {
    const deviceId = normalizeDeviceId(url.searchParams.get('deviceId'));
    const store = await readFollowStore();
    sendJson(response, 200, {
      ok: true,
      version: APP_VERSION,
      deviceId,
      follows: store.devices[deviceId]?.follows || [],
    });
  } catch (error) {
    sendJson(response, 400, { ok: false, message: error.message });
  }
}

async function handleSaveFollow(request, response) {
  try {
    const body = JSON.parse(await readRequestBody(request));
    const deviceId = normalizeDeviceId(body.deviceId);
    const athlete = body.athlete;
    if (!athlete?.id || !athlete?.name) {
      throw new Error('缺少选手信息。');
    }

    const store = await readFollowStore();
    const current = store.devices[deviceId]?.follows || [];
    const snapshot = {
      id: athlete.id,
      name: athlete.name,
      club: athlete.club || null,
      bestRank: athlete.bestRank ?? null,
      medals: athlete.medals ?? 0,
      appearances: athlete.appearances ?? 0,
      latestRank: athlete.latestRank ?? null,
      latestEventName: athlete.latestEventName ?? null,
      latestDate: athlete.latestDate ?? null,
      eliminationWins: athlete.eliminationWins ?? 0,
      eliminationLosses: athlete.eliminationLosses ?? 0,
      updatedAt: new Date().toISOString(),
    };
    store.devices[deviceId] = {
      updatedAt: new Date().toISOString(),
      follows: [snapshot, ...current.filter((item) => item.id !== athlete.id)].slice(0, 30),
    };
    await writeFollowStore(store);
    sendJson(response, 200, {
      ok: true,
      version: APP_VERSION,
      deviceId,
      follows: store.devices[deviceId].follows,
    });
  } catch (error) {
    sendJson(response, 400, { ok: false, message: error.message });
  }
}

async function handleDeleteFollow(request, response) {
  try {
    const body = JSON.parse(await readRequestBody(request));
    const deviceId = normalizeDeviceId(body.deviceId);
    if (!body.athleteId) throw new Error('缺少 athleteId。');
    const store = await readFollowStore();
    const current = store.devices[deviceId]?.follows || [];
    store.devices[deviceId] = {
      updatedAt: new Date().toISOString(),
      follows: current.filter((item) => item.id !== body.athleteId),
    };
    await writeFollowStore(store);
    sendJson(response, 200, {
      ok: true,
      version: APP_VERSION,
      deviceId,
      follows: store.devices[deviceId].follows,
    });
  } catch (error) {
    sendJson(response, 400, { ok: false, message: error.message });
  }
}

function clearDataCaches() {
  scoreReportsCache = null;
  publicEventsCache = null;
  athleteDirectoryCache = null;
  clubDirectoryCache = null;
}

function parseUploadedJsonText(content) {
  const text = String(content || '').trim();
  if (!text) throw new Error('上传内容为空。');

  try {
    return JSON.parse(text);
  } catch {
    const objectMatch = text.match(/=\s*({[\s\S]*})\s*;?\s*$/);
    if (!objectMatch) throw new Error('无法识别 JSON 或官方 score JS 数据。');
    return JSON.parse(objectMatch[1]);
  }
}

function previewScoreImport(payload, meta = {}) {
  const report = buildScoreReport(payload, {
    fileName: meta.fileName || null,
    sourceUrl: meta.sourceUrl || null,
    importedAt: new Date().toISOString(),
  });
  const eventCode = report.general?.eventCode;
  if (!eventCode) throw new Error('未识别到 eventCode，无法入库。');
  return {
    importType: 'score',
    eventCode,
    targetFile: `score-${eventCode}-analysis.json`,
    general: report.general,
    summary: report.summary,
    report,
  };
}

function looksLikeProjectList(payload) {
  return Array.isArray(payload)
    && payload.length > 0
    && payload.every((row) => row && typeof row === 'object')
    && payload.some((row) => row.eventCode && row.sportId && row.eventName);
}

function previewProjectListImport(payload, meta = {}) {
  if (!looksLikeProjectList(payload)) return null;
  const report = buildProjectListReport(payload, {
    fileName: meta.fileName || null,
    sourceUrl: meta.sourceUrl || null,
    importedAt: new Date().toISOString(),
  });
  const sportId = report.summary?.sportIds?.[0] || 'unknown';
  return {
    importType: 'projectlist',
    eventCode: null,
    targetFile: `projectlist-${sportId}-analysis.json`,
    general: {
      sportName: `项目清单 ${sportId}`,
      eventName: `${report.summary.itemCount} 个项目`,
      openDate: null,
      venue: null,
      sportId,
    },
    summary: {
      itemCount: report.summary.itemCount,
      totalParticipants: report.summary.totalParticipants,
      eventCodeCount: report.summary.eventCodeCount,
      classmentCount: null,
      poolCount: null,
      poolBoutCount: null,
      playedEliminationMatchCount: null,
      byeMatchCount: null,
    },
    report,
    note: '这是比赛项目清单，只补充项目元数据；前台成绩、对阵和分析仍需要导入对应 score JS。',
  };
}

function previewImportPayload(payload, meta = {}) {
  const projectList = previewProjectListImport(payload, meta);
  if (projectList) return projectList;
  return previewScoreImport(payload, meta);
}

async function handleAdminPreview(request, response, url) {
  if (!hasAdminAccess(url)) {
    sendJson(response, 403, { ok: false, message: '访问密钥无效。' });
    return;
  }

  try {
    const body = JSON.parse(await readRequestBody(request));
    const payload = parseUploadedJsonText(body.content);
    const preview = previewImportPayload(payload, body);
    const outputPath = path.join(__dirname, 'data', 'analysis', preview.targetFile);
    let exists = false;
    try {
      await readFile(outputPath, 'utf8');
      exists = true;
    } catch {
      exists = false;
    }

    sendJson(response, 200, {
      ok: true,
      version: APP_VERSION,
      exists,
      preview: {
        importType: preview.importType,
        eventCode: preview.eventCode,
        targetFile: preview.targetFile,
        general: preview.general,
        summary: preview.summary,
        note: preview.note || null,
      },
    });
  } catch (error) {
    sendJson(response, 400, { ok: false, message: error.message });
  }
}

async function handleAdminCommit(request, response, url) {
  if (!hasAdminAccess(url)) {
    sendJson(response, 403, { ok: false, message: '访问密钥无效。' });
    return;
  }

  try {
    const body = JSON.parse(await readRequestBody(request));
    const payload = parseUploadedJsonText(body.content);
    const preview = previewImportPayload(payload, body);
    const analysisDir = path.join(__dirname, 'data', 'analysis');
    const rawDir = path.join(__dirname, 'data', 'imports');
    await mkdir(analysisDir, { recursive: true });
    await mkdir(rawDir, { recursive: true });

    const outputPath = path.join(analysisDir, preview.targetFile);
    let overwritten = false;
    try {
      await readFile(outputPath, 'utf8');
      overwritten = true;
    } catch {
      overwritten = false;
    }

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    await writeFile(path.join(rawDir, `${stamp}-${preview.eventCode}.txt`), body.content, 'utf8');
    await writeFile(outputPath, stableStringify(preview.report), 'utf8');
    clearDataCaches();

    sendJson(response, 200, {
      ok: true,
      version: APP_VERSION,
      eventCode: preview.eventCode,
      targetFile: preview.targetFile,
      overwritten,
      summary: preview.summary,
    });
  } catch (error) {
    sendJson(response, 400, { ok: false, message: error.message });
  }
}

function buildEventDetail(report, fileName) {
  const poolStandings = report.normalized?.poolStandings ?? [];
  const eliminationMatches = report.normalized?.eliminationMatches ?? [];
  const poolBouts = report.normalized?.poolBouts ?? [];
  const poolResults = report.normalized?.poolResults ?? [];
  const clubDistribution = {};
  const classment = report.normalized?.classment ?? [];

  for (const row of poolStandings) {
    if (!row.club) continue;
    clubDistribution[row.club] = (clubDistribution[row.club] ?? 0) + 1;
  }

  const topPoolStanding = poolStandings.slice(0, 12);
  const playedElimination = eliminationMatches.filter((match) => !match.isBye);
  const latestMatches = playedElimination.slice(-12).reverse();
  const eliminationPhaseGroups = Object.values(
    playedElimination.reduce((groups, match) => {
      const key = match.phase?.longName || "淘汰赛";
      if (!groups[key]) {
        groups[key] = {
          phase: key,
          order: match.phase?.order ?? 999,
          matches: [],
        };
      }
      groups[key].matches.push(match);
      return groups;
    }, {}),
  )
    .sort((a, b) => a.order - b.order)
    .map((group) => ({
      phase: group.phase,
      order: group.order,
      matches: group.matches.sort((a, b) => (a.innerOrder ?? 0) - (b.innerOrder ?? 0)),
    }));

  const athleteStats = new Map();
  function ensureAthlete(name, licence, club) {
    const key = licence || `${name}-${club || ''}`;
    if (!athleteStats.has(key)) {
      athleteStats.set(key, {
        key,
        name,
        licence,
        club,
        wins: 0,
        losses: 0,
        scored: 0,
        received: 0,
        matches: [],
      });
    }
    return athleteStats.get(key);
  }

  for (const match of playedElimination) {
    const home = ensureAthlete(match.home.name, match.home.licence, match.home.club);
    const away = ensureAthlete(match.away.name, match.away.licence, match.away.club);
    const homeScore = Number(match.home.points ?? 0);
    const awayScore = Number(match.away.points ?? 0);
    home.scored += homeScore;
    home.received += awayScore;
    away.scored += awayScore;
    away.received += homeScore;

    if (match.home.result === 'W') {
      home.wins += 1;
      away.losses += 1;
    } else {
      home.losses += 1;
      away.wins += 1;
    }

    home.matches.push(match);
    away.matches.push(match);
  }

  const poolRankByLicence = new Map(poolStandings.filter((row) => row.licence).map((row) => [row.licence, row]));
  const poolResultByLicence = new Map(poolResults.filter((row) => row.licence).map((row) => [row.licence, row]));
  const classmentByLicence = new Map(classment.filter((row) => row.licence).map((row) => [row.licence, row]));

  const participants = classment.map((entry) => {
    const pool = entry.licence ? (poolResultByLicence.get(entry.licence) || poolRankByLicence.get(entry.licence)) : null;
    const elim = entry.licence ? athleteStats.get(entry.licence) : null;
    return {
      id: makeAthleteId(entry.name, entry.licence, entry.club),
      name: entry.name,
      licence: entry.licence,
      club: entry.club,
      finalRank: entry.rank,
      medal: entry.medal,
      ageBand: birthHalfYear(entry.birthday),
      poolId: pool?.poolId ?? null,
      drawNo: pool?.drawNo ?? null,
      poolRank: pool?.phaseRank ?? pool?.rank ?? null,
      poolWins: pool?.wins ?? null,
      poolMatches: pool?.matches ?? null,
      poolDiff: pool?.indicator ?? null,
      poolRemark: pool?.remark ?? null,
      qualified: (pool?.remark ?? '').toUpperCase() === 'Q',
      eliminationWins: elim?.wins ?? 0,
      eliminationLosses: elim?.losses ?? 0,
    };
  });

  const poolGroups = Object.values(
    poolResults.reduce((groups, row) => {
      const poolId = row.poolId || 'unknown';
      if (!groups[poolId]) {
        groups[poolId] = {
          poolId,
          title: `小组 ${Object.keys(groups).length + 1}`,
          athletes: [],
          bouts: [],
        };
      }
      const classmentRow = row.licence ? classmentByLicence.get(row.licence) : null;
      groups[poolId].athletes.push({
        id: makeAthleteId(row.name, row.licence, row.club),
        drawNo: row.drawNo,
        name: row.name,
        licence: row.licence,
        club: row.club,
        wins: row.wins,
        matches: row.matches,
        winRate: row.winRate,
        scored: row.hitsScored,
        received: row.hitsReceived,
        diff: row.indicator,
        phaseRank: row.phaseRank,
        finalRank: classmentRow?.rank ?? null,
        medal: classmentRow?.medal ?? null,
      });
      return groups;
    }, {}),
  ).map((group) => ({
    ...group,
    athletes: group.athletes.sort((a, b) => (a.phaseRank ?? 999) - (b.phaseRank ?? 999) || (a.drawNo ?? 999) - (b.drawNo ?? 999)),
    bouts: poolBouts
      .filter((bout) => String(bout.poolId) === String(group.poolId))
      .sort((a, b) => (a.matchOrder ?? 0) - (b.matchOrder ?? 0))
      .slice(0, 12),
  }));

  const eliminationLeaders = [...athleteStats.values()]
    .map((item) => ({
      id: makeAthleteId(item.name, item.licence, item.club),
      name: item.name,
      club: item.club,
      wins: item.wins,
      losses: item.losses,
      scored: item.scored,
      received: item.received,
      diff: item.scored - item.received,
    }))
    .sort((a, b) => b.wins - a.wins || b.diff - a.diff)
    .slice(0, 10);

  const athleteProfiles = classment.map((entry) => {
    const pool = entry.licence ? (poolResultByLicence.get(entry.licence) || poolRankByLicence.get(entry.licence)) : null;
    const elim = entry.licence ? athleteStats.get(entry.licence) : null;
    return {
      id: makeAthleteId(entry.name, entry.licence, entry.club),
      name: entry.name,
      licence: entry.licence,
      club: entry.club,
      finalRank: entry.rank,
      medal: entry.medal,
      ageBand: birthHalfYear(entry.birthday),
      poolId: pool?.poolId ?? null,
      poolRank: pool?.phaseRank ?? pool?.rank ?? null,
      poolWins: pool?.wins ?? null,
      poolMatches: pool?.matches ?? null,
      poolDiff: pool?.indicator ?? null,
      eliminationWins: elim?.wins ?? 0,
      eliminationLosses: elim?.losses ?? 0,
      eliminationDiff: elim ? elim.scored - elim.received : 0,
    };
  });

  const clubProfiles = Object.values(
    classment.reduce((acc, entry) => {
      const key = entry.club || '未知俱乐部';
      if (!acc[key]) {
        acc[key] = {
          id: makeClubId(key),
          club: key,
          entrants: 0,
          medals: 0,
          top8: 0,
          finalists: 0,
          bestRank: 999,
          athletes: [],
        };
      }

      const bucket = acc[key];
      bucket.entrants += 1;
      if (entry.medal) bucket.medals += 1;
      if (entry.rank && entry.rank <= 8) bucket.top8 += 1;
      if (entry.rank && entry.rank <= 2) bucket.finalists += 1;
      if (entry.rank && entry.rank < bucket.bestRank) bucket.bestRank = entry.rank;
      bucket.athletes.push({
        id: makeAthleteId(entry.name, entry.licence, entry.club),
        name: entry.name,
        rank: entry.rank,
        medal: entry.medal,
      });
      return acc;
    }, {}),
  )
    .map((club) => ({
      ...club,
      bestRank: club.bestRank === 999 ? null : club.bestRank,
      athletes: club.athletes
        .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
        .slice(0, 4),
    }))
    .sort((a, b) => b.medals - a.medals || b.top8 - a.top8 || a.bestRank - b.bestRank)
    .slice(0, 8);

  const momentum = classment
    .filter((row) => row.licence && poolRankByLicence.has(row.licence))
    .map((row) => {
      const pool = poolRankByLicence.get(row.licence);
      return {
        name: row.name,
        club: row.club,
        licence: row.licence,
        poolRank: pool.rank,
        finalRank: row.rank,
        delta: pool.rank - row.rank,
      };
    });

  const breakout = [...momentum]
    .filter((item) => item.delta >= 3)
    .sort((a, b) => b.delta - a.delta || a.finalRank - b.finalRank)
    .slice(0, 5);

  const fade = [...momentum]
    .filter((item) => item.delta <= -3)
    .sort((a, b) => a.delta - b.delta || a.poolRank - b.poolRank)
    .slice(0, 5);

  const championName = report.normalized?.classment?.[0]?.name ?? report.normalized?.classment?.[0]?.fencer ?? null;
  const championLicence = report.normalized?.classment?.[0]?.licence ?? null;
  const championPath = playedElimination
    .filter((match) => match.winner.name === championName || (championLicence && (match.home.licence === championLicence || match.away.licence === championLicence)))
    .map((match) => {
      const championIsHome = match.home.name === championName || (championLicence && match.home.licence === championLicence);
      const opponent = championIsHome ? match.away : match.home;
      const champion = championIsHome ? match.home : match.away;
      return {
        phase: match.phase?.longName || '淘汰赛',
        matchCode: match.matchCode,
        championName: champion.name,
        championClub: champion.club,
        championScore: champion.points,
        opponentName: opponent.name,
        opponentClub: opponent.club,
        opponentScore: opponent.points,
        isBye: match.isBye,
      };
    })
    .sort((a, b) => {
      const phaseOrderA = playedElimination.find((match) => match.matchCode === a.matchCode)?.phase?.order ?? 0;
      const phaseOrderB = playedElimination.find((match) => match.matchCode === b.matchCode)?.phase?.order ?? 0;
      return phaseOrderA - phaseOrderB;
    });

  const opponentMap = new Map();
  for (const match of playedElimination) {
    const homeKey = match.home.licence || `${match.home.name}-${match.home.club || ''}`;
    const awayKey = match.away.licence || `${match.away.name}-${match.away.club || ''}`;
    if (!opponentMap.has(homeKey)) {
      opponentMap.set(homeKey, { id: makeAthleteId(match.home.name, match.home.licence, match.home.club), name: match.home.name, club: match.home.club, scored: 0, received: 0, matches: 0, wins: 0, losses: 0 });
    }
    if (!opponentMap.has(awayKey)) {
      opponentMap.set(awayKey, { id: makeAthleteId(match.away.name, match.away.licence, match.away.club), name: match.away.name, club: match.away.club, scored: 0, received: 0, matches: 0, wins: 0, losses: 0 });
    }

    const home = opponentMap.get(homeKey);
    const away = opponentMap.get(awayKey);
    const homeScore = Number(match.home.points ?? 0);
    const awayScore = Number(match.away.points ?? 0);
    home.scored += homeScore;
    home.received += awayScore;
    away.scored += awayScore;
    away.received += homeScore;
    home.matches += 1;
    away.matches += 1;
    if (match.home.result === 'W') {
      home.wins += 1;
      away.losses += 1;
    } else {
      home.losses += 1;
      away.wins += 1;
    }
  }

  const keyOpponents = [...opponentMap.values()]
    .map((item) => ({
      ...item,
      diff: item.scored - item.received,
    }))
    .sort((a, b) => b.matches - a.matches || b.wins - a.wins || b.diff - a.diff)
    .slice(0, 12);

  const champion = classment[0] ?? null;
  const topClubEntry = Object.entries(clubDistribution).sort((a, b) => b[1] - a[1])[0] ?? null;
  const eliminationIntensity = report.summary?.eliminationMatchCount
    ? Number((playedElimination.length / report.summary.eliminationMatchCount).toFixed(2))
    : 0;
  const birthBuckets = Object.values(
    classment.reduce((acc, entry) => {
      const label = birthHalfYear(entry.birthday) || '未知';
      if (!acc[label]) {
        acc[label] = {
          label,
          entrants: 0,
          top8: 0,
          medals: 0,
          bestRank: 999,
        };
      }
      const bucket = acc[label];
      bucket.entrants += 1;
      if (entry.rank && entry.rank <= 8) bucket.top8 += 1;
      if (entry.medal) bucket.medals += 1;
      if (entry.rank && entry.rank < bucket.bestRank) bucket.bestRank = entry.rank;
      return acc;
    }, {}),
  )
    .map((bucket) => ({
      ...bucket,
      bestRank: bucket.bestRank === 999 ? null : bucket.bestRank,
      top8Rate: bucket.entrants ? Math.round((bucket.top8 / bucket.entrants) * 100) : 0,
    }))
    .sort((a, b) => String(a.label).localeCompare(String(b.label), 'zh-CN'));

  const insights = {
    headline: champion
      ? `${champion.name} 获得冠军，来自${champion.club || '未知俱乐部'}`
      : '暂无冠军信息',
    summaryCards: [
      {
        title: '冠军',
        value: champion ? champion.name : '-',
        detail: champion ? `${champion.club || '未知俱乐部'} · ${champion.displayRank}名` : '待确认',
      },
      {
        title: '晋级线',
        value: `${report.general?.poolQualifyNo ?? '-'} / ${report.general?.competitionNo ?? '-'}`,
        detail: report.general?.poolQualifyNo === report.general?.competitionNo ? '全部晋级' : '小组赛后有淘汰',
      },
      {
        title: '淘汰赛密度',
        value: `${playedElimination.length} 场`,
        detail: `含 ${report.summary?.byeMatchCount ?? 0} 场 Bye`,
      },
    ],
    bullets: [
      champion && poolRankByLicence.has(champion.licence)
        ? `${champion.name} 小组赛排第 ${poolRankByLicence.get(champion.licence).rank}，最终夺冠。`
        : null,
      topClubEntry
        ? `${topClubEntry[0]} 在当前样本里出现 ${topClubEntry[1]} 次，是报名最集中的俱乐部。`
        : null,
      report.general?.poolQualifyNo === report.general?.competitionNo
        ? '该项目小组赛后全员晋级，淘汰赛主要用于重新排序。'
        : `该项目小组赛后淘汰 ${Math.max((report.general?.competitionNo ?? 0) - (report.general?.poolQualifyNo ?? 0), 0)} 人。`,
      eliminationIntensity >= 0.7
        ? '淘汰赛实际对阵密度较高，签位空转不明显。'
        : '淘汰赛包含较多 Bye，对阵密度偏低。',
    ].filter(Boolean),
    breakout,
    fade,
  };

  return {
    ...toEventSummary(report, fileName),
    region: inferRegionFromVenue(report.general?.venue),
    distributions: report.distributions,
    topPoolStanding,
    latestMatches,
    eliminationPhaseGroups,
    poolBouts: poolBouts.slice(0, 40),
    poolGroups,
    participants,
    eliminationLeaders,
    championPath,
    keyOpponents,
    insights,
    athleteProfiles,
    clubProfiles,
    birthBuckets,
    clubDistribution: Object.fromEntries(
      Object.entries(clubDistribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20),
    ),
  };
}

function buildCompetitionInsights(bucket) {
  const reports = bucket.reports || [];
  const totalCompetitionNo = reports.reduce((sum, report) => sum + (report.general?.competitionNo || 0), 0);
  const totalPoolQualifyNo = reports.reduce((sum, report) => sum + (report.general?.poolQualifyNo || 0), 0);
  const totalPlayedElimination = reports.reduce((sum, report) => sum + (report.summary?.playedEliminationMatchCount || 0), 0);
  const totalBye = reports.reduce((sum, report) => sum + (report.summary?.byeMatchCount || 0), 0);

  const weaponDistribution = Object.fromEntries(
    reports.reduce((map, report) => {
      const eventName = report.general?.eventName || '';
      const weapon = eventName.includes('花剑') ? '花剑' : eventName.includes('重剑') ? '重剑' : eventName.includes('佩剑') ? '佩剑' : '未知';
      map.set(weapon, (map.get(weapon) || 0) + 1);
      return map;
    }, new Map()),
  );

  const ageDistribution = Object.fromEntries(
    reports.reduce((map, report) => {
      const eventName = report.general?.eventName || '';
      const ageMatch = eventName.match(/U\d+|\d+\+/);
      const age = ageMatch?.[0] || '未知';
      map.set(age, (map.get(age) || 0) + 1);
      return map;
    }, new Map()),
  );

  const largestEvent = reports
    .map((report) => ({
      eventName: report.general?.eventName,
      shortEventName: formatShortEventName(report.general?.eventName),
      count: report.general?.competitionNo || 0,
      qualify: report.general?.poolQualifyNo || 0,
      elimination: report.summary?.playedEliminationMatchCount || 0,
      bye: report.summary?.byeMatchCount || 0,
    }))
    .sort((a, b) => b.count - a.count)[0] ?? null;
  const eventCharts = reports.map((report) => ({
    eventCode: report.general?.eventCode,
    eventName: report.general?.eventName,
    shortEventName: formatShortEventName(report.general?.eventName),
    competitionNo: report.general?.competitionNo || 0,
    poolQualifyNo: report.general?.poolQualifyNo || 0,
    playedEliminationMatchCount: report.summary?.playedEliminationMatchCount || 0,
    byeMatchCount: report.summary?.byeMatchCount || 0,
  })).sort((a, b) => b.competitionNo - a.competitionNo);
  const totalEliminationSlots = totalPlayedElimination + totalBye;
  const birthBuckets = Object.values(
    reports.flatMap((report) => report.normalized?.classment || []).reduce((acc, entry) => {
      const label = birthHalfYear(entry.birthday) || '未知';
      if (!acc[label]) {
        acc[label] = {
          label,
          entrants: 0,
          top8: 0,
          medals: 0,
          bestRank: 999,
        };
      }
      const bucket = acc[label];
      bucket.entrants += 1;
      if (entry.rank && entry.rank <= 8) bucket.top8 += 1;
      if (entry.medal) bucket.medals += 1;
      if (entry.rank && entry.rank < bucket.bestRank) bucket.bestRank = entry.rank;
      return acc;
    }, {}),
  )
    .map((bucket) => ({
      ...bucket,
      bestRank: bucket.bestRank === 999 ? null : bucket.bestRank,
      top8Rate: bucket.entrants ? Math.round((bucket.top8 / bucket.entrants) * 100) : 0,
    }))
    .sort((a, b) => String(a.label).localeCompare(String(b.label), 'zh-CN'));

  return {
    totalCompetitionNo,
    totalPoolQualifyNo,
    totalPlayedElimination,
    totalBye,
    weaponDistribution,
    ageDistribution,
    largestEvent,
    eventCharts,
    birthBuckets,
    qualifyRate: totalCompetitionNo ? Math.round((totalPoolQualifyNo / totalCompetitionNo) * 100) : 0,
    eliminationPlayRate: totalEliminationSlots ? Math.round((totalPlayedElimination / totalEliminationSlots) * 100) : 0,
    summaryCards: [
      {
        title: '总人数',
        value: totalCompetitionNo,
        detail: `${bucket.items.length} 个项目`,
      },
      {
        title: '晋级人数',
        value: totalPoolQualifyNo,
        detail: totalPoolQualifyNo === totalCompetitionNo ? '全部晋级' : '含小组淘汰',
      },
      {
        title: '淘汰赛密度',
        value: `${totalPlayedElimination} 场`,
        detail: `Bye ${totalBye} 场`,
      },
    ],
    bullets: [
      largestEvent
        ? `${largestEvent.shortEventName} 人数最多，${largestEvent.count} 人，晋级 ${largestEvent.qualify} 人。`
        : null,
    ].filter(Boolean),
  };
}

function makeAthleteId(name, licence, club) {
  return encodeURIComponent(licence || `${name || 'unknown'}__${club || 'unknown'}`);
}

function makeClubId(club) {
  return encodeURIComponent(club || 'unknown');
}

function buildAthleteDirectory(reports) {
  const athletes = new Map();

  function opponentKey(name, licence, club) {
    return licence || `${name || 'unknown'}__${club || ''}`;
  }

  function addOpponentRecord(map, athleteSide, opponentSide, athleteWon, match, event) {
    const key = opponentKey(opponentSide.name, opponentSide.licence, opponentSide.club);
    if (!map.has(key)) {
      map.set(key, {
        id: makeAthleteId(opponentSide.name, opponentSide.licence, opponentSide.club),
        name: opponentSide.name,
        club: opponentSide.club,
        matches: 0,
        wins: 0,
        losses: 0,
        scored: 0,
        received: 0,
        latestEventName: event.shortEventName,
        latestSportName: event.sportName,
        latestDate: event.openDate,
      });
    }

    const row = map.get(key);
    row.matches += 1;
    if (athleteWon) row.wins += 1;
    else row.losses += 1;
    row.scored += Number(athleteSide.points) || 0;
    row.received += Number(opponentSide.points) || 0;
    row.latestEventName = event.shortEventName;
    row.latestSportName = event.sportName;
    row.latestDate = event.openDate;
    row.latestScore = `${athleteSide.points ?? '-'}:${opponentSide.points ?? '-'}`;
    row.latestPhase = match.phase?.longName || '淘汰赛';
  }

  for (const { fileName, report } of reports) {
    const event = buildEventDetail(report, fileName);
    for (const athlete of event.athleteProfiles || []) {
      const id = makeAthleteId(athlete.name, athlete.licence, athlete.club);
      if (!athletes.has(id)) {
        athletes.set(id, {
          id,
          name: athlete.name,
          club: athlete.club,
          bestRank: athlete.finalRank ?? null,
          medals: athlete.medal ? 1 : 0,
          appearances: 1,
          eliminationWins: athlete.eliminationWins || 0,
          eliminationLosses: athlete.eliminationLosses || 0,
          latestRank: athlete.finalRank ?? null,
          latestEventName: event.shortEventName,
          latestDate: event.openDate,
          opponentsMap: new Map(),
          events: [{
            sportCode: event.sportCode,
            sportName: event.sportName,
            eventCode: event.eventCode,
            eventName: event.eventName,
            shortEventName: event.shortEventName,
            openDate: event.openDate,
            venue: event.venue,
            finalRank: athlete.finalRank,
            medal: athlete.medal,
            poolRank: athlete.poolRank,
            poolWins: athlete.poolWins,
            poolMatches: athlete.poolMatches,
            poolDiff: athlete.poolDiff,
            ageBand: athlete.ageBand,
            eliminationWins: athlete.eliminationWins,
            eliminationLosses: athlete.eliminationLosses,
          }],
        });
      } else {
        const bucket = athletes.get(id);
        bucket.appearances += 1;
        if (athlete.medal) bucket.medals += 1;
        if (athlete.finalRank && (!bucket.bestRank || athlete.finalRank < bucket.bestRank)) {
          bucket.bestRank = athlete.finalRank;
        }
        bucket.eliminationWins += athlete.eliminationWins || 0;
        bucket.eliminationLosses += athlete.eliminationLosses || 0;
        if (!bucket.latestDate || String(event.openDate || '').localeCompare(String(bucket.latestDate || ''), 'zh-CN') > 0) {
          bucket.latestRank = athlete.finalRank ?? bucket.latestRank;
          bucket.latestEventName = event.shortEventName;
          bucket.latestDate = event.openDate;
        }
        bucket.events.push({
          sportCode: event.sportCode,
          sportName: event.sportName,
          eventCode: event.eventCode,
          eventName: event.eventName,
          shortEventName: event.shortEventName,
          openDate: event.openDate,
          venue: event.venue,
          finalRank: athlete.finalRank,
          medal: athlete.medal,
          poolRank: athlete.poolRank,
          poolWins: athlete.poolWins,
          poolMatches: athlete.poolMatches,
          poolDiff: athlete.poolDiff,
          ageBand: athlete.ageBand,
          eliminationWins: athlete.eliminationWins,
          eliminationLosses: athlete.eliminationLosses,
        });
      }

      const bucket = athletes.get(id);
      const athleteKey = opponentKey(athlete.name, athlete.licence, athlete.club);
      for (const match of event.eliminationPhaseGroups?.flatMap((group) => group.matches) || []) {
        const homeKey = opponentKey(match.home.name, match.home.licence, match.home.club);
        const awayKey = opponentKey(match.away.name, match.away.licence, match.away.club);
        if (athleteKey === homeKey) {
          addOpponentRecord(bucket.opponentsMap, match.home, match.away, match.home.result === 'W', match, event);
        }
        if (athleteKey === awayKey) {
          addOpponentRecord(bucket.opponentsMap, match.away, match.home, match.away.result === 'W', match, event);
        }
      }
    }
  }

  return [...athletes.values()]
    .map((athlete) => {
      const opponents = [...athlete.opponentsMap.values()]
        .map((row) => ({
          ...row,
          diff: row.scored - row.received,
        }))
        .sort((a, b) => b.matches - a.matches || b.wins - a.wins || b.diff - a.diff)
        .slice(0, 8);
      const { opponentsMap, ...rest } = athlete;
      return {
        ...rest,
        opponents,
        events: athlete.events.sort((a, b) => String(b.openDate || '').localeCompare(String(a.openDate || ''), 'zh-CN')),
      };
    })
    .sort((a, b) => (a.bestRank ?? 999) - (b.bestRank ?? 999) || b.medals - a.medals || b.appearances - a.appearances);
}

function buildClubDirectory(reports) {
  const clubs = new Map();

  for (const { fileName, report } of reports) {
    const event = buildEventDetail(report, fileName);
    for (const club of event.clubProfiles || []) {
      const id = makeClubId(club.club);
      if (!clubs.has(id)) {
        clubs.set(id, {
          id,
          club: club.club,
          medals: club.medals || 0,
          top8: club.top8 || 0,
          entrants: club.entrants || 0,
          bestRank: club.bestRank || null,
          events: [{
            sportCode: event.sportCode,
            sportName: event.sportName,
            eventCode: event.eventCode,
            eventName: event.eventName,
            entrants: club.entrants,
            medals: club.medals,
            top8: club.top8,
            bestRank: club.bestRank,
          }],
        });
      } else {
        const bucket = clubs.get(id);
        bucket.medals += club.medals || 0;
        bucket.top8 += club.top8 || 0;
        bucket.entrants += club.entrants || 0;
        if (club.bestRank && (!bucket.bestRank || club.bestRank < bucket.bestRank)) {
          bucket.bestRank = club.bestRank;
        }
        bucket.events.push({
          sportCode: event.sportCode,
          sportName: event.sportName,
          eventCode: event.eventCode,
          eventName: event.eventName,
          entrants: club.entrants,
          medals: club.medals,
          top8: club.top8,
          bestRank: club.bestRank,
        });
      }
    }
  }

  return [...clubs.values()]
    .map((club) => ({
      ...club,
      events: club.events.sort((a, b) => (a.bestRank ?? 999) - (b.bestRank ?? 999)),
    }))
    .sort((a, b) => b.medals - a.medals || b.top8 - a.top8 || (a.bestRank ?? 999) - (b.bestRank ?? 999));
}

function groupReportsBySport(reports) {
  const grouped = new Map();

  for (const { fileName, report } of reports) {
    const event = toEventSummary(report, fileName);
    const sportCode = event.sportCode || fileName;
    if (!grouped.has(sportCode)) {
      grouped.set(sportCode, {
        sportCode,
        sportName: event.sportName,
        venue: event.venue,
        region: inferRegionFromVenue(event.venue),
        dates: new Set(),
        items: [],
        reports: [],
      });
    }

    const bucket = grouped.get(sportCode);
    if (event.openDate) bucket.dates.add(event.openDate);
    bucket.items.push({
      eventCode: event.eventCode,
      eventName: event.eventName,
      shortEventName: event.shortEventName,
      openDate: event.openDate,
      competitionNo: event.competitionNo,
      poolCount: event.poolCount,
      poolQualifyNo: event.poolQualifyNo,
      deStartPhase: event.deStartPhase,
      playedEliminationMatchCount: event.playedEliminationMatchCount,
      byeMatchCount: event.byeMatchCount,
      athleteNames: event.athleteNames || [],
    });
    bucket.reports.push(report);
  }

  return [...grouped.values()].map((bucket) => ({
    sportCode: bucket.sportCode,
    sportName: bucket.sportName,
    venue: bucket.venue,
    region: bucket.region,
    dateLabel: bucket.dates.size ? [...bucket.dates].sort().join(' / ') : '日期待确认',
    itemCount: bucket.items.length,
    insights: buildCompetitionInsights(bucket),
    items: bucket.items.sort((a, b) => String(a.eventName).localeCompare(String(b.eventName), 'zh-CN')),
  })).sort((a, b) => String(a.sportName).localeCompare(String(b.sportName), 'zh-CN'));
}

async function readRequestBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      throw new Error('文件过大，当前限制为 20MB。');
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf8');
}

async function handleAnalyze(request, response) {
  try {
    const raw = await readRequestBody(request);
    const body = JSON.parse(raw);
    if (!body.content || typeof body.content !== 'string') {
      sendJson(response, 400, { ok: false, message: '缺少 content 字段。' });
      return;
    }

    const parsedJson = JSON.parse(body.content);
    const analysis = analyzeRecords(parsedJson, { sampleSize: 30 });
    const report = {
      ok: true,
      source: {
        fileName: body.fileName ?? null,
        sourceUrl: body.sourceUrl ?? null,
        parsedUrl: parseOfficialResultUrl(body.sourceUrl),
        analyzedAt: new Date().toISOString(),
        note: '本地上传文本解析，未发起任何外部网络请求。',
      },
      ...analysis,
    };

    await mkdir(path.join(__dirname, 'data', 'analysis'), { recursive: true });
    const outputPath = path.join(__dirname, 'data', 'analysis', `web-analysis-${Date.now()}.json`);
    await writeFile(outputPath, stableStringify(report), 'utf8');

    sendJson(response, 200, {
      ...report,
      savedTo: outputPath,
    });
  } catch (error) {
    sendJson(response, 400, {
      ok: false,
      message: error.message,
    });
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === 'HEAD') {
    const filePath = safePublicPath((url.pathname === '/' || url.pathname === '/viewer') ? '/viewer.html' : url.pathname === '/admin/import' ? '/admin-import.html' : url.pathname);
    if (!filePath) {
      response.writeHead(403);
      response.end();
      return;
    }

    try {
      await readFile(filePath);
      const contentType = MIME_TYPES[path.extname(filePath)] ?? 'application/octet-stream';
      response.writeHead(200, { 'Content-Type': contentType });
      response.end();
    } catch {
      response.writeHead(404);
      response.end();
    }
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/analyze') {
    await handleAnalyze(request, response);
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/admin/import/preview') {
    await handleAdminPreview(request, response, url);
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/admin/import/commit') {
    await handleAdminCommit(request, response, url);
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/me/follows') {
    await handleGetFollows(response, url);
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/me/follows') {
    await handleSaveFollow(request, response);
    return;
  }

  if (request.method === 'DELETE' && url.pathname === '/api/me/follows') {
    await handleDeleteFollow(request, response);
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/events') {
    try {
      sendJson(response, 200, await getPublicEventsPayload());
    } catch (error) {
      sendJson(response, 500, { ok: false, message: error.message });
    }
    return;
  }

  if (request.method === 'GET' && url.pathname.startsWith('/api/competitions/')) {
    try {
      const sportCode = decodeURIComponent(url.pathname.replace('/api/competitions/', ''));
      const reports = await getScoreReports();
      const competitions = groupReportsBySport(reports);
      const found = competitions.find((competition) => competition.sportCode === sportCode);
      if (!found) {
        sendJson(response, 404, { ok: false, message: '未找到比赛数据。' });
        return;
      }
      sendJson(response, 200, {
        ok: true,
        version: APP_VERSION,
        competition: found,
      });
    } catch (error) {
      sendJson(response, 500, { ok: false, message: error.message });
    }
    return;
  }

  if (request.method === 'GET' && url.pathname.startsWith('/api/events/')) {
    try {
      const eventCode = decodeURIComponent(url.pathname.replace('/api/events/', ''));
      const reports = await getScoreReports();
      const found = reports.find(({ report }) => report.general?.eventCode === eventCode);
      if (!found) {
        sendJson(response, 404, { ok: false, message: '未找到项目数据。' });
        return;
      }
      sendJson(response, 200, {
        ok: true,
        version: APP_VERSION,
        event: buildEventDetail(found.report, found.fileName),
      });
    } catch (error) {
      sendJson(response, 500, { ok: false, message: error.message });
    }
    return;
  }

  if (request.method === 'GET' && url.pathname.startsWith('/api/athletes/')) {
    try {
      const athleteId = url.pathname.replace('/api/athletes/', '');
      const athletes = await getAthleteDirectory();
      const found = athletes.find((athlete) => athlete.id === athleteId);
      if (!found) {
        sendJson(response, 404, { ok: false, message: '未找到选手画像。' });
        return;
      }
      sendJson(response, 200, { ok: true, version: APP_VERSION, athlete: found });
    } catch (error) {
      sendJson(response, 500, { ok: false, message: error.message });
    }
    return;
  }

  if (request.method === 'GET' && url.pathname.startsWith('/api/clubs/')) {
    try {
      const clubId = url.pathname.replace('/api/clubs/', '');
      const clubs = await getClubDirectory();
      const found = clubs.find((club) => club.id === clubId);
      if (!found) {
        sendJson(response, 404, { ok: false, message: '未找到俱乐部画像。' });
        return;
      }
      sendJson(response, 200, { ok: true, version: APP_VERSION, club: found });
    } catch (error) {
      sendJson(response, 500, { ok: false, message: error.message });
    }
    return;
  }

  if (request.method !== 'GET') {
    response.writeHead(405);
    response.end('Method Not Allowed');
    return;
  }

  const filePath = safePublicPath((url.pathname === '/' || url.pathname === '/viewer') ? '/viewer.html' : url.pathname === '/admin/import' ? '/admin-import.html' : url.pathname);
  if (!filePath) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  try {
    const content = await readFile(filePath);
    const contentType = MIME_TYPES[path.extname(filePath)] ?? 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': contentType });
    response.end(content);
  } catch {
    response.writeHead(404);
    response.end('Not Found');
  }
});

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`Fencing data admin is running at http://127.0.0.1:${PORT}`);
  });
}

export {
  getPublicEventsPayload,
  getEventDetailByCode,
  getAthleteDirectory,
  getClubDirectory,
};
