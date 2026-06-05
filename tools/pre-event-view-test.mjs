import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const start = source.indexOf('function normalizeSearchText');
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
assert.equal(context.rosterStatusLabel('partial'), '报名名单更新中');
assert.equal(context.rosterStatusLabel('complete'), '报名名单已完整');
assert.equal(context.rosterStatusLabel('none'), '名单待更新');

const platformOnly = { isPlatformEventList: true, items: [] };
assert.equal(context.coverageLabel(platformOnly), '基础信息');
assert.doesNotMatch(context.coverageDetail(platformOnly), /projectlist|导入|继续补/);

const preEvent = { isPreEvent: true, items: [{ eventCode: 'TEST' }] };
assert.equal(context.coverageLabel(preEvent), '项目明细');
assert.doesNotMatch(context.coverageDetail(preEvent), /projectlist|导入|继续补/);

console.log('pre-event view labels are covered');
