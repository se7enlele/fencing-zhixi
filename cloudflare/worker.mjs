import adminImportHtml from '../web/admin-import.html';
import viewerHtml from '../web/viewer.html';
import { buildPreEventCompetitions } from '../tools/pre-event-data.mjs';
import { sanitizePublicData } from '../tools/public-sanitize.mjs';
import { searchIndexes } from '../tools/search-index.mjs';
import { compactCompetitionIndex } from '../tools/competition-index.mjs';
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
const FEEDBACK_INDEX_KEY = 'feedback:index';
const ANALYTICS_INDEX_KEY = 'analytics:index';
const MAX_IMPORT_BYTES = 20 * 1024 * 1024;
const MAX_PROFILE_BODY_BYTES = 160 * 1024;
const LOGIN_RATE_LIMIT_WINDOW_SECONDS = 10 * 60;
const LOGIN_RATE_LIMIT_MAX = 12;
const AUTH_SESSION_TTL_SECONDS = 60 * 60 * 24 * 90;
const MAX_ANALYTICS_DAYS = 60;
const MAX_ANALYTICS_DIMENSION_ROWS = 30;
const NO_STORE_CACHE = 'no-store';
const PUBLIC_INDEX_CACHE = 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400';
const PUBLIC_DETAIL_CACHE = 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800';
let bundledIndexPromise = null;
let bundledLookupPromise = null;
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

function normalizeAuthIdentifier(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) throw new Error('请输入手机号或邮箱。');
  if (raw.includes('@')) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) throw new Error('邮箱格式不正确。');
    return `email:${raw}`.slice(0, 120);
  }
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 6 || digits.length > 20) throw new Error('手机号格式不正确。');
  return `phone:${digits}`;
}

function publicAuthIdentifier(identityKey) {
  const [kind, value] = String(identityKey || '').split(':');
  if (kind === 'email') {
    const [name, domain] = String(value || '').split('@');
    return `${name ? `${name.slice(0, 2)}***` : '***'}@${domain || ''}`;
  }
  if (kind === 'phone') {
    return `${String(value || '').slice(0, 3)}****${String(value || '').slice(-4)}`;
  }
  return '已登录用户';
}

function normalizeLoginCode(value) {
  const code = String(value || '').trim();
  if (code.length < 6 || code.length > 64) throw new Error('登录码至少 6 位。');
  return code;
}

