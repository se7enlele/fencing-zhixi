import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../web/viewer.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');
const start = source.indexOf('function compactCompetitionScopeText');
const end = source.indexOf('function renderCompetitionInsights');

if (start === -1 || end === -1 || end <= start) {
  throw new Error('Unable to locate competition detail helpers in viewer.js');
}

const context = {
  displayEventName: (row) => row.shortEventName || row.eventName || '',
  competitionMetricTotal: () => 0,
  competitionItemCount: (competition) => competition.items?.length || 0,
  compactText: (value) => String(value || '').replace(/\s+/g, ''),
};
vm.createContext(context);
vm.runInContext(`${source.slice(start, end)}
globalThis.sortedCompetitionEventRows = sortedCompetitionEventRows;
globalThis.competitionItemPriorityValue = competitionItemPriorityValue;
globalThis.compactCompetitionBarRows = compactCompetitionBarRows;
globalThis.compactCompetitionEventRows = compactCompetitionEventRows;
globalThis.competitionDigestRows = competitionDigestRows;
globalThis.competitionProjectGroups = competitionProjectGroups;
globalThis.compactCompetitionScopeText = compactCompetitionScopeText;
globalThis.competitionProjectScope = competitionProjectScope;
`, context);

const compactAgeRows = context.compactCompetitionBarRows([
  { label: '2016 H1', entrants: 14, top8: 2 },
  { label: '2016 H2', entrants: 11, top8: 3 },
  { label: '2017 H1', entrants: 8, top8: 1 },
  { label: '2017 H2', entrants: 18, top8: 1 },
  { label: '2018 H1', entrants: 21, top8: 7 },
  { label: '2018 H2', entrants: 21, top8: 5 },
  { label: '2019 H1', entrants: 10, top8: 0 },
  { label: '2019 H2', entrants: 5, top8: 0 },
], {
  limit: 4,
  otherLabel: 'Other age bands',
  valueKey: 'entrants',
  aggregateKeys: ['top8'],
});

assert.equal(compactAgeRows.length, 5);
assert.equal(JSON.stringify(compactAgeRows.map((row) => row.label)), JSON.stringify([
  '2018 H1',
  '2018 H2',
  '2017 H2',
  '2016 H1',
  'Other age bands',
]));
assert.equal(compactAgeRows.at(-1).entrants, 34);
assert.equal(compactAgeRows.at(-1).top8, 4);

const compactEventRows = context.compactCompetitionEventRows([
  { shortEventName: 'U8 Foil', competitionNo: 55 },
  { shortEventName: 'U10 Foil', competitionNo: 55 },
  { shortEventName: 'U6 Foil', competitionNo: 18 },
  { shortEventName: 'U12 Foil', competitionNo: 9 },
  { shortEventName: 'U14 Foil', competitionNo: 4 },
]);

assert.equal(compactEventRows.length, 4);
assert.equal(JSON.stringify(compactEventRows.map((row) => row.shortEventName)), JSON.stringify([
  'U10 Foil',
  'U8 Foil',
  'U6 Foil',
  'U12 Foil',
]));

const sortedEventRows = context.sortedCompetitionEventRows([
  { shortEventName: 'U14 Foil', competitionNo: 4 },
  { shortEventName: 'U8 Foil', competitionNo: 55 },
  { shortEventName: 'U10 Foil', competitionNo: 55 },
]);
assert.equal(JSON.stringify(sortedEventRows.map((row) => row.shortEventName)), JSON.stringify(['U10 Foil', 'U8 Foil', 'U14 Foil']));

const sortedPreEventRows = context.sortedCompetitionEventRows([
  { shortEventName: 'U12 Foil', expectedRegistrationCount: 18 },
  { shortEventName: 'U8 Foil', registrationCount: 30 },
  { shortEventName: 'U10 Foil', roster: [{}, {}, {}], expectedRegistrationCount: 20 },
]);
assert.equal(JSON.stringify(sortedPreEventRows.map((row) => row.shortEventName)), JSON.stringify(['U8 Foil', 'U12 Foil', 'U10 Foil']));

