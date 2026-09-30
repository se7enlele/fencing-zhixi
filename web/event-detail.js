/* Event-scoped navigation. Names are searchable, never identity keys. */
const EventDetail = {
  facets(item) {
    const name = item.eventName || item.name || '';
    return {
      date: String(item.openDate || '').slice(0, 10),
      weapon: (name.match(/花剑|重剑|佩剑/) || [''])[0],
      gender: /女子/.test(name) ? '女子' : /男子/.test(name) ? '男子' : '',
      age: (name.match(/U\d+|\d+\+|公开组|年龄开放组/i) || [''])[0],
      type: /团体|team/i.test(name) ? '团体' : /个人/.test(name) ? '个人' : '',
    };
  },
  filter(items, filters) {
    return items.filter((item) => {
      const facets = this.facets(item);
      return Object.entries(filters).every(([key, value]) => !value || facets[key] === value);
    });
  },
  athletes(event) {
    const result = [];
    const byId = new Map();
    const add = (row, poolIndex = null) => {
      if (!row?.name && row?.athleteName) row = { ...row, name: row.athleteName, club: row.club || row.organShortName || row.organName || '' };
      if (!row?.name) return;
      const id = row.id == null ? '' : String(row.id);
      let found = id ? byId.get(id) : result.find((entry) => entry.row === row);
      if (!found) {
        found = { row, id, poolIndex };
        result.push(found);
        if (id) byId.set(id, found);
      } else if (poolIndex !== null) found.poolIndex = poolIndex;
    };
    (event.participants?.length ? event.participants : event.athleteProfiles?.length ? event.athleteProfiles : event.roster || []).forEach((row) => add(row));
    (event.poolGroups || []).forEach((group, index) => (group.athletes || []).forEach((row) => add(row, index)));
    return result;
  },
  defaultTab(event) {
    if (event.poolGroups?.length) return 'pool';
    if (event.eliminationPhaseGroups?.length || event.latestMatches?.length) return 'tableau';
    if ((event.participants || []).some((row) => Number(row.finalRank) > 0)) return 'participants';
    return 'roster';
  },
  phasesFor(event, entry) {
    const groups = event.eliminationPhaseGroups?.length ? event.eliminationPhaseGroups : fallbackPhaseGroups(event.latestMatches || []);
    const unique = entry.row.club && this.athletes(event).filter(({ row }) => row.name === entry.row.name && row.club === entry.row.club).length === 1;
    return groups.flatMap((group, index) => (group.matches || []).some((match) => [match.home, match.away].some((row) => row && (row.id && entry.id ? String(row.id) === entry.id : unique && row.name === entry.row.name && row.club === entry.row.club))) ? [{ index, label: group.phase }] : []);
  },
};

function renderProjectFilters(competition) {
  const items = competition.items || competition.itemSummaries || [];
  const host = document.querySelector('#projectFilters');
  const labels = { date: '日期', weapon: '剑种', gender: '性别', age: '年龄组', type: '赛制' };
  host.innerHTML = Object.entries(labels).map(([key, label]) => {
    const values = [...new Set(items.map((item) => EventDetail.facets(item)[key]).filter(Boolean))].sort();
    return `<label>${label}<select data-project-filter="${key}" aria-label="筛选${label}"><option value="">全部${label}</option>${values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('')}</select></label>`;
  }).join('') + '<button type="button" class="detail-reset">重置</button>';
  const update = () => {
    const filters = Object.fromEntries([...host.querySelectorAll('select')].map((select) => [select.dataset.projectFilter, select.value]));
    renderEventList(competition, filters);
  };
  host.querySelectorAll('select').forEach((select) => select.addEventListener('change', update));
  host.querySelector('button').addEventListener('click', () => {
    host.querySelectorAll('select').forEach((select) => { select.value = ''; });
    update();
  });
}

