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
globalThis.rosterStatusLabel = rosterStatusLabel;
globalThis.coverageLabel = coverageLabel;
globalThis.coverageDetail = coverageDetail;
`, context);

assert.equal(context.statusLabel('registration'), '报名中');
assert.equal(context.statusLabel('upcoming'), '未开赛');
assert.equal(context.statusLabel('live'), '进行中');
assert.equal(context.statusLabel('completed'), '已结束');
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

const insightStart = source.indexOf('function competitionListInsight');
const insightEnd = source.indexOf('function renderCompetitionHero');
if (insightStart === -1 || insightEnd === -1 || insightEnd <= insightStart) {
  throw new Error('Unable to locate competition list insight function in viewer.js');
}

const insightContext = {};
vm.createContext(insightContext);
vm.runInContext(`
function competitionHasItems(competition) { return (competition.items || []).length > 0; }
function competitionItemCount(competition) { return (competition.items || []).length; }
function competitionMetricTotal() { return 0; }
function competitionItemSummaries(competition) { return competition.items || []; }
function displayEventName(item) { return item?.eventName || item?.shortEventName || ''; }
${source.slice(insightStart, insightEnd)}
globalThis.competitionListInsight = competitionListInsight;
`, insightContext);

const projectOnlyInsight = insightContext.competitionListInsight({
  isPreEvent: true,
  registrationSummary: { expectedRegistrationCount: 90000 },
  items: [{ eventName: 'U8 男花' }, { eventName: 'U10 男花' }],
});
assert.equal(projectOnlyInsight, '2 个项目可查看，适合先关注赛程和项目安排。');
assert.doesNotMatch(projectOnlyInsight, /90000|预计|人次参与/);

const rosterInsight = insightContext.competitionListInsight({
  isPreEvent: true,
  registrationSummary: { rosterCount: 38, expectedRegistrationCount: 90000 },
  items: [],
});
assert.equal(rosterInsight, '已有 38 条报名动态，可先看项目热度、主要俱乐部和重点选手。');

console.log('pre-event view labels are covered');
