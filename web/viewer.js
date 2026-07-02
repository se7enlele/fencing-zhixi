const topBack = document.querySelector('#topBack');
const searchInput = document.querySelector('#searchInput');
const yearFilterButton = document.querySelector('#yearFilterButton');
const regionFilterButton = document.querySelector('#regionFilterButton');
const itemFilterButton = document.querySelector('#itemFilterButton');
const statusFilterButton = document.querySelector('#statusFilterButton');
const filterSheet = document.querySelector('#filterSheet');
const filterSheetMask = document.querySelector('#filterSheetMask');
const filterSheetClose = document.querySelector('#filterSheetClose');
const filterSheetTitle = document.querySelector('#filterSheetTitle');
const filterSheetOptions = document.querySelector('#filterSheetOptions');
const searchShell = document.querySelector('.search-shell');
const roleWorkspace = document.querySelector('#roleWorkspace');
const parentDashboard = document.querySelector('#parentDashboard');
const homePage = document.querySelector('#homePage');
const focusPage = document.querySelector('#focusPage');
const myPage = document.querySelector('#myPage');
const bottomNav = document.querySelector('#bottomNav');
const feedPanel = document.querySelector('#feedPanel');
const searchAthletesPanel = document.querySelector('#searchAthletesPanel');
const followPanel = document.querySelector('#followPanel');
const memberCta = document.querySelector('#memberCta');
const homeStats = document.querySelector('#homeStats');
const homeStatsScope = document.querySelector('#homeStatsScope');
const dataCoverageSummary = document.querySelector('#dataCoverageSummary');
const competitionList = document.querySelector('#competitionList');
const competitionHero = document.querySelector('#competitionHero');
const competitionInsightCards = document.querySelector('#competitionInsightCards');
const competitionInsightBullets = document.querySelector('#competitionInsightBullets');
const eventList = document.querySelector('#eventList');
const eventHero = document.querySelector('#eventHero');
const athleteHero = document.querySelector('#athleteHero');
const athleteActionPanel = document.querySelector('#athleteActionPanel');
const athleteEvents = document.querySelector('#athleteEvents');
const clubHero = document.querySelector('#clubHero');
const clubEvents = document.querySelector('#clubEvents');
const prematchReportHero = document.querySelector('#prematchReportHero');
const prematchReportBody = document.querySelector('#prematchReportBody');
const parentGrowthReportHero = document.querySelector('#parentGrowthReportHero');
const parentGrowthReportBody = document.querySelector('#parentGrowthReportBody');
const coachSegmentationReportHero = document.querySelector('#coachSegmentationReportHero');
const coachSegmentationReportBody = document.querySelector('#coachSegmentationReportBody');
const insightCards = document.querySelector('#insightCards');
const insightBullets = document.querySelector('#insightBullets');
const followedEventFocus = document.querySelector('#followedEventFocus');
const analysisCharts = document.querySelector('#analysisCharts');
const metricGrid = document.querySelector('#metricGrid');
const championPath = document.querySelector('#championPath');
const leadersList = document.querySelector('#leadersList');
const opponentList = document.querySelector('#opponentList');
const participantsList = document.querySelector('#participantsList');
const poolGroups = document.querySelector('#poolGroups');
const poolStanding = document.querySelector('#poolStanding');
const matchList = document.querySelector('#matchList');
const clubList = document.querySelector('#clubList');
const clubProfiles = document.querySelector('#clubProfiles');
const athleteProfiles = document.querySelector('#athleteProfiles');
const momentumList = document.querySelector('#momentumList');
const athleteGrowth = document.querySelector('#athleteGrowth');
const tabs = document.querySelector('#tabs');
const FOLLOW_KEY = 'fencingai.followedAthletes.v1';
const COMPETITION_FOLLOW_KEY = 'fencingai.followedCompetitions.v1';
const RECENT_KEY = 'fencingai.recentItems.v1';
const REPORT_HISTORY_KEY = 'fencingai.reportHistory.v1';
const AI_HISTORY_KEY = 'fencingai.aiHistory.v1';
const DEVICE_KEY = 'fencingai.deviceId.v1';
const ROLE_KEY = 'fencingai.role.v1';
const CHILD_KEY = 'fencingai.parentChildId.v1';
const ANALYTICS_SESSION_KEY = 'fencingai.analyticsSession.v1';
const COMMERCIAL_CONTACT_KEY = 'fencingai.commercialContact.v1';
const COMMERCIAL_INTENT_KEY = 'fencingai.commercialIntents.v1';
const COMPETITION_LIST_PAGE_SIZE = 30;

const views = {
  roleHome: document.querySelector('#view-role-home'),
  home: document.querySelector('#view-home'),
  parentHome: document.querySelector('#view-parent-home'),
  coachHome: document.querySelector('#view-coach-home'),
  clubHome: document.querySelector('#view-club-home'),
  competitions: document.querySelector('#view-competitions'),
  competition: document.querySelector('#view-competition-detail'),
  event: document.querySelector('#view-event-detail'),
  athlete: document.querySelector('#view-athlete-detail'),
  club: document.querySelector('#view-club-detail'),
  prematchReport: document.querySelector('#view-prematch-report'),
  parentGrowthReport: document.querySelector('#view-parent-growth-report'),
  coachSegmentationReport: document.querySelector('#view-coach-segmentation-report'),
  my: document.querySelector('#view-my'),
  follow: document.querySelector('#view-follow'),
};

const state = {
  competitions: [],
  filteredCompetitions: [],
  athleteSearchResults: [],
  clubSearchResults: [],
  currentCompetition: null,
  currentEvent: null,
  currentClub: null,
  dataCoverage: null,
  athletesById: {},
  athleteSearchIndex: [],
  clubsById: {},
  clubSearchIndex: [],
  selectedRegion: '全部地区',
  selectedYear: '全部年份',
  selectedItem: '全部项目',
  selectedStatus: '全部状态',
  selectedAiMonth: '',
  aiCompetitionFilterSummary: '',
  visibleCompetitionLimit: COMPETITION_LIST_PAGE_SIZE,
  apiVersion: '',
  dataGeneratedAt: '',
  viewStack: ['home'],
  activeMainTab: 'home',
  deviceId: getDeviceId(),
  userRole: localStorage.getItem(ROLE_KEY) || '',
  selectedChildId: localStorage.getItem(CHILD_KEY) || '',
  followedAthletes: [],
  followedCompetitions: [],
  recentItems: [],
  reportHistory: [],
  aiHistory: [],
  commercialIntents: [],
  sharedEntry: null,
  isDataLoading: true,
  dataLoadError: '',
  searchRequestId: 0,
  lastSearchKeyword: '',
  aiHydratedTerms: new Set(),
  eventRenderedTabs: new Set(),
  competitionSearchCache: new Map(),
  detailCache: {
    athletes: new Map(),
    clubs: new Map(),
    competitions: new Map(),
    events: new Map(),
  },
};

let searchDebounceTimer = null;
let analyticsCurrentPage = '';
let analyticsPageStartedAt = Date.now();
let analyticsLastDurationSentAt = analyticsPageStartedAt;
const analyticsSessionId = getAnalyticsSessionId();

async function fetchJson(path) {
  const response = await fetch(path);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Unexpected response: ${response.status || 'unknown status'}`);
  }
  const result = await response.json();
  if (!response.ok || !result.ok) {
    throw new Error(result.message || `Request failed: ${response.status}`);
  }
  return result;
}

function friendlyErrorMessage(scope) {
  return `${scope}暂时无法打开。请稍后重试，或返回上一页重新进入。`;
}

function getAnalyticsSessionId() {
  const now = Date.now();
  try {
    const existing = JSON.parse(sessionStorage.getItem(ANALYTICS_SESSION_KEY) || 'null');
    if (existing?.id && now - Number(existing.createdAt || 0) < 12 * 60 * 60 * 1000) {
      return existing.id;
    }
  } catch {
    // Ignore invalid session storage.
  }
  const id = `s_${now.toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  try {
    sessionStorage.setItem(ANALYTICS_SESSION_KEY, JSON.stringify({ id, createdAt: now }));
  } catch {
    // Analytics must never block the product.
  }
  return id;
}

function sendAnalyticsEvent(payload, useBeacon = false) {
  const body = JSON.stringify({
    deviceId: state.deviceId,
    sessionId: analyticsSessionId,
    path: window.location.pathname || '/viewer',
    ...payload,
  });
  if (useBeacon && navigator.sendBeacon) {
    try {
      navigator.sendBeacon('/api/analytics', new Blob([body], { type: 'application/json' }));
      return;
    } catch {
      // Fall back to fetch below.
    }
  }
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
}

function trackAnalyticsDuration(useBeacon = false) {
  if (!analyticsCurrentPage) return;
  const now = Date.now();
  const durationMs = now - analyticsLastDurationSentAt;
  analyticsLastDurationSentAt = now;
  if (durationMs < 1000) return;
  sendAnalyticsEvent({
    type: 'duration',
    page: analyticsCurrentPage,
    durationMs,
  }, useBeacon);
}

function trackAnalyticsPage(page) {
  const nextPage = String(page || 'unknown');
  if (analyticsCurrentPage === nextPage) return;
  trackAnalyticsDuration(true);
  analyticsCurrentPage = nextPage;
  analyticsPageStartedAt = Date.now();
  analyticsLastDurationSentAt = analyticsPageStartedAt;
  sendAnalyticsEvent({
    type: 'pageview',
    page: nextPage,
  });
}

function trackAnalyticsAction(action, label = '') {
  sendAnalyticsEvent({
    type: 'action',
    page: analyticsCurrentPage || state.viewStack?.at(-1) || 'home',
    action,
    label,
  });
}

async function fetchCachedDetail(type, key, path, pick) {
  const cache = state.detailCache?.[type];
  const cacheKey = String(key || '');
  if (cache?.has(cacheKey)) return cache.get(cacheKey);
  const result = await fetchJson(path);
  const detail = pick(result);
  if (cache && cacheKey && detail) cache.set(cacheKey, detail);
  return detail;
}

state.followedAthletes = loadFollowedAthletes();
state.followedCompetitions = loadStoredList(COMPETITION_FOLLOW_KEY);
state.recentItems = loadStoredList(RECENT_KEY);
state.reportHistory = loadStoredList(REPORT_HISTORY_KEY);
state.aiHistory = loadStoredList(AI_HISTORY_KEY);
state.commercialIntents = loadStoredList(COMMERCIAL_INTENT_KEY);

function loadFollowedAthletes() {
  try {
    return JSON.parse(localStorage.getItem(FOLLOW_KEY) || '[]');
  } catch {
    return [];
  }
}

function loadStoredList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveStoredList(key, rows, limit = 30) {
  localStorage.setItem(key, JSON.stringify((rows || []).slice(0, limit)));
}

function saveFollowedAthletes() {
  localStorage.setItem(FOLLOW_KEY, JSON.stringify(state.followedAthletes.slice(0, 20)));
}

function competitionSnapshot(competition) {
  return {
    sportCode: competition.sportCode,
    sportName: competition.sportName,
    venue: competition.venue || competition.region || '',
    dateLabel: competition.dateLabel || '',
    status: competition.status || '',
    rosterStatus: competition.rosterStatus || '',
    itemCount: competition.items?.length || competition.itemCount || 0,
    expectedRegistrationCount: competition.registrationSummary?.expectedRegistrationCount || competition.expectedRegistrationCount || 0,
  };
}

function isFollowedCompetition(sportCode) {
  return state.followedCompetitions.some((item) => item.sportCode === sportCode);
}

function upsertFollowedCompetition(competition) {
  if (!competition?.sportCode) return;
  trackAnalyticsAction('follow_competition', statusLabel(competition.status));
  state.followedCompetitions = [
    competitionSnapshot(competition),
    ...state.followedCompetitions.filter((item) => item.sportCode !== competition.sportCode),
  ].slice(0, 30);
  saveStoredList(COMPETITION_FOLLOW_KEY, state.followedCompetitions, 30);
  renderCompetitionHero(competition);
  renderPersonalPages();
}

function removeFollowedCompetition(sportCode) {
  state.followedCompetitions = state.followedCompetitions.filter((item) => item.sportCode !== sportCode);
  saveStoredList(COMPETITION_FOLLOW_KEY, state.followedCompetitions, 30);
  if (state.currentCompetition?.sportCode === sportCode) renderCompetitionHero(state.currentCompetition);
  renderPersonalPages();
}

function trackRecentItem(item) {
  if (!item?.id || !item?.type) return;
  state.recentItems = [
    { ...item, viewedAt: Date.now() },
    ...state.recentItems.filter((row) => !(row.type === item.type && row.id === item.id)),
  ].slice(0, 20);
  saveStoredList(RECENT_KEY, state.recentItems, 20);
  renderPersonalPages();
}

function trackReportHistory(report) {
  if (!report?.type || !report?.id) return;
  const key = `${report.type}:${report.id}`;
  state.reportHistory = [
    { ...report, key, viewedAt: Date.now() },
    ...(state.reportHistory || []).filter((row) => row.key !== key),
  ].slice(0, 12);
  saveStoredList(REPORT_HISTORY_KEY, state.reportHistory, 12);
}

function aiHistoryTypeLabel(type) {
  const labels = {
    'competition-stats': '赛事统计',
    prematch: '赛前分析',
    growth: '成长分析',
    comparison: '选手对比',
    club: '俱乐部分析',
    'business-insight': '商业洞察',
    'product-template': '报告方案',
    'club-recruiting': '招生展示',
  };
  return labels[type] || '数据分析';
}

function trackAiAnalysisHistory(query, report) {
  const text = String(query || '').trim();
  if (!text || !report?.type || report.type === 'empty' || report.type === 'fallback') return;
  const key = compactText(text).slice(0, 80);
  const typeLabel = aiHistoryTypeLabel(report.type);
  state.aiHistory = [
    {
      key,
      query: text,
      title: report.title || text,
      summary: report.summary || '',
      type: report.type,
      typeLabel,
      viewedAt: Date.now(),
    },
    ...(state.aiHistory || []).filter((row) => row.key !== key),
  ].slice(0, 10);
  saveStoredList(AI_HISTORY_KEY, state.aiHistory, 10);
  if (['prematch', 'growth', 'club', 'business-insight', 'product-template', 'club-recruiting'].includes(report.type)) {
    trackReportHistory({
      type: 'ai-report',
      id: text,
      title: report.title || text,
      detail: report.summary || '点击继续查看这份分析',
      typeLabel,
      query: text,
    });
  }
}

function setUserRole(role) {
  state.userRole = role;
  localStorage.setItem(ROLE_KEY, role);
  renderRoleWorkspacePremium();
  if (role === 'parent') {
    renderParentDashboard();
    navigateMain('home');
  } else if (role === 'data') {
    navigateMain('competitions');
  } else {
    navigateMain('home');
  }
}

function setSelectedChild(athleteId) {
  state.selectedChildId = athleteId || '';
  if (state.selectedChildId) localStorage.setItem(CHILD_KEY, state.selectedChildId);
  else localStorage.removeItem(CHILD_KEY);
  renderParentDashboard();
  renderPersonalPages();
}

function getDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_KEY);
  if (!deviceId) {
    const randomSource = window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    const randomPart = randomSource.replace(/[^a-zA-Z0-9-]/g, '');
    deviceId = `device-${randomPart}`;
    localStorage.setItem(DEVICE_KEY, deviceId);
  }
  return deviceId;
}

async function syncFollowedAthletes() {
  try {
    const response = await fetch(`/api/me/follows?deviceId=${encodeURIComponent(state.deviceId)}`);
    const result = await response.json();
    if (!result.ok) throw new Error(result.message);
    state.followedAthletes = result.follows || [];
    saveFollowedAthletes();
  } catch {
    state.followedAthletes = loadFollowedAthletes();
  }
  await hydrateFollowedAthleteProfiles();
  renderFollowPanel();
  renderRoleWorkspacePremium();
  renderParentDashboard();
  renderPersonalPages();
}

async function hydrateFollowedAthleteProfiles() {
  const follows = state.followedAthletes || [];
  const missing = follows.filter((follow) => follow?.id && !(state.athletesById?.[follow.id]?.events || []).length);
  if (!missing.length) return;
  const profiles = await Promise.all(missing.map(async (follow) => {
    try {
      const response = await fetch(`/api/athletes/${encodeURIComponent(follow.id)}`);
      const result = await response.json();
      return result.ok && result.athlete?.id ? result.athlete : null;
    } catch {
      return null;
    }
  }));
  for (const athlete of profiles.filter(Boolean)) {
    state.athletesById[athlete.id] = athlete;
  }
}

function isFollowedAthlete(id) {
  return state.followedAthletes.some((item) => item.id === id);
}

function athleteIdentitySet(athlete) {
  return new Set([
    athlete?.id,
    athlete?.licence,
    athlete?.license,
    athlete?.athleteId,
    athlete?.name ? `name:${compactText(athlete.name)}` : '',
  ].filter(Boolean).map(String));
}

function sameAthleteIdentity(a, b) {
  const aIds = athleteIdentitySet(a);
  const bIds = athleteIdentitySet(b);
  for (const value of aIds) {
    if (bIds.has(value)) return true;
  }
  return false;
}

function trackedAthleteReferences() {
  const rows = [];
  const selected = getSelectedChild();
  if (selected?.id || selected?.name) rows.push({ ...selected, focusKind: 'primary' });
  for (const follow of state.followedAthletes || []) {
    const athlete = resolveAthleteReference(follow);
    if (!athlete?.id && !athlete?.name) continue;
    if (rows.some((row) => sameAthleteIdentity(row, athlete))) continue;
    rows.push({ ...athlete, focusKind: 'followed' });
  }
  return rows;
}

function trackedAthleteMatch(athlete) {
  return trackedAthleteReferences().find((tracked) => sameAthleteIdentity(athlete, tracked)) || null;
}

function focusClassForAthlete(athlete) {
  const match = trackedAthleteMatch(athlete);
  if (!match) return '';
  return match.focusKind === 'primary' ? 'is-primary-focus' : 'is-followed-focus';
}

function focusLabelForAthlete(athlete) {
  const match = trackedAthleteMatch(athlete);
  if (!match) return '';
  return match.focusKind === 'primary' ? '重点' : '关注';
}

function eventTrackedAthletes(event) {
  const rows = event?.participants || event?.athleteProfiles || [];
  return rows
    .map((athlete) => {
      const match = trackedAthleteMatch(athlete);
      return match ? { ...athlete, focusKind: match.focusKind } : null;
    })
    .filter(Boolean);
}

async function upsertFollowedAthlete(athlete) {
  if (athlete?.id) trackAnalyticsAction('follow_athlete', athlete.focusKind || 'athlete');
  state.followedAthletes = [
    {
      id: athlete.id,
      name: athlete.name,
      club: athlete.club,
      bestRank: athlete.bestRank,
      medals: athlete.medals,
      appearances: athlete.appearances,
    },
    ...state.followedAthletes.filter((item) => item.id !== athlete.id),
  ];
  saveFollowedAthletes();
  renderFollowPanel();
  renderRoleWorkspacePremium();
  renderParentDashboard();
  try {
    const response = await fetch('/api/me/follows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: state.deviceId, athlete }),
    });
    const result = await response.json();
    if (!result.ok) throw new Error(result.message);
    state.followedAthletes = result.follows || state.followedAthletes;
    saveFollowedAthletes();
    await hydrateFollowedAthleteProfiles();
    renderFollowPanel();
    renderRoleWorkspacePremium();
    renderParentDashboard();
    renderPersonalPages();
  } catch {
    // Keep local follow as offline fallback.
  }
}

async function removeFollowedAthlete(id) {
  state.followedAthletes = state.followedAthletes.filter((item) => item.id !== id);
  saveFollowedAthletes();
  renderFollowPanel();
  if (state.selectedChildId === id) state.selectedChildId = '';
  renderRoleWorkspacePremium();
  renderParentDashboard();
  renderPersonalPages();
  try {
    const response = await fetch('/api/me/follows', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: state.deviceId, athleteId: id }),
    });
    const result = await response.json();
    if (!result.ok) throw new Error(result.message);
    state.followedAthletes = result.follows || state.followedAthletes;
    saveFollowedAthletes();
    renderFollowPanel();
    if (state.selectedChildId === id) state.selectedChildId = '';
    renderRoleWorkspacePremium();
    renderParentDashboard();
    renderPersonalPages();
  } catch {
    // Local removal has already been applied.
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function shortEventName(name) {
  const text = String(name || '').trim();
  const age = text.match(/U\d+|\d+\+/)?.[0] || '';
  const gender = text.includes('男子') || text.includes('男') ? '男' : text.includes('女子') || text.includes('女') ? '女' : '';
  const weapon = text.includes('花剑') ? '花' : text.includes('重剑') ? '重' : text.includes('佩剑') ? '佩' : '';
  const type = text.includes('团体') ? '团体' : '';
  const compact = [age, `${gender}${weapon}`.trim(), type].filter(Boolean).join(' ');
  return compact || text;
}

function displayEventName(event) {
  return event?.shortEventName || shortEventName(event?.eventName || event);
}

function eventSummaryLabel(items) {
  const names = (items || []).map((item) => displayEventName(item));
  const unique = [...new Set(names)];
  return `${unique.slice(0, 4).join(' / ')}${unique.length > 4 ? ` +${unique.length} 项` : ''}`;
}

function competitionYear(competition) {
  const fromSeason = String(competition.season || competition.platformMeta?.season || '').match(/20\d{2}/)?.[0];
  const fromName = String(competition.sportName || '').match(/20\d{2}/)?.[0];
  const fromDate = String(competition.dateLabel || '').match(/20\d{2}/)?.[0];
  return fromSeason || fromDate || fromName || '日期待确认';
}

function competitionMonth(competition) {
  const text = [
    competition.dateLabel,
    competition.startDate,
    competition.endDate,
    competition.openDate,
    competition.sportName,
  ].filter(Boolean).join(' ');
  const match = text.match(/20\d{2}[.\-/年](\d{1,2})/);
  return match ? String(Number(match[1])) : '';
}

function itemFilterLabel(item) {
  const name = displayEventName(item);
  const age = name.match(/U\d+|\d+\+/)?.[0] || '';
  const weapon = name.includes('男花') || name.includes('女花') ? '花剑'
    : name.includes('男重') || name.includes('女重') ? '重剑'
      : name.includes('男佩') || name.includes('女佩') ? '佩剑'
        : '';
  return [age, weapon].filter(Boolean).join(' ');
}

function competitionItemSummaries(competition) {
  return competition.items || competition.itemSummaries || [];
}

function competitionItemCount(competition) {
  return Number(competition.itemCount ?? competitionItemSummaries(competition).length) || 0;
}

function competitionItemFilterLabels(competition) {
  if (Array.isArray(competition.itemFilters)) return competition.itemFilters;
  return [...new Set(competitionItemSummaries(competition).map(itemFilterLabel).filter(Boolean))];
}

function competitionMetricTotal(competition, key) {
  if (competition.metricTotals && key in competition.metricTotals) return Number(competition.metricTotals[key]) || 0;
  return competitionItemSummaries(competition).reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
}

function competitionEntrantCount(competition) {
  const direct = Number(competition?.competitionNo || competition?.entrantCount || competition?.entrants || competition?.participants || 0) || 0;
  const itemTotal = competitionItemSummaries(competition).reduce((sum, item) => {
    const value = Number(item.registrationCount || item.competitionNo || item.roster?.length || 0) || 0;
    return sum + value;
  }, 0);
  const rosterTotal = Number(competition?.registrationSummary?.rosterCount || 0) || 0;
  return Math.max(direct, itemTotal, rosterTotal, 0);
}

function competitionItemEntrantRows(competitions) {
  return (competitions || []).flatMap((competition) => competitionItemSummaries(competition)
    .map((item) => {
      const entrants = Number(item.registrationCount || item.competitionNo || item.entrantCount || item.entrants || item.roster?.length || 0) || 0;
      const label = displayEventName(item) || itemFilterLabel(item) || '项目';
      return {
        competition,
        item,
        label,
        entrants,
        eventCode: item.eventCode || item.code || item.id || '',
      };
    }))
    .filter((row) => row.entrants > 0);
}

function competitionHasItems(competition) {
  return competitionItemCount(competition) > 0;
}

function normalizeSearchText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[，。、“”‘’"'|/\\()[\]{}:：；;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function searchTokens(value) {
  return normalizeSearchText(value).split(' ').filter(Boolean);
}

function compactText(value) {
  return normalizeSearchText(value).replace(/\s+/g, '');
}

function statusLabel(status) {
  if (status === 'registration') return '报名中';
  if (status === 'upcoming') return '未开赛';
  if (status === 'live') return '进行中';
  if (status === 'completed') return '已结束';
  return '状态待确认';
}

function rosterStatusLabel(status) {
  if (status === 'partial') return '报名名单更新中';
  if (status === 'complete') return '报名名单已完整';
  return '名单待更新';
}

function formatDataGeneratedAt(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hour}:${minute}`;
}

function scheduledSyncStatusLabel(syncStatus) {
  if (!syncStatus?.generatedAt) return '';
  const generatedLabel = formatDataGeneratedAt(syncStatus.generatedAt);
  if (!generatedLabel) return '';
  const summary = syncStatus.summary || {};
  const updatedCount = Number(summary.taskCount || 0);
  const failedCount = Number(summary.failedCount || 0);
  const taskTypes = summary.taskTypes || {};
  const parts = [
    Number(taskTypes['pre-event-roster'] || 0) ? `报名 ${Number(taskTypes['pre-event-roster'] || 0)}` : '',
    Number(taskTypes['completed-score'] || 0) ? `成绩 ${Number(taskTypes['completed-score'] || 0)}` : '',
    Number(taskTypes['historical-score-backfill'] || summary.backfillCount || 0) ? `历史补齐 ${Number(taskTypes['historical-score-backfill'] || summary.backfillCount || 0)}` : '',
  ].filter(Boolean);
  if (failedCount > 0) {
    return `${generatedLabel} 更新检查发现 ${failedCount} 项异常，已保留可用数据`;
  }
  if (updatedCount > 0) {
    return `${generatedLabel} 已完成 ${updatedCount} 项更新${parts.length ? `：${parts.join('、')}` : ''}`;
  }
  return `${generatedLabel} 已完成数据检查`;
}

function coverageLabel(competition) {
  if (competition.isPlatformEventList && !competitionHasItems(competition)) return '基础信息';
  if (competition.rosterStatus === 'partial' || competition.rosterStatus === 'complete') return '报名信息';
  if (competition.isPreEvent) return '项目明细';
  return '完整赛果';
}

function coverageClass(competition) {
  if (competition.isPlatformEventList && !competitionHasItems(competition)) return 'coverage-list';
  if (competition.rosterStatus === 'partial' || competition.rosterStatus === 'complete') return 'coverage-roster';
  if (competition.isPreEvent) return 'coverage-project';
  return 'coverage-score';
}

function coverageDetail(competition) {
  if (competition.isPlatformEventList && !competitionHasItems(competition)) {
    return '赛事基础信息已收录，可先关注赛程、地点和报名节奏。';
  }
  if (competition.rosterStatus === 'partial') return '报名信息正在更新，可先查看项目规模和初步赛前对标。';
  if (competition.rosterStatus === 'complete') return '报名信息已完整，可查看赛前对手、强手和熟悉对手分析。';
  if (competition.isPreEvent) return '项目明细已收录，可查看组别、剑种和报名规模。';
  return '赛果数据已完整，可查看排名、小组赛、淘汰赛和选手画像。';
}

function entityMatchScore(entity, keyword, fields) {
  if (!keyword) return 0;
  const compactKeyword = compactText(keyword);
  const normalizedFields = fields.map((field) => normalizeSearchText(field)).filter(Boolean);
  const compactFields = normalizedFields.map((field) => field.replace(/\s+/g, ''));
  if (compactFields.some((field) => field === compactKeyword)) return 100;
  if (compactFields.some((field) => field.startsWith(compactKeyword))) return 80;
  if (compactFields.some((field) => field.includes(compactKeyword))) return 60;
  return entity.searchText?.includes(normalizeSearchText(keyword)) ? 30 : 0;
}

function athleteSearchResultLimit(keyword) {
  return [...compactText(keyword)].length <= 1 ? Infinity : 12;
}

function competitionSearchHaystack(competition) {
  const values = [
    competition.sportName,
    competition.venue,
    competition.region,
    competitionYear(competition),
  ];

  if (competition.itemSearchText) values.push(competition.itemSearchText);
  for (const item of competitionItemSummaries(competition)) {
    values.push(
      displayEventName(item),
      item.eventName,
      item.shortEventName,
      itemFilterLabel(item),
      item.openDate,
      item.eventCode,
      ...(item.athleteNames || []),
    );
  }
  const normalized = normalizeSearchText(values.filter(Boolean).join(' '));
  return `${normalized} ${normalized.replace(/\s+/g, '')}`;
}

function cachedCompetitionSearchHaystack(competition) {
  const key = competition.sportCode || competition.sportId || competition.sportName;
  if (!key) return competitionSearchHaystack(competition);
  if (!state.competitionSearchCache.has(key)) {
    state.competitionSearchCache.set(key, competitionSearchHaystack(competition));
  }
  return state.competitionSearchCache.get(key);
}

function eventByCodeMap() {
  const map = new Map();
  for (const competition of state.competitions) {
    for (const item of competition.items || []) {
      map.set(item.eventCode, { competition, item });
    }
  }
  return map;
}

function buildAthleteSearchIndex() {
  const byName = new Map();
  const eventMap = eventByCodeMap();
  for (const athlete of Object.values(state.athletesById || {})) {
    const key = `${athlete.name || ''}__${athlete.club || ''}`;
    if (!byName.has(key)) {
      byName.set(key, {
        id: athlete.id,
        name: athlete.name,
        club: athlete.club,
        appearances: 0,
        bestRank: athlete.bestRank ?? null,
        latestDate: athlete.latestDate || null,
        events: [],
      });
    }
    const row = byName.get(key);
    row.appearances += athlete.appearances || athlete.events?.length || 0;
    if (athlete.bestRank && (!row.bestRank || athlete.bestRank < row.bestRank)) row.bestRank = athlete.bestRank;
    if (athlete.latestDate && (!row.latestDate || String(athlete.latestDate).localeCompare(String(row.latestDate), 'zh-CN') > 0)) {
      row.latestDate = athlete.latestDate;
      row.id = athlete.id;
    }
    row.events.push(...(athlete.events || []));
  }

  if (!byName.size) {
    for (const competition of state.competitions) {
      for (const item of competition.items || []) {
        for (const name of item.athleteNames || []) {
          const key = `${name}__`;
          if (!byName.has(key)) {
            byName.set(key, {
              id: null,
              name,
              club: '',
              appearances: 0,
              bestRank: null,
              latestDate: item.openDate || null,
              events: [],
            });
          }
          const row = byName.get(key);
          row.appearances += 1;
          row.events.push({
            eventCode: item.eventCode,
            eventName: item.eventName,
            shortEventName: item.shortEventName,
            openDate: item.openDate,
            sportName: competition.sportName,
            venue: competition.venue,
          });
        }
      }
    }
  }

  return [...byName.values()].map((athlete) => {
    const firstEvent = athlete.events.find((event) => eventMap.has(event.eventCode)) || athlete.events[0] || null;
    return {
      ...athlete,
      id: athlete.id || (firstEvent ? null : athlete.id),
      firstEventCode: firstEvent?.eventCode || null,
      eventLabels: [...new Set(athlete.events.map((event) => displayEventName(event)).filter(Boolean))].slice(0, 3),
      searchText: normalizeSearchText([
        athlete.name,
        athlete.club,
        ...(athlete.events || []).flatMap((event) => [event.eventName, event.shortEventName, event.sportName, event.venue]),
      ].join(' ')),
    };
  });
}

function buildClubSearchIndex() {
  const clubs = Object.values(state.clubsById || {});
  if (clubs.length) {
    return clubs.map((club) => ({
      ...club,
      eventLabels: [...new Set((club.events || []).map((event) => displayEventName(event)).filter(Boolean))].slice(0, 3),
      searchText: normalizeSearchText([
        club.club,
        ...(club.events || []).flatMap((event) => [event.eventName, event.shortEventName, event.sportName]),
      ].join(' ')),
    }));
  }

  const byClub = new Map();
  for (const athlete of Object.values(state.athletesById || {})) {
    if (!athlete.club) continue;
    if (!byClub.has(athlete.club)) {
      byClub.set(athlete.club, {
        id: encodeURIComponent(athlete.club),
        club: athlete.club,
        entrants: 0,
        medals: 0,
        top8: 0,
        bestRank: null,
        events: [],
      });
    }
    const row = byClub.get(athlete.club);
    row.entrants += athlete.appearances || 1;
    if (athlete.bestRank && (!row.bestRank || athlete.bestRank < row.bestRank)) row.bestRank = athlete.bestRank;
    row.events.push(...(athlete.events || []));
  }

  return [...byClub.values()].map((club) => ({
    ...club,
    eventLabels: [...new Set((club.events || []).map((event) => displayEventName(event)).filter(Boolean))].slice(0, 3),
    searchText: normalizeSearchText([
      club.club,
      ...(club.events || []).flatMap((event) => [event.eventName, event.shortEventName, event.sportName]),
    ].join(' ')),
  }));
}

function athleteMatchReason(athlete, keyword) {
  const compactKeyword = compactText(keyword);
  if (compactText(athlete.name) === compactKeyword) return '姓名完全匹配';
  if (compactText(athlete.name).includes(compactKeyword)) return '姓名匹配';
  if (compactText(athlete.club).includes(compactKeyword)) return '俱乐部匹配';
  const event = (athlete.eventLabels || []).find((label) => compactText(label).includes(compactKeyword));
  if (event) return `项目匹配：${event}`;
  return `${athlete.appearances || 0} 次参赛记录`;
}

function clubMatchReason(club, keyword) {
  const compactKeyword = compactText(keyword);
  if (compactText(club.club) === compactKeyword) return '俱乐部完全匹配';
  if (compactText(club.club).includes(compactKeyword)) return '俱乐部名称匹配';
  const event = (club.eventLabels || []).find((label) => compactText(label).includes(compactKeyword));
  if (event) return `项目匹配：${event}`;
  return `${club.entrants || 0} 人次参赛记录`;
}

function normalizeBoutScore(value) {
  if (value === 'V') return 5;
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function poolBoutOutcome(row) {
  const homeScore = normalizeBoutScore(row.homeScore);
  const awayScore = normalizeBoutScore(row.awayScore);
  if (homeScore === null || awayScore === null) {
    return { homeWon: false, awayWon: false };
  }
  return {
    homeWon: homeScore > awayScore,
    awayWon: awayScore > homeScore,
  };
}

function showView(name) {
  Object.entries(views).forEach(([key, view]) => {
    view.classList.toggle('active', key === name);
  });
  trackAnalyticsPage(name);
  searchShell.classList.toggle('collapsed', name !== 'competitions');
  const mainViews = ['roleHome', 'home', 'competitions', 'follow', 'my'];
  topBack.classList.toggle('visible', !mainViews.includes(name));
  if (bottomNav) {
    const showBottomNav = ['home', 'competitions', 'follow', 'my'].includes(name);
    bottomNav.hidden = !showBottomNav;
    const activeTab = ['home', 'competitions', 'follow', 'my'].includes(name) ? name : state.activeMainTab;
    if (activeTab) state.activeMainTab = activeTab;
    updateBottomNavState(activeTab);
  }
}

function updateBottomNavState(activeTab) {
  if (!bottomNav) return;
  activeTab = ['home', 'competitions', 'follow', 'my'].includes(activeTab) ? activeTab : 'home';
  [...bottomNav.querySelectorAll('[data-main-tab]')].forEach((button) => {
    const isActive = button.dataset.mainTab === activeTab;
    button.classList.remove('active');
    button.classList.remove('is-current');
    button.removeAttribute('aria-current');
    button.setAttribute('aria-selected', 'false');
    button.dataset.active = 'false';
    if (isActive) {
      button.classList.add('active');
      button.classList.add('is-current');
      button.setAttribute('aria-current', 'page');
      button.setAttribute('aria-selected', 'true');
      button.dataset.active = 'true';
    }
    button.blur();
  });
  bottomNav.dataset.activeTab = activeTab;
}

function scrollToPageTop() {
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
}

function scrollToResultPanel(element, behavior = 'smooth') {
  if (!element) return;
  const scroll = () => {
    const appHeader = document.querySelector('.app-header');
    const header = appHeader || document.querySelector('.topbar');
    const target = element.querySelector?.('.ai-answer-card, .loading-row') || element;
    const headerOffset = (header?.getBoundingClientRect().height || 0) + 14;
    const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - headerOffset);
    window.scrollTo({ top, left: 0, behavior });
  };
  requestAnimationFrame(() => {
    scroll();
    setTimeout(scroll, 120);
  });
}

function navigateTo(name) {
  const current = state.viewStack[state.viewStack.length - 1];
  if (current !== name) state.viewStack.push(name);
  if (['home', 'competitions', 'follow', 'my'].includes(name)) state.activeMainTab = name;
  if (name === 'home') renderHomePage();
  if (name === 'follow') renderFocusPage();
  if (name === 'my') renderPersonalPages();
  showView(name);
  scrollToPageTop();
}

function navigateMain(name) {
  state.activeMainTab = name;
  const targetView = name;
  if (targetView === 'home') renderHomePage();
  if (targetView === 'follow') renderFocusPage();
  if (targetView === 'my') renderPersonalPages();
  state.viewStack = [targetView];
  showView(targetView);
  scrollToPageTop();
}

function goBack() {
  if (state.viewStack.length <= 1) {
    state.activeMainTab = 'home';
    state.viewStack = ['home'];
    renderHomePage();
    showView('home');
    scrollToPageTop();
    return;
  }
  state.viewStack.pop();
  const target = state.viewStack[state.viewStack.length - 1];
  if (['home', 'competitions', 'follow', 'my'].includes(target)) state.activeMainTab = target;
  showView(target);
  scrollToPageTop();
}

function buildCompetitionsFromEvents(events) {
  const grouped = new Map();
  for (const event of events || []) {
    const sportCode = event.sportCode || event.fileName || event.eventCode;
    if (!grouped.has(sportCode)) {
      grouped.set(sportCode, {
        sportCode,
        sportName: event.sportName,
        venue: event.venue,
        region: inferRegion(event.venue),
        dateLabel: event.openDate || '日期待确认',
        itemCount: 0,
        items: [],
      });
    }
    const bucket = grouped.get(sportCode);
    bucket.items.push({
      eventCode: event.eventCode,
      eventName: event.eventName,
      shortEventName: event.shortEventName || shortEventName(event.eventName),
      openDate: event.openDate,
      competitionNo: event.competitionNo,
      poolCount: event.poolCount,
      poolQualifyNo: event.poolQualifyNo,
      deStartPhase: event.deStartPhase,
      playedEliminationMatchCount: event.playedEliminationMatchCount,
      byeMatchCount: event.byeMatchCount,
      athleteNames: event.athleteNames || [],
    });
    bucket.itemCount = bucket.items.length;
  }
  return [...grouped.values()];
}

function inferRegion(venue) {
  if (!venue) return '待确认';
  return String(venue).replace(/[·\s]/g, '').split(/[市区县]/)[0] || '待确认';
}

function sortYearsDescending(values) {
  return [...values].sort((a, b) => Number(b) - Number(a));
}

function sortRegions(values) {
  return [...values].sort((a, b) => String(a).localeCompare(String(b), 'zh-CN'));
}

function itemSortKey(label) {
  const text = String(label || '');
  const age = Number(text.match(/U(\d+)/)?.[1] || 999);
  const weaponOrder = text.includes('花剑') ? 1 : text.includes('重剑') ? 2 : text.includes('佩剑') ? 3 : 9;
  return [age, weaponOrder, text];
}

function sortItemLabels(values) {
  return [...values].sort((a, b) => {
    const left = itemSortKey(a);
    const right = itemSortKey(b);
    return left[0] - right[0] || left[1] - right[1] || left[2].localeCompare(right[2], 'zh-CN');
  });
}

function filterOptions(type) {
  if (type === 'year') {
    return ['全部年份', ...sortYearsDescending(new Set(state.competitions.map(competitionYear)))];
  }
  if (type === 'region') {
    return ['全部地区', ...sortRegions(new Set(state.competitions.map((item) => item.region || '待确认')))];
  }
  if (type === 'status') {
    return ['全部状态', '报名中', '未开赛', '进行中', '已结束'];
  }

  const labels = new Set();
  for (const competition of state.competitions) {
    for (const label of competitionItemFilterLabels(competition)) if (label) labels.add(label);
  }
  return ['全部项目', ...sortItemLabels(labels)];
}

function activeFilterValue(type) {
  if (type === 'year') return state.selectedYear;
  if (type === 'region') return state.selectedRegion;
  if (type === 'status') return state.selectedStatus;
  return state.selectedItem;
}

function filterTitle(type) {
  if (type === 'year') return '选择年份';
  if (type === 'region') return '选择地区';
  if (type === 'status') return '选择状态';
  return '选择项目';
}

function setFilterValue(type, value) {
  if (type === 'year') state.selectedYear = value;
  if (type === 'region') state.selectedRegion = value;
  if (type === 'item') state.selectedItem = value;
  if (type === 'status') state.selectedStatus = value;
  state.selectedAiMonth = '';
  state.aiCompetitionFilterSummary = '';
  renderFilters();
  applyCompetitionFilter();
}

function matchingFilterOption(type, value) {
  if (!value) return filterOptions(type)[0];
  const options = filterOptions(type);
  const normalized = compactText(value);
  return options.find((option) => compactText(option) === normalized)
    || options.find((option) => compactText(option).includes(normalized) || normalized.includes(compactText(option)))
    || options[0];
}

function aiCompetitionFilterSummary(filters = {}) {
  const parts = [];
  if (filters.year) parts.push(`${filters.year}年`);
  if (filters.month) parts.push(`${filters.month}月`);
  if (filters.region) parts.push(filters.region);
  if (filters.status) parts.push(statusLabel(filters.status));
  return parts.length ? `来自 AI 问答：${parts.join(' · ')}` : '';
}

function applyAiCompetitionFilters(filters = {}) {
  state.selectedYear = filters.year ? matchingFilterOption('year', filters.year) : '全部年份';
  state.selectedRegion = filters.region ? matchingFilterOption('region', filters.region) : '全部地区';
  state.selectedStatus = filters.status ? matchingFilterOption('status', statusLabel(filters.status)) : '全部状态';
  state.selectedItem = '全部项目';
  state.selectedAiMonth = filters.month || '';
  state.aiCompetitionFilterSummary = aiCompetitionFilterSummary(filters);
  searchInput.value = '';
  renderFilters();
  applyCompetitionFilter();
  navigateMain('competitions');
}

function clearAiCompetitionFilter() {
  state.selectedYear = '全部年份';
  state.selectedRegion = '全部地区';
  state.selectedItem = '全部项目';
  state.selectedStatus = '全部状态';
  state.selectedAiMonth = '';
  state.aiCompetitionFilterSummary = '';
  searchInput.value = '';
  renderFilters();
  applyCompetitionFilter();
}

function renderFilters() {
  const configs = [
    [yearFilterButton, 'year', state.selectedYear],
    [regionFilterButton, 'region', state.selectedRegion],
    [itemFilterButton, 'item', state.selectedItem],
    [statusFilterButton, 'status', state.selectedStatus],
  ];

  for (const [button, type, value] of configs) {
    button.innerHTML = `<span>${escapeHtml(value)}</span>`;
    button.classList.toggle('active', value !== filterOptions(type)[0]);
  }
}

function openFilterSheet(type) {
  const activeValue = activeFilterValue(type);
  filterSheetTitle.textContent = filterTitle(type);
  filterSheetOptions.innerHTML = filterOptions(type).map((value) => `
    <button class="sheet-option ${value === activeValue ? 'active' : ''}" type="button" data-filter-type="${type}" data-filter-value="${escapeHtml(value)}">
      ${escapeHtml(value)}
    </button>
  `).join('');
  filterSheet.hidden = false;
}

function closeFilterSheet() {
  filterSheet.hidden = true;
}

function renderRegionSelect() {
  renderFilters();
}

function renderYearSelect() {
  renderFilters();
}

function renderItemSelect() {
  renderFilters();
}

function applyCompetitionFilter() {
  state.visibleCompetitionLimit = COMPETITION_LIST_PAGE_SIZE;
  const keyword = normalizeSearchText(searchInput.value);
  const tokens = searchTokens(keyword);
  const compactKeyword = keyword.replace(/\s+/g, '');
  const region = state.selectedRegion;
  const year = state.selectedYear;
  const itemFilter = state.selectedItem;
  const statusFilter = state.selectedStatus;
  const monthFilter = state.selectedAiMonth;
  state.filteredCompetitions = state.competitions.filter((competition) => {
    const matchRegion = region === '全部地区' || (competition.region || '待确认') === region;
    const matchYear = year === '全部年份' || competitionYear(competition) === year;
    const matchMonth = !monthFilter || competitionMonth(competition) === monthFilter;
    const matchItem = itemFilter === '全部项目' || competitionItemFilterLabels(competition).includes(itemFilter);
    const matchStatus = statusFilter === '全部状态' || statusLabel(competition.status || 'completed') === statusFilter;
    const haystack = cachedCompetitionSearchHaystack(competition);
    const matchKeyword = !keyword || tokens.every((token) => haystack.includes(token)) || haystack.includes(compactKeyword);
    return matchRegion && matchYear && matchMonth && matchItem && matchStatus && matchKeyword;
  });
  if (!keyword) {
    state.athleteSearchResults = [];
    state.clubSearchResults = [];
    state.lastSearchKeyword = '';
  }
  renderAthleteSearchResults(keyword);
  renderHomeStats();
  renderFeedPanel();
  renderCompetitionList();
}

async function refreshEntitySearch(keyword) {
  const normalizedKeyword = normalizeSearchText(keyword);
  const requestId = state.searchRequestId;
  if (!normalizedKeyword) return;
  const athleteLimit = athleteSearchResultLimit(normalizedKeyword) === Infinity ? 50 : 12;
  const params = new URLSearchParams({
    q: normalizedKeyword,
    type: 'all',
    athleteLimit: String(athleteLimit),
    clubLimit: '4',
  });
  try {
    const result = await fetchJson(`/api/search?${params.toString()}`);
    if (requestId !== state.searchRequestId || normalizeSearchText(searchInput.value) !== normalizedKeyword) return;
    state.lastSearchKeyword = normalizedKeyword;
    state.athleteSearchResults = result.athletes || [];
    state.clubSearchResults = result.clubs || [];
    renderAthleteSearchResults(normalizedKeyword);
  } catch {
    if (requestId !== state.searchRequestId) return;
    state.athleteSearchResults = [];
    state.clubSearchResults = [];
    renderAthleteSearchResults(normalizedKeyword);
  }
}

function handleSearchInput() {
  const keyword = normalizeSearchText(searchInput.value);
  state.searchRequestId += 1;
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  state.selectedAiMonth = '';
  state.aiCompetitionFilterSummary = '';
  state.athleteSearchResults = [];
  state.clubSearchResults = [];
  applyCompetitionFilter();
  if (!keyword) return;
  const requestId = state.searchRequestId;
  searchDebounceTimer = setTimeout(() => {
    if (requestId !== state.searchRequestId) return;
    refreshEntitySearch(keyword);
  }, 180);
}

function sumCompetitionItems(competitions, getter) {
  return competitions.reduce((total, competition) => (
    total + competitionItemSummaries(competition).reduce((sum, item) => sum + (Number(getter(item, competition)) || 0), 0)
  ), 0);
}

function summarizeDataCoverage(competitions) {
  const summary = {
    directory: 0,
    project: 0,
    roster: 0,
    score: 0,
  };

  for (const competition of competitions) {
    if (competition.rosterStatus === 'partial' || competition.rosterStatus === 'complete') {
      summary.roster += 1;
    } else if (competition.isPlatformEventList && !competitionHasItems(competition)) {
      summary.directory += 1;
    } else if (competition.isPreEvent) {
      summary.project += 1;
    } else {
      summary.score += 1;
    }
  }

  summary.actionable = summary.project + summary.roster + summary.score;
  return summary;
}

function coverageProductLabel(level) {
  return {
    directory: '赛事目录',
    project: '项目清单',
    roster: '报名名单',
    score: '成绩对阵',
  }[level] || '待确认';
}

function competitionCoverageLevel(competition) {
  if (competition.coverageLevel) return competition.coverageLevel;
  const items = competition.items || [];
  const hasScore = items.some((item) => (
    (item.athleteProfiles || []).length
    || (item.poolGroups || []).length
    || (item.eliminationMatches || []).length
    || (item.participants || []).length
  ));
  if (hasScore) return 'score';
  const hasRoster = items.some((item) => (item.roster || []).length || Number(item.registrationCount) > 0);
  if (hasRoster || competition.rosterStatus === 'partial' || competition.rosterStatus === 'complete') return 'roster';
  if (items.length || competition.isPreEvent) return 'project';
  return 'directory';
}

function competitionCoverageNeed(competition) {
  const level = competitionCoverageLevel(competition);
  if (level === 'directory') return '适合查看赛历和地点';
  if (level === 'project') return '适合关注项目规模';
  if (level === 'roster') return '适合做赛前准备';
  return '已可深度分析';
}

function dataCoveragePriorityRows(competitions, limit = 3) {
  return [...competitions]
    .map((competition) => {
      const level = competitionCoverageLevel(competition);
      const statusWeight = {
        registration: 5,
        upcoming: 4,
        running: 4,
        completed: 2,
      }[competition.status] || 1;
      const levelWeight = {
        directory: 4,
        project: 3,
        roster: 2,
        score: 0,
      }[level] || 0;
      const nearWeight = /2026|2025/.test(`${competition.sportName || ''} ${competition.dateLabel || ''}`) ? 2 : 0;
      return {
        competition,
        level,
        score: statusWeight + levelWeight + nearWeight,
      };
    })
    .filter((row) => row.level !== 'score')
    .sort((a, b) => b.score - a.score || String(b.competition.dateLabel || '').localeCompare(String(a.competition.dateLabel || ''), 'zh-CN'))
    .slice(0, limit);
}

function homeServiceReadinessRows(coverage, competitions = state.competitions || []) {
  const prematchCount = Math.max((coverage?.project || 0) + (coverage?.roster || 0), 0);
  const growthCount = coverage?.score || 0;
  const coachCount = entityCoverageCounts().clubs;
  return [
    {
      title: '赛前情报',
      value: prematchCount,
      detail: '报名、项目和未开赛赛事可用于赛前提醒。',
    },
    {
      title: '成长报告',
      value: growthCount,
      detail: '已有成绩或对阵的赛事可用于长期复盘。',
    },
    {
      title: '教练工作台',
      value: coachCount,
      detail: '俱乐部画像可用于学员分层和招生展示。',
    },
  ].map((row) => ({
    ...row,
    disabled: !row.value || !competitions.length,
  }));
}

function renderHomeDataCoverage() {
  const source = state.competitions || [];
  if (!source.length) return '';
  const coverage = summarizeDataCoverage(source);
  const total = source.length || 1;
  const scorePercent = Math.round((coverage.score / total) * 100);
  const actionablePercent = Math.round((coverage.actionable / total) * 100);
  const priorityRows = dataCoveragePriorityRows(source, 3);
  const serviceRows = homeServiceReadinessRows(coverage, source);
  const generatedLabel = formatDataGeneratedAt(state.dataGeneratedAt);
  const syncLabel = scheduledSyncStatusLabel(state.dataCoverage?.scheduledSync);

  return `
    <section class="panel my-section data-status-panel">
      <div class="section-title">
        <h2>数据状态</h2>
        <span>${escapeHtml(actionablePercent)}% 可继续分析</span>
      </div>
      <div class="coverage-stage-strip">
        <div>
          <strong>${escapeHtml(coverage.directory)}</strong>
          <span>赛事目录</span>
        </div>
        <div>
          <strong>${escapeHtml(coverage.project + coverage.roster)}</strong>
          <span>项目/报名</span>
        </div>
        <div>
          <strong>${escapeHtml(coverage.score)}</strong>
          <span>成绩对阵</span>
        </div>
      </div>
      <div class="service-readiness-grid">
        ${serviceRows.map((row) => `
          <div class="${row.disabled ? 'muted' : ''}">
            <strong>${escapeHtml(row.value)}</strong>
            <span>${escapeHtml(row.title)}</span>
            <small>${escapeHtml(row.detail)}</small>
          </div>
        `).join('')}
      </div>
      <div class="coverage-progress">
        <span style="width: ${escapeHtml(scorePercent)}%"></span>
      </div>
      <p>${escapeHtml(coverage.score)} 场赛事已有成绩或对阵，可用于成长复盘和队伍分析；${generatedLabel ? `数据更新于 ${escapeHtml(generatedLabel)}，` : ''}近期报名赛事可用于赛前准备。</p>
      ${syncLabel ? `<div class="sync-status-note">${escapeHtml(syncLabel)}</div>` : ''}
      ${priorityRows.length ? `
        <div class="coverage-priority-list">
          ${priorityRows.map(({ competition, level }) => `
            <button type="button" data-coverage-competition="${escapeHtml(competition.sportCode)}">
              <strong>${escapeHtml(competition.sportName)}</strong>
              <span>${escapeHtml(coverageProductLabel(level))} · ${escapeHtml(competitionCoverageNeed(competition))}</span>
            </button>
          `).join('')}
        </div>
      ` : ''}
    </section>
  `;
}

function renderDataCoverageSummary(source) {
  if (!dataCoverageSummary) return;
  if (!source.length) {
    dataCoverageSummary.innerHTML = '';
    return;
  }

  const coverage = summarizeDataCoverage(source);
  const total = source.length || 1;
  const scorePercent = Math.round((coverage.score / total) * 100);
  const syncLabel = scheduledSyncStatusLabel(state.dataCoverage?.scheduledSync);
  const sourceNote = state.dataCoverage?.platformEvents
    ? `平台赛事 ${state.dataCoverage.platformEvents} 场已收录`
    : `${source.length} 场赛事已收录`;

  dataCoverageSummary.innerHTML = `
    <div class="coverage-summary-head">
      <div>
        <strong>数据能做什么</strong>
        <span>${escapeHtml(sourceNote)}，当前范围 ${escapeHtml(source.length)} 场</span>
      </div>
      <em>${escapeHtml(coverage.score)} 场可深度分析</em>
    </div>
    <div class="coverage-level-grid">
      <div>
        <strong>${escapeHtml(coverage.directory)}</strong>
        <span>赛事目录</span>
        <small>可用于筛选和赛历浏览</small>
      </div>
      <div>
        <strong>${escapeHtml(coverage.project + coverage.roster)}</strong>
        <span>项目/报名</span>
        <small>可用于赛前情报</small>
      </div>
      <div>
        <strong>${escapeHtml(coverage.score)}</strong>
        <span>成绩对阵</span>
        <small>可用于成长和队伍分析</small>
      </div>
    </div>
    <p>${escapeHtml(scorePercent)}% 的赛事已有成绩或对阵，可用于成长复盘、对手判断和队伍分析；只有报名或项目清单的赛事，更适合做赛前准备。</p>
    ${syncLabel ? `<div class="sync-status-note">${escapeHtml(syncLabel)}</div>` : ''}
  `;
}

function isFilteringActive() {
  return Boolean(normalizeSearchText(searchInput.value))
    || state.selectedYear !== '全部年份'
    || state.selectedRegion !== '全部地区'
    || state.selectedItem !== '全部项目'
    || state.selectedStatus !== '全部状态';
}

function entityCoverageCounts() {
  const positiveMax = (...values) => Math.max(0, ...values.map((value) => Number(value) || 0));
  return {
    athletes: positiveMax(
      state.dataCoverage?.athletes,
      state.athleteSearchIndex.length,
      Object.keys(state.athletesById || {}).length,
    ),
    clubs: positiveMax(
      state.dataCoverage?.clubs,
      state.clubSearchIndex.length,
      Object.keys(state.clubsById || {}).length,
    ),
  };
}

function renderHomeStats() {
  if (state.isDataLoading) {
    if (homeStatsScope) homeStatsScope.textContent = '加载中';
    homeStats.innerHTML = '<div class="loading-row">正在加载数据</div>';
    if (dataCoverageSummary) dataCoverageSummary.innerHTML = '';
    return;
  }
  if (state.dataLoadError) {
    if (homeStatsScope) homeStatsScope.textContent = '加载失败';
    homeStats.innerHTML = '';
    if (dataCoverageSummary) dataCoverageSummary.innerHTML = '';
    return;
  }
  const source = state.filteredCompetitions.length || isFilteringActive() ? state.filteredCompetitions : state.competitions;
  const eventCount = source.reduce((sum, competition) => sum + competitionItemCount(competition), 0);
  const regions = new Set(source.map((competition) => competition.region).filter(Boolean)).size;
  const coverage = summarizeDataCoverage(source);
  const prematchCount = Math.max(coverage.actionable - coverage.score, 0);
  const active = isFilteringActive();
  if (homeStatsScope) homeStatsScope.textContent = active ? '当前筛选' : '全部数据';

  homeStats.innerHTML = [
    ['比赛', source.length, `${regions} 地区`],
    ['项目', eventCount, '可筛选组别'],
    ['深度赛事', coverage.score, '可做成长分析'],
    ['赛前赛事', prematchCount, '可看报名项目'],
  ].map(([label, value, detail]) => `
    <div class="stat-item">
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(label)}</span>
      <span>${escapeHtml(detail)}</span>
    </div>
  `).join('');
  renderDataCoverageSummary(source);
}

function roleLabel(role) {
  return {
    parent: '家长',
    coach: '教练',
    club: '俱乐部负责人',
    data: '数据浏览',
  }[role] || '未选择';
}

function resolveAthleteReference(reference) {
  if (!reference) return null;
  const athleteMap = state.athletesById || {};
  if (reference.id && athleteMap[reference.id]) return { ...reference, ...athleteMap[reference.id] };

  const nameKey = compactText(reference.name);
  const clubKey = compactText(reference.club);
  if (!nameKey) return reference;

  const athletes = Object.values(athleteMap);
  const sameName = athletes.filter((athlete) => compactText(athlete.name) === nameKey);
  const sameClub = clubKey
    ? sameName.find((athlete) => compactText(athlete.club) === clubKey)
    : null;
  const resolved = sameClub || (sameName.length === 1 ? sameName[0] : sameName.sort((a, b) => (b.appearances || 0) - (a.appearances || 0))[0]);
  return resolved ? { ...reference, ...resolved } : reference;
}

function findAthleteByReference(reference) {
  const resolved = resolveAthleteReference(reference);
  if (resolved?.id || resolved?.events?.length) return resolved;
  const nameKey = compactText(reference?.name);
  if (!nameKey) return null;
  return (state.athleteSearchIndex || []).find((athlete) => compactText(athlete.name) === nameKey) || null;
}

function childCandidates() {
  const merged = new Map();
  for (const follow of state.followedAthletes || []) {
    const athlete = resolveAthleteReference(follow);
    if (athlete?.id) merged.set(athlete.id, athlete);
  }
  return [...merged.values()];
}

function getSelectedChild(candidates = childCandidates()) {
  if (state.selectedChildId && state.athletesById[state.selectedChildId]) return state.athletesById[state.selectedChildId];
  if (state.selectedChildId) {
    const indexed = candidates.find((athlete) => athlete.id === state.selectedChildId);
    if (indexed) return indexed;
  }
  return candidates[0] || null;
}

function eventYear(event) {
  const text = [
    event.openDate,
    event.date,
    event.dateLabel,
    event.sportName,
    event.competitionName,
    event.eventName,
  ].filter(Boolean).join(' ');
  const date = parseDateCandidates(text)[0];
  return date ? String(date.getFullYear()) : (String(text).match(/20\d{2}/)?.[0] || '待确认');
}

function buildParentGrowthModel(athlete) {
  const events = athlete?.events || [];
  const rankedEvents = events.filter((event) => Number(event.finalRank));
  const latest = events[0] || null;
  const previous = events[1] || null;
  const best = [...rankedEvents].sort((a, b) => Number(a.finalRank) - Number(b.finalRank))[0] || null;
  const totalPoolWins = events.reduce((sum, event) => sum + (Number(event.poolWins) || 0), 0);
  const totalPoolMatches = events.reduce((sum, event) => sum + (Number(event.poolMatches) || 0), 0);
  const poolRate = totalPoolMatches ? Math.round((totalPoolWins / totalPoolMatches) * 100) : null;
  const totalElimWins = events.reduce((sum, event) => sum + (Number(event.eliminationWins) || 0), 0);
  const totalElimLosses = events.reduce((sum, event) => sum + (Number(event.eliminationLosses) || 0), 0);
  const top8Count = rankedEvents.filter((event) => Number(event.finalRank) <= 8).length;
  const medalCount = events.filter((event) => event.medal).length;
  const trend = latest && previous && Number(latest.finalRank) && Number(previous.finalRank)
    ? Number(previous.finalRank) - Number(latest.finalRank)
    : null;
  const byYear = events.reduce((acc, event) => {
    const year = eventYear(event);
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});
  const yearRows = Object.entries(byYear)
    .sort((a, b) => String(b[0]).localeCompare(String(a[0]), 'zh-CN'))
    .slice(0, 4)
    .map(([label, value]) => ({ label, value, display: `${value} 场` }));

  let investment = '持续观察';
  let advice = '数据还在积累，先看参赛连续性、小组赛稳定性和淘汰赛突破。';
  if (events.length >= 4 && (poolRate ?? 0) >= 60 && (top8Count || medalCount || totalElimWins > totalElimLosses)) {
    investment = '成长势头良好';
    advice = '已有连续参赛和可见竞争力，建议保持训练节奏，并把重点放在强手对局和淘汰赛关键分。';
  } else if (events.length >= 3 && (poolRate ?? 0) >= 45) {
    investment = '稳步成长中';
    advice = '基础稳定性正在形成，建议保持参赛频率，重点观察名次是否能持续前移。';
  } else if (events.length >= 2) {
    investment = '夯实基础期';
    advice = '参赛记录已有基础，建议先提升小组赛稳定性，继续积累比赛经验。';
  }

  return { events, latest, previous, best, poolRate, totalPoolWins, totalPoolMatches, totalElimWins, totalElimLosses, top8Count, medalCount, trend, yearRows, investment, advice };
}

function parentNextFocusRows(model) {
  const rows = [];
  if (!model.events.length) {
    return [
      { title: '先建立参赛样本', detail: '至少积累 2-3 场记录后，再看趋势和项目稳定性。' },
    ];
  }

  if (model.poolRate === null) {
    rows.push({ title: '补齐小组赛表现', detail: '优先看小组胜负和净胜剑，判断基础稳定性。' });
  } else if (model.poolRate >= 60) {
    rows.push({ title: '保持小组赛稳定', detail: `当前小组胜率 ${model.poolRate}%，下一步看淘汰赛关键分。` });
  } else {
    rows.push({ title: '提升小组赛稳定性', detail: `当前小组胜率 ${model.poolRate}%，重点复盘开局和连续失分。` });
  }

  if (model.totalElimWins + model.totalElimLosses) {
    rows.push(model.totalElimWins > model.totalElimLosses
      ? { title: '扩大淘汰赛优势', detail: `${model.totalElimWins}胜${model.totalElimLosses}负，适合重点研究强手对局。` }
      : { title: '积累淘汰赛经验', detail: `${model.totalElimWins}胜${model.totalElimLosses}负，下一步关注关键分处理。` });
  } else {
    rows.push({ title: '争取淘汰赛突破', detail: '当前还缺少淘汰赛胜负样本，先看能否稳定进入后续轮次。' });
  }

  rows.push(model.top8Count
    ? { title: '沉淀优势项目', detail: `已有 ${model.top8Count} 次前八，建议围绕最好项目持续参赛。` }
    : { title: '寻找突破项目', detail: '尚未形成前八突破，先看哪个项目名次最接近前八。' });

  return rows.slice(0, 3);
}

function renderParentWorkspace() {
  const candidates = childCandidates();
  const child = getSelectedChild(candidates);
  const model = child ? buildParentGrowthModel(child) : null;
  const childOptions = candidates.length ? `
    <div class="child-picker">
      ${candidates.slice(0, 6).map((athlete) => `
        <button type="button" class="${athlete.id === child?.id ? 'active' : ''}" data-child-id="${escapeHtml(athlete.id)}">
          <strong>${escapeHtml(athlete.name)}</strong>
          <span>${escapeHtml(athlete.club || '俱乐部待确认')}</span>
        </button>
      `).join('')}
    </div>
  ` : `
    <div class="empty compact-empty">先搜索孩子姓名，进入选手详情后点击“关注这个孩子”，这里就会生成成长分析。</div>
  `;

  if (!child || !model) {
    return `
      <section class="panel role-panel">
        <div class="section-title">
          <h2>家长成长视角</h2>
          <span>先绑定孩子</span>
        </div>
        ${childOptions}
      </section>
    `;
  }

  const trendLabel = model.trend === null ? '趋势待确认' : model.trend > 0 ? `进步 ${model.trend} 名` : model.trend < 0 ? `后退 ${Math.abs(model.trend)} 名` : '名次持平';
  const focusRows = parentNextFocusRows(model);
  return `
    <section class="panel role-panel parent-panel">
      <div class="role-panel-head">
        <div>
          <span>当前角色：家长</span>
          <strong>${escapeHtml(child.name)} 的成长报告</strong>
          <em>${escapeHtml(child.club || '俱乐部待确认')}</em>
        </div>
        <button type="button" data-role-reset>切换角色</button>
      </div>
      ${childOptions}
      <div class="parent-decision">
        <span>成长建议</span>
        <strong>${escapeHtml(model.investment)}</strong>
        <p>${escapeHtml(model.advice)}</p>
      </div>
      <div class="report-grid">
        <div class="report-card"><strong>${escapeHtml(model.events.length)}</strong><span>参赛记录</span></div>
        <div class="report-card"><strong>${escapeHtml(model.best?.finalRank ? `第${model.best.finalRank}名` : '-')}</strong><span>最好名次</span></div>
        <div class="report-card"><strong>${escapeHtml(model.poolRate === null ? '-' : `${model.poolRate}%`)}</strong><span>小组胜率</span></div>
        <div class="report-card"><strong>${escapeHtml(`${model.totalElimWins}胜${model.totalElimLosses}负`)}</strong><span>淘汰赛</span></div>
      </div>
      <div class="parent-insight-grid">
        <div class="insight-note compact">最近一次：${escapeHtml(model.latest ? `${displayEventName(model.latest)} 第${model.latest.finalRank ?? '-'}名` : '暂无记录')}</div>
        <div class="insight-note compact">近期变化：${escapeHtml(trendLabel)}</div>
        <div class="insight-note compact">突破信号：${escapeHtml(model.top8Count ? `${model.top8Count} 次进入前八` : '尚未形成前八突破')}</div>
      </div>
      <div class="parent-next-focus">
        <div class="coach-bucket-head">
          <strong>下一步关注点</strong>
          <span>用于训练和参赛沟通</span>
        </div>
        ${focusRows.map((row) => `
          <div class="parent-focus-row">
            <strong>${escapeHtml(row.title)}</strong>
            <span>${escapeHtml(row.detail)}</span>
          </div>
        `).join('')}
      </div>
      ${model.yearRows.length ? barChart('年度参赛频率', model.yearRows, { tone: 'teal' }) : ''}
      <button class="secondary-action compact-action" type="button" data-parent-growth-athlete-id="${escapeHtml(child.id)}">生成成长报告</button>
      <button class="primary-action compact-action" type="button" data-athlete-id="${escapeHtml(child.id)}">查看完整选手画像</button>
    </section>
  `;
}

function parentGrowthReportTimelineRows(athlete) {
  return buildAthleteTimelineRows(athlete).slice(0, 8);
}

function parentGrowthReportEvidenceRows(model) {
  return (model.events || []).slice(0, 5).map((event) => ({
    eventCode: event.eventCode,
    title: displayEventName(event),
    detail: [event.sportName, event.venue, event.openDate || event.dateLabel].filter(Boolean).join(' · '),
    result: `最终第 ${event.finalRank ?? '-'} 名 · 小组第 ${event.poolRank ?? '-'} 名`,
  }));
}

function parentGrowthOpponentRows(athlete) {
  return (athlete?.opponents || [])
    .filter((opponent) => opponent?.name)
    .slice(0, 4)
    .map((opponent) => {
      const wins = Number(opponent.wins) || 0;
      const losses = Number(opponent.losses) || 0;
      const matches = Number(opponent.matches) || wins + losses;
      const latest = [
        opponent.latestPhase || '淘汰赛',
        opponent.latestScore ? `最近 ${opponent.latestScore}` : '',
      ].filter(Boolean).join(' · ');
      return {
        name: opponent.name,
        club: opponent.club || '俱乐部待确认',
        record: `${wins}胜${losses}负`,
        matches,
        latest,
        query: `分析${athlete.name}和${opponent.name}的对战情况`,
      };
    });
}

function parentGrowthActionRows(athlete, model, focusRows = []) {
  const latest = model.latest;
  const bestProject = model.best ? displayEventName(model.best) : (latest ? displayEventName(latest) : '常参项目');
  const trendText = model.trend === null ? '名次变化还需要继续观察' : model.trend > 0 ? `最近名次前进 ${model.trend} 名` : model.trend < 0 ? `最近名次后退 ${Math.abs(model.trend)} 名` : '最近名次基本稳定';
  return [
    {
      title: '赛后复盘',
      detail: latest
        ? `先复盘 ${displayEventName(latest)}：最终第 ${latest.finalRank ?? '-'} 名，小组第 ${latest.poolRank ?? '-'} 名。`
        : '先补齐最近比赛记录，再判断小组赛和淘汰赛问题。',
    },
    {
      title: '训练沟通',
      detail: focusRows[0]
        ? `${focusRows[0].title}：${focusRows[0].detail}`
        : `${athlete.name || '孩子'} 当前样本较少，先和教练确认基础动作、比赛节奏和项目方向。`,
    },
    {
      title: '下场比赛',
      detail: `优先选择 ${bestProject} 或相近项目，目标是验证 ${trendText} 是否持续。`,
    },
    {
      title: '投入观察',
      detail: `连续 2-3 场看参赛频率、名次变化和淘汰赛表现，再决定训练强度和参赛安排。`,
    },
  ];
}

function parentInvestmentSignalRows(model) {
  const eventSignal = model.events.length >= 4
    ? { level: '稳定', detail: `已有 ${model.events.length} 场参赛记录，可以开始按季度复盘。` }
    : model.events.length >= 2
      ? { level: '积累中', detail: `已有 ${model.events.length} 场记录，建议再观察 1-2 场形成趋势。` }
      : { level: '样本少', detail: '先积累至少 2-3 场比赛，再判断长期投入节奏。' };
  const poolSignal = model.poolRate === null
    ? { level: '待补齐', detail: '小组胜负数据不足，先补齐基础稳定性证据。' }
    : model.poolRate >= 60
      ? { level: '基础稳定', detail: `小组胜率 ${model.poolRate}%，下一步看淘汰赛关键分。` }
      : model.poolRate >= 45
        ? { level: '可提升', detail: `小组胜率 ${model.poolRate}%，重点减少开局波动和连续失分。` }
        : { level: '需巩固', detail: `小组胜率 ${model.poolRate}%，先把基础得分能力和节奏稳定下来。` };
  const eliminationTotal = model.totalElimWins + model.totalElimLosses;
  const elimSignal = eliminationTotal
    ? model.totalElimWins > model.totalElimLosses
      ? { level: '有突破', detail: `淘汰赛 ${model.totalElimWins}胜${model.totalElimLosses}负，适合增加强手对局复盘。` }
      : { level: '继续观察', detail: `淘汰赛 ${model.totalElimWins}胜${model.totalElimLosses}负，先看关键分处理。` }
    : { level: '待突破', detail: '还缺少淘汰赛胜负样本，先以稳定晋级为阶段目标。' };
  const trendSignal = model.trend === null
    ? { level: '待确认', detail: '最近两场名次还不能直接比较，继续看同项目连续表现。' }
    : model.trend > 0
      ? { level: '向前', detail: `最近名次前进 ${model.trend} 名，可以保持参赛节奏。` }
      : model.trend < 0
        ? { level: '复盘', detail: `最近名次后退 ${Math.abs(model.trend)} 名，建议先做赛后复盘。` }
        : { level: '持平', detail: '最近名次基本持平，下一场重点看小组赛稳定性。' };
  return [
    { title: '参赛连续性', ...eventSignal },
    { title: '小组稳定性', ...poolSignal },
    { title: '淘汰赛突破', ...elimSignal },
    { title: '名次趋势', ...trendSignal },
  ];
}

function bindCopyTextButton(button, textBuilder, analyticsLabel = '', followupText = '') {
  if (!button) return;
  button.addEventListener('click', async () => {
    const originalLabel = button.textContent;
    let followup = null;
    if (followupText) {
      followup = button.parentElement?.querySelector('.report-share-followup') || document.createElement('span');
      followup.className = 'report-share-followup';
      followup.textContent = '';
      if (!followup.parentElement) button.insertAdjacentElement('afterend', followup);
    }
    try {
      const text = typeof textBuilder === 'function' ? textBuilder() : textBuilder;
      await copyTextToClipboard(text);
      if (analyticsLabel) trackAnalyticsAction('share_report', analyticsLabel);
      button.textContent = '已复制';
      if (followup) followup.textContent = followupText;
    } catch (error) {
      button.textContent = '复制失败';
      if (followup) followup.textContent = '';
    }
    setTimeout(() => {
      button.textContent = originalLabel;
      if (followup) followup.textContent = '';
    }, followupText ? 2600 : 1400);
  });
}

function buildParentGrowthShareText(athlete, model, focusRows, actionRows = parentGrowthActionRows(athlete, model, focusRows), signalRows = parentInvestmentSignalRows(model), opponentRows = parentGrowthOpponentRows(athlete)) {
  return [
    `${athlete.name} 成长报告`,
    `俱乐部：${athlete.club || '待确认'}`,
    `成长判断：${model.investment}`,
    `参赛记录：${model.events.length} 场，最好名次：${model.best?.finalRank ? `第${model.best.finalRank}名` : '-'}`,
    `小组胜率：${model.poolRate === null ? '-' : `${model.poolRate}%`}，淘汰赛：${model.totalElimWins}胜${model.totalElimLosses}负`,
    `建议：${model.advice}`,
    ...signalRows.slice(0, 4).map((row) => `${row.title}：${row.level}，${row.detail}`),
    ...opponentRows.slice(0, 3).map((row) => `重点对手：${row.name}，${row.record}，${row.latest || `${row.matches} 次交手`}`),
    ...focusRows.slice(0, 3).map((row, index) => `关注点${index + 1}：${row.title}，${row.detail}`),
    ...actionRows.slice(0, 4).map((row) => `${row.title}：${row.detail}`),
    '数据来源：FencingAI 已收录赛事成绩',
  ].join('\n');
}

function parentGrowthShareUrl(athlete) {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('athlete', athlete.id || '');
  return url.toString();
}

function buildParentGrowthPageShareText(athlete, model) {
  return [
    `${athlete.name} 的击剑成长页`,
    `${athlete.club || '俱乐部待确认'} · 参赛 ${model.events.length} 场 · 最好${model.best?.finalRank ? `第${model.best.finalRank}名` : '待确认'}`,
    '打开后可查看参赛轨迹、成长判断、重点对手和数据依据。',
    parentGrowthShareUrl(athlete),
  ].join('\n');
}

function renderParentGrowthReport(athleteId = '') {
  const candidates = childCandidates();
  const athlete = athleteId
    ? findAthleteByReference({ id: athleteId }) || candidates.find((item) => item.id === athleteId)
    : getSelectedChild(candidates);

  if (!athlete?.id) {
    parentGrowthReportHero.innerHTML = `
      <div class="hero-title">成长报告</div>
      <div class="hero-sub">先关注孩子后生成</div>
    `;
    parentGrowthReportBody.innerHTML = `
      <article class="panel parent-growth-report-card">
        <div class="empty compact-empty">还没有可生成报告的孩子。先搜索并关注选手，报告会自动基于参赛记录生成。</div>
      </article>
    `;
    return;
  }

  const model = buildParentGrowthModel(athlete);
  const focusRows = parentNextFocusRows(model);
  const actionRows = parentGrowthActionRows(athlete, model, focusRows);
  const signalRows = parentInvestmentSignalRows(model);
  const timelineRows = parentGrowthReportTimelineRows(athlete);
  const evidenceRows = parentGrowthReportEvidenceRows(model);
  const opponentRows = parentGrowthOpponentRows(athlete);
  const latestText = model.latest ? `${displayEventName(model.latest)} · 第${model.latest.finalRank ?? '-'}名` : '暂无记录';
  const trendLabel = model.trend === null ? '趋势待确认' : model.trend > 0 ? `进步 ${model.trend} 名` : model.trend < 0 ? `后退 ${Math.abs(model.trend)} 名` : '名次持平';

  parentGrowthReportHero.innerHTML = `
    <div class="hero-title">${escapeHtml(athlete.name)} 的成长报告</div>
    <div class="hero-sub">${escapeHtml(athlete.club || '俱乐部待确认')}</div>
    <div class="badge-row">
      <span class="badge">参赛 ${escapeHtml(model.events.length)} 场</span>
      <span class="badge">最好 ${escapeHtml(model.best?.finalRank ? `第${model.best.finalRank}名` : '-')}</span>
      <span class="badge">前八 ${escapeHtml(model.top8Count)} 次</span>
      <span class="badge">淘汰赛 ${escapeHtml(model.totalElimWins)}胜${escapeHtml(model.totalElimLosses)}负</span>
    </div>
    <div class="report-share-row">
      <button class="report-share-action" type="button" data-report-share="parent-growth">复制报告摘要</button>
      <button class="report-share-action secondary" type="button" data-report-share="parent-growth-page">复制成长页</button>
    </div>
  `;

  parentGrowthReportBody.innerHTML = `
    <article class="panel parent-growth-report-card parent-growth-decision">
      <div class="section-title">
        <h2>成长判断</h2>
        <span>家长视角</span>
      </div>
      <strong>${escapeHtml(model.investment)}</strong>
      <p>${escapeHtml(model.advice)}</p>
      <div class="parent-growth-signal-grid">
        <div><span>最近一次</span><strong>${escapeHtml(latestText)}</strong></div>
        <div><span>近期变化</span><strong>${escapeHtml(trendLabel)}</strong></div>
        <div><span>突破信号</span><strong>${escapeHtml(model.top8Count ? `${model.top8Count} 次前八` : '继续积累')}</strong></div>
      </div>
    </article>

    <article class="panel parent-growth-report-card">
      <div class="section-title">
        <h2>关键指标</h2>
        <span>可持续跟踪</span>
      </div>
      <div class="parent-growth-metrics">
        <div><strong>${escapeHtml(model.events.length)}</strong><span>参赛记录</span></div>
        <div><strong>${escapeHtml(model.poolRate === null ? '-' : `${model.poolRate}%`)}</strong><span>小组胜率</span></div>
        <div><strong>${escapeHtml(model.best?.finalRank ? `第${model.best.finalRank}名` : '-')}</strong><span>最好名次</span></div>
        <div><strong>${escapeHtml(`${model.totalElimWins}胜${model.totalElimLosses}负`)}</strong><span>淘汰赛</span></div>
      </div>
      ${model.yearRows.length ? barChart('年度参赛频率', model.yearRows, { tone: 'teal' }) : ''}
    </article>

    <article class="panel parent-growth-report-card parent-investment-signals">
      <div class="section-title">
        <h2>投入观察指标</h2>
        <span>继续投入前先看这些信号</span>
      </div>
      <div class="parent-investment-signal-list">
        ${signalRows.map((row) => `
          <div class="parent-investment-signal">
            <span>${escapeHtml(row.title)}</span>
            <strong>${escapeHtml(row.level)}</strong>
            <em>${escapeHtml(row.detail)}</em>
          </div>
        `).join('')}
      </div>
    </article>
    <article class="panel parent-growth-report-card">
      <div class="section-title">
        <h2>下一步关注点</h2>
        <span>训练沟通</span>
      </div>
      <div class="parent-growth-focus-list">
        ${focusRows.map((row) => `
          <div>
            <strong>${escapeHtml(row.title)}</strong>
            <span>${escapeHtml(row.detail)}</span>
          </div>
        `).join('')}
      </div>
    </article>

    <article class="panel parent-growth-report-card parent-opponent-tracking">
      <div class="section-title">
        <h2>重点对手追踪</h2>
        <span>${escapeHtml(opponentRows.length ? '基于历史交手' : '待积累')}</span>
      </div>
      <div class="parent-opponent-list">
        ${opponentRows.length ? opponentRows.map((row) => `
          <button type="button" data-ai-query="${escapeHtml(row.query)}">
            <div>
              <strong>${escapeHtml(row.name)}</strong>
              <span>${escapeHtml(row.club)}</span>
              <em>${escapeHtml(row.latest || `${row.matches} 次交手`)}</em>
            </div>
            <b>${escapeHtml(row.record)}</b>
          </button>
        `).join('') : '<div class="empty compact-empty">当前还没有可追踪的直接对手记录。后续有淘汰赛对阵后，会在这里沉淀重点对手和交手变化。</div>'}
      </div>
    </article>

    <article class="panel parent-growth-report-card">
      <div class="section-title">
        <h2>家庭执行计划</h2>
        <span>复盘、训练、下场安排</span>
      </div>
      <div class="parent-growth-action-list">
        ${actionRows.map((row) => `
          <div>
            <strong>${escapeHtml(row.title)}</strong>
            <span>${escapeHtml(row.detail)}</span>
          </div>
        `).join('')}
      </div>
    </article>

    <article class="panel parent-growth-report-card">
      <div class="section-title">
        <h2>参赛轨迹</h2>
        <span>最近记录</span>
      </div>
      <div class="parent-growth-timeline">
        ${timelineRows.length ? timelineRows.map((row) => `
          <button type="button" data-event-code="${escapeHtml(row.eventCode || '')}">
            <div>
              <strong>${escapeHtml(row.title)}</strong>
              <span>${escapeHtml(row.competition)}</span>
              <em>${escapeHtml([row.date, row.venue].filter(Boolean).join(' · '))}</em>
            </div>
            <b>${escapeHtml(row.rank)}</b>
          </button>
        `).join('') : '<div class="empty compact-empty">暂无参赛轨迹。</div>'}
      </div>
    </article>

    <article class="panel parent-growth-report-card">
      <div class="section-title">
        <h2>数据依据</h2>
        <span>可追溯</span>
      </div>
      <div class="parent-growth-evidence">
        ${evidenceRows.length ? evidenceRows.map((row) => `
          <button type="button" data-event-code="${escapeHtml(row.eventCode || '')}">
            <strong>${escapeHtml(row.title)}</strong>
            <span>${escapeHtml(row.detail)}</span>
            <em>${escapeHtml(row.result)}</em>
          </button>
        `).join('') : '<div class="empty compact-empty">暂无可追溯参赛记录。</div>'}
      </div>
      <button class="primary-action compact-action" type="button" data-athlete-id="${escapeHtml(athlete.id)}">查看完整选手画像</button>
    </article>

    ${reportConversionCard({
      source: 'parent-growth-report',
      title: '持续跟踪成长变化',
      detail: '适合把参赛记录、阶段变化和下一场建议沉淀成家庭长期报告。',
      primaryLabel: '申请家庭试用',
      secondaryLabel: '关注会员权益',
    })}
    ${reportReminderCard({
      source: 'parent-growth-reminder',
      title: '成长复盘提醒',
      detail: '把下一场比赛、成绩更新和阶段复盘时间固定下来，避免只看单次名次。',
      label: '订阅成长提醒',
    })}
  `;

  parentGrowthReportBody.querySelectorAll('[data-event-code]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.eventCode) openEvent(button.dataset.eventCode);
    });
  });
  parentGrowthReportBody.querySelectorAll('[data-ai-query]').forEach((button) => {
    button.addEventListener('click', () => submitAiQuery(button.dataset.aiQuery || ''));
  });
  parentGrowthReportBody.querySelector('[data-athlete-id]')?.addEventListener('click', () => openAthlete(athlete.id));
  bindReportConversionActions(parentGrowthReportBody);
  bindCopyTextButton(parentGrowthReportHero.querySelector('[data-report-share="parent-growth"]'), () => buildParentGrowthShareText(athlete, model, focusRows, actionRows, signalRows, opponentRows), 'parent-growth', '已复制，可继续申请家庭试用。');
  bindCopyTextButton(parentGrowthReportHero.querySelector('[data-report-share="parent-growth-page"]'), () => buildParentGrowthPageShareText(athlete, model), 'parent-growth-page', '已复制成长页，可直接发给家长。');
}

function openParentGrowthReport(athleteId = '') {
  trackAnalyticsAction('open_report', 'parent-growth');
  renderParentGrowthReport(athleteId);
  const athlete = athleteId ? findAthleteByReference({ id: athleteId }) : getSelectedChild(childCandidates());
  if (athlete?.id) {
    trackReportHistory({
      type: 'parent-growth',
      id: athlete.id,
      title: `${athlete.name} 成长报告`,
      detail: athlete.club || '家长视角',
      typeLabel: '成长报告',
    });
  }
  navigateTo('parentGrowthReport');
}

function renderRoleWorkspaceLegacy() {
  if (!roleWorkspace) return;
  if (!state.userRole) {
    roleWorkspace.innerHTML = `
      <section class="panel role-panel">
        <div class="section-title">
          <h2>先选择你的视角</h2>
          <span>专业分析入口</span>
        </div>
        <div class="role-grid">
          <button type="button" data-role="parent">
            <strong>我是家长</strong>
            <span>看孩子是否进步、是否值得继续投入</span>
          </button>
          <button type="button" data-role="coach">
            <strong>我是教练</strong>
            <span>看学员、成绩提升和留存风险</span>
          </button>
          <button type="button" data-role="club">
            <strong>我是俱乐部负责人</strong>
            <span>看队伍增长、口碑和竞争位置</span>
          </button>
          <button type="button" data-role="data">
            <strong>数据浏览</strong>
            <span>继续按赛事、选手、俱乐部检索</span>
          </button>
        </div>
      </section>
    `;
  } else if (state.userRole === 'parent') {
    roleWorkspace.innerHTML = renderParentWorkspace();
  } else {
    roleWorkspace.innerHTML = `
      <section class="panel role-panel">
        <div class="role-panel-head">
          <div>
            <span>当前角色：${escapeHtml(roleLabel(state.userRole))}</span>
            <strong>${state.userRole === 'coach' ? '教练工作台' : state.userRole === 'club' ? '俱乐部工作台' : '赛事数据'}</strong>
            <em>${state.userRole === 'data' ? '你可以继续使用搜索、筛选和赛事入口。' : '可从赛事、选手和俱乐部数据进入对应分析。'}</em>
          </div>
          <button type="button" data-role-reset>切换角色</button>
        </div>
      </section>
    `;
  }

  roleWorkspace.querySelectorAll('[data-role]').forEach((button) => {
    button.addEventListener('click', () => setUserRole(button.dataset.role));
  });
  roleWorkspace.querySelectorAll('[data-role-reset]').forEach((button) => {
    button.addEventListener('click', () => {
      state.userRole = '';
      state.selectedChildId = '';
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem(CHILD_KEY);
      renderRoleWorkspacePremium();
    });
  });
  roleWorkspace.querySelectorAll('[data-child-id]').forEach((button) => {
    button.addEventListener('click', () => setSelectedChild(button.dataset.childId));
  });
  roleWorkspace.querySelectorAll('[data-athlete-id]').forEach((button) => {
    button.addEventListener('click', () => openAthlete(button.dataset.athleteId));
  });
  roleWorkspace.querySelectorAll('[data-parent-growth-athlete-id]').forEach((button) => {
    button.addEventListener('click', () => openParentGrowthReport(button.dataset.parentGrowthAthleteId));
  });
}

function renderParentDashboard() {
  if (!parentDashboard) return;
  parentDashboard.innerHTML = renderParentWorkspace();
  parentDashboard.querySelectorAll('[data-role-reset]').forEach((button) => {
    button.addEventListener('click', () => {
      state.userRole = '';
      state.selectedChildId = '';
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem(CHILD_KEY);
      state.viewStack = ['roleHome'];
      state.activeMainTab = '';
      renderRoleWorkspacePremium();
      showView('roleHome');
      scrollToPageTop();
    });
  });
  parentDashboard.querySelectorAll('[data-child-id]').forEach((button) => {
    button.addEventListener('click', () => setSelectedChild(button.dataset.childId));
  });
  parentDashboard.querySelectorAll('[data-athlete-id]').forEach((button) => {
    button.addEventListener('click', () => openAthlete(button.dataset.athleteId));
  });
  parentDashboard.querySelectorAll('[data-parent-growth-athlete-id]').forEach((button) => {
    button.addEventListener('click', () => openParentGrowthReport(button.dataset.parentGrowthAthleteId));
  });
}

function renderRoleWorkspaceHome() {
  if (!roleWorkspace) return;
  roleWorkspace.innerHTML = `
    <section class="panel role-panel role-home-panel">
      <div class="role-hero">
        <strong>选择工作台</strong>
        <p>面向击剑训练、竞赛与成长决策的分析系统。</p>
      </div>
      <div class="role-grid">
        <button type="button" data-role="parent">
          <strong>我是家长</strong>
          <span>看孩子长期成长、是否进步、是否值得继续投入</span>
        </button>
        <button type="button" data-role="coach">
          <strong>我是教练</strong>
          <span>看学员池、成绩提升、留存风险和招生亮点</span>
        </button>
        <button type="button" data-role="club">
          <strong>我是俱乐部负责人</strong>
          <span>看队伍增长、口碑位置和区域竞争</span>
        </button>
        <button type="button" data-role="data">
          <strong>只看比赛成绩</strong>
          <span>进入赛事、选手、俱乐部的数据浏览页面</span>
        </button>
      </div>
    </section>
  `;

  roleWorkspace.querySelectorAll('[data-role]').forEach((button) => {
    button.addEventListener('click', () => setUserRole(button.dataset.role));
  });
}

function renderRoleWorkspacePremium() {
  if (!roleWorkspace) return;
  roleWorkspace.innerHTML = `
    <section class="panel role-panel role-home-panel">
      <div class="role-hero">
        <strong>选择工作台</strong>
        <p>面向击剑训练、竞赛与成长决策的分析系统。</p>
      </div>
      <div class="role-grid">
        <button type="button" data-role="parent">
          <strong>家长工作台</strong>
          <span>成长趋势、阶段建议、对手分析</span>
        </button>
        <button type="button" data-role="coach">
          <strong>教练工作台</strong>
          <span>学员表现、训练反馈、留存线索</span>
        </button>
        <button type="button" data-role="club">
          <strong>俱乐部工作台</strong>
          <span>队伍增长、成绩资产、区域位置</span>
        </button>
        <button type="button" data-role="data">
          <strong>赛事数据</strong>
          <span>比赛、选手、俱乐部检索</span>
        </button>
      </div>
    </section>
  `;

  roleWorkspace.querySelectorAll('[data-role]').forEach((button) => {
    button.addEventListener('click', () => setUserRole(button.dataset.role));
  });
}

function focusAthleteCards() {
  return (state.followedAthletes || []).map((follow) => {
    const athlete = resolveAthleteReference(follow);
    const events = athlete.events || [];
    const latest = events[0] || {};
    const best = [...events].sort((a, b) => (a.finalRank ?? 999) - (b.finalRank ?? 999))[0] || {};
    return {
      ...follow,
      ...athlete,
      latest,
      best,
      summary: latest.eventName
        ? `最近：${displayEventName(latest)}第 ${latest.finalRank ?? '-'} 名`
        : followAthleteHint(athlete),
      detail: best.eventName
        ? `最好：${displayEventName(best)}第 ${best.finalRank ?? '-'} 名`
        : `${athlete.appearances || follow.appearances || 0} 次记录`,
    };
  }).filter((athlete) => athlete.id);
}

function followedCompetitionCards() {
  return (state.followedCompetitions || []).map((follow) => {
    const live = findCompetitionBySportCode(follow.sportCode);
    return competitionSnapshot({ ...follow, ...(live || {}) });
  }).filter((competition) => competition.sportCode);
}

function focusSuggestionCompetitions() {
  const followed = new Set((state.followedCompetitions || []).map((item) => item.sportCode));
  return prematchReportCompetitions()
    .filter((competition) => competition?.sportCode && !followed.has(competition.sportCode))
    .slice(0, 6);
}

function focusCompetitionPriorityRows(competitions) {
  return [...(competitions || [])]
    .map((competition) => {
      const days = daysFromToday(competitionDateValue(competition));
      const timing = days === 0 ? '今天' : days > 0 && days <= 30 ? `${days} 天后` : days < 0 && days >= -14 ? `${Math.abs(days)} 天前` : statusLabel(competition.status);
      const level = competitionCoverageLevel(competition);
      const action = level === 'roster'
        ? '可看报名名单和潜在对手'
        : level === 'score'
          ? '可复盘成绩和晋级路径'
          : '先关注项目和赛程';
      return {
        ...competition,
        days,
        timing,
        action,
      };
    })
    .sort((a, b) => Math.abs(a.days) - Math.abs(b.days) || String(a.sportName).localeCompare(String(b.sportName), 'zh-CN'))
    .slice(0, 3);
}

function myPageRow(row) {
  const subtitle = row.type === 'competition'
    ? `${displayDateLabel(row.dateLabel)} · ${row.venue || '地点待确认'}`
    : row.meta || '';
  const label = row.type === 'competition' ? '赛事' : row.type === 'athlete' ? '选手' : '俱乐部';
  return `
    <button type="button" class="my-list-row" data-type="${escapeHtml(row.type)}" data-id="${escapeHtml(row.id)}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(row.title)}</strong>
      <em>${escapeHtml(subtitle)}</em>
    </button>
  `;
}

function bindPersonalList(container) {
  if (!container) return;
  container.querySelectorAll('[data-athlete-id]').forEach((button) => {
    button.addEventListener('click', () => openAthlete(button.dataset.athleteId));
  });
  container.querySelectorAll('.my-list-row').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.type === 'competition') openCompetition(button.dataset.id);
      if (button.dataset.type === 'athlete') openAthlete(button.dataset.id);
      if (button.dataset.type === 'club') openClub(button.dataset.id);
    });
  });
  container.querySelectorAll('[data-focus-competition]').forEach((button) => {
    button.addEventListener('click', () => openCompetition(button.dataset.focusCompetition));
  });
  container.querySelectorAll('[data-focus-prematch]').forEach((button) => {
    button.addEventListener('click', () => openPrematchReport('prematch-pack', button.dataset.focusPrematch || ''));
  });
  container.querySelectorAll('[data-focus-follow]').forEach((button) => {
    button.addEventListener('click', () => {
      const competition = findCompetitionBySportCode(button.dataset.focusFollow);
      if (!competition?.sportCode) return;
      upsertFollowedCompetition(competition);
      renderPersonalPages();
    });
  });
}

function homeReportCenterRows(children, followedCompetitions) {
  const prematch = (followedCompetitions || []).find(isPrematchCompetition)
    || prematchReportCompetitions()[0]
    || null;
  const child = getSelectedChild() || children?.[0] || null;
  const club = state.currentClub || aiDefaultClub();
  return [
    {
      key: 'prematch',
      title: '赛前情报包',
      detail: prematch ? `${prematch.sportName || '近期赛事'} · ${displayDateLabel(prematch.dateLabel)}` : '近期报名和未开赛赛事',
      meta: prematch ? statusLabel(prematch.status) : '赛前准备',
      disabled: false,
      sportCode: prematch?.sportCode || '',
    },
    {
      key: 'growth',
      title: '成长报告',
      detail: child ? `${child.name} · ${child.club || '个人'}` : '关注孩子后自动生成',
      meta: child ? '家长视角' : '待关注',
      disabled: !child,
      athleteId: child?.id || '',
    },
    {
      key: 'coach',
      title: '学员分层报告',
      detail: club ? `${club.club} · 教练视角` : '进入俱乐部后生成',
      meta: club ? '训练与留存' : '待选择',
      disabled: !club,
      clubId: club?.id || '',
    },
    {
      key: 'club-recruiting',
      title: '招生展示',
      detail: club ? `${club.club} · 对外成绩名片和沟通话术` : '进入俱乐部后生成',
      meta: club ? '增长转化' : '待选择',
      disabled: !club,
      query: club?.club ? `${club.club}招生怎么讲` : '',
    },
  ];
}

function reportHistoryRows() {
  return (state.reportHistory || []).slice(0, 4).map((row) => {
    const fallback = {
      title: row.title || '报告',
      detail: row.detail || '点击继续查看',
      typeLabel: row.typeLabel || '报告',
    };
    if (row.type === 'parent-growth') {
      const athlete = findAthleteByReference({ id: row.id });
      return {
        ...fallback,
        ...row,
        title: athlete?.name ? `${athlete.name} 成长报告` : fallback.title,
        detail: athlete?.club || row.detail || '家长视角',
        typeLabel: '成长报告',
      };
    }
    if (row.type === 'coach-segmentation') {
      const club = findClubById(row.id);
      return {
        ...fallback,
        ...row,
        title: club?.club ? `${club.club} 学员分层` : fallback.title,
        detail: row.detail || '教练视角',
        typeLabel: '教练报告',
      };
    }
    if (row.type === 'prematch') {
      const competition = findCompetitionBySportCode(row.id);
      return {
        ...fallback,
        ...row,
        title: competition?.sportName || fallback.title,
        detail: [competition?.venue, displayDateLabel(competition?.dateLabel)].filter(Boolean).join(' · ') || row.detail || '赛前情报',
        typeLabel: '赛前情报',
      };
    }
    if (row.type === 'ai-report') {
      return {
        ...fallback,
        ...row,
        title: row.title || fallback.title,
        detail: row.detail || row.query || '点击继续查看这份分析',
        typeLabel: row.typeLabel || 'AI报告',
      };
    }
    return fallback;
  });
}

function reportNextActionRows(reportHistory = reportHistoryRows()) {
  return (reportHistory || []).slice(0, 3).map((row) => {
    const base = {
      ...row,
      actionLabel: '继续查看',
      trialLabel: '申请试用',
      reminderLabel: '',
      source: 'my-report-next-action',
      next: '打开报告后，可继续沉淀后续动作。',
    };
    if (row.type === 'prematch') {
      return {
        ...base,
        actionLabel: '查看赛前情报',
        trialLabel: '申请赛前试用',
        reminderLabel: '订阅提醒',
        next: '赛前节点明确，适合继续订阅提醒并补齐报名名单。',
      };
    }
    if (row.type === 'parent-growth') {
      return {
        ...base,
        actionLabel: '查看成长报告',
        trialLabel: '申请家庭试用',
        next: '成长报告适合持续记录，形成月度或年度复盘。',
      };
    }
    if (row.type === 'coach-segmentation') {
      return {
        ...base,
        actionLabel: '查看教练报告',
        trialLabel: '申请教练试用',
        next: '教练报告适合继续拆分学员层级、备赛重点和招生展示。',
      };
    }
    if (row.type === 'ai-report') {
      return {
        ...base,
        actionLabel: '继续追问',
        trialLabel: '申请分析试用',
        next: '把高频问题沉淀成固定报告，后续可直接复用。',
      };
    }
    return base;
  });
}

function aiHistoryRows() {
  return (state.aiHistory || []).slice(0, 4).filter((row) => row?.query).map((row) => ({
    query: row.query,
    title: row.title || row.query,
    summary: row.summary || '点击继续查看这次分析',
    typeLabel: row.typeLabel || aiHistoryTypeLabel(row.type),
  }));
}

function reportAssetSummaryRows(reportHistory = state.reportHistory || [], aiHistory = state.aiHistory || []) {
  const countByType = (type) => reportHistory.filter((row) => row?.type === type).length;
  return [
    {
      key: 'prematch',
      label: '赛前情报',
      value: countByType('prematch'),
      detail: '报名与项目数据完善后，沉淀赛前对手分析。',
    },
    {
      key: 'growth',
      label: '成长报告',
      value: countByType('parent-growth'),
      detail: '持续记录孩子的参赛、名次和阶段变化。',
    },
    {
      key: 'coach',
      label: '教练报告',
      value: countByType('coach-segmentation'),
      detail: '保留学员分层、重点项目和经营观察。',
    },
    {
      key: 'ai',
      label: 'AI分析',
      value: aiHistory.filter((row) => row?.query).length + countByType('ai-report'),
      detail: '把常问问题和数据解读沉淀为可复用记录。',
    },
  ];
}

function membershipBenefitRows() {
  return [
    {
      title: '家庭成长跟踪',
      detail: '持续保存成长报告、阶段建议和近期比赛提醒，方便复盘投入效果。',
    },
    {
      title: '赛前情报',
      detail: '围绕关注选手和报名赛事，整理潜在对手、强手和备赛重点。',
    },
    {
      title: '教练与剑馆',
      detail: '沉淀学员分层、续费沟通和招生展示素材，支撑日常经营。',
    },
  ];
}

function renderMembershipBenefits() {
  return `
    <section class="panel my-section membership-benefit-panel">
      <div class="section-title">
        <h2>会员权益</h2>
        <span>持续使用</span>
      </div>
      <p>把成长报告、赛前情报和教练工作台集中保存，关键比赛前可以直接继续分析。</p>
      <div class="membership-benefit-grid">
        ${membershipBenefitRows().map((row) => `
          <article class="membership-benefit-card">
            <strong>${escapeHtml(row.title)}</strong>
            <span>${escapeHtml(row.detail)}</span>
          </article>
        `).join('')}
      </div>
      <div class="membership-benefit-actions">
        <button type="button" data-commercial-intent="membership" data-commercial-source="my-membership" data-report-title="会员权益">了解会员权益</button>
        <button type="button" data-commercial-intent="pilot" data-commercial-source="my-membership" data-report-title="会员权益">申请试用</button>
      </div>
    </section>
  `;
}

function homeDataValueRows() {
  const prematch = prematchReportCompetitions()[0];
  const child = focusAthleteCards()[0];
  const club = state.currentClub || aiDefaultClub();
  return [
    {
      key: 'prematch-pack',
      label: '赛前情报',
      title: '赛前情报包',
      detail: prematch ? `${prematch.sportName} · ${displayDateLabel(prematch.dateLabel)}` : '按报名和近期赛事生成备赛重点',
      query: prematch ? `${prematch.sportName}赛前情报包` : '生成赛前情报包',
    },
    {
      key: 'parent-growth',
      label: '家长决策',
      title: '成长报告',
      detail: child ? `${child.name} · ${child.summary}` : '关注孩子后生成成长趋势和投入判断',
      query: child ? `${child.name}最近几场有没有进步` : '生成家长成长报告方案',
    },
    {
      key: 'coach-growth',
      label: '教练经营',
      title: '学员与项目分析',
      detail: club?.club ? `${club.club} · 项目优势和学员分层` : '按俱乐部表现生成经营重点',
      query: club?.club ? `${club.club}有哪些优势项目` : '生成教练学员分层报告',
    },
    {
      key: 'business-insight',
      label: '产品机会',
      title: '数据商业价值',
      detail: '把赛事、选手和俱乐部数据转成可售卖报告和提醒',
      query: '这些击剑数据能产生什么商业价值',
    },
  ];
}

function homeAiQuestionRows() {
  const prematch = prematchReportCompetitions()[0];
  const child = focusAthleteCards()[0];
  const club = state.currentClub || aiDefaultClub();
  const region = detectRegionInQuery(prematch?.venue || prematch?.region || '') || prematch?.region || '天津';
  const year = prematch?.season || detectYearInQuery(prematch?.sportName || '') || new Date().getFullYear();
  return [
    {
      label: '赛事统计',
      query: `${year}年${region}有几场比赛`,
      detail: '按年份、城市、状态直接统计赛事机会。',
    },
    {
      label: '赛前准备',
      query: prematch ? `${prematch.sportName}赛前情报包` : '天津近期报名情况',
      detail: '报名和未开赛阶段，先看项目、名单和强手线索。',
    },
    {
      label: '成长判断',
      query: child ? `${child.name}最近几场有没有进步` : '蔡廷彧最近几场有没有进步',
      detail: '把参赛连续性、名次变化和小组表现放在一起看。',
    },
    {
      label: '教练经营',
      query: club?.club ? `${club.club}招生怎么讲` : '山东小众体育招生怎么讲',
      detail: '把俱乐部成绩资产转成家长能理解的展示素材。',
    },
  ];
}

function commercialInterestContextRows(context = {}) {
  const children = focusAthleteCards().slice(0, 3);
  const competitions = followedCompetitionCards().slice(0, 3);
  const club = state.currentClub || aiDefaultClub();
  const reports = (state.reportHistory || []).slice(0, 2);
  const aiRows = (state.aiHistory || []).slice(0, 2);
  const followCopy = myFollowSectionCopy();
  return [
    children.length ? `${followCopy.contextLabel}：${children.map((athlete) => [athlete.name, athlete.club].filter(Boolean).join('/')).join('、')}` : '',
    competitions.length ? `关注赛事明细：${competitions.map((competition) => competition.sportName || competition.title).filter(Boolean).join('、')}` : '',
    club?.club ? `当前俱乐部：${club.club}` : '',
    reports.length ? `最近报告明细：${reports.map((row) => row.title || row.typeLabel).filter(Boolean).join('、')}` : '',
    aiRows.length ? `最近AI问题：${aiRows.map((row) => row.query || row.title).filter(Boolean).join('、')}` : '',
    context.sharedSource ? `分享来源：${context.sharedSource}` : '',
    context.sharedId ? `分享对象ID：${context.sharedId}` : '',
    context.sportCode ? `关联赛事ID：${context.sportCode}` : '',
    context.athleteId ? `关联选手ID：${context.athleteId}` : '',
    context.clubId ? `关联俱乐部ID：${context.clubId}` : '',
  ].filter(Boolean);
}

function sourceMatchesSharedEntry(source = '', entry = state.sharedEntry) {
  if (!entry?.kind) return false;
  if (entry.kind === 'parent-growth') return /parent|growth/.test(source);
  if (entry.kind === 'prematch') return /prematch/.test(source);
  if (entry.kind === 'coach-segmentation') return /coach|club|segmentation/.test(source);
  return false;
}

function enrichSharedCommercialContext(context = {}) {
  if (!sourceMatchesSharedEntry(context.source || '')) return context;
  return {
    ...context,
    sharedSource: state.sharedEntry.kind,
    sharedId: state.sharedEntry.id || '',
  };
}

function commercialInterestMessage(context = {}) {
  return [
    `当前角色：${state.userRole || '未选择'}`,
    context.source ? `来源页面：${context.source}` : '',
    context.report ? `触发报告：${context.report}` : '',
    context.contact ? `联系方式：${context.contact}` : '',
    `${myFollowSectionCopy().countLabel}：${state.followedAthletes.length}`,
    `关注赛事：${state.followedCompetitions.length}`,
    `最近报告：${state.reportHistory.length}`,
    `最近 AI 分析：${state.aiHistory.length}`,
    ...commercialInterestContextRows(context),
  ].filter(Boolean);
}

function storedCommercialContact() {
  return localStorage.getItem(COMMERCIAL_CONTACT_KEY) || '';
}

function saveCommercialContact(contact) {
  const cleaned = String(contact || '').trim();
  if (cleaned) localStorage.setItem(COMMERCIAL_CONTACT_KEY, cleaned);
  return cleaned;
}

function requestCommercialContact(context = {}) {
  const existing = storedCommercialContact();
  const label = context.report || '试用';
  const input = window.prompt(`留下微信或手机号，方便发送${label}说明（可跳过）`, existing);
  if (input === null) return existing;
  return saveCommercialContact(input);
}

function commercialIntentTypeLabel(type) {
  if (type === 'membership-interest') return '会员权益';
  if (type === 'reminder-interest') return '提醒订阅';
  return '试用合作';
}

function commercialIntentSourceLabel(source) {
  const labels = {
    'home-pilot': '首页试用',
    'member-panel': '会员入口',
    'my-membership': '我的页',
    'my-next-action': '下一步',
    'my-report-next-action': '最近报告下一步',
    'my-report-next-reminder': '最近报告提醒',
    'focus-workspace': '关注提醒',
    'focus-reminder': '关注页提醒',
    'my-prematch-reminder': '我的页赛前提醒',
    'parent-growth-report': '成长报告',
    'parent-growth-reminder': '成长复盘提醒',
    'prematch-pack-report': '赛前情报',
    'prematch-single-report': '单场赛前',
    'prematch-report-reminder': '赛前更新提醒',
    'coach-segmentation-report': '教练报告',
    'coach-segmentation-reminder': '学员跟进提醒',
  };
  return labels[source] || source || '服务入口';
}

function commercialIntentRows() {
  return (state.commercialIntents || []).slice(0, 4).map((row) => ({
    ...row,
    typeLabel: commercialIntentTypeLabel(row.type),
    sourceLabel: commercialIntentSourceLabel(row.source),
    timeLabel: formatDataGeneratedAt(row.submittedAt),
    referenceLabel: row.feedbackId ? `服务编号 ${String(row.feedbackId).slice(-8)}` : '本机已记录',
    contactLabel: row.contact ? '联系方式已留存' : '可补充联系方式',
    nextStep: commercialIntentNextStep(row),
    deliverables: commercialIntentDeliverableRows(row),
    progressSteps: commercialIntentProgressSteps(row),
  }));
}

function commercialIntentNextStep(row = {}) {
  const source = row.source || '';
  const report = row.report || '';
  if (row.type === 'reminder-interest' || /reminder|提醒/.test(source) || /提醒|订阅/.test(report)) return '下一步会按你关注的赛事和选手确认提醒范围。';
  if (/prematch/.test(source) || /赛前|对手/.test(report)) return '下一步会围绕目标赛事、报名名单和关注选手整理赛前提醒。';
  if (/growth|parent/.test(source) || /成长|家庭|家长/.test(report)) return '下一步会围绕关注孩子整理成长报告和近期比赛复盘。';
  if (/coach|club|recruiting|segmentation/.test(source) || /教练|剑馆|俱乐部|招生|学员/.test(report)) return '下一步会围绕学员分层、优势项目和招生素材整理试用说明。';
  if (row.type === 'membership-interest') return '下一步会确认关注选手、赛事提醒和报告保存需求。';
  return '下一步会结合你关注的选手、赛事和报告记录确认试用场景。';
}

function commercialIntentDeliverableRows(row = {}) {
  const source = row.source || '';
  const report = row.report || '';
  if (row.type === 'reminder-interest' || /reminder|提醒/.test(source) || /提醒|订阅/.test(report)) {
    return ['提醒对象与时间节点', '名单或赛程变化提示', '赛前查看入口'];
  }
  if (/prematch/.test(source) || /赛前|对手/.test(report)) {
    return ['目标赛事与项目范围', '报名名单和重点对手', '赛前准备清单'];
  }
  if (/growth|parent/.test(source) || /成长|家庭|家长/.test(report)) {
    return ['阶段成长结论', '参赛和名次变化', '下一场准备建议'];
  }
  if (/coach|club|recruiting|segmentation/.test(source) || /教练|剑馆|俱乐部|招生|学员/.test(report)) {
    return ['学员分层', '优势项目和短板', '家长沟通与招生素材'];
  }
  if (row.type === 'membership-interest') {
    return ['关注对象配置', '报告保存权益', '赛事提醒范围'];
  }
  return ['目标对象确认', '样例报告整理', '后续提醒范围'];
}

function commercialIntentProgressSteps(row = {}) {
  return [
    { label: '已收到', state: 'done' },
    { label: row.contact ? '信息已确认' : '待补充信息', state: row.contact ? 'done' : 'active' },
    { label: row.type === 'membership-interest' ? '确认权益' : row.type === 'reminder-interest' ? '确认提醒' : '生成样例', state: 'pending' },
  ];
}

function trackCommercialIntent(type, context = {}, result = {}) {
  const source = context.source || state.userRole || 'visitor';
  const report = context.report || commercialIntentTypeLabel(type);
  const key = `${type}:${source}:${report}`;
  state.commercialIntents = [
    {
      key,
      type,
      source,
      report,
      contact: context.contact || '',
      sharedSource: context.sharedSource || '',
      sharedId: context.sharedId || '',
      feedbackId: result.id || '',
      submittedAt: Date.now(),
    },
    ...(state.commercialIntents || []).filter((row) => row.key !== key),
  ].slice(0, 10);
  saveStoredList(COMMERCIAL_INTENT_KEY, state.commercialIntents, 10);
}

function renderCommercialIntentStatus(rows = commercialIntentRows()) {
  if (!rows.length) return '';
  return `
    <section class="panel my-section service-progress-panel">
      <div class="section-title">
        <h2>服务进度</h2>
        <span>已提交</span>
      </div>
      <div class="service-progress-list">
        ${rows.map((row) => `
          <article class="service-progress-card">
            <div>
              <strong>${escapeHtml(row.report || row.typeLabel)}</strong>
              <span>${escapeHtml(row.typeLabel)} · ${escapeHtml(row.sourceLabel)}</span>
            </div>
            <em>${escapeHtml(row.timeLabel || '刚刚提交')}</em>
            <small>${escapeHtml(row.contactLabel)}</small>
            <small class="service-progress-reference">${escapeHtml(row.referenceLabel)}</small>
            <p>${escapeHtml(row.nextStep)}</p>
            <ul class="service-progress-deliverables">
              ${(row.deliverables || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
            <ol class="service-progress-steps">
              ${(row.progressSteps || []).map((step) => `
                <li class="service-step-${escapeHtml(step.state)}">${escapeHtml(step.label)}</li>
              `).join('')}
            </ol>
            <button type="button" data-service-progress-action="${escapeHtml(row.type || '')}" data-service-progress-source="${escapeHtml(row.source || '')}" data-report-title="${escapeHtml(row.report || row.typeLabel)}">${escapeHtml(row.contact ? '更新需求' : '补充联系方式')}</button>
          </article>
        `).join('')}
      </div>
      <p>${escapeHtml(serviceProgressContextNote())}</p>
    </section>
  `;
}

function serviceProgressContextNote() {
  const followCopy = myFollowSectionCopy();
  return `已收到的服务申请会结合你的${followCopy.countLabel}、赛事和报告记录跟进；需要更新联系方式时，可以再次点击申请入口。`;
}

function bindServiceProgressActions(container) {
  container.querySelectorAll('[data-service-progress-action]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const context = {
        source: button.dataset.serviceProgressSource || 'service-progress',
        report: button.dataset.reportTitle || '服务进度',
      };
      if (button.dataset.serviceProgressAction === 'membership-interest') {
        submitMembershipInterest(event.currentTarget, context);
        return;
      }
      if (button.dataset.serviceProgressAction === 'reminder-interest') {
        submitReminderInterest(event.currentTarget, context);
        return;
      }
      submitPilotInterest(event.currentTarget, context);
    });
  });
}

function serviceReadinessRows({ children = [], followedCompetitions = [], reportHistory = [], aiHistory = [] } = {}) {
  const prematch = (followedCompetitions || []).find(isPrematchCompetition) || prematchReportCompetitions()[0] || null;
  const activeCount = (state.competitions || []).filter((competition) => ['registration', 'upcoming', 'live'].includes(competition.status) || competition.isPreEvent).length;
  const rosterCount = (state.competitions || []).filter((competition) => competition.rosterStatus === 'partial' || competition.rosterStatus === 'complete').length;
  const child = children[0] || null;
  const club = state.currentClub || aiDefaultClub();
  const savedCount = reportHistory.length + aiHistory.length;
  return [
    {
      key: 'prematch',
      title: '赛前情报包',
      status: prematch ? '可启动' : '待赛事',
      tone: prematch ? 'ready' : 'pending',
      detail: prematch
        ? `${prematch.sportName} 可先看项目、报名和强手线索。`
        : `${activeCount} 场近期/报名赛事会优先进入赛前服务。`,
      meta: `${rosterCount} 场已有报名名单`,
      action: prematch ? 'prematch' : 'ask',
      sportCode: prematch?.sportCode || '',
      query: '近期哪些比赛适合做赛前情报包',
    },
    {
      key: 'growth',
      title: '成长报告',
      status: child ? '可生成' : '先关注孩子',
      tone: child ? 'ready' : 'pending',
      detail: child
        ? `${child.name} 已可生成长期成长和阶段复盘。`
        : '关注孩子后，成长、对手和近期比赛会自动围绕他组织。',
      meta: `${children.length} 名关注选手`,
      action: child ? 'growth' : 'ask',
      athleteId: child?.id || '',
      query: '如何为孩子建立击剑成长报告',
    },
    {
      key: 'coach',
      title: '教练/俱乐部分析',
      status: club?.id ? '可分析' : '先搜索俱乐部',
      tone: club?.id ? 'ready' : 'pending',
      detail: club?.club
        ? `${club.club} 可继续看学员分层、优势项目和招生展示。`
        : '搜索俱乐部后，可生成学员分层和经营观察。',
      meta: `${entityCoverageCounts().clubs} 个俱乐部画像`,
      action: club?.id ? 'coach' : 'ask',
      clubId: club?.id || '',
      query: '山东小众体育有哪些优势项目',
    },
    {
      key: 'archive',
      title: '报告复用',
      status: savedCount ? '已沉淀' : '待生成',
      tone: savedCount ? 'ready' : 'pending',
      detail: savedCount
        ? '已有报告和问答记录，可继续追问、复看和申请试用。'
        : '生成报告或提问后，会沉淀为可复看的分析资产。',
      meta: `${savedCount} 条可复用记录`,
      action: 'ask',
      query: '这些击剑数据能产生什么商业价值',
    },
  ];
}

function recommendedTrialRows({ children = [], followedCompetitions = [], reportHistory = [], aiHistory = [] } = {}) {
  const prematch = (followedCompetitions || []).find(isPrematchCompetition) || prematchReportCompetitions()[0] || null;
  const child = children[0] || null;
  const club = state.currentClub || aiDefaultClub();
  const savedCount = reportHistory.length + aiHistory.length;
  const rows = [];
  if (prematch?.sportCode) {
    rows.push({
      key: 'prematch-trial',
      title: '赛前情报试用',
      detail: `${prematch.sportName}：围绕项目、报名名单和潜在强手生成赛前提醒。`,
      scope: displayDateLabel(prematch.dateLabel) || statusLabel(prematch.status),
      source: 'my-trial-prematch',
    });
  }
  if (child?.id) {
    rows.push({
      key: 'growth-trial',
      title: '家庭成长试用',
      detail: `${child.name}：按月复盘参赛、名次变化、同龄段位置和下一场建议。`,
      scope: child.summary || child.detail || '关注孩子',
      source: 'my-trial-growth',
    });
  }
  if (club?.id) {
    rows.push({
      key: 'coach-trial',
      title: '教练经营试用',
      detail: `${club.club}：整理学员分层、优势项目、续费沟通和招生展示素材。`,
      scope: `${club.entrants || 0} 人次 · 前八 ${club.top8 || 0}`,
      source: 'my-trial-coach',
    });
  }
  rows.push({
    key: 'archive-trial',
    title: '长期报告试用',
    detail: savedCount
      ? '把已经生成的报告和 AI 问答沉淀为可持续复看的分析资产。'
      : '先从一次赛前情报、成长报告或教练报告开始沉淀。',
    scope: `${savedCount} 条已保存记录`,
    source: 'my-trial-archive',
  });
  return rows.slice(0, 3);
}

function trialDeliverableRows() {
  const children = focusAthleteCards();
  const followedCompetitions = followedCompetitionCards();
  const prematch = (followedCompetitions || []).find(isPrematchCompetition) || prematchReportCompetitions()[0] || null;
  const child = children[0] || null;
  const club = state.currentClub || aiDefaultClub();
  const activeCount = (state.competitions || []).filter((competition) => ['registration', 'upcoming', 'live'].includes(competition.status) || competition.isPreEvent).length;
  const rosterCount = (state.competitions || []).filter((competition) => competition.rosterStatus === 'partial' || competition.rosterStatus === 'complete').length;
  const reportCount = (state.reportHistory || []).length + (state.aiHistory || []).length;
  return [
    {
      key: 'prematch',
      label: '赛前',
      title: '赛前情报包',
      status: prematch ? '可交付' : '待选择赛事',
      tone: prematch ? 'ready' : 'pending',
      detail: prematch
        ? `${prematch.sportName} 已可生成赛前项目、报名名单和强手线索。`
        : `${activeCount} 场赛前/报名赛事可作为备选，先选择目标赛事。`,
      next: prematch
        ? `先生成本场情报包，后续订阅报名和重点对手更新。`
        : `已有 ${rosterCount} 场赛事带报名数据，可先从近期赛事开始。`,
      action: prematch ? 'prematch' : 'ask',
      sportCode: prematch?.sportCode || '',
      query: '近期哪些比赛适合做赛前情报包',
    },
    {
      key: 'growth',
      label: '成长',
      title: '家庭成长报告',
      status: child ? '可交付' : '待关注孩子',
      tone: child ? 'ready' : 'pending',
      detail: child
        ? `${child.name} 已可生成成长复盘、名次变化和下一场建议。`
        : '关注孩子后，成长报告会围绕他的比赛记录和后续赛事生成。',
      next: child
        ? `先生成 ${child.name} 的完整成长报告，再订阅赛后复盘提醒。`
        : '先在搜索中关注孩子，避免报告出现无关选手。',
      action: child ? 'growth' : 'ask',
      athleteId: child?.id || '',
      query: '如何为孩子建立击剑成长报告',
    },
    {
      key: 'coach',
      label: '教练',
      title: '教练经营包',
      status: club?.id ? '可交付' : '待选择俱乐部',
      tone: club?.id ? 'ready' : 'pending',
      detail: club?.club
        ? `${club.club} 已可生成学员分层、优势项目和招生展示素材。`
        : '选择俱乐部后，可生成教练视角的队伍经营和学员跟进材料。',
      next: club?.id
        ? `先生成 ${club.club} 的教练工作台，再订阅学员跟进提醒。`
        : '先搜索俱乐部，系统会围绕该馆生成经营视角。',
      action: club?.id ? 'coach' : 'ask',
      clubId: club?.id || '',
      query: '山东小众体育有哪些优势项目',
    },
    {
      key: 'asset',
      label: '留存',
      title: '报告资产沉淀',
      status: reportCount ? '已沉淀' : '待生成',
      tone: reportCount ? 'ready' : 'pending',
      detail: reportCount
        ? `已有 ${reportCount} 条报告/问答记录，可继续复看和追问。`
        : '生成赛前情报、成长报告或教练报告后，会沉淀为可复用资产。',
      next: reportCount
        ? '优先把高频报告订阅成提醒，减少重复搜索。'
        : '先完成一份赛前、成长或教练报告，形成第一条可复用记录。',
      action: 'ask',
      query: '这些击剑数据能产生什么商业价值',
    },
  ];
}

function myFollowSectionCopy() {
  if (state.userRole === 'coach') {
    return {
      title: '关注学员',
      statLabel: '关注学员',
      contextLabel: '关注学员明细',
      countLabel: '关注学员',
      activeLabel: '学员入口',
      emptyLabel: '待关注学员',
      heroReady: '已选择重点关注学员',
      heroEmpty: '可从选手详情页关注学员',
      emptyTitle: '还没有关注学员',
      emptyDetail: '进入选手详情页后，可把重点学员加入这里，后续用于成长报告、赛前提醒和训练反馈。',
    };
  }
  if (state.userRole === 'club') {
    return {
      title: '代表选手',
      statLabel: '代表选手',
      contextLabel: '代表选手明细',
      countLabel: '代表选手',
      activeLabel: '队伍入口',
      emptyLabel: '待关注选手',
      heroReady: '已选择重点代表选手',
      heroEmpty: '可从选手详情页关注代表选手',
      emptyTitle: '还没有代表选手',
      emptyDetail: '关注俱乐部代表选手后，这里会沉淀成绩案例、成长报告和对外展示素材。',
    };
  }
  if (state.userRole === 'data') {
    return {
      title: '关注选手',
      statLabel: '关注选手',
      contextLabel: '关注选手明细',
      countLabel: '关注选手',
      activeLabel: '快速入口',
      emptyLabel: '待关注',
      heroReady: '已选择重点关注选手',
      heroEmpty: '可从选手详情页设置关注',
      emptyTitle: '还没有关注选手',
      emptyDetail: '进入选手详情页后，可把常看的选手加入这里。',
    };
  }
  return {
    title: '我的孩子',
    statLabel: '我的孩子',
    contextLabel: '关注孩子明细',
    countLabel: '关注孩子',
    activeLabel: '成长入口',
    emptyLabel: '待关注',
    heroReady: '已选择重点关注孩子',
    heroEmpty: '可从选手详情页设置关注',
    emptyTitle: '还没有关注选手',
    emptyDetail: '进入选手详情页后，可把孩子加入这里，后续用于成长报告和赛前提醒。',
  };
}

function myPrematchReminderRows(followedCompetitions = []) {
  const followedCodes = new Set((followedCompetitions || []).map((competition) => competition.sportCode).filter(Boolean));
  const followedRows = (followedCompetitions || [])
    .filter((competition) => competition?.sportCode && isPrematchCompetition(competition))
    .map((competition) => ({ ...competition, isFollowed: true }));
  const suggestedRows = prematchReportCompetitions()
    .filter((competition) => competition?.sportCode && !followedCodes.has(competition.sportCode))
    .slice(0, 4)
    .map((competition) => ({ ...competition, isFollowed: false }));

  return [...followedRows, ...suggestedRows]
    .sort((a, b) => {
      const aDays = Math.abs(daysFromToday(competitionDateValue(a)));
      const bDays = Math.abs(daysFromToday(competitionDateValue(b)));
      return aDays - bDays;
    })
    .slice(0, 3)
    .map((competition) => {
      const hasRoster = competitionCoverageLevel(competition) === 'roster';
      return {
        sportCode: competition.sportCode,
        title: competition.sportName || '近期赛事',
        tag: competition.isFollowed ? '已关注' : '建议关注',
        detail: [displayDateLabel(competition.dateLabel), competition.venue || competition.region, statusLabel(competition.status)].filter(Boolean).join(' · '),
        meta: hasRoster ? '可看报名名单和潜在对手' : '先看项目、时间和历史强手',
        isFollowed: Boolean(competition.isFollowed),
      };
    });
}

function homePrematchActionRow(followedCompetitions = []) {
  const followed = (followedCompetitions || []).find(isPrematchCompetition);
  const recommended = followed || prematchReportCompetitions()[0] || null;
  if (!recommended?.sportCode) return null;
  const days = daysFromToday(competitionDateValue(recommended));
  const timing = days === 0
    ? '今天'
    : days > 0 && days <= 30
      ? `${days} 天后`
      : statusLabel(recommended.status);
  return {
    ...recommended,
    timing,
    isFollowed: Boolean(followed),
    meta: [timing, displayDateLabel(recommended.dateLabel), recommended.venue || recommended.region].filter(Boolean).join(' · '),
    detail: competitionCoverageLevel(recommended) === 'roster'
      ? '已有报名名单，可直接查看潜在对手和重点俱乐部。'
      : '先看赛程、项目和历史强手，名单补齐后继续细化。',
  };
}

function renderHomePrematchAction(row = homePrematchActionRow()) {
  if (!row) return '';
  return `
    <section class="panel my-section home-prematch-action">
      <div class="section-title">
        <h2>下一场重点赛事</h2>
        <span>${escapeHtml(row.isFollowed ? '已关注' : '推荐关注')}</span>
      </div>
      <article class="home-prematch-card">
        <div>
          <strong>${escapeHtml(row.sportName || '近期赛事')}</strong>
          <span>${escapeHtml(row.meta)}</span>
          <em>${escapeHtml(row.detail)}</em>
        </div>
        <div class="home-prematch-actions">
          <button type="button" data-home-prematch="${escapeHtml(row.sportCode)}">赛前情报</button>
          ${row.isFollowed ? '' : `<button type="button" data-home-prematch-follow="${escapeHtml(row.sportCode)}">加入提醒</button>`}
        </div>
      </article>
    </section>
  `;
}

function homeCoachActionRow() {
  const club = state.currentClub || aiDefaultClub();
  if (!club?.id) return null;
  const topProject = (club.projectRows || club.projects || [])
    .slice()
    .sort((a, b) => (Number(b.entrants) || 0) - (Number(a.entrants) || 0) || (Number(a.bestRank) || 999) - (Number(b.bestRank) || 999))[0];
  return {
    ...club,
    title: club.club || '俱乐部工作台',
    meta: `${club.entrants || 0} 人次 · 前八 ${club.top8 || 0} · 奖牌 ${club.medals || 0}`,
    detail: topProject?.label
      ? `重点项目 ${topProject.label}，可继续看学员分层和招生展示。`
      : '可继续看学员分层、续费沟通和招生展示。',
    query: `${club.club}招生怎么讲`,
  };
}

function renderHomeCoachAction(row = homeCoachActionRow()) {
  if (!row) return '';
  return `
    <section class="panel my-section home-coach-action">
      <div class="section-title">
        <h2>教练经营重点</h2>
        <span>教练视角</span>
      </div>
      <article class="home-coach-card">
        <div>
          <strong>${escapeHtml(row.title)}</strong>
          <span>${escapeHtml(row.meta)}</span>
          <em>${escapeHtml(row.detail)}</em>
        </div>
        <div class="home-coach-actions">
          <button type="button" data-home-coach-report="${escapeHtml(row.id)}">学员分层</button>
          <button type="button" data-home-coach-query="${escapeHtml(row.query)}">招生展示</button>
        </div>
      </article>
    </section>
  `;
}

function reportConversionCard({ source, title, detail, primaryLabel = '申请试用', secondaryLabel = '了解会员权益', exportLabel = '保存 PDF' }) {
  return `
    <article class="panel report-conversion-card">
      <div>
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(detail)}</span>
      </div>
      <div class="report-conversion-actions">
        <button type="button" data-commercial-intent="pilot" data-commercial-source="${escapeHtml(source)}" data-report-title="${escapeHtml(title)}">${escapeHtml(primaryLabel)}</button>
        <button type="button" data-commercial-intent="membership" data-commercial-source="${escapeHtml(source)}" data-report-title="${escapeHtml(title)}">${escapeHtml(secondaryLabel)}</button>
        <button type="button" data-report-export="${escapeHtml(source)}">${escapeHtml(exportLabel)}</button>
      </div>
    </article>
  `;
}

function reportReminderCard({ source, title, detail, label = '订阅提醒' }) {
  return `
    <article class="panel report-reminder-card">
      <div>
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(detail)}</span>
      </div>
      <button type="button" data-reminder-interest data-commercial-source="${escapeHtml(source)}" data-report-title="${escapeHtml(title)}">${escapeHtml(label)}</button>
    </article>
  `;
}

function printCurrentReport(source = 'report') {
  trackAnalyticsAction('export_report', source);
  window.print();
}

function bindReportConversionActions(container) {
  if (!container) return;
  container.querySelectorAll('[data-commercial-intent]').forEach((button) => {
    button.addEventListener('click', () => {
      const context = {
        source: button.dataset.commercialSource || '',
        report: button.dataset.reportTitle || '',
      };
      const enrichedContext = enrichSharedCommercialContext(context);
      if (button.dataset.commercialIntent === 'membership') {
        submitMembershipInterest(button, enrichedContext);
      } else {
        submitPilotInterest(button, enrichedContext);
      }
    });
  });
  container.querySelectorAll('[data-report-export]').forEach((button) => {
    button.addEventListener('click', () => printCurrentReport(button.dataset.reportExport || 'report'));
  });
  container.querySelectorAll('[data-reminder-interest]').forEach((button) => {
    button.addEventListener('click', () => submitReminderInterest(button, enrichSharedCommercialContext({
      source: button.dataset.commercialSource || 'reminder',
      report: button.dataset.reportTitle || '提醒订阅',
    })));
  });
}

async function submitPilotInterest(button, context = {}) {
  if (!button) return;
  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = '提交中';
  const contact = requestCommercialContact(context);
  const enrichedContext = { ...context, contact };
  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: state.deviceId,
        type: 'pilot-interest',
        subject: {
          id: `pilot-${enrichedContext.source || state.userRole || 'visitor'}`,
          name: enrichedContext.report || '产品试用意向',
          type: state.userRole || 'visitor',
        },
        message: commercialInterestMessage(enrichedContext).join('；'),
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.message || '提交失败');
    trackCommercialIntent('pilot-interest', enrichedContext, result);
    trackAnalyticsAction('pilot_interest', enrichedContext.source || state.userRole || 'visitor');
    button.textContent = '已收到';
    renderPersonalPages();
  } catch {
    button.textContent = '稍后再试';
  }
  setTimeout(() => {
    button.textContent = originalLabel;
    button.disabled = false;
  }, 1800);
}

async function submitMembershipInterest(button, context = {}) {
  if (!button) return;
  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = '提交中';
  const contact = requestCommercialContact(context);
  const enrichedContext = { ...context, contact };
  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: state.deviceId,
        type: 'membership-interest',
        subject: {
          id: `membership-${enrichedContext.source || state.userRole || 'visitor'}`,
          name: enrichedContext.report || '会员意向',
          type: state.userRole || 'visitor',
        },
        message: [
          ...commercialInterestMessage(enrichedContext),
          '意向权益：成长报告、重点对手、俱乐部分析和无广告体验',
        ].join('；'),
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.message || '提交失败');
    trackCommercialIntent('membership-interest', enrichedContext, result);
    trackAnalyticsAction('membership_interest', enrichedContext.source || state.userRole || 'visitor');
    button.textContent = '已收到';
    renderPersonalPages();
  } catch {
    button.textContent = '稍后再试';
  }
  setTimeout(() => {
    button.textContent = originalLabel;
    button.disabled = false;
  }, 1800);
}

async function submitReminderInterest(button, context = {}) {
  if (!button) return;
  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = '提交中';
  const contact = requestCommercialContact({ ...context, report: context.report || '提醒订阅' });
  const enrichedContext = { ...context, contact };
  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: state.deviceId,
        type: 'reminder-interest',
        subject: {
          id: `reminder-${enrichedContext.source || state.userRole || 'visitor'}`,
          name: enrichedContext.report || '提醒订阅',
          type: state.userRole || 'visitor',
        },
        message: [
          ...commercialInterestMessage(enrichedContext),
          '提醒内容：赛事状态、报名名单、成绩更新和重点对象复核',
        ].join('；'),
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.message || '提交失败');
    trackCommercialIntent('reminder-interest', enrichedContext, result);
    trackAnalyticsAction('reminder_interest', enrichedContext.source || state.userRole || 'visitor');
    button.textContent = '已收到';
    renderPersonalPages();
  } catch {
    button.textContent = '稍后再试';
  }
  setTimeout(() => {
    button.textContent = originalLabel;
    button.disabled = false;
  }, 1800);
}

function homePilotInterestRow() {
  if (state.userRole === 'coach') {
    return {
      title: '教练工作台试用',
      detail: '围绕学员分层、赛前提醒、训练反馈和家长沟通，验证是否能提升带队效率。',
      source: 'home-pilot-coach',
      report: '教练工作台试用',
    };
  }
  if (state.userRole === 'club') {
    return {
      title: '剑馆经营试用',
      detail: '围绕代表选手、优势项目、招生展示和续费沟通，验证是否能沉淀可复用素材。',
      source: 'home-pilot-club',
      report: '剑馆经营试用',
    };
  }
  if (state.userRole === 'data') {
    return {
      title: '赛事数据试用',
      detail: '围绕赛事检索、项目规模、报名热度和数据报告，验证是否能替代重复手工查找。',
      source: 'home-pilot-data',
      report: '赛事数据试用',
    };
  }
  return {
    title: '家庭成长试用',
    detail: '围绕孩子成长报告、赛前情报和重点对手提醒，验证是否能支撑长期参赛决策。',
    source: 'home-pilot-parent',
    report: '家庭成长试用',
  };
}

function renderHomePage() {
  if (!homePage) return;
  if (state.isDataLoading) {
    homePage.innerHTML = '<section class="panel"><div class="loading-row">正在加载数据</div></section>';
    return;
  }
  const children = focusAthleteCards();
  const followedCompetitions = followedCompetitionCards();
  const reportRows = homeReportCenterRows(children, followedCompetitions);
  const reportHistory = reportHistoryRows();
  const aiHistory = aiHistoryRows();
  const commercialIntents = commercialIntentRows();
  const prematchAction = homePrematchActionRow(followedCompetitions);
  const coachAction = homeCoachActionRow();
  const dataValueRows = homeDataValueRows();
  const aiQuestionRows = homeAiQuestionRows();
  const pilotRow = homePilotInterestRow();
  const recentRows = (state.recentItems || []).slice(0, 3);
  const entityCounts = entityCoverageCounts();
  const stats = [
    { value: state.competitions.length, label: '赛事收录' },
    { value: entityCounts.athletes, label: '选手画像' },
    { value: entityCounts.clubs, label: '俱乐部' },
  ];
  homePage.innerHTML = `
    <div class="home-dashboard">
      ${renderAiWorkspace('home')}
      <section class="home-stats-strip" aria-label="数据规模">
        ${stats.map((item) => `
          <div class="my-stat">
            <strong>${escapeHtml(item.value)}</strong>
            <span>${escapeHtml(item.label)}</span>
          </div>
        `).join('')}
      </section>
      ${renderHomePrematchAction(prematchAction)}
      ${renderHomeCoachAction(coachAction)}
      <section class="panel my-section home-question-section">
        <div class="section-title">
          <h2>可以直接问</h2>
          <span>AI 分析入口</span>
        </div>
        <div class="home-question-list">
          ${aiQuestionRows.map((row) => `
            <button type="button" data-home-ai-question="${escapeHtml(row.query)}">
              <span>${escapeHtml(row.label)}</span>
              <strong>${escapeHtml(row.query)}</strong>
              <em>${escapeHtml(row.detail)}</em>
            </button>
          `).join('')}
        </div>
      </section>
      <section class="panel my-section home-value-section">
        <div class="section-title">
          <h2>数据价值</h2>
          <span>一键生成</span>
        </div>
        <div class="data-value-grid">
          ${dataValueRows.map((row) => `
            <button type="button" data-home-ai-product="${escapeHtml(row.query)}">
              <span>${escapeHtml(row.label)}</span>
              <strong>${escapeHtml(row.title)}</strong>
              <em>${escapeHtml(row.detail)}</em>
            </button>
          `).join('')}
        </div>
      </section>
      <section class="panel my-section home-action-section">
        <div class="section-title">
          <h2>工作入口</h2>
          <span>按任务进入</span>
        </div>
        <div class="home-action-grid">
          <button type="button" data-home-competitions>
            <strong>赛事数据</strong>
            <span>搜索、筛选和进入赛事详情</span>
          </button>
          <button type="button" data-home-follow>
            <strong>关注</strong>
            <span>${escapeHtml(children.length + followedCompetitions.length ? `${children.length} 个选手 / ${followedCompetitions.length} 场赛事` : '添加重点选手和赛事')}</span>
          </button>
          <button type="button" data-home-my>
            <strong>我的</strong>
            <span>${escapeHtml(recentRows.length ? `最近查看 ${recentRows.length} 条` : '查看关注与访问记录')}</span>
          </button>
        </div>
      </section>
      <section class="panel my-section home-pilot-section">
        <div class="section-title">
          <h2>试用合作</h2>
          <span>产品验证</span>
        </div>
        <div class="pilot-interest-card">
          <div>
            <strong>${escapeHtml(pilotRow.title)}</strong>
            <span>${escapeHtml(pilotRow.detail)}</span>
          </div>
          <button type="button" data-pilot-interest data-pilot-source="${escapeHtml(pilotRow.source)}" data-pilot-report="${escapeHtml(pilotRow.report)}">申请试用</button>
        </div>
      </section>
      ${renderCommercialIntentStatus(commercialIntents.slice(0, 2))}
    </div>
    <section class="panel my-section">
      <div class="section-title">
        <h2>报告中心</h2>
        <span>常用报告</span>
      </div>
      <div class="report-center-grid">
        ${reportRows.map((row) => `
          <button type="button" data-home-report="${escapeHtml(row.key)}" ${row.disabled ? 'disabled' : ''} ${row.sportCode ? `data-sport-code="${escapeHtml(row.sportCode)}"` : ''} ${row.athleteId ? `data-athlete-id="${escapeHtml(row.athleteId)}"` : ''} ${row.clubId ? `data-club-id="${escapeHtml(row.clubId)}"` : ''} ${row.query ? `data-ai-query="${escapeHtml(row.query)}"` : ''}>
            <span>${escapeHtml(row.meta)}</span>
            <strong>${escapeHtml(row.title)}</strong>
            <em>${escapeHtml(row.detail)}</em>
          </button>
        `).join('')}
      </div>
    </section>
    ${reportHistory.length ? `
      <section class="panel my-section">
        <div class="section-title">
          <h2>最近报告</h2>
          <span>快速继续</span>
        </div>
        <div class="report-history-list">
          ${reportHistory.map((row) => `
            <button type="button" data-report-history-type="${escapeHtml(row.type || '')}" data-report-history-id="${escapeHtml(row.id || '')}">
              <span>${escapeHtml(row.typeLabel)}</span>
              <strong>${escapeHtml(row.title)}</strong>
              <em>${escapeHtml(row.detail)}</em>
            </button>
          `).join('')}
        </div>
      </section>
    ` : ''}
    ${aiHistory.length ? `
      <section class="panel my-section">
        <div class="section-title">
          <h2>最近分析</h2>
          <span>继续提问</span>
        </div>
        <div class="ai-history-list">
          ${aiHistory.map((row) => `
            <button type="button" data-ai-history-query="${escapeHtml(row.query)}">
              <span>${escapeHtml(row.typeLabel)}</span>
              <strong>${escapeHtml(row.title)}</strong>
              <em>${escapeHtml(row.summary)}</em>
            </button>
          `).join('')}
        </div>
      </section>
    ` : ''}
    <section class="panel my-section">
      <div class="section-title">
        <h2>关注概览</h2>
        <span>${children.length + followedCompetitions.length ? '已同步' : '待关注'}</span>
      </div>
      <div class="my-status-note">
        <strong>${escapeHtml(children.length + followedCompetitions.length)}</strong>
        <span>关注的选手和赛事会集中在关注页，方便赛前快速查看。</span>
      </div>
    </section>
    ${renderHomeDataCoverage()}
  `;
  homePage.querySelector('[data-home-competitions]')?.addEventListener('click', () => navigateMain('competitions'));
  homePage.querySelector('[data-home-follow]')?.addEventListener('click', () => navigateMain('follow'));
  homePage.querySelector('[data-home-my]')?.addEventListener('click', () => navigateMain('my'));
  homePage.querySelector('[data-home-prematch]')?.addEventListener('click', (event) => {
    trackAnalyticsAction('home_prematch', 'open');
    openPrematchReport('prematch-pack', event.currentTarget.dataset.homePrematch || '');
  });
  homePage.querySelector('[data-home-prematch-follow]')?.addEventListener('click', (event) => {
    const competition = findCompetitionBySportCode(event.currentTarget.dataset.homePrematchFollow);
    if (!competition?.sportCode) return;
    trackAnalyticsAction('home_prematch', 'follow');
    upsertFollowedCompetition(competition);
  });
  homePage.querySelector('[data-home-coach-report]')?.addEventListener('click', (event) => {
    trackAnalyticsAction('home_coach', 'segmentation');
    openCoachSegmentationReport(event.currentTarget.dataset.homeCoachReport || '');
  });
  homePage.querySelector('[data-home-coach-query]')?.addEventListener('click', (event) => {
    trackAnalyticsAction('home_coach', 'recruiting');
    submitAiQuery(event.currentTarget.dataset.homeCoachQuery || '');
  });
  homePage.querySelectorAll('[data-home-ai-question]').forEach((button) => {
    button.addEventListener('click', () => {
      trackAnalyticsAction('home_ai_question', button.dataset.homeAiQuestion ? 'query' : 'empty');
      submitAiQuery(button.dataset.homeAiQuestion || '');
    });
  });
  homePage.querySelector('[data-pilot-interest]')?.addEventListener('click', (event) => submitPilotInterest(event.currentTarget, {
    source: event.currentTarget.dataset.pilotSource || 'home-pilot',
    report: event.currentTarget.dataset.pilotReport || '试用合作',
  }));
  homePage.querySelectorAll('[data-home-ai-product]').forEach((button) => {
    button.addEventListener('click', () => {
      trackAnalyticsAction('home_ai_product', button.dataset.homeAiProduct ? 'query' : 'empty');
      submitAiQuery(button.dataset.homeAiProduct || '');
    });
  });
  homePage.querySelectorAll('[data-home-report]').forEach((button) => {
    button.addEventListener('click', () => {
      trackAnalyticsAction('home_report', button.dataset.homeReport || 'unknown');
      if (button.dataset.homeReport === 'prematch') openPrematchReport('prematch-pack', button.dataset.sportCode || '');
      if (button.dataset.homeReport === 'growth') openParentGrowthReport(button.dataset.athleteId || '');
      if (button.dataset.homeReport === 'coach') openCoachSegmentationReport(button.dataset.clubId || '');
      if (button.dataset.homeReport === 'club-recruiting') submitAiQuery(button.dataset.aiQuery || '');
    });
  });
  homePage.querySelectorAll('[data-report-history-type]').forEach((button) => {
    button.addEventListener('click', () => {
      const type = button.dataset.reportHistoryType;
      const id = button.dataset.reportHistoryId || '';
      if (type === 'prematch') openPrematchReport('prematch-pack', id === 'prematch-pack' ? '' : id);
      if (type === 'parent-growth') openParentGrowthReport(id);
      if (type === 'coach-segmentation') openCoachSegmentationReport(id);
      if (type === 'ai-report') {
        trackAnalyticsAction('open_report', 'ai-report');
        submitAiQuery(id);
      }
    });
  });
  homePage.querySelectorAll('[data-ai-history-query]').forEach((button) => {
    button.addEventListener('click', () => submitAiQuery(button.dataset.aiHistoryQuery || ''));
  });
  homePage.querySelectorAll('[data-coverage-competition]').forEach((button) => {
    button.addEventListener('click', () => openCompetition(button.dataset.coverageCompetition));
  });
  bindAiWorkspace(homePage);
  bindServiceProgressActions(homePage);
  bindPersonalList(homePage);
}

function aiDefaultClub() {
  return [...(state.clubSearchIndex || [])]
    .filter((club) => club?.club)
    .sort((a, b) => (Number(b.entrants) || 0) - (Number(a.entrants) || 0) || String(a.club).localeCompare(String(b.club), 'zh-CN'))[0] || null;
}

function roleAiPromptPresets(primary, secondary) {
  const club = aiDefaultClub();
  if (state.userRole === 'parent') {
    return [
      primary ? `${primary.name}最近几场有没有进步` : '蔡廷彧最近几场有没有进步',
      primary && secondary ? `分析${primary.name}和${secondary.name}的对比情况` : '分析马潇和陶嘉月的对战情况',
      '天津近期报名情况',
      '2026年天津有几场比赛',
    ];
  }
  if (state.userRole === 'coach') {
    const clubName = club?.club || '山东小众体育';
    return [
      `${clubName} U8 男花怎么样`,
      `${clubName}有哪些优势项目`,
      '天津近期报名情况',
      primary ? `${primary.name}最近几场有没有进步` : '蔡廷彧最近几场有没有进步',
    ];
  }
  if (state.userRole === 'club') {
    const clubName = club?.club || '山东小众体育';
    return [
      `${clubName}有哪些优势项目`,
      `${clubName} U8 男花怎么样`,
      '2026年天津有几场比赛',
      '天津近期报名情况',
    ];
  }
  if (state.userRole === 'data') {
    return [
      '2026年天津有几场比赛',
      '天津近期报名情况',
      '山东小众体育 U8 男花怎么样',
      primary && secondary ? `分析${primary.name}和${secondary.name}的对比情况` : '分析马潇和陶嘉月的对战情况',
    ];
  }
  return [];
}

function aiPromptPresets() {
  const athletes = focusAthleteCards();
  const primary = athletes[0] || state.athleteSearchIndex.find((athlete) => athlete.events?.length);
  const secondary = athletes[1] || state.athleteSearchIndex.find((athlete) => athlete.name !== primary?.name && athlete.events?.length);
  const rolePresets = roleAiPromptPresets(primary, secondary);
  const fallbackPresets = [
    '这些击剑数据能产生什么商业价值',
    primary && secondary ? `分析${primary.name}和${secondary.name}的对比情况` : '分析马潇和陶嘉月的对比情况',
    primary ? `${primary.name}最近几场有没有进步` : '蔡廷彧最近几场有没有进步',
    ...aiAcceptanceQueryCases().slice(1, 4).map((item) => item.query),
  ];
  return [...new Set([...rolePresets, ...fallbackPresets])].slice(0, 5);
}

function aiAcceptanceQueryCases() {
  return [
    { query: '哪场比赛人数最多？', expectedType: 'competition-stats' },
    { query: '2026年天津有几场比赛', expectedType: 'competition-stats' },
    { query: '天津近期报名情况', expectedType: 'prematch' },
    { query: '山东小众体育 U8 男花怎么样', expectedType: 'club' },
    { query: '蔡廷彧最近几场有没有进步', expectedType: 'growth' },
    { query: '分析马潇和陶嘉月的对战情况', expectedType: 'comparison' },
    { query: '这些击剑数据能产生什么商业价值', expectedType: 'business-insight' },
    { query: '生成赛前情报包', expectedType: 'product-template' },
    { query: '生成家长成长报告方案', expectedType: 'product-template' },
    { query: '生成教练学员分层报告', expectedType: 'product-template' },
    { query: '山东小众体育招生怎么讲', expectedType: 'club-recruiting' },
  ];
}

function renderAiWorkspace() {
  const presets = aiPromptPresets();
  return `
    <div class="ai-workspace" id="aiWorkspace">
      <section class="panel ai-home-primary">
        <div class="section-title">
          <h2>问 FencingAI</h2>
          <span>数据可溯源</span>
        </div>
        <div class="ai-home-lead">
          <strong>直接用问题查看击剑数据</strong>
          <span>可以问赛事数量、报名情况、选手对比、成长变化和俱乐部表现。</span>
        </div>
        <form class="ai-query-form" id="aiQueryForm">
          <textarea id="aiQueryInput" rows="3" placeholder="例如：2026年天津有几场比赛 / 分析马潇和陶嘉月的对战情况"></textarea>
          <button type="submit">生成分析</button>
        </form>
        <div class="ai-preset-row">
          ${presets.map((preset) => `<button type="button" data-ai-preset="${escapeHtml(preset)}">${escapeHtml(preset)}</button>`).join('')}
        </div>
        <div class="ai-home-actions">
          <button type="button" data-home-competitions>赛事数据</button>
          <span>保留传统检索入口，需要时可切回列表查看。</span>
        </div>
      </section>
      <div class="ai-answer" id="aiAnswer">
        <div class="ai-empty">
          <strong>从问题开始</strong>
          <span>回答会给出结论、关键指标和证据来源，点击证据可回到对应赛事、选手或俱乐部。</span>
        </div>
      </div>
    </div>
  `;
}

function bindAiWorkspace(container) {
  const form = container.querySelector('#aiQueryForm');
  const input = container.querySelector('#aiQueryInput');
  const answer = container.querySelector('#aiAnswer');
  if (!form || !input || !answer) return;

  const bindAnswer = (report) => {
    const card = answer.querySelector('.ai-answer-card');
    if (card) card.__aiReport = report;
    bindAiAnswerActions(answer);
    answer.querySelectorAll('[data-ai-follow-up]').forEach((button) => {
      button.addEventListener('click', () => {
        input.value = button.dataset.aiFollowUp || '';
        run(input.value);
      });
    });
  };

  const run = async (query) => {
    const normalizedQuery = String(query || '').trim();
    input.blur();
    if (!normalizedQuery) {
      const report = buildAiAnswer(normalizedQuery);
      answer.classList.add('has-answer');
      answer.innerHTML = renderAiAnswer(report);
      bindAnswer(report);
      return;
    }

    answer.classList.add('has-answer');
    answer.innerHTML = '<div class="loading-row">正在匹配相关画像</div>';
    scrollToResultPanel(answer, 'auto');
    try {
      await ensureAiEntityContext(normalizedQuery);
      const report = buildAiAnswer(normalizedQuery);
      report.query = normalizedQuery;
      trackAnalyticsAction('ai_answer', report.type || 'unknown');
      trackAiAnalysisHistory(normalizedQuery, report);
      answer.innerHTML = renderAiAnswer(report);
      bindAnswer(report);
      scrollToResultPanel(answer);
    } catch {
      const report = buildAiAnswer(normalizedQuery);
      report.query = normalizedQuery;
      trackAnalyticsAction('ai_answer', report.type || 'unknown');
      trackAiAnalysisHistory(normalizedQuery, report);
      answer.innerHTML = renderAiAnswer(report);
      bindAnswer(report);
      scrollToResultPanel(answer);
    }
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    run(input.value);
  });

  container.querySelectorAll('[data-ai-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      input.value = button.dataset.aiPreset || '';
      run(input.value);
    });
  });
}

function submitAiQuery(query) {
  const text = String(query || '').trim();
  if (!text) return;
  navigateMain('home');
  const input = homePage?.querySelector('#aiQueryInput');
  const form = homePage?.querySelector('#aiQueryForm');
  if (!input || !form) return;
  input.value = text;
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

function normalizeAiName(value) {
  return compactText(value)
    .replaceAll('马消', '马潇')
    .replaceAll('廷或', '廷彧');
}

function aiEntityCandidateTerms(query) {
  const stopWords = /(帮我|请问|分析|对比|对战|交手|情况|最近|有没有|是否|是不是|进步|怎么样|如何|表现|成长|比赛|赛事|报名|几场|多少场|当前|数据|查看|看一下|和|与|跟|的|vs)/ig;
  const normalized = normalizeAiName(query).replace(stopWords, ' ');
  const segments = normalized.match(/[\u4e00-\u9fa5]{2,12}|[a-z0-9]{2,12}/ig) || [];
  const terms = [];
  for (const segment of segments) {
    const text = compactText(segment);
    if (!text || /^u\d{1,2}$/i.test(text) || text.length < 2) continue;
    terms.push(text);
    if (/[\u4e00-\u9fa5]/.test(text) && text.length > 4) {
      for (let length = Math.min(4, text.length); length >= 2; length -= 1) {
        for (let index = 0; index <= text.length - length; index += 1) {
          terms.push(text.slice(index, index + length));
        }
      }
    }
  }
  return [...new Set(terms)]
    .sort((a, b) => b.length - a.length || a.localeCompare(b, 'zh-CN'))
    .slice(0, 14);
}

function mergeAiAthleteResult(athlete) {
  if (!athlete?.id) return;
  const existing = state.athletesById[athlete.id] || {};
  state.athletesById[athlete.id] = { ...existing, ...athlete };
  const index = state.athleteSearchIndex.findIndex((row) => row.id === athlete.id);
  if (index >= 0) state.athleteSearchIndex[index] = { ...state.athleteSearchIndex[index], ...athlete };
  else state.athleteSearchIndex.push(athlete);
}

function mergeAiClubResult(club) {
  if (!club?.id) return;
  const existing = state.clubsById[club.id] || {};
  state.clubsById[club.id] = { ...existing, ...club };
  const index = state.clubSearchIndex.findIndex((row) => row.id === club.id);
  if (index >= 0) state.clubSearchIndex[index] = { ...state.clubSearchIndex[index], ...club };
  else state.clubSearchIndex.push(club);
}

async function ensureAiEntityContext(query) {
  const terms = aiEntityCandidateTerms(query).filter((term) => !state.aiHydratedTerms.has(term));
  if (!terms.length) return;
  terms.forEach((term) => state.aiHydratedTerms.add(term));

  const searchResults = await Promise.all(terms.map(async (term) => {
    try {
      const params = new URLSearchParams({
        q: term,
        type: 'all',
        athleteLimit: '3',
        clubLimit: '2',
      });
      return await fetchJson(`/api/search?${params.toString()}`);
    } catch {
      return null;
    }
  }));

  const athletes = uniqueBy(searchResults.flatMap((result) => result?.athletes || []), (athlete) => athlete.id).slice(0, 6);
  const clubs = uniqueBy(searchResults.flatMap((result) => result?.clubs || []), (club) => club.id).slice(0, 4);
  athletes.forEach(mergeAiAthleteResult);
  clubs.forEach(mergeAiClubResult);

  const athleteDetails = await Promise.all(athletes.map(async (athlete) => {
    if (!athlete.id || state.athletesById[athlete.id]?.events?.length) return null;
    try {
      return await fetchCachedDetail('athletes', athlete.id, `/api/athletes/${encodeURIComponent(athlete.id)}`, (result) => result.athlete);
    } catch {
      return null;
    }
  }));
  athleteDetails.filter(Boolean).forEach(mergeAiAthleteResult);

  const clubDetails = await Promise.all(clubs.map(async (club) => {
    if (!club.id || state.clubsById[club.id]?.events?.length) return null;
    try {
      return await fetchCachedDetail('clubs', club.id, `/api/clubs/${encodeURIComponent(club.id)}`, (result) => result.club);
    } catch {
      return null;
    }
  }));
  clubDetails.filter(Boolean).forEach(mergeAiClubResult);
}

function aiAthletePool() {
  const rows = Object.values(state.athletesById || {}).length
    ? Object.values(state.athletesById || {})
    : state.athleteSearchIndex || [];
  const merged = new Map();
  rows.forEach((athlete) => {
    if (!athlete?.name) return;
    const key = athlete.id || `${athlete.name}__${athlete.club || ''}`;
    const existing = merged.get(key);
    if (!existing || (athlete.events?.length || 0) > (existing.events?.length || 0)) merged.set(key, athlete);
  });
  return [...merged.values()];
}

function detectAthletesInQuery(query) {
  const normalizedQuery = normalizeAiName(query);
  const exact = detectExactAthletesInQuery(normalizedQuery);
  if (exact.length) return exact;

  const tokens = [...normalizedQuery].filter((char) => /[\u4e00-\u9fa5]/.test(char));
  const fuzzy = aiAthletePool()
    .map((athlete) => {
      const name = normalizeAiName(athlete.name);
      if (!name) return null;
      const hit = tokens.filter((char) => name.includes(char)).length;
      return hit >= Math.min(2, name.length) ? { athlete, score: hit * 10 + (athlete.appearances || 0) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.athlete);
  return uniqueBy(fuzzy, (athlete) => athlete.id || `${athlete.name}__${athlete.club}`).slice(0, 3);
}

function detectExactAthletesInQuery(normalizedQuery) {
  return uniqueBy(aiAthletePool()
    .filter((athlete) => normalizeAiName(athlete.name) && normalizedQuery.includes(normalizeAiName(athlete.name)))
    .sort((a, b) => normalizeAiName(b.name).length - normalizeAiName(a.name).length || (b.appearances || 0) - (a.appearances || 0)),
  (athlete) => athlete.id || `${athlete.name}__${athlete.club}`).slice(0, 3);
}

function detectClubInQuery(query) {
  const normalizedQuery = compactText(query);
  return (state.clubSearchIndex || [])
    .filter((club) => compactText(club.club) && normalizedQuery.includes(compactText(club.club)))
    .sort((a, b) => compactText(b.club).length - compactText(a.club).length || (b.entrants || 0) - (a.entrants || 0))[0] || null;
}

function uniqueBy(rows, keyFn) {
  const seen = new Set();
  return rows.filter((row) => {
    const key = keyFn(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildAiAnswer(query) {
  const text = String(query || '').trim();
  if (!text) {
    return {
      type: 'empty',
      title: '先输入一个问题',
      summary: '可以问选手对比、成长趋势、俱乐部表现或赛前对手分析。',
      cards: [],
      evidence: [],
    };
  }

  const competitionRankingQuery = detectCompetitionRankingQuery(text);
  if (competitionRankingQuery) return buildAiCompetitionRanking(text, competitionRankingQuery);

  const competitionQuery = detectCompetitionStatsQuery(text);
  if (competitionQuery) return buildAiCompetitionStats(text, competitionQuery);

  const productTemplate = detectProductTemplateQuery(text);
  if (productTemplate) return buildAiProductTemplateReport(text, productTemplate);

  if (detectBusinessInsightQuery(text)) return buildAiBusinessInsightReport(text);

  const exactAthletes = detectExactAthletesInQuery(normalizeAiName(text));
  if (exactAthletes.length >= 2) return buildAiAthleteComparison(text, exactAthletes[0], exactAthletes[1]);
  if (exactAthletes.length === 1) return buildAiAthleteGrowth(text, exactAthletes[0]);

  const club = detectClubInQuery(text);
  if (club && detectClubRecruitingQuery(text)) return buildAiClubRecruitingReport(text, club);
  if (club) return buildAiClubReport(text, club);

  const preMatchQuery = detectPreMatchQuery(text);
  if (preMatchQuery) return buildAiPreMatchReport(text, preMatchQuery);

  const athletes = detectAthletesInQuery(text);
  if (athletes.length >= 2) return buildAiAthleteComparison(text, athletes[0], athletes[1]);
  if (athletes.length === 1) return buildAiAthleteGrowth(text, athletes[0]);

  const entityCounts = entityCoverageCounts();
  return {
    type: 'fallback',
    title: '暂未识别到明确对象',
    summary: '请在问题里写出选手姓名或俱乐部名称，例如“分析马潇和陶嘉月的对比情况”。',
    cards: [
      ['可问选手', `${entityCounts.athletes} 个画像`],
      ['可问俱乐部', `${entityCounts.clubs} 个俱乐部`],
      ['可问赛事', `${state.competitions.length} 场赛事`],
    ],
    evidence: [],
  };
}

function detectProductTemplateQuery(query) {
  const normalized = compactText(query);
  const hasTemplateIntent = /(模板|框架|报告怎么做|怎么做成报告|方案|生成.*报告|生成.*情报包|做一份|输出一份)/.test(normalized);
  if (!hasTemplateIntent) return '';
  if (/(赛前情报包|对手情报包|赛前包|报名情报)/.test(normalized)) return 'prematch-pack';
  if (/(家长|成长报告|孩子报告|选手成长)/.test(normalized)) return 'parent-growth-report';
  if (/(教练|学员分层|队员分层|续费|招生|训练反馈)/.test(normalized)) return 'coach-segmentation';
  return '';
}

function detectClubRecruitingQuery(query) {
  const normalized = compactText(query);
  return /(招生|招新|获客|引流|对外|展示|名片|分享|家长沟通|续费沟通|怎么讲|话术|朋友圈|宣传)/.test(normalized);
}

function detectBusinessInsightQuery(query) {
  const normalized = compactText(query);
  const hasDataAssetIntent = /(商业价值|数据价值|怎么变现|变现|商业化|产品机会|经营价值|行业洞察|用户价值|可以做哪些分析|值得做哪些分析|做哪些分析|数据.*利用|利用.*数据)/.test(normalized);
  const hasRoleIntent = /(家长|教练|俱乐部|赛事方|协会|品牌|招生|留存|续费|赛前情报|成长报告|经营)/.test(normalized);
  return hasDataAssetIntent || (normalized.includes('数据') && hasRoleIntent);
}

function detectCompetitionStatsQuery(query) {
  const normalized = compactText(query);
  const hasCompetitionIntent = /(比赛|赛事|公开赛|冠军赛|锦标赛|有几场|多少场|几场)/.test(normalized);
  if (!hasCompetitionIntent) return null;

  const year = detectYearInQuery(normalized);
  const month = detectMonthInQuery(normalized);
  const region = detectRegionInQuery(normalized);
  const status = detectStatusInQuery(normalized);
  if (!year && !month && !region && !status) return null;
  return { year, month, region, status };
}

function detectCompetitionRankingQuery(query) {
  const normalized = compactText(query);
  const hasItemIntent = /(项目|组别|小项|单项|年龄段)/.test(normalized);
  const hasCompetitionIntent = hasItemIntent || /(比赛|赛事|公开赛|冠军赛|锦标赛|姣旇禌|璧涗簨|鍏紑璧泑鍐犲啗璧泑閿︽爣璧?)/.test(normalized);
  if (!hasCompetitionIntent) return null;
  if (/(人数最多|参赛人数最多|参赛最多|报名最多|报名人数最多|规模最大|最多人)/.test(normalized)) {
    return {
      metric: 'entrants',
      scope: hasItemIntent ? 'item' : 'competition',
      year: detectYearInQuery(normalized),
      month: detectMonthInQuery(normalized),
      region: detectRegionInQuery(normalized),
      status: detectStatusInQuery(normalized),
    };
  }
  return null;
}

function detectPreMatchQuery(query) {
  const normalized = compactText(query);
  const hasPreMatchIntent = /(报名|名单|赛前|马上|近期|最近|未开赛|未开始|待开赛|即将)/.test(normalized);
  if (!hasPreMatchIntent) return null;
  const year = detectYearInQuery(normalized);
  const month = detectMonthInQuery(normalized);
  const region = detectRegionInQuery(normalized);
  const status = detectStatusInQuery(normalized);
  return { year, month, region, status };
}

function detectYearInQuery(normalizedQuery) {
  const explicit = normalizedQuery.match(/20\d{2}/)?.[0];
  if (explicit) return explicit;
  const currentYear = new Date().getFullYear();
  if (normalizedQuery.includes('今年') || normalizedQuery.includes('本年')) return String(currentYear);
  if (normalizedQuery.includes('明年')) return String(currentYear + 1);
  if (normalizedQuery.includes('去年')) return String(currentYear - 1);
  return '';
}

function detectMonthInQuery(normalizedQuery) {
  const match = normalizedQuery.match(/(?:^|[^\d])(\d{1,2})月/);
  if (!match) return '';
  const month = Number(match[1]);
  return month >= 1 && month <= 12 ? String(month) : '';
}

function detectRegionInQuery(normalizedQuery) {
  const knownRegions = [
    '北京', '天津', '上海', '重庆', '河北', '山西', '辽宁', '吉林', '黑龙江',
    '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南',
    '广东', '海南', '四川', '贵州', '云南', '陕西', '甘肃', '青海', '台湾',
    '内蒙古', '广西', '西藏', '宁夏', '新疆', '香港', '澳门',
  ];
  const regionSet = new Set();
  knownRegions.forEach((region) => regionSet.add(region));
  state.competitions.forEach((competition) => {
    [competition.venue, competition.region].filter(Boolean).forEach((value) => {
      String(value).split(/[·•\s,，/]+/).forEach((part) => {
        const clean = compactText(part).replace(/市$|省$|区$|县$|自治区$|特别行政区$/g, '');
        if (clean.length >= 2) regionSet.add(clean);
      });
    });
  });
  return [...regionSet]
    .filter((region) => normalizedQuery.includes(region))
    .sort((a, b) => b.length - a.length)[0] || '';
}

function detectStatusInQuery(normalizedQuery) {
  if (normalizedQuery.includes('报名')) return 'registration';
  if (normalizedQuery.includes('未开赛') || normalizedQuery.includes('未开始') || normalizedQuery.includes('待开赛')) return 'upcoming';
  if (normalizedQuery.includes('已结束') || normalizedQuery.includes('结束')) return 'completed';
  if (normalizedQuery.includes('进行中')) return 'live';
  return '';
}

function aiProjectHints(query) {
  const normalized = compactText(query);
  const hints = [];
  const age = normalized.match(/u\d{1,2}/i)?.[0]?.toUpperCase();
  if (age) hints.push(age);
  if (normalized.includes('男')) hints.push('男');
  if (normalized.includes('女')) hints.push('女');
  if (normalized.includes('花剑') || normalized.includes('男花') || normalized.includes('女花')) hints.push('花');
  if (normalized.includes('重剑') || normalized.includes('男重') || normalized.includes('女重')) hints.push('重');
  if (normalized.includes('佩剑') || normalized.includes('男佩') || normalized.includes('女佩')) hints.push('佩');
  return hints;
}

function aiFocusedAthletes() {
  const rows = [];
  const selected = state.selectedChildId ? state.athletesById?.[state.selectedChildId] : null;
  if (selected?.id || selected?.name) rows.push({ ...selected, focusKind: 'primary' });
  for (const follow of state.followedAthletes || []) {
    const athlete = state.athletesById?.[follow.id] || follow;
    if (!athlete?.id && !athlete?.name) continue;
    if (rows.some((row) => (row.id && row.id === athlete.id) || (compactText(row.name) && compactText(row.name) === compactText(athlete.name)))) continue;
    rows.push({ ...athlete, focusKind: 'followed' });
  }
  return rows.slice(0, 4);
}

function aiAthleteProjectLabels(athlete) {
  return uniqueBy((athlete.events || [])
    .map((event) => displayEventName(event))
    .filter(Boolean), (label) => compactText(label)).slice(0, 4);
}

function competitionMatchesProjectLabel(competition, label) {
  const hints = aiProjectHints(label);
  if (!hints.length) return false;
  return competitionItemSummaries(competition).some((item) => projectMatchesAiHints(displayEventName(item), hints));
}

function aiPreMatchFocusRows(competitions) {
  return aiFocusedAthletes().map((athlete) => {
    const labels = aiAthleteProjectLabels(athlete);
    const matched = competitions.filter((competition) => labels.some((label) => competitionMatchesProjectLabel(competition, label))).slice(0, 2);
    const prefix = athlete.focusKind === 'primary' ? '重点关注' : '已关注';
    const projectText = labels.length ? labels.slice(0, 2).join(' / ') : '项目待确认';
    const matchText = matched.length ? `匹配 ${matched.length} 场近期赛事` : '暂未匹配到同项目近期赛事';
    return `${prefix} ${athlete.name || '选手'}：历史项目 ${projectText}，${matchText}`;
  });
}

function projectMatchesAiHints(label, hints) {
  if (!hints.length) return true;
  const text = compactText(label);
  return hints.every((hint) => text.includes(compactText(hint)));
}

function aiCompetitionStatsDecisionRows(rows, actionRows, rosterRows, scoreRows) {
  if (!rows.length) return ['当前没有匹配赛事，可以放宽年份、地区或状态后再查。'];
  const decisionRows = [];
  if (actionRows.length) {
    decisionRows.push(`${actionRows.length} 场处在报名、未开赛或赛前阶段，适合加入赛前提醒。`);
    decisionRows.push(`${rosterRows.length} 场已有报名信息，可进一步生成赛前情报包；名单不完整时先做项目和规模判断。`);
  }
  if (scoreRows.length) {
    decisionRows.push(`${scoreRows.length} 场已有成绩或项目数据，适合做成长报告、教练复盘和俱乐部表现分析。`);
  }
  if (!decisionRows.length) {
    decisionRows.push('当前主要用于赛事检索和赛程确认，等报名名单或成绩数据补齐后再做深度分析。');
  }
  return decisionRows;
}

function buildAiCompetitionStats(query, filters) {
  const rows = state.competitions.filter((competition) => {
    const yearOk = filters.year ? competitionYear(competition) === filters.year : true;
    const monthOk = filters.month ? competitionMonth(competition) === filters.month : true;
    const regionText = compactText([competition.venue, competition.region, competition.sportName].filter(Boolean).join(' '));
    const regionOk = filters.region ? regionText.includes(filters.region) : true;
    const statusOk = filters.status ? competition.status === filters.status : true;
    return yearOk && monthOk && regionOk && statusOk;
  }).sort((a, b) => {
    const dayA = Math.abs(daysFromToday(competitionDateValue(a)));
    const dayB = Math.abs(daysFromToday(competitionDateValue(b)));
    return dayA - dayB || String(a.dateLabel || '').localeCompare(String(b.dateLabel || ''), 'zh-CN');
  });

  const statusCounts = rows.reduce((map, competition) => {
    const label = statusLabel(competition.status);
    map.set(label, (map.get(label) || 0) + 1);
    return map;
  }, new Map());
  const monthCounts = rows.reduce((map, competition) => {
    const month = String(competition.dateLabel || competition.startDate || '').match(/(?:20\d{2})[.\-/年](\d{1,2})/)?.[1];
    if (!month) return map;
    const label = `${Number(month)}月`;
    map.set(label, (map.get(label) || 0) + 1);
    return map;
  }, new Map());
  const watchRows = rows
    .filter((competition) => ['registration', 'upcoming', 'live'].includes(competition.status) || competition.isPreEvent)
    .slice(0, 3);
  const actionRows = rows.filter((competition) => ['registration', 'upcoming', 'live'].includes(competition.status) || competition.isPreEvent);
  const rosterRows = rows.filter((competition) => competition.rosterStatus === 'partial' || competition.rosterStatus === 'complete');
  const scoreRows = rows.filter((competition) => competition.status === 'completed' || competitionHasItems(competition));
  const regionLabel = filters.region || '全部地区';
  const yearLabel = filters.year || '全部年份';
  const monthLabel = filters.month ? `${filters.month}月` : '全部月份';
  const statusLabelText = filters.status ? statusLabel(filters.status) : '全部状态';
  const title = `${yearLabel}${filters.month ? monthLabel : ''}${regionLabel === '全部地区' ? '' : regionLabel}赛事统计`;
  const summary = rows.length
    ? `${yearLabel} ${monthLabel} ${regionLabel} 共收录 ${rows.length} 场赛事${filters.status ? `，状态为${statusLabelText}` : ''}。`
    : `当前没有匹配到 ${yearLabel} ${monthLabel} ${regionLabel} ${statusLabelText} 的赛事记录。`;

  return {
    type: 'competition-stats',
    title,
    summary,
    cards: [
      ['赛事数量', `${rows.length} 场`],
      ['年份', yearLabel],
      ['月份', monthLabel],
      ['地区', regionLabel],
      ['状态', statusLabelText],
    ],
    sections: rows.length ? [
      {
        title: '行动判断',
        rows: aiCompetitionStatsDecisionRows(rows, actionRows, rosterRows, scoreRows),
      },
      {
        title: '状态分布',
        rows: [...statusCounts.entries()].map(([label, count]) => `${label}：${count} 场`),
      },
      watchRows.length ? {
        title: '近期可看',
        rows: watchRows.map((competition) => `${competition.sportName} · ${displayDateLabel(competition.dateLabel)} · ${statusLabel(competition.status)}`),
      } : null,
      monthCounts.size ? {
        title: '时间分布',
        rows: [...monthCounts.entries()]
          .sort((a, b) => Number(b[1]) - Number(a[1]) || Number(a[0].replace('月', '')) - Number(b[0].replace('月', '')))
          .slice(0, 6)
          .map(([label, count]) => `${label}：${count} 场`),
      } : null,
      {
        title: '匹配赛事',
        rows: rows.slice(0, 6).map((competition) => `${competition.sportName} · ${competition.dateLabel || '日期待确认'} · ${competition.venue || competition.region || ''}`),
      },
    ].filter(Boolean) : [],
    evidence: rows.slice(0, 8).map((competition) => ({
      kind: '赛事记录',
      label: competition.sportName,
      detail: `${competition.dateLabel || '日期待确认'} · ${competition.venue || competition.region || ''} · ${statusLabel(competition.status)}`,
      reason: '用于核对赛事数量、地区和状态',
      sportCode: competition.sportCode,
    })),
    actions: [
      actionRows[0]?.sportCode ? { label: '生成赛前情报包', prematchTemplateKind: 'prematch-pack', prematchSportCode: actionRows[0].sportCode } : null,
      watchRows[0]?.sportCode ? { label: '加入赛前提醒', followCompetitionCode: watchRows[0].sportCode } : null,
      { label: rows.length ? '查看匹配赛事' : '进入赛事列表', mainTab: 'competitions', filters },
    ].filter(Boolean),
  };
}

function buildAiCompetitionRanking(query, filters) {
  const matchedRows = (state.competitions || []).filter((competition) => {
    const yearOk = filters.year ? competitionYear(competition) === filters.year : true;
    const monthOk = filters.month ? competitionMonth(competition) === filters.month : true;
    const regionText = compactText([competition.venue, competition.region, competition.sportName].filter(Boolean).join(' '));
    const regionOk = filters.region ? regionText.includes(filters.region) : true;
    const statusOk = filters.status ? competition.status === filters.status : true;
    return yearOk && monthOk && regionOk && statusOk;
  });
  const rows = matchedRows
    .map((competition) => ({
      competition,
      entrants: competitionEntrantCount(competition),
      itemCount: competitionItemCount(competition),
    }))
    .filter((row) => row.entrants > 0)
    .sort((a, b) => b.entrants - a.entrants || b.itemCount - a.itemCount || String(a.competition.sportName || '').localeCompare(String(b.competition.sportName || ''), 'zh-CN'));
  const top = rows[0];
  const filterLabel = [filters.year, filters.month ? `${filters.month}月` : '', filters.region, filters.status ? statusLabel(filters.status) : ''].filter(Boolean).join(' ');
  const scopeText = filterLabel || '当前数据';
  const listFilters = {
    year: filters.year || '',
    month: filters.month || '',
    region: filters.region || '',
    status: filters.status || '',
  };

  if (filters.scope === 'item') {
    const itemRows = competitionItemEntrantRows(matchedRows)
      .sort((a, b) => b.entrants - a.entrants
        || String(a.label || '').localeCompare(String(b.label || ''), 'zh-CN')
        || String(a.competition.sportName || '').localeCompare(String(b.competition.sportName || ''), 'zh-CN'));
    const topItem = itemRows[0];
    return {
      type: 'competition-stats',
      title: '参赛人数最多的项目',
      summary: topItem
        ? `${scopeText}中，${topItem.label} 的参赛规模最高，约 ${topItem.entrants} 人次，来自 ${topItem.competition.sportName}。`
        : `${scopeText}中暂时没有可用于计算项目人数的记录。`,
      cards: [
        ['最高项目', topItem ? topItem.label : '-'],
        ['最高人数', topItem ? `${topItem.entrants} 人次` : '-'],
        ['候选项目', `${itemRows.length} 个`],
        ['覆盖赛事', `${matchedRows.length} 场`],
      ],
      sections: itemRows.length ? [
        {
          title: '项目规模排行',
          rows: itemRows.slice(0, 8).map((row, index) => `${index + 1}. ${row.label} · ${row.entrants} 人次 · ${row.competition.sportName}`),
        },
        {
          title: '查看建议',
          rows: [
            '优先查看人数最高的项目，确认该组别的报名名单、俱乐部分布和历史强手。',
            '如果是未开赛项目，可以继续生成赛前情报包，用于家长和教练做备赛判断。',
          ],
        },
      ] : [],
      evidence: itemRows.slice(0, 8).map((row) => ({
        kind: '项目规模',
        label: row.label,
        detail: `${row.entrants} 人次 · ${row.competition.sportName} · ${displayDateLabel(row.competition.dateLabel)}`,
        reason: '用于核对项目或组别参赛规模排行',
        sportCode: row.competition.sportCode,
        eventCode: row.eventCode,
      })),
      actions: [
        topItem?.competition?.sportCode ? { label: '查看人数最多的项目', sportCode: topItem.competition.sportCode, eventCode: topItem.eventCode } : null,
        { label: itemRows.length ? '查看赛事列表' : '进入赛事列表', mainTab: 'competitions', filters: listFilters },
      ].filter(Boolean),
    };
  }

  return {
    type: 'competition-stats',
    title: '参赛人数最多的赛事',
    summary: top
      ? `${scopeText}中，${top.competition.sportName} 的参赛规模最高，约 ${top.entrants} 人次。`
      : `${scopeText}中暂时没有可用于计算参赛人数的赛事记录。`,
    cards: [
      ['最高人数', top ? `${top.entrants} 人次` : '-'],
      ['候选赛事', `${matchedRows.length} 场`],
      ['项目/组别', top ? `${top.itemCount || '-'} 个` : '-'],
      ['范围', scopeText],
    ],
    sections: rows.length ? [
      {
        title: '规模排行',
        rows: rows.slice(0, 6).map((row, index) => `${index + 1}. ${row.competition.sportName} · ${row.entrants} 人次 · ${displayDateLabel(row.competition.dateLabel)}`),
      },
      {
        title: '查看建议',
        rows: [
          '先打开排名靠前的赛事详情，查看项目分布和各组别人数。',
          '如果是赛前赛事，可以继续关注报名名单，等名单完整后再做对手和俱乐部分布分析。',
        ],
      },
    ] : [],
    evidence: rows.slice(0, 8).map((row) => ({
      kind: '赛事规模',
      label: row.competition.sportName,
      detail: `${row.entrants} 人次 · ${row.competition.dateLabel || '日期待确认'} · ${row.competition.venue || row.competition.region || ''}`,
      reason: '用于核对赛事参赛规模排行',
      sportCode: row.competition.sportCode,
    })),
    actions: [
      top?.competition?.sportCode ? { label: '查看人数最多的赛事', sportCode: top.competition.sportCode } : null,
      { label: rows.length ? '查看赛事列表' : '进入赛事列表', mainTab: 'competitions', filters: listFilters },
    ].filter(Boolean),
  };
}

function businessMetricRows() {
  const competitions = state.competitions || [];
  const athletes = state.athleteSearchIndex || [];
  const clubs = state.clubSearchIndex || [];
  const activeCompetitions = competitions.filter((competition) => ['registration', 'upcoming', 'live'].includes(competition.status) || competition.isPreEvent);
  const regionCount = new Set(competitions.map((competition) => competition.region || competition.venue).filter(Boolean)).size;
  const scoredCompetitions = competitions.filter((competition) => competition.status === 'completed' || competitionHasItems(competition));
  return [
    ['赛事资产', `${competitions.length} 场`],
    ['选手画像', `${athletes.length} 人`],
    ['俱乐部画像', `${clubs.length} 个`],
    ['赛前机会', `${activeCompetitions.length} 场`],
    ['地域覆盖', `${regionCount} 个`],
    ['可复盘样本', `${scoredCompetitions.length} 场`],
  ];
}

function businessRegionRows() {
  const rows = new Map();
  for (const competition of state.competitions || []) {
    const key = competition.region || competition.venue || '地区待确认';
    const current = rows.get(key) || { total: 0, active: 0 };
    current.total += 1;
    if (['registration', 'upcoming', 'live'].includes(competition.status) || competition.isPreEvent) current.active += 1;
    rows.set(key, current);
  }
  return [...rows.entries()]
    .sort((a, b) => b[1].total - a[1].total || b[1].active - a[1].active || String(a[0]).localeCompare(String(b[0]), 'zh-CN'))
    .slice(0, 5)
    .map(([region, row]) => `${region}：${row.total} 场赛事，${row.active} 场赛前/进行中`);
}

function businessClubOpportunityRows() {
  return (state.clubSearchIndex || [])
    .slice()
    .sort((a, b) => (Number(b.entrants) || 0) - (Number(a.entrants) || 0) || (Number(b.top8) || 0) - (Number(a.top8) || 0))
    .slice(0, 5)
    .map((club) => `${club.club}：${club.entrants || 0} 人次，前八 ${club.top8 || 0}，奖牌 ${club.medals || 0}`);
}

function businessCoverageOpportunityRows() {
  const competitions = state.competitions || [];
  const scoreCount = competitions.filter((competition) => competition.coverageLevel === 'score' || competitionHasItems(competition)).length;
  const rosterCount = competitions.filter((competition) => competition.coverageLevel === 'roster' || competition.rosterStatus === 'partial' || competition.rosterStatus === 'complete').length;
  const projectCount = competitions.filter((competition) => competition.coverageLevel === 'project' || competition.itemCount || competition.itemSummaries?.length).length;
  const activeCount = competitions.filter((competition) => ['registration', 'upcoming', 'live'].includes(competition.status) || competition.isPreEvent).length;
  const scoreRate = competitions.length ? Math.round((scoreCount / competitions.length) * 100) : 0;
  const rosterRate = activeCount ? Math.round((rosterCount / activeCount) * 100) : 0;
  return [
    `赛后复盘：${scoreCount} 场已有成绩/对阵，占全部赛事 ${scoreRate}%，适合先做家长成长报告和教练复盘。`,
    `赛前服务：${rosterCount} 场已有报名名单，覆盖近期/进行中赛事 ${rosterRate}%，适合做赛前情报包。`,
    `赛事目录：${projectCount} 场至少有项目结构，可先支持筛选、提醒和项目级赛前判断。`,
  ];
}

function businessRoleConversionRows() {
  const focused = aiFocusedAthletes();
  const club = state.currentClub || aiDefaultClub();
  const activeCount = (state.competitions || []).filter((competition) => ['registration', 'upcoming', 'live'].includes(competition.status) || competition.isPreEvent).length;
  return [
    `家长转化：${focused.length ? `从已关注的 ${focused.length} 名孩子生成成长报告` : '先引导关注孩子'}，再承接赛后复盘、同龄段位置和下一场建议。`,
    `教练转化：${club?.club ? `从 ${club.club} 的俱乐部画像进入学员分层` : '从俱乐部搜索进入队伍画像'}，再承接续费沟通和训练反馈。`,
    `赛事转化：围绕 ${activeCount} 场赛前/报名赛事做提醒、报名名单解读和对手情报，时间节点最明确。`,
  ];
}

function businessPriorityRows() {
  const competitions = state.competitions || [];
  const activeCount = competitions.filter((competition) => ['registration', 'upcoming', 'live'].includes(competition.status) || competition.isPreEvent).length;
  const scoreCount = competitions.filter((competition) => competition.coverageLevel === 'score' || competitionHasItems(competition)).length;
  const clubCount = (state.clubSearchIndex || []).length;
  return [
    `先做赛前情报包：当前 ${activeCount} 场赛事可触发，适合用报名截止和开赛前作为高频使用节点。`,
    `再做成长报告：当前 ${scoreCount} 场成绩样本可支撑长期复盘，适合家长会员和续费沟通。`,
    `同步做教练/俱乐部工作台：当前 ${clubCount} 个俱乐部画像可支撑学员分层、招生展示和区域竞争判断。`,
  ];
}

function businessProductOpportunityRows() {
  const activeCount = (state.competitions || []).filter((competition) => ['registration', 'upcoming', 'live'].includes(competition.status) || competition.isPreEvent).length;
  const athleteCount = (state.athleteSearchIndex || []).length;
  const clubCount = (state.clubSearchIndex || []).length;
  return [
    `家长端：用 ${athleteCount} 个选手画像生成成长报告、同龄段位置和下一场比赛建议。`,
    `教练端：用 ${clubCount} 个俱乐部画像做学员分层、重点备赛和招生展示。`,
    `赛前场景：当前 ${activeCount} 场赛前/报名赛事可转化为对手情报包和赛事提醒。`,
    '行业端：按地区、月份、项目和俱乐部活跃度输出区域增长与赛事供给判断。',
  ];
}

function businessMonetizationRows() {
  const competitions = state.competitions || [];
  const activeCount = competitions.filter((competition) => ['registration', 'upcoming', 'live'].includes(competition.status) || competition.isPreEvent).length;
  const rosterCount = competitions.filter((competition) => competition.rosterStatus === 'partial' || competition.rosterStatus === 'complete').length;
  const scoreCount = competitions.filter((competition) => competition.coverageLevel === 'score' || competitionHasItems(competition)).length;
  const followedCount = aiFocusedAthletes().length;
  const clubCount = (state.clubSearchIndex || []).length;
  return [
    `赛前情报包：用 ${activeCount} 场近期/报名赛事做高频入口，其中 ${rosterCount} 场已有报名名单，适合先做单场试用和赛前提醒。`,
    `家长成长报告：用 ${scoreCount} 场成绩样本沉淀月度/赛后复盘，当前 ${followedCount} 名关注选手可直接承接个人化报告。`,
    `教练工作台：用 ${clubCount} 个俱乐部画像承接学员分层、续费沟通和招生展示，优先服务熟悉的小型剑馆样板。`,
    '商业闭环：免费问答负责发现需求，报告负责证明价值，关注/试用负责留存，后续再扩展会员或教练端 SaaS。沿这条路径推进，避免只做泛数据浏览。',
  ];
}

function buildAiBusinessInsightReport(query) {
  const competitions = state.competitions || [];
  const activeRows = competitions
    .filter((competition) => ['registration', 'upcoming', 'live'].includes(competition.status) || competition.isPreEvent)
    .sort((a, b) => Math.abs(daysFromToday(competitionDateValue(a))) - Math.abs(daysFromToday(competitionDateValue(b))))
    .slice(0, 5);
  const topClubs = (state.clubSearchIndex || [])
    .slice()
    .sort((a, b) => (Number(b.entrants) || 0) - (Number(a.entrants) || 0))
    .slice(0, 4);

  return {
    type: 'business-insight',
    title: '击剑数据商业价值分析',
    summary: `当前数据已经可以支撑家长决策、教练经营、俱乐部增长和赛事/区域洞察；下一步重点不是继续平铺数据，而是把数据封装成报告、提醒和可追问分析。`,
    cards: businessMetricRows().slice(0, 4),
    sections: [
      {
        title: '优先落地场景',
        rows: businessPriorityRows(),
      },
      {
        title: '角色转化路径',
        rows: businessRoleConversionRows(),
      },
      {
        title: '数据成熟度',
        rows: businessCoverageOpportunityRows(),
      },
      {
        title: '产品化方向',
        rows: businessProductOpportunityRows(),
      },
      {
        title: '商业化落地顺序',
        rows: businessMonetizationRows(),
      },
      {
        title: '区域机会',
        rows: businessRegionRows(),
      },
      {
        title: '俱乐部经营入口',
        rows: businessClubOpportunityRows(),
      },
      activeRows.length ? {
        title: '近期可转化场景',
        rows: activeRows.map((competition) => `${competition.sportName} · ${displayDateLabel(competition.dateLabel)} · ${statusLabel(competition.status)}`),
      } : null,
    ].filter(Boolean),
    evidence: [
      ...activeRows.map((competition) => ({
        kind: '赛前机会',
        label: competition.sportName,
        detail: `${displayDateLabel(competition.dateLabel)} · ${competition.venue || competition.region || '地点待确认'} · ${statusLabel(competition.status)}`,
        reason: '用于判断赛前情报、提醒和报名分析场景',
        sportCode: competition.sportCode,
      })),
      ...topClubs.map((club) => ({
        kind: '俱乐部资产',
        label: club.club,
        detail: `${club.entrants || 0} 人次 · 前八 ${club.top8 || 0} · 奖牌 ${club.medals || 0}`,
        reason: '用于判断教练工作台、招生展示和俱乐部画像价值',
        clubId: club.id,
      })),
    ].slice(0, 8),
    actions: [
      { label: '查看赛事机会', mainTab: 'competitions', filters: { status: 'registration' } },
      activeRows[0]?.sportCode ? { label: '加入最近赛事提醒', followCompetitionCode: activeRows[0].sportCode } : null,
      { label: '生成赛前情报包方案', prematchTemplateKind: 'prematch-pack' },
      aiProductTemplateAthlete()?.id ? { label: '生成家长成长报告方案', parentGrowthAthleteId: aiProductTemplateAthlete().id } : null,
      aiProductTemplateClub()?.id ? { label: '生成教练工作台方案', coachSegmentationClubId: aiProductTemplateClub().id } : null,
    ].filter(Boolean),
    sourceNote: '商业洞察基于当前已收录赛事、选手、俱乐部和赛前状态生成；正式商业报告仍应结合付费用户角色和真实运营数据校准。',
  };
}

function productTemplateTitle(kind) {
  if (kind === 'prematch-pack') return '赛前情报包方案';
  if (kind === 'parent-growth-report') return '家长成长报告方案';
  if (kind === 'coach-segmentation') return '教练学员分层方案';
  return '数据报告方案';
}

function productTemplateMetricRows(kind) {
  if (kind === 'prematch-pack') {
    const active = (state.competitions || []).filter((competition) => ['registration', 'upcoming', 'live'].includes(competition.status) || competition.isPreEvent);
    const roster = active.filter((competition) => competition.rosterStatus === 'partial' || competition.rosterStatus === 'complete');
    return [
      ['可生成赛事', `${active.length} 场`],
      ['已有名单', `${roster.length} 场`],
      ['关注选手', `${aiFocusedAthletes().length} 人`],
      ['核心价值', '赛前决策'],
    ];
  }
  if (kind === 'parent-growth-report') {
    const focused = aiFocusedAthletes();
    const athleteCount = (state.athleteSearchIndex || []).length;
    return [
      ['关注孩子', `${focused.length} 人`],
      ['选手画像', `${athleteCount} 人`],
      ['核心价值', '成长判断'],
      ['交付节奏', '月/赛后'],
    ];
  }
  const clubs = state.clubSearchIndex || [];
  return [
    ['俱乐部画像', `${clubs.length} 个`],
    ['学员来源', '成绩画像'],
    ['核心价值', '留存增长'],
    ['交付节奏', '周/月'],
  ];
}

function productTemplateSections(kind) {
  if (kind === 'prematch-pack') {
    return [
      {
        title: '报告结构',
        rows: [
          '本场赛事概览：时间、地点、状态、项目和报名规模。',
          '我的孩子/学员匹配：按历史项目匹配可能参赛项目。',
          '强手与熟悉对手：按最好名次、前八、淘汰赛记录和共同赛事排序。',
          '备赛建议：给出重点训练方向和赛前沟通要点。',
        ],
      },
      {
        title: '关键指标',
        rows: [
          '报名人数、项目覆盖、关注选手匹配数、潜在强手数。',
          '历史最好名次、近期趋势、淘汰赛胜负、共同赛事证据。',
        ],
      },
      {
        title: '交付方式',
        rows: [
          '赛前 3-7 天自动生成，报名名单更新后刷新。',
          '家长版突出风险和准备重点，教练版突出对手结构和训练安排。',
        ],
      },
    ];
  }
  if (kind === 'parent-growth-report') {
    return [
      {
        title: '报告结构',
        rows: [
          '成长结论：近期变化、稳定性和下一步重点。',
          '参赛轨迹：按时间展示最近比赛、名次和项目变化。',
          '同龄位置：用同项目、同年龄段成绩判断相对位置。',
          '投入建议：用温和表达给出继续积累、重点突破或调整比赛节奏。',
        ],
      },
      {
        title: '关键指标',
        rows: [
          '参赛次数、最好名次、最近名次、小组胜率、淘汰赛胜负。',
          '年度参赛频率、名次趋势、前八/奖牌记录、关键对手。',
        ],
      },
      {
        title: '交付方式',
        rows: [
          '赛后自动生成单场复盘，按月/季度生成成长报告。',
          '首页只显示核心结论，详情页保留证据和完整时间线。',
        ],
      },
    ];
  }
  return [
    {
      title: '报告结构',
      rows: [
        '学员分层：冲成绩、稳定成长、需要关注、新手积累。',
        '训练反馈：每个学员下一步训练重点和家长沟通口径。',
        '项目矩阵：按年龄段、剑种、性别看强项和短板。',
        '经营动作：续费沟通、招生展示、重点比赛带队建议。',
      ],
    },
    {
      title: '关键指标',
      rows: [
        '参赛人次、前八、奖牌、最好名次、参赛连续性。',
        '项目投入、年龄段断层、近期可关注赛事、代表学员。',
      ],
    },
    {
      title: '交付方式',
      rows: [
        '教练首页展示本周需要关注的学员和赛事。',
        '馆长视角展示团队增长、优势项目和可分享招生卡片。',
      ],
    },
  ];
}

function productTemplateEvidence(kind) {
  if (kind === 'prematch-pack') {
    return (state.competitions || [])
      .filter((competition) => ['registration', 'upcoming', 'live'].includes(competition.status) || competition.isPreEvent)
      .slice(0, 6)
      .map((competition) => ({
        kind: '赛前赛事',
        label: competition.sportName,
        detail: `${displayDateLabel(competition.dateLabel)} · ${competition.venue || competition.region || '地点待确认'} · ${statusLabel(competition.status)}`,
        reason: '用于生成赛前情报包的赛事入口',
        sportCode: competition.sportCode,
      }));
  }
  if (kind === 'parent-growth-report') {
    return aiFocusedAthletes()
      .slice(0, 4)
      .flatMap((athlete) => topEvidenceEvents(athlete.events || [], athlete.name, 2))
      .slice(0, 6);
  }
  return (state.clubSearchIndex || [])
    .slice(0, 6)
    .map((club) => ({
      kind: '俱乐部资产',
      label: club.club,
      detail: `${club.entrants || 0} 人次 · 前八 ${club.top8 || 0} · 奖牌 ${club.medals || 0}`,
      reason: '用于生成教练工作台和学员分层',
      clubId: club.id,
    }));
}

function aiProductTemplateAthlete() {
  if (state.currentAthlete?.id) return state.currentAthlete;
  const focused = aiFocusedAthletes()[0];
  if (focused?.id) return focused;
  const selected = getSelectedChild(childCandidates());
  if (selected?.id) return selected;
  return (state.athleteSearchIndex || []).find((athlete) => athlete?.id && (athlete.events || []).length) || null;
}

function aiProductTemplateClub() {
  if (state.currentClub?.id) return state.currentClub;
  return (state.clubSearchIndex || [])
    .filter((club) => club?.id)
    .sort((a, b) => (Number(b.entrants) || 0) - (Number(a.entrants) || 0) || String(a.club || '').localeCompare(String(b.club || ''), 'zh-CN'))[0] || null;
}

function buildAiProductTemplateReport(query, kind) {
  const title = productTemplateTitle(kind);
  const templateAthlete = aiProductTemplateAthlete();
  const templateClub = aiProductTemplateClub();
  const summaryByKind = {
    'prematch-pack': '把赛前赛事、报名名单、关注选手和历史成绩合并成一份可行动的备赛报告。',
    'parent-growth-report': '把孩子的参赛轨迹、名次变化和同龄位置整理成家长能理解的成长判断。',
    'coach-segmentation': '把俱乐部学员按成绩资产、参赛连续性和近期风险分层，服务训练、续费和招生。',
  };
  return {
    type: 'product-template',
    templateKind: kind,
    title,
    summary: summaryByKind[kind] || '把底层数据整理成面向具体用户任务的报告方案。',
    cards: productTemplateMetricRows(kind),
    sections: productTemplateSections(kind),
    evidence: productTemplateEvidence(kind),
    actions: [
      kind === 'prematch-pack' ? { label: '生成赛前情报包', prematchTemplateKind: 'prematch-pack' } : null,
      kind === 'prematch-pack' ? { label: '查看赛前赛事', mainTab: 'competitions', filters: { status: 'registration' } } : null,
      kind === 'parent-growth-report' && templateAthlete?.id ? { label: '生成成长报告', parentGrowthAthleteId: templateAthlete.id } : null,
      kind === 'parent-growth-report' && templateAthlete?.id ? { label: '查看选手画像', athleteId: templateAthlete.id } : null,
      kind === 'coach-segmentation' && templateClub?.id ? { label: '生成学员分层报告', coachSegmentationClubId: templateClub.id } : null,
      kind === 'coach-segmentation' && templateClub?.id ? { label: '查看俱乐部画像', clubId: templateClub.id } : null,
    ].filter(Boolean),
    sourceNote: '报告方案基于当前可用数据生成；正式使用时应按用户角色、关注对象和赛事节点保存为独立报告。',
  };
}

function buildAiPreMatchReport(query, filters) {
  const rows = state.competitions
    .filter((competition) => {
      const yearOk = filters.year ? competitionYear(competition) === filters.year : true;
      const monthOk = filters.month ? competitionMonth(competition) === filters.month : true;
      const regionText = compactText([competition.venue, competition.region, competition.sportName].filter(Boolean).join(' '));
      const regionOk = filters.region ? regionText.includes(filters.region) : true;
      const statusOk = filters.status
        ? competition.status === filters.status
        : ['registration', 'upcoming', 'live'].includes(competition.status) || competition.isPreEvent;
      return yearOk && monthOk && regionOk && statusOk;
    })
    .sort((a, b) => {
      const dayA = Math.abs(daysFromToday(competitionDateValue(a)));
      const dayB = Math.abs(daysFromToday(competitionDateValue(b)));
      return dayA - dayB || String(a.dateLabel || '').localeCompare(String(b.dateLabel || ''), 'zh-CN');
    });
  const rosterRows = rows.filter((competition) => competition.rosterStatus === 'partial' || competition.rosterStatus === 'complete');
  const projectRows = rows.filter(competitionHasItems);
  const focusRows = aiPreMatchFocusRows(rows);
  const expectedTotal = rows.reduce((sum, competition) => sum + (Number(competition.registrationSummary?.expectedRegistrationCount) || 0), 0);
  const rosterTotal = rows.reduce((sum, competition) => sum + (Number(competition.registrationSummary?.rosterCount) || 0), 0);
  const regionLabel = filters.region || '全部地区';
  const yearLabel = filters.year || '全部年份';
  const monthLabel = filters.month ? `${filters.month}月` : '全部月份';
  const title = `${yearLabel}${filters.month ? monthLabel : ''}${regionLabel === '全部地区' ? '' : regionLabel}赛前情报`;
  const summary = rows.length
    ? `${yearLabel} ${monthLabel} ${regionLabel} 当前匹配 ${rows.length} 场赛前相关赛事，其中 ${rosterRows.length} 场已有报名信息，${projectRows.length} 场已有项目明细。`
    : `当前没有匹配到 ${yearLabel} ${monthLabel} ${regionLabel} 的赛前或报名赛事。`;

  return {
    type: 'prematch',
    title,
    summary,
    cards: [
      ['相关赛事', `${rows.length} 场`],
      ['报名信息', `${rosterRows.length} 场`],
      ['项目明细', `${projectRows.length} 场`],
      ['关注选手', focusRows.length ? `${focusRows.length} 人` : '-'],
      ['报名记录', rosterTotal || expectedTotal ? `${rosterTotal || 0}/${expectedTotal || '-'}` : '-'],
    ],
    sections: rows.length ? [
      focusRows.length ? {
        title: '关注选手',
        rows: focusRows,
      } : null,
      {
        title: '优先关注',
        rows: rows.slice(0, 5).map((competition) => `${competition.sportName} · ${displayDateLabel(competition.dateLabel)} · ${statusLabel(competition.status)} · ${coverageLabel(competition)}`),
      },
      {
        title: '数据状态',
        rows: [
          `已有报名信息：${rosterRows.length} 场`,
          `已有项目明细：${projectRows.length} 场`,
          `可用于赛前分析：${rows.filter((competition) => ['registration', 'upcoming', 'live'].includes(competition.status) || competition.isPreEvent).length} 场`,
        ],
      },
    ] : [],
    evidence: rows.slice(0, 8).map((competition) => ({
      kind: '赛前赛事',
      label: competition.sportName,
      detail: `${displayDateLabel(competition.dateLabel)} · ${competition.venue || competition.region || '地点待确认'} · ${statusLabel(competition.status)}`,
      reason: coverageDetail(competition),
      sportCode: competition.sportCode,
    })),
    actions: [
      rows[0]?.sportCode ? { label: '生成本场情报包', prematchTemplateKind: 'prematch-pack', prematchSportCode: rows[0].sportCode } : null,
      rows[0]?.sportCode ? { label: '加入赛前提醒', followCompetitionCode: rows[0].sportCode } : null,
      { label: rows.length ? '查看赛前赛事' : '进入赛事列表', mainTab: 'competitions', filters },
    ].filter(Boolean),
    sourceNote: '赛前情报基于赛事状态、项目明细和报名名单生成；名单未完整时，只做项目级和赛事级判断。',
  };
}

function buildAiAthleteComparison(query, left, right) {
  const leftEvents = left.events || [];
  const rightEvents = right.events || [];
  const shared = sharedAthleteEvents(left, right);
  const direct = directOpponentRows(left, right);
  const leftScore = athleteStrengthScore(left);
  const rightScore = athleteStrengthScore(right);
  const leader = leftScore >= rightScore ? left : right;
  const other = leader === left ? right : left;
  const rankGap = athleteRankGapText(left, right);
  const confidence = athleteComparisonConfidence(direct, shared);
  const summaryParts = [];
  if (direct.length) summaryParts.push(`发现 ${direct.length} 条直接交手或对手记录`);
  if (!direct.length && /对战|交手|谁赢|打过/.test(compactText(query))) summaryParts.push('暂未发现两人的直接交手记录');
  if (shared.length) summaryParts.push(`两人共同出现在 ${shared.length} 个项目里`);
  summaryParts.push(`${leader.name} 的综合记录更占优，主要来自最好名次、奖牌和参赛连续性`);

  return {
    type: 'comparison',
    title: `${left.name} vs ${right.name}`,
    summary: summaryParts.join('；') + '。',
    cards: [
      [left.name, athleteMetricLine(left)],
      [right.name, athleteMetricLine(right)],
      ['当前判断', `${leader.name} 略优于 ${other.name}`],
      ['证据强度', confidence],
    ],
    sections: [
      {
        title: '直接交手',
        rows: direct.length
          ? direct.slice(0, 4).map((row) => `${row.phase || '淘汰赛'}：${row.name}，${row.record || row.score || ''}`)
          : ['当前数据里没有识别到两人的直接交手；下面结论基于共同赛事、近期表现和历史成绩画像。'],
      },
      {
        title: '共同赛事',
        rows: shared.length
          ? shared.slice(0, 5).map((row) => `${row.eventName} · ${row.sportName} · ${left.name}第${row.leftRank || '-'}名 / ${right.name}第${row.rightRank || '-'}名`)
          : ['暂未发现两人出现在同一项目的记录，建议先把结论作为赛前观察线索。'],
      },
      {
        title: '近况差距',
        rows: [
          rankGap,
          `${left.name}：${athleteMetricLine(left)}`,
          `${right.name}：${athleteMetricLine(right)}`,
          `${left.name}近期：${athleteTrendLabel(leftEvents)}`,
          `${right.name}近期：${athleteTrendLabel(rightEvents)}`,
        ],
      },
      {
        title: '关键风险',
        rows: athleteComparisonRiskRows({ left, right, leader, other, direct, shared }),
      },
    ],
    evidence: [
      ...shared.slice(0, 5).map((row) => ({
        kind: '共同项目',
        label: row.eventName,
        detail: `${row.sportName} · ${left.name} 第${row.leftRank || '-'}名，${right.name} 第${row.rightRank || '-'}名`,
        reason: '用于比较同一项目里的名次差距',
        eventCode: row.eventCode,
      })),
      ...topEvidenceEvents(leftEvents, left.name, 2),
      ...topEvidenceEvents(rightEvents, right.name, 2),
    ].slice(0, 7),
    actions: [
      left.id ? { label: `查看${left.name}`, athleteId: left.id } : null,
      right.id ? { label: `查看${right.name}`, athleteId: right.id } : null,
      aiFollowAthleteAction(leader),
    ].filter(Boolean),
    sourceNote: '回答由本地比赛成绩、选手画像和对阵记录生成；没有直接交手时，不会推断真实胜负。',
  };
}

function athleteComparisonRiskRows({ left, right, leader, other, direct, shared }) {
  const rows = [];
  if (!direct.length) rows.push('没有直接交手记录，不能把历史名次直接等同为真实胜负关系。');
  if (!shared.length) rows.push('共同赛事不足，赛前更适合关注项目匹配和近期状态，而不是下确定结论。');
  if (Math.abs((left.bestRank || 999) - (right.bestRank || 999)) <= 2) rows.push('最好名次接近，临场状态和签表位置可能比历史最好名次更关键。');
  if ((other.eliminationWins || 0) > (leader.eliminationWins || 0)) rows.push((other.name || '对手') + ' 淘汰赛推进记录不弱，需要重点看关键分处理。');
  if ((left.appearances || 0) < 2 || (right.appearances || 0) < 2) rows.push('一方参赛样本偏少，建议补看最近项目名单和同组对手。');
  rows.push('当前更适合把 ' + (leader.name || '优势方') + ' 作为强度参照，同时保留对 ' + (other.name || '另一方') + ' 近期状态的观察。');
  return rows.slice(0, 4);
}

function buildAiAthleteGrowth(query, athlete) {
  const events = athlete.events || [];
  const latest = events[0] || null;
  const best = [...events].sort((a, b) => (Number(a.finalRank) || 999) - (Number(b.finalRank) || 999))[0] || null;
  const trend = athleteTrendLabel(events);
  return {
    type: 'growth',
    title: `${athlete.name}的成长分析`,
    summary: `${athlete.name} 已有 ${events.length || athlete.appearances || 0} 场参赛表现，最好名次${best?.finalRank ? `第${best.finalRank}名` : '待确认'}，近期变化：${trend}。`,
    cards: [
      ['最好名次', best?.finalRank ? `第${best.finalRank}名` : '-'],
      ['最近一次', latest?.finalRank ? `第${latest.finalRank}名` : '-'],
      ['奖牌', `${athlete.medals || 0} 枚`],
      ['淘汰赛', `${athlete.eliminationWins || 0}胜${athlete.eliminationLosses || 0}负`],
    ],
    sections: [
      {
        title: '近期参赛',
        rows: events.slice(0, 5).map((event) => `${displayEventName(event)} · 第${event.finalRank ?? '-'}名 · ${event.sportName}`),
      },
      (athlete.opponents || []).length ? {
        title: '重点对手',
        rows: athlete.opponents.slice(0, 4).map((opponent) => `${opponent.name}：${opponent.wins}胜${opponent.losses}负 · ${opponent.latestPhase || '淘汰赛'}`),
      } : null,
    ].filter(Boolean),
    evidence: topEvidenceEvents(events, athlete.name, 7),
    actions: [
      athlete.id ? { label: '查看完整选手画像', athleteId: athlete.id } : null,
      aiFollowAthleteAction(athlete),
    ].filter(Boolean),
  };
}

function buildAiClubReport(query, club) {
  const athletes = clubWorkspaceAthletes(club).slice(0, 5);
  const hints = aiProjectHints(query);
  const allProjects = clubProjectRows(club);
  const matchedProjects = hints.length
    ? allProjects.filter((row) => projectMatchesAiHints(row.label, hints))
    : allProjects;
  const projects = (matchedProjects.length ? matchedProjects : allProjects).slice(0, 5);
  const bestProject = projects[0] || null;
  const projectScope = hints.length ? hints.join(' ') : '';
  return {
    type: 'club',
    title: `${club.club}${projectScope ? ` ${projectScope}` : ''}分析`,
    summary: `${club.club} 已有 ${club.entrants || 0} 人次参赛、${club.top8 || 0} 次前八、${club.medals || 0} 枚奖牌表现。${hints.length && matchedProjects.length ? `本次问题重点匹配 ${matchedProjects.length} 个项目。` : ''}${bestProject ? `优势项目集中在 ${bestProject.label}。` : ''}`,
    cards: [
      ['参赛人次', club.entrants || 0],
      ['前八', club.top8 || 0],
      ['奖牌', club.medals || 0],
      ['最好名次', club.bestRank ? `第${club.bestRank}名` : '-'],
    ],
    sections: [
      athletes.length ? {
        title: '代表选手',
        rows: athletes.map((athlete) => `${athlete.name} · 最好第${athlete.bestRank || '-'}名 · ${athlete.appearances || 0}次记录`),
      } : null,
      projects.length ? {
        title: hints.length ? '匹配项目' : '优势项目',
        rows: projects.map((row) => `${row.label}：${row.entrants}人次，前八${row.top8}，奖牌${row.medals}`),
      } : null,
    ].filter(Boolean),
    evidence: (club.events || []).slice(0, 7).map((event) => ({
      kind: '俱乐部记录',
      label: displayEventName(event),
      detail: `${event.sportName || ''} · ${event.openDate || ''}`,
      reason: '用于核对俱乐部参赛项目和成绩来源',
      eventCode: event.eventCode,
    })),
    actions: club.id ? [{ label: '查看俱乐部画像', clubId: club.id }] : [],
  };
}

function buildAiClubRecruitingReport(query, club) {
  const athletes = clubWorkspaceAthletes(club);
  const projectRows = clubProjectRows(club);
  const peerRows = clubPeerRows(club, projectRows);
  const cards = buildClubBusinessCards(club, projectRows, athletes, peerRows).slice(0, 4);
  const scripts = buildClubCommunicationScripts(club, projectRows, athletes).slice(0, 4);
  const shareHighlights = clubShareHighlights(club, projectRows, athletes).slice(0, 4);
  const topProject = projectRows[0] || null;
  const strongestAthlete = athletes[0] || null;
  const evidenceEvents = (club.events || []).slice(0, 5);
  return {
    type: 'club-recruiting',
    title: `${club.club}招生展示建议`,
    summary: `${club.club} 可以先用可核对成绩资产做对外展示：${shareHighlights.join('，') || '参赛记录持续积累中'}。表达重点应放在项目积累、代表学员和比赛经历，而不是泛泛介绍课程。`,
    cards: cards.map((card) => [card.title, card.value]),
    sections: [
      {
        title: '对外可讲',
        rows: scripts.length ? scripts.map((row) => `${row.title}：${row.detail}`) : ['先沉淀参赛记录、代表项目和代表学员，再形成稳定招生素材。'],
      },
      {
        title: '展示顺序',
        rows: [
          topProject ? `先讲优势项目：${topProject.label}，参赛 ${topProject.entrants || 0} 人次，最好第 ${topProject.bestRank ?? '-'} 名。` : '先讲当前已有参赛基础和训练方向。',
          strongestAthlete ? `再讲成长案例：${strongestAthlete.name}，最好第 ${strongestAthlete.bestRank ?? '-'} 名，${strongestAthlete.appearances || 0} 次记录。` : '再讲学员参赛经历和持续记录。',
          '最后给家长明确下一步：适合参加哪些项目、如何准备近期比赛、如何看成长变化。',
        ],
      },
      peerRows.length ? {
        title: '同项目参照',
        rows: peerRows.slice(0, 3).map((peer) => `${peer.club}：重合项目 ${peer.overlapCount} 个，前八 ${peer.overlapTop8}，最好第 ${peer.bestRank ?? '-'} 名。`),
      } : null,
    ].filter(Boolean),
    evidence: evidenceEvents.map((event) => ({
      kind: '招生素材来源',
      label: displayEventName(event),
      detail: `${event.sportName || ''} · ${event.openDate || '日期待确认'} · 最好第 ${event.bestRank ?? '-'} 名`,
      reason: '用于支撑对外展示中的成绩、项目和参赛经历',
      eventCode: event.eventCode,
    })),
    actions: [
      club.id ? { label: '查看招生名片', clubId: club.id } : null,
      club.id ? { label: '生成学员分层报告', coachSegmentationClubId: club.id } : null,
    ].filter(Boolean),
    sourceNote: '招生展示建议只使用已收录公开赛事成绩，不替代真实教学承诺；对外表达应避免夸大名次和升学效果。',
  };
}

function athleteStrengthScore(athlete) {
  const bestRankScore = athlete.bestRank ? Math.max(0, 120 - Number(athlete.bestRank) * 6) : 0;
  return bestRankScore + (athlete.medals || 0) * 12 + (athlete.appearances || 0) * 1.5 + (athlete.eliminationWins || 0) * 2 - (athlete.eliminationLosses || 0);
}

function athleteMetricLine(athlete) {
  return `最好第${athlete.bestRank || '-'}名 · ${athlete.appearances || athlete.events?.length || 0}次 · ${athlete.medals || 0}奖牌`;
}

function athleteComparisonConfidence(direct, shared) {
  if (direct.length) return '有直接交手';
  if (shared.length >= 3) return '共同赛事较多';
  if (shared.length) return '有共同赛事';
  return '历史画像对比';
}

function athleteRankGapText(left, right) {
  const leftRank = Number(left.bestRank || 0);
  const rightRank = Number(right.bestRank || 0);
  if (!leftRank || !rightRank) return '最好名次：至少一方名次缺失，先看参赛次数和奖牌。';
  if (leftRank === rightRank) return `最好名次：两人当前最好名次相同，都是第${leftRank}名。`;
  const leader = leftRank < rightRank ? left : right;
  const other = leader === left ? right : left;
  return `最好名次：${leader.name} 第${Math.min(leftRank, rightRank)}名，领先 ${other.name} ${Math.abs(leftRank - rightRank)} 个名次。`;
}

function athleteTrendLabel(events) {
  if (!events?.length) return '暂无记录';
  if (events.length === 1) return '需要更多比赛确认';
  const latest = Number(events[0].finalRank || 0);
  const previous = Number(events[1].finalRank || 0);
  if (!latest || !previous) return '部分名次缺失';
  if (latest < previous) return `较上次提升 ${previous - latest} 名`;
  if (latest > previous) return `较上次后退 ${latest - previous} 名`;
  return '最近两次名次稳定';
}

function sharedAthleteEvents(left, right) {
  const rightByEvent = new Map((right.events || []).map((event) => [event.eventCode, event]));
  return (left.events || [])
    .filter((event) => event.eventCode && rightByEvent.has(event.eventCode))
    .map((event) => {
      const other = rightByEvent.get(event.eventCode);
      return {
        eventCode: event.eventCode,
        eventName: displayEventName(event),
        sportName: event.sportName,
        leftRank: event.finalRank,
        rightRank: other.finalRank,
      };
    });
}

function directOpponentRows(left, right) {
  const rightName = compactText(right.name);
  const leftName = compactText(left.name);
  const rows = [];
  for (const opponent of left.opponents || []) {
    if (compactText(opponent.name) === rightName) {
      rows.push({
        name: `${left.name} vs ${right.name}`,
        phase: opponent.latestPhase,
        record: `${left.name} ${opponent.wins}胜${opponent.losses}负`,
        score: opponent.latestScore,
      });
    }
  }
  for (const opponent of right.opponents || []) {
    if (compactText(opponent.name) === leftName) {
      rows.push({
        name: `${right.name} vs ${left.name}`,
        phase: opponent.latestPhase,
        record: `${right.name} ${opponent.wins}胜${opponent.losses}负`,
        score: opponent.latestScore,
      });
    }
  }
  return rows;
}

function topEvidenceEvents(events, owner, limit = 5) {
  return (events || []).slice(0, limit).map((event) => ({
    kind: '选手成绩',
    label: displayEventName(event),
    detail: `${owner} · ${event.sportName || ''} · 第${event.finalRank ?? '-'}名 · ${event.openDate || ''}`,
    reason: '用于核对选手名次、时间和参赛项目',
    eventCode: event.eventCode,
  }));
}

function aiEvidenceKind(row) {
  return row.kind || (row.sportCode ? '赛事记录' : row.eventCode ? '项目记录' : '数据来源');
}

function aiTrustRows(report) {
  const evidence = report.evidence || [];
  const evidenceKinds = [...new Set(evidence.map((row) => aiEvidenceKind(row)).filter(Boolean))].slice(0, 3);
  const rows = [];
  if (evidence.length) {
    rows.push({
      label: '参考记录',
      value: `${evidence.length} 条`,
      detail: evidenceKinds.length ? evidenceKinds.join(' / ') : '比赛、项目和选手记录',
    });
  }

  if (report.type === 'comparison') {
    const confidence = report.cards?.find(([label]) => label === '证据强度')?.[1] || '历史画像对比';
    rows.push({
      label: '判断口径',
      value: confidence,
      detail: '优先看直接交手，其次看共同赛事、近期状态和历史成绩画像。',
    });
  } else if (report.type === 'growth') {
    rows.push({
      label: '判断口径',
      value: '成长趋势',
      detail: '按最近参赛、最好名次、奖牌和淘汰赛记录综合判断。',
    });
  } else if (report.type === 'club') {
    rows.push({
      label: '判断口径',
      value: '俱乐部画像',
      detail: '按参赛人次、前八、奖牌、代表选手和优势项目综合判断。',
    });
  } else if (report.type === 'club-recruiting') {
    rows.push({
      label: '判断口径',
      value: '招生展示',
      detail: '按成绩资产、优势项目、代表学员和对外沟通素材综合判断。',
    });
  } else if (report.type === 'prematch') {
    rows.push({
      label: '判断口径',
      value: '赛前信息',
      detail: '按赛事状态、项目明细、报名名单和关注选手匹配生成。',
    });
  } else if (report.type === 'competition-stats') {
    rows.push({
      label: '判断口径',
      value: '赛事筛选',
      detail: '按年份、月份、地区和状态筛选赛事列表。',
    });
  } else if (report.type === 'business-insight') {
    rows.push({
      label: '判断口径',
      value: '商业机会',
      detail: '按赛事资产、选手画像、俱乐部画像和赛前机会判断服务方向。',
    });
  } else if (report.type === 'product-template') {
    rows.push({
      label: '判断口径',
      value: '报告方案',
      detail: '按用户角色、使用场景、关键指标和可核对证据组织成可交付报告。',
    });
  }

  return rows.slice(0, 3);
}

function aiFollowAthleteAction(athlete) {
  if (!athlete?.id) return null;
  const followed = (state.followedAthletes || []).some((item) => item.id === athlete.id);
  if (followed) return null;
  return {
    label: athlete.name ? `关注${athlete.name}` : '加入关注',
    followAthleteId: athlete.id,
  };
}

function aiNextStepRows(report) {
  const rowsByType = {
    'competition-stats': [
      '先进入匹配赛事列表，按状态和月份缩小范围。',
      '如果关注某场比赛，打开详情后看项目、报名和赛后成绩入口。',
    ],
    prematch: [
      '先看最近开赛和报名中的赛事，确认孩子或学员所在项目。',
      '报名动态完整后，再重点看同组对手、强手和主要俱乐部分布。',
    ],
    comparison: [
      '先查看共同项目和直接交手记录，再判断两名选手差距。',
      '没有直接交手时，只把历史名次和共同赛事作为参考。',
    ],
    growth: [
      '先看最近几场名次变化，再结合小组赛和淘汰赛表现复盘。',
      '把孩子设为关注后，可从首页持续查看成长变化。',
    ],
    club: [
      '先看优势项目和代表学员，再进入俱乐部画像查看队伍结构。',
      '赛前可结合本馆项目和报名名单做备赛沟通。',
    ],
    'club-recruiting': [
      '先把可核对的成绩和代表项目整理成对外素材。',
      '再用学员分层报告支撑续费沟通和招生转化。',
    ],
    'business-insight': [
      '先把赛前情报包和选手成长报告做成稳定报告。',
      '再把教练工作台围绕学员分层、续费沟通和招生展示做闭环。',
    ],
    'product-template': [
      '先用真实用户熟悉的对象跑一版模板，确认信息顺序和表达口径。',
      '再把模板沉淀成可保存、可分享、可定期更新的报告。',
    ],
  };
  return rowsByType[report.type] || [
    '先打开相关记录，再进入对应页面继续查看。',
  ];
}

function aiFollowUpPrompts(report) {
  const filters = report.actions?.find((action) => action.filters)?.filters || {};
  const region = filters.region || '天津';
  const year = filters.year || '2026';
  const month = filters.month ? `${filters.month}月` : '';
  if (report.type === 'competition-stats') {
    return [
      `${year}${month}${region}报名情况`,
      `${region}近期有哪些比赛`,
    ];
  }
  if (report.type === 'prematch') {
    return [
      `${year}${month}${region}有几场比赛`,
      '山东小众体育 U8 男花怎么样',
    ];
  }
  if (report.type === 'comparison') {
    const [left, right] = String(report.title || '').split(/\s+vs\s+/i);
    return [left && `${left}最近几场有没有进步`, right && `${right}最近几场有没有进步`].filter(Boolean);
  }
  if (report.type === 'growth') {
    const athlete = String(report.title || '').replace(/的成长趋势$|成长报告$/g, '').trim();
    return [
      athlete ? `分析${athlete}和马潇的对比情况` : '分析马潇和陶嘉月的对比情况',
      '天津近期报名情况',
    ];
  }
  if (report.type === 'club') {
    const clubName = String(report.title || '').split(' ')[0] || '山东小众体育';
    return [
      `${clubName}有哪些优势项目`,
      '天津近期报名情况',
    ];
  }
  if (report.type === 'club-recruiting') {
    const clubName = String(report.title || '').replace(/招生展示建议$/, '') || '山东小众体育';
    return [
      `${clubName}有哪些优势项目`,
      `生成${clubName}学员分层报告`,
    ];
  }
  if (report.type === 'business-insight') {
    return [
      '教练端最值得做哪些分析',
      '天津近期报名情况',
    ];
  }
  if (report.type === 'product-template') {
    return [
      '这些击剑数据能产生什么商业价值',
      report.templateKind === 'prematch-pack' ? '天津近期报名情况' : '生成赛前情报包',
    ];
  }
  return aiPromptPresets().slice(0, 2);
}

function buildAiAnswerFeedbackText(report, feedbackType) {
  const label = feedbackType === 'ai-helpful' ? '有帮助' : '需要调整';
  const conversionAction = aiReportConversionAction(report);
  return [
    `FencingAI 回答反馈：${label}`,
    `类型：${aiHistoryTypeLabel(report.type)}`,
    `标题：${report.title || '数据分析'}`,
    report.query ? `原始问题：${report.query}` : '',
    conversionAction?.source ? `转化来源：${conversionAction.source}` : '',
    conversionAction?.title ? `关联服务：${conversionAction.title}` : '',
    report.summary ? `摘要：${report.summary}` : '',
    '补充说明：用户从 AI 回答页提交。',
  ].filter(Boolean).concat(relevanceRows.slice(0, 3).map((row, index) => `与你相关${index + 1}：${row.title}，${row.action}`)).join('\n');
}

async function submitAiAnswerFeedback(report, feedbackType) {
  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deviceId: state.deviceId,
      type: feedbackType,
      subject: {
        id: `ai:${report.type || 'answer'}:${String(report.title || 'untitled').slice(0, 80)}`,
        name: report.title || 'FencingAI 回答',
        type: report.type || 'answer',
        club: aiHistoryTypeLabel(report.type),
        query: report.query || report.summary || '',
      },
      message: buildAiAnswerFeedbackText(report, feedbackType),
    }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.message || 'submit failed');
  return result;
}
function buildAiAnswerShareText(report) {
  const lines = [
    `FencingAI 分析：${report.title || '数据分析'}`,
    report.summary || '',
  ];

  if (report.cards?.length) {
    lines.push('', '关键指标');
    report.cards.slice(0, 6).forEach(([label, value]) => lines.push(`- ${label}：${value}`));
  }

  const trustRows = aiTrustRows(report);
  if (trustRows.length) {
    lines.push('', '判断依据');
    trustRows.forEach((row) => lines.push(`- ${row.label}：${row.value}${row.detail ? `，${row.detail}` : ''}`));
  }

  (report.sections || []).slice(0, 4).forEach((section) => {
    lines.push('', section.title);
    (section.rows || []).slice(0, 5).forEach((row) => lines.push(`- ${row}`));
  });

  const nextSteps = aiNextStepRows(report).slice(0, 2);
  if (nextSteps.length) {
    lines.push('', '下一步');
    nextSteps.forEach((row) => lines.push(`- ${row}`));
  }

  lines.push('', '由 FencingAI 基于已收录赛事数据生成');
  return lines.filter((line, index) => line !== '' || lines[index - 1] !== '').join('\n').trim();
}

function aiReportConversionAction(report = {}) {
  const type = report.type || 'answer';
  const templateKind = report.templateKind || '';
  const title = report.title || 'FencingAI 分析';
  if (type === 'empty' || type === 'fallback') return null;
  if (type === 'prematch') {
    return {
      source: 'ai-prematch-answer',
      title: '把这份赛前分析做成提醒',
      detail: '适合持续跟进报名名单、关注选手和重点对手。',
      primaryLabel: '申请赛前试用',
      secondaryLabel: '了解会员权益',
    };
  }
  if (type === 'growth') {
    return {
      source: 'ai-growth-answer',
      title: '生成持续成长报告',
      detail: '适合按月/按赛事复盘孩子进步、稳定性和下一步投入。',
      primaryLabel: '申请家庭试用',
      secondaryLabel: '了解会员权益',
    };
  }
  if (type === 'club' || type === 'club-recruiting') {
    return {
      source: type === 'club-recruiting' ? 'ai-club-recruiting-answer' : 'ai-club-answer',
      title: '建立剑馆经营看板',
      detail: '适合把学员分层、强项项目和招生素材做成固定工作台。',
      primaryLabel: '申请教练试用',
      secondaryLabel: '了解剑馆权益',
    };
  }
  if (type === 'competition-stats') {
    return {
      source: 'ai-competition-stats-answer',
      title: '订阅赛事和报名提醒',
      detail: '适合持续跟踪目标地区、项目和状态变化。',
      primaryLabel: '申请赛事提醒',
      secondaryLabel: '了解会员权益',
    };
  }
  if (type === 'comparison') {
    return {
      source: 'ai-comparison-answer',
      title: '持续跟踪这组选手',
      detail: '适合赛前复盘交手记录、共同项目和近期状态变化。',
      primaryLabel: '申请对手分析',
      secondaryLabel: '了解会员权益',
    };
  }
  if (type === 'business-insight' || type === 'product-template') {
    return {
      source: templateKind ? `ai-template-${templateKind}` : 'ai-business-insight-answer',
      title: type === 'product-template' ? '落地这类报告服务' : '申请产品试用',
      detail: type === 'product-template' ? `围绕“${title}”验证真实用户是否愿意持续使用。` : '适合验证赛前情报、成长报告和教练工作台的商业转化。',
      primaryLabel: '申请试用',
      secondaryLabel: '了解会员权益',
    };
  }
  return {
    source: `ai-${type}-answer`,
    title: '持续使用这类分析',
    detail: '适合把本次分析沉淀为后续提醒、报告或工作台。',
    primaryLabel: '申请试用',
    secondaryLabel: '了解会员权益',
  };
}

function aiConversionServiceRows(report = {}) {
  const type = report.type || '';
  if (type === 'prematch' || report.templateKind === 'prematch-pack') {
    return [
      '重点赛事提醒和报名名单更新',
      '关注选手的潜在对手与强手提示',
      '赛前可分享的备赛摘要',
    ];
  }
  if (type === 'growth' || report.templateKind === 'parent-growth-report') {
    return [
      '孩子的月度/赛事成长报告',
      '近期进步、稳定性和突破点提示',
      '下一场比赛前的关注清单',
    ];
  }
  if (type === 'club' || type === 'club-recruiting' || report.templateKind === 'coach-segmentation') {
    return [
      '学员分层和训练跟进建议',
      '优势项目、代表学员和招生素材',
      '同项目俱乐部对标与经营动作',
    ];
  }
  if (type === 'competition-stats') {
    return [
      '目标地区和年份的赛事更新提醒',
      '报名中、未开赛和已结束赛事分层',
      '可继续生成赛前情报的赛事入口',
    ];
  }
  return [
    '把本次分析保存为后续报告入口',
    '围绕关注选手、赛事和俱乐部持续更新',
    '需要时补充人工跟进和试用说明',
  ];
}

function renderAiConversionBlock(report = {}) {
  const action = aiReportConversionAction(report);
  if (!action) return '';
  const services = aiConversionServiceRows(report);
  return `
    <div class="ai-conversion-card">
      <div>
        <strong>${escapeHtml(action.title)}</strong>
        <span>${escapeHtml(action.detail)}</span>
      </div>
      <div class="ai-conversion-service">
        <b>试用包含</b>
        ${services.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}
      </div>
      <div class="ai-conversion-actions">
        <button type="button" data-commercial-intent="pilot" data-commercial-source="${escapeHtml(action.source)}" data-report-title="${escapeHtml(action.title)}">${escapeHtml(action.primaryLabel)}</button>
        <button type="button" data-commercial-intent="membership" data-commercial-source="${escapeHtml(action.source)}" data-report-title="${escapeHtml(action.title)}">${escapeHtml(action.secondaryLabel)}</button>
        <button type="button" data-report-export="${escapeHtml(action.source)}">保存 PDF</button>
      </div>
    </div>
  `;
}

function renderAiAnswer(report) {
  const followUps = aiFollowUpPrompts(report).slice(0, 2);
  const trustRows = aiTrustRows(report);
  return `
    <div class="ai-answer-card">
      <div class="ai-answer-head">
        <span>${escapeHtml(report.type === 'comparison' ? '选手对比' : report.type === 'growth' ? '成长分析' : report.type === 'club' ? '俱乐部画像' : report.type === 'prematch' ? '赛前情报' : report.type === 'business-insight' ? '商业洞察' : report.type === 'product-template' ? '报告方案' : report.type === 'club-recruiting' ? '招生展示' : '数据助手')}</span>
        <strong>${escapeHtml(report.title)}</strong>
        <p>${escapeHtml(report.summary)}</p>
      </div>
      ${report.cards?.length ? `
        <div class="ai-metric-grid">
          ${report.cards.map(([label, value]) => `
            <div class="ai-metric">
              <strong>${escapeHtml(value)}</strong>
              <span>${escapeHtml(label)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${trustRows.length ? `
        <div class="ai-trust-panel">
          <strong>判断依据</strong>
          ${trustRows.map((row) => `
            <div class="ai-trust-row">
              <span>${escapeHtml(row.label)}</span>
              <b>${escapeHtml(row.value)}</b>
              <em>${escapeHtml(row.detail)}</em>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${(report.sections || []).map((section) => `
        <div class="ai-section">
          <strong>${escapeHtml(section.title)}</strong>
          ${section.rows.map((row) => `<span>${escapeHtml(row)}</span>`).join('')}
        </div>
      `).join('')}
      ${report.actions?.length ? `
        <div class="ai-action-block">
          <strong>可继续操作</strong>
          <div class="ai-action-row">
            ${report.actions.map((action) => `
              <button type="button" ${action.athleteId ? `data-athlete-id="${escapeHtml(action.athleteId)}"` : ''} ${action.parentGrowthAthleteId ? `data-parent-growth-athlete-id="${escapeHtml(action.parentGrowthAthleteId)}"` : ''} ${action.coachSegmentationClubId ? `data-coach-segmentation-club-id="${escapeHtml(action.coachSegmentationClubId)}"` : ''} ${action.followAthleteId ? `data-follow-athlete-id="${escapeHtml(action.followAthleteId)}"` : ''} ${action.followCompetitionCode ? `data-follow-competition-code="${escapeHtml(action.followCompetitionCode)}"` : ''} ${action.sportCode ? `data-sport-code="${escapeHtml(action.sportCode)}"` : ''} ${action.clubId ? `data-club-id="${escapeHtml(action.clubId)}"` : ''} ${action.prematchTemplateKind ? `data-prematch-template="${escapeHtml(action.prematchTemplateKind)}"` : ''} ${action.prematchSportCode ? `data-prematch-sport-code="${escapeHtml(action.prematchSportCode)}"` : ''} ${action.mainTab ? `data-main-target="${escapeHtml(action.mainTab)}"` : ''} ${action.filters ? `data-ai-filters="${escapeHtml(encodeURIComponent(JSON.stringify(action.filters)))}"` : ''}>
                ${escapeHtml(action.label)}
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}
      ${report.evidence?.length ? `
        <div class="ai-evidence">
          <div class="chart-title">证据来源</div>
          ${report.evidence.map((row) => `
            <button type="button" ${row.eventCode ? `data-event-code="${escapeHtml(row.eventCode)}"` : ''} ${row.sportCode ? `data-sport-code="${escapeHtml(row.sportCode)}"` : ''} ${row.clubId ? `data-club-id="${escapeHtml(row.clubId)}"` : ''}>
              <em>${escapeHtml(aiEvidenceKind(row))}</em>
              <strong>${escapeHtml(row.label)}</strong>
              <span>${escapeHtml(row.detail)}</span>
            </button>
          `).join('')}
        </div>
      ` : ''}
      <div class="ai-next-steps">
        <strong>下一步</strong>
        ${aiNextStepRows(report).map((row) => `<span>${escapeHtml(row)}</span>`).join('')}
      </div>
      ${renderAiConversionBlock(report)}
      <div class="ai-share-row">
        <button type="button" data-ai-share>复制分析摘要</button>
        <button type="button" data-ai-feedback="ai-helpful">有帮助</button>
        <button type="button" data-ai-feedback="ai-needs-work">需要调整</button>
      </div>
      ${followUps.length ? `
        <div class="ai-follow-up-row">
          <strong>继续问</strong>
          <div>
            ${followUps.map((prompt) => `<button type="button" data-ai-follow-up="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function bindAiAnswerActions(container) {
  container.querySelectorAll('[data-ai-share]').forEach((button) => {
    const card = button.closest('.ai-answer-card');
    const report = card?.__aiReport;
    bindCopyTextButton(button, () => buildAiAnswerShareText(report || {}), `ai-${report?.type || 'unknown'}`);
  });
  container.querySelectorAll('[data-ai-feedback]').forEach((button) => {
    button.addEventListener('click', async () => {
      const card = button.closest('.ai-answer-card');
      const report = card?.__aiReport;
      const originalLabel = button.textContent;
      button.disabled = true;
      button.textContent = '提交中';
      try {
        await submitAiAnswerFeedback(report || {}, button.dataset.aiFeedback);
        button.textContent = '已收到';
      } catch {
        button.textContent = '稍后再试';
      }
      setTimeout(() => {
        button.textContent = originalLabel;
        button.disabled = false;
      }, 1600);
    });
  });
  container.querySelectorAll('[data-event-code]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.eventCode) openEvent(button.dataset.eventCode);
    });
  });
  container.querySelectorAll('[data-sport-code]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.sportCode) openCompetition(button.dataset.sportCode);
    });
  });
  container.querySelectorAll('[data-athlete-id]').forEach((button) => {
    button.addEventListener('click', () => openAthlete(button.dataset.athleteId));
  });
  container.querySelectorAll('[data-parent-growth-athlete-id]').forEach((button) => {
    button.addEventListener('click', () => openParentGrowthReport(button.dataset.parentGrowthAthleteId));
  });
  container.querySelectorAll('[data-coach-segmentation-club-id]').forEach((button) => {
    button.addEventListener('click', () => openCoachSegmentationReport(button.dataset.coachSegmentationClubId));
  });
  container.querySelectorAll('[data-follow-athlete-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      const athlete = findAthleteByReference({ id: button.dataset.followAthleteId });
      if (!athlete?.id) return;
      await upsertFollowedAthlete(athlete);
      button.textContent = '已加入关注';
      button.disabled = true;
      button.setAttribute('aria-pressed', 'true');
    });
  });
  container.querySelectorAll('[data-follow-competition-code]').forEach((button) => {
    button.addEventListener('click', () => {
      const competition = findCompetitionBySportCode(button.dataset.followCompetitionCode);
      if (!competition?.sportCode) return;
      upsertFollowedCompetition(competition);
      button.textContent = '已加入赛前提醒';
      button.setAttribute('aria-pressed', 'true');
      navigateMain('follow');
    });
  });
  container.querySelectorAll('[data-club-id]').forEach((button) => {
    button.addEventListener('click', () => openClub(button.dataset.clubId));
  });
  container.querySelectorAll('[data-prematch-template]').forEach((button) => {
    button.addEventListener('click', () => openPrematchReport(button.dataset.prematchTemplate || 'prematch-pack', button.dataset.prematchSportCode || ''));
  });
  container.querySelectorAll('[data-main-target]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.mainTarget === 'competitions' && button.dataset.aiFilters) {
        try {
          applyAiCompetitionFilters(JSON.parse(decodeURIComponent(button.dataset.aiFilters)));
          return;
        } catch {
          // Fall through to the requested tab if a saved action payload is malformed.
        }
      }
      navigateMain(button.dataset.mainTarget);
    });
  });
  bindReportConversionActions(container);
}

function renderFocusPage() {
  if (!focusPage) return;
  const children = focusAthleteCards();
  const followedCompetitions = followedCompetitionCards();
  const suggestedCompetitions = focusSuggestionCompetitions();
  const reminderSourceCompetitions = followedCompetitions.length ? followedCompetitions : suggestedCompetitions;
  const priorityCompetitions = focusCompetitionPriorityRows(reminderSourceCompetitions);
  const showingSuggestions = !followedCompetitions.length && priorityCompetitions.length;
  focusPage.innerHTML = `
    <section class="panel focus-dashboard">
      <div class="section-title">
        <h2>关注工作台</h2>
        <span>赛前与成长</span>
      </div>
      <div class="focus-dashboard-grid">
        <div>
          <strong>${escapeHtml(children.length)}</strong>
          <span>关注选手</span>
        </div>
        <div>
          <strong>${escapeHtml(followedCompetitions.length)}</strong>
          <span>关注赛事</span>
        </div>
        <div>
          <strong>${escapeHtml(priorityCompetitions.length)}</strong>
          <span>近期提醒</span>
        </div>
      </div>
      <div class="focus-next-step">
        <strong>${escapeHtml(showingSuggestions ? '先加入近期提醒' : priorityCompetitions.length ? '先看近期赛事' : children.length ? '先看成长变化' : '先添加关注')}</strong>
        <span>${escapeHtml(priorityCompetitions[0]?.sportName || children[0]?.summary || '从选手或赛事详情页添加关注后，这里会形成赛前提醒和成长入口。')}</span>
      </div>
    </section>
    <section class="panel my-section focus-trial-card">
      <div>
        <strong>提醒服务</strong>
        <span>${escapeHtml(priorityCompetitions.length ? '把关注赛事、重点选手和赛前情报固定下来，关键比赛前直接查看。' : '关注选手或赛事后，可持续形成赛前提醒、成长报告和复盘入口。')}</span>
      </div>
      <div class="focus-trial-actions">
        <button type="button" data-reminder-interest data-commercial-source="focus-reminder" data-report-title="关注提醒订阅">订阅提醒</button>
        <button type="button" data-commercial-intent="pilot" data-commercial-source="focus-workspace" data-report-title="关注提醒服务">申请试用</button>
      </div>
    </section>
    <section class="panel my-section">
      <div class="section-title">
        <h2>关注选手</h2>
        <span>${children.length ? '成长入口' : '待关注'}</span>
      </div>
      ${children.length ? `
        <div class="follow-strip">
          ${children.map((athlete) => `
            <button class="follow-card" data-athlete-id="${escapeHtml(athlete.id)}">
              <strong>${escapeHtml(athlete.name)}</strong>
              <span>${escapeHtml(athlete.club || '个人')}</span>
              <em>${escapeHtml(athlete.detail)}</em>
              <small>${escapeHtml(athlete.summary)}</small>
            </button>
          `).join('')}
        </div>
      ` : '<div class="empty compact-empty">进入选手详情后，可把重点选手加入关注。</div>'}
    </section>
    <section class="panel my-section">
      <div class="section-title">
        <h2>赛前提醒</h2>
        <span>${showingSuggestions ? '推荐关注' : priorityCompetitions.length ? `${priorityCompetitions.length} 个重点` : '待关注'}</span>
      </div>
      ${priorityCompetitions.length ? `
        <div class="focus-alert-list">
          ${priorityCompetitions.map((competition) => `
            <article class="focus-alert-card">
              <strong>${escapeHtml(competition.sportName)}</strong>
              <span>${escapeHtml(competition.timing)} · ${escapeHtml(displayDateLabel(competition.dateLabel))}</span>
              <em>${escapeHtml(competition.action)}</em>
              <div class="focus-alert-actions">
                <button type="button" data-focus-competition="${escapeHtml(competition.sportCode)}">赛事详情</button>
                ${showingSuggestions ? `<button type="button" data-focus-follow="${escapeHtml(competition.sportCode)}">加入提醒</button>` : ''}
                ${isPrematchCompetition(competition) ? `<button type="button" data-focus-prematch="${escapeHtml(competition.sportCode)}">赛前情报</button>` : ''}
              </div>
            </article>
          `).join('')}
        </div>
      ` : ''}
      <div class="my-list">
        ${followedCompetitions.length ? followedCompetitions.map((competition) => myPageRow({
          type: 'competition',
          id: competition.sportCode,
          title: competition.sportName,
          dateLabel: competition.dateLabel,
          venue: competition.venue,
        })).join('') : showingSuggestions ? '<div class="empty compact-empty">上方是近期可关注赛事，加入提醒后会固定在这里。</div>' : '<div class="empty compact-empty">进入赛事详情后，可关注重要比赛。</div>'}
      </div>
    </section>
  `;
  bindPersonalList(focusPage);
  bindReportConversionActions(focusPage);
}

function renderPersonalPages() {
  renderHomePage();
  renderFocusPage();
  renderMyPage();
}

function myWorkspaceNextActions({ children = [], followedCompetitions = [], reportHistory = [], aiHistory = [] } = {}) {
  const firstChild = children[0] || null;
  const firstCompetition = followedCompetitions[0] || null;
  const rows = [];
  if (firstChild) {
    rows.push({
      action: 'growth',
      title: `${firstChild.name} 成长报告`,
      detail: '把近期成绩、阶段变化和下一步训练重点整理成可复看的报告。',
      cta: '生成报告',
      athleteId: firstChild.id,
    });
  } else {
    rows.push({
      action: 'ask',
      title: '先关注一个孩子',
      detail: '搜索选手并关注后，成长报告、赛前提醒和长期复盘会自动围绕他展开。',
      cta: '去搜索',
      query: '如何为孩子建立击剑成长报告',
    });
  }
  if (firstCompetition) {
    rows.push({
      action: 'prematch',
      title: '赛前提醒',
      detail: `${firstCompetition.sportName || '关注赛事'} 可继续生成赛前情报和重点对手提示。`,
      cta: '查看赛前',
      sportCode: firstCompetition.sportCode,
    });
  }
  if (reportHistory.length || aiHistory.length) {
    rows.push({
      action: 'pilot',
      title: '保存长期分析',
      detail: '报告和问答已经开始沉淀，适合申请试用，把成长、赛前和教练分析持续保存。',
      cta: '申请试用',
    });
  } else {
    rows.push({
      action: 'ask',
      title: '问一个真实问题',
      detail: '可以直接问孩子进步、对手对比、天津赛事数量或俱乐部优势项目。',
      cta: '开始提问',
      query: '这些击剑数据能产生什么商业价值',
    });
  }
  return rows.slice(0, 3);
}

function renderMyPage() {
  if (!myPage) return;
  const children = focusAthleteCards();
  const followedCompetitions = followedCompetitionCards();
  const recentRows = (state.recentItems || []).slice(0, 6);
  const reportHistory = reportHistoryRows();
  const aiHistory = aiHistoryRows();
  const reportAssets = reportAssetSummaryRows(state.reportHistory || [], state.aiHistory || []);
  const commercialIntents = commercialIntentRows();
  const commercialIntentCount = (state.commercialIntents || []).length;
  const followedAthletes = children.slice(0, 6);
  const nextActions = myWorkspaceNextActions({ children, followedCompetitions, reportHistory, aiHistory });
  const reportNextActions = reportNextActionRows(reportHistory);
  const readinessRows = serviceReadinessRows({ children, followedCompetitions, reportHistory, aiHistory });
  const trialRows = recommendedTrialRows({ children, followedCompetitions, reportHistory, aiHistory });
  const deliverableRows = trialDeliverableRows();
  const prematchReminderRows = myPrematchReminderRows(followedCompetitions);
  const followCopy = myFollowSectionCopy();
  const generatedLabel = formatDataGeneratedAt(state.dataGeneratedAt);
  const stats = [
    { value: children.length, label: followCopy.statLabel },
    { value: followedCompetitions.length, label: '关注赛事' },
    { value: reportHistory.length, label: '生成报告' },
    { value: aiHistory.length, label: 'AI分析' },
    { value: commercialIntentCount, label: '服务进度' },
    { value: recentRows.length, label: '最近查看' },
  ];

  myPage.innerHTML = `
    <section class="my-hero panel">
      <div>
        <span>当前工作台</span>
        <strong>${escapeHtml(roleLabel(state.userRole))}</strong>
        <em>${escapeHtml(state.selectedChildId ? followCopy.heroReady : followCopy.heroEmpty)}</em>
      </div>
      <button type="button" data-role-switch>切换</button>
    </section>

    <section class="my-stat-grid">
      ${stats.map((item) => `
        <div class="my-stat">
          <strong>${escapeHtml(item.value)}</strong>
          <span>${escapeHtml(item.label)}</span>
        </div>
      `).join('')}
    </section>

    <section class="panel my-section my-next-section">
      <div class="section-title">
        <h2>下一步</h2>
        <span>继续推进</span>
      </div>
      <div class="my-next-grid">
        ${nextActions.map((row) => `
          <button type="button" class="my-next-card" data-my-next-action="${escapeHtml(row.action)}" ${row.athleteId ? `data-athlete-id="${escapeHtml(row.athleteId)}"` : ''} ${row.sportCode ? `data-sport-code="${escapeHtml(row.sportCode)}"` : ''} ${row.query ? `data-ai-query="${escapeHtml(row.query)}"` : ''}>
            <strong>${escapeHtml(row.title)}</strong>
            <span>${escapeHtml(row.detail)}</span>
            <em>${escapeHtml(row.cta)}</em>
          </button>
        `).join('')}
      </div>
    </section>

    <section class="panel my-section report-next-action-section">
      <div class="section-title">
        <h2>最近报告下一步</h2>
        <span>${reportNextActions.length ? '可继续推进' : '生成后出现'}</span>
      </div>
      ${reportNextActions.length ? `
        <div class="report-next-action-list">
          ${reportNextActions.map((row) => `
            <article class="report-next-action-card">
              <div>
                <span>${escapeHtml(row.typeLabel)}</span>
                <strong>${escapeHtml(row.title)}</strong>
                <em>${escapeHtml(row.next)}</em>
              </div>
              <div class="report-next-action-buttons">
                <button type="button" data-report-next-open data-report-next-type="${escapeHtml(row.type || '')}" data-report-next-id="${escapeHtml(row.id || '')}">${escapeHtml(row.actionLabel)}</button>
                <button type="button" data-report-next-trial data-commercial-source="${escapeHtml(row.source)}" data-report-title="${escapeHtml(row.title)}">${escapeHtml(row.trialLabel)}</button>
                ${row.reminderLabel ? `<button type="button" data-reminder-interest data-commercial-source="my-report-next-reminder" data-report-title="${escapeHtml(row.title)}提醒">${escapeHtml(row.reminderLabel)}</button>` : ''}
              </div>
            </article>
          `).join('')}
        </div>
      ` : '<div class="empty compact-empty">生成成长报告、赛前情报或教练报告后，这里会给出下一步动作。</div>'}
    </section>

    <section class="panel my-section my-prematch-section">
      <div class="section-title">
        <h2>近期赛前提醒</h2>
        <span>${prematchReminderRows.length ? '赛前情报' : '待关注'}</span>
      </div>
      ${prematchReminderRows.length ? `
        <div class="my-prematch-list">
          ${prematchReminderRows.map((row) => `
            <article class="my-prematch-card">
              <div>
                <strong>${escapeHtml(row.title)}</strong>
                <span>${escapeHtml(row.detail)}</span>
                <em>${escapeHtml(row.meta)}</em>
              </div>
              <small>${escapeHtml(row.tag)}</small>
              <div class="my-prematch-actions">
                <button type="button" data-my-prematch-report="${escapeHtml(row.sportCode)}">赛前情报</button>
                <button type="button" data-reminder-interest data-commercial-source="my-prematch-reminder" data-report-title="${escapeHtml(row.title)}提醒">订阅提醒</button>
                ${row.isFollowed ? '' : `<button type="button" data-my-prematch-follow="${escapeHtml(row.sportCode)}">加入提醒</button>`}
              </div>
            </article>
          `).join('')}
        </div>
      ` : '<div class="empty compact-empty">关注近期赛事后，这里会形成赛前情报和提醒入口。</div>'}
    </section>

    ${renderCommercialIntentStatus(commercialIntents)}

    ${renderMembershipBenefits()}

    <section class="panel my-section trial-deliverable-section">
      <div class="section-title">
        <h2>试用交付内容</h2>
        <span>按当前数据</span>
      </div>
      <div class="trial-deliverable-grid">
        ${deliverableRows.map((row) => `
          <button type="button" class="trial-deliverable-card trial-deliverable-${escapeHtml(row.key)} trial-deliverable-${escapeHtml(row.tone)}" data-trial-deliverable-action="${escapeHtml(row.action)}" ${row.sportCode ? `data-sport-code="${escapeHtml(row.sportCode)}"` : ''} ${row.athleteId ? `data-athlete-id="${escapeHtml(row.athleteId)}"` : ''} ${row.clubId ? `data-club-id="${escapeHtml(row.clubId)}"` : ''} ${row.query ? `data-ai-query="${escapeHtml(row.query)}"` : ''}>
            <span>${escapeHtml(row.label)}</span>
            <div>
              <strong>${escapeHtml(row.title)}</strong>
              <small>${escapeHtml(row.status)}</small>
              <em>${escapeHtml(row.detail)}</em>
              <b>${escapeHtml(row.next)}</b>
            </div>
          </button>
        `).join('')}
      </div>
    </section>

    <section class="panel my-section trial-plan-section">
      <div class="section-title">
        <h2>推荐试用方案</h2>
        <span>按当前数据</span>
      </div>
      <div class="trial-plan-list">
        ${trialRows.map((row) => `
          <button type="button" class="trial-plan-card" data-trial-plan-source="${escapeHtml(row.source)}" data-report-title="${escapeHtml(row.title)}">
            <div>
              <strong>${escapeHtml(row.title)}</strong>
              <span>${escapeHtml(row.detail)}</span>
            </div>
            <em>${escapeHtml(row.scope)}</em>
          </button>
        `).join('')}
      </div>
    </section>

    <section class="panel my-section service-readiness-section">
      <div class="section-title">
        <h2>服务可用性</h2>
        <span>当前状态</span>
      </div>
      <div class="service-readiness-list">
        ${readinessRows.map((row) => `
          <button type="button" class="service-readiness-card service-readiness-${escapeHtml(row.tone)}" data-my-readiness-action="${escapeHtml(row.action)}" ${row.sportCode ? `data-sport-code="${escapeHtml(row.sportCode)}"` : ''} ${row.athleteId ? `data-athlete-id="${escapeHtml(row.athleteId)}"` : ''} ${row.clubId ? `data-club-id="${escapeHtml(row.clubId)}"` : ''} ${row.query ? `data-ai-query="${escapeHtml(row.query)}"` : ''}>
            <div>
              <strong>${escapeHtml(row.title)}</strong>
              <span>${escapeHtml(row.detail)}</span>
              <em>${escapeHtml(row.meta)}</em>
            </div>
            <b>${escapeHtml(row.status)}</b>
          </button>
        `).join('')}
      </div>
    </section>

    <section class="panel my-section report-asset-section">
      <div class="section-title">
        <h2>报告资产</h2>
        <span>持续沉淀</span>
      </div>
      <div class="report-asset-grid">
        ${reportAssets.map((row) => `
          <div class="report-asset-card report-asset-${escapeHtml(row.key)}">
            <strong>${escapeHtml(row.value)}</strong>
            <span>${escapeHtml(row.label)}</span>
            <em>${escapeHtml(row.detail)}</em>
          </div>
        `).join('')}
      </div>
    </section>

    <section class="panel my-section">
      <div class="section-title">
        <h2>${escapeHtml(followCopy.title)}</h2>
        <span>${escapeHtml(children.length ? followCopy.activeLabel : followCopy.emptyLabel)}</span>
      </div>
      ${children.length ? `
        <div class="follow-strip">
          ${children.map((athlete) => `
            <button class="follow-card" data-athlete-id="${escapeHtml(athlete.id)}">
              <strong>${escapeHtml(athlete.name)}</strong>
              <span>${escapeHtml(athlete.club || '个人')}</span>
              <em>${escapeHtml(athlete.detail)}</em>
              <small>${escapeHtml(athlete.summary)}</small>
            </button>
          `).join('')}
        </div>
      ` : `
        <div class="empty-follow">
          <strong>${escapeHtml(followCopy.emptyTitle)}</strong>
          <span>${escapeHtml(followCopy.emptyDetail)}</span>
        </div>
      `}
    </section>

    <section class="panel my-section">
      <div class="section-title">
        <h2>关注赛事</h2>
        <span>${followedCompetitions.length ? `${followedCompetitions.length} 场` : '赛前提醒'}</span>
      </div>
      <div class="my-list">
        ${followedCompetitions.length ? followedCompetitions.map((competition) => myPageRow({
          type: 'competition',
          id: competition.sportCode,
          title: competition.sportName,
          dateLabel: competition.dateLabel,
          venue: competition.venue,
        })).join('') : '<div class="empty compact-empty">进入赛事详情后，可关注重要比赛。</div>'}
      </div>
    </section>

    <section class="panel my-section">
      <div class="section-title">
        <h2>我的报告</h2>
        <span>${reportHistory.length ? '快速继续' : '生成后可复看'}</span>
      </div>
      <div class="report-history-list">
        ${reportHistory.length ? reportHistory.map((row) => `
          <button type="button" data-report-history-type="${escapeHtml(row.type || '')}" data-report-history-id="${escapeHtml(row.id || '')}">
            <span>${escapeHtml(row.typeLabel)}</span>
            <strong>${escapeHtml(row.title)}</strong>
            <em>${escapeHtml(row.detail)}</em>
          </button>
        `).join('') : '<div class="empty compact-empty">生成成长报告、赛前情报或教练报告后，会显示在这里。</div>'}
      </div>
    </section>
    <section class="panel my-section">
      <div class="section-title">
        <h2>最近分析</h2>
        <span>${aiHistory.length ? '继续提问' : '提问后可复看'}</span>
      </div>
      <div class="ai-history-list">
        ${aiHistory.length ? aiHistory.map((row) => `
          <button type="button" data-ai-history-query="${escapeHtml(row.query)}">
            <span>${escapeHtml(row.typeLabel)}</span>
            <strong>${escapeHtml(row.title)}</strong>
            <em>${escapeHtml(row.summary)}</em>
          </button>
        `).join('') : '<div class="empty compact-empty">向 FencingAI 提问后，会显示在这里。</div>'}
      </div>
    </section>

    <section class="panel my-section">
      <div class="section-title">
        <h2>最近查看</h2>
        <span>快速返回</span>
      </div>
      <div class="my-list">
        ${recentRows.length ? recentRows.map(myPageRow).join('') : '<div class="empty compact-empty">查看赛事、选手或俱乐部后会显示在这里。</div>'}
      </div>
    </section>

    <section class="panel my-section">
      <div class="section-title">
        <h2>数据状态</h2>
        <span>${escapeHtml(generatedLabel || state.apiVersion || '本地缓存')}</span>
      </div>
      <div class="my-status-note">
        <strong>${escapeHtml(state.dataCoverage?.scorePackages || state.competitions.length || 0)}</strong>
        <span>赛事与项目数据持续更新；报名名单完整后，会自动形成赛前对手分析。</span>
      </div>
    </section>
  `;

  myPage.querySelector('[data-role-switch]')?.addEventListener('click', () => {
    state.userRole = '';
    state.selectedChildId = '';
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(CHILD_KEY);
    state.viewStack = ['roleHome'];
    state.activeMainTab = '';
    renderRoleWorkspacePremium();
    showView('roleHome');
    scrollToPageTop();
  });
  myPage.querySelectorAll('[data-athlete-id]').forEach((button) => {
    button.addEventListener('click', () => openAthlete(button.dataset.athleteId));
  });
  myPage.querySelectorAll('[data-report-history-type]').forEach((button) => {
    button.addEventListener('click', () => {
      const type = button.dataset.reportHistoryType;
      const id = button.dataset.reportHistoryId || '';
      if (type === 'prematch') openPrematchReport('prematch-pack', id === 'prematch-pack' ? '' : id);
      if (type === 'parent-growth') openParentGrowthReport(id);
      if (type === 'coach-segmentation') openCoachSegmentationReport(id);
      if (type === 'ai-report') {
        trackAnalyticsAction('open_report', 'ai-report');
        submitAiQuery(id);
      }
    });
  });
  myPage.querySelectorAll('[data-report-next-open]').forEach((button) => {
    button.addEventListener('click', () => {
      const type = button.dataset.reportNextType || '';
      const id = button.dataset.reportNextId || '';
      if (type === 'prematch') openPrematchReport('prematch-pack', id === 'prematch-pack' ? '' : id);
      if (type === 'parent-growth') openParentGrowthReport(id);
      if (type === 'coach-segmentation') openCoachSegmentationReport(id);
      if (type === 'ai-report') submitAiQuery(id);
    });
  });
  myPage.querySelectorAll('[data-report-next-trial]').forEach((button) => {
    button.addEventListener('click', (event) => submitPilotInterest(event.currentTarget, {
      source: button.dataset.commercialSource || 'my-report-next-action',
      report: button.dataset.reportTitle || '最近报告下一步',
    }));
  });
  myPage.querySelectorAll('[data-ai-history-query]').forEach((button) => {
    button.addEventListener('click', () => submitAiQuery(button.dataset.aiHistoryQuery || ''));
  });
  myPage.querySelectorAll('[data-my-next-action]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const action = button.dataset.myNextAction || '';
      if (action === 'growth') openParentGrowthReport(button.dataset.athleteId || '');
      if (action === 'prematch') openPrematchReport('prematch-pack', button.dataset.sportCode || '');
      if (action === 'ask') submitAiQuery(button.dataset.aiQuery || '');
      if (action === 'pilot') submitPilotInterest(event.currentTarget, {
        source: 'my-next-action',
        report: '长期分析试用',
      });
    });
  });
  myPage.querySelectorAll('[data-my-prematch-report]').forEach((button) => {
    button.addEventListener('click', () => openPrematchReport('prematch-pack', button.dataset.myPrematchReport || ''));
  });
  myPage.querySelectorAll('[data-my-prematch-follow]').forEach((button) => {
    button.addEventListener('click', () => {
      const competition = findCompetitionBySportCode(button.dataset.myPrematchFollow || '');
      if (!competition) return;
      upsertFollowedCompetition(competition);
      renderPersonalPages();
    });
  });
  bindServiceProgressActions(myPage);
  myPage.querySelectorAll('[data-trial-plan-source]').forEach((button) => {
    button.addEventListener('click', (event) => submitPilotInterest(event.currentTarget, {
      source: button.dataset.trialPlanSource || 'my-trial-plan',
      report: button.dataset.reportTitle || '推荐试用方案',
    }));
  });
  myPage.querySelectorAll('[data-trial-deliverable-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.trialDeliverableAction || '';
      if (action === 'prematch') openPrematchReport('prematch-pack', button.dataset.sportCode || '');
      if (action === 'growth') openParentGrowthReport(button.dataset.athleteId || '');
      if (action === 'coach') openCoachSegmentationReport(button.dataset.clubId || '');
      if (action === 'ask') submitAiQuery(button.dataset.aiQuery || '');
    });
  });
  myPage.querySelectorAll('[data-my-readiness-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.myReadinessAction || '';
      if (action === 'prematch') openPrematchReport('prematch-pack', button.dataset.sportCode || '');
      if (action === 'growth') openParentGrowthReport(button.dataset.athleteId || '');
      if (action === 'coach') openCoachSegmentationReport(button.dataset.clubId || '');
      if (action === 'ask') submitAiQuery(button.dataset.aiQuery || '');
    });
  });
  myPage.querySelectorAll('.my-list-row').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.type === 'competition') openCompetition(button.dataset.id);
      if (button.dataset.type === 'athlete') openAthlete(button.dataset.id);
      if (button.dataset.type === 'club') openClub(button.dataset.id);
    });
  });
  bindReportConversionActions(myPage);
}

function parseDateCandidates(value) {
  const text = String(value || '');
  const matches = [...text.matchAll(/(20\d{2})(?:[^\d]{0,3}(\d{1,2})(?:[^\d]{0,3}(\d{1,2}))?)?/g)];
  return matches.map((match) => new Date(Number(match[1]), Number(match[2] || 1) - 1, Number(match[3] || 1)))
    .filter((date) => !Number.isNaN(date.getTime()));
}

function displayDateLabel(value, fallback = '日期待确认') {
  const text = String(value || '').trim();
  if (!text) return fallback;
  const dates = [...text.matchAll(/(20\d{2})[.\-/年](\d{1,2})[.\-/月](\d{1,2})/g)]
    .map((match) => {
      const year = match[1];
      const month = String(Number(match[2])).padStart(2, '0');
      const day = String(Number(match[3])).padStart(2, '0');
      return `${year}.${month}.${day}`;
    });
  const uniqueDates = [...new Set(dates)].sort();
  if (!uniqueDates.length) return text;
  if (uniqueDates.length === 1) return uniqueDates[0];
  return `${uniqueDates[0]} / ${uniqueDates[uniqueDates.length - 1]}`;
}

function displayMetricValue(value) {
  if (['registration', 'upcoming', 'live', 'completed'].includes(value)) return statusLabel(value);
  return value ?? '-';
}

function competitionDateValue(competition) {
  const dates = [
    ...parseDateCandidates(competition.dateLabel),
    ...parseDateCandidates(competition.sportName),
  ];
  return dates.length ? Math.max(...dates.map((date) => date.getTime())) : 0;
}

function daysFromToday(timestamp) {
  if (!timestamp) return 99999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((timestamp - today.getTime()) / 86400000);
}

function recommendationReasonForCompetition(competition) {
  const days = daysFromToday(competitionDateValue(competition));
  const topItem = [...competitionItemSummaries(competition)].sort((a, b) => (Number(b.competitionNo) || Number(b.expectedRegistrationCount) || 0) - (Number(a.competitionNo) || Number(a.expectedRegistrationCount) || 0))[0];
  const itemText = competition.topItemLabel || (topItem ? `${displayEventName(topItem)}数据较完整` : '项目数据已收录');
  if (days >= -90 && days <= 30) return `近期比赛 · ${itemText}`;
  if (days > 30 && days < 99999) return `后续赛程 · ${itemText}`;
  if (days < -90) return `历史样本 · ${itemText}`;
  return `最新录入 · ${itemText}`;
}

function topRecentCompetitions(limit = 3) {
  const rows = [...(state.competitions || [])].map((competition) => ({
    ...competition,
    dateValue: competitionDateValue(competition),
  }));
  const near = rows
    .filter((competition) => {
      const days = daysFromToday(competition.dateValue);
      return days >= -90 && days <= 30;
    })
    .sort((a, b) => Math.abs(daysFromToday(a.dateValue)) - Math.abs(daysFromToday(b.dateValue)));
  const latest = rows
    .filter((competition) => !near.some((item) => item.sportCode === competition.sportCode))
    .sort((a, b) => b.dateValue - a.dateValue);
  return [...near, ...latest].slice(0, limit);
}

function topAthletes(limit = 4) {
  return [...(state.athleteSearchIndex || [])]
    .filter((athlete) => athlete.name)
    .sort((a, b) => (a.bestRank ?? 999) - (b.bestRank ?? 999) || b.appearances - a.appearances)
    .slice(0, limit);
}

function topClubs(limit = 3) {
  return [...(state.clubSearchIndex || [])]
    .filter((club) => club.club)
    .sort((a, b) => (b.medals || 0) - (a.medals || 0) || (b.top8 || 0) - (a.top8 || 0) || b.entrants - a.entrants)
    .slice(0, limit);
}

function buildRecommendationCards() {
  const competitions = topRecentCompetitions(2).map((competition) => ({
    type: 'competition',
    label: '近期比赛',
    id: competition.sportCode,
    title: competition.sportName,
    meta: `${displayDateLabel(competition.dateLabel)} · ${competition.venue || competition.region || '地点待确认'}`,
    reason: recommendationReasonForCompetition(competition),
  }));
  const clubs = topClubs(1).map((club) => ({
    type: 'club',
    label: '热门俱乐部',
    id: club.id,
    title: club.club,
    meta: `参赛 ${club.entrants || 0} 人次 · 前八 ${club.top8 || 0}`,
    reason: (club.medals || 0) ? `奖牌 ${club.medals} · 整体表现靠前` : '参赛活跃 · 数据样本较多',
  }));
  const athletes = topAthletes(1).map((athlete) => ({
    type: 'athlete',
    label: '活跃选手',
    id: athlete.id,
    title: athlete.name,
    meta: athlete.club || '选手画像',
    reason: `最好第 ${athlete.bestRank ?? '-'} 名 · ${athlete.appearances || 0} 次记录`,
  }));
  return [...competitions, ...clubs, ...athletes].slice(0, 4);
}

function renderFeedPanel() {
  if (!feedPanel) return;
  if (state.isDataLoading || state.dataLoadError) {
    feedPanel.hidden = true;
    feedPanel.innerHTML = '';
    return;
  }
  if (isFilteringActive()) {
    feedPanel.hidden = true;
    feedPanel.innerHTML = '';
    return;
  }
  feedPanel.hidden = false;
  const cards = buildRecommendationCards();

  feedPanel.innerHTML = `
    <div class="section-title">
      <h2>近期值得看</h2>
      <span>点击进入</span>
    </div>
    <div class="feed-list">
      ${cards.map((card) => `
        <button class="feed-card feed-${escapeHtml(card.type)}" type="button" data-type="${escapeHtml(card.type)}" data-id="${escapeHtml(card.id)}">
          <span>${escapeHtml(card.label)}</span>
          <strong>${escapeHtml(card.title)}</strong>
          <em>${escapeHtml(card.meta)}</em>
          <small>${escapeHtml(card.reason)}</small>
        </button>
      `).join('')}
    </div>
  `;

  feedPanel.querySelectorAll('[data-type]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.type === 'competition') openCompetition(button.dataset.id);
      if (button.dataset.type === 'club') openClub(button.dataset.id);
      if (button.dataset.type === 'athlete') openAthlete(button.dataset.id);
    });
  });
}

function renderFollowPanel() {
  if (state.userRole !== 'parent') {
    followPanel.hidden = true;
    followPanel.innerHTML = '';
    return;
  }
  const follows = focusAthleteCards();
  followPanel.hidden = !follows.length;
  followPanel.innerHTML = follows.length
    ? `
      <div class="section-title">
        <h2>我的孩子</h2>
        <span>成长入口</span>
      </div>
      <div class="follow-strip">
        ${follows.map((athlete) => `
          <button class="follow-card" data-athlete-id="${escapeHtml(athlete.id)}">
            <strong>${escapeHtml(athlete.name)}</strong>
            <span>${escapeHtml(athlete.club || '俱乐部待确认')}</span>
            <em>最好第 ${escapeHtml(athlete.bestRank ?? '-')} 名 · ${escapeHtml(athlete.appearances ?? 0)} 次</em>
            <small>${escapeHtml(followAthleteHint(athlete))}</small>
          </button>
        `).join('')}
      </div>
    `
    : `
      <div class="empty-follow">
        <strong>已关注的选手</strong>
        <span>关注后，这里会展示你关心的选手入口；未关注时首页只保留搜索、推荐和赛事列表。</span>
      </div>
    `;

  followPanel.querySelectorAll('[data-athlete-id]').forEach((button) => {
    button.addEventListener('click', () => openAthlete(button.dataset.athleteId));
  });
}

function followAthleteHint(athlete) {
  if (athlete.latestRank) return `最近${athlete.latestEventName || '比赛'}第 ${athlete.latestRank} 名`;
  if (athlete.medals) return `${athlete.medals} 枚奖牌，点开看成长报告`;
  if (athlete.eliminationWins || athlete.eliminationLosses) return `淘汰赛 ${athlete.eliminationWins || 0}胜${athlete.eliminationLosses || 0}负`;
  return '点开查看名次和对手变化';
}

function clubRepresentativeAthletes(club, athleteRows) {
  const compactClub = compactText(club.club);
  const fromSearch = (athleteRows || []).filter((athlete) => compactText(athlete.club).includes(compactClub));
  const fromAll = (state.athleteSearchIndex || []).filter((athlete) => compactText(athlete.club).includes(compactClub));
  const merged = new Map();
  [...fromSearch, ...fromAll].forEach((athlete) => {
    if (!athlete.name) return;
    const key = `${athlete.name}__${athlete.club || ''}`;
    if (!merged.has(key)) merged.set(key, athlete);
  });
  return [...merged.values()]
    .sort((a, b) => (a.bestRank ?? 999) - (b.bestRank ?? 999) || b.appearances - a.appearances)
    .slice(0, 5);
}

function clubRelatedCompetitions(club) {
  const eventCodes = new Set((club.events || []).map((event) => event.eventCode).filter(Boolean));
  const clubText = compactText(club.club);
  return (state.filteredCompetitions.length ? state.filteredCompetitions : state.competitions)
    .filter((competition) => competitionItemSummaries(competition).some((item) => eventCodes.has(item.eventCode))
      || compactText(competition.itemSearchText || '').includes(clubText))
    .slice(0, 3);
}

function renderClubSummaryResult(club, athleteRows) {
  const representatives = clubRepresentativeAthletes(club, athleteRows);
  const competitions = clubRelatedCompetitions(club);
  return `
    <article class="club-summary-card">
      <button class="club-summary-head" type="button" data-club-id="${escapeHtml(club.id)}">
        <div>
          <span>俱乐部</span>
          <strong>${escapeHtml(club.club)}</strong>
          <em>${escapeHtml(club.eventLabels?.join(' / ') || '参赛项目待整理')}</em>
        </div>
        <b>进入画像</b>
      </button>
      <div class="club-summary-metrics">
        <div><strong>${escapeHtml(club.entrants || 0)}</strong><span>参赛人次</span></div>
        <div><strong>${escapeHtml(club.top8 || 0)}</strong><span>前八</span></div>
        <div><strong>${escapeHtml(club.medals || 0)}</strong><span>奖牌</span></div>
        <div><strong>${escapeHtml(club.bestRank ? `第${club.bestRank}` : '-')}</strong><span>最好</span></div>
      </div>
      ${representatives.length ? `
        <div class="compact-result-block">
          <div class="result-group-label">代表选手</div>
          <div class="compact-athlete-row">
            ${representatives.map((athlete) => `
              <button type="button" data-athlete-id="${escapeHtml(athlete.id || '')}">
                <strong>${escapeHtml(athlete.name)}</strong>
                <span>${escapeHtml(athlete.bestRank ? `最好第 ${athlete.bestRank} 名` : `${athlete.appearances || 0} 次记录`)}</span>
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}
      ${competitions.length ? `
        <div class="compact-result-block">
          <div class="result-group-label">相关比赛</div>
          <div class="compact-competition-list">
            ${competitions.map((competition) => `
              <button type="button" data-sport-code="${escapeHtml(competition.sportCode)}">
                <strong>${escapeHtml(competition.sportName)}</strong>
                <span>${escapeHtml(displayDateLabel(competition.dateLabel))} · ${escapeHtml(competition.venue || competition.region || '地点待确认')}</span>
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </article>
  `;
}

function renderAthleteSearchResults(keyword) {
  const athleteRows = state.athleteSearchResults || [];
  const clubRows = state.clubSearchResults || [];
  const hasCompetitionResults = Boolean(keyword && state.filteredCompetitions.length);
  searchAthletesPanel.hidden = !keyword || (!athleteRows.length && !clubRows.length && !hasCompetitionResults);
  if (searchAthletesPanel.hidden) {
    searchAthletesPanel.innerHTML = '';
    return;
  }

  const primaryClub = clubRows[0];
  const showClubFirst = primaryClub && primaryClub.matchScore >= 80;
  const athleteLimit = athleteSearchResultLimit(keyword);
  const visibleAthletes = showClubFirst
    ? athleteRows.filter((athlete) => !compactText(athlete.club).includes(compactText(primaryClub.club))).slice(0, athleteLimit === Infinity ? athleteRows.length : 3)
    : athleteRows.slice(0, athleteLimit);
  const secondaryClubs = showClubFirst ? clubRows.slice(1, 3) : clubRows.slice(0, 4);

  searchAthletesPanel.innerHTML = `
    <div class="section-title">
      <h2>搜索结果</h2>
      <span>${showClubFirst ? '俱乐部优先' : athleteRows.length || clubRows.length ? '直接进入画像' : '已找到相关比赛'}</span>
    </div>
    ${showClubFirst ? renderClubSummaryResult(primaryClub, athleteRows) : ''}
    ${visibleAthletes.length ? `
      <div class="result-group-label">${showClubFirst ? '其他相关选手' : '选手'}</div>
      <div class="athlete-result-list">
        ${visibleAthletes.map((athlete) => `
          <button class="athlete-result-card" type="button" ${athlete.id ? `data-athlete-id="${escapeHtml(athlete.id)}"` : `data-event-code="${escapeHtml(athlete.firstEventCode || '')}"`}>
            <div class="athlete-result-main">
              <strong>${escapeHtml(athlete.name)}</strong>
              <span>${escapeHtml(athlete.club || '俱乐部待确认')}</span>
              <em>${escapeHtml(athlete.matchReason || athlete.eventLabels.join(' / ') || '参赛记录')}</em>
            </div>
            <div class="athlete-result-side">
              <b>${escapeHtml(athlete.bestRank ? `第${athlete.bestRank} 名` : `${athlete.appearances || 0} 场`)}</b>
              <span>${escapeHtml(athlete.appearances || 0)} 次记录</span>
            </div>
          </button>
        `).join('')}
      </div>
    ` : ''}
    ${secondaryClubs.length ? `
      <div class="result-group-label">相关俱乐部</div>
      <div class="athlete-result-list">
        ${secondaryClubs.map((club) => `
          <button class="athlete-result-card club-result-card" type="button" data-club-id="${escapeHtml(club.id)}">
            <div class="athlete-result-main">
              <strong>${escapeHtml(club.club)}</strong>
              <span>${escapeHtml(club.eventLabels.join(' / ') || '参赛项目')}</span>
              <em>${escapeHtml(club.matchReason || `参赛 ${club.entrants || 0} 人次`)} · 前八 ${escapeHtml(club.top8 || 0)} · 奖牌 ${escapeHtml(club.medals || 0)}</em>
            </div>
            <div class="athlete-result-side">
              <b>${escapeHtml(club.bestRank ? `第${club.bestRank} 名` : `${club.events?.length || 0} 项`)}</b>
              <span>俱乐部</span>
            </div>
          </button>
        `).join('')}
      </div>
    ` : ''}
    ${!athleteRows.length && !clubRows.length && hasCompetitionResults ? `
      <div class="search-hint-card">
        <strong>已为你匹配到 ${escapeHtml(state.filteredCompetitions.length)} 场相关比赛</strong>
        <span>下面的比赛列表已经按当前搜索词和筛选条件更新。</span>
      </div>
    ` : ''}
  `;

  searchAthletesPanel.querySelectorAll('[data-athlete-id]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.athleteId) openAthlete(button.dataset.athleteId);
    });
  });
  searchAthletesPanel.querySelectorAll('[data-event-code]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.eventCode) openEvent(button.dataset.eventCode);
    });
  });
  searchAthletesPanel.querySelectorAll('[data-club-id]').forEach((button) => {
    button.addEventListener('click', () => openClub(button.dataset.clubId));
  });
  searchAthletesPanel.querySelectorAll('[data-sport-code]').forEach((button) => {
    button.addEventListener('click', () => openCompetition(button.dataset.sportCode));
  });
}

function competitionChips(competition, limit = Infinity) {
  const itemLabels = competitionItemSummaries(competition).map((item) => displayEventName(item)).filter(Boolean);
  const groupLabels = itemLabels.length ? [] : (competition.groupLabels || []);
  const labels = [...itemLabels, ...groupLabels].filter(Boolean);
  const visible = labels.slice(0, limit);
  return {
    visible,
    remaining: Math.max(0, (competitionItemCount(competition) || labels.length) - visible.length),
  };
}

function competitionProjectSummaryChips(competition) {
  const itemLabels = competitionItemSummaries(competition).map((item) => displayEventName(item)).filter(Boolean);
  const fallbackLabels = itemLabels.length ? [] : (competition.groupLabels || []);
  const labels = [...itemLabels, ...fallbackLabels].filter(Boolean);
  if (!labels.length) return [];

  const ages = [...new Set(labels.map((label) => String(label).match(/U\d+|\d+\+|年龄开放组/)?.[0]).filter(Boolean))];
  const weapons = [...new Set(labels.map((label) => {
    const text = compactText(label);
    if (text.includes('花')) return '花剑';
    if (text.includes('重')) return '重剑';
    if (text.includes('佩')) return '佩剑';
    return '';
  }).filter(Boolean))];
  const chips = [`${competitionItemCount(competition) || labels.length} 个项目/组别`];
  if (ages.length) chips.push(`${ages.slice(0, 3).join(' / ')}${ages.length > 3 ? ` +${ages.length - 3}` : ''}`);
  if (weapons.length) chips.push(`${weapons.join(' / ')}`);
  return chips;
}

function competitionProjectScope(competition) {
  if (competition.projectScope) {
    return {
      count: competitionItemCount(competition),
      ageText: competition.projectScope.ageText || '待确认',
      weaponText: competition.projectScope.weaponText || '待确认',
      genderText: competition.projectScope.genderText || '待确认',
    };
  }
  const itemLabels = competitionItemSummaries(competition).map((item) => displayEventName(item)).filter(Boolean);
  const fallbackLabels = itemLabels.length ? [] : (competition.groupLabels || []);
  const labels = [...itemLabels, ...fallbackLabels].filter(Boolean);
  const ages = [...new Set(labels.map((label) => String(label).match(/U\d+|\d+\+|年龄开放组/)?.[0]).filter(Boolean))];
  const weapons = [...new Set(labels.map((label) => {
    const text = compactText(label);
    if (text.includes('花')) return '花剑';
    if (text.includes('重')) return '重剑';
    if (text.includes('佩')) return '佩剑';
    return '';
  }).filter(Boolean))];
  const genders = [...new Set(labels.map((label) => {
    const text = compactText(label);
    if (text.includes('男')) return '男子';
    if (text.includes('女')) return '女子';
    return '';
  }).filter(Boolean))];
  return {
    count: labels.length,
    ageText: ages.length ? `${ages.slice(0, 4).join(' / ')}${ages.length > 4 ? ` +${ages.length - 4}` : ''}` : '待确认',
    weaponText: weapons.length ? weapons.join(' / ') : '待确认',
    genderText: genders.length ? genders.join(' / ') : '待确认',
  };
}

function competitionHeroSummaryText(competition) {
  if (competition.isPlatformEventList && !competitionHasItems(competition)) {
    return '适合先关注赛程、地点和报名窗口，作为近期参赛安排参考。';
  }
  if (competition.rosterStatus === 'partial') return '可先查看报名组别、规模和重点项目，用于提前判断参赛节奏。';
  if (competition.rosterStatus === 'complete') return '报名名单已形成，可查看赛前对手、强手和熟悉对手分析。';
  if (competition.isPreEvent) return '可查看报名组别、剑种和项目规模，适合赛前关注。';
  return '可查看项目结构、晋级比例、赛程结果和选手表现。';
}

function renderCompetitionList() {
  if (state.isDataLoading) {
    competitionList.innerHTML = '<div class="loading-row">正在整理比赛列表</div>';
    return;
  }
  if (state.dataLoadError) {
    competitionList.innerHTML = `
      <div class="load-error">
        <strong>数据加载失败</strong>
        <span>${escapeHtml(state.dataLoadError)}</span>
        <button type="button" onclick="window.location.reload()">重新加载</button>
      </div>
    `;
    return;
  }
  const visibleCompetitions = state.filteredCompetitions.slice(0, state.visibleCompetitionLimit);
  const remainingCount = Math.max(0, state.filteredCompetitions.length - visibleCompetitions.length);
  const aiFilterNotice = state.aiCompetitionFilterSummary
    ? `
      <div class="ai-filter-notice">
        <span>${escapeHtml(state.aiCompetitionFilterSummary)}，当前匹配 ${escapeHtml(state.filteredCompetitions.length)} 场</span>
        <button type="button" data-clear-ai-filter>清除筛选</button>
      </div>
    `
    : '';
  competitionList.innerHTML = state.filteredCompetitions.length
    ? `
      ${aiFilterNotice}
      ${visibleCompetitions.map((competition) => `
      <button class="competition-card" data-sport-code="${escapeHtml(competition.sportCode)}">
        <div class="status-row">
          <span class="status-badge status-${escapeHtml(competition.status || 'completed')}">${escapeHtml(statusLabel(competition.status || 'completed'))}</span>
          <span class="coverage-badge ${escapeHtml(coverageClass(competition))}">${escapeHtml(coverageLabel(competition))}</span>
          ${competition.isPreEvent ? `<span class="roster-badge">${escapeHtml(rosterStatusLabel(competition.rosterStatus))}</span>` : ''}
        </div>
        <strong>${escapeHtml(competition.sportName)}</strong>
        <div class="meta-row">
          <span class="badge">${escapeHtml(displayDateLabel(competition.dateLabel))}</span>
          <span class="badge">${escapeHtml(competition.venue || competition.region || '地点待确认')}</span>
        </div>
        <div class="event-chip-row">
          ${competitionChips(competition, 4).visible.map((label) => `<span>${escapeHtml(label)}</span>`).join('')}
          ${competitionChips(competition, 4).remaining ? `<span>+${competitionChips(competition, 4).remaining}</span>` : ''}
        </div>
        <div class="card-insight">${escapeHtml(competitionListInsight(competition))}</div>
      </button>
    `).join('')}
      ${remainingCount ? `
        <button class="load-more-competitions" type="button" data-load-more-competitions>
          继续查看 ${escapeHtml(Math.min(COMPETITION_LIST_PAGE_SIZE, remainingCount))} 场
          <span>已显示 ${escapeHtml(visibleCompetitions.length)} / ${escapeHtml(state.filteredCompetitions.length)}</span>
        </button>
      ` : ''}
    `
    : `${aiFilterNotice}<div class="empty">没有匹配的比赛</div>`;

  competitionList.querySelectorAll('.competition-card').forEach((button) => {
    button.addEventListener('click', () => openCompetition(button.dataset.sportCode));
  });
  competitionList.querySelector('[data-clear-ai-filter]')?.addEventListener('click', clearAiCompetitionFilter);
  competitionList.querySelector('[data-load-more-competitions]')?.addEventListener('click', () => {
    state.visibleCompetitionLimit += COMPETITION_LIST_PAGE_SIZE;
    renderCompetitionList();
  });
}

function competitionListInsight(competition) {
  if (competition.isPlatformEventList && !competitionHasItems(competition)) {
    const type = competition.platformMeta?.gameDesc || '认证赛事';
    const groups = competition.groupLabels?.length ? `${competition.groupLabels.length} 个组别` : '组别待确认';
    return `${type}，覆盖 ${groups}。适合先关注赛程和报名窗口。`;
  }
  if (competition.isPreEvent) {
    const summary = competition.registrationSummary || {};
    const rosterText = summary.rosterCount
      ? `已有 ${summary.rosterCount} 条报名动态`
      : '报名动态持续更新';
    const expectedText = summary.expectedRegistrationCount
      ? `预计 ${summary.expectedRegistrationCount} 人次参与`
      : `${competitionItemCount(competition)} 个项目开放`;
    return `${expectedText}，${rosterText}。关注后可继续看同组对手和重点选手。`;
  }
  const total = competitionMetricTotal(competition, 'competitionNo');
  const elimination = competitionMetricTotal(competition, 'playedEliminationMatchCount');
  const topItemLabel = competition.topItemLabel || displayEventName(competitionItemSummaries(competition)[0]);
  if (!topItemLabel) return '暂无项目数据';
  return `${topItemLabel} 人数最多，${total} 人次参赛，${elimination} 场淘汰赛。`;
}

function renderCompetitionHero(competition) {
  const chips = competitionProjectSummaryChips(competition);
  const scope = competitionProjectScope(competition);
  const followed = isFollowedCompetition(competition.sportCode);
  const isPreEventCompetition = competition.isPreEvent || ['registration', 'upcoming', 'live'].includes(competition.status);
  competitionHero.classList.add('compact');
  competitionHero.innerHTML = `
    <div class="status-row">
      <span class="status-badge status-${escapeHtml(competition.status || 'completed')}">${escapeHtml(statusLabel(competition.status || 'completed'))}</span>
      <span class="coverage-badge ${escapeHtml(coverageClass(competition))}">${escapeHtml(coverageLabel(competition))}</span>
      ${competition.isPreEvent ? `<span class="roster-badge">${escapeHtml(rosterStatusLabel(competition.rosterStatus))}</span>` : ''}
    </div>
    <button class="follow-status-tag competition-follow-tag ${followed ? 'active' : ''}" id="followCompetitionBtn" type="button" aria-pressed="${followed ? 'true' : 'false'}">
      ${followed ? '已关注' : '关注'}
    </button>
    <div class="hero-title">${escapeHtml(competition.sportName)}</div>
    <div class="hero-sub">${escapeHtml(competition.venue || '地点待确认')} · ${escapeHtml(displayDateLabel(competition.dateLabel))}</div>
    <div class="hero-sub coverage-copy">${escapeHtml(competitionHeroSummaryText(competition))}</div>
    <div class="competition-scope-grid">
      <div><strong>${escapeHtml(scope.count || '-')}</strong><span>项目/组别</span></div>
      <div><strong>${escapeHtml(scope.ageText)}</strong><span>年龄段</span></div>
      <div><strong>${escapeHtml(scope.weaponText)}</strong><span>剑种</span></div>
    </div>
    <div class="event-chip-row project-summary-row">
      ${chips.map((label) => `<span>${escapeHtml(label)}</span>`).join('')}
    </div>
    ${isPreEventCompetition ? `
      <button class="competition-prematch-cta" type="button" data-prematch-sport-code="${escapeHtml(competition.sportCode || '')}">
        生成本场赛前情报包
      </button>
    ` : ''}
  `;
  competitionHero.querySelector('#followCompetitionBtn')?.addEventListener('click', () => {
    if (isFollowedCompetition(competition.sportCode)) removeFollowedCompetition(competition.sportCode);
    else upsertFollowedCompetition(competition);
  });
  competitionHero.querySelector('[data-prematch-sport-code]')?.addEventListener('click', (event) => {
    openPrematchReport('prematch-pack', event.currentTarget.dataset.prematchSportCode || competition.sportCode || '');
  });
}

function compactCompetitionBarRows(rows, options = {}) {
  const limit = options.limit || 5;
  const otherLabel = options.otherLabel || '其他';
  const valueKey = options.valueKey || 'value';
  const aggregateKeys = options.aggregateKeys || [];
  const normalized = (rows || [])
    .map((row) => ({ ...row, [valueKey]: Number(row[valueKey]) || 0 }))
    .filter((row) => row[valueKey] > 0)
    .sort((a, b) => b[valueKey] - a[valueKey] || String(a.label || '').localeCompare(String(b.label || ''), 'zh-CN'));

  if (normalized.length <= limit) return normalized;

  const visible = normalized.slice(0, limit);
  const rest = normalized.slice(limit);
  const other = { label: otherLabel, [valueKey]: rest.reduce((sum, row) => sum + row[valueKey], 0) };
  for (const key of aggregateKeys) {
    other[key] = rest.reduce((sum, row) => sum + (Number(row[key]) || 0), 0);
  }
  return [...visible, other];
}

function sortedCompetitionEventRows(rows) {
  return [...(rows || [])]
    .sort((a, b) => (Number(b.competitionNo) || 0) - (Number(a.competitionNo) || 0) || displayEventName(a).localeCompare(displayEventName(b), 'zh-CN'));
}

function compactCompetitionEventRows(rows, limit = 4) {
  return sortedCompetitionEventRows(rows).slice(0, limit);
}

function projectAgeLabel(item) {
  const label = displayEventName(item) || item.eventName || item.shortEventName || '';
  return String(label).match(/U\d+|\d+\+|年龄开放组/)?.[0] || '其他组别';
}

function projectWeaponLabel(item) {
  const text = compactText(displayEventName(item) || item.eventName || item.shortEventName || '');
  if (text.includes('花')) return '花剑';
  if (text.includes('重')) return '重剑';
  if (text.includes('佩')) return '佩剑';
  return '项目';
}

function competitionProjectGroups(items) {
  const groups = new Map();
  for (const item of items || []) {
    const age = projectAgeLabel(item);
    const current = groups.get(age) || { age, items: [], total: 0, weapons: new Set() };
    current.items.push(item);
    current.total += Number(item.registrationCount) || Number(item.expectedRegistrationCount) || Number(item.competitionNo) || 0;
    const weapon = projectWeaponLabel(item);
    if (weapon && weapon !== '项目') current.weapons.add(weapon);
    groups.set(age, current);
  }
  return [...groups.values()]
    .map((group) => ({
      ...group,
      items: sortedCompetitionEventRows(group.items),
      weaponText: group.weapons.size ? [...group.weapons].join(' / ') : `${group.items.length} 个项目`,
    }))
    .sort((a, b) => b.total - a.total || a.age.localeCompare(b.age, 'zh-CN'));
}

function competitionRegistrationNumbers(competition) {
  const summary = competition.registrationSummary || {};
  const items = competitionItemSummaries(competition);
  const registered = Number(summary.rosterCount)
    || items.reduce((sum, item) => sum + (Number(item.registrationCount) || Number(item.roster?.length) || 0), 0);
  const expected = Number(summary.expectedRegistrationCount)
    || items.reduce((sum, item) => sum + (Number(item.expectedRegistrationCount) || Number(item.competitionNo) || 0), 0);
  return { registered, expected };
}

function competitionPreEventTopItems(competition, limit = 3) {
  return sortedCompetitionEventRows(competitionItemSummaries(competition))
    .map((item) => ({
      item,
      label: displayEventName(item),
      count: Number(item.registrationCount) || Number(item.expectedRegistrationCount) || Number(item.competitionNo) || 0,
      date: item.openDate || item.closeDate || competition.dateLabel || '',
    }))
    .filter((row) => row.label)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'zh-CN'))
    .slice(0, limit);
}

function competitionPreEventCards(competition) {
  const numbers = competitionRegistrationNumbers(competition);
  return [
    {
      title: '赛事状态',
      value: statusLabel(competition.status || 'upcoming'),
      detail: rosterStatusLabel(competition.rosterStatus),
    },
    {
      title: '项目覆盖',
      value: competitionItemCount(competition),
      detail: competitionItemFilterLabels(competition).slice(0, 3).join(' / ') || '组别待确认',
    },
    {
      title: '报名规模',
      value: numbers.registered || numbers.expected || '-',
      detail: numbers.registered && numbers.expected ? `${numbers.registered}/${numbers.expected}` : '报名动态持续更新',
    },
  ];
}

function competitionDigestRows(competition, insights, primaryEventRows, birthRows) {
  const total = competitionMetricTotal(competition, 'competitionNo');
  const elimination = competitionMetricTotal(competition, 'playedEliminationMatchCount');
  const topItem = primaryEventRows[0];
  const topAge = birthRows[0];
  const rows = [];
  if (topItem) {
    rows.push({
      title: '重点项目',
      detail: `${displayEventName(topItem)} 参赛 ${Number(topItem.competitionNo) || 0} 人，是本场最值得先看的项目。`,
    });
  }
  if (topAge) {
    rows.push({
      title: '主要年龄段',
      detail: `${topAge.label} 人数最多，适合先观察同龄段竞争强度。`,
    });
  }
  rows.push({
    title: '赛事强度',
    detail: `${total || 0} 人次参赛，${elimination || 0} 场淘汰赛，先看晋级率和淘汰赛完成度。`,
  });
  if (insights?.bullets?.[0]) {
    rows.push({
      title: '观察重点',
      detail: insights.bullets[0],
    });
  }
  return rows.slice(0, 3);
}

function competitionDigestPanel(rows) {
  if (!rows.length) return '';
  return `
    <div class="competition-digest-panel">
      <div class="chart-title">赛事解读</div>
      <div class="competition-digest-list">
        ${rows.map((row) => `
          <div>
            <strong>${escapeHtml(row.title)}</strong>
            <span>${escapeHtml(row.detail)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function competitionPreEventReadinessRows(competition) {
  const numbers = competitionRegistrationNumbers(competition);
  const topItems = competitionPreEventTopItems(competition, 3);
  const rosterReady = competition.rosterStatus === 'partial' || competition.rosterStatus === 'complete' || numbers.registered > 0;
  const rows = [];
  if (topItems.length) {
    rows.push({
      title: '优先看项目',
      detail: topItems.map((row) => `${row.label}${row.count ? ` ${row.count}人` : ''}`).join('，'),
    });
  }
  rows.push({
    title: '赛前可用信息',
    detail: rosterReady
      ? '已有报名线索，可先看同项目强手、熟悉对手和俱乐部分布。'
      : '可先看比赛时间、地点和重点项目，后续再细化到选手对标。',
  });
  rows.push({
    title: '关注方式',
    detail: '关注赛事后，后续名单和成绩补齐时可快速回到这场比赛继续查看。',
  });
  return rows;
}

function competitionRosterRows(competition) {
  return (competition.items || [])
    .flatMap((item) => (item.roster || []).map((row) => ({
      ...row,
      sportName: row.sportName || competition.sportName,
      eventName: row.eventName || item.eventName,
      shortEventName: row.shortEventName || item.shortEventName,
      eventCode: row.eventCode || item.eventCode,
      item,
    })));
}

function competitionRosterClubRows(rosterRows) {
  const map = new Map();
  for (const row of rosterRows) {
    const club = rosterClubText(row) || '俱乐部待确认';
    const current = map.get(club) || { club, count: 0, athletes: [] };
    current.count += 1;
    const athlete = rosterAthleteLabel(row);
    if (athlete && !current.athletes.includes(athlete)) current.athletes.push(athlete);
    map.set(club, current);
  }
  return [...map.values()]
    .sort((a, b) => b.count - a.count || a.club.localeCompare(b.club, 'zh-CN'))
    .slice(0, 4);
}

function competitionRosterWatchRows(rosterRows) {
  return rosterRows
    .map((row) => {
      const history = rosterHistoryMatch(row);
      const rank = rosterRankValue(row);
      return {
        row,
        history,
        rank,
        score: (rank ? 1000 - rank : 0) + (history?.bestRank ? 200 - history.bestRank : 0) + (history?.appearances || 0),
      };
    })
    .filter((item) => item.rank || item.history)
    .sort((a, b) => b.score - a.score || rosterAthleteLabel(a.row).localeCompare(rosterAthleteLabel(b.row), 'zh-CN'))
    .slice(0, 4);
}

function renderCompetitionRosterSnapshot(competition) {
  const rosterRows = competitionRosterRows(competition);
  if (!rosterRows.length) return '';
  const itemRows = rosterItemSummary(rosterRows).slice(0, 3);
  const clubRows = competitionRosterClubRows(rosterRows);
  const watchRows = competitionRosterWatchRows(rosterRows);
  const athleteCount = new Set(rosterRows.map((row) => compactText(rosterAthleteLabel(row))).filter(Boolean)).size || rosterRows.length;
  return `
    <div class="competition-prematch-roster">
      <div class="competition-prematch-roster-head">
        <strong>报名名单画像</strong>
        <span>${escapeHtml(athleteCount)} 名选手 · ${escapeHtml(clubRows.length)} 个主要俱乐部</span>
      </div>
      <div class="competition-prematch-roster-grid">
        <div>
          <div class="mini-title">重点项目</div>
          <div class="event-prematch-list">
            ${itemRows.map((row) => `
              <div>
                <strong>${escapeHtml(row.label)}</strong>
                <span>${escapeHtml(row.count)} 人 · ${escapeHtml(row.athletes.slice(0, 3).join(' / '))}</span>
              </div>
            `).join('') || '<div><strong>重点项目</strong><span>报名动态更新后会按项目整理。</span></div>'}
          </div>
        </div>
        <div>
          <div class="mini-title">主要俱乐部</div>
          <div class="event-prematch-list">
            ${clubRows.map((row) => `
              <div>
                <strong>${escapeHtml(row.club)}</strong>
                <span>${escapeHtml(row.count)} 人 · ${escapeHtml(row.athletes.slice(0, 3).join(' / '))}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      ${watchRows.length ? `
        <div class="competition-prematch-watch">
          <div class="mini-title">可重点关注</div>
          <div class="event-prematch-list">
            ${watchRows.map((item) => `
              <div>
                <strong>${escapeHtml(rosterAthleteLabel(item.row))}</strong>
                <span>${escapeHtml(rosterClubText(item.row) || '俱乐部待确认')} · ${escapeHtml(item.rank ? `报名排名 ${item.rank}` : `历史最好第 ${item.history?.bestRank ?? '-'} 名`)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderCompetitionPreEventPanel(competition) {
  const rows = competitionPreEventReadinessRows(competition);
  const topItems = competitionPreEventTopItems(competition, 5);
  return `
    <div class="competition-prematch-panel">
      <div class="chart-title">赛前准备</div>
      <div class="competition-prematch-rows">
        ${rows.map((row) => `
          <div>
            <strong>${escapeHtml(row.title)}</strong>
            <span>${escapeHtml(row.detail)}</span>
          </div>
        `).join('')}
      </div>
      ${topItems.length ? `
        <div class="competition-prematch-items">
          ${topItems.map((row) => `
            <div>
              <strong>${escapeHtml(row.label)}</strong>
              <span>${escapeHtml(row.count ? `${row.count} 人` : '规模待确认')}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${renderCompetitionRosterSnapshot(competition)}
    </div>
  `;
}

function renderCompetitionInsights(competition) {
  const insights = competition.insights || {};
  const cards = insights.summaryCards || [];
  const bullets = insights.bullets || [];
  const isPreEventCompetition = competition.isPreEvent || ['registration', 'upcoming', 'live'].includes(competition.status);

  const displayCards = isPreEventCompetition ? competitionPreEventCards(competition) : cards.slice(0, 2);
  competitionInsightCards.innerHTML = displayCards.map((item) => `
    <div class="metric">
      <strong>${escapeHtml(displayMetricValue(item.value))}</strong>
      <span>${escapeHtml(item.title)}</span>
      <span>${escapeHtml(item.detail || '')}</span>
    </div>
  `).join('');

  const eventRows = insights.eventCharts || competition.items || [];
  const primaryEventRows = compactCompetitionEventRows(eventRows, 3);
  const sizeRows = eventRows.map((item) => ({
    label: displayEventName(item),
    value: item.competitionNo,
    display: `${item.competitionNo} 人`,
  }));
  const qualifyRows = eventRows.map((item) => {
    const total = Number(item.competitionNo) || 0;
    const qualify = Number(item.poolQualifyNo) || 0;
    return {
      label: displayEventName(item),
      percent: total ? Math.round((qualify / total) * 100) : 0,
      display: `${qualify}/${total}`,
    };
  });
  const densityRows = [
    {
      label: '晋级率',
      percent: insights.qualifyRate ?? 0,
      display: `${insights.totalPoolQualifyNo ?? '-'} / ${insights.totalCompetitionNo ?? '-'}`,
    },
    {
      label: '淘汰赛完成率',
      percent: insights.eliminationPlayRate ?? 0,
      display: `${insights.totalPlayedElimination ?? '-'} 场`,
    },
    {
      label: 'Bye',
      percent: (insights.totalPlayedElimination + insights.totalBye) ? Math.round((insights.totalBye / (insights.totalPlayedElimination + insights.totalBye)) * 100) : 0,
      display: `${insights.totalBye ?? 0} 场`,
    },
  ];
  const birthRows = compactCompetitionBarRows((insights.birthBuckets || []).filter((row) => row.label !== '未知'), {
    limit: 4,
    otherLabel: '其他年龄段',
    valueKey: 'entrants',
    aggregateKeys: ['top8'],
  }).map((row) => ({
    label: row.label,
    value: row.entrants,
    display: `${row.entrants}人 / 前八${row.top8}`,
  }));

  if (isPreEventCompetition) {
    competitionInsightBullets.innerHTML = `
      ${renderCompetitionPreEventPanel(competition)}
      ${primaryEventRows.length > 1 ? eventTiles('重点项目', primaryEventRows) : ''}
    `;
    return;
  }

  const digestRows = competitionDigestRows(competition, insights, primaryEventRows, birthRows);
  competitionInsightBullets.innerHTML = `
    ${competitionDigestPanel(digestRows)}
    ${donutChart('赛事结构', densityRows)}
    ${birthRows.length ? barChart('主要年龄段', birthRows, { tone: 'orange' }) : '<div class="empty compact-empty">暂无年龄段数据</div>'}
    ${primaryEventRows.length > 1 ? eventTiles('主要项目对比', primaryEventRows) : ''}
  `;
}

function findCompetitionBySportCode(sportCode) {
  return state.competitions.find((competition) => competition.sportCode === sportCode) || null;
}

function setInlineError(container, message) {
  container.innerHTML = `<div class="empty">${escapeHtml(message)}</div>`;
}

function competitionProjectFocusRows(competition, sortedItems) {
  const isPreEventCompetition = competition.isPreEvent || ['registration', 'upcoming', 'live'].includes(competition.status);
  const itemCount = sortedItems.length;
  const primary = sortedItems[0] || null;
  const secondaryCount = Math.max(0, itemCount - 4);
  const rosterRows = isPreEventCompetition ? competitionRosterRows(competition) : [];
  const registered = primary ? (Number(primary.registrationCount) || Number(primary.roster?.length) || 0) : 0;
  const expected = primary ? (Number(primary.expectedRegistrationCount) || Number(primary.competitionNo) || 0) : 0;
  const elimination = primary ? Number(primary.playedEliminationMatchCount) || 0 : 0;
  const rows = [];

  if (isPreEventCompetition) {
    rows.push({
      title: primary ? '优先看报名项目' : '优先看赛事安排',
      detail: primary
        ? `${displayEventName(primary)} · ${registered ? `报名 ${registered} 人` : expected ? `预计 ${expected} 人` : '规模待确认'}`
        : '先关注比赛时间、地点和报名窗口。',
    });
    rows.push({
      title: rosterRows.length ? '赛前可看对手' : '赛前观察重点',
      detail: rosterRows.length
        ? `已收录 ${rosterRows.length} 条报名记录，可进入项目查看同组选手和重点对手。`
        : `${itemCount || '多个'} 项目已开放，先根据项目规模和时间安排判断备赛优先级。`,
    });
  } else {
    rows.push({
      title: primary ? '优先看重点项目' : '优先看比赛结果',
      detail: primary
        ? `${displayEventName(primary)} · ${Number(primary.competitionNo) || 0} 人，${Number(primary.poolQualifyNo) || 0} 人晋级`
        : '先看总览，再进入具体项目复盘小组和单败路径。',
    });
    rows.push({
      title: elimination ? '复盘淘汰赛' : '复盘小组表现',
      detail: elimination
        ? `重点项目已有 ${elimination} 场淘汰赛，可查看单败表和关键对手。`
        : '优先看小组排名、晋级情况和最终排名变化。',
    });
  }

  if (secondaryCount) {
    rows.push({
      title: '完整项目',
      detail: `默认展示最关键的 4 个项目，其余 ${secondaryCount} 个可展开查看。`,
    });
  }

  return rows;
}

function renderCompetitionProjectGuide(competition, sortedItems) {
  const rows = competitionProjectFocusRows(competition, sortedItems);
  if (!rows.length) return '';
  return `
    <div class="competition-project-guide">
      ${rows.map((row) => `
        <div>
          <strong>${escapeHtml(row.title)}</strong>
          <span>${escapeHtml(row.detail)}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderCompetitionProjectGroups(competition, sortedItems, eventCardHtml, options = {}) {
  const groups = competitionProjectGroups(sortedItems);
  const summary = options.summary || '按年龄段查看全部项目';
  return `
    <details class="project-group-list">
      <summary>${escapeHtml(summary)}</summary>
      <div class="project-group-stack">
        ${groups.map((group, index) => `
          <details class="project-group-card" ${index === 0 ? 'open' : ''}>
            <summary>
              <strong>${escapeHtml(group.age)}</strong>
              <span>${escapeHtml(group.items.length)} 项 · ${escapeHtml(group.weaponText)}${group.total ? ` · ${escapeHtml(group.total)} 人` : ''}</span>
            </summary>
            <div class="event-list-more-grid">
              ${group.items.map(eventCardHtml).join('')}
            </div>
          </details>
        `).join('')}
      </div>
    </details>
  `;
}

function renderEventList(competition) {
  const eventItems = competition.items || competition.itemSummaries || [];
  if (!eventItems.length) {
    eventList.innerHTML = `
      <div class="empty compact-empty">
        目前可先关注赛事时间、地点和报名节奏；具体项目开放后会按重点项目整理。
      </div>
    `;
    return;
  }

  const sortedItems = sortedCompetitionEventRows(eventItems);
  const primaryItems = sortedItems.slice(0, 4);
  const secondaryItems = sortedItems.slice(4);
  const eventCardHtml = (item) => {
    const expected = Number(item.expectedRegistrationCount) || Number(item.competitionNo) || 0;
    const registered = Number(item.registrationCount) || Number(item.roster?.length) || 0;
    const meta = competition.isPreEvent || ['registration', 'upcoming', 'live'].includes(competition.status)
      ? [
        expected ? `${expected} 人` : '规模待确认',
        registered ? `报名 ${registered}` : rosterStatusLabel(competition.rosterStatus),
        statusLabel(item.status || competition.status),
      ]
      : [
        `${Number(item.competitionNo) || 0} 人`,
        `${Number(item.poolQualifyNo) || 0} 晋级`,
        `${Number(item.playedEliminationMatchCount) || 0} 场淘汰赛`,
      ];
    return `
      <button class="event-card" data-event-code="${escapeHtml(item.eventCode)}">
        <strong>${escapeHtml(displayEventName(item))}</strong>
        <div class="subline">${escapeHtml(item.openDate || competition.dateLabel)}</div>
        <div class="event-meta">
          ${meta.map((label) => `<span class="badge">${escapeHtml(label)}</span>`).join('')}
        </div>
      </button>
    `;
  };

  eventList.innerHTML = `
    ${renderCompetitionProjectGuide(competition, sortedItems)}
    ${primaryItems.map(eventCardHtml).join('')}
    ${secondaryItems.length ? renderCompetitionProjectGroups(
      competition,
      sortedItems,
      eventCardHtml,
      { summary: `按年龄段查看全部 ${sortedItems.length} 个项目` },
    ) : ''}
  `;

  eventList.querySelectorAll('.event-card').forEach((button) => {
    button.addEventListener('click', () => openEvent(button.dataset.eventCode));
  });
}

function renderEventHero(event) {
  eventHero.classList.add('compact');
  const tracked = eventTrackedAthletes(event);
  eventHero.innerHTML = `
    <div class="hero-title">${escapeHtml(displayEventName(event))}</div>
    <div class="hero-sub">${escapeHtml(event.sportName)}</div>
    <div class="hero-sub">${escapeHtml(event.venue || '地点待确认')} · ${escapeHtml(event.openDate || '日期待确认')}</div>
    ${tracked.length ? `
      <div class="event-focus-strip">
        ${tracked.slice(0, 3).map((athlete) => `
          <span class="${athlete.focusKind === 'primary' ? 'primary' : ''}">
            ${escapeHtml(athlete.focusKind === 'primary' ? '重点' : '关注')} · ${escapeHtml(athlete.name)}
          </span>
        `).join('')}
      </div>
    ` : ''}
  `;
}

function renderMetrics(event) {
  const metrics = [
    ['人数', event.competitionNo],
    ['小组', event.poolCount],
    ['晋级', event.poolQualifyNo],
    ['淘汰赛', event.playedEliminationMatchCount],
    ['Bye', event.byeMatchCount],
    ['轮次', Object.keys(event.distributions?.tableau || {}).length],
  ];

  metricGrid.innerHTML = metrics.map(([label, value]) => `
    <div class="metric">
      <strong>${escapeHtml(value ?? '-')}</strong>
      <span>${escapeHtml(label)}</span>
    </div>
  `).join('');
}

function renderInsights(event) {
  const insights = event.insights || {};
  const cards = insights.summaryCards || [];
  const bullets = insights.bullets || [];
  const breakout = insights.breakout || [];
  const fade = insights.fade || [];

  insightCards.innerHTML = cards.map((item) => `
    <div class="metric">
      <strong>${escapeHtml(item.value ?? '-')}</strong>
      <span>${escapeHtml(item.title)}</span>
      <span>${escapeHtml(item.detail || '')}</span>
    </div>
  `).join('');

  insightBullets.innerHTML = bullets.length
    ? `<div class="insight-note compact">${escapeHtml(bullets[0])}</div>`
    : '<div class="empty">暂无项目洞察</div>';

  const breakoutRows = breakout.map((item) => ({
    title: `${item.name} · 上升 ${item.delta} 位`,
    sub: `${item.club || ''} · 小组第 ${item.poolRank} -> 最终第 ${item.finalRank}`,
    value: `+${item.delta}`,
  }));
  const fadeRows = fade.map((item) => ({
    title: `${item.name} · 下滑 ${Math.abs(item.delta)} 位`,
    sub: `${item.club || ''} · 小组第 ${item.poolRank} -> 最终第 ${item.finalRank}`,
    value: `${item.delta}`,
  }));
  const rows = [...breakoutRows, ...fadeRows].slice(0, 8);

  momentumList.innerHTML = rows.length
    ? rows.map((row) => `
      <div class="leader-card">
        <div>
          <strong>${escapeHtml(row.title)}</strong>
          <div class="subline">${escapeHtml(row.sub)}</div>
        </div>
        <div class="value">${escapeHtml(row.value)}</div>
      </div>
    `).join('')
    : '<div class="empty">当前样本不足以形成明显的排名反差</div>';
}

function renderFollowedEventFocus(event) {
  const rows = eventTrackedAthletes(event);
  followedEventFocus.innerHTML = rows.length
    ? rows.map((athlete) => `
      <button class="focus-athlete-row ${athlete.focusKind === 'primary' ? 'is-primary-focus' : 'is-followed-focus'}" type="button" data-athlete-id="${escapeHtml(athlete.id || '')}">
        <div>
          <strong>${escapeHtml(athlete.name)}</strong>
          <span>${escapeHtml(athlete.club || '俱乐部待确认')}</span>
        </div>
        <div>
          <b>${escapeHtml(athlete.finalRank ? `第${athlete.finalRank}名` : '-')}</b>
          <span>${escapeHtml(athlete.poolWins !== undefined ? `小组 ${athlete.poolWins}/${athlete.poolMatches ?? '-'}` : '小组待确认')}</span>
        </div>
      </button>
    `).join('')
    : '<div class="empty compact-empty">本项目暂未发现已关注选手。关注孩子后，这里会直接显示本场表现。</div>';

  followedEventFocus.querySelectorAll('[data-athlete-id]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.athleteId) openAthlete(button.dataset.athleteId);
    });
  });
}

function eventRosterRows(event) {
  return [...(event.participants || [])].map((row) => ({
    ...row,
    eventName: row.eventName || event.eventName,
    sportName: row.sportName || event.sportName,
    eventCode: row.eventCode || event.eventCode,
  }));
}

function rosterHistoryMatch(row) {
  const nameKey = compactText(rosterAthleteLabel(row));
  const clubKey = compactText(rosterClubText(row));
  return (state.athleteSearchIndex || [])
    .filter((athlete) => compactText(athlete.name) === nameKey)
    .sort((a, b) => {
      const aClub = compactText(a.club);
      const bClub = compactText(b.club);
      const aClubMatch = clubKey && aClub && (clubKey.includes(aClub) || aClub.includes(clubKey)) ? 0 : 1;
      const bClubMatch = clubKey && bClub && (clubKey.includes(bClub) || bClub.includes(clubKey)) ? 0 : 1;
      return aClubMatch - bClubMatch || (a.bestRank ?? 999) - (b.bestRank ?? 999) || (b.appearances || 0) - (a.appearances || 0);
    })[0] || null;
}

function rosterRankValue(row) {
  const rank = Number(row.sigupRank ?? row.rank ?? row.seedRank);
  return Number.isFinite(rank) && rank > 0 ? rank : null;
}

function buildEventPreMatchModel(event) {
  const rosterRows = eventRosterRows(event);
  const expected = Number(event.expectedRegistrationCount || event.competitionNo || 0);
  const registered = rosterRows.length || Number(event.registrationCount || 0);
  const clubMap = new Map();
  for (const row of rosterRows) {
    const club = rosterClubText(row) || '俱乐部待确认';
    const current = clubMap.get(club) || { club, count: 0, athletes: [] };
    current.count += 1;
    const athlete = rosterAthleteLabel(row);
    if (athlete && !current.athletes.includes(athlete)) current.athletes.push(athlete);
    clubMap.set(club, current);
  }

  const followedNames = new Set([
    ...state.followedAthletes.map((athlete) => compactText(athlete.name)),
    compactText(selectedChildAthlete()?.name),
  ].filter(Boolean));
  const followedRows = rosterRows.filter((row) => followedNames.has(compactText(rosterAthleteLabel(row)))).slice(0, 4);
  const strongRows = rosterRows
    .map((row) => {
      const history = rosterHistoryMatch(row);
      return {
        row,
        history,
        rank: rosterRankValue(row),
      };
    })
    .filter((item) => item.history || item.rank)
    .sort((a, b) => (a.rank ?? a.history?.bestRank ?? 999) - (b.rank ?? b.history?.bestRank ?? 999)
      || (b.history?.appearances || 0) - (a.history?.appearances || 0))
    .slice(0, 5);

  return {
    rosterRows,
    expected,
    registered,
    progress: expected ? Math.min(100, Math.round((registered / expected) * 100)) : 0,
    clubRows: [...clubMap.values()].sort((a, b) => b.count - a.count || a.club.localeCompare(b.club, 'zh-CN')).slice(0, 5),
    followedRows,
    strongRows,
  };
}

function renderEventPreMatchIntelligence(event) {
  const isPreMatch = event.isPreEvent || ['registration', 'upcoming', 'live'].includes(event.status) || Number(event.registrationCount || 0) > 0;
  if (!isPreMatch) return '';
  const model = buildEventPreMatchModel(event);
  const hasRoster = model.rosterRows.length > 0;
  return `
    <div class="chart-card event-prematch-card">
      <div class="chart-title">赛前情报</div>
      <div class="event-prematch-summary">
        <strong>${escapeHtml(hasRoster ? `${model.registered} 条报名动态` : '报名动态持续更新')}</strong>
        <span>${escapeHtml(hasRoster ? '先看报名热度、主要俱乐部和可重点关注选手。' : '当前先看比赛时间和项目热度，后续会形成对手分析。')}</span>
      </div>
      <div class="event-prematch-metrics">
        <div>
          <strong>${escapeHtml(model.registered || '-')}</strong>
          <span>已报名</span>
        </div>
        <div>
          <strong>${escapeHtml(model.expected || '-')}</strong>
          <span>预计规模</span>
        </div>
        <div>
          <strong>${escapeHtml(model.clubRows.length || '-')}</strong>
          <span>主要俱乐部</span>
        </div>
      </div>
      ${model.expected ? `
        <div class="progress-item event-prematch-progress">
          <div class="progress-head">
            <span>报名进度</span>
            <strong>${escapeHtml(model.progress)}%</strong>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${Math.max(2, model.progress)}%"></div>
          </div>
        </div>
      ` : ''}
      ${hasRoster ? `
        <div class="event-prematch-grid">
          <div>
            <div class="mini-title">俱乐部分布</div>
            <div class="event-prematch-list">
              ${model.clubRows.map((row) => `
                <div>
                  <strong>${escapeHtml(row.club)}</strong>
                  <span>${escapeHtml(row.count)} 人 · ${escapeHtml(row.athletes.slice(0, 3).join(' / '))}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div>
            <div class="mini-title">重点关注</div>
            <div class="event-prematch-list">
              ${(model.followedRows.length ? model.followedRows.map((row) => ({
                title: rosterAthleteLabel(row),
                detail: `${rosterClubText(row) || '俱乐部待确认'} · 已关注`,
              })) : model.strongRows.map((item) => ({
                title: rosterAthleteLabel(item.row),
                detail: `${rosterClubText(item.row) || '俱乐部待确认'} · ${item.rank ? `报名排名 ${item.rank}` : `历史最好第 ${item.history?.bestRank ?? '-'} 名`}`,
              }))).slice(0, 4).map((row) => `
                <div>
                  <strong>${escapeHtml(row.title)}</strong>
                  <span>${escapeHtml(row.detail)}</span>
                </div>
              `).join('') || '<div><strong>样本积累中</strong><span>关注孩子或补充名单后，会优先显示相关选手。</span></div>'}
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function eventCoachReviewRows(event) {
  const competitionNo = Number(event.competitionNo) || 0;
  const qualifyNo = Number(event.poolQualifyNo) || 0;
  const elimination = Number(event.playedEliminationMatchCount) || 0;
  const topLeader = (event.eliminationLeaders || [])[0] || null;
  const breakout = (event.insights?.breakout || [])[0] || null;
  const fade = (event.insights?.fade || [])[0] || null;
  const focused = eventTrackedAthletes(event);
  const rows = [];

  rows.push({
    title: '比赛结构',
    detail: competitionNo
      ? `${competitionNo} 人参赛，${qualifyNo || '-'} 人晋级，${elimination || 0} 场淘汰赛。`
      : '当前项目规模还在补齐，先以已收录排名和对阵做复盘。',
  });

  if (topLeader) {
    rows.push({
      title: '强手样本',
      detail: `${topLeader.name} 淘汰赛 ${topLeader.wins || 0}胜${topLeader.losses || 0}负，适合作为关键分和推进节奏的参考。`,
    });
  } else if (breakout) {
    rows.push({
      title: '上升样本',
      detail: `${breakout.name} 从小组第 ${breakout.poolRank ?? '-'} 到最终第 ${breakout.finalRank ?? '-'}，适合复盘逆转原因。`,
    });
  }

  if (focused.length) {
    rows.push({
      title: '关注学员',
      detail: focused.slice(0, 3).map((athlete) => `${athlete.name} 第${athlete.finalRank ?? '-'}名`).join('；'),
    });
  } else if (fade) {
    rows.push({
      title: '训练提醒',
      detail: `${fade.name} 名次波动较大，可重点复盘小组后到淘汰赛的衔接。`,
    });
  }

  rows.push({
    title: '训练安排',
    detail: elimination
      ? '下次训练优先复盘淘汰赛关键分、落后局处理和领先局收尾。'
      : '下次训练优先复盘小组赛开局、连续失分和稳定拿分能力。',
  });

  return rows.slice(0, 4);
}

function buildEventCoachReviewText(event) {
  const rows = eventCoachReviewRows(event);
  return [
    `${displayEventName(event)} 教练复盘`,
    `赛事：${event.sportName || '待确认'}`,
    `时间地点：${[event.openDate, event.venue].filter(Boolean).join(' · ') || '待确认'}`,
    ...rows.map((row) => `${row.title}：${row.detail}`),
    '数据来源：FencingAI 已收录赛事成绩',
  ].join('\n');
}

function coachReviewCard(event) {
  const rows = eventCoachReviewRows(event);
  if (!rows.length) return '';
  return `
    <div class="chart-card coach-review-card">
      <div class="chart-title">
        <span>教练复盘</span>
        <button class="coach-review-copy" type="button" data-event-coach-review>复制复盘</button>
      </div>
      <div class="coach-review-list">
        ${rows.map((row) => `
          <div>
            <strong>${escapeHtml(row.title)}</strong>
            <span>${escapeHtml(row.detail)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function bindEventCoachReviewActions(event) {
  analysisCharts.querySelectorAll('[data-event-coach-review]').forEach((button) => {
    button.addEventListener('click', async () => {
      const originalLabel = button.textContent;
      try {
        await copyTextToClipboard(buildEventCoachReviewText(event));
        trackAnalyticsAction('share_report', 'event-coach-review');
        button.textContent = '已复制';
      } catch {
        button.textContent = '复制失败';
      }
      setTimeout(() => {
        button.textContent = originalLabel;
      }, 1400);
    });
  });
}

function pathChart(title, rows) {
  return `
    <div class="chart-card">
      <div class="chart-title">${escapeHtml(title)}</div>
      <div class="path-flow">
        ${rows.map((row, index) => `
          <div class="path-node">
            <div class="path-step">${index + 1}</div>
            <div>
              <strong>${escapeHtml(row.phase)}</strong>
              <span>${escapeHtml(row.opponentName)} · ${escapeHtml(row.championScore)}:${escapeHtml(row.opponentScore)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function deltaChart(title, rows) {
  const topRows = rows.slice(0, 6);
  return `
    <div class="chart-card">
      <div class="chart-title">${escapeHtml(title)}</div>
      <div class="delta-list">
        ${topRows.map((row) => {
          const direction = row.delta >= 0 ? 'up' : 'down';
          const width = Math.min(100, Math.max(12, Math.abs(row.delta) * 12));
          return `
            <div class="delta-row">
              <div class="delta-name">${escapeHtml(row.name)}</div>
              <div class="delta-track">
                <div class="delta-fill ${direction}" style="width: ${width}%"></div>
              </div>
              <div class="delta-value ${direction}">${row.delta >= 0 ? '+' : ''}${escapeHtml(row.delta)}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function barChart(title, rows, options = {}) {
  const max = Math.max(...rows.map((row) => Math.abs(Number(row.value) || 0)), 1);
  return `
    <div class="chart-card">
      <div class="chart-title">${escapeHtml(title)}</div>
      <div class="bar-list">
        ${rows.map((row) => {
          const width = Math.max(6, Math.round((Math.abs(Number(row.value) || 0) / max) * 100));
          return `
            <div class="bar-row">
              <div class="bar-label">${escapeHtml(row.label)}</div>
              <div class="bar-track">
                <div class="bar-fill ${options.tone || ''}" style="width: ${width}%"></div>
              </div>
              <div class="bar-value">${escapeHtml(row.display ?? row.value)}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function donutChart(title, rows) {
  return `
    <div class="chart-card">
      <div class="chart-title">${escapeHtml(title)}</div>
      <div class="donut-grid">
        ${rows.map((row) => {
          const percent = Math.max(0, Math.min(100, Number(row.percent) || 0));
          return `
            <div class="donut-item">
              <div class="donut" style="--value: ${percent}">
                <span>${escapeHtml(percent)}%</span>
              </div>
              <strong>${escapeHtml(row.label)}</strong>
              <em>${escapeHtml(row.display)}</em>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function eventTiles(title, rows) {
  const max = Math.max(...rows.map((row) => Number(row.competitionNo) || 0), 1);
  return `
    <div class="chart-card">
      <div class="chart-title">${escapeHtml(title)}</div>
      <div class="event-tile-grid">
        ${rows.map((row) => {
          const count = Number(row.competitionNo) || 0;
          const qualify = Number(row.poolQualifyNo) || 0;
          const scale = Math.max(0.58, Math.min(1, count / max));
          return `
            <div class="event-tile">
              <div class="bubble" style="--scale: ${scale}">${escapeHtml(count)}</div>
              <div>
                <strong>${escapeHtml(displayEventName(row))}</strong>
                <span>晋级 ${escapeHtml(qualify)} · 淘汰 ${escapeHtml(row.playedEliminationMatchCount ?? 0)}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function progressChart(title, rows, note = '') {
  return `
    <div class="chart-card">
      <div class="chart-title">${escapeHtml(title)}</div>
      <div class="progress-list">
        ${rows.map((row) => `
          <div class="progress-item">
            <div class="progress-head">
              <span>${escapeHtml(row.label)}</span>
              <strong>${escapeHtml(row.display)}</strong>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${Math.max(2, Math.min(100, row.percent))}%"></div>
            </div>
          </div>
        `).join('')}
      </div>
      ${note ? `<div class="chart-note">${escapeHtml(note)}</div>` : ''}
    </div>
  `;
}

function structureInterpretation(event) {
  const competitionNo = Number(event.competitionNo) || 0;
  const qualifyNo = Number(event.poolQualifyNo) || 0;
  const byeMatch = Number(event.byeMatchCount) || 0;
  const eliminationTotal = Number(event.eliminationMatchCount) || Number(event.playedEliminationMatchCount || 0) + byeMatch;
  const eliminated = Math.max(competitionNo - qualifyNo, 0);
  if (!competitionNo) return '';
  const parts = [
    eliminated > 0 ? `小组后淘汰 ${eliminated} 人` : '小组后全部晋级',
  ];
  if (eliminationTotal) {
    const byeRate = Math.round((byeMatch / eliminationTotal) * 100);
    parts.push(byeRate >= 35 ? '空签较多，签位影响偏高' : '淘汰赛对抗较充分');
  }
  return parts.join('，');
}

function renderAnalysisCharts(event) {
  const clubRows = (event.clubProfiles || []).slice(0, 5).map((club) => ({
    label: club.club,
    value: club.top8 || club.medals || club.entrants,
    display: `前八 ${club.top8} / 奖牌 ${club.medals}`,
  }));

  const athleteRows = (event.athleteProfiles || []).slice(0, 6).map((athlete) => ({
    label: athlete.name,
    value: Math.max(0, 12 - (athlete.finalRank || 12)),
    display: `第${athlete.finalRank} 名`,
  }));

  const competitionNo = Number(event.competitionNo) || 0;
  const qualifyNo = Number(event.poolQualifyNo) || 0;
  const eliminationTotal = Number(event.eliminationMatchCount) || Number(event.playedEliminationMatchCount || 0) + Number(event.byeMatchCount || 0);
  const playedElimination = Number(event.playedEliminationMatchCount) || 0;
  const byeMatch = Number(event.byeMatchCount) || 0;
  const structureRows = [
    {
      label: '小组晋级',
      percent: competitionNo ? Math.round((qualifyNo / competitionNo) * 100) : 0,
      display: `${qualifyNo}/${competitionNo}`,
    },
    {
      label: '实际对抗',
      percent: eliminationTotal ? Math.round((playedElimination / eliminationTotal) * 100) : 0,
      display: `${playedElimination}/${eliminationTotal}`,
    },
    {
      label: '空签影响',
      percent: eliminationTotal ? Math.round((byeMatch / eliminationTotal) * 100) : 0,
      display: `${byeMatch}/${eliminationTotal}`,
    },
  ];
  const momentumRows = [
    ...(event.insights?.breakout || []),
    ...(event.insights?.fade || []),
  ].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const birthRows = (event.birthBuckets || []).filter((row) => row.label !== '未知').map((row) => ({
    label: row.label,
    value: row.entrants,
    display: `${row.entrants}人 / 前八${row.top8}`,
  }));

  analysisCharts.innerHTML = [
    renderEventPreMatchIntelligence(event),
    coachReviewCard(event),
    progressChart('比赛压力', structureRows, structureInterpretation(event)),
    (event.championPath || []).length ? pathChart('冠军路径', event.championPath) : '',
    birthRows.length ? barChart('年龄段分布', birthRows, { tone: 'orange' }) : '',
    momentumRows.length ? deltaChart('排名反差', momentumRows) : '',
    clubRows.length ? barChart('俱乐部竞争力', clubRows, { tone: 'teal' }) : '',
    athleteRows.length ? barChart('头部选手排名', athleteRows) : '',
  ].filter(Boolean).join('');
}

function renderLeaders(event) {
  const rows = event.eliminationLeaders || [];
  leadersList.innerHTML = rows.length
    ? rows.map((row) => {
      const hasScore = row.scored !== undefined && row.scored !== null && row.received !== undefined && row.received !== null;
      return `
        <div class="leader-card">
          <div>
            <strong>${escapeHtml(row.name)}</strong>
            <div class="subline">${escapeHtml(row.club || '')} · ${row.wins}胜${row.losses}负 · 净胜 ${row.diff}</div>
          </div>
          <div class="value">${hasScore ? `${escapeHtml(row.scored)}:${escapeHtml(row.received)}` : '-'}</div>
        </div>
      `;
    }).join('')
    : '<div class="empty">暂无淘汰赛统计</div>';
}

function renderChampionPath(event) {
  const rows = event.championPath || [];
  championPath.innerHTML = rows.length
    ? rows.map((row) => `
      <div class="match path-highlight">
        <div class="match-phase">${escapeHtml(row.phase)} · ${escapeHtml(row.matchCode)}</div>
        <div class="bout-card">
          <div class="bout-side winner">
            <strong>${escapeHtml(row.championName)}</strong>
            <span>${escapeHtml(row.championClub || '')}</span>
          </div>
          <div class="score-pair winner-score">${escapeHtml(row.championScore)}<span>:</span>${escapeHtml(row.opponentScore)}</div>
          <div class="bout-side loser">
            <strong>${escapeHtml(row.opponentName)}</strong>
            <span>${escapeHtml(row.opponentClub || '')}</span>
          </div>
        </div>
      </div>
    `).join('')
    : '<div class="empty">暂无冠军路径</div>';
}

function renderOpponents(event) {
  const rows = event.keyOpponents || [];
  opponentList.innerHTML = rows.length
    ? rows.map((row) => `
      <div class="leader-card">
        <div>
          <strong>${escapeHtml(row.name)}</strong>
          <div class="subline">${escapeHtml(row.club || '')} · ${row.matches} 场 · ${row.wins}胜${row.losses}负 · 净胜 ${row.diff}</div>
        </div>
        <div class="value">${row.scored}:${row.received}</div>
      </div>
    `).join('')
    : '<div class="empty">暂无关键对手</div>';
}

function renderPoolStanding(event) {
  const rows = (event.poolGroups || []).flatMap((group, groupIndex) => (group.athletes || []).map((athlete) => ({
    ...athlete,
    groupLabel: group.title || `第 ${groupIndex + 1} 组`,
  }))).sort((a, b) => (Number(a.groupLabel?.match(/\d+/)?.[0]) || 0) - (Number(b.groupLabel?.match(/\d+/)?.[0]) || 0)
    || (Number(a.phaseRank) || 999) - (Number(b.phaseRank) || 999));
  if (!rows.length) {
    poolStanding.innerHTML = '<div class="empty">暂无小组赛排名</div>';
    return;
  }

  poolStanding.innerHTML = `
    <table class="process-table">
      <thead>
        <tr><th>小组</th><th>组内</th><th>选手</th><th>胜场</th><th>得失</th><th>最终</th></tr>
      </thead>
      <tbody>
        ${rows.map((row) => `
          <tr class="${focusClassForAthlete(row)}" data-athlete-id="${escapeHtml(row.id || '')}">
            <td>${escapeHtml(row.groupLabel)}</td>
            <td>${escapeHtml(row.phaseRank ? `第${row.phaseRank}` : '-')}</td>
            <td>${escapeHtml(row.name)}</td>
            <td>${escapeHtml(row.wins)}/${escapeHtml(row.matches)}</td>
            <td>${escapeHtml(row.scored ?? '-')} / ${escapeHtml(row.received ?? '-')}</td>
            <td>${escapeHtml(row.finalRank ? `第${row.finalRank}` : '-')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderPoolBouts(event) {
  const rows = event.poolBouts || [];
  poolBouts.innerHTML = rows.length
    ? rows.slice(0, 12).map((row) => {
      const outcome = poolBoutOutcome(row);
      return `
      <div class="match">
        <div class="match-phase">小组 ${escapeHtml(row.poolId)} · 第 ${escapeHtml(row.matchOrder)} 场</div>
        <div class="bout-card">
          <div class="bout-side ${outcome.homeWon ? 'winner' : outcome.awayWon ? 'loser' : ''}">
            <strong>${escapeHtml(row.homeLabel)}</strong>
          </div>
          <div class="score-pair ${outcome.homeWon || outcome.awayWon ? 'winner-score' : ''}">${escapeHtml(row.homeScore)}<span>:</span>${escapeHtml(row.awayScore)}</div>
          <div class="bout-side ${outcome.awayWon ? 'winner' : outcome.homeWon ? 'loser' : ''}">
            <strong>${escapeHtml(row.awayLabel)}</strong>
          </div>
        </div>
      </div>
    `;
    }).join('')
    : '<div class="empty">暂无小组赛比赛</div>';
}

function renderParticipants(event) {
  const rows = event.participants || event.athleteProfiles || [];
  participantsList.innerHTML = rows.length
    ? rows.map((row) => `
      <button class="participant-card final-rank-card ${focusClassForAthlete(row)}" data-athlete-id="${escapeHtml(row.id)}">
        <div class="rank-pill ${Number(row.finalRank) <= 3 ? 'podium' : ''}">${escapeHtml(row.finalRank ?? '-')}</div>
        <div class="participant-main">
          <strong>${escapeHtml(row.name)}${focusLabelForAthlete(row) ? `<span class="focus-inline-tag">${escapeHtml(focusLabelForAthlete(row))}</span>` : ''}</strong>
          <span>${escapeHtml(row.club || '俱乐部待确认')}</span>
          <div class="participant-tags">
            ${row.poolId ? `<em>小组 ${escapeHtml(row.poolId)}</em>` : ''}
            ${row.poolWins !== null && row.poolWins !== undefined ? `<em>小组 ${escapeHtml(row.poolWins)}/${escapeHtml(row.poolMatches ?? '-')}</em>` : ''}
            ${row.poolDiff !== null && row.poolDiff !== undefined ? `<em>净胜 ${escapeHtml(row.poolDiff)}</em>` : ''}
            ${row.ageBand ? `<em>${escapeHtml(row.ageBand)}</em>` : ''}
          </div>
        </div>
        <div class="participant-side">${row.medal ? escapeHtml(row.medal) : `第${escapeHtml(row.finalRank ?? '-')} 名`}</div>
      </button>
    `).join('')
    : '<div class="empty">暂无参赛名单</div>';

  participantsList.querySelectorAll('[data-athlete-id]').forEach((button) => {
    button.addEventListener('click', () => openAthlete(button.dataset.athleteId));
  });
}

function poolBoutForPair(group, left, right) {
  return (group.bouts || []).find((bout) => (
    Number(bout.homeNumber) === Number(left.drawNo) && Number(bout.awayNumber) === Number(right.drawNo)
  ) || (
    Number(bout.homeNumber) === Number(right.drawNo) && Number(bout.awayNumber) === Number(left.drawNo)
  )) || null;
}

function poolCellLabel(group, rowAthlete, colAthlete) {
  if (Number(rowAthlete.drawNo) === Number(colAthlete.drawNo)) return '';
  const bout = poolBoutForPair(group, rowAthlete, colAthlete);
  if (!bout) return '-';
  const rowIsHome = Number(bout.homeNumber) === Number(rowAthlete.drawNo);
  return rowIsHome ? bout.homeScore : bout.awayScore;
}

function poolResultRows(group) {
  return [...(group.athletes || [])].sort((a, b) => (Number(b.wins) || 0) - (Number(a.wins) || 0)
    || (Number(b.diff) || 0) - (Number(a.diff) || 0)
    || (Number(a.phaseRank) || 999) - (Number(b.phaseRank) || 999));
}

function poolQuickSummaryRows(group, resultRows) {
  const rows = (resultRows || []).slice(0, 3);
  if (!rows.length) return [];
  return rows.map((athlete, index) => ({
    label: index === 0 ? '当前领先' : `第 ${index + 1}`,
    name: athlete.name || '-',
    detail: `${athlete.wins ?? 0}/${athlete.matches ?? 0} 胜 · 净胜 ${athlete.diff ?? 0}${athlete.phaseRank ? ` · 小组第 ${athlete.phaseRank}` : ''}`,
  }));
}

function renderPoolGroups(event, activeIndex = 0) {
  const groups = event.poolGroups || [];
  if (!groups.length) {
    poolGroups.innerHTML = '<div class="empty">暂无循环赛数据</div>';
    return;
  }
  const index = Math.min(Math.max(Number(activeIndex) || 0, 0), groups.length - 1);
  const group = groups[index];
  const athletes = [...(group.athletes || [])].sort((a, b) => (Number(a.drawNo) || 0) - (Number(b.drawNo) || 0));
  const resultRows = poolResultRows(group);
  const summaryRows = poolQuickSummaryRows(group, resultRows);

  poolGroups.innerHTML = `
    <div class="process-switch" aria-label="选择小组">
      <span>小组</span>
      ${groups.map((item, itemIndex) => `
        <button type="button" class="${itemIndex === index ? 'active' : ''}" data-pool-index="${itemIndex}">
          ${escapeHtml(itemIndex + 1)}
        </button>
      `).join('')}
    </div>
    <section class="pool-process-card">
      <div class="pool-group-head">
        <strong>${escapeHtml(group.title || `第 ${index + 1} 组`)}</strong>
        <span>${escapeHtml(athletes.length)} 人 · ${escapeHtml(group.bouts?.length || 0)} 场</span>
      </div>
      ${summaryRows.length ? `
        <div class="pool-quick-summary">
          ${summaryRows.map((row) => `
            <div>
              <em>${escapeHtml(row.label)}</em>
              <strong>${escapeHtml(row.name)}</strong>
              <span>${escapeHtml(row.detail)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      <div class="process-scroll-hint">横向滑动查看完整对阵，点击姓名进入选手画像。</div>
      <div class="pool-matrix-wrap">
        <table class="pool-matrix" style="--pool-size: ${escapeHtml(athletes.length)}">
          <thead>
            <tr>
              <th>姓名</th>
              ${athletes.map((athlete) => `<th>${escapeHtml(athlete.drawNo ?? '-')}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${athletes.map((rowAthlete) => `
          <tr class="${focusClassForAthlete(rowAthlete)}">
            <th>
              <button class="${focusClassForAthlete(rowAthlete)}" type="button" data-athlete-id="${escapeHtml(rowAthlete.id || '')}">
                ${escapeHtml(rowAthlete.drawNo ?? '-')}.${escapeHtml(rowAthlete.name)}
              </button>
            </th>
            ${athletes.map((colAthlete) => {
              const isSelf = Number(rowAthlete.drawNo) === Number(colAthlete.drawNo);
              const isFocusLine = focusClassForAthlete(rowAthlete) || focusClassForAthlete(colAthlete);
              const label = poolCellLabel(group, rowAthlete, colAthlete);
              return `<td class="${isSelf ? 'self' : ''} ${isFocusLine ? 'focus-line' : ''}">${escapeHtml(label)}</td>`;
            }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="pool-result-table">
        <div class="chart-title">成绩</div>
        <table class="process-table pool-results-table">
          <thead>
            <tr><th>姓名</th><th>V</th><th>M</th><th>Ind</th><th>HS</th><th>HR</th><th>名次</th></tr>
          </thead>
          <tbody>
            ${resultRows.map((athlete) => `
              <tr class="${focusClassForAthlete(athlete)}" data-athlete-id="${escapeHtml(athlete.id || '')}">
                <td>${escapeHtml(athlete.name)}</td>
                <td>${escapeHtml(athlete.wins ?? 0)}</td>
                <td>${escapeHtml(athlete.matches ?? 0)}</td>
                <td>${escapeHtml(athlete.winRate !== undefined ? Number(athlete.winRate).toFixed(2) : '-')}</td>
                <td>${escapeHtml(athlete.scored ?? '-')}</td>
                <td>${escapeHtml(athlete.received ?? '-')}</td>
                <td>${escapeHtml(athlete.phaseRank ? `第${athlete.phaseRank}` : '-')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;

  poolGroups.querySelectorAll('[data-pool-index]').forEach((button) => {
    button.addEventListener('click', () => renderPoolGroups(event, Number(button.dataset.poolIndex)));
  });

  poolGroups.querySelectorAll('[data-athlete-id]').forEach((button) => {
    button.addEventListener('click', () => openAthlete(button.dataset.athleteId));
  });
}

function phaseSeed(match, side) {
  const value = match?.[side]?.position;
  return value || value === 0 ? `(${value})` : '';
}

function matchWinnerName(match) {
  const homeWon = match.home?.result === 'W';
  return match.winner?.name || (homeWon ? match.home?.name : match.away?.name) || '-';
}

function matchScoreText(match) {
  const home = match.home?.points ?? '-';
  const away = match.away?.points ?? '-';
  if (match.isBye) return '轮空';
  if (home === 'V' || away === 'V') return `${home}:${away}`;
  return `${home}:${away}`;
}

function sortedTableauMatches(matches) {
  return [...(matches || [])].sort((a, b) => (
    Number(a.innerOrder ?? a.matchCode ?? 0) - Number(b.innerOrder ?? b.matchCode ?? 0)
    || String(a.matchCode || '').localeCompare(String(b.matchCode || ''), 'zh-CN')
  ));
}

function tableauPhaseStats(matches) {
  const rows = matches || [];
  const bye = rows.filter((match) => match.isBye).length;
  const played = rows.filter((match) => !match.isBye && (match.home?.result || match.away?.result)).length;
  return {
    total: rows.length,
    played,
    bye,
  };
}

function tableauWinnerRows(matches, limit = 4) {
  return (matches || [])
    .map((match) => ({
      winner: matchWinnerName(match),
      score: matchScoreText(match),
      code: match.matchCode || '',
    }))
    .filter((row) => row.winner && row.winner !== '-')
    .slice(0, limit);
}

function renderMatches(event, activeIndex = 0) {
  const groups = event.eliminationPhaseGroups?.length
    ? event.eliminationPhaseGroups
    : fallbackPhaseGroups(event.latestMatches || []);
  if (!groups.length) {
    matchList.innerHTML = '<div class="empty">暂无单败表数据</div>';
    return;
  }
  const index = Math.min(Math.max(Number(activeIndex) || 0, 0), groups.length - 1);
  const group = groups[index];
  const matches = sortedTableauMatches(group.matches || []);
  const stats = tableauPhaseStats(matches);
  const winnerRows = tableauWinnerRows(matches);
  matchList.innerHTML = `
    <div class="process-switch phase-switch" aria-label="选择轮次">
      ${groups.map((item, itemIndex) => `
        <button type="button" class="${itemIndex === index ? 'active' : ''}" data-phase-index="${itemIndex}">
          ${escapeHtml(item.phase)}
        </button>
      `).join('')}
    </div>
    <section class="tableau-phase-summary">
      <div>
        <strong>${escapeHtml(group.phase)}</strong>
        <span>${escapeHtml(stats.total)} 场对阵 · ${escapeHtml(stats.played)} 场已完成 · ${escapeHtml(stats.bye)} 场轮空</span>
      </div>
      <em>${escapeHtml(index + 1)} / ${escapeHtml(groups.length)}</em>
    </section>
    ${winnerRows.length ? `
      <section class="tableau-winner-strip" aria-label="本轮晋级摘要">
        ${winnerRows.map((row) => `
          <div>
            <span>${escapeHtml(row.code ? `对阵 ${row.code}` : group.phase)}</span>
            <strong>${escapeHtml(row.winner)}</strong>
            <em>${escapeHtml(row.score)}</em>
          </div>
        `).join('')}
      </section>
    ` : ''}
    <section class="bracket-board tableau-board">
      ${matches.map((match) => {
        const homeWon = match.home?.result === 'W';
        const awayWon = match.away?.result === 'W';
        const homeFocus = focusClassForAthlete(match.home);
        const awayFocus = focusClassForAthlete(match.away);
        return `
          <div class="bracket-match tableau-match ${homeFocus || awayFocus ? 'has-focus-athlete' : ''}">
            <div class="tableau-match-code">${escapeHtml(match.matchCode ? `对阵 ${match.matchCode}` : group.phase)}</div>
            <div class="tableau-match-body">
              <div class="tableau-player-stack">
                <div class="bracket-row ${homeWon ? 'winner' : ''} ${homeFocus}">
                  <span>${escapeHtml(`${phaseSeed(match, 'home')} ${match.home?.name || '空'}`.trim())}</span>
                  <small>${escapeHtml(match.home?.club || '')}</small>
                </div>
                <div class="bracket-row ${awayWon ? 'winner' : ''} ${awayFocus}">
                  <span>${escapeHtml(`${phaseSeed(match, 'away')} ${match.away?.name || '空'}`.trim())}</span>
                  <small>${escapeHtml(match.away?.club || '')}</small>
                </div>
              </div>
              <div class="tableau-score-pill">${escapeHtml(matchScoreText(match))}</div>
            </div>
            <div class="tableau-advance-row">
              <span>晋级</span>
              <strong>${escapeHtml(matchWinnerName(match))}</strong>
            </div>
          </div>
        `;
      }).join('')}
    </section>
  `;

  matchList.querySelectorAll('[data-phase-index]').forEach((button) => {
    button.addEventListener('click', () => renderMatches(event, Number(button.dataset.phaseIndex)));
  });
}

function fallbackPhaseGroups(matches) {
  return Object.values(
    (matches || []).reduce((groups, match) => {
      const phase = match.phase?.longName || match.phase || '淘汰赛';
      if (!groups[phase]) {
        groups[phase] = { phase, matches: [] };
      }
      groups[phase].matches.push(match);
      return groups;
    }, {}),
  );
}

function renderClubs(event) {
  if (!clubList) return;
  const entries = Object.entries(event.clubDistribution || {});
  clubList.innerHTML = entries.length
    ? entries.map(([club, count]) => `
      <div class="club-card">
        <div>
          <strong>${escapeHtml(club)}</strong>
          <div class="subline">小组赛记录</div>
        </div>
        <div class="value">${escapeHtml(count)}</div>
      </div>
    `).join('')
    : '<div class="empty">暂无俱乐部统计</div>';
}

function renderClubProfiles(event) {
  const rows = event.clubProfiles || [];
  if (!rows.length && event.clubDistribution && Object.keys(event.clubDistribution).length) {
    clubProfiles.innerHTML = '<div class="empty">当前服务没有返回俱乐部画像，请重新启动新版服务。</div>';
    return;
  }
  clubProfiles.innerHTML = rows.length
    ? rows.map((club) => `
      <button class="leader-card clickable" data-club-id="${escapeHtml(club.id)}">
        <div>
          <strong>${escapeHtml(club.club)}</strong>
          <div class="subline">参赛 ${club.entrants} 人 · 奖牌 ${club.medals} · 前八 ${club.top8} · 最好名次 ${club.bestRank ?? '-'}</div>
          <div class="subline">${escapeHtml(club.athletes.map((athlete) => `${athlete.name}${athlete.rank ? `(${athlete.rank}名` : ''}${athlete.medal ? `/${athlete.medal}` : ''}${athlete.rank ? ')' : ''}`).join(' / '))}</div>
        </div>
        <div class="value">${club.medals}</div>
      </button>
    `).join('')
    : '<div class="empty">暂无俱乐部画像</div>';

  clubProfiles.querySelectorAll('[data-club-id]').forEach((button) => {
    button.addEventListener('click', () => openClub(button.dataset.clubId));
  });
}

function renderAthleteProfiles(event) {
  const rows = event.athleteProfiles || [];
  if (!rows.length && event.clubDistribution && Object.keys(event.clubDistribution).length) {
    athleteProfiles.innerHTML = '<div class="empty">当前服务没有返回选手画像，请重新启动新版服务。</div>';
    return;
  }
  athleteProfiles.innerHTML = rows.length
    ? rows.map((athlete) => `
      <button class="leader-card clickable" data-athlete-id="${escapeHtml(athlete.id)}">
        <div>
          <strong>${escapeHtml(athlete.name)}</strong>
          <div class="subline">${escapeHtml(athlete.club || '')} · 最终第 ${escapeHtml(athlete.finalRank)} 名${athlete.medal ? ` · ${escapeHtml(athlete.medal)}` : ''}</div>
          <div class="subline">小组第 ${escapeHtml(athlete.poolRank ?? '-')} · 小组胜场 ${escapeHtml(athlete.poolWins ?? '-')} · 小组净胜 ${escapeHtml(athlete.poolDiff ?? '-')} · 淘汰赛 ${escapeHtml(athlete.eliminationWins)}胜${escapeHtml(athlete.eliminationLosses)}负</div>
        </div>
        <div class="value">${escapeHtml(athlete.finalRank)}</div>
      </button>
    `).join('')
    : '<div class="empty">暂无选手画像</div>';

  athleteProfiles.querySelectorAll('[data-athlete-id]').forEach((button) => {
    button.addEventListener('click', () => openAthlete(button.dataset.athleteId));
  });
}

function rankLabel(rank) {
  return rank || rank === 0 ? `第${rank}名` : '名次待确认';
}

function poolRankLabel(rank) {
  return rank || rank === 0 ? `小组第${rank}` : '小组待确认';
}

function eliminationLabel(event) {
  const wins = Number(event.eliminationWins ?? 0);
  const losses = Number(event.eliminationLosses ?? 0);
  if (!wins && !losses) return '淘汰赛待确认';
  return `淘汰赛 ${wins}胜${losses}负`;
}

function poolPerformanceLabel(percent) {
  if (percent >= 80) return '稳定发挥';
  if (percent >= 55) return '有竞争力';
  return '重点复盘';
}

function buildAthleteTimelineRows(athlete) {
  return (athlete.events || []).map((event) => ({
    eventCode: event.eventCode,
    title: displayEventName(event),
    competition: event.sportName || '比赛名称待确认',
    date: event.openDate || '日期待确认',
    venue: event.venue || '',
    rank: rankLabel(event.finalRank),
    pool: poolRankLabel(event.poolRank),
    poolRecord: event.poolMatches ? `${event.poolWins ?? 0}/${event.poolMatches}` : '小组记录待确认',
    elimination: eliminationLabel(event),
    medal: event.medal || '',
  }));
}

function buildPoolPerformanceRows(events) {
  return (events || []).map((event) => {
    const wins = Number(event.poolWins ?? 0);
    const matches = Number(event.poolMatches ?? 0);
    const percent = matches ? Math.round((wins / matches) * 100) : 0;
    return {
      eventCode: event.eventCode,
      title: displayEventName(event),
      date: event.openDate || '日期待确认',
      record: matches ? `${wins}/${matches}` : '-',
      percent,
      label: matches ? poolPerformanceLabel(percent) : '数据待确认',
    };
  });
}

function buildAthleteDataRequestText(athlete, requestType, details = {}) {
  const typeLabel = requestType === 'hide' ? '申请隐藏公开选手画像' : '申请纠错或合并同名选手';
  const latest = athlete.events?.[0] || {};
  return [
    `FencingAI ${typeLabel}`,
    `选手姓名：${athlete.name || '待确认'}`,
    `当前俱乐部：${athlete.club || '待确认'}`,
    `选手ID：${athlete.id || '待确认'}`,
    details.contact ? `联系方式：${details.contact}` : '',
    latest.sportName ? `最近赛事：${latest.sportName}` : '',
    latest.shortEventName || latest.eventName ? `最近项目：${latest.shortEventName || latest.eventName}` : '',
    requestType === 'hide'
      ? '申请说明：希望隐藏该选手公开画像，请进行身份和监护关系核验。'
      : '申请说明：需要更正姓名、俱乐部、赛事记录，或合并同名选手画像。',
    details.note ? `补充说明：${details.note}` : '补充说明：用户未填写。',
  ].filter(Boolean).join('\n');
}

function requestAthleteDataRequestDetails(athlete, requestType) {
  const typeLabel = requestType === 'hide' ? '隐藏申请' : '纠错/合并申请';
  const existing = storedCommercialContact();
  const contactInput = window.prompt(`留下微信或手机号，方便核验${typeLabel}（可跳过）`, existing);
  if (contactInput === null) return null;
  const contact = saveCommercialContact(contactInput);
  const notePrompt = requestType === 'hide'
    ? `请说明和 ${athlete.name || '该选手'} 的关系，以及希望隐藏的原因`
    : `请说明 ${athlete.name || '该选手'} 需要更正或合并的具体内容`;
  const noteInput = window.prompt(notePrompt, '');
  if (noteInput === null) return null;
  return {
    contact,
    note: String(noteInput || '').trim(),
  };
}

async function submitAthleteDataRequest(athlete, requestType, details = {}) {
  const message = buildAthleteDataRequestText(athlete, requestType, details);
  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deviceId: state.deviceId,
      type: requestType,
      athlete: {
        id: athlete.id,
        name: athlete.name,
        club: athlete.club || '',
      },
      message,
    }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.message || 'submit failed');
  return result;
}

function renderAthleteDataRequestPanel(athlete) {
  if (!athleteActionPanel) return;
  athleteActionPanel.hidden = false;
  athleteActionPanel.innerHTML = `
    <div class="athlete-data-request">
      <div>
        <strong>数据反馈</strong>
        <span>公开成绩如有误，可提交纠错、同名合并或隐藏申请；联系方式只用于核验和反馈处理。</span>
      </div>
      <div class="athlete-data-request-actions">
        <button type="button" data-athlete-request="correct">提交纠错</button>
        <button type="button" data-athlete-request="hide">申请隐藏</button>
      </div>
    </div>
  `;
  athleteActionPanel.querySelectorAll('[data-athlete-request]').forEach((button) => {
    button.addEventListener('click', async () => {
      const originalLabel = button.textContent;
      button.textContent = '提交中';
      button.disabled = true;
      try {
        const details = requestAthleteDataRequestDetails(athlete, button.dataset.athleteRequest);
        if (!details) {
          button.textContent = originalLabel;
          button.disabled = false;
          return;
        }
        await submitAthleteDataRequest(athlete, button.dataset.athleteRequest, details);
        button.textContent = '已提交';
      } catch {
        await copyTextToClipboard(buildAthleteDataRequestText(athlete, button.dataset.athleteRequest, { contact: storedCommercialContact() }));
        button.textContent = '已复制说明';
      }
      setTimeout(() => {
        button.textContent = originalLabel;
        button.disabled = false;
      }, 1600);
    });
  });
}

function renderAthleteDetail(athlete) {
  const followed = isFollowedAthlete(athlete.id);
  athleteHero.innerHTML = `
    <div class="athlete-hero-head">
      <div>
        <div class="hero-title">${escapeHtml(athlete.name)}</div>
        <div class="hero-sub">${escapeHtml(athlete.club || '俱乐部待确认')}</div>
      </div>
      <button class="follow-status-tag ${followed ? 'active' : ''}" id="followAthleteBtn" type="button" aria-pressed="${followed ? 'true' : 'false'}" aria-label="${followed ? '取消关注' : '关注这个孩子'}">
        ${followed ? '已关注' : '未关注'}
      </button>
    </div>
    <div class="badge-row">
      <span class="badge">最好第 ${escapeHtml(athlete.bestRank ?? '-')} 名</span>
      <span class="badge">${escapeHtml(athlete.medals ?? 0)} 枚奖牌</span>
      <span class="badge">淘汰赛 ${escapeHtml(athlete.eliminationWins ?? 0)}胜${escapeHtml(athlete.eliminationLosses ?? 0)}负</span>
    </div>
  `;

  renderAthleteDataRequestPanel(athlete);
  athleteHero.querySelector('#followAthleteBtn').addEventListener('click', async () => {
    if (isFollowedAthlete(athlete.id)) {
      await removeFollowedAthlete(athlete.id);
    } else {
      await upsertFollowedAthlete(athlete);
    }
    renderAthleteDetail(athlete);
  });

  const events = athlete.events || [];
  const latest = events[0] || {};
  const best = [...events].sort((a, b) => (a.finalRank ?? 999) - (b.finalRank ?? 999))[0] || {};
  const avgRank = events.length ? Math.round(events.reduce((sum, event) => sum + (Number(event.finalRank) || 0), 0) / events.length) : '-';
  const totalPoolWins = events.reduce((sum, event) => sum + (Number(event.poolWins) || 0), 0);
  const totalPoolMatches = events.reduce((sum, event) => sum + (Number(event.poolMatches) || 0), 0);
  const poolRate = totalPoolMatches ? Math.round((totalPoolWins / totalPoolMatches) * 100) : 0;
  const totalElimWins = events.reduce((sum, event) => sum + (Number(event.eliminationWins) || 0), 0);
  const totalElimLosses = events.reduce((sum, event) => sum + (Number(event.eliminationLosses) || 0), 0);
  const timelineRows = buildAthleteTimelineRows(athlete);
  const poolPerformanceRows = buildPoolPerformanceRows(events).slice(0, 8);
  const opponentRows = (athlete.opponents || []).slice(0, 5).map((opponent) => ({
    label: opponent.name,
    value: opponent.matches,
    display: `${opponent.wins}胜${opponent.losses}负`,
  }));
  const reportCards = [
    ['最好名次', best.finalRank ? `第${best.finalRank} 名` : '-'],
    ['最近一次', latest.finalRank ? `第${latest.finalRank} 名` : '-'],
    ['小组胜率', totalPoolMatches ? `${poolRate}%` : '-'],
    ['淘汰赛', `${totalElimWins}胜${totalElimLosses}负`],
  ];
  athleteGrowth.innerHTML = events.length
    ? [
      `<div class="report-grid">${reportCards.map(([label, value]) => `
        <div class="report-card">
          <strong>${escapeHtml(value)}</strong>
          <span>${escapeHtml(label)}</span>
        </div>
      `).join('')}</div>`,
      `<div class="athlete-timeline-card">
        <div class="chart-title">参赛时间线</div>
        <div class="athlete-timeline-list">
          ${timelineRows.map((row) => `
            <button class="athlete-timeline-item" type="button" data-event-code="${escapeHtml(row.eventCode || '')}">
              <div class="timeline-main">
                <strong>${escapeHtml(row.title)}</strong>
                <span>${escapeHtml(row.competition)}</span>
                <em>${escapeHtml([row.date, row.venue].filter(Boolean).join(' · '))}</em>
              </div>
              <div class="timeline-side">
                <b>${escapeHtml(row.rank)}</b>
                <span>${escapeHtml(row.pool)} · ${escapeHtml(row.poolRecord)}</span>
                <span>${escapeHtml(row.elimination)}</span>
              </div>
            </button>
          `).join('')}
        </div>
      </div>`,
      `<div class="pool-summary-card">
        <div class="chart-title">近赛小组表现</div>
        <div class="pool-summary-list">
          ${poolPerformanceRows.map((row) => `
            <button class="pool-summary-item" type="button" data-event-code="${escapeHtml(row.eventCode || '')}">
              <div>
                <strong>${escapeHtml(row.title)}</strong>
                <span>${escapeHtml(row.date)}</span>
              </div>
              <div class="pool-summary-score">
                <b>${escapeHtml(row.record)}</b>
                <span>${escapeHtml(row.label)}</span>
              </div>
              <div class="pool-summary-track" aria-hidden="true">
                <div style="width: ${Math.max(4, Math.min(100, row.percent))}%"></div>
              </div>
            </button>
          `).join('')}
        </div>
      </div>`,
      opponentRows.length ? barChart('重点对手', opponentRows, { tone: 'orange' }) : '',
      opponentRows.length ? `<div class="opponent-stack">${athlete.opponents.slice(0, 3).map((opponent) => `
        <div class="opponent-card">
          <div>
            <strong>${escapeHtml(opponent.name)}</strong>
            <span>${escapeHtml(opponent.club || '俱乐部待确认')} · ${escapeHtml(opponent.latestPhase || '淘汰赛')}</span>
          </div>
          <em>${escapeHtml(opponent.wins)}胜${escapeHtml(opponent.losses)}负</em>
        </div>
      `).join('')}</div>` : '',
      opponentRows.length ? `<div class="insight-note compact">${escapeHtml(buildOpponentAdvice(athlete))}</div>` : '',
      `<div class="insight-note compact">${escapeHtml(buildAthleteParentAdvice(athlete, { avgRank, poolRate, totalPoolMatches, totalElimWins, totalElimLosses }))}</div>`,
      `<div class="insight-note compact">${escapeHtml(buildAthleteGrowthNote(athlete))}</div>`,
    ].filter(Boolean).join('')
    : '<div class="empty">暂无成长趋势</div>';

  athleteGrowth.querySelectorAll('[data-event-code]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.eventCode) openEvent(button.dataset.eventCode);
    });
  });

  athleteEvents.innerHTML = athlete.events?.length
    ? athlete.events.map((event) => `
      <button class="event-card" data-event-code="${escapeHtml(event.eventCode)}">
        <strong>${escapeHtml(displayEventName(event))}</strong>
        <div class="subline">${escapeHtml(event.sportName)} · ${escapeHtml(event.venue || '')}</div>
        <div class="event-meta">
          <span class="badge">最终第 ${escapeHtml(event.finalRank ?? '-')} 名</span>
          <span class="badge">小组第 ${escapeHtml(event.poolRank ?? '-')} 名</span>
          <span class="badge">淘汰赛 ${escapeHtml(event.eliminationWins ?? 0)}胜${escapeHtml(event.eliminationLosses ?? 0)}负</span>
        </div>
      </button>
    `).join('')
    : '<div class="empty">暂无参赛记录</div>';

  athleteEvents.querySelectorAll('[data-event-code]').forEach((button) => {
    button.addEventListener('click', () => openEvent(button.dataset.eventCode));
  });
}

function buildAthleteGrowthNote(athlete) {
  const events = athlete.events || [];
  if (!events.length) return '暂无历史参赛记录。';
  const latest = events[0];
  const best = [...events].sort((a, b) => (a.finalRank ?? 999) - (b.finalRank ?? 999))[0];
  if (events.length === 1) {
    return `${athlete.name} 已有 1 场参赛表现，最终第 ${latest.finalRank ?? '-'} 名。下一场重点看名次稳定性和小组赛发挥。`;
  }
  return `${athlete.name} 已有 ${events.length} 场参赛表现，最好名次第 ${best.finalRank ?? '-'} 名，最近一次第 ${latest.finalRank ?? '-'} 名。`;
}

function buildAthleteParentAdvice(athlete, metrics) {
  const events = athlete.events || [];
  if (!events.length) return '暂无足够数据形成成长建议。';
  const latest = events[0];
  const parts = [];
  if (events.length >= 2) {
    const previous = events[1];
    const delta = Number(previous.finalRank || 0) - Number(latest.finalRank || 0);
    if (delta > 0) parts.push(`最近一次比上次提升 ${delta} 名`);
    if (delta < 0) parts.push(`最近一次比上次下降 ${Math.abs(delta)} 名，需要结合对手强度看原因`);
    if (delta === 0) parts.push('最近两次名次稳定');
  } else {
    parts.push('参赛样本还少，下一场重点看稳定性和临场发挥');
  }
  if (metrics.totalPoolMatches) {
    parts.push(metrics.poolRate >= 70 ? '小组赛胜率较高' : metrics.poolRate >= 45 ? '小组赛有竞争力' : '小组赛胜率偏低，适合重点复盘开局和稳定性');
  }
  if (metrics.totalElimWins + metrics.totalElimLosses) {
    parts.push(metrics.totalElimWins > metrics.totalElimLosses ? '淘汰赛有推进能力' : '淘汰赛还需要积累关键分经验');
  }
  return `${athlete.name}：${parts.join('，')}。`;
}

function buildOpponentAdvice(athlete) {
  const opponents = athlete.opponents || [];
  if (!opponents.length) return '暂无淘汰赛对手记录。';
  const top = opponents[0];
  const tough = opponents.find((row) => row.losses > row.wins);
  if (tough) {
    return `${athlete.name} 需要重点关注 ${tough.name}，当前交手 ${tough.wins}胜${tough.losses}负，最近比分 ${tough.latestScore || '-'}。`;
  }
  return `${athlete.name} 淘汰赛记录里与 ${top.name} 交手最多，当前 ${top.wins}胜${top.losses}负。`;
}

function clubWorkspaceAthletes(club) {
  const compactClub = compactText(club.club);
  const rows = Object.values(state.athletesById || {}).length
    ? Object.values(state.athletesById || {})
    : state.athleteSearchIndex || [];
  const merged = new Map();
  rows.forEach((athlete) => {
    if (!athlete?.name || !compactText(athlete.club).includes(compactClub)) return;
    const key = athlete.id || `${athlete.name}__${athlete.club || ''}`;
    if (!merged.has(key)) merged.set(key, athlete);
  });
  return [...merged.values()]
    .sort((a, b) => (a.bestRank ?? 999) - (b.bestRank ?? 999) || (b.medals || 0) - (a.medals || 0) || (b.appearances || 0) - (a.appearances || 0));
}

function clubProjectRows(club) {
  const grouped = new Map();
  for (const event of club.events || []) {
    const label = displayEventName(event);
    if (!grouped.has(label)) {
      grouped.set(label, {
        label,
        entrants: 0,
        medals: 0,
        top8: 0,
        bestRank: null,
        events: [],
      });
    }
    const row = grouped.get(label);
    row.entrants += Number(event.entrants) || 0;
    row.medals += Number(event.medals) || 0;
    row.top8 += Number(event.top8) || 0;
    row.bestRank = row.bestRank === null ? event.bestRank : Math.min(row.bestRank, event.bestRank ?? 999);
    row.events.push(event);
  }
  return [...grouped.values()].sort((a, b) => b.entrants - a.entrants || (a.bestRank ?? 999) - (b.bestRank ?? 999));
}

function buildClubOwnerSummary(club, projectRows) {
  if (!projectRows.length) return `${club.club} 当前比赛样本较少，可先从参赛记录和项目覆盖观察队伍画像。`;
  const topInvestment = projectRows[0];
  const bestProject = [...projectRows].sort((a, b) => (a.bestRank ?? 999) - (b.bestRank ?? 999))[0];
  const medalProjects = projectRows.filter((row) => row.medals > 0).length;
  const top8Projects = projectRows.filter((row) => row.top8 > 0).length;
  return `${club.club} 当前以 ${topInvestment.label} 投入最多，${bestProject.label} 已形成最好第 ${bestProject.bestRank ?? '-'} 名的成绩资产；${top8Projects} 个项目有前八表现，${medalProjects} 个项目有奖牌记录。`;
}

function clubAthleteBuckets(athletes) {
  return {
    focus: athletes.filter((athlete) => (athlete.bestRank ?? 999) <= 8 || (athlete.medals || 0) > 0).slice(0, 4),
    steady: athletes.filter((athlete) => (athlete.bestRank ?? 999) > 8 && (athlete.appearances || 0) >= 2).slice(0, 4),
    observe: athletes.filter((athlete) => (athlete.appearances || 0) <= 1 && (athlete.bestRank ?? 999) > 8).slice(0, 4),
  };
}

function coachSegmentationBuckets(athletes) {
  const rows = [...(athletes || [])].filter((athlete) => athlete?.name);
  const used = new Set();
  const take = (predicate) => rows.filter((athlete) => {
    const key = athlete.id || `${athlete.name}-${athlete.club || ''}`;
    if (used.has(key) || !predicate(athlete)) return false;
    used.add(key);
    return true;
  });
  return [
    {
      key: 'score',
      title: '冲成绩学员',
      note: '已有前八/奖牌或最好名次靠前',
      action: '重点安排强手对局、淘汰赛关键分和赛前情报。',
      rows: take((athlete) => (athlete.bestRank ?? 999) <= 8 || (athlete.medals || 0) > 0),
    },
    {
      key: 'steady',
      title: '稳定成长学员',
      note: '有连续参赛样本，适合做阶段反馈',
      action: '用最近 3 场变化和小组赛稳定性做家长沟通。',
      rows: take((athlete) => (athlete.appearances || athlete.events?.length || 0) >= 2),
    },
    {
      key: 'risk',
      title: '需要关注学员',
      note: '成绩波动或小组赛稳定性不足',
      action: '优先复盘小组赛开局、连续失分和临场状态。',
      rows: take((athlete) => {
        const model = buildParentGrowthModel(athlete);
        return model.events.length >= 2 && ((model.poolRate ?? 0) < 45 || (model.trend ?? 0) < 0);
      }),
    },
    {
      key: 'new',
      title: '样本积累学员',
      note: '比赛样本较少，先建立参赛记录',
      action: '先选择匹配项目和低压力赛事，形成可追踪成长样本。',
      rows: take(() => true),
    },
  ].map((bucket) => ({ ...bucket, rows: bucket.rows.slice(0, 6) }));
}

function renderCoachAthleteBucket(title, note, rows) {
  if (!rows.length) return '';
  return `
    <div class="coach-bucket">
      <div class="coach-bucket-head">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(note)}</span>
      </div>
      <div class="coach-athlete-list">
        ${rows.map((athlete) => `
          <button type="button" data-athlete-id="${escapeHtml(athlete.id || '')}">
            <strong>${escapeHtml(athlete.name)}</strong>
            <span>${escapeHtml(athlete.club || '俱乐部待确认')}</span>
            <em>最好第 ${escapeHtml(athlete.bestRank ?? '-')} 名 · ${escapeHtml(athlete.appearances ?? 0)} 次</em>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function coachAthleteTrainingFocus(athlete) {
  const model = buildParentGrowthModel(athlete);
  const events = athlete.events || [];
  const latest = model.latest || events[0] || null;
  const poolText = model.poolRate === null ? '小组赛样本不足' : `小组胜率 ${model.poolRate}%`;
  const trendText = model.trend === null
    ? '近期变化待观察'
    : model.trend > 0
      ? `最近前进 ${model.trend} 名`
      : model.trend < 0
        ? `最近后退 ${Math.abs(model.trend)} 名`
        : '最近名次持平';
  let training = '先保证参赛连续性，重点看小组赛稳定性和临场专注度。';
  if ((model.poolRate ?? 0) >= 60 && (athlete.bestRank ?? 999) <= 8) {
    training = '具备冲击前列基础，训练重点放在淘汰赛关键分和强手对局。';
  } else if ((model.poolRate ?? 0) >= 45) {
    training = '基础稳定性正在形成，训练重点放在减少小组赛波动和提升晋级后表现。';
  } else if ((events.length || athlete.appearances || 0) >= 2) {
    training = '已有比赛样本，训练重点放在小组赛拿分能力和首场进入状态。';
  }
  return {
    athlete,
    latest,
    poolText,
    trendText,
    training,
    parentMessage: `${model.investment}。${model.advice}`,
    watchPoint: latest
      ? `最近 ${displayEventName(latest)} 第 ${latest.finalRank ?? '-'} 名，下一场重点看名次是否前移。`
      : '下一场先看项目匹配、对手强度和小组赛胜负。'
  };
}

function coachAthleteFollowupRows(athletes) {
  return [...(athletes || [])]
    .filter((athlete) => athlete?.name)
    .sort((a, b) => {
      const aScore = (a.bestRank ?? 999) - (Number(a.appearances) || 0) * 2 - (Number(a.medals) || 0) * 8;
      const bScore = (b.bestRank ?? 999) - (Number(b.appearances) || 0) * 2 - (Number(b.medals) || 0) * 8;
      return aScore - bScore || String(a.name).localeCompare(String(b.name), 'zh-CN');
    })
    .slice(0, 6)
    .map(coachAthleteTrainingFocus);
}

function coachParentCommunicationRows(club, followups = [], buckets = []) {
  const bucketByAthlete = new Map();
  (buckets || []).forEach((bucket) => {
    (bucket.rows || []).forEach((athlete) => {
      const key = athlete.id || `${athlete.name}-${athlete.club || ''}`;
      if (!bucketByAthlete.has(key)) bucketByAthlete.set(key, bucket);
    });
  });
  return (followups || []).slice(0, 4).map((row) => {
    const athlete = row.athlete || {};
    const key = athlete.id || `${athlete.name}-${athlete.club || ''}`;
    const bucket = bucketByAthlete.get(key) || {};
    const status = bucket.title || '阶段复盘';
    return {
      athlete,
      status,
      title: `${athlete.name || '学员'}｜${status}`,
      message: `${athlete.name || '孩子'}近期参赛记录已经可以做阶段复盘：${row.parentMessage} 训练重点：${row.training}`,
      nextStep: row.watchPoint,
    };
  });
}

function coachParentCommunicationText(row = {}) {
  return [
    row.title || '学员阶段反馈',
    row.message || '',
    row.nextStep ? `下一步观察：${row.nextStep}` : '',
    '数据来源：FencingAI 已收录公开赛事成绩',
  ].filter(Boolean).join('\n');
}

function renderCoachAthleteFollowups(athletes) {
  const rows = coachAthleteFollowupRows(athletes);
  if (!rows.length) return '';
  return `
    <div class="coach-followup-list">
      ${rows.map((row) => `
        <button class="coach-followup-card" type="button" data-athlete-id="${escapeHtml(row.athlete.id || '')}">
          <div class="coach-followup-head">
            <strong>${escapeHtml(row.athlete.name)}</strong>
            <span>${escapeHtml(row.athlete.club || '俱乐部待确认')}</span>
          </div>
          <div class="coach-followup-tags">
            <span>${escapeHtml(row.poolText)}</span>
            <span>${escapeHtml(row.trendText)}</span>
          </div>
          <p>${escapeHtml(row.training)}</p>
          <em>${escapeHtml(row.parentMessage)}</em>
          <small>${escapeHtml(row.watchPoint)}</small>
        </button>
      `).join('')}
    </div>
  `;
}

function findClubById(clubId) {
  if (!clubId) return null;
  if (state.currentClub?.id === clubId) return state.currentClub;
  return state.clubsById?.[clubId] || (state.clubSearchIndex || []).find((club) => club.id === clubId) || null;
}

function coachSegmentationEvidenceRows(club, projectRows) {
  return (club.events || []).slice(0, 6).map((event) => ({
    eventCode: event.eventCode,
    title: displayEventName(event),
    detail: [event.sportName, event.venue || club.club].filter(Boolean).join(' · '),
    result: `参赛 ${event.entrants || 0} · 前八 ${event.top8 || 0} · 最好第 ${event.bestRank ?? '-'}`,
  })).concat(projectRows.slice(0, 3).map((row) => ({
    eventCode: row.events?.[0]?.eventCode || '',
    title: row.label,
    detail: '项目汇总',
    result: `参赛 ${row.entrants || 0} · 前八 ${row.top8 || 0} · 奖牌 ${row.medals || 0}`,
  }))).slice(0, 8);
}

function coachBusinessGrowthRows(club, projectRows, buckets) {
  const topProject = projectRows[0] || null;
  const bestProject = [...(projectRows || [])].sort((a, b) => (a.bestRank ?? 999) - (b.bestRank ?? 999))[0] || null;
  const scoreBucket = (buckets || []).find((bucket) => bucket.key === 'score');
  const steadyBucket = (buckets || []).find((bucket) => bucket.key === 'steady');
  return [
    {
      key: 'recruiting',
      title: '招生主推项目',
      label: topProject?.label || '项目待沉淀',
      detail: topProject
        ? `${topProject.label} 参赛 ${topProject.entrants || 0} 人次，适合对外展示训练连续性和参赛氛围。`
        : '先选择投入人数最多的项目，形成稳定班型后再对外主推。',
    },
    {
      key: 'retention',
      title: '续费沟通素材',
      label: `${(steadyBucket?.rows || []).length} 名稳定成长`,
      detail: (steadyBucket?.rows || []).length
        ? `可围绕 ${(steadyBucket.rows || []).slice(0, 3).map((athlete) => athlete.name).join('、')} 做阶段复盘，说明训练带来的稳定变化。`
        : '先积累连续参赛样本，再用阶段复盘和下一场目标做家长沟通。',
    },
    {
      key: 'reputation',
      title: '口碑展示证明',
      label: bestProject ? `最好第 ${bestProject.bestRank ?? '-'} 名` : `${club.top8 || 0} 次前八`,
      detail: bestProject
        ? `${bestProject.label} 已有最好第 ${bestProject.bestRank ?? '-'} 名，可作为对外口碑和圈内位置的证明点。`
        : `当前已有 ${club.top8 || 0} 次前八、${club.medals || 0} 枚奖牌，可先整理成俱乐部成绩名片。`,
    },
    {
      key: 'benchmark',
      title: '重点学员背书',
      label: `${(scoreBucket?.rows || []).length} 名冲成绩`,
      detail: (scoreBucket?.rows || []).length
        ? `代表学员 ${(scoreBucket.rows || []).slice(0, 3).map((athlete) => athlete.name).join('、')} 可作为训练成果案例。`
        : '先把最稳定的学员成长过程沉淀下来，作为后续招生案例。',
    },
  ];
}

function coachOperatingChecklistRows(club, buckets = [], followups = [], projectRows = [], businessRows = []) {
  const byKey = Object.fromEntries((buckets || []).map((bucket) => [bucket.key, bucket]));
  const byBusinessKey = Object.fromEntries((businessRows || []).map((row) => [row.key, row]));
  const topProject = projectRows[0] || null;
  const bestProject = [...(projectRows || [])].sort((a, b) => (a.bestRank ?? 999) - (b.bestRank ?? 999))[0] || null;
  const focusNames = (byKey.score?.rows || []).slice(0, 3).map((athlete) => athlete.name).filter(Boolean).join(' / ');
  const steadyNames = (byKey.steady?.rows || []).slice(0, 3).map((athlete) => athlete.name).filter(Boolean).join(' / ');
  const followupNames = (followups || []).slice(0, 3).map((row) => row.athlete?.name).filter(Boolean).join(' / ');
  return [
    {
      key: 'training',
      title: '训练跟进',
      label: focusNames || topProject?.label || '重点学员',
      detail: focusNames
        ? `优先复盘 ${focusNames} 的小组赛稳定性和淘汰赛关键分。`
        : topProject
          ? `先围绕 ${topProject.label} 建立训练反馈样本。`
          : '先从最近参赛记录里确定重点学员。',
    },
    {
      key: 'retention',
      title: '家长沟通',
      label: followupNames || steadyNames || '阶段复盘',
      detail: followupNames
        ? `优先给 ${followupNames} 的家长输出阶段复盘和下一场观察点。`
        : steadyNames
          ? `围绕 ${steadyNames} 讲清连续参赛后的稳定变化。`
          : '把参赛连续性、名次变化和下一场目标整理成家长能看懂的话。',
    },
    {
      key: 'recruiting',
      title: '招生素材',
      label: byBusinessKey.recruiting?.label || topProject?.label || '项目名片',
      detail: byBusinessKey.recruiting?.detail
        || (topProject ? `${topProject.label} 可作为对外展示的主项目。` : '先选择人数基础最稳定的项目做对外展示。'),
    },
    {
      key: 'reputation',
      title: '口碑证明',
      label: byBusinessKey.reputation?.label || (bestProject ? `最好第 ${bestProject.bestRank ?? '-'} 名` : `${club.top8 || 0} 次前八`),
      detail: byBusinessKey.reputation?.detail
        || (bestProject ? `${bestProject.label} 可以作为俱乐部口碑和训练成果的证明点。` : '把前八、奖牌和代表学员沉淀成俱乐部成绩名片。'),
    },
  ];
}

function buildCoachSegmentationShareText(club, buckets, followups, projectRows, businessRows = []) {
  const topProject = projectRows[0];
  const communicationRows = coachParentCommunicationRows(club, followups, buckets);
  const checklistRows = coachOperatingChecklistRows(club, buckets, followups, projectRows, businessRows);
  return [
    `${club.club} 学员分层报告`,
    `识别学员：${buckets.reduce((sum, bucket) => sum + bucket.rows.length, 0)} 人`,
    topProject ? `重点项目：${topProject.label}，参赛 ${topProject.entrants || 0} 人次，最好第 ${topProject.bestRank ?? '-'} 名` : '重点项目：待形成',
    ...buckets.map((bucket) => `${bucket.title}：${bucket.rows.map((athlete) => athlete.name).filter(Boolean).slice(0, 4).join(' / ') || '暂无'}。${bucket.action}`),
    ...followups.slice(0, 3).map((row, index) => `跟进${index + 1}：${row.athlete.name}，${row.training}`),
    ...communicationRows.slice(0, 3).map((row, index) => `家长沟通${index + 1}：${row.title}。${row.message}`),
    ...businessRows.slice(0, 4).map((row) => `${row.title}：${row.label}。${row.detail}`),
    '数据来源：FencingAI 已收录赛事成绩',
  ].join('\n');
}

function coachSegmentationShareUrl(clubId = '') {
  const url = new URL(window.location.href);
  url.hash = '';
  url.search = '';
  url.searchParams.set('coach', clubId || 'coach-segmentation');
  return url.toString();
}

function buildCoachSegmentationPageShareText(club, buckets = [], projectRows = []) {
  const topProject = projectRows[0] || null;
  const athleteCount = buckets.reduce((sum, bucket) => sum + (bucket.rows?.length || 0), 0);
  return [
    `${club.club} 教练工作台`,
    `识别学员 ${athleteCount} 人${topProject ? ` · 重点项目 ${topProject.label}` : ''}`,
    '打开后可查看学员分层、家长沟通摘要、招生素材和可追溯成绩依据。',
    coachSegmentationShareUrl(club.id),
  ].filter(Boolean).join('\n');
}

function renderCoachSegmentationReport(clubId = '') {
  const club = findClubById(clubId) || state.clubSearchIndex?.[0] || null;
  if (!club?.id) {
    coachSegmentationReportHero.innerHTML = `
      <div class="hero-title">学员分层报告</div>
      <div class="hero-sub">先进入一个俱乐部后生成</div>
    `;
    coachSegmentationReportBody.innerHTML = `
      <article class="panel coach-segmentation-report-card">
        <div class="empty compact-empty">还没有可生成报告的俱乐部。先搜索并进入俱乐部画像，再生成学员分层报告。</div>
      </article>
    `;
    return;
  }

  const athletes = clubWorkspaceAthletes(club);
  const projectRows = clubProjectRows(club);
  const buckets = coachSegmentationBuckets(athletes);
  const followups = coachAthleteFollowupRows(athletes);
  const evidenceRows = coachSegmentationEvidenceRows(club, projectRows);
  const businessRows = coachBusinessGrowthRows(club, projectRows, buckets);
  const communicationRows = coachParentCommunicationRows(club, followups, buckets);
  const checklistRows = coachOperatingChecklistRows(club, buckets, followups, projectRows, businessRows);
  const topProject = projectRows[0] || null;
  const scoreBucket = buckets.find((bucket) => bucket.key === 'score');
  const riskBucket = buckets.find((bucket) => bucket.key === 'risk');

  coachSegmentationReportHero.innerHTML = `
    <div class="hero-title">${escapeHtml(club.club)} 学员分层报告</div>
    <div class="hero-sub">教练视角 · 训练反馈与留存沟通</div>
    <div class="badge-row">
      <span class="badge">识别学员 ${escapeHtml(athletes.length)}</span>
      <span class="badge">项目 ${escapeHtml(projectRows.length)}</span>
      <span class="badge">前八 ${escapeHtml(club.top8 || 0)}</span>
      <span class="badge">最好第 ${escapeHtml(club.bestRank ?? '-')} 名</span>
    </div>
    <div class="report-share-row">
      <button class="report-share-action" type="button" data-report-share="coach-segmentation">复制报告摘要</button>
      <button class="report-share-action secondary" type="button" data-report-share="coach-segmentation-page">复制工作台页</button>
    </div>
  `;

  coachSegmentationReportBody.innerHTML = `
    <article class="panel coach-segmentation-report-card coach-segmentation-summary">
      <div class="section-title">
        <h2>教练摘要</h2>
        <span>先看动作</span>
      </div>
      <strong>${escapeHtml(buildClubOwnerSummary(club, projectRows))}</strong>
      <p>${escapeHtml(topProject ? `${topProject.label} 是当前最主要项目；建议先把重点学员、稳定学员和需关注学员拆开沟通。` : '先积累项目参赛记录，再形成稳定分层。')}</p>
      <div class="coach-segmentation-metrics">
        <div><strong>${escapeHtml(scoreBucket?.rows.length || 0)}</strong><span>冲成绩</span></div>
        <div><strong>${escapeHtml(buckets.find((bucket) => bucket.key === 'steady')?.rows.length || 0)}</strong><span>稳定成长</span></div>
        <div><strong>${escapeHtml(riskBucket?.rows.length || 0)}</strong><span>需要关注</span></div>
        <div><strong>${escapeHtml(buckets.find((bucket) => bucket.key === 'new')?.rows.length || 0)}</strong><span>样本积累</span></div>
      </div>
    </article>

    <article class="panel coach-segmentation-report-card coach-operating-checklist">
      <div class="section-title">
        <h2>教练跟进清单</h2>
        <span>本周优先</span>
      </div>
      <div class="coach-operating-grid">
        ${checklistRows.map((row) => `
          <div class="coach-operating-card coach-operating-${escapeHtml(row.key)}">
            <span>${escapeHtml(row.title)}</span>
            <strong>${escapeHtml(row.label)}</strong>
            <em>${escapeHtml(row.detail)}</em>
          </div>
        `).join('')}
      </div>
    </article>

    <article class="panel coach-segmentation-report-card">
      <div class="section-title">
        <h2>学员分层</h2>
        <span>训练安排</span>
      </div>
      <div class="coach-segmentation-buckets">
        ${buckets.map((bucket) => `
          <section class="coach-segmentation-bucket">
            <div class="coach-bucket-head">
              <strong>${escapeHtml(bucket.title)}</strong>
              <span>${escapeHtml(bucket.rows.length)} 人</span>
            </div>
            <p>${escapeHtml(bucket.note)}。${escapeHtml(bucket.action)}</p>
            <div class="coach-segmentation-athletes">
              ${bucket.rows.length ? bucket.rows.map((athlete) => {
                const row = coachAthleteTrainingFocus(athlete);
                return `
                  <button type="button" data-athlete-id="${escapeHtml(athlete.id || '')}">
                    <strong>${escapeHtml(athlete.name)}</strong>
                    <span>${escapeHtml(`${row.poolText} · ${row.trendText}`)}</span>
                    <em>${escapeHtml(row.training)}</em>
                  </button>
                `;
              }).join('') : '<div class="empty compact-empty">暂无匹配学员。</div>'}
            </div>
          </section>
        `).join('')}
      </div>
    </article>

    <article class="panel coach-segmentation-report-card">
      <div class="section-title">
        <h2>本周跟进</h2>
        <span>家长沟通</span>
      </div>
      <div class="coach-segmentation-followups">
        ${followups.length ? followups.slice(0, 5).map((row) => `
          <button type="button" data-athlete-id="${escapeHtml(row.athlete.id || '')}">
            <strong>${escapeHtml(row.athlete.name)}</strong>
            <span>${escapeHtml(row.parentMessage)}</span>
            <em>${escapeHtml(row.watchPoint)}</em>
          </button>
        `).join('') : '<div class="empty compact-empty">暂无可跟进学员。</div>'}
      </div>
    </article>

    <article class="panel coach-segmentation-report-card coach-parent-communication">
      <div class="section-title">
        <h2>家长沟通摘要</h2>
        <span>可复制</span>
      </div>
      <div class="coach-parent-message-list">
        ${communicationRows.length ? communicationRows.map((row, index) => `
          <article class="coach-parent-message-card">
            <div>
              <strong>${escapeHtml(row.title)}</strong>
              <span>${escapeHtml(row.message)}</span>
              <em>${escapeHtml(row.nextStep)}</em>
            </div>
            <div class="coach-parent-message-actions">
              <button type="button" data-coach-parent-message="${escapeHtml(index)}">复制给家长</button>
              <button type="button" data-athlete-id="${escapeHtml(row.athlete.id || '')}">看选手</button>
            </div>
          </article>
        `).join('') : '<div class="empty compact-empty">暂无可生成沟通摘要的学员。</div>'}
      </div>
    </article>

    <article class="panel coach-segmentation-report-card coach-business-growth">
      <div class="section-title">
        <h2>招生与口碑素材</h2>
        <span>增长使用</span>
      </div>
      <div class="coach-business-grid">
        ${businessRows.map((row) => `
          <div class="coach-business-card coach-business-${escapeHtml(row.key)}">
            <span>${escapeHtml(row.title)}</span>
            <strong>${escapeHtml(row.label)}</strong>
            <em>${escapeHtml(row.detail)}</em>
          </div>
        `).join('')}
      </div>
    </article>

    <article class="panel coach-segmentation-report-card">
      <div class="section-title">
        <h2>项目依据</h2>
        <span>可追溯</span>
      </div>
      <div class="coach-segmentation-evidence">
        ${evidenceRows.length ? evidenceRows.map((row) => `
          <button type="button" data-event-code="${escapeHtml(row.eventCode || '')}">
            <strong>${escapeHtml(row.title)}</strong>
            <span>${escapeHtml(row.detail)}</span>
            <em>${escapeHtml(row.result)}</em>
          </button>
        `).join('') : '<div class="empty compact-empty">暂无可追溯项目记录。</div>'}
      </div>
      <button class="primary-action compact-action" type="button" data-club-id="${escapeHtml(club.id)}">查看完整俱乐部画像</button>
    </article>

    ${reportConversionCard({
      source: 'coach-segmentation-report',
      title: '把学员分层用于日常经营',
      detail: '适合小型剑馆验证训练反馈、家长沟通和招生展示是否能形成稳定流程。',
      primaryLabel: '申请教练试用',
      secondaryLabel: '关注团队权益',
    })}
    ${reportReminderCard({
      source: 'coach-segmentation-reminder',
      title: '学员跟进提醒',
      detail: '把重点学员、家长沟通和赛前名单更新固定下来，方便教练持续跟进。',
      label: '订阅跟进提醒',
    })}
  `;

  coachSegmentationReportBody.querySelectorAll('[data-athlete-id]').forEach((button) => {
    if (!button.dataset.athleteId) return;
    button.addEventListener('click', () => openAthlete(button.dataset.athleteId));
  });
  coachSegmentationReportBody.querySelectorAll('[data-event-code]').forEach((button) => {
    if (!button.dataset.eventCode) return;
    button.addEventListener('click', () => openEvent(button.dataset.eventCode));
  });
  coachSegmentationReportBody.querySelectorAll('[data-coach-parent-message]').forEach((button) => {
    const row = communicationRows[Number(button.dataset.coachParentMessage)];
    bindCopyTextButton(button, () => coachParentCommunicationText(row), 'coach-parent-message', '已复制，可直接发给家长。');
  });
  coachSegmentationReportBody.querySelector('[data-club-id]')?.addEventListener('click', () => openClub(club.id));
  bindReportConversionActions(coachSegmentationReportBody);
  bindCopyTextButton(coachSegmentationReportHero.querySelector('[data-report-share="coach-segmentation"]'), () => buildCoachSegmentationShareText(club, buckets, followups, projectRows, businessRows), 'coach-segmentation', '已复制，可继续申请教练试用。');
  bindCopyTextButton(coachSegmentationReportHero.querySelector('[data-report-share="coach-segmentation-page"]'), () => buildCoachSegmentationPageShareText(club, buckets, projectRows), 'coach-segmentation-page', '已复制工作台页，可直接发给教练或馆长。');
}

function openCoachSegmentationReport(clubId = '') {
  trackAnalyticsAction('open_report', 'coach-segmentation');
  renderCoachSegmentationReport(clubId);
  const club = findClubById(clubId) || state.clubSearchIndex?.[0] || null;
  if (club?.id) {
    trackReportHistory({
      type: 'coach-segmentation',
      id: club.id,
      title: `${club.club} 学员分层`,
      detail: '教练视角',
      typeLabel: '教练报告',
    });
  }
  navigateTo('coachSegmentationReport');
}

function buildClubGrowthHighlights(club, projectRows, athletes) {
  const bestProject = [...projectRows].sort((a, b) => (a.bestRank ?? 999) - (b.bestRank ?? 999))[0];
  const topInvestment = projectRows[0];
  const topAthlete = athletes[0];
  return [
    bestProject ? `${bestProject.label} 已有最好第 ${bestProject.bestRank ?? '-'} 名，可作为对外展示的成绩亮点。` : '',
    topInvestment ? `${topInvestment.label} 参赛基础最完整，适合沉淀成稳定班型和家长沟通素材。` : '',
    topAthlete ? `${topAthlete.name} 是当前代表学员之一，可围绕成长过程讲清训练成果。` : '',
  ].filter(Boolean);
}

function clubPeerRows(club, projectRows) {
  const currentClub = compactText(club.club);
  const labels = new Set(projectRows.map((row) => compactText(row.label)).filter(Boolean));
  if (!labels.size) return [];
  const clubs = Object.values(state.clubsById || {});
  return clubs
    .filter((peer) => peer?.club && compactText(peer.club) !== currentClub && compactText(peer.club) !== '个人')
    .map((peer) => {
      const peerProjects = clubProjectRows(peer);
      const overlapProjects = peerProjects.filter((row) => labels.has(compactText(row.label)));
      const overlapEntrants = overlapProjects.reduce((sum, row) => sum + (Number(row.entrants) || 0), 0);
      const overlapTop8 = overlapProjects.reduce((sum, row) => sum + (Number(row.top8) || 0), 0);
      const overlapMedals = overlapProjects.reduce((sum, row) => sum + (Number(row.medals) || 0), 0);
      const bestRank = overlapProjects.reduce((best, row) => Math.min(best, Number(row.bestRank) || 999), 999);
      return {
        id: peer.id,
        club: peer.club,
        overlapCount: overlapProjects.length,
        overlapEntrants,
        overlapTop8,
        overlapMedals,
        bestRank: bestRank === 999 ? null : bestRank,
        overlapProjects,
        score: overlapProjects.length * 20 + overlapTop8 * 4 + overlapMedals * 8 + Math.max(0, 20 - (bestRank === 999 ? 20 : bestRank)),
      };
    })
    .filter((row) => row.overlapCount > 0)
    .sort((a, b) => b.score - a.score || b.overlapEntrants - a.overlapEntrants)
    .slice(0, 5);
}

function buildClubBusinessCards(club, projectRows, athletes, peerRows) {
  const bestProject = [...projectRows].sort((a, b) => (a.bestRank ?? 999) - (b.bestRank ?? 999))[0];
  const strongestAthlete = athletes[0];
  const topProject = projectRows[0];
  return [
    {
      title: '对外成绩名片',
      value: `最好第 ${club.bestRank ?? '-'} 名`,
      detail: `${club.top8 || 0} 次前八，${club.medals || 0} 枚奖牌，可用于家长沟通和招生展示。`,
    },
    {
      title: '主力项目',
      value: topProject?.label || '待积累',
      detail: topProject ? `参赛 ${topProject.entrants} 人次，最好第 ${topProject.bestRank ?? '-'} 名。` : '更多成绩收录后会形成项目名片。',
    },
    {
      title: '代表学员',
      value: strongestAthlete?.name || '待识别',
      detail: strongestAthlete ? `最好第 ${strongestAthlete.bestRank ?? '-'} 名，${strongestAthlete.appearances || 0} 次参赛记录。` : '关注学员参赛后可沉淀成长案例。',
    },
    {
      title: '同项目参照',
      value: peerRows[0]?.club || '待形成',
      detail: peerRows[0] ? `${peerRows[0].overlapCount} 个项目重合，最好第 ${peerRows[0].bestRank ?? '-'} 名。` : '同项目数据增加后可做更清晰的对标。',
    },
    {
      title: '突破机会',
      value: bestProject?.label || '重点项目',
      detail: bestProject ? `${bestProject.label} 已有成绩基础，适合继续做赛前复盘和强手研究。` : '先稳定参赛连续性，再看突破项目。',
    },
  ];
}

function clubShareHighlights(club, projectRows, athletes) {
  const bestProject = [...projectRows].sort((a, b) => (a.bestRank ?? 999) - (b.bestRank ?? 999))[0];
  const topProject = projectRows[0];
  const strongestAthlete = athletes[0];
  return [
    `参赛 ${club.entrants || 0} 人次`,
    `${club.top8 || 0} 次前八`,
    `${club.medals || 0} 枚奖牌`,
    `最好第 ${club.bestRank ?? '-'} 名`,
    topProject ? `主力项目 ${topProject.label}` : '',
    bestProject ? `${bestProject.label} 最好第 ${bestProject.bestRank ?? '-'} 名` : '',
    strongestAthlete ? `代表学员 ${strongestAthlete.name}` : '',
  ].filter(Boolean);
}

function buildClubShareText(club, projectRows, athletes) {
  const highlights = clubShareHighlights(club, projectRows, athletes);
  const bestProject = [...projectRows].sort((a, b) => (a.bestRank ?? 999) - (b.bestRank ?? 999))[0];
  const strongestAthlete = athletes[0];
  const scripts = buildClubCommunicationScripts(club, projectRows, athletes);
  const lines = [
    `${club.club} 击剑成长数据名片`,
    highlights.slice(0, 4).join('，'),
    bestProject ? `优势项目：${bestProject.label}，参赛 ${bestProject.entrants || 0} 人次，最好第 ${bestProject.bestRank ?? '-'} 名。` : '',
    strongestAthlete ? `代表学员：${strongestAthlete.name}，最好第 ${strongestAthlete.bestRank ?? '-'} 名，${strongestAthlete.appearances || 0} 次参赛记录。` : '',
    scripts.length ? '对外沟通重点：' : '',
    ...scripts.map((row) => `${row.title}：${row.detail}`),
    '数据来自已收录赛事成绩，可用于家长沟通、续费反馈和招生展示。',
  ].filter(Boolean);
  return lines.join('\n');
}

function buildClubCommunicationScripts(club, projectRows, athletes) {
  const bestProject = [...projectRows].sort((a, b) => (a.bestRank ?? 999) - (b.bestRank ?? 999))[0];
  const topProject = projectRows[0];
  const strongestAthlete = athletes[0];
  const steadyAthletes = athletes.filter((athlete) => (athlete.appearances || 0) >= 2).slice(0, 2);
  return [
    {
      title: '成绩背书',
      detail: `${club.club} 已收录 ${club.entrants || 0} 人次参赛，累计 ${club.top8 || 0} 次前八、${club.medals || 0} 枚奖牌，最好第 ${club.bestRank ?? '-'} 名。`,
    },
    bestProject ? {
      title: '优势项目',
      detail: `${bestProject.label} 是当前最适合对外展示的项目，已有最好第 ${bestProject.bestRank ?? '-'} 名和 ${bestProject.top8 || 0} 次前八表现。`,
    } : topProject ? {
      title: '重点项目',
      detail: `${topProject.label} 参赛基础较完整，适合作为后续训练反馈和参赛规划的主线。`,
    } : null,
    strongestAthlete ? {
      title: '成长案例',
      detail: `${strongestAthlete.name} 已有 ${strongestAthlete.appearances || 0} 次参赛记录，最好第 ${strongestAthlete.bestRank ?? '-'} 名，可用于说明训练和比赛经验的积累。`,
    } : steadyAthletes.length ? {
      title: '成长案例',
      detail: `${steadyAthletes.map((athlete) => athlete.name).join('、')} 已形成连续参赛记录，可作为后续成长复盘样本。`,
    } : null,
    {
      title: '下一步',
      detail: '建议围绕重点项目复盘近期比赛，把代表学员、强手对标和赛前准备讲清楚，形成稳定的家长沟通材料。',
    },
  ].filter(Boolean);
}

function renderClubCommunicationScripts(club, projectRows, athletes) {
  const scripts = buildClubCommunicationScripts(club, projectRows, athletes);
  if (!scripts.length) return '';
  return `
    <section class="coach-section club-script-section">
      <div class="section-title">
        <h2>对外沟通话术</h2>
        <span>家长能听懂</span>
      </div>
      <div class="club-script-list">
        ${scripts.map((row) => `
          <div class="club-script-card">
            <strong>${escapeHtml(row.title)}</strong>
            <span>${escapeHtml(row.detail)}</span>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderClubShareCard(club, projectRows, athletes) {
  const highlights = clubShareHighlights(club, projectRows, athletes).slice(0, 4);
  const bestProject = [...projectRows].sort((a, b) => (a.bestRank ?? 999) - (b.bestRank ?? 999))[0];
  const strongestAthlete = athletes[0];
  return `
    <section class="coach-section club-share-section">
      <div class="section-title">
        <h2>分享名片</h2>
        <span>家长可看</span>
      </div>
      <div class="club-share-card">
        <div class="club-share-head">
          <span>FencingAI</span>
          <strong>${escapeHtml(club.club)}</strong>
          <em>击剑成长数据名片</em>
        </div>
        <div class="club-share-kpis">
          ${highlights.map((text) => `<span>${escapeHtml(text)}</span>`).join('')}
        </div>
        <div class="club-share-proof">
          <div>
            <span>优势项目</span>
            <strong>${escapeHtml(bestProject?.label || '持续积累中')}</strong>
            <em>${escapeHtml(bestProject ? `参赛 ${bestProject.entrants || 0} 人次，最好第 ${bestProject.bestRank ?? '-'} 名` : '更多成绩收录后会形成项目案例')}</em>
          </div>
          <div>
            <span>代表学员</span>
            <strong>${escapeHtml(strongestAthlete?.name || '持续积累中')}</strong>
            <em>${escapeHtml(strongestAthlete ? `最好第 ${strongestAthlete.bestRank ?? '-'} 名，${strongestAthlete.appearances || 0} 次记录` : '更多学员成绩收录后会形成成长案例')}</em>
          </div>
        </div>
        <button class="club-share-action" type="button" data-share-club>复制分享文案</button>
      </div>
    </section>
  `;
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

function projectCoachAdvice(row) {
  if (row.medals > 0) return '可作为口碑项目继续强化，沉淀代表学员和比赛复盘。';
  if (row.top8 > 0) return '已有前八基础，下一步重点提升淘汰赛稳定性。';
  if (row.entrants >= 4) return '人数基础不错，需要观察小组赛胜率和名次前移。';
  return '样本仍少，先保持参赛连续性，积累可判断的数据。';
}

function buildCoachActionPlan({ club, projectRows, athletes, athleteBuckets, peerRows, rosterRows }) {
  const focusNames = athleteBuckets.focus.map((athlete) => athlete.name).filter(Boolean).slice(0, 2);
  const steadyNames = athleteBuckets.steady.map((athlete) => athlete.name).filter(Boolean).slice(0, 2);
  const topProject = projectRows[0];
  const bestProject = [...projectRows].sort((a, b) => (a.bestRank ?? 999) - (b.bestRank ?? 999))[0];
  const rosterProjects = rosterItemSummary(rosterRows);
  return [
    {
      title: '训练安排',
      value: focusNames.length ? focusNames.join(' / ') : (topProject?.label || '重点项目'),
      detail: focusNames.length
        ? `优先复盘重点学员最近比赛，围绕淘汰赛关键分和小组赛稳定性安排训练。`
        : `先围绕 ${topProject?.label || '参赛最多项目'} 建立训练样本，继续积累可判断的数据。`,
    },
    {
      title: '家长沟通',
      value: steadyNames.length ? steadyNames.join(' / ') : `${athletes.length || 0} 名学员画像`,
      detail: steadyNames.length
        ? `用稳定参赛和阶段进步解释训练价值，降低家长只看单场名次的判断偏差。`
        : `先把参赛次数、最好名次和近期变化讲清楚，形成可复用的成长反馈。`,
    },
    {
      title: '赛前准备',
      value: rosterRows.length ? `${rosterRows.length} 条报名` : (rosterProjects[0]?.label || '近期赛事'),
      detail: rosterRows.length
        ? `按 ${rosterProjects[0]?.label || '报名项目'} 拆备名单确认、重点对手和临场目标。`
        : `先关注同项目近期赛事，名单更新后再细化到每个学员。`,
    },
    {
      title: '招生素材',
      value: bestProject?.label || `最好第 ${club.bestRank ?? '-'} 名`,
      detail: bestProject
        ? `用 ${bestProject.label} 最好第 ${bestProject.bestRank ?? '-'} 名、前八和代表学员做对外案例。`
        : `先沉淀代表项目、代表学员和同项目对标，形成可分享成绩名片。`,
    },
    {
      title: '竞争位置',
      value: peerRows[0]?.club || '同项目对标',
      detail: peerRows[0]
        ? `重点观察 ${peerRows[0].club} 的重合项目表现，判断本馆优势和短板。`
        : `同项目样本增加后，用前八率、奖牌和最好名次评估口碑位置。`,
    },
  ];
}

function renderCoachActionPlan(cards) {
  return `
    <section class="coach-section">
      <div class="section-title">
        <h2>本周行动</h2>
        <span>训练、留存、增长</span>
      </div>
      <div class="coach-action-grid">
        ${cards.map((card) => `
          <div class="coach-action-card">
            <span>${escapeHtml(card.title)}</span>
            <strong>${escapeHtml(card.value)}</strong>
            <em>${escapeHtml(card.detail)}</em>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function rosterClubText(row) {
  return [row.organShortName, row.organName, row.club, row.clubName].filter(Boolean).join(' ');
}

function clubRosterRows(club) {
  const compactClub = compactText(club.club);
  const rows = [];
  for (const competition of state.competitions || []) {
    for (const item of competition.items || []) {
      for (const roster of item.roster || []) {
        if (!compactText(rosterClubText(roster)).includes(compactClub)) continue;
        rows.push({
          ...roster,
          sportName: roster.sportName || competition.sportName,
          eventName: roster.eventName || item.eventName,
          eventCode: roster.eventCode || item.eventCode,
          competition,
          item,
        });
      }
    }
  }
  return rows;
}

function relevantPreMatchCompetitions(projectRows) {
  const projectLabels = projectRows.map((row) => compactText(row.label)).filter(Boolean);
  return [...(state.competitions || [])]
    .filter((competition) => ['registration', 'upcoming'].includes(competition.status) || competition.isPreEvent)
    .map((competition) => {
      const matchedItems = competitionItemSummaries(competition).filter((item) => {
        const itemLabel = compactText(displayEventName(item));
        return projectLabels.some((label) => itemLabel.includes(label) || label.includes(itemLabel));
      });
      return { competition, matchedItems };
    })
    .filter((row) => row.matchedItems.length || row.competition.status === 'registration')
    .sort((a, b) => Math.abs(daysFromToday(competitionDateValue(a.competition))) - Math.abs(daysFromToday(competitionDateValue(b.competition))))
    .slice(0, 3);
}

function coachStrongOpponentPool(club, projectRows) {
  const compactClub = compactText(club.club);
  const labels = projectRows.slice(0, 5).map((row) => compactText(row.label)).filter(Boolean);
  return [...(state.athleteSearchIndex || [])]
    .filter((athlete) => {
      if (!athlete.name || compactText(athlete.club).includes(compactClub)) return false;
      if ((athlete.bestRank ?? 999) > 16) return false;
      const eventText = compactText([...(athlete.eventLabels || []), ...(athlete.events || []).map((event) => displayEventName(event))].join(' '));
      return labels.some((label) => eventText.includes(label) || label.includes(eventText));
    })
    .sort((a, b) => (a.bestRank ?? 999) - (b.bestRank ?? 999) || (b.appearances || 0) - (a.appearances || 0))
    .slice(0, 6);
}

function athleteMatchesProjectLabel(athlete, label) {
  const target = compactText(label);
  if (!target) return false;
  const eventText = compactText([...(athlete.eventLabels || []), ...(athlete.events || []).map((event) => displayEventName(event))].join(' '));
  return eventText.includes(target) || target.includes(eventText);
}

function coachOpponentProjectRows(opponentPool, projectRows) {
  return projectRows.slice(0, 4)
    .map((project) => {
      const opponents = opponentPool
        .filter((athlete) => athleteMatchesProjectLabel(athlete, project.label))
        .sort((a, b) => (a.bestRank ?? 999) - (b.bestRank ?? 999) || (b.appearances || 0) - (a.appearances || 0))
        .slice(0, 3);
      return {
        label: project.label,
        opponents,
        bestRank: opponents[0]?.bestRank ?? null,
      };
    })
    .filter((row) => row.opponents.length);
}

function opponentStrengthLabel(opponents) {
  const bestRank = Math.min(...(opponents || []).map((athlete) => Number(athlete.bestRank) || 999));
  if (bestRank <= 3) return '前三强度';
  if (bestRank <= 8) return '前八强度';
  if (bestRank <= 16) return '淘汰赛强度';
  return '观察样本';
}

function coachOpponentMatchReason(candidate, opponents) {
  const bestOpponent = opponents[0] || {};
  const parts = [];
  if (candidate.projectLabel) parts.push(`同项目 ${candidate.projectLabel}`);
  if (bestOpponent.bestRank) parts.push(`对手最好第 ${bestOpponent.bestRank} 名`);
  if (bestOpponent.appearances) parts.push(`${bestOpponent.appearances} 次记录`);
  return parts.length ? parts.join(' · ') : '按同项目历史成绩匹配';
}

function coachOpponentTrainingFocus(candidate, opponents) {
  const strength = opponentStrengthLabel(opponents);
  const ownRank = Number(candidate.bestRank) || 0;
  if (strength === '前三强度' || strength === '前八强度') {
    return ownRank && ownRank <= 8
      ? '重点准备淘汰赛关键分、领先后处理和落后追分。'
      : '先把小组赛目标、首场进入状态和强手对局预案讲清楚。';
  }
  if ((candidate.appearances || 0) >= 2) return '重点看同项目稳定性，减少小组赛波动。';
  return '先用对手画像建立比赛预期，避免只按报名人数判断难度。';
}

function athleteProjectLabelsForPrematch(athlete) {
  return uniqueBy((athlete.events || [])
    .map((event) => displayEventName(event))
    .filter(Boolean), (label) => compactText(label)).slice(0, 3);
}

function coachAthleteOpponentRows({ rosterRows, athletes, opponentPool, projectRows }) {
  const rows = [];
  const used = new Set();
  const rosterCandidates = (rosterRows || [])
    .map((row) => {
      const history = rosterHistoryMatch(row);
      return {
        id: history?.id || row.athleteId || row.registerCode || '',
        name: rosterAthleteLabel(row),
        projectLabel: rosterEventLabel(row),
        bestRank: history?.bestRank ?? null,
        appearances: history?.appearances ?? 0,
        source: '报名名单',
      };
    });
  const athleteCandidates = (athletes || []).map((athlete) => ({
    id: athlete.id || '',
    name: athlete.name,
    projectLabel: athleteProjectLabelsForPrematch(athlete)[0] || projectRows[0]?.label || '',
    bestRank: athlete.bestRank ?? null,
    appearances: athlete.appearances ?? 0,
    source: '历史学员',
  }));

  for (const candidate of [...rosterCandidates, ...athleteCandidates]) {
    const key = compactText(candidate.name);
    if (!key || used.has(key)) continue;
    const projectLabel = candidate.projectLabel || projectRows[0]?.label || '';
    const opponents = opponentPool
      .filter((athlete) => athleteMatchesProjectLabel(athlete, projectLabel))
      .filter((athlete) => compactText(athlete.name) !== key)
      .sort((a, b) => (a.bestRank ?? 999) - (b.bestRank ?? 999) || (b.appearances || 0) - (a.appearances || 0))
      .slice(0, 2);
    if (!opponents.length) continue;
    used.add(key);
    rows.push({
      ...candidate,
      projectLabel,
      opponents,
      opponentStrength: opponentStrengthLabel(opponents),
      matchReason: coachOpponentMatchReason({ ...candidate, projectLabel }, opponents),
      trainingFocus: coachOpponentTrainingFocus({ ...candidate, projectLabel }, opponents),
    });
    if (rows.length >= 4) break;
  }

  return rows;
}

function rosterAthleteLabel(row) {
  return row.athleteName || row.memberName || row.name || row.userName || '未命名选手';
}

function rosterEventLabel(row) {
  return displayEventName(row.item || row) || row.eventName || '项目待确认';
}

function rosterCompetitionLabel(row) {
  return row.sportName || row.competition?.sportName || '赛事待确认';
}

function rosterItemSummary(rosterRows) {
  const map = new Map();
  for (const row of rosterRows) {
    const key = rosterEventLabel(row);
    const current = map.get(key) || { label: key, count: 0, athletes: [] };
    current.count += 1;
    const athlete = rosterAthleteLabel(row);
    if (athlete && !current.athletes.includes(athlete)) current.athletes.push(athlete);
    map.set(key, current);
  }
  return [...map.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'zh-CN'))
    .slice(0, 4);
}

function prematchRosterRows(competitions = []) {
  const rows = [];
  for (const competition of competitions || []) {
    for (const item of competitionItemSummaries(competition)) {
      for (const rosterRow of item.roster || []) {
        rows.push({
          ...rosterRow,
          eventCode: rosterRow.eventCode || item.eventCode,
          eventName: rosterRow.eventName || item.eventName,
          shortEventName: rosterRow.shortEventName || item.shortEventName,
          sportCode: rosterRow.sportCode || competition.sportCode,
          sportName: rosterRow.sportName || competition.sportName,
          competition,
          item,
        });
      }
    }
  }
  return rows;
}

function rosterClubSummary(rosterRows, limit = 5) {
  const map = new Map();
  for (const row of rosterRows || []) {
    const club = row.organName || row.organShortName || row.club || row.clubName || '俱乐部待确认';
    const current = map.get(club) || { club, count: 0, projects: new Set(), athletes: new Set() };
    current.count += 1;
    const project = rosterEventLabel(row);
    if (project) current.projects.add(project);
    const athlete = rosterAthleteLabel(row);
    if (athlete) current.athletes.add(athlete);
    map.set(club, current);
  }
  return [...map.values()]
    .map((row) => ({
      club: row.club,
      count: row.count,
      projectCount: row.projects.size,
      athleteCount: row.athletes.size,
      projects: [...row.projects].slice(0, 2),
    }))
    .sort((a, b) => b.count - a.count || b.projectCount - a.projectCount || a.club.localeCompare(b.club, 'zh-CN'))
    .slice(0, limit);
}

function rosterPreparationRows(rosterRows, knownAthletes = []) {
  const knownByName = new Map();
  for (const athlete of knownAthletes || []) {
    const key = compactText(athlete.name);
    if (!key) continue;
    const current = knownByName.get(key);
    if (!current || (athlete.bestRank ?? 999) < (current.bestRank ?? 999) || (athlete.appearances || 0) > (current.appearances || 0)) {
      knownByName.set(key, athlete);
    }
  }

  return (rosterRows || [])
    .map((row) => {
      const name = rosterAthleteLabel(row);
      const history = rosterHistoryMatch(row) || knownByName.get(compactText(name)) || null;
      const bestRank = history?.bestRank ?? null;
      const appearances = history?.appearances ?? 0;
      let label = '积累比赛经验';
      if (bestRank && bestRank <= 8) label = '重点关注前八机会';
      else if (appearances >= 3) label = '保持参赛稳定性';
      else if (history) label = '结合历史项目复盘';
      return {
        row,
        history,
        name,
        eventLabel: rosterEventLabel(row),
        bestRank,
        appearances,
        label,
      };
    })
    .sort((a, b) => (a.bestRank ?? 999) - (b.bestRank ?? 999)
      || (b.appearances || 0) - (a.appearances || 0)
      || a.name.localeCompare(b.name, 'zh-CN'))
    .slice(0, 6);
}

function preMatchActionCards(rosterRows, opponentPool, relevantCompetitions) {
  return [
    {
      title: '确认名单',
      value: rosterRows.length ? `${rosterRows.length} 条本馆报名` : '等待名单',
      detail: rosterRows.length ? '可以按项目拆训练重点。' : '先关注近期报名赛事，名单出现后再细化到学员。',
    },
    {
      title: '锁定强手',
      value: opponentPool.length ? `${opponentPool.length} 名可关注选手` : '样本积累中',
      detail: opponentPool.length ? '优先看同项目、最好名次靠前的选手。' : '先用本馆历史强项做备赛框架。',
    },
    {
      title: '近期赛程',
      value: relevantCompetitions.length ? `${relevantCompetitions.length} 场相关赛事` : '暂无匹配',
      detail: relevantCompetitions.length ? '用于安排赛前节奏和家长沟通。' : '继续积累项目和报名数据。',
    },
  ];
}

function renderPreMatchIntelligence(club, projectRows, athletes, providedRosterRows = null) {
  const rosterRows = providedRosterRows || clubRosterRows(club);
  const relevantCompetitions = relevantPreMatchCompetitions(projectRows);
  const opponentPool = coachStrongOpponentPool(club, projectRows);
  const opponentProjectRows = coachOpponentProjectRows(opponentPool, projectRows);
  const topProjects = projectRows.slice(0, 3);
  const rosterSummary = rosterItemSummary(rosterRows);
  const preparationRows = rosterPreparationRows(rosterRows, athletes);
  const athleteOpponentRows = coachAthleteOpponentRows({ rosterRows, athletes, opponentPool, projectRows });
  const actionCards = preMatchActionCards(rosterRows, opponentPool, relevantCompetitions);
  const readiness = rosterRows.length
    ? `已识别到 ${rosterRows.length} 条本馆报名记录，可以按项目拆解备赛重点。`
    : '当前先看近期赛事、优势项目和历史强手；报名名单更新后，再细化到每个学员。';

  return `
    <section class="coach-section prematch-section">
      <div class="section-title">
        <h2>赛前情报包</h2>
        <span>赛前优先看</span>
      </div>
      <div class="coach-summary-card prematch-ready">
        <strong>${escapeHtml(readiness)}</strong>
        <span>建议先确认参赛项目，再看同项目强手和近期赛事，用于安排训练重点与家长沟通。</span>
      </div>
      <div class="prematch-action-grid">
        ${actionCards.map((card) => `
          <div class="prematch-action-card">
            <span>${escapeHtml(card.title)}</span>
            <strong>${escapeHtml(card.value)}</strong>
            <em>${escapeHtml(card.detail)}</em>
          </div>
        `).join('')}
      </div>
      ${rosterRows.length ? `
        <div class="prematch-block">
          <div class="coach-bucket-head">
            <strong>本馆出战</strong>
            <span>${escapeHtml(rosterRows.length)} 条报名</span>
          </div>
          ${rosterSummary.length ? `
            <div class="prematch-roster-summary">
              ${rosterSummary.map((row) => `
                <div>
                  <strong>${escapeHtml(row.label)}</strong>
                  <span>${escapeHtml(row.count)} 人 · ${escapeHtml(row.athletes.slice(0, 3).join(' / '))}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          <div class="coach-athlete-list">
            ${rosterRows.slice(0, 6).map((row) => `
              <button type="button" data-athlete-id="${escapeHtml(row.registerCode || row.athleteId || '')}">
                <strong>${escapeHtml(rosterAthleteLabel(row))}</strong>
                <span>${escapeHtml(rosterEventLabel(row))}</span>
                <em>${escapeHtml(rosterCompetitionLabel(row))}</em>
              </button>
            `).join('')}
          </div>
          ${preparationRows.length ? `
            <div class="prematch-roster-focus">
              <div class="coach-bucket-head">
                <strong>备赛名单画像</strong>
                <span>按历史成绩提示重点</span>
              </div>
              <div class="coach-athlete-list">
                ${preparationRows.map((item) => `
                  <button type="button" data-athlete-id="${escapeHtml(item.history?.id || '')}">
                    <strong>${escapeHtml(item.name)}</strong>
                    <span>${escapeHtml(item.eventLabel)}</span>
                    <em>${escapeHtml(item.label)} · 最好第 ${escapeHtml(item.bestRank ?? '-')} 名 · ${escapeHtml(item.appearances)} 次记录</em>
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      ` : ''}
      ${athleteOpponentRows.length ? `
        <div class="prematch-block">
          <div class="coach-bucket-head">
            <strong>学员对手预案</strong>
            <span>${escapeHtml(athleteOpponentRows.length)} 组</span>
          </div>
          <div class="athlete-opponent-plan-list">
            ${athleteOpponentRows.map((row) => `
              <button type="button" data-ai-query="${escapeHtml(`分析${row.name}和${row.opponents[0]?.name || ''}的对战情况`)}">
                <div>
                  <strong>${escapeHtml(row.name)}</strong>
                  <span>${escapeHtml(row.projectLabel || '项目待确认')} · ${escapeHtml(row.source)}</span>
                </div>
                <em>${escapeHtml(row.opponents.map((athlete) => `${athlete.name} 第${athlete.bestRank ?? '-'}名`).join(' / '))}</em>
                <div class="opponent-match-meta">
                  <span>${escapeHtml(row.opponentStrength)}</span>
                  <span>${escapeHtml(row.matchReason)}</span>
                </div>
                <small>${escapeHtml(row.trainingFocus)}</small>
                <span class="ai-plan-action">生成对比分析</span>
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}
      <div class="prematch-grid">
        <div class="prematch-block">
          <div class="coach-bucket-head">
            <strong>优先备赛项目</strong>
            <span>按本馆历史基础</span>
          </div>
          <div class="growth-highlight-list">
            ${topProjects.map((row) => `<div class="growth-highlight">${escapeHtml(`${row.label}：参赛 ${row.entrants}，前八 ${row.top8}，最好第 ${row.bestRank ?? '-'} 名`)}</div>`).join('')}
          </div>
        </div>
        <div class="prematch-block">
          <div class="coach-bucket-head">
            <strong>近期可关注赛事</strong>
            <span>${escapeHtml(relevantCompetitions.length || 0)} 场</span>
          </div>
          <div class="project-advice-list">
            ${relevantCompetitions.length ? relevantCompetitions.map(({ competition, matchedItems }) => `
              <button class="project-advice-card" type="button" data-sport-code="${escapeHtml(competition.sportCode)}">
                <div>
                  <strong>${escapeHtml(competition.sportName)}</strong>
                  <span>${escapeHtml([displayDateLabel(competition.dateLabel), competition.venue || competition.region].filter(Boolean).join(' · '))}</span>
                </div>
                <em>${escapeHtml(matchedItems.length ? `匹配 ${matchedItems.map(displayEventName).slice(0, 2).join(' / ')}` : coverageLabel(competition))}</em>
              </button>
            `).join('') : '<div class="empty compact-empty">暂未发现与本馆强项直接匹配的近期赛事。</div>'}
          </div>
        </div>
      </div>
      <div class="prematch-block">
        <div class="coach-bucket-head">
          <strong>历史强手池</strong>
          <span>先用于备赛关注</span>
        </div>
        ${opponentProjectRows.length ? `
          <div class="opponent-project-list">
            ${opponentProjectRows.map((row) => `
              <div class="opponent-project-card">
                <strong>${escapeHtml(row.label)}</strong>
                <span>${escapeHtml(row.opponents.length)} 名可关注强手 · 最好第 ${escapeHtml(row.bestRank ?? '-')} 名</span>
                <em>${escapeHtml(row.opponents.map((athlete) => `${athlete.name}（${athlete.club || '俱乐部待确认'}）`).join(' / '))}</em>
              </div>
            `).join('')}
          </div>
        ` : ''}
        <div class="coach-athlete-list">
          ${opponentPool.length ? opponentPool.map((athlete) => `
            <button type="button" data-athlete-id="${escapeHtml(athlete.id || '')}">
              <strong>${escapeHtml(athlete.name)}</strong>
              <span>${escapeHtml(athlete.club || '俱乐部待确认')}</span>
              <em>最好第 ${escapeHtml(athlete.bestRank ?? '-')} 名 · ${escapeHtml(athlete.appearances ?? 0)} 次</em>
            </button>
          `).join('') : '<div class="empty compact-empty">当前同项目强手样本还少，建议先围绕本馆重点项目做训练准备。</div>'}
        </div>
      </div>
    </section>
  `;
}

function renderClubDetail(club) {
  const events = club.events || [];
  const projectRows = clubProjectRows(club);
  const athletes = clubWorkspaceAthletes(club);
  const athleteBuckets = clubAthleteBuckets(athletes);
  const highlights = buildClubGrowthHighlights(club, projectRows, athletes);
  const peerRows = clubPeerRows(club, projectRows);
  const businessCards = buildClubBusinessCards(club, projectRows, athletes, peerRows);
  const shareText = buildClubShareText(club, projectRows, athletes);
  const rosterRows = clubRosterRows(club);
  const actionPlan = buildCoachActionPlan({ club, projectRows, athletes, athleteBuckets, peerRows, rosterRows });
  const top8Rate = Number(club.entrants) ? Math.round((Number(club.top8 || 0) / Number(club.entrants)) * 100) : 0;
  const medalRate = Number(club.entrants) ? Math.round((Number(club.medals || 0) / Number(club.entrants)) * 100) : 0;

  clubHero.innerHTML = `
    <div class="hero-title">${escapeHtml(club.club)}</div>
    <div class="hero-sub">馆长工作台 · 教练视角</div>
    <div class="badge-row">
      <span class="badge">参赛 ${escapeHtml(club.entrants ?? 0)} 人次</span>
      <span class="badge">前八 ${escapeHtml(club.top8 ?? 0)} 人次</span>
      <span class="badge">${escapeHtml(club.medals ?? 0)} 枚奖牌</span>
      <span class="badge">最好第 ${escapeHtml(club.bestRank ?? '-')} 名</span>
    </div>
  `;

  clubEvents.innerHTML = events.length
    ? `
      <section class="coach-section">
        <div class="section-title">
          <h2>馆长摘要</h2>
          <span>先看经营判断</span>
        </div>
        <div class="coach-summary-card">
          <strong>${escapeHtml(buildClubOwnerSummary(club, projectRows))}</strong>
          <span>建议先把强项项目、代表学员和近期比赛复盘讲清楚，用于续费沟通和招生转化。</span>
        </div>
        <button class="secondary-action compact-action" type="button" data-coach-segmentation-club-id="${escapeHtml(club.id || '')}">生成学员分层报告</button>
      </section>

      ${renderCoachActionPlan(actionPlan)}

      <section class="coach-section">
        <div class="section-title">
          <h2>招生名片</h2>
          <span>对外可讲</span>
        </div>
        <div class="business-card-grid">
          ${businessCards.map((card) => `
            <div class="business-card">
              <span>${escapeHtml(card.title)}</span>
              <strong>${escapeHtml(card.value)}</strong>
              <em>${escapeHtml(card.detail)}</em>
            </div>
          `).join('')}
        </div>
      </section>

      ${renderClubCommunicationScripts(club, projectRows, athletes)}

      ${renderClubShareCard(club, projectRows, athletes)}

      ${renderPreMatchIntelligence(club, projectRows, athletes, rosterRows)}

      <div class="report-grid">
        <div class="report-card"><strong>${escapeHtml(top8Rate)}%</strong><span>前八率</span></div>
        <div class="report-card"><strong>${escapeHtml(medalRate)}%</strong><span>奖牌率</span></div>
        <div class="report-card"><strong>${escapeHtml(projectRows.length)}</strong><span>项目组别</span></div>
        <div class="report-card"><strong>${escapeHtml(athletes.length || '-')}</strong><span>识别学员</span></div>
      </div>

      <section class="coach-section">
        <div class="section-title">
          <h2>带好现有学员</h2>
          <span>提升成绩与留存</span>
        </div>
        ${renderCoachAthleteFollowups(athletes)}
        ${renderCoachAthleteBucket('重点培养', '已有名次或奖牌表现', athleteBuckets.focus)}
        ${renderCoachAthleteBucket('稳定基础', '有参赛连续性，适合复盘训练', athleteBuckets.steady)}
        ${renderCoachAthleteBucket('继续观察', '样本较少，先积累比赛记录', athleteBuckets.observe)}
        ${athletes.length ? '' : '<div class="empty compact-empty">当前俱乐部学员画像还在形成中，更多赛果收录后会呈现更完整的队伍表现。</div>'}
      </section>

      <section class="coach-section">
        <div class="section-title">
          <h2>项目经营</h2>
          <span>班型与训练重点</span>
        </div>
        ${barChart('项目投入', projectRows.slice(0, 5).map((row) => ({
          label: row.label,
          value: row.entrants,
          display: `${row.entrants} 人`,
        })), { tone: 'teal' })}
        <div class="project-advice-list">
          ${projectRows.map((row) => `
            <button class="project-advice-card" type="button" data-event-code="${escapeHtml(row.events[0]?.eventCode || '')}">
              <div>
                <strong>${escapeHtml(row.label)}</strong>
                <span>${escapeHtml(projectCoachAdvice(row))}</span>
              </div>
              <em>参赛 ${escapeHtml(row.entrants)} · 前八 ${escapeHtml(row.top8)} · 奖牌 ${escapeHtml(row.medals)} · 最好第 ${escapeHtml(row.bestRank ?? '-')}</em>
            </button>
          `).join('')}
        </div>
      </section>

      <section class="coach-section">
        <div class="section-title">
          <h2>同项目对标</h2>
          <span>口碑位置</span>
        </div>
        <div class="project-advice-list">
          ${peerRows.length ? peerRows.map((peer) => `
            <button class="project-advice-card peer-card" type="button" data-club-id="${escapeHtml(peer.id || '')}">
              <div>
                <strong>${escapeHtml(peer.club)}</strong>
                <span>${escapeHtml(peer.overlapProjects.map((row) => row.label).slice(0, 3).join(' / '))}</span>
              </div>
              <em>重合项目 ${escapeHtml(peer.overlapCount)} · 前八 ${escapeHtml(peer.overlapTop8)} · 奖牌 ${escapeHtml(peer.overlapMedals)} · 最好第 ${escapeHtml(peer.bestRank ?? '-')}</em>
            </button>
          `).join('') : '<div class="empty compact-empty">暂未形成稳定的同项目对标样本。</div>'}
        </div>
      </section>

      <section class="coach-section">
        <div class="section-title">
          <h2>增长与口碑</h2>
          <span>招生素材</span>
        </div>
        <div class="growth-highlight-list">
          ${highlights.map((text) => `<div class="growth-highlight">${escapeHtml(text)}</div>`).join('')}
        </div>
      </section>
    `
    : '<div class="empty">暂无参赛项目</div>';

  clubEvents.querySelectorAll('[data-event-code]').forEach((button) => {
    if (!button.dataset.eventCode) return;
    button.addEventListener('click', () => openEvent(button.dataset.eventCode));
  });
  clubEvents.querySelectorAll('[data-sport-code]').forEach((button) => {
    if (!button.dataset.sportCode) return;
    button.addEventListener('click', () => openCompetition(button.dataset.sportCode));
  });
  clubEvents.querySelectorAll('[data-athlete-id]').forEach((button) => {
    if (!button.dataset.athleteId) return;
    button.addEventListener('click', () => openAthlete(button.dataset.athleteId));
  });
  clubEvents.querySelectorAll('[data-club-id]').forEach((button) => {
    if (!button.dataset.clubId) return;
    button.addEventListener('click', () => openClub(button.dataset.clubId));
  });
  clubEvents.querySelectorAll('[data-coach-segmentation-club-id]').forEach((button) => {
    if (!button.dataset.coachSegmentationClubId) return;
    button.addEventListener('click', () => openCoachSegmentationReport(button.dataset.coachSegmentationClubId));
  });
  clubEvents.querySelectorAll('[data-ai-query]').forEach((button) => {
    if (!button.dataset.aiQuery) return;
    button.addEventListener('click', () => submitAiQuery(button.dataset.aiQuery));
  });
  clubEvents.querySelectorAll('[data-share-club]').forEach((button) => {
    button.addEventListener('click', async () => {
      const originalLabel = button.textContent;
      try {
        await copyTextToClipboard(shareText);
        trackAnalyticsAction('share_club', 'recruiting-card');
        button.textContent = '已复制';
      } catch (error) {
        button.textContent = '复制失败';
      }
      setTimeout(() => {
        button.textContent = originalLabel;
      }, 1400);
    });
  });
}

async function openAthlete(athleteId) {
  const localAthlete = findAthleteByReference({ id: athleteId });
  let renderedAthlete = null;
  try {
    if (!athleteId || athleteId === 'undefined' || athleteId === 'null') {
      if (localAthlete?.events?.length) {
        renderAthleteDetail(localAthlete);
        navigateTo('athlete');
        return;
      }
      throw new Error('缺少选手ID，请重新搜索并进入选手详情。');
    }
    renderedAthlete = await fetchCachedDetail(
      'athletes',
      athleteId,
      `/api/athletes/${encodeURIComponent(athleteId)}`,
      (result) => result.athlete,
    );
    renderAthleteDetail(renderedAthlete);
  } catch (error) {
    if (localAthlete?.events?.length) {
      renderAthleteDetail(localAthlete);
      renderedAthlete = localAthlete;
    } else {
      setInlineError(athleteHero, friendlyErrorMessage('选手详情'));
      athleteActionPanel.innerHTML = '';
      athleteGrowth.innerHTML = '';
      athleteEvents.innerHTML = '';
    }
  }
  if (renderedAthlete?.id) {
    trackRecentItem({
      type: 'athlete',
      id: renderedAthlete.id,
      title: renderedAthlete.name,
      meta: renderedAthlete.club || '选手画像',
    });
  }
  navigateTo('athlete');
}

async function openClub(clubId) {
  let renderedClub = null;
  try {
    renderedClub = await fetchCachedDetail(
      'clubs',
      clubId,
      `/api/clubs/${encodeURIComponent(clubId)}`,
      (result) => result.club,
    );
    state.currentClub = renderedClub;
    renderClubDetail(renderedClub);
  } catch (error) {
    setInlineError(clubHero, friendlyErrorMessage('俱乐部详情'));
    clubEvents.innerHTML = '';
  }
  if (renderedClub?.id) {
    trackRecentItem({
      type: 'club',
      id: renderedClub.id,
      title: renderedClub.club,
      meta: `参赛 ${renderedClub.entrants || 0} 人次`,
    });
  }
  navigateTo('club');
}

function isPrematchCompetition(competition) {
  return ['registration', 'upcoming', 'live'].includes(competition?.status) || Boolean(competition?.isPreEvent);
}

function prematchReportCompetitions(sportCode = '') {
  const selected = sportCode ? (state.currentCompetition?.sportCode === sportCode ? state.currentCompetition : findCompetitionBySportCode(sportCode)) : null;
  if (selected) return [selected];
  return [...(state.competitions || [])]
    .filter(isPrematchCompetition)
    .sort((a, b) => Math.abs(daysFromToday(competitionDateValue(a))) - Math.abs(daysFromToday(competitionDateValue(b)))
      || String(a.dateLabel || '').localeCompare(String(b.dateLabel || ''), 'zh-CN'))
    .slice(0, 8);
}

function prematchReportProjectLabels(competitions = []) {
  const competitionLabels = competitions.flatMap((competition) => competitionItemFilterLabels(competition));
  const focusedLabels = aiFocusedAthletes().flatMap((athlete) => aiAthleteProjectLabels(athlete));
  return uniqueBy([...competitionLabels, ...focusedLabels], (label) => compactText(label)).slice(0, 6);
}

function prematchReportFocusRows(competitions) {
  const focused = aiFocusedAthletes();
  if (!focused.length) return [];
  return focused.map((athlete) => {
    const labels = aiAthleteProjectLabels(athlete);
    const matched = competitions.filter((competition) => labels.some((label) => competitionMatchesProjectLabel(competition, label))).slice(0, 3);
    const latest = (athlete.events || [])[0] || null;
    return {
      athlete,
      labels,
      matched,
      latest,
      advice: matched.length
        ? `优先核对 ${matched[0].sportName}，再看同项目报名名单和强手。`
        : '先用历史项目建立备赛方向，等待报名名单进一步匹配。',
    };
  });
}

function prematchPrimaryFocusRow(focusRows = []) {
  if (!focusRows.length) return null;
  if (state.selectedChildId) {
    const selected = focusRows.find((row) => row.athlete?.id === state.selectedChildId);
    if (selected) return { ...selected, focusKind: 'primary' };
  }
  const primary = focusRows.find((row) => row.athlete?.focusKind === 'primary' || row.focusKind === 'primary');
  return primary || focusRows[0] || null;
}

function prematchPrimaryFocusDetail(row) {
  if (!row) return '';
  const matched = row.matched?.[0];
  const projectText = row.labels?.length ? row.labels.slice(0, 2).join(' / ') : '历史项目待确认';
  const matchText = matched ? `匹配赛事：${matched.sportName}` : '暂未匹配到具体赛事，先按历史项目准备';
  return `${projectText} · ${matchText}`;
}
function prematchPersonalRelevanceRows({ competitions = [], focusRows = [], opponentRows = [] } = {}) {
  return (focusRows || []).slice(0, 4).map((row) => {
    const matched = row.matched?.[0] || null;
    const labels = row.labels || [];
    const hasRoster = matched && competitionCoverageLevel(matched) === 'roster';
    const opponent = labels.length
      ? (opponentRows || []).find((athlete) => {
        const text = compactText([...(athlete.eventLabels || []), ...(athlete.events || []).map((event) => displayEventName(event))].join(' '));
        return labels.some((label) => text.includes(compactText(label)));
      })
      : null;
    const title = row.athlete?.name || '关注选手';
    const status = hasRoster ? '可核对名单' : matched ? '项目已匹配' : '先按历史项目准备';
    const detail = matched
      ? `${matched.sportName} · ${displayDateLabel(matched.dateLabel)}`
      : labels.length
        ? `${labels.slice(0, 2).join(' / ')} · 等待报名名单补齐`
        : `${competitions.length} 场近期赛事 · 先确认目标项目`;
    const action = opponent
      ? `重点参考 ${opponent.name}，再看同项目报名和历史成绩。`
      : hasRoster
        ? '先核对报名名单，再确认同项目强手和分组风险。'
        : '先确认参赛项目和时间，名单补齐后再做对手复核。';
    return {
      athleteId: row.athlete?.id || '',
      sportCode: matched?.sportCode || '',
      title,
      status,
      detail,
      action,
    };
  });
}

function prematchReportOpponentRows(projectLabels) {
  const labels = projectLabels.map((label) => compactText(label)).filter(Boolean);
  return (state.athleteSearchIndex || [])
    .filter((athlete) => {
      if (!athlete?.name || (athlete.bestRank ?? 999) > 16) return false;
      const eventText = compactText([...(athlete.eventLabels || []), ...(athlete.events || []).map((event) => displayEventName(event))].join(' '));
      return labels.length ? labels.some((label) => eventText.includes(label) || label.includes(eventText)) : true;
    })
    .sort((a, b) => (a.bestRank ?? 999) - (b.bestRank ?? 999) || (b.appearances || 0) - (a.appearances || 0))
    .slice(0, 6);
}

function prematchOpponentWatchlistRows(opponentRows = [], focusRows = []) {
  const focusLabels = new Set((focusRows || []).flatMap((row) => row.labels || []).map((label) => compactText(label)).filter(Boolean));
  return (opponentRows || []).slice(0, 6).map((athlete) => {
    const labels = [...new Set((athlete.eventLabels || []).filter(Boolean))];
    const matchedLabels = labels.filter((label) => focusLabels.has(compactText(label))).slice(0, 2);
    const bestRank = Number(athlete.bestRank) || 999;
    const appearances = Number(athlete.appearances) || 0;
    const level = bestRank <= 4 ? '高优先级' : bestRank <= 8 ? '重点关注' : '观察对象';
    const note = matchedLabels.length
      ? `与关注对象项目重合：${matchedLabels.join(' / ')}`
      : labels.length
        ? `历史项目：${labels.slice(0, 2).join(' / ')}`
        : '同项目历史成绩较靠前';
    const action = bestRank <= 8
      ? '赛前优先看小组稳定性、淘汰赛关键分和最近一次名次。'
      : '先作为同项目样本，用于判断本场竞争深度。';
    return {
      athlete,
      level,
      note,
      action,
      score: bestRank <= 4 ? 3 : bestRank <= 8 ? 2 : 1,
      meta: `最好第 ${bestRank === 999 ? '-' : bestRank} 名 · ${appearances} 次记录`,
    };
  });
}

function prematchChecklistRows({ competitions = [], focusRows = [], opponentRows = [], rosterReady = 0, isSingleCompetition = false } = {}) {
  const nearest = competitions[0] || null;
  const hasFocus = Boolean(focusRows.length);
  const hasOpponents = Boolean(opponentRows.length);
  return [
    {
      title: '1. 确认报名和项目',
      detail: rosterReady
        ? `${rosterReady} 场已有报名信息，先核对孩子或学员是否在目标项目里。`
        : `${isSingleCompetition ? '本场' : '近期'}项目先作为备赛范围，报名名单补齐后再复核对手。`,
    },
    {
      title: hasFocus ? '2. 锁定重点对象' : '2. 先关注孩子或学员',
      detail: hasFocus
        ? `优先看 ${focusRows.slice(0, 2).map((row) => row.athlete?.name).filter(Boolean).join('、')} 的历史项目和近期表现。`
        : '关注孩子或学员后，赛前报告会自动生成个人化项目匹配和准备重点。',
    },
    {
      title: hasOpponents ? '3. 对照强手准备' : '3. 等待强手线索',
      detail: hasOpponents
        ? `先看 ${opponentRows.slice(0, 2).map((athlete) => athlete.name).filter(Boolean).join('、')} 等同项目强手，再安排训练重点。`
        : '当前同项目强手样本不足，先用赛事规模、项目结构和过往成绩判断比赛难度。',
    },
    {
      title: '4. 赛前沟通',
      detail: nearest
        ? `围绕 ${nearest.sportName}，把项目确认、重点对象和对手线索整理成家长/学员沟通材料。`
        : '没有明确目标赛事时，先把关注对象的历史项目和下一场可能参赛方向整理出来。',
    },
  ];
}

function prematchShareUrl(sportCode = '') {
  const url = new URL(window.location.href);
  url.hash = '';
  url.search = '';
  url.searchParams.set('prematch', sportCode || 'prematch-pack');
  return url.toString();
}

function buildPrematchPageShareText(competitions = [], isSingleCompetition = false, sportCode = '') {
  const nearest = competitions[0] || null;
  const title = isSingleCompetition && nearest ? `${nearest.sportName} 赛前情报页` : '近期赛前情报页';
  return [
    title,
    nearest ? `${displayDateLabel(nearest.dateLabel)} · ${nearest.venue || nearest.region || '地点待确认'}` : '',
    '打开后可查看报名状态、关注对象、强手线索和赛前执行清单。',
    prematchShareUrl(sportCode),
  ].filter(Boolean).join('\n');
}

function buildPrematchShareText(competitions, focusRows, opponentRows, isSingleCompetition, relevanceRows = [], rosterRows = prematchRosterRows(competitions)) {
  const nearest = competitions[0] || null;
  const rosterReady = competitions.filter((competition) => competition.rosterStatus === 'partial' || competition.rosterStatus === 'complete').length;
  const checklistRows = prematchChecklistRows({ competitions, focusRows, opponentRows, rosterReady, isSingleCompetition });
  const rosterProjects = rosterItemSummary(rosterRows).slice(0, 3);
  const rosterClubs = rosterClubSummary(rosterRows, 3);
  return [
    isSingleCompetition && nearest ? `${nearest.sportName} 赛前情报包` : '赛前情报包',
    nearest ? `赛事：${nearest.sportName}` : '赛事：近期赛前赛事',
    nearest ? `时间地点：${displayDateLabel(nearest.dateLabel)} · ${nearest.venue || nearest.region || '地点待确认'}` : '',
    `相关赛事：${competitions.length} 场`,
    rosterRows.length ? `报名名单：${rosterRows.length} 人次` : '',
    ...rosterProjects.map((row, index) => `报名项目${index + 1}：${row.label}，${row.count} 人`),
    ...rosterClubs.map((row, index) => `主要俱乐部${index + 1}：${row.club}，${row.count} 人次，覆盖 ${row.projectCount} 个项目`),
    `关注对象：${focusRows.length} 人，强手线索：${opponentRows.length} 个`,
    ...focusRows.slice(0, 3).map((row, index) => `关注对象${index + 1}：${row.athlete.name}，${row.advice}`),
    ...opponentRows.slice(0, 3).map((athlete, index) => `强手线索${index + 1}：${athlete.name}，最好第 ${athlete.bestRank ?? '-'} 名`),
    ...checklistRows.slice(0, 4).map((row) => `${row.title}：${row.detail}`),
    '数据来源：FencingAI 已收录赛事、报名和历史成绩',
  ].filter(Boolean).join('\n');
}

function renderPrematchRelevanceSection(relevanceRows = []) {
  return `
    <article class="panel prematch-report-card prematch-relevance-section">
      <div class="section-title">
        <h2>与你相关</h2>
        <span>${escapeHtml(relevanceRows.length ? '关注对象' : '先关注选手')}</span>
      </div>
      ${relevanceRows.length ? `
        <div class="prematch-relevance-list">
          ${relevanceRows.map((row) => `
            <div class="prematch-relevance-card">
              <div>
                <strong>${escapeHtml(row.title)}</strong>
                <span>${escapeHtml(row.detail)}</span>
                <em>${escapeHtml(row.action)}</em>
              </div>
              <small>${escapeHtml(row.status)}</small>
              <div class="prematch-relevance-actions">
                ${row.athleteId ? `<button type="button" data-athlete-id="${escapeHtml(row.athleteId)}">选手画像</button>` : ''}
                ${row.sportCode ? `<button type="button" data-sport-code="${escapeHtml(row.sportCode)}">赛事详情</button>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      ` : '<div class="empty compact-empty">关注孩子或学员后，赛前情报会优先显示和他相关的项目、名单和强手线索。</div>'}
    </article>
  `;
}

function renderPrematchReport(kind = 'prematch-pack', sportCode = '') {
  const competitions = prematchReportCompetitions(sportCode);
  const isSingleCompetition = Boolean(sportCode && competitions.length);
  const selectedCompetition = isSingleCompetition ? competitions[0] : null;
  const projectLabels = prematchReportProjectLabels(competitions);
  const focusRows = prematchReportFocusRows(competitions);
  const primaryFocus = prematchPrimaryFocusRow(focusRows);
  const opponentRows = prematchReportOpponentRows(projectLabels);
  const opponentWatchlistRows = prematchOpponentWatchlistRows(opponentRows, focusRows);
  const relevanceRows = prematchPersonalRelevanceRows({ competitions, focusRows, opponentRows });
  const rosterReady = competitions.filter((competition) => competition.rosterStatus === 'partial' || competition.rosterStatus === 'complete').length;
  const nearest = competitions[0] || null;
  const selectedItems = selectedCompetition ? compactCompetitionEventRows(competitionItemSummaries(selectedCompetition), 6) : [];
  const rosterRows = prematchRosterRows(competitions);
  const rosterProjectRows = rosterItemSummary(rosterRows);
  const rosterClubRows = rosterClubSummary(rosterRows);
  const checklistRows = prematchChecklistRows({ competitions, focusRows, opponentRows, rosterReady, isSingleCompetition });

  prematchReportHero.innerHTML = `
    <div class="hero-title">${escapeHtml(isSingleCompetition ? '本场赛前情报包' : '赛前情报包')}</div>
    <div class="hero-sub">${escapeHtml(nearest ? `${nearest.sportName} · ${displayDateLabel(nearest.dateLabel)}` : '从近期赛事和关注对象生成')}</div>
    <div class="badge-row">
      <span class="badge">${escapeHtml(isSingleCompetition ? '目标赛事' : '近期赛事')} ${escapeHtml(competitions.length)} 场</span>
      <span class="badge">报名信息 ${escapeHtml(rosterReady)} 场</span>
      ${rosterRows.length ? `<span class="badge">报名名单 ${escapeHtml(rosterRows.length)} 人次</span>` : ''}
      <span class="badge">关注对象 ${escapeHtml(focusRows.length)} 人</span>
      ${primaryFocus ? `<span class="badge">重点对象 ${escapeHtml(primaryFocus.athlete?.name || '')}</span>` : ''}
      <span class="badge">强手线索 ${escapeHtml(opponentRows.length)} 个</span>
    </div>
    <button class="report-share-action" type="button" data-report-share="prematch">复制报告摘要</button>
  `;

  const prematchShareButton = prematchReportHero.querySelector('[data-report-share="prematch"]');
  if (prematchShareButton) {
    prematchShareButton.insertAdjacentHTML('afterend', '<button class="report-share-action secondary" type="button" data-report-share="prematch-page">复制情报页</button>');
  }

  prematchReportBody.innerHTML = `
    ${renderPrematchRelevanceSection(relevanceRows)}
    ${primaryFocus ? `
      <article class="panel prematch-report-card prematch-primary-focus">
        <div class="section-title">
          <h2>本次重点对象</h2>
          <span>${escapeHtml(primaryFocus.focusKind === 'primary' || primaryFocus.athlete?.focusKind === 'primary' ? '重点关注' : '已关注')}</span>
        </div>
        <button class="prematch-primary-card" type="button" data-athlete-id="${escapeHtml(primaryFocus.athlete?.id || '')}">
          <strong>${escapeHtml(primaryFocus.athlete?.name || '关注选手')}</strong>
          <span>${escapeHtml(primaryFocus.athlete?.club || '俱乐部待确认')}</span>
          <em>${escapeHtml(prematchPrimaryFocusDetail(primaryFocus))}</em>
        </button>
      </article>
    ` : ''}
    <article class="panel prematch-report-card">
      <div class="section-title">
        <h2>赛前窗口</h2>
        <span>${escapeHtml(isSingleCompetition ? '本场优先' : '优先处理')}</span>
      </div>
      <div class="prematch-report-metrics">
        <div><strong>${escapeHtml(competitions.length)}</strong><span>${escapeHtml(isSingleCompetition ? '目标赛事' : '近期赛事')}</span></div>
        <div><strong>${escapeHtml(rosterReady)}</strong><span>已有报名信息</span></div>
        <div><strong>${escapeHtml(projectLabels.length || '-')}</strong><span>关注项目</span></div>
        <div><strong>${escapeHtml(opponentRows.length)}</strong><span>强手线索</span></div>
      </div>
      <div class="prematch-report-note">
        ${escapeHtml(nearest ? `${isSingleCompetition ? '围绕本场赛事' : `先看最近的 ${nearest.sportName}`}，确认项目、报名名单和关注对象是否匹配。` : '当前没有识别到近期赛前赛事，可先围绕关注选手的历史项目准备。')}
      </div>
    </article>

    ${rosterRows.length ? `
      <article class="panel prematch-report-card prematch-roster-snapshot">
        <div class="section-title">
          <h2>报名名单画像</h2>
          <span>${escapeHtml(rosterRows.length)} 人次</span>
        </div>
        <div class="prematch-report-metrics">
          <div><strong>${escapeHtml(rosterRows.length)}</strong><span>报名人次</span></div>
          <div><strong>${escapeHtml(rosterProjectRows.length || '-')}</strong><span>项目覆盖</span></div>
          <div><strong>${escapeHtml(rosterClubRows.length || '-')}</strong><span>主要俱乐部</span></div>
          <div><strong>${escapeHtml(rosterReady)}</strong><span>名单来源赛事</span></div>
        </div>
        ${rosterProjectRows.length ? `
          <div class="prematch-roster-summary">
            ${rosterProjectRows.slice(0, 4).map((row) => `
              <div>
                <strong>${escapeHtml(row.label)}</strong>
                <span>${escapeHtml(row.count)} 人 · ${escapeHtml(row.athletes.slice(0, 3).join(' / ') || '名单待展开')}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${rosterClubRows.length ? `
          <div class="prematch-club-summary">
            ${rosterClubRows.slice(0, 5).map((row) => `
              <div>
                <strong>${escapeHtml(row.club)}</strong>
                <span>${escapeHtml(row.count)} 人次 · ${escapeHtml(row.projectCount)} 个项目${row.projects.length ? ` · ${escapeHtml(row.projects.join(' / '))}` : ''}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </article>
    ` : ''}

    ${isSingleCompetition ? `
      <article class="panel prematch-report-card">
        <div class="section-title">
          <h2>本场项目</h2>
          <span>${escapeHtml(coverageLabel(selectedCompetition))}</span>
        </div>
        <div class="prematch-report-list">
          ${selectedItems.length ? selectedItems.map((item) => `
            <button type="button" data-event-code="${escapeHtml(item.eventCode || '')}">
              <strong>${escapeHtml(displayEventName(item))}</strong>
              <span>${escapeHtml([
                Number(item.registrationCount) ? `报名 ${Number(item.registrationCount)} 人` : '',
                Number(item.competitionNo) ? `历史/成绩 ${Number(item.competitionNo)} 人` : '',
                Number(item.poolQualifyNo) ? `晋级 ${Number(item.poolQualifyNo)} 人` : '',
              ].filter(Boolean).join(' · ') || '项目规模待确认')}</span>
              <em>${escapeHtml(selectedCompetition.venue || selectedCompetition.region || '地点待确认')}</em>
            </button>
          `).join('') : '<div class="empty compact-empty">本场项目明细还在补充，先按赛事时间和报名状态安排关注。</div>'}
        </div>
      </article>
    ` : ''}

    <article class="panel prematch-report-card">
      <div class="section-title">
        <h2>关注对象匹配</h2>
        <span>孩子/学员</span>
      </div>
      <div class="prematch-report-list">
        ${focusRows.length ? focusRows.map((row) => `
          <button type="button" data-athlete-id="${escapeHtml(row.athlete.id || '')}">
            <strong>${escapeHtml(row.athlete.name || '关注选手')}</strong>
            <span>${escapeHtml(row.labels.slice(0, 2).join(' / ') || '历史项目待确认')}</span>
            <em>${escapeHtml(row.advice)}</em>
          </button>
        `).join('') : '<div class="empty compact-empty">还没有关注孩子或学员。先关注选手后，这里会生成个人化备赛线索。</div>'}
      </div>
    </article>

    ${opponentWatchlistRows.length ? `
      <article class="panel prematch-report-card prematch-opponent-watchlist">
        <div class="section-title">
          <h2>重点对手看板</h2>
          <span>赛前优先</span>
        </div>
        <div class="prematch-opponent-watch-grid">
          ${opponentWatchlistRows.map((row) => `
            <button type="button" data-athlete-id="${escapeHtml(row.athlete.id || '')}">
              <span>${escapeHtml(row.level)}</span>
              <strong>${escapeHtml(row.athlete.name)}</strong>
              <em>${escapeHtml(row.meta)}</em>
              <small>${escapeHtml(row.note)}</small>
              <b>${escapeHtml(row.action)}</b>
            </button>
          `).join('')}
        </div>
      </article>
    ` : ''}

    <article class="panel prematch-report-card">
      <div class="section-title">
        <h2>${escapeHtml(isSingleCompetition ? '赛事入口' : '近期赛事')}</h2>
        <span>${escapeHtml(isSingleCompetition ? '返回详情' : '可加入提醒')}</span>
      </div>
      <div class="prematch-report-list">
        ${competitions.length ? competitions.slice(0, 5).map((competition) => `
          <button type="button" data-sport-code="${escapeHtml(competition.sportCode || '')}">
            <strong>${escapeHtml(competition.sportName)}</strong>
            <span>${escapeHtml([displayDateLabel(competition.dateLabel), competition.venue || competition.region, statusLabel(competition.status)].filter(Boolean).join(' · '))}</span>
            <em>${escapeHtml(coverageLabel(competition))}</em>
          </button>
        `).join('') : '<div class="empty compact-empty">暂无近期赛前赛事。</div>'}
      </div>
    </article>

    <article class="panel prematch-report-card">
      <div class="section-title">
        <h2>强手线索</h2>
        <span>同项目参考</span>
      </div>
      <div class="prematch-report-list">
        ${opponentRows.length ? opponentRows.map((athlete) => `
          <button type="button" data-athlete-id="${escapeHtml(athlete.id || '')}">
            <strong>${escapeHtml(athlete.name)}</strong>
            <span>${escapeHtml(athlete.club || '俱乐部待确认')} · 最好第 ${escapeHtml(athlete.bestRank ?? '-')} 名</span>
            <em>${escapeHtml((athlete.eventLabels || []).slice(0, 2).join(' / ') || '同项目历史成绩')}</em>
          </button>
        `).join('') : '<div class="empty compact-empty">关注项目还没有足够强手样本，先用赛事和报名信息判断难度。</div>'}
      </div>
    </article>

    <article class="panel prematch-report-card">
      <div class="section-title">
        <h2>执行清单</h2>
        <span>赛前 3 步</span>
      </div>
      <div class="prematch-checklist">
        ${checklistRows.map((row) => `
          <div><strong>${escapeHtml(row.title)}</strong><span>${escapeHtml(row.detail)}</span></div>
        `).join('')}
      </div>
    </article>

    ${reportConversionCard({
      source: isSingleCompetition ? 'prematch-single-report' : 'prematch-pack-report',
      title: isSingleCompetition ? '生成本场赛前服务' : '建立赛前提醒服务',
      detail: isSingleCompetition ? '适合围绕本场报名、重点对象和强手线索持续更新。' : '适合把近期赛事、报名名单和关注对象做成赛前提醒。',
      primaryLabel: '申请赛前试用',
      secondaryLabel: '关注会员权益',
    })}
    ${reportReminderCard({
      source: 'prematch-report-reminder',
      title: isSingleCompetition ? '本场更新提醒' : '赛前更新提醒',
      detail: isSingleCompetition ? '关注报名名单、项目变化和重点对手更新。' : '关注近期赛事、报名名单和重点对象更新。',
      label: '订阅赛前提醒',
    })}
  `;

  prematchReportBody.querySelectorAll('[data-athlete-id]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.athleteId) openAthlete(button.dataset.athleteId);
    });
  });
  prematchReportBody.querySelectorAll('[data-event-code]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.eventCode) openEvent(button.dataset.eventCode);
    });
  });
  prematchReportBody.querySelectorAll('[data-sport-code]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.sportCode) openCompetition(button.dataset.sportCode);
    });
  });
  bindReportConversionActions(prematchReportBody);
  bindCopyTextButton(prematchReportHero.querySelector('[data-report-share="prematch"]'), () => buildPrematchShareText(competitions, focusRows, opponentRows, isSingleCompetition, relevanceRows, rosterRows), isSingleCompetition ? 'prematch-single' : 'prematch-pack', '已复制，可继续申请赛前试用。');
  bindCopyTextButton(prematchReportHero.querySelector('[data-report-share="prematch-page"]'), () => buildPrematchPageShareText(competitions, isSingleCompetition, sportCode), 'prematch-page', '已复制情报页，可直接发给家长或教练。');
}

function openPrematchReport(kind = 'prematch-pack', sportCode = '') {
  trackAnalyticsAction('open_report', sportCode ? 'prematch-single' : 'prematch-pack');
  renderPrematchReport(kind, sportCode);
  const competition = sportCode ? findCompetitionBySportCode(sportCode) : null;
  trackReportHistory({
    type: 'prematch',
    id: sportCode || kind,
    title: competition?.sportName || '赛前情报包',
    detail: competition ? [competition.venue, displayDateLabel(competition.dateLabel)].filter(Boolean).join(' · ') : '近期报名和未开赛赛事',
    typeLabel: '赛前情报',
  });
  navigateTo('prematchReport');
}

async function openCompetition(sportCode) {
  const localCompetition = findCompetitionBySportCode(sportCode);

  try {
    state.currentCompetition = await fetchCachedDetail(
      'competitions',
      sportCode,
      `/api/competitions/${encodeURIComponent(sportCode)}`,
      (result) => result.competition,
    );
  } catch (error) {
    if (!localCompetition) throw error;
    state.currentCompetition = localCompetition;
  }

  renderCompetitionHero(state.currentCompetition);
  renderCompetitionInsights(state.currentCompetition);
  renderEventList(state.currentCompetition);
  trackRecentItem({
    type: 'competition',
    id: state.currentCompetition.sportCode,
    title: state.currentCompetition.sportName,
    dateLabel: state.currentCompetition.dateLabel,
    venue: state.currentCompetition.venue || state.currentCompetition.region || '',
  });
  navigateTo('competition');
}

function renderEventOverview(event) {
  renderInsights(event);
  renderFollowedEventFocus(event);
  renderAnalysisCharts(event);
  bindEventCoachReviewActions(event);
  renderChampionPath(event);
  renderLeaders(event);
  renderOpponents(event);
  renderClubProfiles(event);
  renderAthleteProfiles(event);
}

function renderEventTab(tabName) {
  if (!state.currentEvent || state.eventRenderedTabs.has(tabName)) return;
  if (tabName === 'overview') {
    renderEventOverview(state.currentEvent);
  } else if (tabName === 'pool') {
    renderPoolGroups(state.currentEvent);
  } else if (tabName === 'standing') {
    renderPoolStanding(state.currentEvent);
  } else if (tabName === 'tableau') {
    renderMatches(state.currentEvent);
  } else if (tabName === 'participants') {
    renderParticipants(state.currentEvent);
  }
  state.eventRenderedTabs.add(tabName);
}

async function openEvent(eventCode) {
  try {
    state.currentEvent = await fetchCachedDetail(
      'events',
      eventCode,
      `/api/events/${encodeURIComponent(eventCode)}`,
      (result) => result.event,
    );
    state.eventRenderedTabs = new Set();
    activateEventTab('overview');
    renderEventHero(state.currentEvent);
    renderMetrics(state.currentEvent);
    renderEventTab('overview');
    navigateTo('event');
  } catch (error) {
    state.eventRenderedTabs = new Set();
    setInlineError(eventHero, friendlyErrorMessage('项目详情'));
    metricGrid.innerHTML = '';
    insightCards.innerHTML = '';
    insightBullets.innerHTML = '';
    followedEventFocus.innerHTML = '';
    analysisCharts.innerHTML = '';
    championPath.innerHTML = '';
    leadersList.innerHTML = '';
    opponentList.innerHTML = '';
    participantsList.innerHTML = '';
    poolGroups.innerHTML = '';
    poolStanding.innerHTML = '';
    matchList.innerHTML = '';
    if (clubList) clubList.innerHTML = '';
    clubProfiles.innerHTML = '';
    athleteProfiles.innerHTML = '';
    momentumList.innerHTML = '';
    navigateTo('event');
  }
}

topBack.addEventListener('click', goBack);

function activateEventTab(tabName) {
  const button = tabs.querySelector(`[data-tab="${tabName}"]`) || tabs.querySelector('.tab');
  if (!button) return;
  tabs.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab === button));
  document.querySelectorAll('.tab-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === `tab-${button.dataset.tab}`);
  });
  renderEventTab(button.dataset.tab);
}

tabs.addEventListener('click', (event) => {
  const button = event.target.closest('.tab');
  if (!button) return;
  activateEventTab(button.dataset.tab);
});

searchInput.addEventListener('input', handleSearchInput);
yearFilterButton.addEventListener('click', () => openFilterSheet('year'));
regionFilterButton.addEventListener('click', () => openFilterSheet('region'));
itemFilterButton.addEventListener('click', () => openFilterSheet('item'));
statusFilterButton.addEventListener('click', () => openFilterSheet('status'));
filterSheetMask.addEventListener('click', closeFilterSheet);
filterSheetClose.addEventListener('click', closeFilterSheet);
filterSheetOptions.addEventListener('click', (event) => {
  const button = event.target.closest('.sheet-option');
  if (!button) return;
  setFilterValue(button.dataset.filterType, button.dataset.filterValue);
  closeFilterSheet();
});
memberCta?.addEventListener('click', (event) => submitMembershipInterest(event.currentTarget, {
  source: 'member-panel',
  report: '家长会员',
}));
document.querySelectorAll('[data-nav-role-home]').forEach((button) => {
  button.addEventListener('click', () => {
    state.userRole = '';
    localStorage.removeItem(ROLE_KEY);
    state.viewStack = ['roleHome'];
    state.activeMainTab = '';
    renderRoleWorkspacePremium();
    showView('roleHome');
    scrollToPageTop();
  });
});
document.querySelectorAll('[data-nav-competitions]').forEach((button) => {
  button.addEventListener('click', () => navigateMain('competitions'));
});

bottomNav?.querySelectorAll('[data-main-tab]').forEach((button) => {
  button.addEventListener('pointerdown', () => {
    bottomNav.querySelectorAll('[data-main-tab]').forEach((navButton) => navButton.blur());
  });
  button.addEventListener('click', () => {
    const tab = button.dataset.mainTab;
    bottomNav.querySelectorAll('[data-main-tab]').forEach((navButton) => navButton.blur());
    button.blur();
    navigateMain(tab);
    requestAnimationFrame(() => {
      bottomNav.querySelectorAll('[data-main-tab]').forEach((navButton) => navButton.blur());
      updateBottomNavState(state.activeMainTab);
    });
  });
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') trackAnalyticsDuration(true);
  if (document.visibilityState === 'visible') analyticsLastDurationSentAt = Date.now();
});

window.addEventListener('pagehide', () => {
  trackAnalyticsDuration(true);
});

async function init() {
  state.isDataLoading = true;
  state.dataLoadError = '';
  homeStats.innerHTML = '<div class="loading-row">正在加载数据</div>';
  competitionList.innerHTML = '<div class="loading-row">正在整理比赛列表</div>';
  const result = await fetchJson('/api/competitions');
  state.isDataLoading = false;
  state.apiVersion = result.version || '';
  state.dataGeneratedAt = result.generatedAt || '';
  state.dataCoverage = result.dataCoverage || null;
  state.competitions = result.competitions?.length ? result.competitions : buildCompetitionsFromEvents(result.events);
  state.competitionSearchCache.clear();
  renderHomeStats();
  renderRoleWorkspacePremium();
  renderParentDashboard();
  renderFeedPanel();
  renderPersonalPages();
  await syncFollowedAthletes();
  renderYearSelect();
  renderRegionSelect();
  renderItemSelect();
  applyCompetitionFilter();
  const initialParams = new URLSearchParams(window.location.search);
  const initialPrematchCode = initialParams.get('prematch');
  if (initialPrematchCode) {
    state.sharedEntry = { kind: 'prematch', id: initialPrematchCode, openedAt: Date.now() };
    openPrematchReport('prematch-pack', initialPrematchCode === 'prematch-pack' ? '' : initialPrematchCode);
    return;
  }
  const initialCoachClubId = initialParams.get('coach');
  if (initialCoachClubId) {
    state.sharedEntry = { kind: 'coach-segmentation', id: initialCoachClubId, openedAt: Date.now() };
    openCoachSegmentationReport(initialCoachClubId === 'coach-segmentation' ? '' : initialCoachClubId);
    return;
  }
  const initialAthleteId = initialParams.get('athlete');
  if (initialAthleteId) {
    state.sharedEntry = { kind: 'parent-growth', id: initialAthleteId, openedAt: Date.now() };
    await openAthlete(initialAthleteId);
    return;
  }
  state.activeMainTab = 'home';
  state.viewStack = ['home'];
  showView('home');
}

renderRoleWorkspacePremium();
renderParentDashboard();
renderFollowPanel();
renderFilters();
renderHomeStats();
renderFeedPanel();
renderCompetitionList();
renderPersonalPages();

init().catch((error) => {
  state.isDataLoading = false;
  state.dataLoadError = error.message;
  renderHomeStats();
  renderFeedPanel();
  renderCompetitionList();
  renderPersonalPages();
  state.activeMainTab = 'home';
  state.viewStack = ['home'];
  showView('home');
});
