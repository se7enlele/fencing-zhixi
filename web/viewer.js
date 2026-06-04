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
const feedPanel = document.querySelector('#feedPanel');
const searchAthletesPanel = document.querySelector('#searchAthletesPanel');
const followPanel = document.querySelector('#followPanel');
const memberCta = document.querySelector('#memberCta');
const homeStats = document.querySelector('#homeStats');
const homeStatsScope = document.querySelector('#homeStatsScope');
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
const insightCards = document.querySelector('#insightCards');
const insightBullets = document.querySelector('#insightBullets');
const analysisCharts = document.querySelector('#analysisCharts');
const metricGrid = document.querySelector('#metricGrid');
const championPath = document.querySelector('#championPath');
const leadersList = document.querySelector('#leadersList');
const opponentList = document.querySelector('#opponentList');
const participantsList = document.querySelector('#participantsList');
const poolGroups = document.querySelector('#poolGroups');
const matchList = document.querySelector('#matchList');
const clubList = document.querySelector('#clubList');
const clubProfiles = document.querySelector('#clubProfiles');
const athleteProfiles = document.querySelector('#athleteProfiles');
const momentumList = document.querySelector('#momentumList');
const athleteGrowth = document.querySelector('#athleteGrowth');
const tabs = document.querySelector('#tabs');
const FOLLOW_KEY = 'fencingai.followedAthletes.v1';
const DEVICE_KEY = 'fencingai.deviceId.v1';
const ROLE_KEY = 'fencingai.role.v1';
const CHILD_KEY = 'fencingai.parentChildId.v1';

const views = {
  roleHome: document.querySelector('#view-role-home'),
  parentHome: document.querySelector('#view-parent-home'),
  coachHome: document.querySelector('#view-coach-home'),
  clubHome: document.querySelector('#view-club-home'),
  competitions: document.querySelector('#view-competitions'),
  competition: document.querySelector('#view-competition-detail'),
  event: document.querySelector('#view-event-detail'),
  athlete: document.querySelector('#view-athlete-detail'),
  club: document.querySelector('#view-club-detail'),
};

const state = {
  competitions: [],
  filteredCompetitions: [],
  athleteSearchResults: [],
  clubSearchResults: [],
  currentCompetition: null,
  currentEvent: null,
  dataCoverage: null,
  athletesById: {},
  athleteSearchIndex: [],
  clubsById: {},
  clubSearchIndex: [],
  selectedRegion: '全部地区',
  selectedYear: '全部年份',
  selectedItem: '全部项目',
  selectedStatus: '全部状态',
  apiVersion: '',
  viewStack: ['roleHome'],
  deviceId: getDeviceId(),
  userRole: localStorage.getItem(ROLE_KEY) || '',
  selectedChildId: localStorage.getItem(CHILD_KEY) || '',
  followedAthletes: [],
  isDataLoading: true,
  dataLoadError: '',
};

state.followedAthletes = loadFollowedAthletes();

