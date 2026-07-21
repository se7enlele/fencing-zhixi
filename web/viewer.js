const topBack = document.querySelector('#topBack');
const searchInput = document.querySelector('#searchInput');
const yearFilterButton = document.querySelector('#yearFilterButton');
const regionFilterButton = document.querySelector('#regionFilterButton');
const itemFilterButton = document.querySelector('#itemFilterButton');
const statusFilterButton = document.querySelector('#statusFilterButton');
const myFollowFilterButton = document.querySelector('#myFollowFilterButton');
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
const accountLoginPage = document.querySelector('#accountLoginPage');
const bottomNav = document.querySelector('#bottomNav');
const feedPanel = document.querySelector('#feedPanel');
const searchAthletesPanel = document.querySelector('#searchAthletesPanel');
const databaseDirectory = document.querySelector('#databaseDirectory');
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
const ATHLETE_DATA_REQUEST_KEY = 'fencingai.athleteDataRequests.v1';
const AUTH_TOKEN_KEY = 'fencingai.authToken.v1';
const AUTH_USER_KEY = 'fencingai.authUser.v1';
const COMPETITION_LIST_PAGE_SIZE = 30;
const AI_ANSWER_CARD_LIMIT = 3;
const AI_ANSWER_SECTION_LIMIT = 1;
const AI_ANSWER_SECTION_ROW_LIMIT = 2;
const AI_ANSWER_ACTION_LIMIT = 3;
const AI_ANSWER_EVIDENCE_LIMIT = 2;
const AI_LOADING_MIN_MS = 420;
const MAIN_TABS = ['home', 'competitions', 'my'];

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
  accountLogin: document.querySelector('#view-account-login'),
  follow: document.querySelector('#view-follow'),
};

const state = {
  competitions: [],
  filteredCompetitions: [],
  athleteSearchResults: [],
  clubSearchResults: [],
  coachSearchResults: [],
  refereeSearchResults: [],
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
  onlyFollowedData: false,
  aiCompetitionFilterSummary: '',
  aiCompetitionFilterQuestion: '',
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
  aiActiveQuery: '',
  aiActiveReport: null,
  isAiAnswerLoading: false,
  commercialIntents: [],
  athleteDataRequests: [],
  authToken: localStorage.getItem(AUTH_TOKEN_KEY) || '',
  authUser: safeJson(localStorage.getItem(AUTH_USER_KEY), null),
  authCapabilities: null,
  accountStatus: '',
  showAccountLoginForm: false,
  isApplyingUserProfile: false,
  userSyncTimer: null,
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

function safeJson(raw, fallback = null) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function authHeaders(extra = {}) {
  return state.authToken ? { ...extra, Authorization: `Bearer ${state.authToken}` } : extra;
}

function currentUserProfilePayload() {
  return {
    role: state.userRole,
    selectedChildId: state.selectedChildId,
    follows: state.followedAthletes || [],
    followedCompetitions: state.followedCompetitions || [],
    recentItems: state.recentItems || [],
    reportHistory: state.reportHistory || [],
    aiHistory: state.aiHistory || [],
    commercialIntents: state.commercialIntents || [],
  };
}

function applyUserProfile(profile = {}) {
  state.isApplyingUserProfile = true;
  const localHasState = [
    state.followedAthletes,
    state.followedCompetitions,
    state.recentItems,
    state.reportHistory,
    state.aiHistory,
  ].some((rows) => Array.isArray(rows) && rows.length);
  const remoteHasState = [
    profile.follows,
    profile.followedCompetitions,
    profile.recentItems,
    profile.reportHistory,
    profile.aiHistory,
  ].some((rows) => Array.isArray(rows) && rows.length);
  if (profile.role && !state.userRole) state.userRole = profile.role;
  if (profile.selectedChildId && !state.selectedChildId) state.selectedChildId = profile.selectedChildId;
  if (remoteHasState || !localHasState) {
    if (Array.isArray(profile.follows)) state.followedAthletes = profile.follows;
    if (Array.isArray(profile.followedCompetitions)) state.followedCompetitions = profile.followedCompetitions;
    if (Array.isArray(profile.recentItems)) state.recentItems = profile.recentItems;
    if (Array.isArray(profile.reportHistory)) state.reportHistory = profile.reportHistory;
    if (Array.isArray(profile.aiHistory)) state.aiHistory = profile.aiHistory;
    if (Array.isArray(profile.commercialIntents)) state.commercialIntents = profile.commercialIntents;
  }
  localStorage.setItem(ROLE_KEY, state.userRole || '');
  if (state.selectedChildId) localStorage.setItem(CHILD_KEY, state.selectedChildId);
  else localStorage.removeItem(CHILD_KEY);
  saveFollowedAthletes();
  saveStoredList(COMPETITION_FOLLOW_KEY, state.followedCompetitions, 30);
  saveStoredList(RECENT_KEY, state.recentItems, 20);
  saveStoredList(REPORT_HISTORY_KEY, state.reportHistory, 12);
  saveStoredList(AI_HISTORY_KEY, state.aiHistory, 10);
  saveStoredList(COMMERCIAL_INTENT_KEY, state.commercialIntents, 10);
  state.isApplyingUserProfile = false;
}

function scheduleUserStateSync() {
  if (!state.authToken || state.isApplyingUserProfile) return;
  clearTimeout(state.userSyncTimer);
  state.userSyncTimer = setTimeout(() => {
    syncUserProfile().catch(() => {});
  }, 700);
}

async function syncUserProfile() {
  if (!state.authToken) return null;
  const response = await fetch('/api/me/profile', {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(currentUserProfilePayload()),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.message || '同步失败');
  if (result.user) {
    state.authUser = result.user;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.user));
  }
  if (result.capabilities) state.authCapabilities = result.capabilities;
  return result;
}

async function restoreAuthSession() {
  if (!state.authToken) return;
  try {
    const result = await fetchJsonWithAuth('/api/auth/me');
    state.authUser = result.user || state.authUser;
    state.authCapabilities = result.capabilities || state.authCapabilities;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(state.authUser));
    applyUserProfile(result.profile || {});
  } catch {
    state.authToken = '';
    state.authUser = null;
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }
}

async function fetchJsonWithAuth(path) {
  const response = await fetch(path, { headers: authHeaders() });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.message || `Request failed: ${response.status}`);
  return result;
}

async function submitAccountLogin(form) {
  const identifier = form.querySelector('[name="identifier"]')?.value || '';
  const code = form.querySelector('[name="code"]')?.value || '';
  const status = form.querySelector('[data-account-status]');
  if (status) status.textContent = '正在登录';
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, code }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.message || '登录失败');
    state.authToken = result.token;
    state.authUser = result.user;
    state.authCapabilities = result.capabilities || state.authCapabilities;
    state.accountStatus = result.isNew ? '账号已创建，本机内容已同步。' : '已登录，本机内容已同步。';
    localStorage.setItem(AUTH_TOKEN_KEY, state.authToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(state.authUser));
    applyUserProfile(result.profile || {});
    await syncUserProfile();
    await hydrateFollowedAthleteProfiles();
    renderPersonalPages();
    renderHomePage();
    if (status) status.textContent = result.isNew ? '账号已创建，本机内容已同步。' : '已登录，本机内容已同步。';
    if (views.accountLogin?.classList.contains('active')) {
      state.viewStack = ['my'];
      state.activeMainTab = 'my';
      showView('my');
      scrollToPageTop();
    }
    trackAnalyticsAction('auth_login', result.isNew ? 'new' : 'returning');
  } catch (error) {
    if (status) status.textContent = error.message || '登录失败';
  }
}

function logoutAccount() {
  state.authToken = '';
  state.authUser = null;
  state.authCapabilities = null;
  state.accountStatus = '';
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  renderPersonalPages();
  renderHomePage();
  trackAnalyticsAction('auth_logout', 'manual');
}

function renderAccountPanel() {
  return renderAccountPanelV2();
}

function accountProfileCounts() {
  return {
    follows: (state.followedAthletes || []).length,
    followedCompetitions: (state.followedCompetitions || []).length,
    reports: (state.reportHistory || []).length,
    aiHistory: (state.aiHistory || []).length,
  };
}

function renderAccountPanelV2() {
  const counts = accountProfileCounts();
  if (state.authUser) {
    state.showAccountLoginForm = false;
    return `
      <section class="panel my-section account-panel account-center-panel">
        <div class="section-title">
          <h2>账号中心</h2>
          <span>已登录</span>
        </div>
        <div class="account-center-head">
          <div>
            <strong>${escapeHtml(state.authUser.displayName || state.authUser.identifier || '已登录用户')}</strong>
            <span>${escapeHtml(state.authUser.provider === 'wechat' ? '微信账号' : '手机号 / 邮箱账号')}</span>
          </div>
          <button type="button" data-account-logout>退出</button>
        </div>
        <div class="account-state-note signed">
          <strong>已登录</strong>
          <span>关注、历史、报告和角色设置会保存到当前账号。</span>
        </div>
        <div class="account-data-grid">
          <div><strong>${counts.follows}</strong><span>关注选手</span></div>
          <div><strong>${counts.followedCompetitions}</strong><span>关注赛事</span></div>
          <div><strong>${counts.reports}</strong><span>报告</span></div>
          <div><strong>${counts.aiHistory}</strong><span>分析历史</span></div>
        </div>
        <div class="account-policy-box">
          <strong>账号资料</strong>
          <span>关注、赛事提醒和报告会保存在当前账号；公开赛事数据无需登录也可以浏览。</span>
        </div>
        <div class="account-action-row">
          <button type="button" data-account-export>导出资料</button>
          <button type="button" data-account-clear>清空资料</button>
        </div>
        ${state.accountStatus ? `<p class="account-status-line">${escapeHtml(state.accountStatus)}</p>` : ''}
      </section>
    `;
  }
  return `
    <section class="panel my-section account-panel account-center-panel">
      <div class="section-title">
        <h2>账号中心</h2>
        <span>未登录</span>
      </div>
      <div class="account-state-note">
        <strong>当前未登录</strong>
        <span>你仍然可以浏览赛事数据；登录后，关注、报告和历史可以随账号保存。</span>
      </div>
      <div class="account-value-list">
        <div><strong>保存关注和报告</strong><span>换设备后可以继续查看关注选手、赛事提醒和历史分析。</span></div>
        <div><strong>继续历史分析</strong><span>再次登录后，可以接着查看之前保存的报告和提问记录。</span></div>
      </div>
      <div class="account-action-row account-login-entry">
        <button type="button" data-account-open-login>登录账号</button>
      </div>
      ${state.accountStatus ? `<p class="account-status-line">${escapeHtml(state.accountStatus)}</p>` : ''}
    </section>
  `;
}

function renderAccountLoginPage() {
  if (!accountLoginPage) return;
  accountLoginPage.innerHTML = `
    <section class="panel account-login-page">
      <div class="section-title">
        <h2>登录账号</h2>
        <span>保存你的关注和报告</span>
      </div>
      <div class="account-state-note">
        <strong>手机号或邮箱登录</strong>
        <span>登录后，关注选手、赛事提醒、历史分析和报告会保存到账号。</span>
      </div>
      <form class="account-login-form" data-account-login>
        <label>
          <span>手机号或邮箱</span>
          <input name="identifier" type="text" autocomplete="username" placeholder="用于找回关注、报告和历史">
        </label>
        <label>
          <span>密码</span>
          <input name="code" type="password" autocomplete="current-password" placeholder="至少 6 位，首次输入即创建账号">
        </label>
        <button type="submit">登录账号</button>
        <em data-account-status>${escapeHtml(state.accountStatus || '没有账号时会自动创建。')}</em>
      </form>
    </section>
  `;
  accountLoginPage.querySelector('[data-account-login]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    submitAccountLogin(event.currentTarget);
  });
}

