import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import './event-date-enrichment-test.mjs';

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
globalThis.athleteBirthCohort = athleteBirthCohort;
globalThis.athleteAgeGroupSummaryRows = athleteAgeGroupSummaryRows;
globalThis.athleteCrossAgeCompetitionRows = athleteCrossAgeCompetitionRows;
`, context);

const athlete = {
  name: '测试选手',
  events: [
    {
      sportCode: 'TIANJIN-2026',
      eventName: 'U8 男子花剑',
      shortEventName: 'U8 男花',
      sportName: '天津公开赛',
      openDate: '2026-06-12 08:00:00',
      ageBand: '2018 上半年',
      finalRank: 3,
      medal: '铜',
      poolRank: 2,
      poolWins: 5,
      poolMatches: 6,
      eliminationWins: 2,
      eliminationLosses: 1,
      venue: '天津',
    },
    {
      sportCode: 'TIANJIN-2026',
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

assert.equal(context.athleteBirthCohort(athlete), '2018 上半年');
assert.deepEqual(JSON.parse(JSON.stringify(context.athleteAgeGroupSummaryRows(athlete.events).map((row) => ({
  age: row.age,
  appearances: row.appearances,
  competitions: row.competitions,
  bestRank: row.bestRank,
  top8: row.top8,
  medals: row.medals,
})))), [
  { age: 'U8', appearances: 1, competitions: 1, bestRank: 3, top8: 1, medals: 1 },
  { age: 'U10', appearances: 1, competitions: 1, bestRank: 16, top8: 0, medals: 0 },
]);
assert.deepEqual(JSON.parse(JSON.stringify(context.athleteCrossAgeCompetitionRows(athlete.events).map((row) => ({
  competition: row.competition,
  ages: row.ages,
  results: row.results,
})))), [{
  competition: '天津公开赛',
  ages: ['U8', 'U10'],
  results: ['U8 第3名', 'U10 第16名'],
}]);

assert.deepEqual(context.buildPoolPerformanceRows(athlete.events).map((row) => ({
  title: row.title,
  date: row.date,
  record: row.record,
  percent: row.percent,
  label: row.label,
})), [
  {
    title: 'U8 男花',
    date: '2026.06.12',
    record: '5/6',
    percent: 83,
    label: '稳定发挥',
  },
  {
    title: 'U10 男花',
    date: '2026.04.25',
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
assert.match(source, /ATHLETE_DATA_REQUEST_KEY = 'fencingai\.athleteDataRequests\.v1'/, 'athlete data requests must use local progress persistence');
assert.match(source, /function trackAthleteDataRequest\(athlete, requestType, details = \{\}, result = \{\}\)/, 'athlete data feedback must track submitted requests locally');
assert.match(source, /saveStoredList\(ATHLETE_DATA_REQUEST_KEY, state\.athleteDataRequests, 10\)/, 'athlete data feedback must persist submitted requests');
assert.match(source, /const result = await submitAthleteDataRequest\(athlete, button\.dataset\.athleteRequest, details\);/, 'athlete data feedback must keep the API response');
assert.match(source, /trackAthleteDataRequest\(athlete, button\.dataset\.athleteRequest, details, result\);/, 'athlete data feedback must update the local progress panel after submit');
assert.match(source, /button\.textContent = '已提交'/, 'athlete data feedback must confirm successful submission');
assert.match(source, /button\.textContent = '已复制说明'/, 'athlete data feedback must fall back to copied request text');
assert.match(source, /renderAthleteDataRequestPanel\(athlete\)/, 'athlete detail rendering must show the data feedback panel');
assert.match(source, /athlete-profile-meta/, 'athlete detail must show basic profile information without exposing exact birthday');
assert.match(source, /年龄组表现/, 'athlete detail must summarize U8, U10 and other age-group participation separately');
assert.match(source, /跨组参赛/, 'athlete detail must surface same-competition cross-age participation');
assert.match(css, /\.athlete-data-request/, 'athlete data feedback panel styles must exist');
assert.match(css, /\.athlete-data-request-actions/, 'athlete data feedback action styles must exist');
assert.match(css, /\.athlete-age-summary/, 'athlete age-group summary must have a mobile-safe layout');
assert.match(css, /\.athlete-cross-age/, 'athlete cross-age highlights must have a focused visual treatment');

console.log('athlete detail view model is clear');
