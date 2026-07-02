import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');
const start = source.indexOf('function shortEventName');
const end = source.indexOf('function renderAthleteDetail');
if (start === -1 || end === -1 || end <= start) {
  throw new Error('Unable to locate athlete detail helpers in viewer.js');
}

const context = {};
vm.createContext(context);
vm.runInContext(`${source.slice(start, end)}
globalThis.buildAthleteTimelineRows = buildAthleteTimelineRows;
globalThis.buildPoolPerformanceRows = buildPoolPerformanceRows;
`, context);

const athlete = {
  name: '测试选手',
  events: [
    {
      eventName: 'U8 男子花剑',
      shortEventName: 'U8 男花',
      sportName: '天津公开赛',
      openDate: '2026.06.12',
      finalRank: 3,
      poolRank: 2,
      poolWins: 5,
      poolMatches: 6,
      eliminationWins: 2,
      eliminationLosses: 1,
      venue: '天津',
    },
    {
      eventName: 'U10 男子花剑',
      shortEventName: 'U10 男花',
      sportName: '北京公开赛',
      openDate: '2026.04.25',
      finalRank: 16,
      poolRank: 8,
      poolWins: 2,
      poolMatches: 5,
      eliminationWins: 0,
      eliminationLosses: 1,
      venue: '北京',
    },
  ],
};

assert.deepEqual(context.buildAthleteTimelineRows(athlete).map((row) => ({
  title: row.title,
  date: row.date,
  rank: row.rank,
  pool: row.pool,
  elimination: row.elimination,
})), [
  {
    title: 'U8 男花',
    date: '2026.06.12',
    rank: '第3名',
    pool: '小组第2',
    elimination: '淘汰赛 2胜1负',
  },
  {
    title: 'U10 男花',
    date: '2026.04.25',
    rank: '第16名',
    pool: '小组第8',
    elimination: '淘汰赛 0胜1负',
  },
]);

assert.deepEqual(context.buildPoolPerformanceRows(athlete.events).map((row) => ({
  title: row.title,
  record: row.record,
  percent: row.percent,
  label: row.label,
})), [
  {
    title: 'U8 男花',
    record: '5/6',
    percent: 83,
    label: '稳定发挥',
  },
  {
    title: 'U10 男花',
    record: '2/5',
    percent: 40,
    label: '重点复盘',
  },
]);

assert.match(source, /function buildAthleteDataRequestText\(athlete, requestType, details = \{\}\)/, 'athlete detail must build correction and hide request copy');
assert.match(source, /认领选手档案/, 'athlete detail must build a clear athlete claim request label');
assert.match(source, /成长报告、赛前提醒和数据核验/, 'athlete claim requests must explain the product reason for claiming');
assert.match(source, /function requestAthleteDataRequestDetails\(athlete, requestType\)/, 'athlete detail must collect contact and request details before submission');
assert.match(source, /window\.prompt\(`留下微信或手机号，方便核验/, 'athlete data requests must ask for a contact before submission');
assert.match(source, /联系方式：\$\{details\.contact\}/, 'athlete data request message must include contact details when provided');
assert.match(source, /补充说明：\$\{details\.note\}/, 'athlete data request message must include the user-provided explanation');
assert.match(source, /async function submitAthleteDataRequest\(athlete, requestType, details = \{\}\)/, 'athlete detail must submit correction and hide requests');
assert.match(source, /fetch\('\/api\/feedback'/, 'athlete data feedback must use the feedback API');
assert.match(source, /function renderAthleteDataRequestPanel\(athlete\)/, 'athlete detail must render a data feedback entry');
assert.match(source, /data-athlete-request="correct"/, 'athlete detail must expose a correction request action');
assert.match(source, /data-athlete-request="hide"/, 'athlete detail must expose a hide request action');
assert.match(source, /data-athlete-request="claim-athlete"/, 'athlete detail must expose an athlete claim action');
assert.match(source, /const details = requestAthleteDataRequestDetails\(athlete, button\.dataset\.athleteRequest\);/, 'athlete data feedback must collect details before submitting');
assert.match(source, /if \(!details\)/, 'athlete data feedback must allow users to cancel before submitting');
assert.match(source, /button\.textContent = '已提交'/, 'athlete data feedback must confirm successful submission');
assert.match(source, /button\.textContent = '已复制说明'/, 'athlete data feedback must fall back to copied request text');
assert.match(source, /renderAthleteDataRequestPanel\(athlete\)/, 'athlete detail rendering must show the data feedback panel');
assert.match(css, /\.athlete-data-request/, 'athlete data feedback panel styles must exist');
assert.match(css, /\.athlete-data-request-actions/, 'athlete data feedback action styles must exist');

console.log('athlete detail view model is clear');
