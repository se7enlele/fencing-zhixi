import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const start = source.indexOf('function itemFilterLabel');
const end = source.indexOf('function competitionSearchHaystack');
if (start === -1 || end === -1 || end <= start) {
  throw new Error('Unable to locate status helper functions in viewer.js');
}

const context = {};
vm.createContext(context);
vm.runInContext(`${source.slice(start, end)}
globalThis.statusLabel = statusLabel;
globalThis.isLiveCompetitionStatus = isLiveCompetitionStatus;
globalThis.isPrematchStatusValue = isPrematchStatusValue;
globalThis.competitionStatusMatches = competitionStatusMatches;
globalThis.rosterStatusLabel = rosterStatusLabel;
globalThis.coverageLabel = coverageLabel;
globalThis.coverageDetail = coverageDetail;
`, context);

assert.equal(context.statusLabel('registration'), '报名中');
assert.equal(context.statusLabel('upcoming'), '未开赛');
assert.equal(context.statusLabel('live'), '进行中');
assert.equal(context.statusLabel('running'), '进行中');
assert.equal(context.statusLabel('completed'), '已结束');
assert.equal(context.isLiveCompetitionStatus('running'), true);
assert.equal(context.isPrematchStatusValue('running'), true);
assert.equal(context.competitionStatusMatches('running', 'live'), true);
assert.equal(context.competitionStatusMatches('live', 'running'), true);
assert.equal(context.rosterStatusLabel('partial'), '报名陆续公布');
assert.equal(context.rosterStatusLabel('complete'), '报名名单可查看');
assert.equal(context.rosterStatusLabel('none'), '报名待公布');

const platformOnly = { isPlatformEventList: true, items: [] };
assert.equal(context.coverageLabel(platformOnly), '基础信息');
assert.doesNotMatch(context.coverageDetail(platformOnly), /projectlist|导入|继续补|已收录/);

const preEvent = { isPreEvent: true, items: [{ eventCode: 'TEST' }] };
assert.equal(context.coverageLabel(preEvent), '项目明细');
assert.doesNotMatch(context.coverageDetail(preEvent), /projectlist|导入|继续补|已收录/);

assert.doesNotMatch(source, /报名名单更新中|名单待更新|规模待确认|已收录 \${rosterRows\.length} 条报名记录|AI 分析项目/, 'pre-event visible copy must avoid back-office state wording');
assert.doesNotMatch(source, /预计 \${summary\.expectedRegistrationCount} 人次参与/, 'competition cards must not present expectedRegistrationCount as real roster scale');

assert.match(source, /value: numbers\.registered \|\| '-'\,/, 'pre-event cards must only display confirmed roster counts');
assert.match(source, /count: Number\(item\.registrationCount\) \|\| Number\(item\.roster\?\.length\) \|\| 0,/, 'pre-event project rankings must only use confirmed roster counts');
assert.match(source, /showParticipantTotals && group\.total/, 'pre-event project groups must hide unconfirmed capacity totals');

const insightStart = source.indexOf('function competitionListActionLabel');
const insightEnd = source.indexOf('function renderCompetitionHero');
if (insightStart === -1 || insightEnd === -1 || insightEnd <= insightStart) {
  throw new Error('Unable to locate competition list card helpers in viewer.js');
}

const insightContext = {};
vm.createContext(insightContext);
vm.runInContext(`
function competitionHasItems(competition) { return (competition.items || []).length > 0; }
function competitionItemCount(competition) { return (competition.items || []).length; }
function competitionMetricTotal() { return 0; }
function competitionItemSummaries(competition) { return competition.items || []; }
function displayEventName(item) { return item?.eventName || item?.shortEventName || ''; }
function competitionCoverageLevel(competition) { return competition.coverageLevel || 'schedule'; }
function isLiveCompetitionStatus(status) { return status === 'live' || status === 'running'; }
${source.slice(insightStart, insightEnd)}
globalThis.competitionListActionLabel = competitionListActionLabel;
globalThis.competitionListSummary = competitionListSummary;
`, insightContext);

const projectOnlyInsight = insightContext.competitionListSummary({
  status: 'upcoming',
  isPreEvent: true,
  registrationSummary: { expectedRegistrationCount: 90000 },
  items: [{ eventName: 'U8 男花' }, { eventName: 'U10 男花' }],
});
assert.equal(projectOnlyInsight, '2 个项目 · 即将开赛');
assert.doesNotMatch(projectOnlyInsight, /90000|预计|人次参与/);

const rosterInsight = insightContext.competitionListSummary({
  status: 'registration',
  isPreEvent: true,
  registrationSummary: { rosterCount: 38, expectedRegistrationCount: 90000 },
  items: [],
});
assert.equal(rosterInsight, '38 人次已报名 · 名单可查看');
assert.equal(insightContext.competitionListActionLabel({ status: 'registration' }), '查看报名');
assert.equal(insightContext.competitionListActionLabel({ status: 'running' }), '查看赛况');
assert.equal(insightContext.competitionListActionLabel({ status: 'completed', coverageLevel: 'score' }), '查看赛果');

const listStart = source.indexOf('function renderCompetitionList');
const listEnd = source.indexOf('function aiCompetitionFilterChips');
const listSource = source.slice(listStart, listEnd);
assert.doesNotMatch(listSource, /coverage-badge|roster-badge|available-layer-row|event-chip-row|competitionChips\(|competitionAvailableLayerLabels\(/, 'competition list cards must not expose data-layer labels or enumerate projects');
assert.match(listSource, /competition-card-action/, 'competition list cards should provide one status-driven action');

console.log('pre-event view labels are covered');