function loadFollowedAthletes() {
  try {
    return JSON.parse(localStorage.getItem(FOLLOW_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveFollowedAthletes() {
  localStorage.setItem(FOLLOW_KEY, JSON.stringify(state.followedAthletes.slice(0, 20)));
}

function setUserRole(role) {
  state.userRole = role;
  localStorage.setItem(ROLE_KEY, role);
  renderRoleWorkspacePremium();
  if (role === 'parent') {
    renderParentDashboard();
    navigateTo('parentHome');
  } else {
    navigateTo('competitions');
  }
}

function setSelectedChild(athleteId) {
  state.selectedChildId = athleteId || '';
  if (state.selectedChildId) localStorage.setItem(CHILD_KEY, state.selectedChildId);
  else localStorage.removeItem(CHILD_KEY);
  renderParentDashboard();
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

async function upsertFollowedAthlete(athlete) {
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
  const fromName = String(competition.sportName || '').match(/20\d{2}/)?.[0];
  const fromDate = String(competition.dateLabel || '').match(/20\d{2}/)?.[0];
  return fromDate || fromName || '日期待确认';
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
  return '暂无报名名单';
}

function coverageLabel(competition) {
  if (competition.isPlatformEventList && !(competition.items || []).length) return '赛事列表';
  if (competition.rosterStatus === 'partial' || competition.rosterStatus === 'complete') return '报名名单';
  if (competition.isPreEvent) return '项目清单';
  return '成绩对阵';
}

function coverageClass(competition) {
  if (competition.isPlatformEventList && !(competition.items || []).length) return 'coverage-list';
  if (competition.rosterStatus === 'partial' || competition.rosterStatus === 'complete') return 'coverage-roster';
  if (competition.isPreEvent) return 'coverage-project';
  return 'coverage-score';
}

function coverageDetail(competition) {
  if (competition.isPlatformEventList && !(competition.items || []).length) {
    return '当前只有赛事名称、时间、地区和组别；继续补 projectlist 后才有具体项目。';
  }
  if (competition.rosterStatus === 'partial') return '已导入部分报名名单，可做初步赛前对标，完整度仍需继续补。';
  if (competition.rosterStatus === 'complete') return '报名名单已完整，可做赛前对手、强手和熟悉对手分析。';
  if (competition.isPreEvent) return '已导入项目清单，可查看项目、人数规模和赛前数据缺口。';
  return '已导入成绩和对阵，可查看排名、小组赛、淘汰赛和选手画像。';
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

  for (const item of competition.items || []) {
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
  for (const club of state.clubSearchIndex || []) {
    if ((club.events || []).some((event) => (competition.items || []).some((item) => item.eventCode === event.eventCode))) {
      values.push(club.club);
    }
  }

  const normalized = normalizeSearchText(values.filter(Boolean).join(' '));
  return `${normalized} ${normalized.replace(/\s+/g, '')}`;
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
  searchShell.classList.toggle('collapsed', name !== 'competitions');
  topBack.classList.toggle('visible', name !== 'roleHome');
}

function scrollToPageTop() {
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
}

function navigateTo(name) {
  const current = state.viewStack[state.viewStack.length - 1];
  if (current !== name) state.viewStack.push(name);
  showView(name);
  scrollToPageTop();
}

function goBack() {
  if (state.viewStack.length <= 1) {
    showView('roleHome');
    scrollToPageTop();
    return;
  }
  state.viewStack.pop();
  showView(state.viewStack[state.viewStack.length - 1]);
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
    for (const item of competition.items || []) {
      const label = itemFilterLabel(item);
      if (label) labels.add(label);
    }
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
  const keyword = normalizeSearchText(searchInput.value);
  const tokens = searchTokens(keyword);
  const compactKeyword = keyword.replace(/\s+/g, '');
  const region = state.selectedRegion;
  const year = state.selectedYear;
  const itemFilter = state.selectedItem;
  const statusFilter = state.selectedStatus;
  state.filteredCompetitions = state.competitions.filter((competition) => {
    const matchRegion = region === '全部地区' || (competition.region || '待确认') === region;
    const matchYear = year === '全部年份' || competitionYear(competition) === year;
    const matchItem = itemFilter === '全部项目' || competition.items.some((item) => itemFilterLabel(item) === itemFilter);
    const matchStatus = statusFilter === '全部状态' || statusLabel(competition.status || 'completed') === statusFilter;
    const haystack = competitionSearchHaystack(competition);
    const matchKeyword = !keyword || tokens.every((token) => haystack.includes(token)) || haystack.includes(compactKeyword);
    return matchRegion && matchYear && matchItem && matchStatus && matchKeyword;
  });
  state.athleteSearchResults = keyword ? state.athleteSearchIndex
    .filter((athlete) => tokens.every((token) => athlete.searchText.includes(token)) || athlete.searchText.replace(/\s+/g, '').includes(compactKeyword))
    .map((athlete) => ({
      ...athlete,
      matchScore: entityMatchScore(athlete, keyword, [athlete.name, athlete.club]),
      matchReason: athleteMatchReason(athlete, keyword),
    }))
    .sort((a, b) => b.matchScore - a.matchScore || (a.name?.length || 99) - (b.name?.length || 99) || (a.bestRank ?? 999) - (b.bestRank ?? 999) || b.appearances - a.appearances)
    .slice(0, athleteSearchResultLimit(keyword)) : [];
  state.clubSearchResults = keyword ? state.clubSearchIndex
    .filter((club) => tokens.every((token) => club.searchText.includes(token)) || club.searchText.replace(/\s+/g, '').includes(compactKeyword))
    .map((club) => ({
      ...club,
      matchScore: entityMatchScore(club, keyword, [club.club]),
      matchReason: clubMatchReason(club, keyword),
    }))
    .sort((a, b) => b.matchScore - a.matchScore || (a.club?.length || 99) - (b.club?.length || 99) || (a.bestRank ?? 999) - (b.bestRank ?? 999) || b.entrants - a.entrants)
    .slice(0, 4) : [];
  renderAthleteSearchResults(keyword);
  renderHomeStats();
  renderFeedPanel();
  renderCompetitionList();
}

function sumCompetitionItems(competitions, getter) {
  return competitions.reduce((total, competition) => (
    total + competition.items.reduce((sum, item) => sum + (Number(getter(item, competition)) || 0), 0)
  ), 0);
}

function isFilteringActive() {
  return Boolean(normalizeSearchText(searchInput.value))
    || state.selectedYear !== '全部年份'
    || state.selectedRegion !== '全部地区'
    || state.selectedItem !== '全部项目'
    || state.selectedStatus !== '全部状态';
}

function renderHomeStats() {
  if (state.isDataLoading) {
    if (homeStatsScope) homeStatsScope.textContent = '加载中';
    homeStats.innerHTML = '<div class="loading-row">正在加载数据</div>';
    return;
  }
  if (state.dataLoadError) {
    if (homeStatsScope) homeStatsScope.textContent = '加载失败';
    homeStats.innerHTML = '';
    return;
  }
  const source = state.filteredCompetitions.length || isFilteringActive() ? state.filteredCompetitions : state.competitions;
  const eventCount = source.reduce((sum, competition) => sum + competition.items.length, 0);
  const athleteStarts = sumCompetitionItems(source, (item) => item.competitionNo);
  const eliminationMatches = sumCompetitionItems(source, (item) => item.playedEliminationMatchCount);
  const regions = new Set(source.map((competition) => competition.region).filter(Boolean)).size;
  const active = isFilteringActive();
  if (homeStatsScope) homeStatsScope.textContent = active ? '当前筛选' : '全部数据';

  homeStats.innerHTML = [
    ['比赛', source.length, `${regions} 地区`],
    ['项目', eventCount, `${eventCount} 成绩包`],
    ['人次', athleteStarts, '参赛'],
    ['淘汰', eliminationMatches, '对阵'],
  ].map(([label, value, detail]) => `
    <div class="stat-item">
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(label)}</span>
      <span>${escapeHtml(detail)}</span>
    </div>
  `).join('');
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
      ${model.yearRows.length ? barChart('年度参赛频率', model.yearRows, { tone: 'teal' }) : ''}
      <button class="primary-action compact-action" type="button" data-athlete-id="${escapeHtml(child.id)}">查看完整选手画像</button>
    </section>
  `;
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
            <em>${state.userRole === 'data' ? '你可以继续使用搜索、筛选和赛事入口。' : '当前先保留完整数据浏览，下一阶段会接入角色专属分析。'}</em>
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

function parseDateCandidates(value) {
  const text = String(value || '');
  const matches = [...text.matchAll(/(20\d{2})(?:[^\d]{0,3}(\d{1,2})(?:[^\d]{0,3}(\d{1,2}))?)?/g)];
  return matches.map((match) => new Date(Number(match[1]), Number(match[2] || 1) - 1, Number(match[3] || 1)))
    .filter((date) => !Number.isNaN(date.getTime()));
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
  const topItem = [...(competition.items || [])].sort((a, b) => (Number(b.competitionNo) || 0) - (Number(a.competitionNo) || 0))[0];
  const itemText = topItem ? `${displayEventName(topItem)}数据较完整` : '项目数据已收录';
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
    meta: `${competition.dateLabel} · ${competition.venue || competition.region || '地点待确认'}`,
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
      <span>精选</span>
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
  return (state.filteredCompetitions.length ? state.filteredCompetitions : state.competitions)
    .filter((competition) => (competition.items || []).some((item) => eventCodes.has(item.eventCode) || compactText(item.eventName).includes(compactText(club.club))))
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
                <span>${escapeHtml(competition.dateLabel)} · ${escapeHtml(competition.venue || competition.region || '地点待确认')}</span>
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
  const itemLabels = (competition.items || []).map((item) => displayEventName(item)).filter(Boolean);
  const groupLabels = itemLabels.length ? [] : (competition.groupLabels || []);
  const labels = [...itemLabels, ...groupLabels].filter(Boolean);
  const visible = labels.slice(0, limit);
  return {
    visible,
    remaining: Math.max(0, labels.length - visible.length),
  };
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
  competitionList.innerHTML = state.filteredCompetitions.length
    ? state.filteredCompetitions.map((competition) => `
      <button class="competition-card" data-sport-code="${escapeHtml(competition.sportCode)}">
        <div class="status-row">
          <span class="status-badge status-${escapeHtml(competition.status || 'completed')}">${escapeHtml(statusLabel(competition.status || 'completed'))}</span>
          <span class="coverage-badge ${escapeHtml(coverageClass(competition))}">${escapeHtml(coverageLabel(competition))}</span>
          ${competition.isPreEvent ? `<span class="roster-badge">${escapeHtml(rosterStatusLabel(competition.rosterStatus))}</span>` : ''}
        </div>
        <strong>${escapeHtml(competition.sportName)}</strong>
        <div class="meta-row">
          <span class="badge">${escapeHtml(competition.dateLabel)}</span>
          <span class="badge">${escapeHtml(competition.venue || competition.region || '地点待确认')}</span>
        </div>
        <div class="event-chip-row">
          ${competitionChips(competition, 4).visible.map((label) => `<span>${escapeHtml(label)}</span>`).join('')}
          ${competitionChips(competition, 4).remaining ? `<span>+${competitionChips(competition, 4).remaining}</span>` : ''}
        </div>
        <div class="card-insight">${escapeHtml(competitionListInsight(competition))}</div>
      </button>
    `).join('')
    : '<div class="empty">没有匹配的比赛</div>';

  competitionList.querySelectorAll('.competition-card').forEach((button) => {
    button.addEventListener('click', () => openCompetition(button.dataset.sportCode));
  });
}

function competitionListInsight(competition) {
  if (competition.isPlatformEventList && !competition.items.length) {
    const type = competition.platformMeta?.gameDesc || '赛事类型待确认';
    const groups = competition.groupLabels?.length ? `${competition.groupLabels.length} 个组别` : '组别待补齐';
    return `${type}，${groups}。已接入赛事列表；项目、名单和成绩需继续补齐。`;
  }
  if (competition.isPreEvent) {
    const summary = competition.registrationSummary || {};
    const rosterText = summary.rosterCount
      ? `已导入 ${summary.rosterCount} 条报名记录`
      : '暂未导入报名名单';
    const expectedText = summary.expectedRegistrationCount
      ? `官方项目报名人数 ${summary.expectedRegistrationCount}`
      : `${competition.items.length} 个赛前项目`;
    return `${expectedText}，${rosterText}。关注孩子后，可在名单完整时做赛前对标分析。`;
  }
  const total = competition.items.reduce((sum, item) => sum + (Number(item.competitionNo) || 0), 0);
  const elimination = competition.items.reduce((sum, item) => sum + (Number(item.playedEliminationMatchCount) || 0), 0);
  const topItem = [...competition.items].sort((a, b) => (Number(b.competitionNo) || 0) - (Number(a.competitionNo) || 0))[0];
  if (!topItem) return '暂无项目数据';
  return `${displayEventName(topItem)} 人数最多，${total} 人次参赛，${elimination} 场淘汰赛。`;
}

function renderCompetitionHero(competition) {
  const chips = competitionChips(competition);
  competitionHero.classList.add('compact');
  competitionHero.innerHTML = `
    <div class="status-row">
      <span class="status-badge status-${escapeHtml(competition.status || 'completed')}">${escapeHtml(statusLabel(competition.status || 'completed'))}</span>
      <span class="coverage-badge ${escapeHtml(coverageClass(competition))}">${escapeHtml(coverageLabel(competition))}</span>
      ${competition.isPreEvent ? `<span class="roster-badge">${escapeHtml(rosterStatusLabel(competition.rosterStatus))}</span>` : ''}
    </div>
    <div class="hero-title">${escapeHtml(competition.sportName)}</div>
    <div class="hero-sub">${escapeHtml(competition.venue || '地点待确认')} · ${escapeHtml(competition.dateLabel)}</div>
    <div class="hero-sub coverage-copy">${escapeHtml(coverageDetail(competition))}</div>
    <div class="event-chip-row">${chips.visible.map((label) => `<span>${escapeHtml(label)}</span>`).join('')}</div>
  `;
}

function renderCompetitionInsights(competition) {
  const insights = competition.insights || {};
  const cards = insights.summaryCards || [];
  const bullets = insights.bullets || [];

  competitionInsightCards.innerHTML = cards.slice(0, 2).map((item) => `
    <div class="metric">
      <strong>${escapeHtml(item.value ?? '-')}</strong>
      <span>${escapeHtml(item.title)}</span>
      <span>${escapeHtml(item.detail || '')}</span>
    </div>
  `).join('');

  const eventRows = insights.eventCharts || competition.items || [];
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
  const birthRows = (insights.birthBuckets || []).filter((row) => row.label !== '未知').map((row) => ({
    label: row.label,
    value: row.entrants,
    display: `${row.entrants}人 / 前八${row.top8}`,
  }));

  competitionInsightBullets.innerHTML = `
    ${donutChart('赛事结构', densityRows)}
    ${birthRows.length ? barChart('年龄段分布', birthRows, { tone: 'orange' }) : '<div class="empty compact-empty">暂无年龄段数据</div>'}
    ${eventRows.length > 1 ? eventTiles('项目对比', eventRows) : ''}
    ${bullets.length ? `<div class="insight-note compact">${escapeHtml(bullets[0])}</div>` : ''}
  `;
}

function findCompetitionBySportCode(sportCode) {
  return state.competitions.find((competition) => competition.sportCode === sportCode) || null;
}

function setInlineError(container, message) {
  container.innerHTML = `<div class="empty">${escapeHtml(message)}</div>`;
}

function renderEventList(competition) {
  if (!competition.items.length) {
    eventList.innerHTML = `
      <div class="empty compact-empty">
        已接入赛事列表，但还没有导入项目清单。继续导入 projectlist 后，这里会显示具体组别、剑种、报名人数和后续成绩入口。
      </div>
    `;
    return;
  }

  eventList.innerHTML = competition.items.map((item) => `
    <button class="event-card" data-event-code="${escapeHtml(item.eventCode)}">
      <strong>${escapeHtml(displayEventName(item))}</strong>
      <div class="subline">${escapeHtml(item.openDate || competition.dateLabel)}</div>
      <div class="event-meta">
        <span class="badge">${item.competitionNo} 人</span>
        <span class="badge">${item.poolQualifyNo} 晋级</span>
        <span class="badge">${item.playedEliminationMatchCount} 场淘汰赛</span>
      </div>
    </button>
  `).join('');

  eventList.querySelectorAll('.event-card').forEach((button) => {
    button.addEventListener('click', () => openEvent(button.dataset.eventCode));
  });
}

function renderEventHero(event) {
  eventHero.classList.add('compact');
  eventHero.innerHTML = `
    <div class="hero-title">${escapeHtml(displayEventName(event))}</div>
    <div class="hero-sub">${escapeHtml(event.sportName)}</div>
    <div class="hero-sub">${escapeHtml(event.venue || '地点待确认')} · ${escapeHtml(event.openDate || '日期待确认')}</div>
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
    ? rows.map((row) => `
      <div class="leader-card">
        <div>
          <strong>${escapeHtml(row.name)}</strong>
          <div class="subline">${escapeHtml(row.club || '')} · ${row.wins}胜${row.losses}负 · 净胜 ${row.diff}</div>
        </div>
        <div class="value">${row.scored}:${row.received}</div>
      </div>
    `).join('')
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
  const rows = event.topPoolStanding || [];
  if (!rows.length) {
    poolStanding.innerHTML = '<div class="empty">暂无小组赛排名</div>';
    return;
  }

  poolStanding.innerHTML = `
    <table>
      <thead>
        <tr><th>名次</th><th>选手</th><th>俱乐部</th><th>胜场</th><th>净胜剑</th><th>晋级</th></tr>
      </thead>
      <tbody>
        ${rows.map((row) => `
          <tr>
            <td>${escapeHtml(row.rank)}</td>
            <td>${escapeHtml(row.name)}</td>
            <td>${escapeHtml(row.club)}</td>
            <td>${escapeHtml(row.wins)}/${escapeHtml(row.matches)}</td>
            <td>${escapeHtml(row.indicator)}</td>
            <td>${escapeHtml(row.remark)}</td>
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
      <button class="participant-card" data-athlete-id="${escapeHtml(row.id)}">
        <div class="rank-pill">${escapeHtml(row.finalRank ?? '-')}</div>
        <div class="participant-main">
          <strong>${escapeHtml(row.name)}</strong>
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

function renderPoolGroups(event) {
  const groups = event.poolGroups || [];
  poolGroups.innerHTML = groups.length
    ? groups.map((group, index) => `
      <section class="pool-group-card">
        <div class="pool-group-head">
          <strong>第 ${index + 1} 组</strong>
          <span>${group.athletes?.length || 0} 人</span>
        </div>
        <div class="pool-athlete-list">
          ${(group.athletes || []).map((athlete) => `
            <button class="pool-athlete" data-athlete-id="${escapeHtml(athlete.id)}">
              <div class="draw-no">${escapeHtml(athlete.drawNo ?? '-')}</div>
              <div>
                <strong>${escapeHtml(athlete.name)}</strong>
                <span>${escapeHtml(athlete.club || '')}</span>
              </div>
              <div class="pool-score">
                <strong>${escapeHtml(athlete.wins ?? 0)}/${escapeHtml(athlete.matches ?? 0)}</strong>
                <span>净胜 ${escapeHtml(athlete.diff ?? 0)}</span>
              </div>
            </button>
          `).join('')}
        </div>
        <div class="pool-bout-strip">
          ${(group.bouts || []).slice(0, 4).map((bout) => {
            const outcome = poolBoutOutcome(bout);
            return `
              <div class="pool-bout">
                <span class="${outcome.homeWon ? 'win' : ''}">${escapeHtml(bout.homeLabel)}</span>
                <strong>${escapeHtml(bout.homeScore)}:${escapeHtml(bout.awayScore)}</strong>
                <span class="${outcome.awayWon ? 'win' : ''}">${escapeHtml(bout.awayLabel)}</span>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    `).join('')
    : '<div class="empty">暂无小组分组数据</div>';

  poolGroups.querySelectorAll('[data-athlete-id]').forEach((button) => {
    button.addEventListener('click', () => openAthlete(button.dataset.athleteId));
  });
}

function renderMatches(event) {
  const groups = event.eliminationPhaseGroups?.length
    ? event.eliminationPhaseGroups
    : fallbackPhaseGroups(event.latestMatches || []);
  matchList.innerHTML = groups.length
    ? groups.map((group) => `
      <section class="phase-group">
        <div class="phase-header">
          <div class="phase-title">${escapeHtml(group.phase)}</div>
          <div class="phase-count">${group.matches.length} 场</div>
        </div>
        ${group.matches.map((match) => `
          <div class="match">
            <div class="match-phase">${escapeHtml(match.matchCode)}</div>
            <div class="bout-card">
              <div class="bout-side ${match.home.result === 'W' ? 'winner' : 'loser'}">
                <strong>${escapeHtml(match.home.name)}</strong>
                <span>${escapeHtml(match.home.club || '')}</span>
              </div>
              <div class="score-pair winner-score">${escapeHtml(match.home.points)}<span>:</span>${escapeHtml(match.away.points)}</div>
              <div class="bout-side ${match.away.result === 'W' ? 'winner' : 'loser'}">
                <strong>${escapeHtml(match.away.name)}</strong>
                <span>${escapeHtml(match.away.club || '')}</span>
              </div>
            </div>
            <div class="winner-note">胜者：${escapeHtml(match.home.result === 'W' ? match.home.name : match.away.name)}</div>
          </div>
        `).join('')}
      </section>
    `).join('')
    : '<div class="empty">暂无淘汰赛对阵</div>';
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

  athleteActionPanel.hidden = true;
  athleteActionPanel.innerHTML = '';
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
    return `${athlete.name} 当前收录 1 场比赛，最终第 ${latest.finalRank ?? '-'} 名。后续数据增加后可形成趋势判断。`;
  }
  return `${athlete.name} 当前收录 ${events.length} 场比赛，最好名次第 ${best.finalRank ?? '-'} 名，最近一次第 ${latest.finalRank ?? '-'} 名。`;
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
    parts.push('当前只有 1 场记录，建议继续关注下一场变化');
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
  if (!projectRows.length) return `${club.club} 目前还需要继续补充比赛样本，先从参赛记录和项目覆盖开始建立队伍画像。`;
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

function projectCoachAdvice(row) {
  if (row.medals > 0) return '可作为口碑项目继续强化，沉淀代表学员和比赛复盘。';
  if (row.top8 > 0) return '已有前八基础，下一步重点提升淘汰赛稳定性。';
  if (row.entrants >= 4) return '人数基础不错，需要观察小组赛胜率和名次前移。';
  return '样本仍少，先保持参赛连续性，积累可判断的数据。';
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
      const matchedItems = (competition.items || []).filter((item) => {
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

function renderPreMatchIntelligence(club, projectRows, athletes) {
  const rosterRows = clubRosterRows(club);
  const relevantCompetitions = relevantPreMatchCompetitions(projectRows);
  const opponentPool = coachStrongOpponentPool(club, projectRows);
  const topProjects = projectRows.slice(0, 3);
  const readiness = rosterRows.length
    ? `已识别 ${rosterRows.length} 条本馆报名记录，可以开始生成赛前对手情报。`
    : '当前还没有识别到本馆报名名单；导入报名名单后，这里会自动生成本馆出战、重点对手和突破机会。';

  return `
    <section class="coach-section prematch-section">
      <div class="section-title">
        <h2>赛前情报包</h2>
        <span>报名后优先看</span>
      </div>
      <div class="coach-summary-card prematch-ready">
        <strong>${escapeHtml(readiness)}</strong>
        <span>第一版先按本馆强项项目、近期赛事和历史强手池做备赛提示；报名名单补齐后会升级为逐个学员的对手分析。</span>
      </div>
      ${rosterRows.length ? `
        <div class="prematch-block">
          <div class="coach-bucket-head">
            <strong>本馆出战</strong>
            <span>${escapeHtml(rosterRows.length)} 条报名</span>
          </div>
          <div class="coach-athlete-list">
            ${rosterRows.slice(0, 6).map((row) => `
              <button type="button" data-athlete-id="${escapeHtml(row.registerCode || '')}">
                <strong>${escapeHtml(row.athleteName || '未命名选手')}</strong>
                <span>${escapeHtml(displayEventName(row))}</span>
                <em>${escapeHtml(row.sportName || '赛事待确认')}</em>
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
                  <span>${escapeHtml([competition.dateLabel, competition.venue || competition.region].filter(Boolean).join(' · '))}</span>
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
        <div class="coach-athlete-list">
          ${opponentPool.length ? opponentPool.map((athlete) => `
            <button type="button" data-athlete-id="${escapeHtml(athlete.id || '')}">
              <strong>${escapeHtml(athlete.name)}</strong>
              <span>${escapeHtml(athlete.club || '俱乐部待确认')}</span>
              <em>最好第 ${escapeHtml(athlete.bestRank ?? '-')} 名 · ${escapeHtml(athlete.appearances ?? 0)} 次</em>
            </button>
          `).join('') : '<div class="empty compact-empty">强手池需要更多同项目选手画像，后续随成绩包继续补齐。</div>'}
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
      </section>

      ${renderPreMatchIntelligence(club, projectRows, athletes)}

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
        ${renderCoachAthleteBucket('重点培养', '已有名次或奖牌表现', athleteBuckets.focus)}
        ${renderCoachAthleteBucket('稳定基础', '有参赛连续性，适合复盘训练', athleteBuckets.steady)}
        ${renderCoachAthleteBucket('继续观察', '样本较少，先积累比赛记录', athleteBuckets.observe)}
        ${athletes.length ? '' : '<div class="empty compact-empty">当前俱乐部学员画像还不完整，后续需要继续补充更多成绩包。</div>'}
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
}

async function openAthlete(athleteId) {
  const localAthlete = findAthleteByReference({ id: athleteId });
  try {
    if (!athleteId || athleteId === 'undefined' || athleteId === 'null') {
      if (localAthlete?.events?.length) {
        renderAthleteDetail(localAthlete);
        navigateTo('athlete');
        return;
      }
      throw new Error('缺少选手ID，请重新搜索并进入选手详情。');
    }
    const response = await fetch(`/api/athletes/${encodeURIComponent(athleteId)}`);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(`接口返回异常：${response.status}`);
    }
    const result = await response.json();
    if (!result.ok) throw new Error(result.message);
    renderAthleteDetail(result.athlete);
  } catch (error) {
    if (localAthlete?.events?.length) {
      renderAthleteDetail(localAthlete);
    } else {
      setInlineError(athleteHero, `选手详情读取失败：${error.message}`);
      athleteActionPanel.innerHTML = '';
      athleteGrowth.innerHTML = '';
      athleteEvents.innerHTML = '';
    }
  }
  navigateTo('athlete');
}

async function openClub(clubId) {
  try {
    const response = await fetch(`/api/clubs/${clubId}`);
    const result = await response.json();
    if (!result.ok) throw new Error(result.message);
    renderClubDetail(result.club);
  } catch (error) {
    setInlineError(clubHero, `俱乐部详情读取失败：${error.message}`);
    clubEvents.innerHTML = '';
  }
  navigateTo('club');
}

async function openCompetition(sportCode) {
  const localCompetition = findCompetitionBySportCode(sportCode);

  try {
    const response = await fetch(`/api/competitions/${encodeURIComponent(sportCode)}`);
    const result = await response.json();
    if (!result.ok) throw new Error(result.message);
    state.currentCompetition = result.competition;
  } catch (error) {
    if (!localCompetition) throw error;
    state.currentCompetition = localCompetition;
  }

  renderCompetitionHero(state.currentCompetition);
  renderCompetitionInsights(state.currentCompetition);
  renderEventList(state.currentCompetition);
  navigateTo('competition');
}

async function openEvent(eventCode) {
  try {
    const response = await fetch(`/api/events/${encodeURIComponent(eventCode)}`);
    const result = await response.json();
    if (!result.ok) throw new Error(result.message);
    state.currentEvent = result.event;
    renderEventHero(state.currentEvent);
    renderInsights(state.currentEvent);
    renderAnalysisCharts(state.currentEvent);
    renderMetrics(state.currentEvent);
    renderChampionPath(state.currentEvent);
    renderLeaders(state.currentEvent);
    renderOpponents(state.currentEvent);
    renderParticipants(state.currentEvent);
    renderPoolGroups(state.currentEvent);
    renderMatches(state.currentEvent);
    renderClubs(state.currentEvent);
    renderClubProfiles(state.currentEvent);
    renderAthleteProfiles(state.currentEvent);
    navigateTo('event');
  } catch (error) {
    setInlineError(eventHero, `项目详情读取失败：${error.message}`);
    metricGrid.innerHTML = '';
    insightCards.innerHTML = '';
    insightBullets.innerHTML = '';
    analysisCharts.innerHTML = '';
    championPath.innerHTML = '';
    leadersList.innerHTML = '';
    opponentList.innerHTML = '';
    participantsList.innerHTML = '';
    poolGroups.innerHTML = '';
    matchList.innerHTML = '';
    clubList.innerHTML = '';
    clubProfiles.innerHTML = '';
    athleteProfiles.innerHTML = '';
    momentumList.innerHTML = '';
    navigateTo('event');
  }
}

topBack.addEventListener('click', goBack);

tabs.addEventListener('click', (event) => {
  const button = event.target.closest('.tab');
  if (!button) return;
  tabs.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab === button));
  document.querySelectorAll('.tab-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === `tab-${button.dataset.tab}`);
  });
});

searchInput.addEventListener('input', applyCompetitionFilter);
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
memberCta?.addEventListener('click', () => {
  alert('会员能力后续会围绕成长报告、重点对手、俱乐部分析和无广告体验设计。当前版本先开放免费查看。');
});
document.querySelectorAll('[data-nav-role-home]').forEach((button) => {
  button.addEventListener('click', () => {
    state.userRole = '';
    localStorage.removeItem(ROLE_KEY);
    state.viewStack = ['roleHome'];
    renderRoleWorkspacePremium();
    showView('roleHome');
    scrollToPageTop();
  });
});
document.querySelectorAll('[data-nav-competitions]').forEach((button) => {
  button.addEventListener('click', () => navigateTo('competitions'));
});

async function init() {
  state.isDataLoading = true;
  state.dataLoadError = '';
  homeStats.innerHTML = '<div class="loading-row">正在加载数据</div>';
  competitionList.innerHTML = '<div class="loading-row">正在整理比赛列表</div>';
  const response = await fetch('/api/events');
  const result = await response.json();
  if (!result.ok) throw new Error(result.message);
  state.isDataLoading = false;
  state.apiVersion = result.version || '';
  state.dataCoverage = result.dataCoverage || null;
  state.athletesById = Object.fromEntries((result.athletes || []).map((athlete) => [athlete.id, athlete]));
  state.clubsById = Object.fromEntries((result.clubs || []).map((club) => [club.id, club]));
  state.competitions = result.competitions?.length ? result.competitions : buildCompetitionsFromEvents(result.events);
  state.athleteSearchIndex = buildAthleteSearchIndex();
  state.clubSearchIndex = buildClubSearchIndex();
  renderHomeStats();
  renderRoleWorkspacePremium();
  renderParentDashboard();
  renderFeedPanel();
  await syncFollowedAthletes();
  renderYearSelect();
  renderRegionSelect();
  renderItemSelect();
  applyCompetitionFilter();
}

renderRoleWorkspacePremium();
renderParentDashboard();
renderFollowPanel();
renderFilters();
renderHomeStats();
renderFeedPanel();
renderCompetitionList();

init().catch((error) => {
  state.isDataLoading = false;
  state.dataLoadError = error.message;
  renderHomeStats();
  renderFeedPanel();
  renderCompetitionList();
});