const groupedProjectRows = context.competitionProjectGroups([
  { shortEventName: 'U8 男花', competitionNo: 12 },
  { shortEventName: 'U10 男花', competitionNo: 8 },
  { shortEventName: 'U8 女重', competitionNo: 7 },
  { shortEventName: 'U12 男佩', competitionNo: 3 },
]);
assert.equal(groupedProjectRows[0].age, 'U8');
assert.equal(groupedProjectRows[0].items.length, 2);
assert.match(groupedProjectRows[0].weaponText, /花剑|重剑/);

assert.equal(context.compactCompetitionScopeText('U8 / U10 / U12 / U14 / U16', 3), 'U8 / U10 / U12 +2');
const compactScope = context.competitionProjectScope({
  projectScope: {
    ageText: 'U8 / U10 / U12 / U14 / U16',
    weaponText: '花剑 / 重剑 / 佩剑',
    genderText: '男子 / 女子 / 混合',
  },
  items: [{}, {}, {}, {}, {}, {}],
});
assert.equal(compactScope.ageText, 'U8 / U10 / U12 +2');
assert.equal(compactScope.weaponText, '花剑 / 重剑 / 佩剑');
assert.equal(compactScope.genderText, '男子 / 女子 +1');

const digestRows = context.competitionDigestRows(
  {},
  { bullets: ['U8 foil is the strongest signal.'] },
  [{ shortEventName: 'U8 Foil', competitionNo: 55 }],
  [{ label: '2018 H1', value: 21, display: '21人 / 前八7' }],
);
assert.equal(digestRows.length, 3);
assert.equal(digestRows[0].title, '重点项目');
assert.equal(digestRows[1].title, '主要年龄段');
assert.equal(digestRows[2].title, '赛事强度');

