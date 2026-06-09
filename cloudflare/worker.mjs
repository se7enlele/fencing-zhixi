import adminImportHtml from '../web/admin-import.html';
import viewerHtml from '../web/viewer.html';
import { buildPreEventCompetitions } from '../tools/pre-event-data.mjs';
import { searchIndexes } from '../tools/search-index.mjs';
import {
  buildAthleteDirectoryFromEvents,
  buildClubDirectoryFromEvents,
  buildEventDetail,
  groupEventsBySport,
  parseUploadedJsonText,
  previewImportPayload,
} from './edge-data.mjs';

const APP_VERSION = 'fencingai-cloudflare';
const ADMIN_TOKEN = 'fencingai-admin-2026';
const SCORE_INDEX_KEY = 'score:index';
const PROJECTLIST_INDEX_KEY = 'projectlist:index';
const ROSTER_INDEX_KEY = 'registration-roster:index';
const MAX_IMPORT_BYTES = 20 * 1024 * 1024;
const NO_STORE_CACHE = 'no-store';
const PUBLIC_INDEX_CACHE = 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400';
const PUBLIC_DETAIL_CACHE = 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800';
let bundledIndexPromise = null;
let bundledDataPromise = null;
let bundledSearchPromise = null;
const chunkObjectPromises = new Map();

function json(payload, status = 200, cacheControl = NO_STORE_CACHE) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl,
    },
  });
}