function renderEventFinder(event) {
  const host = document.querySelector('#eventFinder');
  const entries = EventDetail.athletes(event);
  const team = /团体|team/i.test(event.eventName || '') || /[MW][FES]T(?:U\d+|\d|$)/i.test(event.eventCode || '');
  host.innerHTML = `<label for="eventAthleteSearch">${team ? '查找本场队伍' : '查找本场选手'}</label><input id="eventAthleteSearch" type="search" placeholder="输入姓名或俱乐部" autocomplete="off"><div class="detail-finder-results" aria-live="polite"></div>`;
  const results = host.querySelector('.detail-finder-results');
  host.querySelector('input').addEventListener('input', (inputEvent) => {
    const q = inputEvent.target.value.trim().toLocaleLowerCase();
    document.querySelectorAll('.detail-located').forEach((el) => el.classList.remove('detail-located'));
    if (!q) { results.innerHTML = ''; return; }
    const matches = entries.filter(({ row }) => `${row.name} ${row.club || ''}`.toLocaleLowerCase().includes(q));
    results.innerHTML = `<p>${matches.length ? `找到 ${matches.length} ${team ? '支队伍' : '位选手'}${matches.length > 30 ? '，请补充姓名以缩小范围' : ''}` : '本项目未找到匹配名单，试试姓名中的其他字。'}</p>` + matches.slice(0, 30).map((entry) => `<div class="detail-person"><div><strong>${escapeHtml(entry.row.name)}</strong><small>${escapeHtml(entry.row.club || '单位未提供')} · ${Number(entry.row.finalRank) > 0 ? `第 ${escapeHtml(entry.row.finalRank)} 名` : '暂无最终排名'}</small></div><div class="detail-person-actions">${!team && entry.poolIndex !== null ? `<button type="button" data-locate="pool" data-entry="${entries.indexOf(entry)}">小组 ${entry.poolIndex + 1}</button>` : ''}${!team && entry.id ? `<button type="button" data-locate="${Number(entry.row.finalRank) > 0 ? 'participants' : 'roster'}" data-entry="${entries.indexOf(entry)}">${Number(entry.row.finalRank) > 0 ? '最终排名' : '参赛名单'}</button>` : ''}${EventDetail.phasesFor(event, entry).map((phase) => `<button type="button" data-locate="tableau" data-phase="${phase.index}" data-entry="${entries.indexOf(entry)}">${escapeHtml(phase.label)}</button>`).join('')}</div></div>`).join('');
  });
  results.addEventListener('click', (clickEvent) => {
    const button = clickEvent.target.closest('[data-locate]');
    if (!button) return;
    const entry = entries[Number(button.dataset.entry)];
    const tab = button.dataset.locate;
    activateEventTab(tab);
    if (tab === 'pool') renderPoolGroups(event, entry.poolIndex);
    if (tab === 'tableau') renderMatches(event, Number(button.dataset.phase));
    const panel = document.querySelector(`#tab-${tab}`);
    let target;
    panel.querySelectorAll('[data-athlete-id], [data-roster-id]').forEach((element) => {
      if (entry.id && (element.dataset.athleteId || element.dataset.rosterId) === entry.id) {
        element.classList.add('detail-located');
        target ||= element;
      }
    });
    (target || panel).scrollIntoView({ block: 'center', behavior: 'auto' });
  });
}

function renderEventRoster(event) {
  const entries = EventDetail.athletes(event);
  document.querySelector('#eventRoster').innerHTML = entries.length ? entries.map(({ row, id }) => `<div class="detail-person" data-roster-id="${escapeHtml(id)}"><div><strong>${escapeHtml(row.name)}</strong><small>${escapeHtml(row.club || '单位未提供')}</small></div>${row.approveStatus ? `<span>${escapeHtml(row.approveStatus)}</span>` : ''}</div>`).join('') : '<div class="empty">暂无参赛名单。名单公布后可在这里查询。</div>';
}
