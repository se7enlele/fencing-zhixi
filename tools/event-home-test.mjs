import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../web/event-home.js', import.meta.url), 'utf8');
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const state = {
  competitions: [
    { sportCode: 'multi', sportName: '跨月赛', dateLabel: '2026.09.29 / 2026.10.02', status: 'upcoming' },
    { sportCode: 'single', sportName: '<img src=x onerror=bad()>', dateLabel: '2026.09.27', status: 'completed' },
    { sportCode: 'unknown', sportName: '2026年日期待定赛事', dateLabel: '2026' },
  ],
  followedCompetitions: [], followedAthletes: [],
  calendar: { month: '2026-09', selected: '2026-09-27', mode: 'day' },
};
const events = [];
const context = vm.createContext({ state, Date, escapeHtml, statusLabel: (s) => s, coverageLabel: () => '基础信息', displayDateLabel: (s) => s, followedCompetitionCards: () => state.followedCompetitions, renderHomeRoleBar: () => '', renderAiWorkspace: () => '<textarea></textarea>', renderHomePriorityPanel: () => '', searchInput: { value: '', focus() {} }, renderFilters: () => events.push('filters'), handleSearchInput: () => events.push('search'), navigateMain: (view) => events.push(view) });
vm.runInContext(source, context);
assert.equal(context.calendarDateRange({ dateLabel: '2026' }), null, 'year-only dates must not appear on January 1');
assert.equal(context.calendarDateRange({ dateLabel: '2026.09' }), null, 'month-only dates must remain unscheduled');
assert.equal(context.calendarDateRange({ dateLabel: '2026.02.30' }), null, 'invalid dates must not silently roll over');
assert.equal(context.calendarDateRange({ dateLabel: '2024.02.29' }).start, new Date(2024, 1, 29).getTime());
for (const day of ['2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02']) {
  assert.equal(context.calendarRecordsForDay(state.competitions, day)[0].sportCode, 'multi', `multi-day event must be visible on ${day}`);
}
assert.equal(context.calendarRecordsForDay(state.competitions, '2026-10-03').length, 0);
assert.equal(context.calendarRecordsForDay(state.competitions, '2026-01-01').length, 0);
let html = context.renderCalendarHomeContent();
assert.equal([...html.matchAll(/data-calendar-day=/g)].length, 30);
assert.match(html, /9月27日赛事/);
assert.doesNotMatch(html, /<img src=x/);
assert.match(html, /&lt;img/);
assert.match(html, /id="homeAnalysis"/);
state.calendar = { month: '2024-02', selected: '2024-02-29', mode: 'day' };
html = context.renderCalendarHomeContent();
assert.equal([...html.matchAll(/data-calendar-day=/g)].length, 29);
assert.match(html, /暂无收录不代表没有比赛/);
state.calendar = { month: '2026-10', selected: '2026-10-01', mode: 'month' };
html = context.renderCalendarHomeContent();
assert.match(html, /10月赛事/);
assert.match(html, /跨月赛/);
assert.equal([...html.matchAll(/class="agenda-card"/g)].length, 1, 'monthly view must not duplicate a competition for every day');
state.selectedYear = '2025'; state.onlyFollowedData = true;
context.openHomeSearch(' 蔡廷彧 ');
assert.equal(context.searchInput.value, '蔡廷彧');
assert.equal(state.selectedYear, '全部年份');
assert.equal(state.onlyFollowedData, false);
assert.deepEqual(events, ['search', 'filters', 'competitions']);
state.dataLoadError = 'offline';
assert.match(context.renderCalendarHomeContent(), /重新加载/);
assert.doesNotMatch(context.renderCalendarHomeContent(), /暂无收录赛事/);
for (const file of ['index.html', 'viewer.html']) {
  const html = await readFile(new URL(`../web/${file}`, import.meta.url), 'utf8');
  assert.ok(html.indexOf('/event-home.js') < html.indexOf('/viewer.js'), 'calendar functions must load before app startup');
  assert.equal([...html.matchAll(/data-main-tab=/g)].length, 4);
  assert.match(html, /id="view-points"/);
  assert.match(html, /event-home.css/);
}
console.log('calendar date boundaries, month views, missing dates, escaping, search reset and navigation integration passed');
