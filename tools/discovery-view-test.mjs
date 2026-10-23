import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync('web/viewer.js', 'utf8');
const html = fs.readFileSync('web/viewer.html', 'utf8');
const start = source.indexOf('function competitionListDateValue(');
const end = source.indexOf('function inferRegion(', start);
assert.ok(start >= 0 && end > start, 'competition list needs its own chronological comparator');
const ctx = vm.createContext({});
vm.runInContext(source.slice(start, end) + '\nglobalThis.compare = compareCompetitionsNewestFirst;', ctx);
const rows = [
  { id: 'old', dateLabel: '2021.07.16 / 2021.07.18' },
  { id: 'unknown', season: '2035' },
  { id: 'april', dateLabel: '2026-4-19' },
  { id: 'october', dateLabel: '2026.10.24 / 2026.10.25' },
  { id: 'invalid', dateLabel: '2026.02.31' },
  { id: 'may', dateLabel: '2026/05/23' },
  { id: 'same-day', dateLabel: '2026年5月23日' },
];
assert.deepEqual([...rows].sort(ctx.compare).map(row => row.id), ['october','may','same-day','april','old','unknown','invalid']);
assert.equal(rows[0].id, 'old');
assert.match(source, /state\.filteredCompetitions = state\.competitions\.filter\([\s\S]*?\.sort\(compareCompetitionsNewestFirst\)/);
assert.match(html, /class="product-overview database-overview" hidden/);
assert.match(html, /<details[^>]*id="competitionFollowFold"[^>]*>/);
assert.doesNotMatch(html, /<details[^>]*id="competitionFollowFold"[^>]*\bopen\b/);
assert.match(html, /id="competitionQuickFilters"/);
assert.match(html, /id="competitionAdvancedFilters"/);
assert.match(html, /<details class="directory-disclosure" hidden><summary>更多查询/);

const renderStart = source.indexOf('function discoveryFilterRows(');
const renderEnd = source.indexOf('function renderFilters(', renderStart);
assert.ok(renderStart >= 0 && renderEnd > renderStart);
const active = { gender: '男子', weapon: '花剑', age: 'U8' };
const filterContext = vm.createContext({
  escapeHtml: value => String(value),
  filterOptions: type => ({ gender:['全部性别','男子','女子'], weapon:['全部剑种','花剑','重剑','佩剑'], age:['全部年龄组','U6','U8','U10','U12','U14','U16','17+','成年组'] })[type],
  activeFilterValue: type => active[type],
});
vm.runInContext(source.slice(renderStart, renderEnd) + '\nglobalThis.render = discoveryFilterRows;', filterContext);
const chips = filterContext.render();
assert.match(chips, /data-discovery-type="age" data-discovery-value="U8" aria-pressed="true"/);
assert.match(chips, /data-discovery-type="gender" data-discovery-value="女子" aria-pressed="false"/);
assert.match(chips, /全部/);
assert.match(chips, /更多组别/);
const setterContext = vm.createContext({ state: { selectedAiMonth: '10', selectedAiYears: ['2025', '2026'], selectedAiRegion: '北京' }, renderFilters: () => {}, applyCompetitionFilter: () => {} });
vm.runInContext(source.slice(source.indexOf('function setFilterValue('), source.indexOf('function matchingFilterOption(')) + '\nglobalThis.set = setFilterValue;', setterContext);
setterContext.set('age', 'U8');
assert.equal(setterContext.state.selectedAiMonth, '10', 'direct chips must preserve the selected month');
assert.equal(setterContext.state.selectedAiRegion, '北京');
setterContext.set('year', '2026');
assert.equal(setterContext.state.selectedAiYears.length, 0);
console.log('competition discovery: newest dates, missing dates last, collapsed follows and direct filter chips passed');
