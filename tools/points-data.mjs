import seed from '../data/points-seed.mjs';

export const POINTS_SOURCE = 'https://fencing.yy-sport.com.cn/#/integral/pintegralranking';
export const POINTS_PROXY = 'https://fencing-proxy.aixindiandian.workers.dev';
const memory = new Map();
const pending = new Map();
const FRESH_MS = 15 * 60 * 1000;
export class PointsError extends Error { constructor(message, status = 502) { super(message); this.status = status; } }

export function normalizePointsMetadata(weeks, groups, season, now = new Date().toISOString()) {
  if (weeks?.code !== 0 || groups?.code !== 0 || !Array.isArray(weeks.data?.week) || !Array.isArray(groups.data)) throw new PointsError('官方榜单目录暂不可用');
  const weekRows = weeks.data.week.filter((r) => typeof r.value === 'string' && r.value.length < 100).map((r) => ({ label: String(r.label || r.value), value: r.value }));
  const groupRows = groups.data.filter((r) => /^[A-Za-z0-9+_-]{1,16}$/.test(r.value)).map((r) => ({ value: r.value, label: String(r.label) }));
  if (!weekRows.length || !groupRows.length) throw new PointsError('官方榜单目录为空');
  const order = ['U8', 'U10', 'U12', 'U14', 'U16', 'U17s', 'COPEN', 'U40s', 'PJ', 'PS'];
  groupRows.sort((a,b) => order.indexOf(a.value) - order.indexOf(b.value));
  return { season: String(season), weeks: weekRows, groups: groupRows, fetchedAt: now, source: POINTS_SOURCE };
}

export function pointsQuery(params, metadata) {
  const query = { season: params.get('season') || metadata.season, week: params.get('week') || metadata.weeks[0].value, gender: params.get('gender') || 'M', weapon: params.get('weapon') || 'F', groupCode: params.get('groupCode') || 'U10', current: Number(params.get('current') || 1), searchName: (params.get('q') || '').trim() };
  if (query.season !== metadata.season || !metadata.weeks.some((r) => r.value === query.week) || !metadata.groups.some((r) => r.value === query.groupCode) || !['M','F'].includes(query.gender) || !['F','E','S'].includes(query.weapon) || !Number.isInteger(query.current) || query.current < 1 || query.current > 500 || query.searchName.length > 50) throw new PointsError('积分筛选参数无效，请重新选择', 400);
  return query;
}

export function pointsKey(query) { return JSON.stringify(query); }

export function normalizePointsPage(payload, query, now = new Date().toISOString()) {
  const data = payload?.data;
  if (payload?.code !== 0 || !data || !Array.isArray(data.records) || !Number.isInteger(Number(data.total)) || Number(data.total) < 0) throw new PointsError('官方积分暂未返回，请稍后重试');
  if (data.current != null && Number(data.current) !== query.current) throw new PointsError('官方积分页码不一致');
  const rows = data.records.map((r) => {
    const rank = Number(r.totalRank), points = Number(r.totalPoints);
    if (!r.athleteName || r.totalRank == null || r.totalPoints == null || r.totalPoints === '' || !Number.isInteger(rank) || rank < 1 || !Number.isFinite(points) || points < 0 || String(r.season) !== query.season || r.gender !== query.gender || r.weapon !== query.weapon || r.groupCode !== query.groupCode || r.week !== query.week.split('(')[0]) throw new PointsError('官方榜单内容与所选分组或周次不一致');
    // Whitelist public ranking fields. Never pass birthdays, licence codes, photos or memberInfo.
    return { rank, points, name: String(r.athleteName), club: String(r.organName || ''), sourceAthleteId: String(r.athleteId || ''), sourceDate: /^\d{4}-\d{2}-\d{2}$/.test(r.specificDate) ? r.specificDate : null };
  });
  if (rows.length > 20 || rows.length > Number(data.total) || (Number(data.total) > (query.current - 1) * 20 && rows.length === 0)) throw new PointsError('官方积分分页不完整');
  const ids = new Set();
  for (const row of rows) { const id = row.sourceAthleteId || `${row.rank}:${row.name}:${row.club}`; if (ids.has(id)) throw new PointsError('官方榜单存在重复记录'); ids.add(id); }
  return { query, rows, total: Number(data.total), page: query.current, pageSize: 20, fetchedAt: now, source: POINTS_SOURCE };
}

export async function fetchPointsJson(path) {
  const response = await fetch(`${POINTS_PROXY}${path}`, { signal: AbortSignal.timeout(20000), headers: { Accept: 'application/json' } });
  if (!response.ok) throw new PointsError('官方积分服务暂不可用');
  return response.json();
}

async function cached(key, loader, { kv, fallback } = {}) {
  const stored = memory.get(key) || (kv ? await kv.get(`points:v1:${key}`, 'json').catch(() => null) : null);
  if (stored && Date.now() - Date.parse(stored.fetchedAt) < FRESH_MS) return { ...stored, cacheStatus: 'cached' };
  if (pending.has(key)) return pending.get(key);
  const task = (async () => {
    try {
      const result = await loader();
      if (memory.size > 250) memory.clear();
      memory.set(key, result);
      if (kv) await kv.put(`points:v1:${key}`, JSON.stringify(result), { expirationTtl: 604800 }).catch(() => {});
      return { ...result, cacheStatus: 'fresh' };
    } catch (error) {
      const previous = stored || fallback;
      if (previous) return { ...previous, cacheStatus: 'stale', warning: '官方服务暂时不可用，显示上次成功获取的同一榜单。' };
      throw error instanceof PointsError ? error : new PointsError('官方积分服务暂不可用，请稍后重试');
    } finally { pending.delete(key); }
  })();
  pending.set(key, task);
  return task;
}

export async function getPointsMetadata({ kv, sourceJson = fetchPointsJson } = {}) {
  const season = String(new Date().getFullYear());
  return cached(`meta:${season}`, async () => {
    const params = new URLSearchParams({ season, itemType: 'I' });
    const [weeks, groups] = await Promise.all([sourceJson(`/fencingapi/rankinfo/total/getWeek?${params}`), sourceJson(`/fencingapi/rankinfo/total/groupcode?${params}`)]);
    return normalizePointsMetadata(weeks, groups, season);
  }, { kv, fallback: seed.metadata?.season === season ? seed.metadata : null });
}

export async function getPointsPage(params, options = {}) {
  // The UI already selected an explicit published week. Validate known weeks locally
  // so an unrelated metadata timeout cannot add another 20s before the page request.
  const knownWeek = seed.metadata?.season === params.get('season')
    && seed.metadata.weeks.some(row => row.value === params.get('week'))
    && seed.metadata.groups.some(row => row.value === (params.get('groupCode') || 'U10'));
  const meta = knownWeek ? { ...seed.metadata, cacheStatus: 'reference' } : await getPointsMetadata(options);
  const query = pointsQuery(params, meta);
  const key = pointsKey(query);
  // Search queries are not persisted in KV; regular group/week pages share a short cache.
  const cacheKey = `page:${encodeURIComponent(key)}`;
  const result = await cached(cacheKey, async () => {
    const upstream = new URLSearchParams({ ...query, itemType: 'I', size: '20' });
    const payload = await (options.sourceJson || fetchPointsJson)(`/fencingapi/rankinfo/total/week?${upstream}`);
    return normalizePointsPage(payload, query);
  }, { kv: query.searchName ? null : options.kv, fallback: seed.pages[key] });
  return { ...result, metadataStatus: meta.cacheStatus };
}