function html(content) {
  return new Response(content, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function findProjectOnlyEvent(publicEvents, eventCode) {
  const competition = (publicEvents.competitions || []).find((item) => (
    (item.items || []).some((project) => project.eventCode === eventCode)
  ));
  const project = competition?.items?.find((item) => item.eventCode === eventCode);
  if (!competition || !project) return null;
  return {
    ...project,
    sportCode: competition.sportCode,
    sportName: competition.sportName,
    venue: competition.venue,
    participants: project.roster || [],
    athleteProfiles: [],
    clubProfiles: [],
    poolGroups: [],
    eliminationMatches: [],
    status: project.status,
    rosterStatus: competition.rosterStatus,
  };
}

function normalizeDeviceId(deviceId) {
  const value = String(deviceId || '').trim();
  if (!/^[a-zA-Z0-9._-]{12,80}$/.test(value)) {
    throw new Error('设备标识无效。');
  }
  return value;
}

async function readJsonKv(kv, key, fallback = null) {
  if (!kv) return fallback;
  const raw = await kv.get(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function loadBundledIndex(env) {
  if (!bundledIndexPromise) {
    bundledIndexPromise = (async () => {
      const response = await env.ASSETS.fetch(new Request('https://assets.local/data/public-data-index.json'));
      if (!response.ok) {
        throw new Error(`Unable to load bundled data asset: ${response.status}`);
      }
      return response.json();
    })();
  }
  return bundledIndexPromise;
}

async function loadChunkObject(env, assetPath) {
  if (!assetPath) return {};
  if (!chunkObjectPromises.has(assetPath)) {
    chunkObjectPromises.set(assetPath, (async () => {
      const response = await env.ASSETS.fetch(new Request(`https://assets.local${assetPath}`));
      if (!response.ok) {
        throw new Error(`Unable to load bundled data chunk ${assetPath}: ${response.status}`);
      }
      return response.json();
    })());
  }
  return chunkObjectPromises.get(assetPath);
}

async function findInChunks(env, paths = [], key) {
  if (!key) return null;
  for (const assetPath of paths || []) {
    const chunk = await loadChunkObject(env, assetPath);
    if (chunk && Object.prototype.hasOwnProperty.call(chunk, key)) {
      return chunk[key];
    }
  }
  return null;
}

async function loadSearchIndexes(env) {
  if (!bundledSearchPromise) {
    bundledSearchPromise = (async () => {
      const index = await loadBundledIndex(env);
      const chunks = await Promise.all((index.chunks?.search || []).map((assetPath) => loadChunkObject(env, assetPath)));
      return chunks.reduce((merged, chunk) => ({
        athletes: [...merged.athletes, ...(chunk.athletes || [])],
        clubs: [...merged.clubs, ...(chunk.clubs || [])],
      }), { athletes: [], clubs: [] });
    })();
  }
  return bundledSearchPromise;
}

async function loadBundledData(env) {
  if (!bundledDataPromise) {
    bundledDataPromise = (async () => {
      const index = await loadBundledIndex(env);
      const loadChunks = async (paths = []) => {
        const objects = await Promise.all((paths || []).map((assetPath) => loadChunkObject(env, assetPath)));
        return Object.assign({}, ...objects);
      };
      return {
        version: index.version,
        publicEvents: index.publicEvents,
        eventsByCode: await loadChunks(index.chunks?.eventsByCode),
        athletesById: await loadChunks(index.chunks?.athletesById),
        clubsById: await loadChunks(index.chunks?.clubsById),
      };
    })();
  }
  return bundledDataPromise;
}

async function readFollows(env, deviceId) {
  const record = await readJsonKv(env.FOLLOWS, `device:${deviceId}`, null);
  return Array.isArray(record?.follows) ? record.follows : [];
}

async function writeFollows(env, deviceId, follows) {
  if (!env.FOLLOWS) return;
  await env.FOLLOWS.put(`device:${deviceId}`, JSON.stringify({
    updatedAt: new Date().toISOString(),
    follows,
  }));
}

async function handleFollows(request, env, url) {
  if (request.method === 'GET') {
    const deviceId = normalizeDeviceId(url.searchParams.get('deviceId'));
    return json({ ok: true, version: APP_VERSION, deviceId, follows: await readFollows(env, deviceId) });
  }

  const body = await request.json();
  const deviceId = normalizeDeviceId(body.deviceId);
  const current = await readFollows(env, deviceId);

  if (request.method === 'POST') {
    const athlete = body.athlete;
    if (!athlete?.id || !athlete?.name) return json({ ok: false, message: '缺少选手信息。' }, 400);
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
    const follows = [snapshot, ...current.filter((item) => item.id !== athlete.id)].slice(0, 30);
    await writeFollows(env, deviceId, follows);
    return json({ ok: true, version: APP_VERSION, deviceId, follows });
  }

  if (request.method === 'DELETE') {
    const follows = current.filter((item) => item.id !== body.athleteId);
    await writeFollows(env, deviceId, follows);
    return json({ ok: true, version: APP_VERSION, deviceId, follows });
  }

  return json({ ok: false, message: 'Method not allowed' }, 405);
}

async function readDynamicScoreReports(env) {
  if (!env.FOLLOWS) return [];
  const index = await readJsonKv(env.FOLLOWS, SCORE_INDEX_KEY, { eventCodes: [] });
  const eventCodes = Array.isArray(index?.eventCodes) ? index.eventCodes : [];
  const reports = await Promise.all(eventCodes.map(async (eventCode) => {
    const report = await readJsonKv(env.FOLLOWS, `score:${eventCode}`, null);
    return report?.general?.eventCode ? {
      fileName: `kv-score-${eventCode}-analysis.json`,
      report,
    } : null;
  }));
  return reports.filter(Boolean);
}

async function readDynamicPreEventReports(env) {
  if (!env.FOLLOWS) return { projectLists: [], rosterBatches: [] };
  const projectIndex = await readJsonKv(env.FOLLOWS, PROJECTLIST_INDEX_KEY, { sportCodes: [] });
  const sportCodes = Array.isArray(projectIndex?.sportCodes) ? projectIndex.sportCodes : [];
  const projectLists = (await Promise.all(sportCodes.map(async (sportCode) => {
    const report = await readJsonKv(env.FOLLOWS, `projectlist:${sportCode}`, null);
    return report ? { fileName: `kv-projectlist-${sportCode}.json`, report } : null;
  }))).filter(Boolean);

  const rosterIndex = await readJsonKv(env.FOLLOWS, ROSTER_INDEX_KEY, { batchKeys: [] });
  const batchKeys = Array.isArray(rosterIndex?.batchKeys) ? rosterIndex.batchKeys : [];
  const rosterBatches = (await Promise.all(batchKeys.map(async (key) => {
    const report = await readJsonKv(env.FOLLOWS, key, null);
    return report?.importType === 'registration-roster' ? { fileName: `${key}.json`, report } : null;
  }))).filter(Boolean);

  return { projectLists, rosterBatches };
}

function mergeDynamicCompetition(base, dynamicCompetition) {
  if (!base) return dynamicCompetition;
  const items = mergeCompetitionItems(base.items, dynamicCompetition.items);
  const baseHasScores = !base.isPreEvent && !base.isPlatformEventList;
  return {
    ...(baseHasScores ? dynamicCompetition : base),
    ...(baseHasScores ? base : dynamicCompetition),
    sportName: dynamicCompetition.sportName?.startsWith('赛前赛事 ') ? base.sportName : (dynamicCompetition.sportName || base.sportName),
    venue: dynamicCompetition.venue || base.venue,
    region: dynamicCompetition.region || base.region,
    dateLabel: dynamicCompetition.dateLabel || base.dateLabel,
    itemCount: Math.max(items.length, Number(base.itemCount) || 0, Number(dynamicCompetition.itemCount) || 0),
    groupLabels: dynamicCompetition.groupLabels?.length ? dynamicCompetition.groupLabels : base.groupLabels,
    platformMeta: {
      ...(base.platformMeta || {}),
      ...(dynamicCompetition.platformMeta || {}),
    },
    items,
  };
}

function mergeCompetitionItems(primaryItems = [], secondaryItems = []) {
  const byEventCode = new Map();
  for (const item of primaryItems || []) {
    if (!item?.eventCode) continue;
    byEventCode.set(item.eventCode, item);
  }
  for (const item of secondaryItems || []) {
    if (!item?.eventCode || byEventCode.has(item.eventCode)) continue;
    byEventCode.set(item.eventCode, item);
  }
  return [...byEventCode.values()].sort((a, b) => String(a.eventName || '').localeCompare(String(b.eventName || ''), 'zh-CN'));
}

async function getCompetitionIndex(env) {
  const index = await loadBundledIndex(env);
  const preEventReports = await readDynamicPreEventReports(env);
  if (!preEventReports.projectLists.length && !preEventReports.rosterBatches.length) {
    return { index, competitions: index.publicEvents.competitions || [], hasDynamicPreEvent: false };
  }

  const dynamicCompetitions = buildPreEventCompetitions(preEventReports);
  const bySportCode = new Map((index.publicEvents.competitions || []).map((competition) => [competition.sportCode, competition]));
  for (const competition of dynamicCompetitions) {
    const current = bySportCode.get(competition.sportCode);
    bySportCode.set(competition.sportCode, mergeDynamicCompetition(current, competition));
  }

  return {
    index,
    competitions: [...bySportCode.values()],
    hasDynamicPreEvent: true,
  };
}

function buildPreEventDetails(competitions) {
  const entries = {};
  for (const competition of competitions) {
    for (const item of competition.items || []) {
      if (!item.isPreEvent) continue;
      entries[item.eventCode] = {
        ...item,
        sportCode: competition.sportCode,
        sportName: competition.sportName,
        venue: competition.venue,
        participants: item.roster || [],
        athleteProfiles: [],
        clubProfiles: [],
        poolGroups: [],
        eliminationMatches: [],
        status: item.status,
        rosterStatus: competition.rosterStatus,
      };
    }
  }
  return entries;
}

async function getMergedData(env) {
  const data = await loadBundledData(env);
  const baseVersion = data.version || APP_VERSION;
  const dynamicReports = await readDynamicScoreReports(env);
  const preEventReports = await readDynamicPreEventReports(env);
  if (!dynamicReports.length && !preEventReports.projectLists.length && !preEventReports.rosterBatches.length) {
    return {
      version: baseVersion,
      publicEvents: {
        ...data.publicEvents,
        athletes: Object.values(data.athletesById || {}).slice(0, 500),
        clubs: Object.values(data.clubsById || {}).slice(0, 300),
      },
      eventsByCode: data.eventsByCode || {},
      athletesById: data.athletesById || {},
      clubsById: data.clubsById || {},
    };
  }

  const eventsByCode = { ...data.eventsByCode };
  for (const { fileName, report } of dynamicReports) {
    eventsByCode[report.general.eventCode] = buildEventDetail(report, fileName);
  }

  const events = Object.values(eventsByCode)
    .map((event) => ({
      fileName: event.fileName,
      eventCode: event.eventCode,
      sportCode: event.sportCode,
      sportName: event.sportName,
      eventName: event.eventName,
      shortEventName: event.shortEventName,
      openDate: event.openDate,
      venue: event.venue,
      competitionNo: event.competitionNo,
      poolCount: event.poolCount,
      poolQualifyNo: event.poolQualifyNo,
      deStartPhase: event.deStartPhase,
      eliminationMatchCount: event.eliminationMatchCount,
      playedEliminationMatchCount: event.playedEliminationMatchCount,
      byeMatchCount: event.byeMatchCount,
      athleteNames: event.athleteNames || [],
    }))
    .sort((a, b) => String(a.sportName).localeCompare(String(b.sportName), 'zh-CN') || String(a.eventName).localeCompare(String(b.eventName), 'zh-CN'));

  const scoreCompetitions = groupEventsBySport(events);
  const bundledPreEventCompetitions = data.publicEvents.competitions || [];
  const dynamicPreEventCompetitions = buildPreEventCompetitions(preEventReports);
  const preEventBySport = new Map();
  for (const competition of bundledPreEventCompetitions) {
    preEventBySport.set(competition.sportCode, competition);
  }
  for (const competition of dynamicPreEventCompetitions) {
    preEventBySport.set(competition.sportCode, competition);
  }
  const competitionsBySport = new Map(scoreCompetitions.map((competition) => [competition.sportCode, competition]));
  for (const competition of preEventBySport.values()) {
    const current = competitionsBySport.get(competition.sportCode);
    competitionsBySport.set(competition.sportCode, mergeDynamicCompetition(current, competition));
  }
  const mergedCompetitions = [...competitionsBySport.values()];
  Object.assign(eventsByCode, buildPreEventDetails(mergedCompetitions));

  return {
    version: `${baseVersion}+kv${dynamicReports.length}`,
    publicEvents: {
      ok: true,
      version: `${baseVersion}+kv${dynamicReports.length}`,
      events,
      competitions: mergedCompetitions,
      athletes: Object.values(buildAthleteDirectoryFromEvents(eventsByCode)).slice(0, 500),
      clubs: Object.values(buildClubDirectoryFromEvents(eventsByCode)).slice(0, 300),
      dataCoverage: {
        ...(data.publicEvents.dataCoverage || {}),
        scorePackages: events.length,
        kvScorePackages: dynamicReports.length,
      },
    },
    eventsByCode,
    athletesById: Object.fromEntries(buildAthleteDirectoryFromEvents(eventsByCode).map((athlete) => [athlete.id, athlete])),
    clubsById: Object.fromEntries(buildClubDirectoryFromEvents(eventsByCode).map((club) => [club.id, club])),
  };
}

function requireAdmin(url) {
  return url.searchParams.get('token') === ADMIN_TOKEN;
}

async function summarizeRosterImport(env, preview) {
  if (preview.importType !== 'registration-roster') return null;
  const incoming = preview.report.normalized?.records || [];
  const existingKeys = new Set();
  const { rosterBatches } = await readDynamicPreEventReports(env);
  for (const batch of rosterBatches) {
    for (const row of batch.report.normalized?.records || []) {
      if (row.dedupeKey) existingKeys.add(row.dedupeKey);
    }
  }

  let newRecords = 0;
  let duplicateRecords = 0;
  for (const row of incoming) {
    if (existingKeys.has(row.dedupeKey)) duplicateRecords += 1;
    else {
      newRecords += 1;
      existingKeys.add(row.dedupeKey);
    }
  }
  return {
    incomingRecords: incoming.length,
    newRecords,
    duplicateRecords,
    cumulativeRecords: existingKeys.size,
  };
}

async function readImportBody(request) {
  const text = await request.text();
  if (text.length > MAX_IMPORT_BYTES) throw new Error('文件过大，当前限制为 20MB。');
  const body = JSON.parse(text);
  if (!body.content || typeof body.content !== 'string') throw new Error('缺少文件内容。');
  return body;
}

async function previewResponse(env, preview, exists) {
  return {
    ok: true,
    version: APP_VERSION,
    exists,
    importStats: await summarizeRosterImport(env, preview),
    preview: {
      importType: preview.importType,
      eventCode: preview.eventCode,
      targetFile: preview.targetFile,
      general: preview.general,
      summary: preview.summary,
      note: preview.note || null,
    },
  };
}

async function handleAdminImport(request, env, url) {
  if (!requireAdmin(url)) return json({ ok: false, message: 'Forbidden' }, 403);
  try {
    const body = await readImportBody(request);
    const payload = parseUploadedJsonText(body.content);
    const preview = previewImportPayload(payload, body);
    const existing = preview.eventCode ? await readJsonKv(env.FOLLOWS, `score:${preview.eventCode}`, null) : null;

    if (url.pathname.endsWith('/preview')) {
      return json(await previewResponse(env, preview, Boolean(existing)));
    }

    const importStats = await summarizeRosterImport(env, preview);

    if (preview.importType === 'score') {
      const index = await readJsonKv(env.FOLLOWS, SCORE_INDEX_KEY, { eventCodes: [] });
      const currentCodes = Array.isArray(index?.eventCodes) ? index.eventCodes : [];
      const eventCodes = [preview.eventCode, ...currentCodes.filter((code) => code !== preview.eventCode)];
      await env.FOLLOWS.put(`score:${preview.eventCode}`, JSON.stringify(preview.report));
      await env.FOLLOWS.put(SCORE_INDEX_KEY, JSON.stringify({ eventCodes, updatedAt: new Date().toISOString() }));
    } else if (preview.importType === 'projectlist') {
      const sportCode = preview.report.summary?.sportCodes?.[0] || preview.general?.sportId || 'unknown';
      const index = await readJsonKv(env.FOLLOWS, PROJECTLIST_INDEX_KEY, { sportCodes: [] });
      const currentCodes = Array.isArray(index?.sportCodes) ? index.sportCodes : [];
      const sportCodes = [String(sportCode), ...currentCodes.filter((code) => code !== String(sportCode))];
      await env.FOLLOWS.put(`projectlist:${sportCode}`, JSON.stringify(preview.report));
      await env.FOLLOWS.put(PROJECTLIST_INDEX_KEY, JSON.stringify({ sportCodes, updatedAt: new Date().toISOString() }));
    } else if (preview.importType === 'registration-roster') {
      const sportCode = preview.report.summary?.sportCodes?.[0] || 'unknown';
      const batchKey = `registration-roster:${sportCode}:${Date.now()}`;
      const index = await readJsonKv(env.FOLLOWS, ROSTER_INDEX_KEY, { batchKeys: [] });
      const currentKeys = Array.isArray(index?.batchKeys) ? index.batchKeys : [];
      await env.FOLLOWS.put(batchKey, JSON.stringify(preview.report));
      await env.FOLLOWS.put(ROSTER_INDEX_KEY, JSON.stringify({ batchKeys: [batchKey, ...currentKeys], updatedAt: new Date().toISOString() }));
    } else {
      return json({ ok: false, message: '不支持的数据类型。' }, 400);
    }

    const rawKey = preview.eventCode || preview.targetFile || preview.importType;
    await env.FOLLOWS.put(`raw:${Date.now()}:${rawKey}`, JSON.stringify({
      fileName: body.fileName || null,
      sourceUrl: body.sourceUrl || null,
      content: body.content,
    }));

    return json({
      ok: true,
      version: APP_VERSION,
      eventCode: preview.eventCode,
      targetFile: preview.targetFile,
      overwritten: Boolean(existing),
      importStats,
      summary: preview.summary,
    });
  } catch (error) {
    return json({ ok: false, message: error.message }, 400);
  }
}

async function routeApi(request, env, url) {
  if (url.pathname === '/api/competitions' && request.method === 'GET') {
    const { index, competitions, hasDynamicPreEvent } = await getCompetitionIndex(env);
    return json({
      ok: true,
      version: index.version,
      competitions,
      dataCoverage: index.publicEvents.dataCoverage || null,
    }, 200, hasDynamicPreEvent ? NO_STORE_CACHE : PUBLIC_INDEX_CACHE);
  }

  if (url.pathname === '/api/events' && request.method === 'GET') {
    const index = await loadBundledIndex(env);
    return json({
      ok: true,
      version: index.version,
      events: index.publicEvents.events || [],
      dataCoverage: index.publicEvents.dataCoverage || null,
    }, 200, PUBLIC_INDEX_CACHE);
  }

  if (url.pathname === '/api/search' && request.method === 'GET') {
    const query = url.searchParams.get('q') || '';
    const type = url.searchParams.get('type') || 'all';
    const athleteLimit = Number(url.searchParams.get('athleteLimit')) || undefined;
    const clubLimit = Number(url.searchParams.get('clubLimit')) || undefined;
    const indexes = await loadSearchIndexes(env);
    return json({
      ok: true,
      version: (await loadBundledIndex(env)).version,
      query,
      type,
      ...searchIndexes(indexes, query, { type, athleteLimit, clubLimit }),
    }, 200, PUBLIC_INDEX_CACHE);
  }

  if (url.pathname.startsWith('/api/competitions/') && request.method === 'GET') {
    const { index, competitions, hasDynamicPreEvent } = await getCompetitionIndex(env);
    const sportCode = decodeURIComponent(url.pathname.replace('/api/competitions/', ''));
    const competition = competitions.find((item) => item.sportCode === sportCode);
    return competition
      ? json({ ok: true, version: index.version, competition }, 200, hasDynamicPreEvent ? NO_STORE_CACHE : PUBLIC_DETAIL_CACHE)
      : json({ ok: false, message: '未找到比赛数据。' }, 404);
  }

  if (url.pathname.startsWith('/api/events/') && request.method === 'GET') {
    const index = await loadBundledIndex(env);
    const { competitions } = await getCompetitionIndex(env);
    const eventCode = decodeURIComponent(url.pathname.replace('/api/events/', ''));
    const dynamicReport = await readJsonKv(env.FOLLOWS, `score:${eventCode}`, null);
    const event = dynamicReport?.general?.eventCode
      ? buildEventDetail(dynamicReport, `kv-score-${eventCode}-analysis.json`)
      : await findInChunks(env, index.chunks?.eventsByCode, eventCode) || findProjectOnlyEvent({ competitions }, eventCode);
    return event ? json({ ok: true, version: index.version, event }, 200, PUBLIC_DETAIL_CACHE) : json({ ok: false, message: '项目不存在。' }, 404);
  }

  if (url.pathname.startsWith('/api/athletes/') && request.method === 'GET') {
    const index = await loadBundledIndex(env);
    const athleteId = decodeURIComponent(url.pathname.replace('/api/athletes/', ''));
    const athlete = await findInChunks(env, index.chunks?.athletesById, athleteId);
    return athlete ? json({ ok: true, version: index.version, athlete }, 200, PUBLIC_DETAIL_CACHE) : json({ ok: false, message: '选手不存在。' }, 404);
  }

  if (url.pathname.startsWith('/api/clubs/') && request.method === 'GET') {
    const index = await loadBundledIndex(env);
    const rawClubId = url.pathname.replace('/api/clubs/', '');
    const decodedClubId = decodeURIComponent(rawClubId);
    const club = await findInChunks(env, index.chunks?.clubsById, rawClubId)
      || await findInChunks(env, index.chunks?.clubsById, decodedClubId)
      || await findInChunks(env, index.chunks?.clubsById, encodeURIComponent(decodedClubId));
    return club ? json({ ok: true, version: index.version, club }, 200, PUBLIC_DETAIL_CACHE) : json({ ok: false, message: '俱乐部不存在。' }, 404);
  }

  if (url.pathname === '/api/me/follows') {
    try {
      return await handleFollows(request, env, url);
    } catch (error) {
      return json({ ok: false, message: error.message }, 400);
    }
  }

  if (url.pathname === '/api/admin/import/preview' || url.pathname === '/api/admin/import/commit') {
    return handleAdminImport(request, env, url);
  }

  return json({ ok: false, message: 'Not found' }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/' || url.pathname === '/viewer') {
      return html(viewerHtml);
    }
    if (url.pathname === '/admin/import') {
      return html(adminImportHtml);
    }
    if (url.pathname.startsWith('/api/')) {
      return routeApi(request, env, url);
    }

    return env.ASSETS.fetch(request);
  },
};
