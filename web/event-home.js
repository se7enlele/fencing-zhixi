/* Calendar-first navigation. Uses the same verified competition records as the database. */
function calendarKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function calendarDateRange(item) {
  // A year or a month alone is not a confirmed competition day.
  const raw = String(item.dateLabel || '');
  const matches = [...raw.matchAll(/(20\d{2})[.\-/年](\d{1,2})[.\-/月](\d{1,2})/g)];
  if (!matches.length) return null;
  const dates = matches.map((match) => {
    const [year, month, day] = match.slice(1).map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date.getTime() : NaN;
  });
  if (dates.some((value) => !Number.isFinite(value))) return null;
  return { start: Math.min(...dates), end: Math.max(...dates) };
}

function calendarRecordsForDay(records, day) {
  const stamp = new Date(`${day}T00:00:00`).getTime();
  return records.filter((item) => {
    const range = calendarDateRange(item);
    return range && range.start <= stamp && range.end >= stamp;
  });
}

function calendarModel() {
  if (!state.calendar) {
    const today = new Date();
    state.calendar = { month: calendarKey(today).slice(0, 7), selected: calendarKey(today), mode: 'day' };
  }
  return state.calendar;
}

function renderCalendarEventCard(item) {
  const followed = state.followedCompetitions.some((row) => row.sportCode === item.sportCode);
  return `<article class="agenda-card">
    <button type="button" class="agenda-card-main" data-agenda-open="${escapeHtml(item.sportCode)}">
      <span class="agenda-card-top"><span class="status-badge status-${escapeHtml(item.status || 'completed')}">${escapeHtml(statusLabel(item.status || 'completed'))}</span><span>${escapeHtml(coverageLabel(item))}</span></span>
      <strong>${escapeHtml(item.sportName)}</strong>
      <span class="agenda-meta">${escapeHtml(displayDateLabel(item.dateLabel))}</span>
      <span class="agenda-meta">${escapeHtml(item.venue || item.region || '地点待确认')}</span>
    </button>
    <div class="agenda-actions"><button type="button" data-agenda-open="${escapeHtml(item.sportCode)}">查看赛事 <span aria-hidden="true">↗</span></button><button type="button" data-agenda-follow="${escapeHtml(item.sportCode)}" aria-pressed="${followed}" ${followed ? 'disabled' : ''}>${followed ? '✓ 已关注' : '＋ 关注赛事'}</button></div>
  </article>`;
}

function renderCalendarHomeContent() {
  if (state.dataLoadError) return `<section class="panel"><h2>赛事暂时没有加载成功</h2><p>请检查网络后重试。</p><button type="button" data-home-reload>重新加载</button></section>`;
  const model = calendarModel();
  const [year, month] = model.month.split('-').map(Number);
  const first = new Date(year, month - 1, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(year, month, 0).getDate();
  const today = calendarKey(new Date());
  const monthStart = first.getTime();
  const monthEnd = new Date(year, month, 0).getTime();
  const monthRecords = state.competitions.filter((item) => {
    const range = calendarDateRange(item);
    return range && range.start <= monthEnd && range.end >= monthStart;
  }).sort((a, b) => calendarDateRange(a).start - calendarDateRange(b).start);
  const selectedRecords = model.mode === 'month' ? monthRecords : calendarRecordsForDay(monthRecords, model.selected);
  const cells = Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1;
    if (day < 1 || day > days) return '<span class="calendar-blank" aria-hidden="true"></span>';
    const key = `${model.month}-${String(day).padStart(2, '0')}`;
    const count = calendarRecordsForDay(monthRecords, key).length;
    return `<button type="button" class="calendar-day ${key === today ? 'is-today' : ''} ${key === model.selected && model.mode === 'day' ? 'is-selected' : ''}" data-calendar-day="${key}" aria-pressed="${key === model.selected && model.mode === 'day'}" aria-label="${month}月${day}日，${count ? `收录 ${count} 场赛事` : '暂无收录赛事'}${key === today ? '，今天' : ''}"><span>${day}</span><i class="${count ? 'has-events' : ''}" aria-hidden="true"></i></button>`;
  }).join('');
  const follows = followedCompetitionCards();
  const selectedLabel = model.mode === 'month' ? `${month}月赛事` : `${Number(model.selected.slice(5, 7))}月${Number(model.selected.slice(8))}日赛事`;
  return `<div class="event-home">
    <section class="event-welcome"><div><span class="eyebrow">你的击剑赛事助手</span><h2>下一场，心中有数。</h2></div><span class="welcome-mark" aria-hidden="true">↗</span></section>
    <form class="home-search" id="homeSearchForm" role="search"><label class="sr-only" for="homeSearchInput">搜索赛事或运动员</label><span aria-hidden="true">⌕</span><input id="homeSearchInput" type="search" placeholder="搜赛事、运动员或俱乐部" maxlength="100"><button type="submit">搜索</button></form>
    <div class="event-shortcuts"><button type="button" data-home-ai><span class="shortcut-icon" aria-hidden="true">✦</span><span><strong>AI 赛事分析</strong><small>赛前准备 · 赛后成长</small></span><span aria-hidden="true">›</span></button><button type="button" data-home-compact-nav="my"><span class="shortcut-icon" aria-hidden="true">♡</span><span><strong>我的关注</strong><small>${follows.length} 场赛事 · ${state.followedAthletes.length} 位选手</small></span><span aria-hidden="true">›</span></button></div>
    <section class="calendar-panel" aria-label="赛事日历"><div class="calendar-heading"><h2>赛事日历</h2><button type="button" data-calendar-today>回到今天</button></div>
      <div class="calendar-toolbar"><div class="calendar-month-controls"><button type="button" data-calendar-shift="-1" aria-label="上个月">‹</button><label><span class="sr-only">选择年月</span><input type="month" id="calendarMonth" value="${model.month}" min="2000-01" max="2100-12"></label><button type="button" data-calendar-shift="1" aria-label="下个月">›</button></div><div class="calendar-mode" aria-label="查看范围"><button type="button" data-calendar-mode="day" aria-pressed="${model.mode === 'day'}">按日</button><button type="button" data-calendar-mode="month" aria-pressed="${model.mode === 'month'}">按月</button></div></div>
      <div class="calendar-week" aria-hidden="true">${['一','二','三','四','五','六','日'].map((day) => `<span>${day}</span>`).join('')}</div><div class="calendar-grid">${cells}</div><div class="calendar-legend"><span><i></i>有收录赛事</span><span><b></b>今天</span><span>深色为选中日期</span></div>
    </section>
    <section class="home-agenda" aria-label="所选日期赛事"><div class="agenda-heading"><h2>${selectedLabel}</h2><span>${selectedRecords.length} 场</span></div><div class="agenda-list" aria-live="polite">${selectedRecords.length ? selectedRecords.map(renderCalendarEventCard).join('') : `<div class="agenda-empty"><strong>这${model.mode === 'month' ? '个月' : '一天'}暂无收录赛事</strong><p>可切换日期${model.mode === 'day' ? '，或查看整月安排' : '查看其他月份'}。暂无收录不代表没有比赛。</p>${model.mode === 'day' ? '<button type="button" data-calendar-mode="month">查看本月赛事</button>' : '<button type="button" data-home-compact-nav="competitions">浏览全部赛事</button>'}</div>`}</div></section>
    <section class="home-following"><div class="agenda-heading"><h2>我关注的赛事</h2><button type="button" data-home-compact-nav="my">管理关注 ›</button></div>${follows.length ? follows.slice(0, 3).map(renderCalendarEventCard).join('') : '<div class="agenda-empty compact"><strong>把关心的比赛放在一起</strong><p>点赛事卡片上的“关注”，下次查找更方便。</p></div>'}</section>
    ${renderHomePriorityPanel()}
    <p class="home-data-note">日历按已收录赛事日期展示，具体安排请以主办方公布的信息为准。</p>
  </div>`;
}