assert.match(source, /competitionChips\(competition, 4\)/, 'competition list cards must limit raw project chips and summarize the rest');
assert.match(source, /function competitionAvailableLayerLabels\(competition\)/, 'competition list cards must derive user-facing available data layers');
assert.match(source, /const labels = \['赛程'\];[\s\S]*labels\.push\('项目'\)[\s\S]*labels\.push\('报名'\)[\s\S]*labels\.push\('赛果'\)/, 'competition available layers must progress from schedule to project, roster and results');
assert.match(source, /class="available-layer-row" aria-label="可查内容"[\s\S]*competitionAvailableLayerLabels\(competition\)/, 'competition list cards must show available data layers before entering detail');
assert.match(css, /\.available-layer-row/, 'competition available data layer tags must be styled');
assert.match(source, /function competitionCoverageStageRows\(competition\)/, 'competition detail must derive unified user-facing coverage stages');
assert.match(source, /function competitionCoverageState\(competition = \{\}\)/, 'competition detail must use a shared coverage state helper');
assert.match(source, /function isLiveCompetitionStatus\(status\)[\s\S]*status === 'running'/, 'competition status helpers must treat running as in-progress');
assert.match(source, /function isPrematchStatusValue\(status\)/, 'active competition checks must use a shared status helper');
assert.match(source, /function competitionStatusMatches\(actualStatus, expectedStatus\)/, 'competition filters must treat live and running as equivalent states');
assert.match(source, /score: hasScore \? '可查看' : isLive \? '比赛进行中' : isPreStart \? '未开赛' : '暂无成绩'/, 'competition detail must distinguish live, pre-start and finished-without-score states');
assert.match(source, /roster: hasRoster \? '可查看' : \(isFinished \? '暂无名单' : '暂无名单'\)/, 'competition detail must show missing roster state clearly');
assert.match(source, /function renderCompetitionCoverageStages\(competition\)/, 'competition detail must render coverage stages');
assert.match(source, /renderCompetitionCoverageStages\(competition\)/, 'competition hero must show what users can view for this competition');
assert.match(source, /title: '赛程'[\s\S]*title: '项目'[\s\S]*title: '名单'[\s\S]*title: '成绩'/, 'competition coverage stages must use user-facing availability labels');
assert.match(css, /\.competition-coverage-stages/, 'competition coverage stage styles must exist');
assert.match(source, /function competitionProjectSummaryChips\(competition\)/, 'competition hero must summarize project structure instead of listing raw labels');
assert.match(source, /function compactCompetitionScopeText\(value, limit = 3\)/, 'competition hero must compress long scope labels before rendering');
assert.match(source, /function competitionProjectScope\(competition\)/, 'competition hero must render a structured project scope summary');
assert.match(source, /function competitionHeroSummaryText\(competition\)/, 'competition hero must explain available value in user-facing language');
assert.match(source, /function competitionDigestRows\(competition, insights, primaryEventRows, birthRows\)/, 'post-event competition detail must put interpretation before raw charts');
assert.match(source, /competitionDigestPanel\(digestRows, '赛后复盘'\)/, 'post-event competition detail must render the interpretation summary first');
assert.match(source, /function competitionChartDetails\(content, summary = '查看结构图表'\)/, 'post-event competition detail must collapse dense charts behind a user-controlled entry');
assert.match(source, /competitionChartDetails\(chartContent\)/, 'post-event competition detail must not show every chart by default');
assert.match(source, /function competitionRegistrationNumbers\(competition\)/, 'pre-event competition detail must summarize registration numbers');
assert.match(source, /function competitionPreEventCards\(competition\)/, 'pre-event competition detail must use pre-match metric cards');
assert.match(source, /function renderCompetitionPreEventPanel\(competition\)/, 'pre-event competition detail must render a dedicated preparation panel');
assert.match(source, /function competitionLiveCards\(competition\)/, 'live competition detail must use in-progress metric cards');
assert.match(source, /function renderCompetitionLivePanel\(competition\)/, 'live competition detail must render a dedicated in-progress panel');
assert.match(source, /function competitionRosterRows\(competition\)/, 'pre-event competition detail must aggregate imported roster rows');
assert.match(source, /function renderCompetitionRosterSnapshot\(competition\)/, 'pre-event competition detail must show a roster snapshot when registration data exists');
assert.match(source, /function competitionRosterWatchRows\(rosterRows\)/, 'pre-event competition detail must identify watch-list athletes from roster rows');
assert.match(source, /function competitionProjectFocusRows\(competition, sortedItems\)/, 'competition detail must summarize what users should inspect first');
assert.match(source, /function renderCompetitionProjectGuide\(competition, sortedItems\)/, 'competition detail must render a project guide before raw project cards');
assert.match(source, /function competitionProjectGroups\(items\)/, 'competition detail must group full project access by age band');
assert.match(source, /function renderCompetitionProjectGroups\(competition, sortedItems, eventCardHtml, options = \{\}\)/, 'competition detail must render grouped full project access');
assert.match(source, /查看全部项目/, 'competition detail must offer grouped project navigation instead of a flat long list');
assert.match(source, /function competitionItemPriorityValue\(item\)/, 'competition project ordering must account for registration, roster, expected and score-backed counts');
assert.match(source, /const chips = competitionProjectSummaryChips\(competition\)/, 'competition hero must use structural project summary chips');
assert.match(source, /class="competition-scope-grid"/, 'competition hero must show compact scope metrics instead of raw full labels');
assert.match(source, /ageText: compactCompetitionScopeText\(competition\.projectScope\.ageText, 3\)/, 'competition hero must not render all age bands from source data');
assert.match(source, /genderText: compactCompetitionScopeText\(competition\.projectScope\.genderText, 2\)/, 'competition hero must keep gender scope short on mobile');
assert.match(source, /project-summary-row/, 'competition hero project summary must have a dedicated compact row');
assert.match(source, /const isPreEventCompetition = competition\.isPreEvent \|\| isPrematchStatusValue\(competition\.status\)/, 'pre-event competitions must not reuse post-event chart assumptions');
assert.match(source, /const isLiveCompetition = isLiveCompetitionStatus\(competition\.status\)/, 'live competitions must be separated from pre-event preparation');
assert.match(source, /isLiveCompetition[\s\S]*renderCompetitionLivePanel\(competition\)[\s\S]*return;/, 'live competition insight area must not fall through to pre-event preparation');
assert.match(source, /renderCompetitionPreEventPanel\(competition\)/, 'pre-event competition insight area must show preparation guidance');
assert.match(source, /registered \? `报名 \$\{registered\}` : rosterStatusLabel\(competition\.rosterStatus\)/, 'pre-event project cards must show roster status instead of undefined post-event metrics');
assert.match(source, /compactCompetitionEventRows\(eventRows, 3\)/, 'competition insight project comparison should stay compact on mobile');
assert.match(source, /limit:\s*4,[\s\S]*otherLabel:\s*'其他年龄段'/, 'competition age distribution should aggregate lower-priority age buckets');
assert.match(source, /const primaryItems = sortedItems\.slice\(0, 4\)/, 'competition event list should show only priority projects by default');
assert.match(source, /renderCompetitionProjectGuide\(competition, sortedItems\)/, 'competition event list must put user-facing project guidance before cards');
assert.match(source, /还有 \$\{secondaryCount\} 个项目，可按组别展开查看。/, 'project guide must explain collapsed project access in user-facing terms');
assert.match(source, /renderCompetitionRosterSnapshot\(competition\)/, 'pre-event competition insight area must include roster snapshot analysis');
assert.match(source, /比赛进行中，可优先查看已出结果的项目和需要继续关注的组别/, 'live competition hero must explain the in-progress user value');
assert.match(source, /label: '查看赛事分析'/, 'competition detail AI action must use user-facing analysis copy');
assert.match(source, /label: '查看赛前提醒'/, 'competition detail prematch action must use user-facing reminder copy');
assert.match(source, /查看本场赛前提醒/, 'competition detail prematch CTA must be result-oriented');
assert.doesNotMatch(source, /AI 分析赛事|生成本场赛前情报包/, 'competition detail CTAs must not expose machine-oriented or process wording');
assert.match(source, /summary: `查看全部 \$\{sortedItems\.length\} 个项目`/, 'competition event list must expose full project access as one grouped entry');
assert.doesNotMatch(source, /按年龄段查看全部|默认展示最关键/, 'competition detail must avoid implementation-like project display explanations');
assert.doesNotMatch(source, /class="event-list-more"/, 'competition event list must not add a second nested expand layer');
assert.match(source, /secondaryItems\.length/, 'competition event list must keep full project access without showing everything by default');
assert.doesNotMatch(source, /更新后会展示具体组别、剑种、报名规模和后续赛果入口/, 'empty project copy must not expose back-office update wording');
assert.doesNotMatch(html, /赛事画像|结构与年龄段|项目列表/, 'competition detail headings must use product-facing language');