async function sha256Hex(value) {
  const data = new TextEncoder().encode(String(value));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function authUserId(identityKey) {
  return `u_${(await sha256Hex(identityKey)).slice(0, 24)}`;
}

async function hashLoginCode(identityKey, code, salt) {
  return sha256Hex(`${identityKey}:${salt}:${code}`);
}

function randomHex(bytes = 16) {
  const values = new Uint8Array(bytes);
  crypto.getRandomValues(values);
  return [...values].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function authToken() {
  return `fa_${randomHex(32)}`;
}

function userFromRecord(record) {
  if (!record) return null;
  return {
    id: record.id,
    displayName: record.displayName || publicAuthIdentifier(record.identityKey),
    identifier: publicAuthIdentifier(record.identityKey),
    provider: record.provider || 'passwordless',
    createdAt: record.createdAt || null,
    lastLoginAt: record.lastLoginAt || null,
  };
}

function authCapabilities() {
  return {
    provider: 'passwordless',
    sessionDays: Math.round(AUTH_SESSION_TTL_SECONDS / (60 * 60 * 24)),
    loginWindowMinutes: Math.round(LOGIN_RATE_LIMIT_WINDOW_SECONDS / 60),
    loginWindowMax: LOGIN_RATE_LIMIT_MAX,
    profileMaxBytes: MAX_PROFILE_BODY_BYTES,
    limits: {
      follows: 30,
      followedCompetitions: 30,
      recentItems: 20,
      reportHistory: 12,
      aiHistory: 10,
      commercialIntents: 10,
    },
    wechat: {
      status: 'reserved',
      message: '微信登录已预留接口，正式接入后可绑定当前账号。',
    },
  };
}

function getBearerToken(request) {
  const header = request.headers.get('Authorization') || '';
  const match = String(header).match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

async function requestClientKey(request, identityKey = '') {
  const forwarded = String(request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '').split(',')[0].trim();
  return (await sha256Hex(`${identityKey}:${forwarded || 'edge'}`)).slice(0, 24);
}

async function assertLoginAllowed(env, request, identityKey) {
  if (!env.FOLLOWS) return;
  const key = `auth-attempt:${await requestClientKey(request, identityKey)}`;
  const current = await readJsonKv(env.FOLLOWS, key, { count: 0 });
  const count = Number(current?.count || 0) + 1;
  await env.FOLLOWS.put(key, JSON.stringify({ count, updatedAt: new Date().toISOString() }), { expirationTtl: LOGIN_RATE_LIMIT_WINDOW_SECONDS });
  if (count > LOGIN_RATE_LIMIT_MAX) {
    const error = new Error('登录尝试过于频繁，请稍后再试。');
    error.statusCode = 429;
    throw error;
  }
}

function profilePayloadTooLarge(body) {
  return new TextEncoder().encode(JSON.stringify(body || {})).length > MAX_PROFILE_BODY_BYTES;
}

function sanitizeProfileRows(rows, limit) {
  if (!Array.isArray(rows)) return [];
  return rows.slice(0, limit).map((row) => {
    const result = {};
    for (const [key, value] of Object.entries(row || {}).slice(0, 24)) {
      if (typeof value === 'string') result[key] = value.slice(0, 500);
      else if (typeof value === 'number' || typeof value === 'boolean' || value == null) result[key] = value;
      else if (Array.isArray(value)) result[key] = value.slice(0, 12).map((item) => (typeof item === 'string' ? item.slice(0, 200) : item));
    }
    return result;
  });
}

function sanitizeUserState(body = {}) {
  if (profilePayloadTooLarge(body)) {
    throw new Error('账号数据过大，请减少历史记录后再同步。');
  }
  const limits = authCapabilities().limits;
  return {
    role: String(body.role || '').slice(0, 30),
    selectedChildId: String(body.selectedChildId || '').slice(0, 120),
    follows: sanitizeProfileRows(body.follows, limits.follows),
    followedCompetitions: sanitizeProfileRows(body.followedCompetitions, limits.followedCompetitions),
    recentItems: sanitizeProfileRows(body.recentItems, limits.recentItems),
    reportHistory: sanitizeProfileRows(body.reportHistory, limits.reportHistory),
    aiHistory: sanitizeProfileRows(body.aiHistory, limits.aiHistory),
    commercialIntents: sanitizeProfileRows(body.commercialIntents, limits.commercialIntents),
  };
}

function profileFromUser(user) {
  return sanitizeUserState(user?.profile || {});
}

function profileSummary(profile = {}) {
  return {
    follows: Array.isArray(profile.follows) ? profile.follows.length : 0,
    followedCompetitions: Array.isArray(profile.followedCompetitions) ? profile.followedCompetitions.length : 0,
    recentItems: Array.isArray(profile.recentItems) ? profile.recentItems.length : 0,
    reportHistory: Array.isArray(profile.reportHistory) ? profile.reportHistory.length : 0,
    aiHistory: Array.isArray(profile.aiHistory) ? profile.aiHistory.length : 0,
    commercialIntents: Array.isArray(profile.commercialIntents) ? profile.commercialIntents.length : 0,
  };
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

async function loadBundledLookup(env) {
  if (!bundledLookupPromise) {
    bundledLookupPromise = (async () => {
      const index = await loadBundledIndex(env);
      const assetPath = index.lookupPath || '/data/public-data-lookup.json';
      const response = await env.ASSETS.fetch(new Request(`https://assets.local${assetPath}`));
      if (!response.ok) {
        if (index.chunkLookup) return { version: index.version, chunkLookup: index.chunkLookup };
        throw new Error(`Unable to load bundled data lookup ${assetPath}: ${response.status}`);
      }
      return response.json();
    })();
  }
  return bundledLookupPromise;
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

async function findInChunks(env, paths = [], key, lookup = {}) {
  if (!key) return null;
  const directPath = lookup?.[key];
  if (directPath) {
    const chunk = await loadChunkObject(env, directPath);
    return chunk && Object.prototype.hasOwnProperty.call(chunk, key) ? chunk[key] : null;
  }
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

async function dataCoverageWithEntityCounts(env, index) {
  const coverage = { ...(index.publicEvents.dataCoverage || {}) };
  if ((Number(coverage.athletes) || 0) > 0 && (Number(coverage.clubs) || 0) > 0) {
    return coverage;
  }
  const indexes = await loadSearchIndexes(env);
  return {
    ...coverage,
    athletes: Math.max(Number(coverage.athletes) || 0, indexes.athletes.length),
    clubs: Math.max(Number(coverage.clubs) || 0, indexes.clubs.length),
  };
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

async function readAuthUserFromRequest(request, env) {
  const token = getBearerToken(request);
  if (!token || !env.FOLLOWS) return null;
  const session = await readJsonKv(env.FOLLOWS, `session:${token}`, null);
  if (!session?.userId) return null;
  const user = await readJsonKv(env.FOLLOWS, `user:${session.userId}`, null);
  if (!user) return null;
  return { token, session, user };
}

async function handleAuthLogin(request, env) {
  if (!env.FOLLOWS) return json({ ok: false, message: 'Auth unavailable' }, 503);
  const body = await request.json();
  const identityKey = normalizeAuthIdentifier(body.identifier);
  const code = normalizeLoginCode(body.code);
  const now = new Date().toISOString();
  await assertLoginAllowed(env, request, identityKey);
  let userId = await env.FOLLOWS.get(`identity:${identityKey}`);
  let isNew = false;
  if (!userId) {
    userId = await authUserId(identityKey);
    isNew = true;
    const salt = randomHex(16);
    await env.FOLLOWS.put(`identity:${identityKey}`, userId);
    await env.FOLLOWS.put(`user:${userId}`, JSON.stringify({
      id: userId,
      identityKey,
      provider: 'passwordless',
      displayName: publicAuthIdentifier(identityKey),
      codeSalt: salt,
      codeHash: await hashLoginCode(identityKey, code, salt),
      profile: {},
      createdAt: now,
      lastLoginAt: now,
    }));
  }
  const user = await readJsonKv(env.FOLLOWS, `user:${userId}`, null);
  if (!user) return json({ ok: false, message: 'User unavailable' }, 500);
  if (!isNew && user.codeHash !== await hashLoginCode(identityKey, code, user.codeSalt)) {
    return json({ ok: false, message: '登录码不正确。' }, 400);
  }
  user.lastLoginAt = now;
  const token = authToken();
  await env.FOLLOWS.put(`user:${userId}`, JSON.stringify(user));
  await env.FOLLOWS.put(`session:${token}`, JSON.stringify({ userId, createdAt: now, lastSeenAt: now }), { expirationTtl: AUTH_SESSION_TTL_SECONDS });
  const profile = profileFromUser(user);
  return json({
    ok: true,
    version: APP_VERSION,
    isNew,
    token,
    user: userFromRecord(user),
    profile,
    profileSummary: profileSummary(profile),
    capabilities: authCapabilities(),
  });
}

async function handleAuthMe(request, env) {
  const auth = await readAuthUserFromRequest(request, env);
  if (!auth) return json({ ok: false, message: '未登录。' }, 401);
  auth.session.lastSeenAt = new Date().toISOString();
  await env.FOLLOWS.put(`session:${auth.token}`, JSON.stringify(auth.session), { expirationTtl: AUTH_SESSION_TTL_SECONDS });
  const profile = profileFromUser(auth.user);
  return json({
    ok: true,
    version: APP_VERSION,
    user: userFromRecord(auth.user),
    profile,
    profileSummary: profileSummary(profile),
    capabilities: authCapabilities(),
  });
}

async function handleSaveUserProfile(request, env) {
  const auth = await readAuthUserFromRequest(request, env);
  if (!auth) return json({ ok: false, message: '未登录。' }, 401);
  const body = await request.json();
  auth.user.profile = sanitizeUserState(body);
  auth.user.updatedAt = new Date().toISOString();
  await env.FOLLOWS.put(`user:${auth.user.id}`, JSON.stringify(auth.user));
  await env.FOLLOWS.put(`session:${auth.token}`, JSON.stringify({ ...auth.session, lastSeenAt: auth.user.updatedAt }), { expirationTtl: AUTH_SESSION_TTL_SECONDS });
  const profile = profileFromUser(auth.user);
  return json({
    ok: true,
    version: APP_VERSION,
    user: userFromRecord(auth.user),
    profile,
    profileSummary: profileSummary(profile),
    capabilities: authCapabilities(),
  });
}

async function handleExportUserProfile(request, env) {
  const auth = await readAuthUserFromRequest(request, env);
  if (!auth) return json({ ok: false, message: '未登录。' }, 401);
  const profile = profileFromUser(auth.user);
  return json({
    ok: true,
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    user: userFromRecord(auth.user),
    profile,
    profileSummary: profileSummary(profile),
    capabilities: authCapabilities(),
  });
}

async function handleClearUserProfile(request, env) {
  const auth = await readAuthUserFromRequest(request, env);
  if (!auth) return json({ ok: false, message: '未登录。' }, 401);
  auth.user.profile = sanitizeUserState({});
  auth.user.updatedAt = new Date().toISOString();
  await env.FOLLOWS.put(`user:${auth.user.id}`, JSON.stringify(auth.user));
  await env.FOLLOWS.put(`session:${auth.token}`, JSON.stringify({ ...auth.session, lastSeenAt: auth.user.updatedAt }), { expirationTtl: AUTH_SESSION_TTL_SECONDS });
  const profile = profileFromUser(auth.user);
  return json({
    ok: true,
    version: APP_VERSION,
    user: userFromRecord(auth.user),
    profile,
    profileSummary: profileSummary(profile),
    capabilities: authCapabilities(),
  });
}

function handleWechatAuthStatus() {
  return json({
    ok: true,
    version: APP_VERSION,
    wechat: authCapabilities().wechat,
  });
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

function normalizeFeedbackType(value) {
  const type = String(value || '').trim();
  return ['correct', 'hide', 'claim-athlete', 'ai-helpful', 'ai-needs-work', 'pilot-interest', 'membership-interest'].includes(type) ? type : '';
}

function normalizeFeedbackText(value) {
  return String(value || '').trim().slice(0, 4000);
}

function normalizeFeedbackStatus(value) {
  const status = String(value || '').trim();
  return ['new', 'reviewing', 'resolved', 'ignored'].includes(status) ? status : '';
}

function chinaDayKey(date = new Date()) {
  return new Date(date.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function normalizeAnalyticsEventType(value) {
  const type = String(value || '').trim();
  return ['pageview', 'duration', 'action'].includes(type) ? type : '';
}

function normalizeAnalyticsPage(value) {
  const page = String(value || 'unknown').trim().replace(/[^a-zA-Z0-9:_/-]/g, '').slice(0, 80);
  return page || 'unknown';
}

function normalizeAnalyticsPath(value) {
  const path = String(value || '').trim();
  return path.startsWith('/') ? path.slice(0, 160) : '/viewer';
}

function normalizeAnalyticsDimension(value, fallback = 'unknown') {
  const text = String(value || '').trim().replace(/[^a-zA-Z0-9:_/-]/g, '').slice(0, 80);
  return text || fallback;
}

function normalizeDurationMs(value) {
  const duration = Math.round(Number(value) || 0);
  if (!Number.isFinite(duration) || duration < 0) return 0;
  return Math.min(duration, 30 * 60 * 1000);
}

function incrementMetric(target, key, amount = 1) {
  const safeKey = String(key || 'unknown').slice(0, 120) || 'unknown';
  target[safeKey] = (Number(target[safeKey]) || 0) + amount;
}

function topMetricRows(object = {}, limit = MAX_ANALYTICS_DIMENSION_ROWS) {
  return Object.entries(object || {})
    .map(([key, value]) => ({ key, value: Number(value) || 0 }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value || a.key.localeCompare(b.key))
    .slice(0, limit);
}

function sanitizeAnalyticsDay(day = {}) {
  const devices = Array.isArray(day.devices) ? day.devices : [];
  const sessions = Array.isArray(day.sessions) ? day.sessions : [];
  return {
    day: day.day || '',
    pv: Number(day.pv) || 0,
    uv: devices.length,
    sessions: sessions.length,
    totalDurationMs: Number(day.totalDurationMs) || 0,
    durationEvents: Number(day.durationEvents) || 0,
    avgDurationMs: day.durationEvents ? Math.round((Number(day.totalDurationMs) || 0) / (Number(day.durationEvents) || 1)) : 0,
    pages: topMetricRows(day.pages),
    durationsByPage: topMetricRows(day.durationsByPage),
    actions: topMetricRows(day.actions),
    actionLabels: topMetricRows(day.actionLabels),
    updatedAt: day.updatedAt || null,
  };
}

async function updateAnalyticsIndex(kv, dayKey, now) {
  const index = await readJsonKv(kv, ANALYTICS_INDEX_KEY, { days: [] });
  const currentDays = Array.isArray(index?.days) ? index.days : [];
  const days = [dayKey, ...currentDays.filter((day) => day !== dayKey)].slice(0, MAX_ANALYTICS_DAYS);
  await kv.put(ANALYTICS_INDEX_KEY, JSON.stringify({ days, updatedAt: now }));
}

async function handleAnalytics(request, env) {
  if (request.method !== 'POST') return json({ ok: false, message: 'Method not allowed' }, 405);
  if (!env.FOLLOWS) return json({ ok: false, message: 'Analytics unavailable' }, 503);

  const body = await request.json();
  const type = normalizeAnalyticsEventType(body.type);
  const deviceId = normalizeDeviceId(body.deviceId);
  const sessionId = String(body.sessionId || '').trim().replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 80);
  const page = normalizeAnalyticsPage(body.page);
  const path = normalizeAnalyticsPath(body.path);
  const action = normalizeAnalyticsDimension(body.action, '');
  const label = normalizeAnalyticsDimension(body.label, '');
  const durationMs = normalizeDurationMs(body.durationMs);
  if (!type) return json({ ok: false, message: 'Invalid analytics event type' }, 400);

  const now = new Date().toISOString();
  const dayKey = chinaDayKey();
  const key = `analytics:day:${dayKey}`;
  const day = await readJsonKv(env.FOLLOWS, key, {
    day: dayKey,
    pv: 0,
    devices: [],
    sessions: [],
    totalDurationMs: 0,
    durationEvents: 0,
    pages: {},
    durationsByPage: {},
    actions: {},
    actionLabels: {},
    paths: {},
    updatedAt: now,
  });
  const devices = new Set(Array.isArray(day.devices) ? day.devices : []);
  const sessions = new Set(Array.isArray(day.sessions) ? day.sessions : []);
  devices.add(deviceId);
  if (sessionId) sessions.add(sessionId);

  if (type === 'pageview') {
    day.pv = (Number(day.pv) || 0) + 1;
    incrementMetric(day.pages || (day.pages = {}), page);
    incrementMetric(day.paths || (day.paths = {}), path);
  }
  if (type === 'duration' && durationMs > 0) {
    day.totalDurationMs = (Number(day.totalDurationMs) || 0) + durationMs;
    day.durationEvents = (Number(day.durationEvents) || 0) + 1;
    incrementMetric(day.durationsByPage || (day.durationsByPage = {}), page, durationMs);
  }
  if (type === 'action' && action) {
    incrementMetric(day.actions || (day.actions = {}), action);
    if (label) incrementMetric(day.actionLabels || (day.actionLabels = {}), `${action}:${label}`);
  }

  day.devices = [...devices].slice(-5000);
  day.sessions = [...sessions].slice(-10000);
  day.updatedAt = now;
  await env.FOLLOWS.put(key, JSON.stringify(day));
  await updateAnalyticsIndex(env.FOLLOWS, dayKey, now);
  return json({ ok: true, version: APP_VERSION });
}

async function handleAdminAnalytics(env, url) {
  if (!requireAdmin(url)) return json({ ok: false, message: 'Forbidden' }, 403);
  if (!env.FOLLOWS) return json({ ok: false, message: 'Analytics unavailable' }, 503);
  const limit = Math.min(Math.max(Number(url.searchParams.get('days')) || 14, 1), MAX_ANALYTICS_DAYS);
  const index = await readJsonKv(env.FOLLOWS, ANALYTICS_INDEX_KEY, { days: [] });
  const days = Array.isArray(index?.days) ? index.days.slice(0, limit) : [];
  const rawRows = (await Promise.all(days.map((day) => readJsonKv(env.FOLLOWS, `analytics:day:${day}`, null))))
    .filter(Boolean);
  const rows = rawRows.map(sanitizeAnalyticsDay);
  const devices = new Set();
  const sessions = new Set();
  rawRows.forEach((row) => {
    (Array.isArray(row.devices) ? row.devices : []).forEach((id) => devices.add(id));
    (Array.isArray(row.sessions) ? row.sessions : []).forEach((id) => sessions.add(id));
  });
  const totals = rows.reduce((sum, row) => ({
    pv: sum.pv + row.pv,
    uv: devices.size,
    sessions: sessions.size,
    totalDurationMs: sum.totalDurationMs + row.totalDurationMs,
    durationEvents: sum.durationEvents + row.durationEvents,
  }), { pv: 0, uv: 0, sessions: 0, totalDurationMs: 0, durationEvents: 0 });
  totals.avgDurationMs = totals.durationEvents ? Math.round(totals.totalDurationMs / totals.durationEvents) : 0;
  return json({ ok: true, version: APP_VERSION, days: rows, totals, updatedAt: index.updatedAt || null });
}

async function handleFeedback(request, env) {
  if (request.method !== 'POST') return json({ ok: false, message: 'Method not allowed' }, 405);
  if (!env.FOLLOWS) return json({ ok: false, message: 'Feedback unavailable' }, 503);

  const body = await request.json();
  const deviceId = normalizeDeviceId(body.deviceId);
  const type = normalizeFeedbackType(body.type);
  const athlete = body.athlete || {};
  const subject = body.subject || {};
  const message = normalizeFeedbackText(body.message);
  const isAiFeedback = type.startsWith('ai-');
  const isSubjectFeedback = isAiFeedback || type === 'pilot-interest' || type === 'membership-interest';
  const target = isSubjectFeedback ? subject : athlete;
  if (!type) return json({ ok: false, message: 'Invalid feedback type' }, 400);
  if (!target?.id || !target?.name) return json({ ok: false, message: isSubjectFeedback ? 'Missing subject' : 'Missing athlete' }, 400);
  if (!message) return json({ ok: false, message: 'Missing message' }, 400);

  const now = new Date().toISOString();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const record = {
    id,
    type,
    deviceId,
    athlete: {
      id: String(target.id),
      name: String(target.name),
      club: target.club ? String(target.club) : '',
    },
    subject: isSubjectFeedback ? {
      id: String(subject.id),
      name: String(subject.name),
      type: subject.type ? String(subject.type) : '',
      query: subject.query ? String(subject.query).slice(0, 500) : '',
    } : null,
    message,
    status: 'new',
    createdAt: now,
  };
  await env.FOLLOWS.put(`feedback:${id}`, JSON.stringify(record));

  const index = await readJsonKv(env.FOLLOWS, FEEDBACK_INDEX_KEY, { ids: [] });
  const ids = [id, ...(Array.isArray(index?.ids) ? index.ids : [])].slice(0, 200);
  await env.FOLLOWS.put(FEEDBACK_INDEX_KEY, JSON.stringify({ ids, updatedAt: now }));
  return json({ ok: true, version: APP_VERSION, id, status: 'new' });
}

async function handleAdminFeedback(env, url) {
  if (!requireAdmin(url)) return json({ ok: false, message: 'Forbidden' }, 403);
  const index = await readJsonKv(env.FOLLOWS, FEEDBACK_INDEX_KEY, { ids: [] });
  const ids = Array.isArray(index?.ids) ? index.ids.slice(0, 50) : [];
  const feedback = (await Promise.all(ids.map((id) => readJsonKv(env.FOLLOWS, `feedback:${id}`, null))))
    .filter(Boolean);
  return json({ ok: true, version: APP_VERSION, feedback, updatedAt: index.updatedAt || null });
}

async function handleAdminFeedbackStatus(request, env, url) {
  if (!requireAdmin(url)) return json({ ok: false, message: 'Forbidden' }, 403);
  if (!env.FOLLOWS) return json({ ok: false, message: 'Feedback unavailable' }, 503);
  const body = await request.json();
  const id = String(body.id || '').trim();
  const status = normalizeFeedbackStatus(body.status);
  if (!id) return json({ ok: false, message: 'Missing feedback id' }, 400);
  if (!status) return json({ ok: false, message: 'Invalid feedback status' }, 400);
  const existing = await readJsonKv(env.FOLLOWS, `feedback:${id}`, null);
  if (!existing) return json({ ok: false, message: 'Feedback not found' }, 404);
  const now = new Date().toISOString();
  const record = {
    ...existing,
    status,
    reviewedAt: status === 'new' ? existing.reviewedAt || null : now,
    updatedAt: now,
  };
  await env.FOLLOWS.put(`feedback:${id}`, JSON.stringify(record));
  const index = await readJsonKv(env.FOLLOWS, FEEDBACK_INDEX_KEY, { ids: [] });
  await env.FOLLOWS.put(FEEDBACK_INDEX_KEY, JSON.stringify({
    ...index,
    updatedAt: now,
  }));
  return json({ ok: true, version: APP_VERSION, feedback: record });
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
    const dataCoverage = await dataCoverageWithEntityCounts(env, index);
    return json(sanitizePublicData({
      ok: true,
      version: index.version,
      generatedAt: index.generatedAt || null,
      competitions: compactCompetitionIndex(competitions),
      dataCoverage,
    }), 200, hasDynamicPreEvent ? NO_STORE_CACHE : PUBLIC_INDEX_CACHE);
  }

  if (url.pathname === '/api/events' && request.method === 'GET') {
    const index = await loadBundledIndex(env);
    const dataCoverage = await dataCoverageWithEntityCounts(env, index);
    return json(sanitizePublicData({
      ok: true,
      version: index.version,
      generatedAt: index.generatedAt || null,
      events: index.publicEvents.events || [],
      dataCoverage,
    }), 200, PUBLIC_INDEX_CACHE);
  }

  if (url.pathname === '/api/search' && request.method === 'GET') {
    const query = url.searchParams.get('q') || '';
    const type = url.searchParams.get('type') || 'all';
    const athleteLimit = Number(url.searchParams.get('athleteLimit')) || undefined;
    const clubLimit = Number(url.searchParams.get('clubLimit')) || undefined;
    const indexes = await loadSearchIndexes(env);
    return json(sanitizePublicData({
      ok: true,
      version: (await loadBundledIndex(env)).version,
      query,
      type,
      ...searchIndexes(indexes, query, { type, athleteLimit, clubLimit }),
    }), 200, PUBLIC_INDEX_CACHE);
  }

  if (url.pathname.startsWith('/api/competitions/') && request.method === 'GET') {
    const { index, competitions, hasDynamicPreEvent } = await getCompetitionIndex(env);
    const sportCode = decodeURIComponent(url.pathname.replace('/api/competitions/', ''));
    const competition = competitions.find((item) => item.sportCode === sportCode);
    return competition
      ? json(sanitizePublicData({ ok: true, version: index.version, competition }), 200, hasDynamicPreEvent ? NO_STORE_CACHE : PUBLIC_DETAIL_CACHE)
      : json({ ok: false, message: '未找到比赛数据。' }, 404);
  }

  if (url.pathname.startsWith('/api/events/') && request.method === 'GET') {
    const index = await loadBundledIndex(env);
    const lookup = await loadBundledLookup(env);
    const eventCode = decodeURIComponent(url.pathname.replace('/api/events/', ''));
    let event = await findInChunks(env, index.chunks?.eventsByCode, eventCode, lookup.chunkLookup?.eventsByCode);
    if (!event) {
      const dynamicReport = await readJsonKv(env.FOLLOWS, `score:${eventCode}`, null);
      if (dynamicReport?.general?.eventCode) {
        event = buildEventDetail(dynamicReport, `kv-score-${eventCode}-analysis.json`);
      }
    }
    if (!event) {
      const { competitions } = await getCompetitionIndex(env);
      event = findProjectOnlyEvent({ competitions }, eventCode);
    }
    event = sanitizePublicData(event);
    return event ? json({ ok: true, version: index.version, event }, 200, PUBLIC_DETAIL_CACHE) : json({ ok: false, message: '项目不存在。' }, 404);
  }

  if (url.pathname.startsWith('/api/athletes/') && request.method === 'GET') {
    const index = await loadBundledIndex(env);
    const lookup = await loadBundledLookup(env);
    const athleteId = decodeURIComponent(url.pathname.replace('/api/athletes/', ''));
    const athlete = sanitizePublicData(await findInChunks(env, index.chunks?.athletesById, athleteId, lookup.chunkLookup?.athletesById));
    return athlete ? json({ ok: true, version: index.version, athlete }, 200, PUBLIC_DETAIL_CACHE) : json({ ok: false, message: '选手不存在。' }, 404);
  }

  if (url.pathname.startsWith('/api/clubs/') && request.method === 'GET') {
    const index = await loadBundledIndex(env);
    const lookup = await loadBundledLookup(env);
    const rawClubId = url.pathname.replace('/api/clubs/', '');
    const decodedClubId = decodeURIComponent(rawClubId);
    let club = await findInChunks(env, index.chunks?.clubsById, rawClubId, lookup.chunkLookup?.clubsById)
      || await findInChunks(env, index.chunks?.clubsById, decodedClubId, lookup.chunkLookup?.clubsById)
      || await findInChunks(env, index.chunks?.clubsById, encodeURIComponent(decodedClubId), lookup.chunkLookup?.clubsById);
    club = sanitizePublicData(club);
    return club ? json({ ok: true, version: index.version, club }, 200, PUBLIC_DETAIL_CACHE) : json({ ok: false, message: '俱乐部不存在。' }, 404);
  }

  if (url.pathname === '/api/me/follows') {
    try {
      return await handleFollows(request, env, url);
    } catch (error) {
      return json({ ok: false, message: error.message }, 400);
    }
  }

  if (url.pathname === '/api/auth/login' && request.method === 'POST') {
    try {
      return await handleAuthLogin(request, env);
    } catch (error) {
      return json({ ok: false, message: error.message }, error.statusCode || 400);
    }
  }

  if (url.pathname === '/api/auth/me' && request.method === 'GET') {
    try {
      return await handleAuthMe(request, env);
    } catch (error) {
      return json({ ok: false, message: error.message }, 400);
    }
  }

  if (url.pathname === '/api/auth/wechat/status' && request.method === 'GET') {
    return handleWechatAuthStatus();
  }

  if (url.pathname === '/api/me/profile' && request.method === 'POST') {
    try {
      return await handleSaveUserProfile(request, env);
    } catch (error) {
      return json({ ok: false, message: error.message }, 400);
    }
  }

  if (url.pathname === '/api/me/export' && request.method === 'GET') {
    try {
      return await handleExportUserProfile(request, env);
    } catch (error) {
      return json({ ok: false, message: error.message }, 400);
    }
  }

  if (url.pathname === '/api/me/profile' && request.method === 'DELETE') {
    try {
      return await handleClearUserProfile(request, env);
    } catch (error) {
      return json({ ok: false, message: error.message }, 400);
    }
  }

  if (url.pathname === '/api/feedback') {
    try {
      return await handleFeedback(request, env);
    } catch (error) {
      return json({ ok: false, message: error.message }, 400);
    }
  }

  if (url.pathname === '/api/analytics') {
    try {
      return await handleAnalytics(request, env);
    } catch (error) {
      return json({ ok: false, message: error.message }, 400);
    }
  }

  if (url.pathname === '/api/admin/analytics' && request.method === 'GET') {
    return handleAdminAnalytics(env, url);
  }

  if (url.pathname === '/api/admin/feedback' && request.method === 'GET') {
    return handleAdminFeedback(env, url);
  }

  if (url.pathname === '/api/admin/feedback/status' && request.method === 'POST') {
    try {
      return await handleAdminFeedbackStatus(request, env, url);
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
