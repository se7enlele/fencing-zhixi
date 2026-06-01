import data from './data/public-data.mjs';
import adminImportHtml from '../web/admin-import.html';
import viewerHtml from '../web/viewer.html';
import {
  buildAthleteDirectoryFromEvents,
  buildClubDirectoryFromEvents,
  buildEventDetail,
  groupEventsBySport,
  parseUploadedJsonText,
  previewImportPayload,
} from './edge-data.mjs';

const APP_VERSION = data.version || 'fencingai-cloudflare';
const ADMIN_TOKEN = 'fencingai-admin-2026';
const SCORE_INDEX_KEY = 'score:index';
const MAX_IMPORT_BYTES = 20 * 1024 * 1024;

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
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

async function getMergedData(env) {
  const dynamicReports = await readDynamicScoreReports(env);
  if (!dynamicReports.length) return data;

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

  return {
    version: `${APP_VERSION}+kv${dynamicReports.length}`,
    publicEvents: {
      ok: true,
      version: `${APP_VERSION}+kv${dynamicReports.length}`,
      events,
      competitions: groupEventsBySport(events),
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

async function readImportBody(request) {
  const text = await request.text();
  if (text.length > MAX_IMPORT_BYTES) throw new Error('文件过大，当前限制为 20MB。');
  const body = JSON.parse(text);
  if (!body.content || typeof body.content !== 'string') throw new Error('缺少文件内容。');
  return body;
}

function previewResponse(preview, exists) {
  return {
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
      return json(previewResponse(preview, Boolean(existing)));
    }

    if (preview.importType !== 'score') {
      return json({
        ok: false,
        message: '项目清单已可预览，但当前线上入库只接收 score JS 成绩包。请上传 /Resource/score/{eventCode}.js。',
      }, 400);
    }

    const index = await readJsonKv(env.FOLLOWS, SCORE_INDEX_KEY, { eventCodes: [] });
    const currentCodes = Array.isArray(index?.eventCodes) ? index.eventCodes : [];
    const eventCodes = [preview.eventCode, ...currentCodes.filter((code) => code !== preview.eventCode)];
    await env.FOLLOWS.put(`score:${preview.eventCode}`, JSON.stringify(preview.report));
    await env.FOLLOWS.put(SCORE_INDEX_KEY, JSON.stringify({ eventCodes, updatedAt: new Date().toISOString() }));
    await env.FOLLOWS.put(`raw:${Date.now()}:${preview.eventCode}`, JSON.stringify({
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
      summary: preview.summary,
    });
  } catch (error) {
    return json({ ok: false, message: error.message }, 400);
  }
}

async function routeApi(request, env, url) {
  if (url.pathname === '/api/events' && request.method === 'GET') {
    const merged = await getMergedData(env);
    if (merged === data) {
      return json({
        ...data.publicEvents,
        athletes: Object.values(data.athletesById || {}).slice(0, 500),
        clubs: Object.values(data.clubsById || {}).slice(0, 300),
      });
    }
    return json(merged.publicEvents);
  }

  if (url.pathname.startsWith('/api/competitions/') && request.method === 'GET') {
    const merged = await getMergedData(env);
    const sportCode = decodeURIComponent(url.pathname.replace('/api/competitions/', ''));
    const competition = merged.publicEvents.competitions.find((item) => item.sportCode === sportCode);
    return competition
      ? json({ ok: true, version: merged.version, competition })
      : json({ ok: false, message: '未找到比赛数据。' }, 404);
  }

  if (url.pathname.startsWith('/api/events/') && request.method === 'GET') {
    const merged = await getMergedData(env);
    const eventCode = decodeURIComponent(url.pathname.replace('/api/events/', ''));
    const event = merged.eventsByCode[eventCode];
    return event ? json({ ok: true, version: merged.version, event }) : json({ ok: false, message: '项目不存在。' }, 404);
  }

  if (url.pathname.startsWith('/api/athletes/') && request.method === 'GET') {
    const merged = await getMergedData(env);
    const athleteId = decodeURIComponent(url.pathname.replace('/api/athletes/', ''));
    const athlete = merged.athletesById[athleteId];
    return athlete ? json({ ok: true, version: merged.version, athlete }) : json({ ok: false, message: '选手不存在。' }, 404);
  }

  if (url.pathname.startsWith('/api/clubs/') && request.method === 'GET') {
    const merged = await getMergedData(env);
    const clubId = decodeURIComponent(url.pathname.replace('/api/clubs/', ''));
    const club = merged.clubsById[clubId];
    return club ? json({ ok: true, version: merged.version, club }) : json({ ok: false, message: '俱乐部不存在。' }, 404);
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