assert.match(css, /\.competition-scope-grid/, 'competition scope summary styles must exist');
assert.match(css, /\.competition-scope-grid strong,[\s\S]*text-overflow:\s*ellipsis/, 'competition scope cells must truncate long summaries');
assert.match(css, /\.competition-digest-panel/, 'post-event competition digest panel styles must exist');
assert.match(css, /\.competition-digest-list/, 'post-event competition digest list styles must exist');
assert.match(css, /\.competition-chart-details/, 'post-event collapsed chart access styles must exist');
assert.match(css, /\.competition-chart-stack/, 'post-event collapsed chart content must stay vertically contained');
assert.match(css, /\.competition-prematch-panel/, 'pre-event preparation panel styles must exist');
assert.match(css, /\.competition-live-panel/, 'live competition progress panel styles must exist');
assert.match(css, /\.competition-live-items/, 'live competition focus project styles must exist');
assert.match(css, /\.competition-prematch-items/, 'pre-event priority project styles must exist');
assert.match(css, /\.competition-prematch-roster/, 'pre-event roster snapshot styles must exist');
assert.match(css, /\.competition-prematch-roster-grid/, 'pre-event roster snapshot must use a mobile-safe layout');
assert.match(css, /\.competition-project-guide/, 'project guide styles must exist');
assert.match(css, /\.project-group-list/, 'grouped project list styles must exist');
assert.match(css, /\.project-group-card > summary strong,[\s\S]*text-overflow:\s*ellipsis/, 'project group headers must stay mobile-safe');
assert.doesNotMatch(css, /\.event-list-more\s*\{/, 'competition project access must not keep the removed nested expand shell');

console.log('competition detail compact distributions are covered');