function downloadJsonFile(fileName, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function exportAccountData(button) {
  if (!state.authToken) return;
  const original = button?.textContent || '';
  if (button) button.textContent = '正在导出';
  try {
    const result = await fetchJsonWithAuth('/api/me/export');
    downloadJsonFile(`fencingai-account-${new Date().toISOString().slice(0, 10)}.json`, result);
    state.accountStatus = '账号数据已导出。';
    trackAnalyticsAction('account_export', 'profile');
  } catch (error) {
    state.accountStatus = error.message || '导出失败。';
  } finally {
    if (button) button.textContent = original;
    renderPersonalPages();
  }
}

async function clearAccountData(button) {
  if (!state.authToken) return;
  if (!window.confirm('确认清空账号内的关注、报告和历史记录？本机当前页面也会同步清空。')) return;
  const original = button?.textContent || '';
  if (button) button.textContent = '正在清空';
  try {
    const response = await fetch('/api/me/profile', {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.message || '清空失败。');
    state.accountStatus = '账号数据已清空。';
    state.followedAthletes = [];
    state.followedCompetitions = [];
    state.recentItems = [];
    state.reportHistory = [];
    state.aiHistory = [];
    state.commercialIntents = [];
    applyUserProfile(result.profile || {});
    trackAnalyticsAction('account_clear', 'profile');
  } catch (error) {
    state.accountStatus = error.message || '清空失败。';
  } finally {
    if (button) button.textContent = original;
    renderPersonalPages();
    renderHomePage();
  }
}

async function showWechatAuthStatus() {
  try {
    const result = await fetchJson('/api/auth/wechat/status');
    state.accountStatus = result.wechat?.message || '当前请使用手机号或邮箱登录。';
  } catch (error) {
    state.accountStatus = error.message || '微信登录状态读取失败。';
  }
  renderPersonalPages();
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
state.athleteDataRequests = loadStoredList(ATHLETE_DATA_REQUEST_KEY);

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
  scheduleUserStateSync();
}

function saveFollowedAthletes() {
  localStorage.setItem(FOLLOW_KEY, JSON.stringify(state.followedAthletes.slice(0, 20)));
  scheduleUserStateSync();
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
    'capability-guide': '使用指南',
    'competition-stats': '赛事统计',
    prematch: '赛前分析',
    growth: '成长分析',
    comparison: '选手对比',
    'club-comparison': '剑馆对比',
    club: '俱乐部分析',
    'business-insight': '商业洞察',
    'product-template': '报告服务',
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
  if (['prematch', 'growth', 'club', 'club-comparison', 'business-insight', 'product-template', 'club-recruiting'].includes(report.type)) {
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
  scheduleUserStateSync();
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
  scheduleUserStateSync();
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
  if (state.authToken) {
    await hydrateFollowedAthleteProfiles();
    renderFollowPanel();
    renderRoleWorkspacePremium();
    renderParentDashboard();
    renderPersonalPages();
    return;
  }
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
    .replace(/[，。、“”‘’（）()【】\[\]《》"'|/\\{}:：；;,./·\-–—_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function searchTokens(value) {
  return normalizeSearchText(value).split(' ').filter(Boolean);
}

function compactText(value) {
  return normalizeSearchText(value).replace(/\s+/g, '');
}

function chineseAdminAlias(value) {
  const compact = compactText(value);
  if (!/[\u4e00-\u9fa5]/.test(compact)) return '';
  return compact.replace(/(省|市|自治区|特别行政区|地区|区|县)/g, '');
}

function withoutYearAlias(value) {
  return String(value || '').replace(/20\d{2}年?/g, '');
}

function competitionAliasTerms(competition) {
  const values = [
    competition?.sportName,
    competition?.venue,
    competition?.region,
    competition?.dateLabel,
    competitionYear(competition),
    competition?.season,
    competition?.status,
    competition?.sportCode,
  ];
  const aliases = [];
  for (const value of values.filter(Boolean)) {
    aliases.push(value);
    const noAdmin = chineseAdminAlias(value);
    if (noAdmin && noAdmin !== compactText(value)) aliases.push(noAdmin);
    const noYear = withoutYearAlias(value);
    if (noYear !== String(value)) aliases.push(noYear);
    const noAdminNoYear = chineseAdminAlias(noYear);
    if (noAdminNoYear) aliases.push(noAdminNoYear);
  }
  return [...new Set(aliases.filter(Boolean))];
}

function competitionNameAliasTerms(competition) {
  const values = [
    competition?.sportName,
    competition?.sportCode,
  ];
  const aliases = [];
  for (const value of values.filter(Boolean)) {
    aliases.push(value);
    const noAdmin = chineseAdminAlias(value);
    if (noAdmin && noAdmin !== compactText(value)) aliases.push(noAdmin);
    const noYear = withoutYearAlias(value);
    if (noYear !== String(value)) aliases.push(noYear);
    const noAdminNoYear = chineseAdminAlias(noYear);
    if (noAdminNoYear) aliases.push(noAdminNoYear);
  }
  const nameKey = competitionNameMatchKey(competition?.sportName || '');
  if (nameKey) aliases.push(nameKey);
  return [...new Set(aliases.map(compactText).filter((alias) => alias.length >= 4 && !/^20\d{2}$/.test(alias)))];
}

function statusLabel(status) {
  if (status === 'registration') return '报名中';
  if (status === 'upcoming') return '未开赛';
  if (status === 'live') return '进行中';
  if (status === 'completed') return '已结束';
  return '状态待确认';
}

function rosterStatusLabel(status) {
  if (status === 'partial') return '报名陆续公布';
  if (status === 'complete') return '报名名单可查看';
  return '报名待公布';
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
    return '可先关注赛程、地点和报名节奏。';
  }
  if (competition.rosterStatus === 'partial') return '报名信息陆续公布，可先查看项目热度和初步赛前对标。';
  if (competition.rosterStatus === 'complete') return '报名信息已完整，可查看赛前对手、强手和熟悉对手分析。';
  if (competition.isPreEvent) return '可查看组别、剑种和报名规模。';
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
    ...competitionAliasTerms(competition),
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
  const mainViews = ['roleHome', ...MAIN_TABS];
  topBack.classList.toggle('visible', !mainViews.includes(name));
  if (bottomNav) {
    const showBottomNav = MAIN_TABS.includes(name);
    bottomNav.hidden = !showBottomNav;
    const activeTab = MAIN_TABS.includes(name) ? name : state.activeMainTab;
    if (activeTab) state.activeMainTab = activeTab;
    updateBottomNavState(activeTab);
  }
}

function updateBottomNavState(activeTab) {
  if (!bottomNav) return;
  activeTab = MAIN_TABS.includes(activeTab) ? activeTab : 'home';
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
    const target = element.querySelector?.('.ai-answer-card, .ai-loading-card, .loading-row') || element;
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
  if (MAIN_TABS.includes(name)) state.activeMainTab = name;
  if (name === 'home') renderHomePage();
  if (name === 'follow') renderFocusPage();
  if (name === 'my') renderPersonalPages();
  if (name === 'accountLogin') renderAccountLoginPage();
  showView(name);
  scrollToPageTop();
}

function navigateMain(name) {
  const targetView = name === 'follow' ? 'my' : name;
  state.activeMainTab = MAIN_TABS.includes(targetView) ? targetView : 'home';
  if (targetView === 'home') renderHomePage();
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
  if (MAIN_TABS.includes(target)) state.activeMainTab = target;
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
  if (type === 'follow') {
    return ['全部赛事', '我的关注'];
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
  if (type === 'follow') return state.onlyFollowedData ? '我的关注' : '全部赛事';
  return state.selectedItem;
}

function filterTitle(type) {
  if (type === 'year') return '选择年份';
  if (type === 'region') return '选择地区';
  if (type === 'status') return '选择状态';
  if (type === 'follow') return '选择关注范围';
  return '选择项目';
}

function setFilterValue(type, value) {
  if (type === 'year') state.selectedYear = value;
  if (type === 'region') state.selectedRegion = value;
  if (type === 'item') state.selectedItem = value;
  if (type === 'status') state.selectedStatus = value;
  if (type === 'follow') state.onlyFollowedData = value === '我的关注';
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

function queryItemFilterOption(query = '') {
  const hints = aiProjectHints(query);
  if (!hints.length) return '';
  return filterOptions('item').find((option) => (
    option !== '全部项目' && projectMatchesAiHints(option, hints)
  )) || '';
}

function aiCompetitionFilterSummary(filters = {}) {
  const parts = [];
  if (filters.year) parts.push(`${filters.year}年`);
  if (filters.month) parts.push(`${filters.month}月`);
  if (filters.region) parts.push(filters.region);
  if (filters.item) parts.push(filters.item);
  if (filters.status) parts.push(statusLabel(filters.status));
  return parts.length ? `筛选结果：${parts.join(' · ')}` : '';
}

function applyAiCompetitionFilters(filters = {}) {
  const question = filters.query || state.aiActiveQuery || '';
  const itemFilter = filters.item || queryItemFilterOption(question);
  state.selectedYear = filters.year ? matchingFilterOption('year', filters.year) : '全部年份';
  state.selectedRegion = filters.region ? matchingFilterOption('region', filters.region) : '全部地区';
  state.selectedStatus = filters.status ? matchingFilterOption('status', statusLabel(filters.status)) : '全部状态';
  state.selectedItem = itemFilter ? matchingFilterOption('item', itemFilter) : '全部项目';
  state.selectedAiMonth = filters.month || '';
  state.aiCompetitionFilterSummary = aiCompetitionFilterSummary({
    ...filters,
    item: state.selectedItem !== '全部项目' ? state.selectedItem : '',
  });
  state.aiCompetitionFilterQuestion = question;
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
  state.aiCompetitionFilterQuestion = '';
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
  if (myFollowFilterButton) {
    const isActive = Boolean(state.onlyFollowedData);
    myFollowFilterButton.classList.toggle('active', isActive);
    myFollowFilterButton.innerHTML = `<span>${isActive ? '我的关注' : '全部赛事'}</span>`;
  }
}

function openFilterSheet(type) {
  const activeValue = activeFilterValue(type);
  filterSheet.dataset.filterType = type;
  filterSheetTitle.textContent = filterTitle(type);
  filterSheetOptions.innerHTML = filterOptions(type).map((value) => `
    <button class="sheet-option ${value === activeValue ? 'active' : ''}" type="button" data-filter-type="${type}" data-filter-value="${escapeHtml(value)}">
      ${escapeHtml(value)}
    </button>
  `).join('');
  filterSheet.hidden = false;
  if (type === 'follow') myFollowFilterButton?.setAttribute('aria-expanded', 'true');
}

function closeFilterSheet() {
  filterSheet.hidden = true;
  if (filterSheet.dataset.filterType === 'follow') myFollowFilterButton?.setAttribute('aria-expanded', 'false');
  filterSheet.dataset.filterType = '';
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

function competitionMatchesFollowedData(competition) {
  if (!state.onlyFollowedData) return true;
  const followedCompetitionCodes = new Set((state.followedCompetitions || []).map((item) => item.sportCode).filter(Boolean));
  if (followedCompetitionCodes.has(competition.sportCode)) return true;
  const followedAthleteEvents = new Set();
  for (const athlete of focusAthleteCards()) {
    for (const event of athlete.events || []) {
      if (event.sportCode) followedAthleteEvents.add(event.sportCode);
      if (event.competitionCode) followedAthleteEvents.add(event.competitionCode);
    }
  }
  return followedAthleteEvents.has(competition.sportCode);
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
    return matchRegion && matchYear && matchMonth && matchItem && matchStatus && matchKeyword && competitionMatchesFollowedData(competition);
  });
  if (!keyword) {
    state.athleteSearchResults = [];
    state.clubSearchResults = [];
    state.coachSearchResults = [];
    state.refereeSearchResults = [];
    state.lastSearchKeyword = '';
  }
  renderAthleteSearchResults(keyword);
  renderDatabaseDirectory();
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
    coachLimit: '4',
    refereeLimit: '4',
  });
  try {
    const result = await fetchJson(`/api/search?${params.toString()}`);
    if (requestId !== state.searchRequestId || normalizeSearchText(searchInput.value) !== normalizedKeyword) return;
    state.lastSearchKeyword = normalizedKeyword;
    state.athleteSearchResults = result.athletes || [];
    state.clubSearchResults = result.clubs || [];
    state.coachSearchResults = result.coaches || [];
    state.refereeSearchResults = result.referees || [];
    renderAthleteSearchResults(normalizedKeyword);
  } catch {
    if (requestId !== state.searchRequestId) return;
    state.athleteSearchResults = [];
    state.clubSearchResults = [];
    state.coachSearchResults = [];
    state.refereeSearchResults = [];
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
  state.coachSearchResults = [];
  state.refereeSearchResults = [];
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
  return '已有完整赛果';
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
      title: '赛前提醒',
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
        <h2>数据概览</h2>
        <span>${escapeHtml(actionablePercent)}% 可分析</span>
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
      <p>${escapeHtml(coverage.score)} 场赛事已有成绩或对阵，适合查看成长变化、对手表现和队伍表现；${generatedLabel ? `最近更新 ${escapeHtml(generatedLabel)}，` : ''}报名赛事适合提前做赛前准备。</p>
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
  const active = isFilteringActive();
  const sourceNote = active ? `已筛出 ${source.length} 场` : `${source.length} 场赛事`;

  dataCoverageSummary.innerHTML = `
    <div class="coverage-summary-head">
      <div>
        <strong>内容概况</strong>
        <span>${escapeHtml(sourceNote)}，其中 ${escapeHtml(coverage.score)} 场可做赛后复盘</span>
      </div>
      <em>${escapeHtml(scorePercent)}% 可复盘</em>
    </div>
    <div class="coverage-level-grid">
      <div>
        <strong>${escapeHtml(coverage.directory)}</strong>
        <span>赛事目录</span>
        <small>查比赛时间、地点和项目</small>
      </div>
      <div>
        <strong>${escapeHtml(coverage.project + coverage.roster)}</strong>
        <span>项目/报名</span>
        <small>看报名热度和参赛项目</small>
      </div>
      <div>
        <strong>${escapeHtml(coverage.score)}</strong>
        <span>成绩对阵</span>
        <small>看选手成长和队伍表现</small>
      </div>
    </div>
    <p>已出赛果的比赛适合看成长变化、对手表现和队伍表现；报名中的比赛适合提前准备参赛策略。</p>
    ${syncLabel ? `<div class="sync-status-note">${escapeHtml(syncLabel)}</div>` : ''}
  `;
}

function isFilteringActive() {
  return Boolean(normalizeSearchText(searchInput.value))
    || state.selectedYear !== '全部年份'
    || state.selectedRegion !== '全部地区'
    || state.selectedItem !== '全部项目'
    || state.selectedStatus !== '全部状态'
    || Boolean(state.onlyFollowedData);
}

function entityCoverageCounts() {
  const positiveMax = (...values) => Math.max(0, ...values.map((value) => Number(value) || 0));
  const nestedCoverage = state.publicEvents?.dataCoverage || {};
  const publicEvents = state.publicEvents || {};
  return {
    athletes: positiveMax(
      state.dataCoverage?.athletes,
      state.dataCoverage?.athleteCount,
      state.dataCoverage?.athleteProfiles,
      nestedCoverage.athletes,
      nestedCoverage.athleteCount,
      nestedCoverage.athleteProfiles,
      publicEvents.athletes?.length,
      publicEvents.athleteCount,
      state.athleteSearchIndex.length,
      Object.keys(state.athletesById || {}).length,
    ),
    clubs: positiveMax(
      state.dataCoverage?.clubs,
      state.dataCoverage?.clubCount,
      state.dataCoverage?.clubProfiles,
      nestedCoverage.clubs,
      nestedCoverage.clubCount,
      nestedCoverage.clubProfiles,
      publicEvents.clubs?.length,
      publicEvents.clubCount,
      state.clubSearchIndex.length,
      Object.keys(state.clubsById || {}).length,
    ),
  };
}

function officialCoverageCount() {
  const coverage = state.dataCoverage || {};
  const nestedCoverage = state.publicEvents?.dataCoverage || {};
  return Math.max(
    0,
    Number(coverage.coaches) || 0,
    Number(coverage.referees) || 0,
    Number(nestedCoverage.coaches) || 0,
    Number(nestedCoverage.referees) || 0,
    (state.coachSearchResults || []).length + (state.refereeSearchResults || []).length,
  );
}

function followedDataCount() {
  return (state.followedAthletes || []).length + (state.followedCompetitions || []).length;
}

function renderDatabaseDirectory() {
  if (!databaseDirectory) return;
  if (state.isDataLoading) {
    databaseDirectory.innerHTML = '<div class="loading-row">正在整理常用查找</div>';
    return;
  }
  if (state.dataLoadError) {
    databaseDirectory.innerHTML = '';
    return;
  }

  const entityCounts = entityCoverageCounts();
  const officialCount = officialCoverageCount();
  const taskRows = [
    {
      key: 'task-competitions',
      title: '找近期比赛',
      detail: '按时间、地区和状态查看赛事',
      action: '查赛事',
    },
    {
      key: 'task-athlete-growth',
      title: '看选手成长',
      detail: '输入姓名查看名次、参赛和趋势',
      action: '查选手',
    },
    {
      key: 'task-club-performance',
      title: '看俱乐部表现',
      detail: '比较参赛规模、前八和优势项目',
      action: '查俱乐部',
    },
  ];
  const rows = [
    {
      key: 'competitions',
      title: '赛事',
      detail: '查时间、地点、状态和项目',
      count: `${state.competitions.length} 场`,
      action: '查看赛事',
    },
    {
      key: 'athletes',
      title: '选手',
      detail: '查成长、名次和参赛记录',
      count: `${entityCounts.athletes} 个`,
      action: '搜索选手',
    },
    {
      key: 'clubs',
      title: '俱乐部',
      detail: '查队伍表现、代表选手和优势项目',
      count: `${entityCounts.clubs} 个`,
      action: '搜索俱乐部',
    },
    {
      key: 'officials',
      title: '教练/裁判',
      detail: '按姓名检索公开资料',
      count: officialCount ? `${officialCount} 个` : '待导入',
      action: '搜索人员',
    },
    {
      key: 'followed',
      title: '我的关注',
      detail: '只看已关注选手和赛事相关内容',
      count: followedDataCount() ? `${followedDataCount()} 个` : '待添加',
      action: state.onlyFollowedData ? '已开启' : '开启筛选',
      active: state.onlyFollowedData,
    },
  ];

  databaseDirectory.innerHTML = `
    <div class="section-title">
      <h2>常用查找</h2>
      <span>先选任务</span>
    </div>
    <div class="database-task-list">
      ${taskRows.map((row) => `
        <button class="database-task-card" type="button" data-database-entry="${escapeHtml(row.key)}">
          <strong>${escapeHtml(row.title)}</strong>
          <span>${escapeHtml(row.detail)}</span>
          <em>${escapeHtml(row.action)}</em>
        </button>
      `).join('')}
    </div>
    <div class="section-title database-entry-title">
      <h2>按对象查找</h2>
      <span>${escapeHtml(entityCounts.athletes)} 个选手 · ${escapeHtml(entityCounts.clubs)} 个俱乐部</span>
    </div>
    <div class="database-entry-grid">
      ${rows.map((row) => `
        <button class="database-entry-card ${row.active ? 'active' : ''}" type="button" data-database-entry="${escapeHtml(row.key)}">
          <span>${escapeHtml(row.title)}</span>
          <strong>${escapeHtml(row.count)}</strong>
          <em>${escapeHtml(row.detail)}</em>
          <small>${escapeHtml(row.action)}</small>
        </button>
      `).join('')}
    </div>
  `;

  databaseDirectory.querySelectorAll('[data-database-entry]').forEach((button) => {
    button.addEventListener('click', () => handleDatabaseEntry(button.dataset.databaseEntry));
  });
}

function focusDatabaseSearch(placeholder = '') {
  if (placeholder) searchInput.setAttribute('placeholder', placeholder);
  searchInput.focus({ preventScroll: true });
  searchShell?.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

function handleDatabaseEntry(key) {
  if (key === 'competitions' || key === 'task-competitions') {
    searchInput.value = '';
    state.onlyFollowedData = false;
    clearAiCompetitionFilter();
    focusDatabaseSearch('搜索比赛、地区、U8 男花');
    return;
  }
  if (key === 'athletes' || key === 'task-athlete-growth') {
    focusDatabaseSearch('输入选手姓名，例如 蔡廷彧');
    return;
  }
  if (key === 'clubs' || key === 'task-club-performance') {
    focusDatabaseSearch('输入俱乐部名称，例如 山东小众体育');
    return;
  }
  if (key === 'officials') {
    focusDatabaseSearch('输入教练员或裁判员姓名');
    return;
  }
  if (key === 'followed') {
    state.onlyFollowedData = true;
    state.selectedAiMonth = '';
    state.aiCompetitionFilterSummary = '';
    renderFilters();
    applyCompetitionFilter();
  }
}

function renderHomeStats() {
  if (state.isDataLoading) {
    if (homeStatsScope) homeStatsScope.textContent = '整理中';
    homeStats.innerHTML = '<div class="loading-row">正在整理赛事资料</div>';
    if (dataCoverageSummary) dataCoverageSummary.innerHTML = '';
    return;
  }
  if (state.dataLoadError) {
    if (homeStatsScope) homeStatsScope.textContent = '未能加载';
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
  if (homeStatsScope) homeStatsScope.textContent = active ? '筛选结果' : '赛事收录';

  homeStats.innerHTML = [
    ['比赛', source.length, `${regions} 地区`],
    ['项目', eventCount, '按组别查看'],
    ['赛后复盘', coverage.score, '可看成长分析'],
    ['赛前准备', prematchCount, '可看参赛项目'],
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
    rows.push({ title: '争取淘汰赛突破', detail: '淘汰赛胜负样本还少，重点看能否稳定进入更深轮次。' });
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

function parentGrowthCloseBoutRows(athlete) {
  const closeOpponents = (athlete?.opponents || [])
    .filter((opponent) => opponent?.name)
    .map((opponent) => {
      const diff = Number.isFinite(Number(opponent.diff))
        ? Number(opponent.diff)
        : (Number(opponent.scored) || 0) - (Number(opponent.received) || 0);
      return {
        opponent,
        diff,
        margin: Math.abs(diff),
      };
    })
    .filter((row) => row.margin > 0 && row.margin <= 2)
    .sort((a, b) => a.margin - b.margin || String(a.opponent.name).localeCompare(String(b.opponent.name), 'zh-CN'));
  const wins = closeOpponents.filter((row) => row.diff > 0).length;
  const losses = closeOpponents.filter((row) => row.diff < 0).length;
  const total = wins + losses;
  const rate = total ? Math.round((wins / total) * 100) : null;
  const summary = total
    ? `近似胶着对局 ${total} 场，${wins}胜${losses}负。`
    : '接近比分样本还少。';
  const advice = total
    ? rate >= 60
      ? '胶着局处理有正向信号，下一步保持领先收尾和关键分主动性。'
      : wins
        ? '已经有胶着局取胜样本，建议继续复盘落后追分和最后两剑处理。'
        : '胶着局暂时偏吃亏，下一步重点复盘最后两剑、领先后收尾和落后追分。'
    : '接近比分增多时，重点观察最后两剑处理和关键分稳定性。';
  return {
    total,
    wins,
    losses,
    rate,
    summary,
    advice,
    rows: closeOpponents.slice(0, 4).map(({ opponent, diff, margin }) => ({
      name: opponent.name,
      club: opponent.club || '俱乐部待确认',
      result: diff > 0 ? `小胜 ${margin}` : `惜败 ${margin}`,
      score: opponent.latestScore || `${opponent.scored ?? '-'}:${opponent.received ?? '-'}`,
      phase: opponent.latestPhase || '淘汰赛',
    })),
  };
}

function parentGrowthPeerPositionRows(athlete, model) {
  const labels = aiAthleteProjectLabels(athlete);
  const currentKey = athlete?.id || `${athlete?.name || ''}-${athlete?.club || ''}`;
  return labels.slice(0, 3).map((label) => {
    const peers = uniqueBy([athlete, ...(state.athleteSearchIndex || [])]
      .filter((row) => row?.name)
      .filter((row) => athleteMatchesProjectLabel(row, label)), (row) => row.id || `${row.name}-${row.club || ''}`)
      .sort((a, b) => {
        const rankDiff = (Number(a.bestRank) || 999) - (Number(b.bestRank) || 999);
        if (rankDiff) return rankDiff;
        const appearanceDiff = (Number(b.appearances) || 0) - (Number(a.appearances) || 0);
        if (appearanceDiff) return appearanceDiff;
        return String(a.name).localeCompare(String(b.name), 'zh-CN');
      });
    const selfIndex = peers.findIndex((row) => (row.id || `${row.name}-${row.club || ''}`) === currentKey);
    const position = selfIndex >= 0 ? selfIndex + 1 : null;
    const stronger = peers.filter((row) => {
      const key = row.id || `${row.name}-${row.club || ''}`;
      return key !== currentKey && (Number(row.bestRank) || 999) < (Number(athlete.bestRank) || 999);
    }).slice(0, 2);
    const nearby = peers.filter((row) => {
      const key = row.id || `${row.name}-${row.club || ''}`;
      return key !== currentKey && Math.abs((Number(row.bestRank) || 999) - (Number(athlete.bestRank) || 999)) <= 4;
    }).slice(0, 2);
    const referenceNames = (stronger.length ? stronger : nearby).map((row) => `${row.name} 第${row.bestRank ?? '-'}名`).join(' / ');
    const selfRank = model.best?.finalRank || athlete.bestRank || '-';
    const positionText = position ? `第 ${position}/${peers.length}` : `样本 ${peers.length}`;
    return {
      label,
      positionText,
      selfRank,
      referenceNames,
      detail: referenceNames
        ? `当前可对照 ${referenceNames}，下一步看同项目连续参赛后的名次变化。`
        : `已识别 ${peers.length} 个同项目样本，继续积累后会形成更稳定的横向判断。`,
    };
  }).filter((row) => row.label);
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

function parentGrowthCommunicationRows(athlete, model, focusRows = [], actionRows = parentGrowthActionRows(athlete, model, focusRows), signalRows = parentInvestmentSignalRows(model)) {
  const latest = model.latest;
  const trendText = model.trend === null
    ? '继续观察趋势'
    : model.trend > 0
      ? `最近名次前进 ${model.trend} 名`
      : model.trend < 0
        ? `最近名次后退 ${Math.abs(model.trend)} 名`
        : '最近名次基本稳定';
  const focus = focusRows[0] || null;
  const continuity = signalRows.find((row) => row.title === '参赛连续性') || signalRows[0] || null;
  const training = actionRows.find((row) => row.title === '训练沟通') || actionRows[1] || null;
  const nextCompetition = actionRows.find((row) => row.title === '下场比赛') || actionRows[2] || null;
  return [
    {
      key: 'coach',
      title: '发给教练',
      label: focus?.title || '训练沟通',
      message: [
        `${athlete.name} 最近一次：${latest ? `${displayEventName(latest)} 第 ${latest.finalRank ?? '-'} 名` : '暂无最近比赛记录'}`,
        `阶段观察：${model.investment}，${trendText}`,
        training?.detail || '希望结合近期参赛记录确认训练重点。',
        focus?.detail ? `本阶段重点：${focus.detail}` : '',
      ].filter(Boolean).join('；'),
    },
    {
      key: 'family',
      title: '家庭复盘',
      label: continuity?.level || '持续观察',
      message: [
        `${athlete.name} 当前参赛记录 ${model.events.length} 场，最好名次 ${model.best?.finalRank ? `第${model.best.finalRank}名` : '待确认'}`,
        `小组胜率 ${model.poolRate === null ? '待补齐' : `${model.poolRate}%`}，淘汰赛 ${model.totalElimWins}胜${model.totalElimLosses}负`,
        continuity?.detail || '先看参赛连续性，再判断训练投入节奏。',
      ].filter(Boolean).join('；'),
    },
    {
      key: 'next',
      title: '下场安排',
      label: nextCompetition?.title || '下场比赛',
      message: nextCompetition?.detail || '优先选择常参项目或相近项目，用下一场比赛验证训练调整是否有效。',
    },
  ];
}

function parentGrowthCommunicationText(row = {}) {
  return [
    row.title || '成长沟通',
    row.label ? `重点：${row.label}` : '',
    row.message ? `内容：${row.message}` : '',
  ].filter(Boolean).join('\n');
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

function buildParentGrowthShareText(athlete, model, focusRows, actionRows = parentGrowthActionRows(athlete, model, focusRows), signalRows = parentInvestmentSignalRows(model), opponentRows = parentGrowthOpponentRows(athlete), peerRows = parentGrowthPeerPositionRows(athlete, model), closeBout = parentGrowthCloseBoutRows(athlete), communicationRows = parentGrowthCommunicationRows(athlete, model, focusRows, actionRows, signalRows)) {
  return [
    `${athlete.name} 成长报告`,
    `俱乐部：${athlete.club || '待确认'}`,
    `成长判断：${model.investment}`,
    `参赛记录：${model.events.length} 场，最好名次：${model.best?.finalRank ? `第${model.best.finalRank}名` : '-'}`,
    `小组胜率：${model.poolRate === null ? '-' : `${model.poolRate}%`}，淘汰赛：${model.totalElimWins}胜${model.totalElimLosses}负`,
    `建议：${model.advice}`,
    ...signalRows.slice(0, 4).map((row) => `${row.title}：${row.level}，${row.detail}`),
    `胶着局：${closeBout.summary}${closeBout.advice}`,
    ...peerRows.slice(0, 3).map((row) => `同组位置：${row.label}，${row.positionText}，最好第 ${row.selfRank} 名。${row.detail}`),
    ...opponentRows.slice(0, 3).map((row) => `重点对手：${row.name}，${row.record}，${row.latest || `${row.matches} 次交手`}`),
    ...focusRows.slice(0, 3).map((row, index) => `关注点${index + 1}：${row.title}，${row.detail}`),
    ...actionRows.slice(0, 4).map((row) => `${row.title}：${row.detail}`),
    ...communicationRows.slice(0, 3).map((row, index) => `沟通卡${index + 1}：${row.title}，${row.message}`),
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
  const communicationRows = parentGrowthCommunicationRows(athlete, model, focusRows, actionRows, signalRows);
  const timelineRows = parentGrowthReportTimelineRows(athlete);
  const evidenceRows = parentGrowthReportEvidenceRows(model);
  const opponentRows = parentGrowthOpponentRows(athlete);
  const peerRows = parentGrowthPeerPositionRows(athlete, model);
  const closeBout = parentGrowthCloseBoutRows(athlete);
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
    <article class="panel parent-growth-report-card parent-close-bout">
      <div class="section-title">
        <h2>胶着局表现</h2>
        <span>${escapeHtml(closeBout.total ? '一两剑分差' : '待观察')}</span>
      </div>
      <div class="parent-close-bout-summary">
        <strong>${escapeHtml(closeBout.total ? `${closeBout.wins}胜${closeBout.losses}负` : '暂无胶着局样本')}</strong>
        <span>${escapeHtml(closeBout.summary)}</span>
        <em>${escapeHtml(closeBout.advice)}</em>
      </div>
      ${closeBout.rows.length ? `
        <div class="parent-close-bout-list">
          ${closeBout.rows.map((row) => `
            <div>
              <strong>${escapeHtml(row.name)}</strong>
              <span>${escapeHtml([row.club, row.phase, row.score].filter(Boolean).join(' · '))}</span>
              <em>${escapeHtml(row.result)}</em>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </article>
    <article class="panel parent-growth-report-card parent-peer-position">
      <div class="section-title">
        <h2>同组位置</h2>
        <span>${escapeHtml(peerRows.length ? '同项目横向对比' : '待积累')}</span>
      </div>
      <div class="parent-peer-position-list">
        ${peerRows.length ? peerRows.map((row) => `
          <div class="parent-peer-position-card">
            <div>
              <strong>${escapeHtml(row.label)}</strong>
              <span>${escapeHtml(row.detail)}</span>
            </div>
            <em>${escapeHtml(row.positionText)}</em>
          </div>
        `).join('') : '<div class="empty compact-empty">还没有足够的同项目样本。比赛记录更完整后，会在这里显示横向位置和可参考对象。</div>'}
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
        `).join('') : '<div class="empty compact-empty">当前还没有可追踪的直接对手记录。出现淘汰赛对阵后，这里会展示重点对手和交手变化。</div>'}
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

    <article class="panel parent-growth-report-card parent-growth-communication">
      <div class="section-title">
        <h2>家庭沟通卡</h2>
        <span>可复制</span>
      </div>
      <div class="parent-growth-communication-list">
        ${communicationRows.map((row, index) => `
          <article class="parent-growth-communication-card parent-growth-communication-${escapeHtml(row.key)}">
            <div>
              <strong>${escapeHtml(row.title)}</strong>
              <span>${escapeHtml(row.label)}</span>
              <em>${escapeHtml(row.message)}</em>
            </div>
            <button type="button" data-parent-growth-communication="${escapeHtml(index)}">复制沟通内容</button>
          </article>
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
  parentGrowthReportBody.querySelectorAll('[data-parent-growth-communication]').forEach((button) => {
    const row = communicationRows[Number(button.dataset.parentGrowthCommunication)];
    bindCopyTextButton(button, () => parentGrowthCommunicationText(row), 'parent-growth-communication', '已复制家庭沟通内容。');
  });
  parentGrowthReportBody.querySelector('[data-athlete-id]')?.addEventListener('click', () => openAthlete(athlete.id));
  bindReportConversionActions(parentGrowthReportBody);
  bindCopyTextButton(parentGrowthReportHero.querySelector('[data-report-share="parent-growth"]'), () => buildParentGrowthShareText(athlete, model, focusRows, actionRows, signalRows, opponentRows, peerRows, closeBout, communicationRows), 'parent-growth', '已复制，可继续申请家庭试用。');
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
      title: '赛前提醒',
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

function roleVisibleHomeReportRows(rows) {
  if (state.userRole === 'parent') return rows.filter((row) => ['prematch', 'growth'].includes(row.key));
  if (state.userRole === 'coach') return rows.filter((row) => ['prematch', 'growth', 'coach', 'club-recruiting'].includes(row.key));
  if (state.userRole === 'club') return rows.filter((row) => ['prematch', 'coach', 'club-recruiting'].includes(row.key));
  return rows;
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
        detail: [competition?.venue, displayDateLabel(competition?.dateLabel)].filter(Boolean).join(' · ') || row.detail || '赛前提醒',
        typeLabel: '赛前提醒',
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
      next: '打开报告后，可继续保存提醒、复盘和跟进动作。',
    };
    if (row.type === 'prematch') {
      return {
        ...base,
        actionLabel: '查看赛前提醒',
        trialLabel: '保存提醒',
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
        next: '把常问问题保存成报告，之后可直接回看。',
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
      label: '赛前提醒',
      value: countByType('prematch'),
      detail: '关注赛事后，可持续查看报名、项目和重点对手。',
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
      label: '最近分析',
      value: aiHistory.filter((row) => row?.query).length + countByType('ai-report'),
      detail: '保存常问问题和已经生成的分析。',
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
      title: '赛前提醒',
      detail: '围绕关注选手和报名赛事，整理潜在对手、强手和备赛重点。',
    },
    {
      title: '教练与剑馆',
      detail: '整理学员分层、续费沟通和招生展示素材，支撑日常经营。',
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
      <p>把成长报告、赛前提醒和教练工作台集中保存，关键比赛前可以直接继续分析。</p>
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
      label: '赛前提醒',
      title: '赛前提醒',
      detail: prematch ? `${prematch.sportName} · ${displayDateLabel(prematch.dateLabel)}` : '按报名和近期赛事生成备赛重点',
      query: prematch ? `${prematch.sportName}赛前提醒` : '查看赛前提醒',
    },
    {
      key: 'parent-growth',
      label: '家长决策',
      title: '成长报告',
      detail: child ? `${child.name} · ${child.summary}` : '关注孩子后生成成长趋势和投入判断',
      query: child ? `${child.name}最近几场有没有进步` : '查看家长成长报告',
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
      query: prematch ? `${prematch.sportName}赛前提醒` : '天津近期报名情况',
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
    aiRows.length ? `最近提问：${aiRows.map((row) => row.query || row.title).filter(Boolean).join('、')}` : '',
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
    `最近分析：${state.aiHistory.length}`,
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
    'prematch-pack-report': '赛前提醒',
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
    referenceLabel: row.feedbackId ? `申请编号 ${String(row.feedbackId).slice(-8)}` : '已保存',
    contactLabel: row.contact ? '联系方式已留存' : '可补充联系方式',
    nextStep: commercialIntentNextStep(row),
    deliverables: commercialIntentDeliverableRows(row),
    progressSteps: commercialIntentProgressSteps(row),
  }));
}

function commercialIntentNextStep(row = {}) {
  const source = row.source || '';
  const report = row.report || '';
  if (row.type === 'reminder-interest' || /reminder|提醒/.test(source) || /提醒|订阅/.test(report)) return '会按你关注的赛事和选手确认提醒范围。';
  if (/prematch/.test(source) || /赛前|对手/.test(report)) return '会围绕目标赛事、报名名单和关注选手整理赛前提醒。';
  if (/growth|parent/.test(source) || /成长|家庭|家长/.test(report)) return '会围绕关注孩子整理成长报告和近期比赛复盘。';
  if (/coach|club|recruiting|segmentation/.test(source) || /教练|剑馆|俱乐部|招生|学员/.test(report)) return '会围绕学员分层、优势项目和招生素材整理报告。';
  if (row.type === 'membership-interest') return '会确认关注选手、赛事提醒和报告保存需求。';
  return '会结合你关注的选手、赛事和报告记录确认试用场景。';
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
  return ['目标对象确认', '样例报告整理', '提醒范围'];
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

function athleteDataRequestTypeLabel(type) {
  if (type === 'claim-athlete') return '档案认领';
  if (type === 'hide') return '隐藏申请';
  return '纠错合并';
}

function athleteDataRequestNextStep(row = {}) {
  if (row.type === 'claim-athlete') return '提交后会核验关系，确认后可围绕该选手查看成长报告和提醒。';
  if (row.type === 'hide') return '提交后会核验身份和监护关系，再确认公开展示设置。';
  return '提交后会核对赛事、俱乐部和同名记录，确认后再修正或合并。';
}

function athleteDataRequestRows() {
  return (state.athleteDataRequests || []).slice(0, 4).map((row) => ({
    ...row,
    typeLabel: athleteDataRequestTypeLabel(row.type),
    timeLabel: formatDataGeneratedAt(row.submittedAt),
    referenceLabel: row.feedbackId ? `申请编号 ${String(row.feedbackId).slice(-8)}` : '已保存',
    nextStep: athleteDataRequestNextStep(row),
  }));
}

function trackAthleteDataRequest(athlete, requestType, details = {}, result = {}) {
  const key = `${requestType}:${athlete.id || athlete.name || 'athlete'}`;
  state.athleteDataRequests = [
    {
      key,
      type: requestType,
      athleteId: athlete.id || '',
      athleteName: athlete.name || '选手',
      club: athlete.club || '',
      note: details.note || '',
      feedbackId: result.id || '',
      submittedAt: Date.now(),
    },
    ...(state.athleteDataRequests || []).filter((row) => row.key !== key),
  ].slice(0, 10);
  saveStoredList(ATHLETE_DATA_REQUEST_KEY, state.athleteDataRequests, 10);
}

function renderAthleteDataRequestStatus(rows = athleteDataRequestRows()) {
  if (!rows.length) return '';
  return `
    <section class="panel my-section athlete-data-progress-panel">
      <div class="section-title">
        <h2>档案请求</h2>
        <span>认领与纠错</span>
      </div>
      <div class="athlete-data-progress-list">
        ${rows.map((row) => `
          <article class="athlete-data-progress-card">
            <div>
              <strong>${escapeHtml(row.athleteName)}</strong>
              <span>${escapeHtml(row.typeLabel)} · ${escapeHtml(row.club || '俱乐部待确认')}</span>
            </div>
            <em>${escapeHtml(row.timeLabel || '刚刚提交')}</em>
            <small>${escapeHtml(row.referenceLabel)}</small>
            <p>${escapeHtml(row.nextStep)}</p>
            <button type="button" data-athlete-data-progress-athlete-id="${escapeHtml(row.athleteId || '')}">查看选手档案</button>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderCommercialIntentStatus(rows = commercialIntentRows()) {
  if (!rows.length) return '';
  return `
    <section class="panel my-section service-progress-panel">
      <div class="section-title">
        <h2>服务沟通</h2>
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
  return `已提交的申请会结合你的${followCopy.countLabel}、赛事和报告记录处理；需要更新联系方式时，可以再次提交。`;
}

function bindServiceProgressActions(container) {
  container.querySelectorAll('[data-service-progress-action]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const context = {
        source: button.dataset.serviceProgressSource || 'service-progress',
        report: button.dataset.reportTitle || '服务申请',
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
      title: '赛前提醒',
      status: prematch ? '可查看' : '先选赛事',
      tone: prematch ? 'ready' : 'pending',
      detail: prematch
        ? `${prematch.sportName} 可先看项目、报名和强手线索。`
        : `${activeCount} 场近期/报名赛事会优先进入赛前服务。`,
      meta: `${rosterCount} 场已有报名名单`,
      action: prematch ? 'prematch' : 'ask',
      sportCode: prematch?.sportCode || '',
      query: '近期哪些比赛适合做赛前提醒',
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
      title: '历史报告',
      status: savedCount ? '可回看' : '暂无记录',
      tone: savedCount ? 'ready' : 'pending',
      detail: savedCount
        ? '已有报告和问答记录，可继续追问、复看和申请试用。'
        : '生成报告或提问后，可以在这里回看。',
      meta: `${savedCount} 条保存记录`,
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
      title: '赛前提醒服务',
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
      ? '把已经生成的报告和问答保存下来，之后可以持续回看。'
        : '先从一次赛前提醒、成长报告或教练报告开始。',
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
      title: '赛前提醒',
      status: prematch ? '已准备好' : '先选择赛事',
      tone: prematch ? 'ready' : 'pending',
      detail: prematch
        ? `${prematch.sportName} 已可生成赛前项目、报名名单和强手线索。`
        : `${activeCount} 场赛前/报名赛事可作为备选，先选择目标赛事。`,
      next: prematch
        ? `先查看本场提醒，再订阅报名和重点对手更新。`
        : `已有 ${rosterCount} 场赛事带报名数据，可先从近期赛事开始。`,
      action: prematch ? 'prematch' : 'ask',
      sportCode: prematch?.sportCode || '',
      query: '近期哪些比赛适合做赛前提醒',
    },
    {
      key: 'growth',
      label: '成长',
      title: '家庭成长报告',
      status: child ? '已准备好' : '先关注孩子',
      tone: child ? 'ready' : 'pending',
      detail: child
        ? `${child.name} 已可生成成长复盘、名次变化和下一场建议。`
        : '关注孩子后，成长报告会围绕他的比赛记录和目标赛事生成。',
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
      status: club?.id ? '已准备好' : '先选择俱乐部',
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
      title: '报告记录',
      status: reportCount ? '可回看' : '暂无记录',
      tone: reportCount ? 'ready' : 'pending',
      detail: reportCount
        ? `已有 ${reportCount} 条报告/问答记录，可继续复看和追问。`
        : '生成赛前提醒、成长报告或教练报告后，可以在这里复看。',
      next: reportCount
        ? '优先把高频报告订阅成提醒，减少重复搜索。'
        : '先完成一份赛前、成长或教练报告，形成第一条记录。',
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
      heroReady: '关注学员会用于训练分析',
      heroEmpty: '关注学员后可获得训练分析',
      heroDetail: '首页会优先展示关注学员的成长变化、赛前提醒和训练反馈。',
      emptyTitle: '还没有关注学员',
      emptyDetail: '进入选手详情页后，可把重点学员加入这里，用于成长报告、赛前提醒和训练反馈。',
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
      heroReady: '代表选手会用于经营分析',
      heroEmpty: '关注代表选手后可获得经营分析',
      heroDetail: '首页会优先展示代表选手、优势项目和剑馆经营分析。',
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
      heroReady: '关注对象会用于数据筛选',
      heroEmpty: '可从详情页添加关注对象',
      heroDetail: '首页会优先展示常看的选手、赛事和俱乐部入口。',
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
    heroReady: '关注孩子会用于成长分析',
    heroEmpty: '关注孩子后可获得成长分析',
    heroDetail: '首页会优先展示孩子的成长变化、赛前提醒和近期比赛。',
    emptyTitle: '还没有关注选手',
    emptyDetail: '进入选手详情页后，可把孩子加入这里，用于成长报告和赛前提醒。',
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
          <button type="button" data-home-prematch="${escapeHtml(row.sportCode)}">赛前提醒</button>
          ${row.isFollowed ? '' : `<button type="button" data-home-prematch-follow="${escapeHtml(row.sportCode)}">加入提醒</button>`}
        </div>
      </article>
    </section>
  `;
}

function homeCoachActionRow() {
  if (!['coach', 'club', 'data'].includes(state.userRole)) return null;
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
    detail: '围绕孩子成长报告、赛前提醒和重点对手提示，验证是否能支撑长期参赛决策。',
    source: 'home-pilot-parent',
    report: '家庭成长试用',
  };
}

function homeFocusItem() {
  const coach = homeCoachActionRow();
  const athlete = focusAthleteCards()[0] || null;
  if (athlete) {
    return {
      type: 'athlete',
      title: athlete.name || '关注选手',
      meta: athlete.summary || '',
      detail: athlete.detail || '',
      id: athlete.id || '',
    };
  }
  if (coach) {
    return {
      type: 'coach',
      title: coach.title || '剑馆经营重点',
      meta: coach.meta || '',
      detail: coach.detail || '',
      id: coach.id || '',
    };
  }
  return {
    type: 'follow',
    title: state.userRole === 'coach' ? '关注学员，生成梯队洞察' : '关注孩子，生成专属洞察',
    meta: '尚未选择关注对象',
    detail: '添加关注后，首页会优先展示成长变化、赛前提醒和可追溯分析。',
  };
}

function renderHomeFocusCard(row = homeFocusItem()) {
  const primaryAction = row.type === 'coach'
      ? `<button type="button" data-home-focus-coach="${escapeHtml(row.id)}">查看剑馆</button>`
      : row.type === 'athlete'
        ? `<button type="button" data-home-focus-athlete="${escapeHtml(row.id)}">查看画像</button>`
        : '<button type="button" data-home-compact-nav="my">添加关注</button>';
  const secondaryAction = '<button type="button" data-home-compact-nav="my">管理关注</button>';
  return `
    <section class="panel my-section home-focus-card">
      <div class="section-title">
        <h2>重点关注</h2>
        <span>近期动态</span>
      </div>
      <article>
        <strong>${escapeHtml(row.title)}</strong>
        <span>${escapeHtml(row.meta)}</span>
        <em>${escapeHtml(row.detail)}</em>
      </article>
      <div class="home-focus-actions">
        ${primaryAction}
        ${secondaryAction}
      </div>
    </section>
  `;
}

function renderHomeRadarCard(row = homePrematchActionRow(followedCompetitionCards())) {
  if (!row) return '';
  return `
    <section class="panel my-section home-radar-card">
      <div class="section-title">
        <h2>赛事雷达</h2>
        <span>${escapeHtml(row.isFollowed ? '已关注' : '推荐关注')}</span>
      </div>
      <article>
        <strong>${escapeHtml(row.sportName || '近期赛事')}</strong>
        <span>${escapeHtml(row.meta || '')}</span>
        <em>${escapeHtml(row.detail || '')}</em>
      </article>
      <div class="home-focus-actions">
        <button type="button" data-home-focus-competition="${escapeHtml(row.sportCode)}">赛事详情</button>
        <button type="button" data-home-focus-prematch="${escapeHtml(row.sportCode)}">赛前提醒</button>
        ${row.isFollowed ? '' : `<button type="button" data-home-focus-follow="${escapeHtml(row.sportCode)}">加入提醒</button>`}
      </div>
    </section>
  `;
}

function renderHomeRoleBar() {
  return `
    <section class="home-role-bar">
      <span>使用视角：${escapeHtml(roleLabel(state.userRole || 'parent'))}</span>
      <button type="button" data-home-role-switch>切换</button>
    </section>
  `;
}

function renderFocusedHomePage() {
  if (!homePage) return true;
  if (state.isDataLoading) return false;
  homePage.innerHTML = `
    <div class="home-dashboard home-dashboard-focused">
      ${renderHomeRoleBar()}
      ${renderAiWorkspace('home')}
      ${renderHomeFocusCard()}
      ${renderHomeRadarCard()}
    </div>
  `;
  homePage.querySelectorAll('[data-home-compact-nav]').forEach((button) => {
    button.addEventListener('click', () => navigateMain(button.dataset.homeCompactNav || 'home'));
  });
  homePage.querySelector('[data-home-focus-prematch]')?.addEventListener('click', (event) => {
    trackAnalyticsAction('home_prematch', 'open');
    openPrematchReport('prematch-pack', event.currentTarget.dataset.homeFocusPrematch || '');
  });
  homePage.querySelector('[data-home-focus-competition]')?.addEventListener('click', (event) => {
    openCompetition(event.currentTarget.dataset.homeFocusCompetition || '');
  });
  homePage.querySelector('[data-home-focus-athlete]')?.addEventListener('click', (event) => {
    openAthlete(event.currentTarget.dataset.homeFocusAthlete || '');
  });
  homePage.querySelector('[data-home-focus-follow]')?.addEventListener('click', (event) => {
    const competition = findCompetitionBySportCode(event.currentTarget.dataset.homeFocusFollow);
    if (!competition?.sportCode) return;
    trackAnalyticsAction('home_prematch', 'follow');
    upsertFollowedCompetition(competition);
  });
  homePage.querySelector('[data-home-focus-coach]')?.addEventListener('click', (event) => {
    trackAnalyticsAction('home_coach', 'segmentation');
    openCoachSegmentationReport(event.currentTarget.dataset.homeFocusCoach || '');
  });
  homePage.querySelector('[data-home-role-switch]')?.addEventListener('click', () => {
    state.userRole = '';
    localStorage.removeItem(ROLE_KEY);
    renderRoleWorkspacePremium();
    navigateTo('roleHome');
  });
  bindAiWorkspace(homePage);
  return true;
}

function renderHomePage() {
  if (renderFocusedHomePage()) return;
  if (!homePage) return;
  if (state.isDataLoading) {
    homePage.innerHTML = '<section class="panel"><div class="loading-row">正在加载数据</div></section>';
    return;
  }
  const children = focusAthleteCards();
  const followedCompetitions = followedCompetitionCards();
  const reportRows = roleVisibleHomeReportRows(homeReportCenterRows(children, followedCompetitions));
  const reportHistory = reportHistoryRows();
  const aiHistory = aiHistoryRows();
  const commercialIntents = commercialIntentRows();
  const savedAnalysisRows = [...aiHistory, ...reportHistory].slice(0, 3);
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
      ${savedAnalysisRows.length ? `
        <section class="panel my-section home-saved-section">
          <div class="section-title">
            <h2>最近分析</h2>
            <span>继续查看</span>
          </div>
          <div class="home-saved-list">
            ${savedAnalysisRows.map((row) => `
              <button type="button" ${row.query ? `data-ai-history-query="${escapeHtml(row.query)}"` : `data-report-history-type="${escapeHtml(row.type || '')}" data-report-history-id="${escapeHtml(row.id || '')}"`}>
                <span>${escapeHtml(row.typeLabel)}</span>
                <strong>${escapeHtml(row.title)}</strong>
              </button>
            `).join('')}
          </div>
        </section>
      ` : ''}
      <section class="panel my-section home-question-section">
        <div class="section-title">
          <h2>可以直接问</h2>
          <span>赛事问答</span>
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

function aiPromptPlaceholder(presets) {
  const examples = (presets || []).filter(Boolean).slice(0, 2);
  return `例如：${examples.join('\n例如：') || '2026年天津有几场比赛'}`;
}

function aiAcceptanceQueryCases() {
  return [
    { query: '哪场比赛人数最多？', expectedType: 'competition-stats' },
    { query: '2026年天津有几场比赛', expectedType: 'competition-stats' },
    { query: '天津近期报名情况', expectedType: 'prematch' },
    { query: '山东小众体育 U8 男花怎么样', expectedType: 'club' },
    { query: '蔡廷彧最近几场有没有进步', expectedType: 'growth' },
    { query: '分析马潇和陶嘉月的对战情况', expectedType: 'comparison' },
    { query: '看2025和2026年，U10花剑男子和女子，北京金石是不是比北京艾鲁特更好', expectedType: 'club-comparison' },
    { query: '这些击剑数据能产生什么商业价值', expectedType: 'business-insight' },
    { query: '生成赛前情报包', expectedType: 'product-template' },
    { query: '查看家长成长报告', expectedType: 'product-template' },
    { query: '生成教练学员分层报告', expectedType: 'product-template' },
    { query: '山东小众体育招生怎么讲', expectedType: 'club-recruiting' },
  ];
}

function renderAiWorkspace() {
  const presets = aiPromptPresets();
  const placeholder = aiPromptPlaceholder(presets);
  const activeQuery = state.aiActiveQuery || '';
  const answerHtml = state.isAiAnswerLoading
    ? renderAiLoadingState(activeQuery)
    : state.aiActiveReport
      ? renderAiAnswer(state.aiActiveReport)
      : `
        <div class="ai-empty">
          <strong>从问题开始</strong>
          <span>回答会给出结论、关键指标和证据来源，点击证据可回到对应赛事、选手或俱乐部。</span>
        </div>
      `;
  return `
    <div class="ai-workspace" id="aiWorkspace">
      <section class="panel ai-home-primary">
        <div class="ai-home-lead">
          <strong>问一句，生成可追溯分析</strong>
        </div>
        <form class="ai-query-form" id="aiQueryForm">
          <textarea id="aiQueryInput" rows="3" placeholder="${escapeHtml(placeholder)}">${escapeHtml(activeQuery)}</textarea>
          <button type="button" data-ai-submit="true">开始分析</button>
        </form>
        <div class="ai-preset-row" aria-label="推荐问题">
          ${presets.map((preset) => `<button type="button" data-ai-preset="${escapeHtml(preset)}">${escapeHtml(preset)}</button>`).join('')}
        </div>
      </section>
      <div class="ai-answer" id="aiAnswer">
        ${answerHtml}
      </div>
    </div>
  `;
}

function renderAiLoadingState(query = '') {
  const label = String(query || '').trim();
  return `
    <div class="ai-loading-card" role="status" aria-live="polite" aria-busy="true">
      <div class="ai-loading-head">
        <strong>正在分析</strong>
        <span>${escapeHtml(label || '正在理解问题')}</span>
      </div>
      <div class="ai-loading-progress" aria-hidden="true"><i></i></div>
      <div class="ai-loading-steps">
        <span>理解问题</span>
        <span>查找相关记录</span>
        <span>形成结论</span>
      </div>
      <div class="ai-skeleton-block">
        <i></i>
        <i></i>
        <i></i>
      </div>
      <div class="ai-skeleton-grid">
        <i></i>
        <i></i>
      </div>
    </div>
  `;
}

function waitForAiLoadingState(ms = AI_LOADING_MIN_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function bindAiWorkspace(container) {
  const form = container.querySelector('#aiQueryForm');
  const input = container.querySelector('#aiQueryInput');
  const answer = container.querySelector('#aiAnswer');
  const submitButton = form?.querySelector('button[data-ai-submit="true"]') || form?.querySelector('button[type="submit"]');
  if (!form || !input || !answer) return;
  if (submitButton) {
    submitButton.textContent = '开始分析';
    submitButton.dataset.aiSubmit = 'true';
  }

  const bindAnswer = (report, target = answer) => {
    const card = target.querySelector('.ai-answer-card');
    if (card) card.__aiReport = report;
    bindAiAnswerActions(target);
    target.querySelectorAll('[data-ai-follow-up]').forEach((button) => {
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
      state.aiActiveQuery = '';
      state.aiActiveReport = null;
      state.isAiAnswerLoading = false;
      answer.classList.add('has-answer');
      answer.innerHTML = renderAiAnswer(report);
      bindAnswer(report);
      return;
    }

    answer.classList.add('has-answer');
    answer.setAttribute('aria-busy', 'true');
    form.classList.add('is-submitting');
    state.aiActiveQuery = normalizedQuery;
    state.aiActiveReport = null;
    state.isAiAnswerLoading = true;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = '分析中...';
    }
    answer.innerHTML = renderAiLoadingState(normalizedQuery);
    scrollToResultPanel(answer, 'auto');
    try {
      const [contextResult] = await Promise.allSettled([
        ensureAiEntityContext(normalizedQuery),
        waitForAiLoadingState(),
      ]);
      if (contextResult.status === 'rejected') throw contextResult.reason;
      const report = buildAiAnswer(normalizedQuery);
      report.query = normalizedQuery;
      state.aiActiveReport = report;
      state.isAiAnswerLoading = false;
      trackAnalyticsAction('ai_answer', report.type || 'unknown');
      trackAiAnalysisHistory(normalizedQuery, report);
      const currentAnswer = document.querySelector('#aiAnswer') || answer;
      currentAnswer.classList.add('has-answer');
      currentAnswer.setAttribute('aria-busy', 'false');
      currentAnswer.innerHTML = renderAiAnswer(report);
      bindAnswer(report, currentAnswer);
      scrollToResultPanel(currentAnswer);
      enhanceAiAnswer(report, currentAnswer, bindAnswer);
    } catch {
      const report = buildAiAnswer(normalizedQuery);
      report.query = normalizedQuery;
      state.aiActiveReport = report;
      state.isAiAnswerLoading = false;
      trackAnalyticsAction('ai_answer', report.type || 'unknown');
      trackAiAnalysisHistory(normalizedQuery, report);
      const currentAnswer = document.querySelector('#aiAnswer') || answer;
      currentAnswer.classList.add('has-answer');
      currentAnswer.setAttribute('aria-busy', 'false');
      currentAnswer.innerHTML = renderAiAnswer(report);
      bindAnswer(report, currentAnswer);
      scrollToResultPanel(currentAnswer);
      enhanceAiAnswer(report, currentAnswer, bindAnswer);
    } finally {
      answer.setAttribute('aria-busy', 'false');
      form.classList.remove('is-submitting');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = '开始分析';
      }
    }
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    run(input.value);
  });
  submitButton?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    run(input.value);
  });
  form.__runAiQuery = run;
  form.dataset.aiBound = 'true';
  if (state.aiActiveReport) bindAnswer(state.aiActiveReport);

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
  if (typeof form.__runAiQuery === 'function') {
    form.__runAiQuery(text);
    return;
  }
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', (event) => {
    const button = event.target?.closest?.('button[data-ai-submit="true"]');
    if (!button) return;
    const form = button.closest('#aiQueryForm');
    const input = form?.querySelector('#aiQueryInput');
    if (!form || !input) return;
    event.preventDefault();
    const query = input.value;
    if (typeof form.__runAiQuery === 'function') {
      form.__runAiQuery(query);
    } else {
      submitAiQuery(query);
    }
  });
}

const AI_ENHANCEMENT_BLOCKLIST = [
  /[\u5206\u6790]\u53e3\u5f84/,
  /\u5224\u65ad\u8def\u5f84/,
  /\u5224\u65ad\u4f9d\u636e/,
  /\u6570\u636e\u8fb9\u754c/,
  /\u5185\u90e8\u89c4\u5219/,
  /\u540e\u7eed/,
  /\u9884\u7559/,
  /\u7b2c\u4e00\u9636\u6bb5/,
  /AI\s*\u589e\u5f3a/i,
  /\u589e\u5f3a\u89e3\u8bfb/,
  /implementation|internal|debug|pipeline|fallback|rollout/i,
];

function cleanAiEnhancementText(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return AI_ENHANCEMENT_BLOCKLIST.some((pattern) => pattern.test(text)) ? '' : text;
}

function sanitizeAiEnhancement(enhancement = {}) {
  if (!enhancement || typeof enhancement !== 'object') return null;
  const headline = cleanAiEnhancementText(enhancement.headline);
  const explanation = cleanAiEnhancementText(enhancement.explanation);
  const takeaways = (Array.isArray(enhancement.takeaways) ? enhancement.takeaways : [])
    .map(cleanAiEnhancementText)
    .filter(Boolean)
    .slice(0, 4);
  const caveats = (Array.isArray(enhancement.caveats) ? enhancement.caveats : [])
    .map(cleanAiEnhancementText)
    .filter(Boolean)
    .slice(0, 2);
  if (!headline && !explanation && !takeaways.length && !caveats.length) return null;
  return {
    headline: headline || '\u8865\u5145\u89e3\u8bfb',
    explanation,
    takeaways,
    caveats,
  };
}

function aiEnhancementRequestPayload(report = {}) {
  const visibleSections = (report.sections || []).filter(isUserFacingAiSection);
  return {
    type: report.type || '',
    title: report.title || '',
    summary: report.summary || '',
    query: report.query || '',
    cards: (report.cards || []).slice(0, 8),
    sections: visibleSections.slice(0, 6).map((section) => ({
      title: section.title || '',
      rows: (section.rows || []).slice(0, 6),
    })),
    evidence: (report.evidence || []).slice(0, 8).map((row) => ({
      kind: row.kind || '',
      label: row.label || '',
      detail: row.detail || '',
    })),
  };
}

function reportCanUseAiEnhancement(report = {}) {
  return !['empty', 'fallback'].includes(report.type || '') && Boolean(report.summary || report.sections?.length || report.evidence?.length);
}

async function requestAiEnhancement(report = {}) {
  if (!reportCanUseAiEnhancement(report)) return null;
  const response = await fetch('/api/ai/enhance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report: aiEnhancementRequestPayload(report) }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok || !result.enhanced || !result.enhancement) return null;
  return result.enhancement;
}

function sameAiReport(left = {}, right = {}) {
  return (left.query || '') === (right.query || '') && (left.type || '') === (right.type || '') && (left.title || '') === (right.title || '');
}

async function enhanceAiAnswer(report, answer, bindAnswer) {
  if (!reportCanUseAiEnhancement(report)) return;
  try {
    const enhancement = sanitizeAiEnhancement(await requestAiEnhancement(report));
    if (!enhancement) return;
    const currentReport = answer.querySelector('.ai-answer-card')?.__aiReport;
    if (!sameAiReport(currentReport || report, report)) return;
    const enhancedReport = { ...report, enhancement };
    answer.innerHTML = renderAiAnswer(enhancedReport);
    bindAnswer(enhancedReport);
  } catch {
    // Enhancement is optional; the deterministic answer remains the source of truth.
  }
}

function aiAnalyzeActionRow(actions = []) {
  const rows = actions.filter((action) => action?.query && action?.label);
  if (!rows.length) return '';
  return `
    <div class="detail-ai-actions" aria-label="相关分析">
      ${rows.map((action) => `
        <button type="button" data-ai-analyze-query="${escapeHtml(action.query)}">
          ${escapeHtml(action.label)}
        </button>
      `).join('')}
    </div>
  `;
}

function bindAiAnalyzeActions(container) {
  container?.querySelectorAll('[data-ai-analyze-query]').forEach((button) => {
    button.addEventListener('click', () => submitAiQuery(button.dataset.aiAnalyzeQuery || ''));
  });
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

function detectClubsInQuery(query) {
  const normalizedQuery = compactText(query);
  return uniqueBy((state.clubSearchIndex || [])
    .filter((club) => compactText(club.club) && normalizedQuery.includes(compactText(club.club)))
    .sort((a, b) => compactText(b.club).length - compactText(a.club).length || (b.entrants || 0) - (a.entrants || 0)),
  (club) => club.id || compactText(club.club)).slice(0, 3);
}

function detectCompetitionInQuery(query) {
  const normalizedQuery = compactText(query);
  if (normalizedQuery.length < 5) return null;
  if (/(\u51e0\u573a|\u591a\u5c11\u573a|\u4eba\u6570\u6700\u591a|\u62a5\u540d\u60c5\u51b5|\u8fd1\u671f|\u8d5b\u524d\u60c5\u62a5|\u7edf\u8ba1|\u5bf9\u6bd4|\u600e\u4e48\u6837|\u5982\u4f55)/.test(normalizedQuery)) return null;

  const queryYear = detectYearInQuery(normalizedQuery);
  const rows = (state.competitions || [])
    .map((competition) => {
      const name = compactText(competition.sportName);
      const haystack = compactText(cachedCompetitionSearchHaystack(competition));
      const aliases = competitionNameAliasTerms(competition);
      if (!name) return null;
      if (queryYear && competitionYear(competition) && competitionYear(competition) !== queryYear) return null;

      let score = 0;
      if (name === normalizedQuery) score += 100;
      if (name.includes(normalizedQuery)) score += 80;
      if (normalizedQuery.includes(name)) score += 70;
      if (!score && aliases.some((alias) => alias === normalizedQuery)) score += 95;
      if (!score && aliases.some((alias) => alias.includes(normalizedQuery))) score += 75;
      if (!score && aliases.some((alias) => normalizedQuery.includes(alias) && alias.length >= 4)) score += 65;
      if (!score && haystack.includes(normalizedQuery)) score += 45;
      if (!score) return null;
      score += Math.min(20, normalizedQuery.length);
      score += competitionHasItems(competition) ? 5 : 0;
      return { competition, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || String(b.competition.dateLabel || '').localeCompare(String(a.competition.dateLabel || ''), 'zh-CN'));

  return rows[0]?.competition || null;
}

function detectCompetitionLikeQuery(query) {
  const normalized = compactText(query);
  if (!normalized) return null;
  if (!/(比赛|赛事|公开赛|联赛|冠军赛|锦标赛|杯|站)/.test(normalized)) return null;
  if (detectCompetitionStatsQuery(query) || detectCompetitionRankingQuery(query) || detectPreMatchQuery(query)) return null;
  return {
    year: detectYearInQuery(query) || '',
    month: detectMonthInQuery(query) || '',
    region: detectRegionInQuery(query) || '',
    status: detectStatusInQuery(query) || '',
  };
}

function competitionNameMatchKey(value) {
  return compactText(value)
    .replace(/20\d{2}年?/g, '')
    .replace(/第[一二三四五六七八九十\d]+站/g, '第一站')
    .replace(/[“”"']/g, '');
}

function relatedCompetitionsForQuery(query) {
  const queryAliases = [query, withoutYearAlias(query), chineseAdminAlias(query), chineseAdminAlias(withoutYearAlias(query))]
    .map(compactText)
    .filter((key) => key.length >= 4);
  const key = competitionNameMatchKey(query);
  if (key.length >= 4) queryAliases.push(key);
  const keys = [...new Set(queryAliases)];
  if (!keys.length) return [];
  return (state.competitions || [])
    .filter((competition) => {
      const nameKey = competitionNameMatchKey(competition.sportName);
      const aliases = [
        nameKey,
        ...competitionNameAliasTerms(competition),
      ].filter((alias) => alias.length >= 4 && !/^20\d{2}$/.test(alias));
      if (!aliases.length) return false;
      return keys.some((queryKey) => aliases.some((alias) => alias.includes(queryKey) || queryKey.includes(alias)));
    })
    .sort((a, b) => String(b.dateLabel || b.startDate || b.season || '').localeCompare(String(a.dateLabel || a.startDate || a.season || ''), 'zh-CN'))
    .slice(0, 3);
}

function competitionMissingDiagnosisRows(query, competitionLike, relatedCompetitions = []) {
  const rows = [];
  const nameKey = competitionNameMatchKey(query);
  const scope = [
    competitionLike.year ? `${competitionLike.year}年` : '',
    competitionLike.region || '',
    competitionLike.month ? `${competitionLike.month}月` : '',
  ].filter(Boolean).join('、');
  rows.push(scope ? `先核对${scope}范围内是否有同名或近似名称赛事。` : '先核对赛事全名、举办城市和比赛年份。');
  if (relatedCompetitions.length) {
    rows.push(`找到 ${relatedCompetitions.length} 场名称相近赛事，可以先打开最近的一场确认。`);
  } else if (nameKey.includes('联赛') || nameKey.includes('第一站')) {
    rows.push('如果这是地方联赛或分站赛，可能需要用主办方名称、城市或完整赛事名再搜一次。');
  } else {
    rows.push('如果赛事来自其他平台，建议用城市、日期或主办方名称缩小范围。');
  }
  rows.push('仍然找不到时，可把赛事名称和截图留存；补充完成后就能直接查看。');
  return rows.slice(0, 3);
}

function aiFallbackCandidateTerms(query) {
  const terms = aiEntityCandidateTerms(query);
  const compact = compactText(query);
  if (compact.length >= 2 && !terms.includes(compact)) terms.push(compact);
  return terms.filter((term) => term.length >= 2).slice(0, 10);
}

function fallbackMatchScore(text, terms) {
  const haystack = compactText(text);
  if (!haystack) return 0;
  return terms.reduce((score, term) => {
    const needle = compactText(term);
    if (!needle) return score;
    if (haystack === needle) return score + 80 + needle.length;
    if (haystack.includes(needle)) return score + 40 + needle.length;
    if (needle.includes(haystack) && haystack.length >= 2) return score + 20 + haystack.length;
    return score;
  }, 0);
}

function aiFallbackCandidates(query) {
  const terms = aiFallbackCandidateTerms(query);
  if (!terms.length) return { athletes: [], clubs: [], competitions: [] };
  const athletes = uniqueBy((state.athleteSearchIndex || [])
    .map((athlete) => {
      const score = (fallbackMatchScore(athlete.name, terms) * 2)
        + (fallbackMatchScore(athlete.club, terms) * 0.6)
        + (fallbackMatchScore(athlete.searchText, terms) * 0.2);
      return score ? { athlete, score: score + Math.min(20, athlete.appearances || 0) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || (b.athlete.appearances || 0) - (a.athlete.appearances || 0))
    .map((row) => row.athlete), (athlete) => athlete.id || `${athlete.name}__${athlete.club || ''}`)
    .slice(0, 2);
  const clubs = uniqueBy((state.clubSearchIndex || [])
    .map((club) => {
      const score = (fallbackMatchScore(club.club, terms) * 2)
        + (fallbackMatchScore(club.searchText, terms) * 0.4);
      return score ? { club, score: score + Math.min(20, club.entrants || 0) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || (b.club.entrants || 0) - (a.club.entrants || 0))
    .map((row) => row.club), (club) => club.id || compactText(club.club))
    .slice(0, 2);
  const competitions = uniqueBy((state.competitions || [])
    .map((competition) => {
      const score = fallbackMatchScore(cachedCompetitionSearchHaystack(competition), terms);
      return score ? { competition, score: score + (competitionHasItems(competition) ? 5 : 0) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || String(b.competition.dateLabel || '').localeCompare(String(a.competition.dateLabel || ''), 'zh-CN'))
    .map((row) => row.competition), (competition) => competition.sportCode || competition.sportId || competition.sportName)
    .slice(0, 3);
  return { athletes, clubs, competitions };
}

function detectClubComparisonQuery(query) {
  const normalized = compactText(query);
  if (!/(对比|比较|比|更好|谁强|谁更强|领先|差距|优势)/.test(normalized)) return null;
  const clubs = detectClubsInQuery(query);
  if (clubs.length < 2) return null;
  return {
    clubs: clubs.slice(0, 2),
    filters: aiClubComparisonFilters(query),
  };
}

function detectCapabilityGuideQuery(query) {
  const normalized = compactText(query);
  return /(\u4ea7\u54c1\u80fd\u505a\u4ec0\u4e48|\u80fd\u505a\u4ec0\u4e48|\u53ef\u4ee5\u95ee\u4ec0\u4e48|\u80fd\u95ee\u4ec0\u4e48|\u600e\u4e48\u7528|\u5982\u4f55\u4f7f\u7528|\u529f\u80fd|\u5e2e\u52a9|\u65b0\u7528\u6237)/.test(normalized);
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

  const competition = detectCompetitionInQuery(text);
  if (competition) return buildAiCompetitionLookupReport(text, competition);

  const exactAthletes = detectExactAthletesInQuery(normalizeAiName(text));
  if (exactAthletes.length >= 2) return buildAiAthleteComparison(text, exactAthletes[0], exactAthletes[1]);
  if (exactAthletes.length === 1) return buildAiAthleteGrowth(text, exactAthletes[0]);

  const productTemplate = detectProductTemplateQuery(text);
  if (productTemplate) return buildAiProductTemplateReport(text, productTemplate);

  const preMatchQuery = detectPreMatchQuery(text);
  if (preMatchQuery) return buildAiPreMatchReport(text, preMatchQuery);

  const competitionRankingQuery = detectCompetitionRankingQuery(text);
  if (competitionRankingQuery) return buildAiCompetitionRanking(text, competitionRankingQuery);

  const competitionQuery = detectCompetitionStatsQuery(text);
  if (competitionQuery) return buildAiCompetitionStats(text, competitionQuery);

  if (detectBusinessInsightQuery(text)) return buildAiBusinessInsightReport(text);

  if (detectCapabilityGuideQuery(text)) return buildAiCapabilityGuideReport(text);

  const clubComparison = detectClubComparisonQuery(text);
  if (clubComparison) return buildAiClubComparisonReport(text, clubComparison.clubs[0], clubComparison.clubs[1], clubComparison.filters);

  const club = detectClubInQuery(text);
  if (club && detectClubRecruitingQuery(text)) return buildAiClubRecruitingReport(text, club);
  if (club) return buildAiClubReport(text, club);

  const athletes = detectAthletesInQuery(text);
  if (athletes.length >= 2) return buildAiAthleteComparison(text, athletes[0], athletes[1]);
  if (athletes.length === 1) return buildAiAthleteGrowth(text, athletes[0]);

  return buildAiFallbackReport(text);
}

function buildAiCapabilityGuideReport(query) {
  const entityCounts = entityCoverageCounts();
  const activeCount = (state.competitions || []).filter((competition) => ['registration', 'upcoming', 'live'].includes(competition.status) || competition.isPreEvent).length;
  const focused = aiFocusedAthletes();
  const club = state.currentClub || aiDefaultClub();
  const sampleAthlete = focused[0] || (state.athleteSearchIndex || []).find((athlete) => athlete?.events?.length);
  const sampleClub = club || (state.clubSearchIndex || []).find((row) => row?.club);
  const growthQuery = sampleAthlete?.name ? `${sampleAthlete.name}最近有没有进步` : '蔡廷彧最近有没有进步';
  const clubQuery = sampleClub?.club ? `${sampleClub.club} U8 男花怎么样` : '山东小众体育 U8 男花怎么样';

  return {
    type: 'capability-guide',
    title: '可以直接问这些问题',
    summary: 'FencingAI 会把公开赛事数据整理成结论、关键数字和可打开的来源，适合先做判断，再进入详情核对。',
    cards: [
      ['赛事', `${state.competitions.length} 场`],
      ['选手', `${entityCounts.athletes} 个画像`],
      ['俱乐部', `${entityCounts.clubs} 个`],
      ['赛前', `${activeCount} 场可关注`],
    ],
    sections: [
      {
        title: '常用问题',
        rows: [
          '查赛事：某年某地有几场比赛，哪场比赛人数最多。',
          '看成长：某个选手最近表现、年度对比和关键比赛。',
          '做对比：两个选手或两个俱乐部在指定项目里的差异。',
        ],
      },
      {
        title: '适合场景',
        rows: [
          '家长可以看孩子成长和下一场比赛准备。',
          '教练可以看学员分层、优势项目和赛前重点。',
          '俱乐部可以整理成绩资产和对外展示素材。',
        ],
      },
    ],
    evidence: [
      {
        kind: '赛事数据',
        label: '赛事库',
        detail: `${state.competitions.length} 场赛事记录`,
        reason: '用于回答赛事数量、地区、状态和规模问题',
      },
      sampleAthlete?.id ? {
        kind: '选手画像',
        label: sampleAthlete.name,
        detail: `${sampleAthlete.club || '个人'} · ${sampleAthlete.appearances || 0} 次记录`,
        reason: '用于回答成长、对比和赛前准备问题',
        athleteId: sampleAthlete.id,
      } : null,
      sampleClub?.id ? {
        kind: '俱乐部画像',
        label: sampleClub.club,
        detail: `${sampleClub.entrants || 0} 人次 · 前八 ${sampleClub.top8 || 0}`,
        reason: '用于回答俱乐部表现、对比和招生展示问题',
        clubId: sampleClub.id,
      } : null,
    ].filter(Boolean),
    actions: [
      { label: '问赛事统计', query: '2026年天津有几场比赛' },
      { label: '看选手成长', query: growthQuery },
      { label: '看俱乐部表现', query: clubQuery },
    ],
  };
}

function aiFallbackRewriteActions(query = '', candidates = {}) {
  const limit = 3;
  const firstAthlete = candidates.athletes?.[0];
  const secondAthlete = candidates.athletes?.[1];
  const firstClub = candidates.clubs?.[0];
  const secondClub = candidates.clubs?.[1];
  const firstCompetition = candidates.competitions?.[0];
  const actions = [];

  if (firstAthlete?.name) {
    actions.push({ label: `分析${firstAthlete.name}`, query: `分析${firstAthlete.name}最近有没有进步` });
  }
  if (firstAthlete?.name && secondAthlete?.name) {
    actions.push({ label: `${firstAthlete.name} vs ${secondAthlete.name}`, query: `分析${firstAthlete.name}和${secondAthlete.name}的对比情况` });
  }
  if (firstClub?.club) {
    actions.push({ label: `分析${firstClub.club}`, query: `${firstClub.club} U8 男花怎么样` });
  }
  if (firstClub?.club && secondClub?.club) {
    actions.push({ label: `${firstClub.club} vs ${secondClub.club}`, query: `${firstClub.club}和${secondClub.club}谁更强` });
  }
  if (firstCompetition?.sportName) {
    actions.push({ label: '分析这场比赛', query: `${firstCompetition.sportName}有哪些重点信息` });
  }

  return [
    ...actions,
    { label: '问天津近期报名', query: '天津近期报名情况' },
    { label: '问赛事数量', query: '2026年天津有几场比赛' },
    { label: '问数据价值', query: '这些击剑数据能产生什么商业价值' },
  ].slice(0, limit);
}

function aiFallbackClarificationRows(query = '') {
  const normalized = compactText(query);
  const rows = [];
  if (/(对比|比较|谁更强|谁更好|vs|VS)/i.test(query)) {
    rows.push('对比两名选手或两家俱乐部时，写清双方名称、年份、年龄段、剑种和性别。');
  }
  if (/(比赛|赛事|联赛|公开赛|冠军赛|锦标赛|有几场|多少场|人数最多)/.test(normalized)) {
    rows.push('查赛事时，写清年份、地区或完整赛事名，例如“2026年天津有几场比赛”。');
  }
  if (/(报名|赛前|马上|近期|未开赛|未开始|待开赛)/.test(normalized)) {
    rows.push('看赛前信息时，写清目标地区或赛事名；有关注选手后，会优先显示相关项目。');
  }
  if (/(孩子|小孩|家长|继续|投入|值不值得|成长|训练|进步)/.test(normalized)) {
    rows.push('看成长时，先写出选手姓名，或在选手详情里把孩子加入关注。');
  }
  if (/(教练|学员|剑馆|俱乐部|招生|续费|训练反馈|怎么讲)/.test(normalized)) {
    rows.push('看教练或剑馆场景时，写清俱乐部名称和项目范围，例如“山东小众体育 U8 男花怎么样”。');
  }
  return uniqueBy(rows.length ? rows : [
    '可以直接输入选手姓名、俱乐部名称或赛事名称。',
    '需要统计时，补充年份、地区、年龄段、剑种或性别。',
  ], (row) => row).slice(0, 3);
}

function buildAiFallbackReport(query) {
  const text = String(query || '').trim();
  const entityCounts = entityCoverageCounts();
  const normalized = compactText(text);
  const childIntent = /(孩子|小孩|家长|继续|投入|值不值得|成长|训练)/.test(normalized);
  if (childIntent) {
    return {
      type: 'fallback',
      title: '先确定关注对象',
      summary: '请先选择孩子或输入选手姓名，再查看他的参赛记录、近期变化和同组表现。',
      cards: [
        ['可看内容', '成长报告'],
        ['需要补充', '选手姓名'],
        ['可问画像', `${entityCounts.athletes} 个`],
      ],
      sections: [
        {
          title: '补充方式',
          rows: aiFallbackClarificationRows(text),
        },
      ],
      actions: [
        ...aiFallbackRewriteActions(text),
        { label: '管理关注对象', mainTab: 'my' },
      ],
      evidence: [],
    };
  }

  const competitionLike = detectCompetitionLikeQuery(text);
  if (competitionLike) {
    const relatedCompetitions = relatedCompetitionsForQuery(text);
    const relatedTitle = relatedCompetitions[0]?.sportName || '';
    const diagnosisRows = competitionMissingDiagnosisRows(text, competitionLike, relatedCompetitions);
    const title = competitionLike.year ? `没有找到${competitionLike.year}年同名赛事` : '没有找到这场赛事';
    const summary = competitionLike.year
      ? `可以先查看${competitionLike.region || '相关地区'}赛事，或打开相近赛事确认是否是你要找的比赛。`
      : '可以先查看同地区或同类型赛事，确认是否是你要找的比赛。';
    const cards = [
      competitionLike.year ? ['年份', competitionLike.year] : null,
      competitionLike.region ? ['地区', competitionLike.region] : null,
      competitionLike.month ? ['月份', `${competitionLike.month}月`] : null,
      relatedCompetitions.length ? ['相近赛事', `${relatedCompetitions.length} 场`] : null,
      relatedTitle ? ['最近相近', displayDateLabel(relatedCompetitions[0].dateLabel || relatedCompetitions[0].startDate || relatedCompetitions[0].season || '')] : null,
      ['可查赛事', `${state.competitions.length} 场`],
    ].filter(Boolean);
    return {
      type: 'fallback',
      title,
      summary,
      cards,
      sections: [
        {
          title: '可以这样核对',
          rows: diagnosisRows,
        },
      ],
      actions: [
        { label: '查看相关赛事', mainTab: 'competitions', filters: competitionLike },
        relatedCompetitions[0]?.sportCode ? { label: '查看相近赛事', sportCode: relatedCompetitions[0].sportCode } : null,
        { label: '统计同地区赛事', query: `${competitionLike.year || '2026'}年${competitionLike.region || ''}有几场比赛` },
      ].filter(Boolean),
      evidence: relatedCompetitions.map((competition) => ({
        kind: '相近赛事',
        label: competition.sportName || displayEventName(competition),
        detail: [displayDateLabel(competition.dateLabel || competition.startDate || competition.season || ''), competition.venue || competition.region || '', statusLabel(competition.status)].filter(Boolean).join(' / '),
        sportCode: competition.sportCode,
      })),
    };
  }

  const candidates = aiFallbackCandidates(text);
  const candidateTerms = aiFallbackCandidateTerms(text);
  const preferClub = candidates.clubs.some((club) => fallbackMatchScore(club.club, candidateTerms) >= 40);
  const athleteEvidence = candidates.athletes.map((athlete) => ({
      kind: '相近选手',
      label: athlete.name,
      detail: `${athlete.club || '个人'} · ${athlete.appearances || 0} 次记录`,
      athleteId: athlete.id,
      eventCode: athlete.firstEventCode,
    }));
  const clubEvidence = candidates.clubs.map((club) => ({
      kind: '相近俱乐部',
      label: club.club,
      detail: `参赛 ${club.entrants || 0} 人次 · 前八 ${club.top8 || 0}`,
      clubId: club.id,
    }));
  const competitionEvidence = candidates.competitions.map((competition) => ({
      kind: '相近赛事',
      label: competition.sportName,
      detail: [displayDateLabel(competition.dateLabel), competition.venue || competition.region || '', statusLabel(competition.status)].filter(Boolean).join(' · '),
      sportCode: competition.sportCode,
    }));
  const candidateEvidence = [
    ...(preferClub ? clubEvidence : athleteEvidence),
    ...(preferClub ? athleteEvidence : clubEvidence),
    ...competitionEvidence,
  ].slice(0, 5);
  if (candidateEvidence.length) {
    const firstAthlete = candidates.athletes[0];
    const firstClub = candidates.clubs[0];
    const firstCompetition = candidates.competitions[0];
    const primaryActions = preferClub
      ? [
          firstClub?.id ? { label: `看${firstClub.club}`, clubId: firstClub.id } : null,
          firstAthlete?.id ? { label: `看${firstAthlete.name}`, athleteId: firstAthlete.id } : null,
        ]
      : [
          firstAthlete?.id ? { label: `看${firstAthlete.name}`, athleteId: firstAthlete.id } : null,
          firstClub?.id ? { label: `看${firstClub.club}`, clubId: firstClub.id } : null,
        ];
    return {
      type: 'fallback',
      title: '先确认你要看的对象',
      summary: '这个问题还缺少明确对象。下面是按关键词找到的相近结果，先选中对象后可以继续分析。',
      cards: [
        ['相近选手', `${candidates.athletes.length} 个`],
        ['相近俱乐部', `${candidates.clubs.length} 个`],
        ['相近赛事', `${candidates.competitions.length} 场`],
      ],
      sections: [
        {
          title: '可以先确认',
          rows: [
            ...candidateEvidence.slice(0, 2).map((row) => `${row.kind}：${row.label} · ${row.detail}`),
            ...aiFallbackClarificationRows(text),
          ].slice(0, 3),
        },
      ],
      actions: [
        ...primaryActions,
        ...aiFallbackRewriteActions(text, candidates),
        firstCompetition?.sportCode ? { label: '看相近赛事', sportCode: firstCompetition.sportCode } : null,
      ].filter(Boolean),
      evidence: candidateEvidence,
    };
  }

  return {
    type: 'fallback',
    title: '需要补充一个对象',
    summary: '请写出选手姓名、俱乐部名称或赛事名称，例如“分析马潇和陶嘉月的对比情况”。',
    cards: [
      ['可问选手', `${entityCounts.athletes} 个画像`],
      ['可问俱乐部', `${entityCounts.clubs} 个俱乐部`],
      ['可问赛事', `${state.competitions.length} 场赛事`],
    ],
    sections: [
      {
        title: '可以这样问',
        rows: aiFallbackClarificationRows(text),
      },
    ],
    actions: [
      ...aiFallbackRewriteActions(text),
      { label: '进入数据库', mainTab: 'competitions' },
    ],
    evidence: [],
  };
}

function detectProductTemplateQuery(query) {
  const normalized = compactText(query);
  const hasTemplateIntent = /(模板|框架|报告怎么做|怎么做成报告|方案|生成.*报告|查看.*报告|生成.*情报包|查看.*情报包|做一份|输出一份)/.test(normalized);
  if (!hasTemplateIntent) return '';
  if (/(赛前提醒|赛前情报包|对手情报包|赛前包|报名情报)/.test(normalized)) return 'prematch-pack';
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
  const hasRoleIntent = /(家长|教练|俱乐部|赛事方|协会|品牌|招生|留存|续费|赛前提醒|赛前情报|成长报告|经营)/.test(normalized);
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
  const hasPreMatchIntent = /(报名|名单|赛前|马上|近期|未开赛|未开始|待开赛|即将)/.test(normalized);
  if (!hasPreMatchIntent) return null;
  const year = detectYearInQuery(normalized);
  const month = detectMonthInQuery(normalized);
  const region = detectRegionInQuery(normalized);
  const status = normalized.includes('报名中') ? 'registration' : detectStatusInQuery(normalized.replace(/报名情况|报名信息|报名名单/g, ''));
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

function aiPreMatchRosterInsightRows(competitions) {
  const rosterRows = prematchRosterRows(competitions);
  if (!rosterRows.length) return [];
  const itemRows = rosterItemSummary(rosterRows);
  const clubRows = rosterClubSummary(rosterRows, 3);
  const preparationRows = rosterPreparationRows(rosterRows, aiAthletePool());
  const rows = [`报名名单包含 ${rosterRows.length} 人次，可先看项目热度、重点俱乐部和历史强手。`];
  if (itemRows[0]) rows.push(`人数最多项目：${itemRows[0].label}，${itemRows[0].count} 人。`);
  if (clubRows[0]) rows.push(`报名最多俱乐部：${clubRows[0].club}，${clubRows[0].count} 人次，覆盖 ${clubRows[0].projectCount} 个项目。`);
  if (preparationRows[0]?.history) {
    rows.push(`重点选手线索：${preparationRows[0].name}，历史最好第 ${preparationRows[0].bestRank || '-'} 名，适合赛前重点关注。`);
  }
  return rows.slice(0, 4);
}

function aiPreMatchPersonalRelevanceRows(competitions) {
  const focused = aiFocusedAthletes();
  if (!focused.length) {
    return ['先关注孩子或学员，赛前提醒会自动围绕他的项目、报名名单和历史对手生成。'];
  }
  const rosterRows = prematchRosterRows(competitions);
  return focused.slice(0, 3).map((athlete) => {
    const labels = aiAthleteProjectLabels(athlete);
    const matchedCompetitions = competitions.filter((competition) => labels.some((label) => competitionMatchesProjectLabel(competition, label)));
    const rosterHit = rosterRows.find((row) => compactText(rosterAthleteLabel(row)) === compactText(athlete.name));
    if (rosterHit) {
      return `${athlete.name}：已在报名名单中，项目为 ${rosterEventLabel(rosterHit)}，先核对同项目名单和历史强手。`;
    }
    if (matchedCompetitions.length) {
      return `${athlete.name}：历史项目匹配 ${matchedCompetitions.length} 场近期赛事，先确认是否报名，再看同项目强手。`;
    }
    const projectText = labels.length ? labels.slice(0, 2).join(' / ') : '历史项目待确认';
    return `${athlete.name}：先按 ${projectText} 准备，重点核对同项目名单和历史强手。`;
  });
}

function aiPreMatchActionRows(competitions, rosterRows, focusRows) {
  const nearest = competitions[0] || null;
  const rosterCount = prematchRosterRows(competitions).length;
  const focusedCount = aiFocusedAthletes().length;
  return [
    nearest
      ? `先打开 ${nearest.sportName}，确认时间、地点、状态和项目是否符合目标。`
      : '先确认目标赛事和项目范围，再进入赛前提醒。',
    rosterRows.length || rosterCount
      ? `报名名单包含 ${rosterCount || rosterRows.length} 人次，优先核对关注对象是否在对应项目。`
      : '报名名单不足时，先看项目明细、赛事规模和历史强手，不直接推断真实对阵。',
    focusedCount || focusRows.length
      ? '围绕关注对象整理历史项目、最近名次和同项目强手，形成赛前沟通材料。'
      : '先关注孩子或学员，赛前报告会自动生成个人化准备重点。',
  ];
}

function projectMatchesAiHints(label, hints) {
  if (!hints.length) return true;
  const text = compactText(label);
  return hints.every((hint) => text.includes(compactText(hint)));
}

function detectYearsInQuery(query) {
  const normalized = compactText(query);
  const years = [...new Set(normalized.match(/20\d{2}/g) || [])];
  if (years.length) return years;
  const relative = detectYearInQuery(normalized);
  return relative ? [relative] : [];
}

function aiClubComparisonFilters(query) {
  const normalized = compactText(query);
  const genders = [];
  if (normalized.includes('男')) genders.push('male');
  if (normalized.includes('女')) genders.push('female');
  return {
    years: detectYearsInQuery(normalized),
    age: normalized.match(/u\d{1,2}/i)?.[0]?.toUpperCase() || '',
    weapon: normalized.includes('花') ? 'foil' : normalized.includes('重') ? 'epee' : normalized.includes('佩') ? 'sabre' : '',
    genders: genders.length ? genders : ['total'],
    includeTotal: genders.length > 1,
    metricMode: /(数量|人次|前八|奖牌|冠军|次数)/.test(normalized) ? 'quantity' : 'quantity',
  };
}

function aiClubEventYear(event) {
  return String([event.sportName, event.openDate, event.dateLabel, event.startDate].filter(Boolean).join(' '))
    .match(/20\d{2}/)?.[0] || '';
}

function aiClubEventGender(event) {
  const text = `${event.eventName || ''} ${event.shortEventName || ''}`;
  if (text.includes('女')) return 'female';
  if (text.includes('男')) return 'male';
  return 'unknown';
}

function aiClubEventWeapon(event) {
  const text = `${event.eventName || ''} ${event.shortEventName || ''}`;
  if (text.includes('花')) return 'foil';
  if (text.includes('重')) return 'epee';
  if (text.includes('佩')) return 'sabre';
  return '';
}

function aiClubEventMatchesFilters(event, filters, gender = 'total') {
  const label = `${event.eventName || ''} ${event.shortEventName || ''}`;
  if (filters.years?.length && !filters.years.includes(aiClubEventYear(event))) return false;
  if (filters.age && !compactText(label).includes(compactText(filters.age))) return false;
  if (filters.weapon && aiClubEventWeapon(event) !== filters.weapon) return false;
  if (gender !== 'total' && aiClubEventGender(event) !== gender) return false;
  return true;
}

function aiClubComparisonMetric(club, filters, gender = 'total') {
  const events = (club.events || []).filter((event) => aiClubEventMatchesFilters(event, filters, gender));
  const metric = events.reduce((acc, event) => {
    acc.projects += 1;
    acc.entrants += Number(event.entrants) || 0;
    acc.top8 += Number(event.top8) || 0;
    acc.medals += Number(event.medals) || 0;
    const rank = Number(event.bestRank);
    if (rank === 1) acc.champions += 1;
    if (rank > 0) acc.bestRank = Math.min(acc.bestRank, rank);
    return acc;
  }, {
    club,
    gender,
    events,
    projects: 0,
    entrants: 0,
    top8: 0,
    medals: 0,
    champions: 0,
    bestRank: Infinity,
  });
  metric.bestRank = metric.bestRank === Infinity ? null : metric.bestRank;
  metric.top8Rate = metric.entrants ? metric.top8 / metric.entrants : 0;
  metric.medalRate = metric.entrants ? metric.medals / metric.entrants : 0;
  metric.championRate = metric.entrants ? metric.champions / metric.entrants : 0;
  return metric;
}

function aiClubComparisonScore(metric) {
  return (metric.medals * 5) + (metric.top8 * 3) + (metric.champions * 4) + (metric.entrants * 0.1) + metric.projects;
}

function aiClubComparisonWinner(left, right) {
  const leftWins = ['entrants', 'top8', 'medals', 'champions'].filter((key) => left[key] > right[key]).length;
  const rightWins = ['entrants', 'top8', 'medals', 'champions'].filter((key) => right[key] > left[key]).length;
  if (leftWins !== rightWins) return leftWins > rightWins ? left : right;
  const leftScore = aiClubComparisonScore(left);
  const rightScore = aiClubComparisonScore(right);
  if (leftScore === rightScore) return null;
  return leftScore > rightScore ? left : right;
}

function aiClubComparisonQuantityWinner(left, right) {
  const leftWins = ['entrants', 'projects', 'top8', 'medals', 'champions'].filter((key) => left[key] > right[key]).length;
  const rightWins = ['entrants', 'projects', 'top8', 'medals', 'champions'].filter((key) => right[key] > left[key]).length;
  if (leftWins === rightWins) return null;
  return leftWins > rightWins ? left : right;
}

function aiClubComparisonEfficiencyScore(metric) {
  return (metric.top8Rate * 4) + (metric.medalRate * 5) + (metric.championRate * 3);
}

function aiClubComparisonEfficiencyWinner(left, right) {
  if (left.entrants < 3 || right.entrants < 3) return null;
  const leftScore = aiClubComparisonEfficiencyScore(left);
  const rightScore = aiClubComparisonEfficiencyScore(right);
  if (Math.abs(leftScore - rightScore) < 0.02) return null;
  return leftScore > rightScore ? left : right;
}

function aiClubComparisonPercent(value) {
  return `${Math.round((Number(value) || 0) * 100)}%`;
}

function aiClubComparisonScopeLabel(filters) {
  const weaponLabel = { foil: '花剑', epee: '重剑', sabre: '佩剑' }[filters.weapon] || '';
  const genderLabel = filters.includeTotal
    ? '男子 / 女子'
    : filters.genders?.length === 1 && filters.genders[0] !== 'total'
      ? aiClubComparisonGenderLabel(filters.genders[0])
      : '';
  const parts = [
    filters.years?.length ? filters.years.join('、') : '',
    filters.age || '',
    weaponLabel,
    genderLabel,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : '全部赛事';
}

function aiClubComparisonGenderLabel(gender) {
  if (gender === 'male') return '男子';
  if (gender === 'female') return '女子';
  return '合计';
}

function aiClubComparisonRefineQuery(leftClub, rightClub, filters) {
  const year = filters.years?.[filters.years.length - 1] || '2026';
  const age = filters.age || 'U10';
  const weapon = { foil: '花剑', epee: '重剑', sabre: '佩剑' }[filters.weapon] || '花剑';
  return `只看${year}年${age}男${weapon}，${leftClub.club}和${rightClub.club}谁更强？`;
}

function aiClubComparisonRefineLabel(filters) {
  const age = filters.age || 'U10';
  const weapon = { foil: '花剑', epee: '重剑', sabre: '佩剑' }[filters.weapon] || '花剑';
  return filters.includeTotal ? `查看${age}${weapon}男女对比` : `查看${age}男${weapon}对比`;
}

function aiClubComparisonCardLabel(metric) {
  return metric.gender === 'total' ? '合计结论' : `${aiClubComparisonGenderLabel(metric.gender)}结论`;
}

function aiClubComparisonCardValue(left, right) {
  const winner = aiClubComparisonQuantityWinner(left, right);
  return winner ? `${winner.club.club}占优` : '接近';
}

function aiClubComparisonQuantitySummary(left, right) {
  const winner = aiClubComparisonQuantityWinner(left, right);
  if (!winner) return '数量接近';
  return `${winner.club.club}数量占优`;
}

function aiClubComparisonEfficiencySummary(left, right) {
  const winner = aiClubComparisonEfficiencyWinner(left, right);
  if (!winner) return '效率接近';
  return `${winner.club.club}效率更突出`;
}

function aiClubComparisonRateLine(metric) {
  return `${metric.club.club} 前八率${aiClubComparisonPercent(metric.top8Rate)}、奖牌率${aiClubComparisonPercent(metric.medalRate)}`;
}

function aiClubComparisonMetricLine(left, right) {
  const quantityWinner = aiClubComparisonQuantityWinner(left, right);
  const efficiencyWinner = aiClubComparisonEfficiencyWinner(left, right);
  const quantityText = quantityWinner ? `数量上${quantityWinner.club.club}领先` : '数量接近';
  const efficiencyText = efficiencyWinner ? `效率上${efficiencyWinner.club.club}更突出` : '效率接近';
  return `${aiClubComparisonGenderLabel(left.gender)}：${quantityText}；${efficiencyText}。${left.club.club} ${left.entrants}人次、前八${left.top8}、奖牌${left.medals}；${right.club.club} ${right.entrants}人次、前八${right.top8}、奖牌${right.medals}。${aiClubComparisonRateLine(left)}；${aiClubComparisonRateLine(right)}。`;
}

function aiClubComparisonConclusionRows(metrics) {
  return metrics.map(([left, right]) => aiClubComparisonMetricLine(left, right));
}

function aiClubComparisonEvidenceRows(metrics) {
  const rows = [];
  metrics.forEach(([left, right]) => {
    [left, right].forEach((metric) => {
      metric.events
        .slice()
        .sort((a, b) => (Number(a.bestRank) || 99) - (Number(b.bestRank) || 99) || String(b.openDate || b.dateLabel || '').localeCompare(String(a.openDate || a.dateLabel || ''), 'zh-CN'))
        .slice(0, 3)
        .forEach((event) => {
          rows.push({
            kind: '俱乐部对比证据',
            label: event.sportName || displayEventName(event),
            detail: `${metric.club.club} · ${displayEventName(event)} · ${event.entrants || 0}人次 · 前八${event.top8 || 0} · 奖牌${event.medals || 0} · 最好第${event.bestRank ?? '-'}名`,
            reason: `${aiClubComparisonGenderLabel(metric.gender)}项目中的关键成绩样本`,
            sportCode: event.sportCode,
            eventCode: event.eventCode,
            clubId: metric.club.id,
          });
        });
    });
  });
  return rows.slice(0, 8);
}

function buildAiClubComparisonReport(query, leftClub, rightClub, filters) {
  const genderScopes = [...filters.genders];
  if (filters.includeTotal) genderScopes.push('total');
  const metricPairs = genderScopes.map((gender) => [
    aiClubComparisonMetric(leftClub, filters, gender),
    aiClubComparisonMetric(rightClub, filters, gender),
  ]);
  const totalPair = metricPairs.find(([left]) => left.gender === 'total') || metricPairs[0];
  const quantityWinner = totalPair ? aiClubComparisonQuantityWinner(totalPair[0], totalPair[1]) : null;
  const efficiencyWinner = totalPair ? aiClubComparisonEfficiencyWinner(totalPair[0], totalPair[1]) : null;
  const scopeLabel = aiClubComparisonScopeLabel(filters);
  const resultCards = metricPairs
    .slice(0, 3)
    .map(([left, right]) => [aiClubComparisonCardLabel(left), aiClubComparisonCardValue(left, right)]);
  const summary = `${scopeLabel}，先看参赛规模，再看前八率和奖牌率。${quantityWinner ? `数量上${quantityWinner.club.club}更突出` : '数量接近'}；${efficiencyWinner ? `效率上${efficiencyWinner.club.club}更突出` : '效率接近'}。`;

  return {
    type: 'club-comparison',
    title: `${leftClub.club} vs ${rightClub.club}`,
    summary,
    cards: [
      ['对比范围', scopeLabel],
      ['数量优势', totalPair ? aiClubComparisonQuantitySummary(totalPair[0], totalPair[1]) : '样本不足'],
      ['效率信号', totalPair ? aiClubComparisonEfficiencySummary(totalPair[0], totalPair[1]) : '样本不足'],
      ...resultCards,
    ],
    sections: [
      {
        title: '对比结论',
        rows: aiClubComparisonConclusionRows(metricPairs),
      },
    ],
    evidence: aiClubComparisonEvidenceRows(metricPairs),
    actions: [
      { label: `看${leftClub.club}画像`, clubId: leftClub.id },
      { label: `看${rightClub.club}画像`, clubId: rightClub.id },
      { label: aiClubComparisonRefineLabel(filters), query: aiClubComparisonRefineQuery(leftClub, rightClub, filters) },
    ],
    sourceNote: '俱乐部对比来自公开赛事成绩记录，适合先判断整体规模和成绩表现。',
  };
}

function buildAiCompetitionLookupReport(query, competition) {
  const itemCount = competitionItemCount(competition);
  const entrants = competitionEntrantCount(competition);
  const itemLabels = competitionItemFilterLabels(competition).slice(0, 4);
  const title = competition.sportName || '\u5339\u914d\u8d5b\u4e8b';
  const date = displayDateLabel(competition.dateLabel || competition.startDate || competition.endDate || '');
  const venue = competition.venue || competition.region || '';
  const currentStatus = statusLabel(competition.status);

  return {
    type: 'competition-stats',
    title,
    summary: [date, venue, currentStatus].filter(Boolean).join(' / ') || '\u5df2\u5339\u914d\u5230\u8d5b\u4e8b\u8bb0\u5f55\u3002',
    cards: [
      ['\u8d5b\u4e8b\u72b6\u6001', currentStatus],
      ['\u6bd4\u8d5b\u65f6\u95f4', date || '\u65e5\u671f\u5f85\u786e\u8ba4'],
      ['\u9879\u76ee\u8986\u76d6', itemCount ? `${itemCount} \u9879` : '\u5f85\u786e\u8ba4'],
      ['\u53c2\u8d5b\u89c4\u6a21', entrants ? `${entrants} \u4eba\u6b21` : '\u5f85\u786e\u8ba4'],
    ],
    sections: [
      itemLabels.length ? {
        title: '\u9879\u76ee',
        rows: itemLabels,
      } : null,
    ].filter(Boolean),
    evidence: [{
      kind: '\u8d5b\u4e8b\u8bb0\u5f55',
      label: title,
      detail: [date, venue, currentStatus].filter(Boolean).join(' / '),
      reason: '\u7528\u4e8e\u6838\u5bf9\u8d5b\u4e8b\u540d\u79f0\u3001\u65f6\u95f4\u3001\u5730\u70b9\u548c\u72b6\u6001',
      sportCode: competition.sportCode,
    }],
    actions: [
      competition.sportCode ? { label: '\u6253\u5f00\u8d5b\u4e8b\u8be6\u60c5', sportCode: competition.sportCode } : null,
      { label: '\u770b\u540c\u5730\u533a\u8d5b\u4e8b', mainTab: 'competitions', filters: { year: competitionYear(competition) || '', month: '', region: competition.region || '', status: competition.status || '' } },
    ].filter(Boolean),
  };
}

function aiCompetitionFilterEvidence(query, filters = {}, count = 0, label = '匹配赛事列表') {
  const scopedFilters = {
    year: filters.year || '',
    month: filters.month || '',
    region: filters.region || '',
    item: filters.item || '',
    status: filters.status || '',
    query: query || '',
  };
  return {
    kind: '赛事列表',
    label,
    detail: `${aiCompetitionFilterSummary(scopedFilters) || '赛事列表'} · ${count} 场`,
    mainTab: 'competitions',
    filters: scopedFilters,
  };
}

function aiCompetitionStatsDecisionRows(rows, actionRows, rosterRows, scoreRows) {
  if (!rows.length) return ['没有找到符合条件的赛事。可以调整年份、地区或赛事状态再看。'];
  const decisionRows = [];
  if (actionRows.length) {
    decisionRows.push(`${actionRows.length} 场处在报名、未开赛或赛前阶段，适合加入赛前提醒。`);
    decisionRows.push(`${rosterRows.length} 场可查看报名名单，适合提前关注同组对手和参赛规模。`);
  }
  if (scoreRows.length) {
    decisionRows.push(`${scoreRows.length} 场有成绩或项目数据，适合做成长报告、教练复盘和俱乐部表现分析。`);
  }
  if (!decisionRows.length) {
    decisionRows.push('可以先确认赛程、地点和项目安排，再结合报名名单或成绩做备赛复盘。');
  }
  return decisionRows;
}

function aiFilterScopeText(filters = {}, fallback = '全部赛事') {
  const parts = [];
  if (filters.year) parts.push(`${filters.year}年`);
  if (filters.month) parts.push(`${filters.month}月`);
  if (filters.region) parts.push(filters.region);
  if (filters.status) parts.push(statusLabel(filters.status));
  return parts.length ? parts.join('') : fallback;
}

function aiFilterCardLabel(value, suffix = '') {
  return value ? `${value}${suffix}` : '不限';
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
  const regionLabel = filters.region || '不限';
  const yearLabel = aiFilterCardLabel(filters.year, '年');
  const monthLabel = aiFilterCardLabel(filters.month, '月');
  const statusLabelText = filters.status ? statusLabel(filters.status) : '不限';
  const scopeText = aiFilterScopeText(filters);
  const title = `${scopeText === '全部赛事' ? '' : scopeText}赛事统计`;
  const summary = rows.length
    ? `${scopeText}共有 ${rows.length} 场赛事${filters.status ? `，状态为${statusLabelText}` : ''}。`
    : `没有找到${scopeText === '全部赛事' ? '' : scopeText}赛事记录。`;

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
    evidence: [
      aiCompetitionFilterEvidence(query, filters, rows.length),
      ...rows.slice(0, 7).map((competition) => ({
        kind: '赛事记录',
        label: competition.sportName,
        detail: `${competition.dateLabel || '日期待确认'} · ${competition.venue || competition.region || ''} · ${statusLabel(competition.status)}`,
        reason: '用于核对赛事数量、地区和状态',
        sportCode: competition.sportCode,
      })),
    ],
    actions: [
      actionRows[0]?.sportCode ? { label: '看赛前提醒', prematchTemplateKind: 'prematch-pack', prematchSportCode: actionRows[0].sportCode } : null,
      watchRows[0]?.sportCode ? { label: '关注最近赛事', followCompetitionCode: watchRows[0].sportCode } : null,
      { label: rows.length ? '看这几场赛事' : '进入赛事列表', mainTab: 'competitions', filters },
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
  const scopeText = filterLabel || '全部赛事';
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
        : `${scopeText}中还没有足够的项目人数记录。`,
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
            '如果是赛前项目，可以查看赛前提醒，提前了解报名名单、重点对手和俱乐部分布。',
          ],
        },
      ] : [],
      evidence: [
        ...itemRows.slice(0, 7).map((row) => ({
          kind: '项目规模',
          label: row.label,
          detail: `${row.entrants} 人次 · ${row.competition.sportName} · ${displayDateLabel(row.competition.dateLabel)}`,
          reason: '用于核对项目或组别参赛规模排行',
          sportCode: row.competition.sportCode,
          eventCode: row.eventCode,
        })),
        aiCompetitionFilterEvidence(query, listFilters, matchedRows.length, '相关赛事列表'),
      ].filter(Boolean),
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
      : `${scopeText}中还没有足够的参赛人数记录。`,
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
          '如果是赛前赛事，可以先关注报名名单，并查看已出现的重点对手和俱乐部分布。',
        ],
      },
    ] : [],
    evidence: [
      ...rows.slice(0, 7).map((row) => ({
        kind: '赛事规模',
        label: row.competition.sportName,
        detail: `${row.entrants} 人次 · ${row.competition.dateLabel || '日期待确认'} · ${row.competition.venue || row.competition.region || ''}`,
        reason: '用于核对赛事参赛规模排行',
        sportCode: row.competition.sportCode,
      })),
      aiCompetitionFilterEvidence(query, listFilters, matchedRows.length, '相关赛事列表'),
    ].filter(Boolean),
    actions: [
      top?.competition?.sportCode ? { label: '查看人数最多的赛事', sportCode: top.competition.sportCode } : null,
      { label: rows.length ? '查看赛事列表' : '进入赛事列表', mainTab: 'competitions', filters: listFilters },
    ].filter(Boolean),
  };
}

function businessMetricRows() {
  const competitions = state.competitions || [];
  const entityCounts = entityCoverageCounts();
  const activeCompetitions = competitions.filter(isActionablePrematchCompetition);
  const regionCount = new Set(competitions.map((competition) => competition.region || competition.venue).filter(Boolean)).size;
  const scoredCompetitions = competitions.filter((competition) => competition.status === 'completed' || competitionHasItems(competition));
  return [
    ['赛事资产', `${competitions.length} 场`],
    ['选手画像', `${entityCounts.athletes} 人`],
    ['俱乐部画像', `${entityCounts.clubs} 个`],
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

function isActionablePrematchCompetition(competition) {
  if (!competition || competition.status === 'completed') return false;
  const hasPrematchStatus = ['registration', 'upcoming', 'live'].includes(competition.status) || competition.isPreEvent;
  if (!hasPrematchStatus) return false;
  if (competition.status === 'live') return true;
  const days = daysFromToday(competitionDateValue(competition));
  return days >= 0;
}

function businessCoverageOpportunityRows() {
  const competitions = state.competitions || [];
  const scoreCount = competitions.filter((competition) => competition.coverageLevel === 'score' || competitionHasItems(competition)).length;
  const rosterCount = competitions.filter((competition) => competition.coverageLevel === 'roster' || competition.rosterStatus === 'partial' || competition.rosterStatus === 'complete').length;
  const projectCount = competitions.filter((competition) => competition.coverageLevel === 'project' || competition.itemCount || competition.itemSummaries?.length).length;
  const activeCount = competitions.filter(isActionablePrematchCompetition).length;
  const scoreRate = competitions.length ? Math.round((scoreCount / competitions.length) * 100) : 0;
  const rosterRate = activeCount ? Math.round((rosterCount / activeCount) * 100) : 0;
  return [
    `赛后复盘：${scoreCount} 场有成绩/对阵，占全部赛事 ${scoreRate}%，适合先做家长成长报告和教练复盘。`,
    `赛前服务：${rosterCount} 场有报名名单，覆盖近期/进行中赛事 ${rosterRate}%，适合做赛前提醒。`,
    `赛事目录：${projectCount} 场至少有项目结构，可先支持筛选、提醒和项目级赛前判断。`,
  ];
}

function businessRoleConversionRows() {
  const focused = aiFocusedAthletes();
  const club = state.currentClub || aiDefaultClub();
  const activeCount = (state.competitions || []).filter(isActionablePrematchCompetition).length;
  return [
    `家长转化：${focused.length ? `从已关注的 ${focused.length} 名孩子生成成长报告` : '先引导关注孩子'}，再承接赛后复盘、同龄段位置和下一场建议。`,
    `教练转化：${club?.club ? `从 ${club.club} 的俱乐部画像进入学员分层` : '从俱乐部搜索进入队伍画像'}，再承接续费沟通和训练反馈。`,
    `赛事转化：围绕 ${activeCount} 场赛前/报名赛事做提醒、报名名单解读和对手情报，时间节点最明确。`,
  ];
}

function businessPriorityRows() {
  const competitions = state.competitions || [];
  const activeCount = competitions.filter(isActionablePrematchCompetition).length;
  const scoreCount = competitions.filter((competition) => competition.coverageLevel === 'score' || competitionHasItems(competition)).length;
  const clubCount = entityCoverageCounts().clubs;
  return [
    `赛前准备：${activeCount} 场近期赛事适合做报名提醒、项目核对和重点对手观察。`,
    `成长复盘：${scoreCount} 场有成绩的赛事适合整理孩子阶段变化和赛后复盘。`,
    `教练经营：${clubCount} 个俱乐部画像可用于学员分层、优势项目和招生展示。`,
  ];
}

function businessProductOpportunityRows() {
  const activeCount = (state.competitions || []).filter(isActionablePrematchCompetition).length;
  const entityCounts = entityCoverageCounts();
  return [
    `家长端：用 ${entityCounts.athletes} 个选手画像生成成长报告、同龄段位置和下一场比赛建议。`,
    `教练端：用 ${entityCounts.clubs} 个俱乐部画像做学员分层、重点备赛和招生展示。`,
    `赛前场景：${activeCount} 场赛前/报名赛事可用于对手观察和赛事提醒。`,
    '行业端：按地区、月份、项目和俱乐部活跃度输出区域增长与赛事供给判断。',
  ];
}

function businessMonetizationRows() {
  const competitions = state.competitions || [];
  const activeCount = competitions.filter(isActionablePrematchCompetition).length;
  const rosterCount = competitions.filter((competition) => competition.rosterStatus === 'partial' || competition.rosterStatus === 'complete').length;
  const scoreCount = competitions.filter((competition) => competition.coverageLevel === 'score' || competitionHasItems(competition)).length;
  const followedCount = aiFocusedAthletes().length;
  const clubCount = entityCoverageCounts().clubs;
  return [
    `赛前提醒：用 ${activeCount} 场近期/报名赛事做高频入口，其中 ${rosterCount} 场有报名名单，适合先做单场提醒和持续跟进。`,
    `家长成长报告：用 ${scoreCount} 场成绩样本整理月度/赛后复盘，${followedCount} 名关注选手可直接生成个人化报告。`,
    `教练工作台：用 ${clubCount} 个俱乐部画像承接学员分层、续费沟通和招生展示，优先服务熟悉的小型剑馆样板。`,
    '服务路径：先用免费问答确认需求，再用报告证明价值，最后通过关注、提醒和试用服务形成持续使用。',
  ];
}

function buildAiBusinessInsightReport(query) {
  const competitions = state.competitions || [];
  const activeRows = competitions
    .filter(isActionablePrematchCompetition)
    .sort((a, b) => daysFromToday(competitionDateValue(a)) - daysFromToday(competitionDateValue(b)))
    .slice(0, 5);
  const topClubs = (state.clubSearchIndex || [])
    .slice()
    .sort((a, b) => (Number(b.entrants) || 0) - (Number(a.entrants) || 0))
    .slice(0, 4);

  return {
    type: 'business-insight',
    title: '击剑数据商业价值分析',
    summary: `这些数据可以服务家长成长判断、教练备赛、俱乐部展示和区域赛事观察，核心价值在于生成可核对的分析、提醒和报告。`,
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
        title: '可提供服务',
        rows: businessProductOpportunityRows(),
      },
      {
        title: '优先使用场景',
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
        reason: '用于判断赛前提醒和报名分析场景',
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
      { label: '查看赛前提醒', prematchTemplateKind: 'prematch-pack' },
      aiProductTemplateAthlete()?.id ? { label: '查看成长报告', parentGrowthAthleteId: aiProductTemplateAthlete().id } : null,
      aiProductTemplateClub()?.id ? { label: '查看教练工作台', coachSegmentationClubId: aiProductTemplateClub().id } : null,
    ].filter(Boolean),
    sourceNote: '商业洞察来自赛事、选手、俱乐部和赛前状态记录，可用于判断产品服务方向。',
  };
}

function productTemplateTitle(kind) {
  if (kind === 'prematch-pack') return '赛前提醒';
  if (kind === 'parent-growth-report') return '家长成长报告';
  if (kind === 'coach-segmentation') return '教练学员分层';
  return '数据报告';
}

function productTemplateMetricRows(kind) {
  if (kind === 'prematch-pack') {
    const active = (state.competitions || []).filter((competition) => ['registration', 'upcoming', 'live'].includes(competition.status) || competition.isPreEvent);
    const roster = active.filter((competition) => competition.rosterStatus === 'partial' || competition.rosterStatus === 'complete');
    return [
      ['可生成赛事', `${active.length} 场`],
      ['名单赛事', `${roster.length} 场`],
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
        title: '内容结构',
        rows: [
          '本场赛事概览：时间、地点、状态、项目和报名规模。',
          '关注对象匹配：按历史项目匹配可能参赛项目。',
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
          '赛前 3-7 天形成提醒，便于确认名单、项目和强手。',
          '家长版突出风险和准备重点，教练版突出对手结构和训练安排。',
        ],
      },
    ];
  }
  if (kind === 'parent-growth-report') {
    return [
      {
        title: '内容结构',
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
      title: '内容结构',
      rows: [
        '学员分层：冲成绩、稳定成长、需要关注、新手积累。',
        '训练反馈：每个学员下一步训练重点和家长沟通重点。',
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
      .filter((competition) => ['registration', 'upcoming', 'live'].includes(competition.status) || (competition.isPreEvent && competition.status !== 'completed'))
      .sort((a, b) => {
        const dayA = Math.abs(daysFromToday(competitionDateValue(a)));
        const dayB = Math.abs(daysFromToday(competitionDateValue(b)));
        return dayA - dayB || String(a.dateLabel || '').localeCompare(String(b.dateLabel || ''), 'zh-CN');
      })
      .slice(0, 6)
      .map((competition) => ({
        kind: '赛前赛事',
        label: competition.sportName,
        detail: `${displayDateLabel(competition.dateLabel)} · ${competition.venue || competition.region || '地点待确认'} · ${statusLabel(competition.status)}`,
        reason: '用于查看赛前提醒的赛事入口',
        sportCode: competition.sportCode,
      }));
  }
  if (kind === 'parent-growth-report') {
    return aiFocusedAthletes()
      .slice(0, 4)
      .flatMap((athlete) => topEvidenceEvents(athlete.events || [], athlete.name, 2, athlete.id))
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
    'prematch-pack': '把赛前赛事、报名名单、关注选手和历史成绩合并成一份可行动的赛前提醒。',
    'parent-growth-report': '把孩子的参赛轨迹、名次变化和同龄位置整理成家长能理解的成长判断。',
    'coach-segmentation': '把俱乐部学员按成绩资产、参赛连续性和近期风险分层，服务训练、续费和招生。',
  };
  return {
    type: 'product-template',
    templateKind: kind,
    title,
    summary: summaryByKind[kind] || '把底层数据整理成面向具体用户任务的报告。',
    cards: productTemplateMetricRows(kind),
    sections: productTemplateSections(kind),
    evidence: productTemplateEvidence(kind),
    actions: [
      kind === 'prematch-pack' ? { label: '查看赛前提醒', prematchTemplateKind: 'prematch-pack' } : null,
      kind === 'prematch-pack' ? { label: '查看赛前赛事', mainTab: 'competitions', filters: { status: 'registration' } } : null,
      kind === 'parent-growth-report' && templateAthlete?.id ? { label: '生成成长报告', parentGrowthAthleteId: templateAthlete.id } : null,
      kind === 'parent-growth-report' && templateAthlete?.id ? { label: '查看选手画像', athleteId: templateAthlete.id } : null,
      kind === 'coach-segmentation' && templateClub?.id ? { label: '生成学员分层报告', coachSegmentationClubId: templateClub.id } : null,
      kind === 'coach-segmentation' && templateClub?.id ? { label: '查看俱乐部画像', clubId: templateClub.id } : null,
    ].filter(Boolean),
    sourceNote: '报告会围绕用户角色、关注对象和赛事节点组织信息。',
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
        : ['registration', 'upcoming', 'live'].includes(competition.status) || (competition.isPreEvent && competition.status !== 'completed');
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
  const personalRows = aiPreMatchPersonalRelevanceRows(rows);
  const rosterInsightRows = aiPreMatchRosterInsightRows(rows);
  const actionRows = aiPreMatchActionRows(rows, rosterRows, focusRows);
  const expectedTotal = rows.reduce((sum, competition) => sum + (Number(competition.registrationSummary?.expectedRegistrationCount) || 0), 0);
  const rosterTotal = rows.reduce((sum, competition) => sum + (Number(competition.registrationSummary?.rosterCount) || 0), 0);
  const regionLabel = filters.region || '不限';
  const scopeText = aiFilterScopeText(filters);
  const title = `${scopeText === '全部赛事' ? '近期' : scopeText}赛前提醒`;
  const summary = rows.length
    ? `${scopeText}有 ${rows.length} 场值得赛前关注的赛事，${rosterRows.length} 场可查看报名名单，${projectRows.length} 场可查看项目安排。`
    : `没有找到${scopeText === '全部赛事' ? '' : scopeText}赛前或报名赛事。`;

  return {
    type: 'prematch',
    title,
    summary,
    cards: [
      ['相关赛事', `${rows.length} 场`],
      ['报名名单', rosterRows.length ? (rosterTotal || expectedTotal ? `${rosterTotal || 0}/${expectedTotal || '-'}` : `${rosterRows.length} 场`) : '0 场'],
      ['项目明细', `${projectRows.length} 场`],
      ['关注选手', focusRows.length ? `${focusRows.length} 人` : '-'],
    ],
    sections: rows.length ? [
      (personalRows.length || focusRows.length || rosterInsightRows.length) ? {
        title: '赛前重点',
        rows: [...personalRows.slice(0, 1), ...rosterInsightRows.slice(0, 3)].slice(0, 4),
      } : null,
      {
        title: '优先关注',
        rows: [
          ...rows.slice(0, 2).map((competition) => `${competition.sportName} · ${displayDateLabel(competition.dateLabel)} · ${statusLabel(competition.status)} · ${coverageLabel(competition)}`),
          ...actionRows.slice(0, 2),
        ].slice(0, 4),
      },
    ].filter(Boolean) : [],
    evidence: rows.slice(0, 8).map((competition) => ({
      kind: '赛前赛事',
      label: competition.sportName,
      detail: `${displayDateLabel(competition.dateLabel)} · ${competition.venue || competition.region || '地点待确认'} · ${statusLabel(competition.status)}`,
      reason: coverageDetail(competition),
      sportCode: competition.sportCode,
    })),
    actions: [
      rows[0]?.sportCode ? { label: '查看本场情报', prematchTemplateKind: 'prematch-pack', prematchSportCode: rows[0].sportCode } : null,
      rows[0]?.sportCode ? { label: '加入赛前提醒', followCompetitionCode: rows[0].sportCode } : null,
      { label: rows.length ? '查看赛前赛事' : '进入赛事列表', mainTab: 'competitions', filters },
    ].filter(Boolean),
    sourceNote: '赛前提醒基于赛事状态、项目安排和报名名单生成；报名名单较少时，先展示赛程、项目和重点赛事。',
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
  if (!direct.length && /对战|交手|谁赢|打过/.test(compactText(query))) summaryParts.push('没有找到两人的直接交手记录');
  if (shared.length) summaryParts.push(`两人共同出现在 ${shared.length} 个项目里`);
  summaryParts.push(`${leader.name} 的综合记录更占优，主要来自最好名次、奖牌和参赛连续性`);

  return {
    type: 'comparison',
    title: `${left.name} vs ${right.name}`,
    summary: summaryParts.join('；') + '。',
    cards: [
      [left.name, athleteMetricLine(left)],
      [right.name, athleteMetricLine(right)],
      ['对比结论', `${leader.name} 略优于 ${other.name}`],
      ['参考强度', confidence],
    ],
    sections: [
      {
        title: '直接交手',
        rows: direct.length
          ? direct.slice(0, 4).map((row) => `${row.phase || '淘汰赛'}：${row.name}，${row.record || row.score || ''}`)
          : ['没有找到两人的直接交手记录；以下根据共同赛事、最近表现和历史成绩对比。'],
      },
      {
        title: '共同赛事',
        rows: shared.length
          ? shared.slice(0, 5).map((row) => `${row.eventName} · ${row.sportName} · ${left.name}第${row.leftRank || '-'}名 / ${right.name}第${row.rightRank || '-'}名`)
          : ['没有找到两人出现在同一项目的记录，建议先把结论作为赛前观察线索。'],
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
      ...topEvidenceEvents(leftEvents, left.name, 2, left.id),
      ...topEvidenceEvents(rightEvents, right.name, 2, right.id),
    ].slice(0, 7),
    actions: [
      left.id ? { label: `查看${left.name}`, athleteId: left.id } : null,
      right.id ? { label: `查看${right.name}`, athleteId: right.id } : null,
      aiFollowAthleteAction(leader),
    ].filter(Boolean),
    sourceNote: '回答来自比赛成绩、选手画像和对阵记录；没有直接交手时，只展示可核对的对比信息。',
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
  const yearRows = athleteYearSummaryRows(events, query);
  return {
    type: 'growth',
    title: `${athlete.name}的成长分析`,
    summary: `${athlete.name}有 ${events.length || athlete.appearances || 0} 场参赛表现，最好名次${best?.finalRank ? `第${best.finalRank}名` : '待确认'}，近期变化：${trend}。`,
    cards: [
      ['最好名次', best?.finalRank ? `第${best.finalRank}名` : '-'],
      ['最近一次', latest?.finalRank ? `第${latest.finalRank}名` : '-'],
      ['奖牌', `${athlete.medals || 0} 枚`],
      ['淘汰赛', `${athlete.eliminationWins || 0}胜${athlete.eliminationLosses || 0}负`],
    ],
    sections: [
      yearRows.length ? {
        title: '年度对比',
        rows: yearRows,
      } : null,
      {
        title: '最近比赛',
        rows: events.slice(0, 5).map((event) => `${displayEventName(event)} · 第${event.finalRank ?? '-'}名 · ${event.sportName}`),
      },
      !yearRows.length && (athlete.opponents || []).length ? {
        title: '重点对手',
        rows: athlete.opponents.slice(0, 4).map((opponent) => `${opponent.name}：${opponent.wins}胜${opponent.losses}负 · ${opponent.latestPhase || '淘汰赛'}`),
      } : null,
    ].filter(Boolean),
    evidence: topEvidenceEvents(events, athlete.name, 7, athlete.id),
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
    summary: `${club.club}有 ${club.entrants || 0} 人次参赛、${club.top8 || 0} 次前八、${club.medals || 0} 枚奖牌表现。${hints.length && matchedProjects.length ? `本次重点查看 ${matchedProjects.length} 个重点项目。` : ''}${bestProject ? `优势项目集中在 ${bestProject.label}。` : ''}`,
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
        title: hints.length ? '重点项目' : '优势项目',
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
          topProject ? `先讲优势项目：${topProject.label}，参赛 ${topProject.entrants || 0} 人次，最好第 ${topProject.bestRank ?? '-'} 名。` : '先讲参赛基础和训练方向。',
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
    sourceNote: '招生展示只使用公开赛事成绩，适合呈现真实参赛和成绩表现。',
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

function athleteEventYear(event) {
  const text = [event?.openDate, event?.dateLabel, event?.sportName].filter(Boolean).join(' ');
  return text.match(/20\d{2}/)?.[0] || '';
}

function athleteYearSummaryRows(events, query = '') {
  const explicitYears = detectYearsInQuery(query);
  const rowsByYear = new Map();
  for (const event of events || []) {
    const year = athleteEventYear(event);
    if (!year) continue;
    if (explicitYears.length && !explicitYears.includes(year)) continue;
    if (!rowsByYear.has(year)) rowsByYear.set(year, []);
    rowsByYear.get(year).push(event);
  }
  const years = explicitYears.length
    ? explicitYears.filter((year) => rowsByYear.has(year))
    : [...rowsByYear.keys()].sort((a, b) => Number(b) - Number(a));
  if (years.length < 2 && explicitYears.length < 2) return [];
  return years.map((year) => {
    const rows = rowsByYear.get(year) || [];
    const bestRank = rows.reduce((best, event) => {
      const rank = Number(event.finalRank || 0);
      return rank ? Math.min(best, rank) : best;
    }, 999);
    const latest = rows[0] || null;
    const medals = rows.filter((event) => event.medal || (Number(event.finalRank || 0) > 0 && Number(event.finalRank || 0) <= 3)).length;
    const wins = rows.reduce((sum, event) => sum + (Number(event.eliminationWins) || 0), 0);
    const losses = rows.reduce((sum, event) => sum + (Number(event.eliminationLosses) || 0), 0);
    return `${year}：参赛 ${rows.length} 场，最好${bestRank < 999 ? `第${bestRank}名` : '待确认'}，最近${latest?.finalRank ? `第${latest.finalRank}名` : '待确认'}，奖牌 ${medals} 枚${wins || losses ? `，淘汰赛 ${wins}胜${losses}负` : ''}。`;
  });
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

function topEvidenceEvents(events, owner, limit = 5, athleteId = '') {
  return (events || []).slice(0, limit).map((event) => ({
    kind: '选手成绩',
    label: displayEventName(event),
    detail: `${owner} · ${event.sportName || ''} · 第${event.finalRank ?? '-'}名 · ${event.openDate || ''}`,
    reason: '用于核对选手名次、时间和参赛项目',
    eventCode: event.eventCode,
    athleteId,
  }));
}

function aiEvidenceKind(row) {
  return row.kind || (row.sportCode ? '赛事记录' : row.eventCode ? '项目记录' : '数据来源');
}

function aiEvidenceActionLabel(row) {
  if (row.eventCode) return '查看项目';
  if (row.sportCode) return '查看赛事';
  if (row.athleteId) return '查看选手';
  if (row.clubId) return '查看俱乐部';
  if (row.mainTab === 'competitions' || row.filters) return '查看列表';
  return '查看来源';
}

function aiEvidenceTargetAttributes(row = {}) {
  if (row.eventCode) return `data-event-code="${escapeHtml(row.eventCode)}"`;
  if (row.sportCode) return `data-sport-code="${escapeHtml(row.sportCode)}"`;
  if (row.athleteId) return `data-athlete-id="${escapeHtml(row.athleteId)}"`;
  if (row.clubId) return `data-club-id="${escapeHtml(row.clubId)}"`;
  if (row.mainTab || row.filters) {
    const target = row.mainTab || 'competitions';
    const filterPayload = row.filters ? ` data-ai-filters="${escapeHtml(encodeURIComponent(JSON.stringify(row.filters)))}"` : '';
    return `data-main-target="${escapeHtml(target)}"${filterPayload}`;
  }
  return '';
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
    const confidence = report.cards?.find(([label]) => label === '参考强度')?.[1] || '历史画像对比';
    rows.push({
      label: '依据',
      value: confidence,
      detail: '优先看直接交手，其次看共同赛事、近期状态和历史成绩画像。',
    });
  } else if (report.type === 'club-comparison') {
    rows.push({
      label: '依据',
      value: '成绩对比',
      detail: '按参赛人次、前八、奖牌和冠军数对比，再结合前八率和赛事级别判断。',
    });
  } else if (report.type === 'growth') {
    rows.push({
      label: '依据',
      value: '成长趋势',
      detail: '按最近参赛、最好名次、奖牌和淘汰赛记录综合判断。',
    });
  } else if (report.type === 'club') {
    rows.push({
      label: '依据',
      value: '俱乐部画像',
      detail: '按参赛人次、前八、奖牌、代表选手和优势项目综合判断。',
    });
  } else if (report.type === 'club-recruiting') {
    rows.push({
      label: '依据',
      value: '招生展示',
      detail: '按成绩资产、优势项目、代表学员和对外沟通素材综合判断。',
    });
  } else if (report.type === 'prematch') {
    rows.push({
      label: '依据',
      value: '赛前信息',
      detail: '按赛事状态、项目明细、报名名单和关注选手匹配生成。',
    });
  } else if (report.type === 'competition-stats') {
    rows.push({
      label: '依据',
      value: '赛事筛选',
      detail: '按年份、月份、地区和状态筛选赛事列表。',
    });
  } else if (report.type === 'business-insight') {
    rows.push({
      label: '依据',
      value: '商业机会',
      detail: '按赛事资产、选手画像、俱乐部画像和赛前机会判断服务方向。',
    });
  } else if (report.type === 'product-template') {
    rows.push({
      label: '依据',
      value: '报告服务',
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
    'club-comparison': [
      '先看同一范围内的参赛人次、前八、奖牌和冠军数量，再判断谁更占优。',
      '下一步建议继续看前八率、奖牌率、团体赛是否纳入和赛事级别。',
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
      '先把赛前提醒和选手成长报告做成稳定服务。',
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
  if (report.type === 'club-comparison') {
    const [left, right] = String(report.title || '').split(/\s+vs\s+/i);
    return [
      left && right ? `看2026年，${left}和${right}谁更强？` : '',
      left && right ? `看U10男花，${left}和${right}的前八率谁更高？` : '',
    ].filter(Boolean);
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
      report.templateKind === 'prematch-pack' ? '天津近期报名情况' : '查看赛前提醒',
    ];
  }
  return aiPromptPresets().slice(0, 2);
}

function isUserFacingAiSection(section = {}) {
  const title = String(section.title || '').trim();
  if (!title) return false;
  if (/分析口径|判断路径|判断依据|下一步|后续|继续问|数据边界|边界|口径/.test(title)) return false;
  return true;
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
  const visibleSections = (report.sections || []).filter(isUserFacingAiSection);
  const lines = [
    `FencingAI 分析：${report.title || '数据分析'}`,
    report.summary || '',
  ];

  if (report.cards?.length) {
    lines.push('', '关键指标');
    report.cards.slice(0, 6).forEach(([label, value]) => lines.push(`- ${label}：${value}`));
  }

  const evidenceKinds = [...new Set((report.evidence || []).map((row) => aiEvidenceKind(row)).filter(Boolean))].slice(0, 3);
  if (report.evidence?.length) {
    lines.push('', '参考来源');
    lines.push(`- ${report.evidence.length} 条可回查记录${evidenceKinds.length ? `：${evidenceKinds.join(' / ')}` : ''}`);
  }

  visibleSections.slice(0, 4).forEach((section) => {
    lines.push('', section.title);
    (section.rows || []).slice(0, 5).forEach((row) => lines.push(`- ${row}`));
  });

  const nextSteps = aiNextStepRows(report).slice(0, 2);
  if (nextSteps.length) {
    lines.push('', '下一步');
    nextSteps.forEach((row) => lines.push(`- ${row}`));
  }

  lines.push('', '由 FencingAI 基于公开赛事数据生成');
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
      primaryLabel: '关注赛前提醒',
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
  if (type === 'club' || type === 'club-recruiting' || type === 'club-comparison') {
    return {
      source: type === 'club-recruiting' ? 'ai-club-recruiting-answer' : type === 'club-comparison' ? 'ai-club-comparison-answer' : 'ai-club-answer',
      title: '建立剑馆经营看板',
      detail: type === 'club-comparison' ? '适合持续跟踪同项目竞争对手、优势项目和招生表达。' : '适合把学员分层、强项项目和招生素材做成固定工作台。',
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
      detail: type === 'product-template' ? `围绕“${title}”验证真实用户是否愿意持续使用。` : '适合验证赛前提醒、成长报告和教练工作台的商业转化。',
      primaryLabel: '申请试用',
      secondaryLabel: '了解会员权益',
    };
  }
  return {
    source: `ai-${type}-answer`,
    title: '持续使用这类分析',
    detail: '适合把本次分析沉淀为提醒、报告或工作台。',
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
  if (type === 'club' || type === 'club-recruiting' || type === 'club-comparison' || report.templateKind === 'coach-segmentation') {
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
      '可查看赛前提醒和重点对手提示',
    ];
  }
  return [
    '把本次分析保存为报告入口',
    '围绕关注选手、赛事和俱乐部持续更新',
    '重要变化可形成长期报告',
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

function aiResultActionTitle(report = {}) {
  if (report.type === 'fallback' || report.type === 'empty') {
    const hasQueryAction = report.actions?.some((action) => action.query);
    const hasDirectAction = report.actions?.some((action) => !action.query);
    if (hasQueryAction && hasDirectAction) return '选择或换个问法';
    return hasQueryAction ? '换个问法' : '选择一个结果';
  }
  if (report.type === 'competition-stats' || report.type === 'prematch') return '查看赛事';
  if (report.type === 'growth' || report.type === 'comparison') return '查看选手';
  if (report.type === 'club' || report.type === 'club-comparison' || report.type === 'club-recruiting') return '查看剑馆';
  if (report.type === 'business-insight' || report.type === 'product-template') return '查看服务';
  return '打开相关页面';
}

function renderAiAnswer(report) {
  const visibleSections = (report.sections || [])
    .filter(isUserFacingAiSection)
    .slice(0, AI_ANSWER_SECTION_LIMIT)
    .map((section) => ({
      ...section,
      rows: (section.rows || []).slice(0, AI_ANSWER_SECTION_ROW_LIMIT),
    }))
    .filter((section) => section.rows.length);
  const primaryCards = (report.cards || []).slice(0, AI_ANSWER_CARD_LIMIT);
  const primaryActions = (report.actions || []).slice(0, AI_ANSWER_ACTION_LIMIT);
  const primaryEvidence = (report.evidence || []).slice(0, AI_ANSWER_EVIDENCE_LIMIT);
  const keyEvidence = primaryEvidence[0] || null;
  const secondaryEvidence = primaryEvidence.slice(1);
  const hiddenEvidenceCount = Math.max(0, (report.evidence?.length || 0) - 1 - secondaryEvidence.length);
  const remainingEvidenceCount = Math.max(0, (report.evidence?.length || 0) - 1);
  const enhancement = sanitizeAiEnhancement(report.enhancement || null);
  return `
    <div class="ai-answer-card">
      <div class="ai-answer-head">
        <span>${escapeHtml(report.type === 'comparison' ? '选手对比' : report.type === 'club-comparison' ? '剑馆对比' : report.type === 'growth' ? '成长分析' : report.type === 'club' ? '俱乐部画像' : report.type === 'prematch' ? '赛前提醒' : report.type === 'business-insight' ? '商业洞察' : report.type === 'product-template' ? '报告服务' : report.type === 'club-recruiting' ? '招生展示' : '查询结果')}</span>
        <strong>${escapeHtml(report.title)}</strong>
        <p>${escapeHtml(report.summary)}</p>
      </div>
      ${enhancement ? `
        <div class="ai-enhancement-card">
          <strong>${escapeHtml(enhancement.headline || '补充解读')}</strong>
          ${enhancement.explanation ? `<p>${escapeHtml(enhancement.explanation)}</p>` : ''}
          ${enhancement.takeaways?.length ? `
            <div>
              ${enhancement.takeaways.slice(0, 4).map((row) => `<span>${escapeHtml(row)}</span>`).join('')}
            </div>
          ` : ''}
          ${enhancement.caveats?.length ? `
            <em>${escapeHtml(enhancement.caveats.slice(0, 2).join('；'))}</em>
          ` : ''}
        </div>
      ` : ''}
      ${primaryCards.length ? `
        <div class="ai-metric-grid">
          ${primaryCards.map(([label, value]) => `
            <div class="ai-metric">
              <strong>${escapeHtml(value)}</strong>
              <span>${escapeHtml(label)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${visibleSections.map((section) => `
        <div class="ai-section">
          <strong>${escapeHtml(section.title)}</strong>
          ${section.rows.map((row) => `<span>${escapeHtml(row)}</span>`).join('')}
        </div>
      `).join('')}
      ${keyEvidence ? `
        <div class="ai-key-source">
          <strong>关键来源</strong>
          <button type="button" ${aiEvidenceTargetAttributes(keyEvidence)}>
            <em>${escapeHtml(aiEvidenceKind(keyEvidence))}</em>
            <span>${escapeHtml(keyEvidence.label)}</span>
            <small>${escapeHtml(aiEvidenceActionLabel(keyEvidence))}</small>
          </button>
        </div>
      ` : ''}
      ${primaryActions.length ? `
        <div class="ai-action-block">
          <strong>${escapeHtml(aiResultActionTitle(report))}</strong>
          <div class="ai-action-row">
            ${primaryActions.map((action) => `
              <button type="button" ${action.query ? `data-ai-action-query="${escapeHtml(action.query)}"` : ''} ${action.athleteId ? `data-athlete-id="${escapeHtml(action.athleteId)}"` : ''} ${action.parentGrowthAthleteId ? `data-parent-growth-athlete-id="${escapeHtml(action.parentGrowthAthleteId)}"` : ''} ${action.coachSegmentationClubId ? `data-coach-segmentation-club-id="${escapeHtml(action.coachSegmentationClubId)}"` : ''} ${action.followAthleteId ? `data-follow-athlete-id="${escapeHtml(action.followAthleteId)}"` : ''} ${action.followCompetitionCode ? `data-follow-competition-code="${escapeHtml(action.followCompetitionCode)}"` : ''} ${action.sportCode ? `data-sport-code="${escapeHtml(action.sportCode)}"` : ''} ${action.clubId ? `data-club-id="${escapeHtml(action.clubId)}"` : ''} ${action.prematchTemplateKind ? `data-prematch-template="${escapeHtml(action.prematchTemplateKind)}"` : ''} ${action.prematchSportCode ? `data-prematch-sport-code="${escapeHtml(action.prematchSportCode)}"` : ''} ${action.mainTab ? `data-main-target="${escapeHtml(action.mainTab)}"` : ''} ${action.filters ? `data-ai-filters="${escapeHtml(encodeURIComponent(JSON.stringify(action.filters)))}"` : ''}>
                ${escapeHtml(action.label)}
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}
      ${remainingEvidenceCount ? `
        <details class="ai-evidence" data-ai-evidence-details>
          <summary>
            <strong>更多来源</strong>
            <span>${escapeHtml(remainingEvidenceCount)} 条可核对</span>
          </summary>
          <div class="ai-evidence-list">
            ${secondaryEvidence.map((row) => `
              <button type="button" ${aiEvidenceTargetAttributes(row)}>
                <em>${escapeHtml(aiEvidenceKind(row))}</em>
                <strong>${escapeHtml(row.label)}</strong>
                <span>${escapeHtml(row.detail)}</span>
                <small>${escapeHtml(aiEvidenceActionLabel(row))}</small>
              </button>
            `).join('')}
            ${hiddenEvidenceCount ? `<div class="ai-evidence-summary">还有 ${escapeHtml(hiddenEvidenceCount)} 条来源，可在详情页继续核对。</div>` : ''}
          </div>
        </details>
      ` : ''}
      <div class="ai-share-row">
        <button type="button" data-ai-share>复制分析摘要</button>
      </div>
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
  container.querySelectorAll('[data-ai-action-query]').forEach((button) => {
    button.addEventListener('click', () => submitAiQuery(button.dataset.aiActionQuery || ''));
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
  const followCopy = myFollowSectionCopy();
  const focusTrialReport = state.userRole === 'coach'
    ? '学员提醒服务'
    : state.userRole === 'club'
      ? '代表选手提醒服务'
      : state.userRole === 'data'
        ? '关注提醒服务'
        : '孩子提醒服务';
  const focusTrialSource = state.userRole === 'coach'
    ? 'focus-workspace-coach'
    : state.userRole === 'club'
      ? 'focus-workspace-club'
      : state.userRole === 'data'
        ? 'focus-workspace-data'
        : 'focus-workspace-parent';
  focusPage.innerHTML = `
    <section class="panel focus-dashboard">
      <div class="section-title">
        <h2>关注工作台</h2>
        <span>赛前与成长</span>
      </div>
      <div class="focus-dashboard-grid">
        <div>
          <strong>${escapeHtml(children.length)}</strong>
          <span>${escapeHtml(followCopy.statLabel)}</span>
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
        <span>${escapeHtml(priorityCompetitions.length ? `把关注赛事、${followCopy.countLabel}和赛前提醒固定下来，关键比赛前直接查看。` : `添加${followCopy.countLabel}或赛事后，可持续形成赛前提醒、成长报告和复盘入口。`)}</span>
      </div>
      <div class="focus-trial-actions">
        <button type="button" data-reminder-interest data-commercial-source="focus-reminder" data-report-title="关注提醒订阅">订阅提醒</button>
        <button type="button" data-commercial-intent="pilot" data-commercial-source="${escapeHtml(focusTrialSource)}" data-report-title="${escapeHtml(focusTrialReport)}">申请试用</button>
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
                ${isPrematchCompetition(competition) ? `<button type="button" data-focus-prematch="${escapeHtml(competition.sportCode)}">赛前提醒</button>` : ''}
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
  renderAccountLoginPage();
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
      detail: `${firstCompetition.sportName || '关注赛事'} 可查看赛前提醒和重点对手提示。`,
      cta: '查看赛前',
      sportCode: firstCompetition.sportCode,
    });
  }
  if (reportHistory.length || aiHistory.length) {
    rows.push({
      action: 'pilot',
      title: '保存长期分析',
      detail: '把成长、赛前和训练相关分析长期保存，方便随时回看。',
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
  const athleteDataRequests = athleteDataRequestRows();
  const athleteDataRequestCount = (state.athleteDataRequests || []).length;
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
    { value: aiHistory.length, label: '最近分析' },
    { value: commercialIntentCount, label: '服务沟通' },
    { value: athleteDataRequestCount, label: '档案请求' },
    { value: recentRows.length, label: '最近查看' },
  ];
  const primaryStats = stats.slice(0, 4);
  const secondaryStats = stats.slice(4);
  const isSignedIn = Boolean(state.authUser);
  const accountTitle = isSignedIn
    ? (state.authUser.displayName || state.authUser.identifier || '已登录用户')
    : '账号未登录';
  const accountTag = `使用视角：${roleLabel(state.userRole || 'parent')}`;
  const accountDetail = isSignedIn
    ? '关注、报告和历史会保存到当前账号。'
    : '可以浏览公开赛事；登录后可保存关注、报告和历史。';

  myPage.innerHTML = `
    <section class="my-hero panel ${isSignedIn ? 'signed' : 'guest'}">
      <div>
        <span>${escapeHtml(isSignedIn ? '账号中心' : '访问状态')}</span>
        <strong>${escapeHtml(accountTitle)}</strong>
        <i class="account-view-tag">${escapeHtml(accountTag)}</i>
        <em>${escapeHtml(accountDetail)}</em>
      </div>
      <div class="my-hero-actions">
        <button type="button" data-role-switch>切换视角</button>
        ${isSignedIn ? '' : '<button type="button" data-account-open-login>登录</button>'}
      </div>
    </section>

    <section class="my-stat-grid">
      ${primaryStats.map((item) => `
        <div class="my-stat">
          <strong>${escapeHtml(item.value)}</strong>
          <span>${escapeHtml(item.label)}</span>
        </div>
      `).join('')}
    </section>

    <section class="my-secondary-status" aria-label="我的记录">
      ${secondaryStats.map((item) => `
        <div>
          <strong>${escapeHtml(item.value)}</strong>
          <span>${escapeHtml(item.label)}</span>
        </div>
      `).join('')}
    </section>

    ${renderAccountPanelV2()}

    <section class="panel my-section my-next-section">
      <div class="section-title">
        <h2>推荐操作</h2>
        <span>下一步</span>
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
        <h2>最近报告</h2>
        <span>${reportNextActions.length ? '继续查看' : '暂无报告'}</span>
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
      ` : '<div class="empty compact-empty">生成成长报告、赛前提醒或教练报告后，可以在这里继续查看。</div>'}
    </section>

    <section class="panel my-section my-prematch-section">
      <div class="section-title">
        <h2>近期赛前提醒</h2>
        <span>${prematchReminderRows.length ? '赛前提醒' : '待关注'}</span>
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
                <button type="button" data-my-prematch-report="${escapeHtml(row.sportCode)}">赛前提醒</button>
                <button type="button" data-reminder-interest data-commercial-source="my-prematch-reminder" data-report-title="${escapeHtml(row.title)}提醒">订阅提醒</button>
                ${row.isFollowed ? '' : `<button type="button" data-my-prematch-follow="${escapeHtml(row.sportCode)}">加入提醒</button>`}
              </div>
            </article>
          `).join('')}
        </div>
      ` : '<div class="empty compact-empty">关注近期赛事后，这里会形成赛前提醒入口。</div>'}
    </section>

    ${renderCommercialIntentStatus(commercialIntents)}

    ${renderAthleteDataRequestStatus(athleteDataRequests)}

    ${renderMembershipBenefits()}

    <section class="panel my-section trial-deliverable-section">
      <div class="section-title">
        <h2>可以生成什么</h2>
        <span>下一步</span>
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
        <h2>推荐服务</h2>
        <span>按你的关注</span>
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
        <h2>可以继续做什么</h2>
        <span>按你的关注</span>
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
        <h2>我的内容</h2>
        <span>保存记录</span>
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
        `).join('') : '<div class="empty compact-empty">生成成长报告、赛前提醒或教练报告后，会显示在这里。</div>'}
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
        <h2>赛事数据</h2>
        <span>${escapeHtml(generatedLabel || '最近更新待确认')}</span>
      </div>
      <div class="my-status-note">
        <strong>${escapeHtml(state.dataCoverage?.scorePackages || state.competitions.length || 0)}</strong>
        <span>赛事、项目和赛果会持续更新；有报名名单时，可查看赛前对手分析。</span>
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
  myPage.querySelector('[data-account-login]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    submitAccountLogin(event.currentTarget);
  });
  myPage.querySelector('[data-account-open-login]')?.addEventListener('click', () => {
    state.showAccountLoginForm = false;
    state.accountStatus = '';
    renderAccountLoginPage();
    navigateTo('accountLogin');
  });
  myPage.querySelector('[data-account-logout]')?.addEventListener('click', () => logoutAccount());
  myPage.querySelector('[data-account-export]')?.addEventListener('click', (event) => exportAccountData(event.currentTarget));
  myPage.querySelector('[data-account-clear]')?.addEventListener('click', (event) => clearAccountData(event.currentTarget));
  myPage.querySelector('[data-wechat-login]')?.addEventListener('click', () => showWechatAuthStatus());
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
  myPage.querySelectorAll('[data-athlete-data-progress-athlete-id]').forEach((button) => {
    button.addEventListener('click', () => openAthlete(button.dataset.athleteDataProgressAthleteId || ''));
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
  if (days > 30 && days < 99999) return `未来赛程 · ${itemText}`;
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
  const coachRows = state.coachSearchResults || [];
  const refereeRows = state.refereeSearchResults || [];
  const officialRows = [
    ...coachRows.map((row) => ({ ...row, roleLabel: '教练员' })),
    ...refereeRows.map((row) => ({ ...row, roleLabel: '裁判员' })),
  ];
  const hasCompetitionResults = Boolean(keyword && state.filteredCompetitions.length);
  searchAthletesPanel.hidden = !keyword || (!athleteRows.length && !clubRows.length && !officialRows.length && !hasCompetitionResults);
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
    ${officialRows.length ? `
      <div class="result-group-label">教练员 / 裁判员</div>
      <div class="athlete-result-list">
        ${officialRows.map((person) => `
          <article class="athlete-result-card official-result-card">
            <div class="athlete-result-main">
              <strong>${escapeHtml(person.name)}</strong>
              <span>${escapeHtml([person.roleLabel, person.club, person.city || person.province].filter(Boolean).join(' · '))}</span>
              <em>${escapeHtml(person.matchReason || '公开资料匹配')}</em>
            </div>
            <div class="athlete-result-side">
              <b>${escapeHtml(person.level || '-')}</b>
              <span>${escapeHtml(person.competitionCount || 0)} 场</span>
            </div>
          </article>
        `).join('')}
      </div>
    ` : ''}
    ${!athleteRows.length && !clubRows.length && !officialRows.length && hasCompetitionResults ? `
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
  if (competition.status === 'live') {
    return '比赛进行中，可优先查看已出结果的项目和需要继续关注的组别。';
  }
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
        ${state.aiCompetitionFilterQuestion ? `<strong>来自提问：${escapeHtml(state.aiCompetitionFilterQuestion)}</strong>` : ''}
        <span>${escapeHtml(state.aiCompetitionFilterSummary)} · ${escapeHtml(state.filteredCompetitions.length)} 场</span>
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
    : `${aiFilterNotice}<div class="empty">没有匹配的比赛。可以清除筛选，或减少年份、地区、项目条件后再看。</div>`;

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
    if (summary.rosterCount) {
      return `已有 ${summary.rosterCount} 条报名动态，可先看项目热度、主要俱乐部和重点选手。`;
    }
    const projectCount = competitionItemCount(competition);
    if (projectCount) {
      return `${projectCount} 个项目可查看，适合先关注赛程和项目安排。`;
    }
    return '可先关注赛程、地点和报名窗口。';
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
    ${aiAnalyzeActionRow([
      { label: '查看赛事分析', query: `${competition.sportName} 有哪些重点信息和参赛判断` },
      { label: '查看赛前提醒', query: `${competition.sportName} 的报名情况和潜在对手` },
    ])}
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
        查看本场赛前提醒
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
  bindAiAnalyzeActions(competitionHero);
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

function competitionLiveProgressRows(competition) {
  const rows = competitionItemSummaries(competition);
  const scoredRows = rows.filter((item) => Number(item.playedEliminationMatchCount) || Number(item.poolQualifyNo) || Number(item.competitionNo));
  const pendingRows = rows.filter((item) => !scoredRows.includes(item));
  return { rows, scoredRows, pendingRows };
}

function competitionLiveCards(competition) {
  const progress = competitionLiveProgressRows(competition);
  const played = progress.scoredRows.reduce((sum, item) => sum + (Number(item.playedEliminationMatchCount) || 0), 0);
  return [
    {
      title: '赛事状态',
      value: statusLabel(competition.status || 'live'),
      detail: progress.scoredRows.length ? `${progress.scoredRows.length} 个项目已有结果` : '等待赛果更新',
    },
    {
      title: '已出结果',
      value: progress.scoredRows.length,
      detail: played ? `${played} 场淘汰赛` : '先看项目进展',
    },
    {
      title: '继续关注',
      value: progress.pendingRows.length || Math.max(competitionItemCount(competition) - progress.scoredRows.length, 0),
      detail: '按项目查看赛程进展',
    },
  ];
}

function renderCompetitionLivePanel(competition) {
  const progress = competitionLiveProgressRows(competition);
  const focusRows = sortedCompetitionEventRows(progress.scoredRows.length ? progress.scoredRows : progress.rows).slice(0, 5);
  const rows = [
    {
      title: progress.scoredRows.length ? '先看已出结果' : '先看项目安排',
      detail: progress.scoredRows.length
        ? `${progress.scoredRows.length} 个项目已有结果，可进入项目查看小组、单败表和排名。`
        : '比赛进行中，项目页会随成绩出现后用于复盘对手和晋级情况。',
    },
    {
      title: progress.pendingRows.length ? '继续关注项目' : '复盘重点项目',
      detail: progress.pendingRows.length
        ? `${progress.pendingRows.length} 个项目还适合继续关注赛程变化。`
        : '已出结果的项目可直接查看晋级、淘汰赛和最终排名。',
    },
  ];
  return `
    <div class="competition-live-panel">
      <div class="chart-title">比赛进行中</div>
      <div class="competition-live-rows">
        ${rows.map((row) => `
          <div>
            <strong>${escapeHtml(row.title)}</strong>
            <span>${escapeHtml(row.detail)}</span>
          </div>
        `).join('')}
      </div>
      ${focusRows.length ? `
        <div class="competition-live-items">
          ${focusRows.map((item) => `
            <div>
              <strong>${escapeHtml(displayEventName(item))}</strong>
              <span>${escapeHtml([
                Number(item.competitionNo) ? `${Number(item.competitionNo)} 人` : '',
                Number(item.playedEliminationMatchCount) ? `${Number(item.playedEliminationMatchCount)} 场淘汰赛` : '',
                Number(item.poolQualifyNo) ? `${Number(item.poolQualifyNo)} 人晋级` : '',
              ].filter(Boolean).join(' · ') || statusLabel(item.status || competition.status))}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
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

function competitionDigestPanel(rows, title = '赛后复盘') {
  if (!rows.length) return '';
  return `
    <div class="competition-digest-panel">
      <div class="chart-title">${escapeHtml(title)}</div>
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

function competitionChartDetails(content, summary = '查看结构图表') {
  const body = String(content || '').trim();
  if (!body) return '';
  return `
    <details class="competition-chart-details">
      <summary>${escapeHtml(summary)}</summary>
      <div class="competition-chart-stack">
        ${body}
      </div>
    </details>
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
      : '可先看比赛时间、地点和重点项目，报名公布后再细化到选手对标。',
  });
  rows.push({
    title: '关注方式',
    detail: '关注赛事后，赛程、报名或成绩变化时可快速回到这场比赛继续查看。',
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
            `).join('') || '<div><strong>重点项目</strong><span>报名公布后会按项目整理。</span></div>'}
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
              <span>${escapeHtml(row.count ? `${row.count} 人` : '人数待公布')}</span>
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
  const isLiveCompetition = competition.status === 'live';

  const displayCards = isLiveCompetition
    ? competitionLiveCards(competition)
    : isPreEventCompetition ? competitionPreEventCards(competition) : cards.slice(0, 2);
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

  if (isLiveCompetition) {
    competitionInsightBullets.innerHTML = `
      ${renderCompetitionLivePanel(competition)}
      ${primaryEventRows.length > 1 ? eventTiles('重点项目', primaryEventRows) : ''}
    `;
    return;
  }

  if (isPreEventCompetition) {
    competitionInsightBullets.innerHTML = `
      ${renderCompetitionPreEventPanel(competition)}
      ${primaryEventRows.length > 1 ? eventTiles('重点项目', primaryEventRows) : ''}
    `;
    return;
  }

  const digestRows = competitionDigestRows(competition, insights, primaryEventRows, birthRows);
  const chartContent = `
    ${donutChart('赛事结构', densityRows)}
    ${birthRows.length ? barChart('主要年龄段', birthRows, { tone: 'orange' }) : '<div class="empty compact-empty">暂无年龄段数据</div>'}
    ${primaryEventRows.length > 1 ? eventTiles('主要项目对比', primaryEventRows) : ''}
  `;
  competitionInsightBullets.innerHTML = `
    ${competitionDigestPanel(digestRows, '赛后复盘')}
    ${competitionChartDetails(chartContent)}
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
        ? `${displayEventName(primary)} · ${registered ? `报名 ${registered} 人` : expected ? `预计 ${expected} 人` : '人数待公布'}`
        : '先关注比赛时间、地点和报名窗口。',
    });
    rows.push({
      title: rosterRows.length ? '赛前可看对手' : '赛前观察重点',
      detail: rosterRows.length
        ? `已有 ${rosterRows.length} 人次报名，可进入项目查看同组选手和重点对手。`
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
        expected ? `${expected} 人` : '人数待公布',
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
    ${aiAnalyzeActionRow([
      { label: '分析项目', query: `${event.sportName} ${displayEventName(event)} 项目表现和关键选手` },
      { label: '复盘对手', query: `${displayEventName(event)} 的淘汰赛关键对手和排名反差` },
    ])}
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
  bindAiAnalyzeActions(eventHero);
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
      <div class="chart-title">赛前提醒</div>
      <div class="event-prematch-summary">
        <strong>${escapeHtml(hasRoster ? `${model.registered} 条报名动态` : '报名动态持续更新')}</strong>
        <span>${escapeHtml(hasRoster ? '先看报名热度、主要俱乐部和可重点关注选手。' : '先看比赛时间、项目热度和同项目历史强手。')}</span>
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
    clubProfiles.innerHTML = '<div class="empty">本场暂时没有可展开的俱乐部画像，可先查看俱乐部分布。</div>';
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
    athleteProfiles.innerHTML = '<div class="empty">本场暂时没有可展开的选手画像，可先查看名单和排名。</div>';
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
  const typeLabel = requestType === 'hide'
    ? '申请隐藏公开选手画像'
    : requestType === 'claim-athlete'
      ? '认领选手档案'
      : '申请纠错或合并同名选手';
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
      : requestType === 'claim-athlete'
        ? '申请说明：希望认领该选手档案，用于成长报告、赛前提醒和数据核验。'
        : '申请说明：需要更正姓名、俱乐部、赛事记录，或合并同名选手画像。',
    details.note ? `补充说明：${details.note}` : '补充说明：用户未填写。',
  ].filter(Boolean).join('\n');
}

function requestAthleteDataRequestDetails(athlete, requestType) {
  const typeLabel = requestType === 'hide' ? '隐藏申请' : requestType === 'claim-athlete' ? '档案认领' : '纠错/合并申请';
  const existing = storedCommercialContact();
  const contactInput = window.prompt(`留下微信或手机号，方便核验${typeLabel}（可跳过）`, existing);
  if (contactInput === null) return null;
  const contact = saveCommercialContact(contactInput);
  const notePrompt = requestType === 'hide'
    ? `请说明和 ${athlete.name || '该选手'} 的关系，以及希望隐藏的原因`
    : requestType === 'claim-athlete'
      ? `请说明和 ${athlete.name || '该选手'} 的关系，例如家长、本人、教练或俱乐部负责人`
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
        <span>可认领档案用于成长报告和提醒；公开成绩如有误，也可以提交纠错、合并或隐藏申请。</span>
      </div>
      <div class="athlete-data-request-actions">
        <button type="button" data-athlete-request="claim-athlete">认领档案</button>
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
        const result = await submitAthleteDataRequest(athlete, button.dataset.athleteRequest, details);
        trackAthleteDataRequest(athlete, button.dataset.athleteRequest, details, result);
        renderMyPage();
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
    ${aiAnalyzeActionRow([
      { label: '查看成长分析', query: `分析${athlete.name}最近几场有没有进步` },
      { label: '对手对比', query: `分析${athlete.name}的主要对手和胜负情况` },
    ])}
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
  bindAiAnalyzeActions(athleteHero);

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
    return `${athlete.name}有 1 场参赛表现，最终第 ${latest.finalRank ?? '-'} 名。下一场重点看名次稳定性和小组赛发挥。`;
  }
  return `${athlete.name}有 ${events.length} 场参赛表现，最好名次第 ${best.finalRank ?? '-'} 名，最近一次第 ${latest.finalRank ?? '-'} 名。`;
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
      action: '重点安排强手对局、淘汰赛关键分和赛前提醒。',
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
      action: '先选择适合项目和低压力赛事，形成可追踪成长样本。',
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

function coachTrainingPlanRows(followups = [], buckets = [], projectRows = []) {
  const bucketByAthlete = new Map();
  (buckets || []).forEach((bucket) => {
    (bucket.rows || []).forEach((athlete) => {
      const key = athlete.id || `${athlete.name}-${athlete.club || ''}`;
      if (!bucketByAthlete.has(key)) bucketByAthlete.set(key, bucket);
    });
  });
  const topProject = projectRows[0]?.label || '重点项目';
  return (followups || []).slice(0, 4).map((row) => {
    const athlete = row.athlete || {};
    const key = athlete.id || `${athlete.name}-${athlete.club || ''}`;
    const bucket = bucketByAthlete.get(key) || {};
    const model = buildParentGrowthModel(athlete);
    const closeBout = parentGrowthCloseBoutRows(athlete);
    const title = bucket.key === 'score'
      ? '强手对局与收尾'
      : bucket.key === 'risk'
        ? '小组赛稳定性'
        : bucket.key === 'steady'
          ? '阶段提升巩固'
          : '参赛基础建立';
    const drill = bucket.key === 'score'
      ? '安排同水平或更强对手模拟，重点练领先后收尾和落后两剑追分。'
      : bucket.key === 'risk'
        ? '先做开局三剑、连续失分暂停和小组赛节奏训练。'
        : bucket.key === 'steady'
          ? '保持参赛节奏，增加淘汰赛关键分和不同类型对手适应。'
          : `围绕 ${topProject} 做基础动作、比赛规则和首场进入状态训练。`;
    const evidence = [
      row.poolText,
      row.trendText,
      closeBout.total ? `胶着局 ${closeBout.wins}胜${closeBout.losses}负` : '',
      model.latest ? `最近第 ${model.latest.finalRank ?? '-'} 名` : '',
    ].filter(Boolean).join(' · ');
    const target = bucket.key === 'risk'
      ? '下一场先看小组胜率和首场状态是否改善。'
      : bucket.key === 'score'
        ? '下一场重点看淘汰赛推进和胶着局处理。'
        : '下一场重点看名次是否前移、表现是否稳定。';
    return {
      athlete,
      title,
      drill,
      evidence,
      target,
      parentLine: `${athlete.name || '学员'} 这一阶段建议重点放在“${title}”。${target}`,
    };
  });
}

function coachTrainingPlanText(row = {}) {
  const athleteName = row.athlete?.name || '学员';
  return [
    `${athleteName} 训练安排`,
    `训练主题：${row.title || '阶段提升'}`,
    row.evidence ? `依据：${row.evidence}` : '',
    row.drill ? `训练安排：${row.drill}` : '',
    row.target ? `下场观察：${row.target}` : '',
    row.parentLine ? `给家长：${row.parentLine}` : '',
  ].filter(Boolean).join('\n');
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
      message: `${athlete.name || '孩子'}最近比赛记录已经可以做阶段复盘：${row.parentMessage} 训练重点：${row.training}`,
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
        : '先把最稳定的学员成长过程沉淀下来，作为招生案例。',
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
  const trainingRows = coachTrainingPlanRows(followups, buckets, projectRows);
  return [
    `${club.club} 学员分层报告`,
    `识别学员：${buckets.reduce((sum, bucket) => sum + bucket.rows.length, 0)} 人`,
    topProject ? `重点项目：${topProject.label}，参赛 ${topProject.entrants || 0} 人次，最好第 ${topProject.bestRank ?? '-'} 名` : '重点项目：待形成',
    ...buckets.map((bucket) => `${bucket.title}：${bucket.rows.map((athlete) => athlete.name).filter(Boolean).slice(0, 4).join(' / ') || '暂无'}。${bucket.action}`),
    ...followups.slice(0, 3).map((row, index) => `跟进${index + 1}：${row.athlete.name}，${row.training}`),
    ...trainingRows.slice(0, 3).map((row, index) => `训练安排${index + 1}：${row.athlete.name}，${row.title}。${row.target}`),
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
  const trainingRows = coachTrainingPlanRows(followups, buckets, projectRows);
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

    <article class="panel coach-segmentation-report-card coach-training-plan">
      <div class="section-title">
        <h2>训练安排卡</h2>
        <span>可直接使用</span>
      </div>
      <div class="coach-training-plan-list">
        ${trainingRows.length ? trainingRows.map((row, index) => `
          <article class="coach-training-plan-card">
            <div>
              <strong>${escapeHtml(row.athlete.name || '学员')}</strong>
              <span>${escapeHtml(row.title)}</span>
            </div>
            <p>${escapeHtml(row.drill)}</p>
            <em>${escapeHtml(row.evidence || '依据继续积累')}</em>
            <small>${escapeHtml(row.parentLine)}</small>
            <div class="coach-training-plan-actions">
              <button type="button" data-coach-training-plan="${escapeHtml(index)}">复制训练安排</button>
              <button type="button" data-athlete-id="${escapeHtml(row.athlete.id || '')}">看选手</button>
            </div>
          </article>
        `).join('') : '<div class="empty compact-empty">暂无可生成训练安排的学员。</div>'}
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
  coachSegmentationReportBody.querySelectorAll('[data-coach-training-plan]').forEach((button) => {
    const row = trainingRows[Number(button.dataset.coachTrainingPlan)];
    bindCopyTextButton(button, () => coachTrainingPlanText(row), 'coach-training-plan', '已复制，可直接用于训练沟通。');
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
    '以上内容基于公开赛事成绩整理，可用于家长沟通、续费反馈和招生展示。',
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
      detail: `${club.club} 有 ${club.entrants || 0} 人次参赛表现，累计 ${club.top8 || 0} 次前八、${club.medals || 0} 枚奖牌，最好第 ${club.bestRank ?? '-'} 名。`,
    },
    bestProject ? {
      title: '优势项目',
      detail: `${bestProject.label} 是当前最适合对外展示的项目，已有最好第 ${bestProject.bestRank ?? '-'} 名和 ${bestProject.top8 || 0} 次前八表现。`,
    } : topProject ? {
      title: '重点项目',
      detail: `${topProject.label} 参赛基础较完整，适合作为训练反馈和参赛规划的主线。`,
    } : null,
    strongestAthlete ? {
      title: '成长案例',
      detail: `${strongestAthlete.name} 已有 ${strongestAthlete.appearances || 0} 次参赛记录，最好第 ${strongestAthlete.bestRank ?? '-'} 名，可用于说明训练和比赛经验的积累。`,
    } : steadyAthletes.length ? {
      title: '成长案例',
      detail: `${steadyAthletes.map((athlete) => athlete.name).join('、')} 已形成连续参赛记录，可作为成长复盘样本。`,
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
        : `先围绕 ${topProject?.label || '参赛最多项目'} 安排基础训练和赛后复盘。`,
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
        : `先关注同项目近期赛事和本馆常参项目。`,
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
      detail: rosterRows.length ? '可以按项目拆训练重点。' : '先关注近期报名赛事和本馆优势项目。',
    },
    {
      title: '锁定强手',
      value: opponentPool.length ? `${opponentPool.length} 名可关注选手` : '样本积累中',
      detail: opponentPool.length ? '优先看同项目、最好名次靠前的选手。' : '先用本馆历史强项做备赛框架。',
    },
    {
      title: '近期赛程',
      value: relevantCompetitions.length ? `${relevantCompetitions.length} 场相关赛事` : '暂无匹配',
      detail: relevantCompetitions.length ? '用于安排赛前节奏和家长沟通。' : '先关注报名中和未开赛赛事。',
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
    : '先看近期赛事、优势项目和历史强手，确定本轮备赛重点。';

  return `
    <section class="coach-section prematch-section">
      <div class="section-title">
        <h2>赛前提醒</h2>
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
    ${aiAnalyzeActionRow([
      { label: '查看剑馆分析', query: `分析${club.club}的学员表现、优势项目和招生价值` },
      { label: '学员分层', query: `${club.club} 哪些学员适合重点培养` },
    ])}
  `;
  bindAiAnalyzeActions(clubHero);

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

function prematchActionPlanRows({
  competitions = [],
  focusRows = [],
  opponentRows = [],
  rosterRows = [],
  rosterProjectRows = [],
  rosterClubRows = [],
  isSingleCompetition = false,
} = {}) {
  const nearest = competitions[0] || null;
  const focusNames = focusRows.slice(0, 2).map((row) => row.athlete?.name).filter(Boolean);
  const opponentNames = opponentRows.slice(0, 2).map((athlete) => athlete.name).filter(Boolean);
  const projectLabels = rosterProjectRows.slice(0, 2).map((row) => row.label).filter(Boolean);
  const clubNames = rosterClubRows.slice(0, 2).map((row) => row.club).filter(Boolean);
  return [
    {
      key: 'roster',
      title: '报名核对',
      label: rosterRows.length ? `${rosterRows.length} 人次` : '名单待补齐',
      detail: rosterRows.length
        ? `先核对 ${projectLabels.join('、') || '目标项目'} 的报名名单，确认关注对象是否进入对应项目。`
        : `${isSingleCompetition ? '本场' : '近期'}先按项目和时间准备，报名名单补齐后再复核对手。`,
      copy: rosterRows.length
        ? `报名名单已收录 ${rosterRows.length} 人次，优先核对 ${projectLabels.join('、') || '目标项目'}。`
        : '报名名单还未完整收录，先按赛事时间和项目范围准备，名单补齐后再更新对手判断。',
    },
    {
      key: 'focus',
      title: '重点对象',
      label: focusNames.length ? focusNames.join('、') : '先关注选手',
      detail: focusNames.length
        ? `围绕 ${focusNames.join('、')} 的历史项目、近期成绩和本场项目匹配做准备。`
        : '先关注孩子或学员，系统会把赛前报告切换到个人化项目匹配。',
      copy: focusNames.length
        ? `本次重点看 ${focusNames.join('、')}，先核对历史项目与本场项目是否匹配。`
        : '建议先关注孩子或学员，赛前报告会自动生成个人化准备重点。',
    },
    {
      key: 'opponents',
      title: '对手研究',
      label: opponentNames.length ? opponentNames.join('、') : '等待线索',
      detail: opponentNames.length
        ? `先看 ${opponentNames.join('、')} 的最好名次、最近表现和同项目稳定性。`
        : '当前强手样本不足，先用报名规模、主要俱乐部和项目结构判断难度。',
      copy: opponentNames.length
        ? `重点对手先看 ${opponentNames.join('、')}，训练上优先准备小组稳定性和淘汰赛关键分。`
        : '当前强手线索不足，先观察报名规模、主要俱乐部和项目结构。',
    },
    {
      key: 'communication',
      title: '赛前沟通',
      label: nearest ? displayDateLabel(nearest.dateLabel) : '待定',
      detail: nearest
        ? `把 ${nearest.sportName} 的时间、项目、关注对象和对手线索整理给家长/学员。`
        : '没有明确目标赛事时，先整理关注对象的历史项目和下一场可能参赛方向。',
      copy: [
        nearest ? `赛事：${nearest.sportName}` : '赛事：近期赛前赛事',
        nearest ? `时间地点：${displayDateLabel(nearest.dateLabel)} · ${nearest.venue || nearest.region || '地点待确认'}` : '',
        clubNames.length ? `主要报名俱乐部：${clubNames.join('、')}` : '',
        focusNames.length ? `重点对象：${focusNames.join('、')}` : '',
        opponentNames.length ? `重点对手：${opponentNames.join('、')}` : '',
      ].filter(Boolean).join('\n'),
    },
  ];
}

function prematchActionPlanText(row = {}) {
  return [
    row.title || '赛前动作',
    row.label ? `状态：${row.label}` : '',
    row.detail ? `建议：${row.detail}` : '',
    row.copy ? `沟通内容：${row.copy}` : '',
  ].filter(Boolean).join('\n');
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
  const title = isSingleCompetition && nearest ? `${nearest.sportName} 赛前提醒页` : '近期赛前提醒页';
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
  const actionPlanRows = prematchActionPlanRows({ competitions, focusRows, opponentRows, rosterRows, rosterProjectRows: rosterProjects, rosterClubRows: rosterClubs, isSingleCompetition });
  return [
    isSingleCompetition && nearest ? `${nearest.sportName} 赛前提醒` : '赛前提醒',
    nearest ? `赛事：${nearest.sportName}` : '赛事：近期赛前赛事',
    nearest ? `时间地点：${displayDateLabel(nearest.dateLabel)} · ${nearest.venue || nearest.region || '地点待确认'}` : '',
    `相关赛事：${competitions.length} 场`,
    rosterRows.length ? `报名名单：${rosterRows.length} 人次` : '',
    ...rosterProjects.map((row, index) => `报名项目${index + 1}：${row.label}，${row.count} 人`),
    ...rosterClubs.map((row, index) => `主要俱乐部${index + 1}：${row.club}，${row.count} 人次，覆盖 ${row.projectCount} 个项目`),
    `关注对象：${focusRows.length} 人，强手线索：${opponentRows.length} 个`,
    ...focusRows.slice(0, 3).map((row, index) => `关注对象${index + 1}：${row.athlete.name}，${row.advice}`),
    ...opponentRows.slice(0, 3).map((athlete, index) => `强手线索${index + 1}：${athlete.name}，最好第 ${athlete.bestRank ?? '-'} 名`),
    ...actionPlanRows.slice(0, 4).map((row, index) => `赛前动作${index + 1}：${row.title}，${row.detail}`),
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
      ` : '<div class="empty compact-empty">关注孩子或学员后，赛前提醒会优先显示和他相关的项目、名单和强手线索。</div>'}
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
  const actionPlanRows = prematchActionPlanRows({ competitions, focusRows, opponentRows, rosterRows, rosterProjectRows, rosterClubRows, isSingleCompetition });

  prematchReportHero.innerHTML = `
    <div class="hero-title">${escapeHtml(isSingleCompetition ? '本场赛前提醒' : '赛前提醒')}</div>
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
    prematchShareButton.insertAdjacentHTML('afterend', '<button class="report-share-action secondary" type="button" data-report-share="prematch-page">复制提醒页</button>');
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

    <article class="panel prematch-report-card prematch-action-plan">
      <div class="section-title">
        <h2>赛前执行计划</h2>
        <span>可复制</span>
      </div>
      <div class="prematch-action-plan-list">
        ${actionPlanRows.map((row, index) => `
          <article class="prematch-action-plan-card prematch-action-plan-${escapeHtml(row.key)}">
            <div>
              <strong>${escapeHtml(row.title)}</strong>
              <span>${escapeHtml(row.label)}</span>
              <em>${escapeHtml(row.detail)}</em>
            </div>
            <button type="button" data-prematch-action-plan="${escapeHtml(index)}">复制动作</button>
          </article>
        `).join('')}
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
              ].filter(Boolean).join(' · ') || '项目人数待公布')}</span>
              <em>${escapeHtml(selectedCompetition.venue || selectedCompetition.region || '地点待确认')}</em>
            </button>
          `).join('') : '<div class="empty compact-empty">本场项目安排暂未公布，先按赛事时间和报名状态安排关注。</div>'}
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
      title: isSingleCompetition ? '关注本场赛前提醒' : '保存赛前提醒',
      detail: isSingleCompetition ? '适合围绕本场报名、重点对象和强手线索持续更新。' : '适合把近期赛事、报名名单和关注对象做成赛前提醒。',
      primaryLabel: '关注赛前提醒',
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
  prematchReportBody.querySelectorAll('[data-prematch-action-plan]').forEach((button) => {
    const row = actionPlanRows[Number(button.dataset.prematchActionPlan)];
    bindCopyTextButton(button, () => prematchActionPlanText(row), 'prematch-action-plan', '已复制赛前动作。');
  });
  bindReportConversionActions(prematchReportBody);
  bindCopyTextButton(prematchReportHero.querySelector('[data-report-share="prematch"]'), () => buildPrematchShareText(competitions, focusRows, opponentRows, isSingleCompetition, relevanceRows, rosterRows), isSingleCompetition ? 'prematch-single' : 'prematch-pack', '已复制赛前提醒。');
  bindCopyTextButton(prematchReportHero.querySelector('[data-report-share="prematch-page"]'), () => buildPrematchPageShareText(competitions, isSingleCompetition, sportCode), 'prematch-page', '已复制提醒页，可直接发给家长或教练。');
}

function openPrematchReport(kind = 'prematch-pack', sportCode = '') {
  trackAnalyticsAction('open_report', sportCode ? 'prematch-single' : 'prematch-pack');
  renderPrematchReport(kind, sportCode);
  const competition = sportCode ? findCompetitionBySportCode(sportCode) : null;
  trackReportHistory({
    type: 'prematch',
    id: sportCode || kind,
    title: competition?.sportName || '赛前提醒',
    detail: competition ? [competition.venue, displayDateLabel(competition.dateLabel)].filter(Boolean).join(' · ') : '近期报名和未开赛赛事',
    typeLabel: '赛前提醒',
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
myFollowFilterButton?.addEventListener('click', () => openFilterSheet('follow'));
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
  state.publicEvents = result.publicEvents || null;
  state.competitions = result.competitions?.length ? result.competitions : buildCompetitionsFromEvents(result.events);
  state.competitionSearchCache.clear();
  await restoreAuthSession();
  renderHomeStats();
  renderRoleWorkspacePremium();
  renderParentDashboard();
  renderDatabaseDirectory();
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
renderDatabaseDirectory();
renderFeedPanel();
renderCompetitionList();
renderPersonalPages();

init().catch((error) => {
  state.isDataLoading = false;
  state.dataLoadError = error.message;
  renderHomeStats();
  renderDatabaseDirectory();
  renderFeedPanel();
  renderCompetitionList();
  renderPersonalPages();
  state.activeMainTab = 'home';
  state.viewStack = ['home'];
  showView('home');
});