function openHomeSearch(keyword) {
  // A new global search must not inherit an old year, region or follow filter.
  state.selectedYear = '全部年份';
  state.selectedRegion = '全部地区';
  state.selectedAge = '全部年龄组';
  state.selectedWeapon = '全部剑种';
  state.selectedGender = '全部性别';
  state.selectedStatus = '全部状态';
  state.selectedItem = '全部项目';
  state.onlyFollowedData = false;
  state.followFilter = '全部赛事';
  searchInput.value = keyword.trim();
  handleSearchInput();
  renderFilters();
  navigateMain('competitions');
  searchInput.focus({ preventScroll: true });
}

function bindCalendarHome(container) {
  container.querySelector('[data-home-reload]')?.addEventListener('click', () => window.location.reload());
  container.querySelector('#homeSearchForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = container.querySelector('#homeSearchInput');
    if (!input.value.trim()) { input.focus(); return; }
    openHomeSearch(input.value);
  });
  container.querySelector('[data-home-ai]')?.addEventListener('click', () => {
    navigateTo('aiAnalysis');
  });
  const rerender = (focusSelector) => { renderHomePage(); if (focusSelector) homePage.querySelector(focusSelector)?.focus({ preventScroll: true }); };
  container.querySelectorAll('[data-calendar-day]').forEach((button) => button.addEventListener('click', () => {
    calendarModel().selected = button.dataset.calendarDay;
    calendarModel().mode = 'day';
    rerender(`[data-calendar-day="${button.dataset.calendarDay}"]`);
  }));
  const setMonth = (month) => {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || month < '2000-01' || month > '2100-12') return;
    calendarModel().month = month;
    calendarModel().selected = `${month}-01`;
  };
  container.querySelector('#calendarMonth')?.addEventListener('change', (event) => { setMonth(event.target.value); rerender('#calendarMonth'); });
  container.querySelectorAll('[data-calendar-shift]').forEach((button) => button.addEventListener('click', () => {
    const date = new Date(`${calendarModel().month}-01T00:00:00`);
    date.setMonth(date.getMonth() + Number(button.dataset.calendarShift));
    setMonth(calendarKey(date).slice(0, 7));
    rerender(`[data-calendar-shift="${button.dataset.calendarShift}"]`);
  }));
  container.querySelector('[data-calendar-today]')?.addEventListener('click', () => { state.calendar = null; calendarModel(); rerender('[data-calendar-today]'); });
  container.querySelectorAll('[data-calendar-mode]').forEach((button) => button.addEventListener('click', () => { calendarModel().mode = button.dataset.calendarMode; rerender(`[data-calendar-mode="${button.dataset.calendarMode}"]`); }));
  container.querySelectorAll('[data-agenda-open]').forEach((button) => button.addEventListener('click', () => openCompetition(button.dataset.agendaOpen)));
  container.querySelectorAll('[data-agenda-follow]').forEach((button) => button.addEventListener('click', () => {
    const item = findCompetitionBySportCode(button.dataset.agendaFollow);
    if (item) { upsertFollowedCompetition(item); rerender(); }
  }));
}

function renderPointsPage() {
  renderOfficialPointsPage();
}
