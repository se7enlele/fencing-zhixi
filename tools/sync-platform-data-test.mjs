import assert from 'node:assert/strict';
import {
  buildScorePayloadFromClassmentRank,
  hasScoreRankingRows,
  inferPlatformStatus,
  isHttpStatusError,
  normalizeConcurrency,
  selectEvents,
  selectEventsForSync,
  sliceScoreItems,
} from './sync-platform-data.mjs';
import { buildScoreReport } from './parse-score.mjs';

const events = [
  {
    sportId: 1,
    sportCode: 'DONE',
    sportName: 'Finished',
    startDate: '2026-01-01 08:00:00',
    endDate: '2026-01-02 18:00:00',
    sportactive: '2',
    sigupactive: '2',
  },
  {
    sportId: 2,
    sportCode: 'REG',
    sportName: 'Registration',
    startDate: '2026-10-01 08:00:00',
    endDate: '2026-10-02 18:00:00',
    signStartDate: '2026-01-01 08:00:00',
    signAthEndDate: '2026-12-01 18:00:00',
    sportactive: '0',
    sigupactive: '1',
  },
  {
    sportId: 3,
    sportCode: 'NEXT',
    sportName: 'Upcoming',
    startDate: '2026-11-01 08:00:00',
    endDate: '2026-11-02 18:00:00',
    sportactive: '0',
    sigupactive: '0',
  },
];

assert.equal(inferPlatformStatus(events[0]), 'completed');
assert.equal(inferPlatformStatus(events[1]), 'registration');
assert.equal(inferPlatformStatus(events[2]), 'upcoming');

assert.deepEqual(selectEvents(events, { status: 'completed', limit: 5 }).map((event) => event.sportCode), ['DONE']);
assert.deepEqual(selectEvents(events, { status: 'registration', limit: 5 }).map((event) => event.sportCode), ['REG']);
assert.equal(selectEvents(events, { status: 'all', limit: 2 }).length, 2);
assert.deepEqual(selectEvents(events, { status: 'all', limit: 5, startAfterSportId: 2 }).map((event) => event.sportCode), ['DONE']);
assert.deepEqual(selectEventsForSync(events, { sportId: 2 }).map((event) => event.sportCode), ['REG']);
assert.deepEqual(selectEventsForSync(events, { sportId: 999 }).map((event) => event.sportCode), []);
assert.equal(isHttpStatusError(new Error('HTTP 404 Not Found: missing')), true);
assert.equal(isHttpStatusError(new Error('The operation was aborted')), false);
assert.deepEqual(sliceScoreItems([1, 2, 3, 4], { scoreStart: 1, scoreLimit: 2 }), [2, 3]);
assert.deepEqual(sliceScoreItems([1, 2, 3], { scoreStart: 2, scoreLimit: 0 }), [3]);
assert.equal(normalizeConcurrency(0), 1);
assert.equal(normalizeConcurrency(3), 3);
assert.equal(normalizeConcurrency(20), 8);

const scorePayload = buildScorePayloadFromClassmentRank({
  code: 0,
  msg: 'ok',
  data: [{
    eventshowrank: '1',
    eventrank: '1',
    fencer: '李禹辰',
    licence: '20160205M202403240521',
    noccode: '北京金石',
    birthday: null,
    medal: '金',
    statut: null,
    feventdispos: '1',
    ecode: 'D05GJSSD1820260221MFIU10',
    qualifystatusid: '1',
  }],
}, {
  sourceEventCode: 'D05GJSSD1820260221MFIU10',
  sourceSportCode: 'D05GJSSD1820260221',
  itemName: 'U10男子花剑个人',
  startDate: '2026-05-02 00:00:00',
}, {
  sportName: '2026年中国击剑俱乐部联赛（第二站）',
  venue: '山东',
});
const scoreReport = buildScoreReport(scorePayload, { sourceType: 'classmentrank' });
assert.equal(scoreReport.general.eventCode, 'D05GJSSD1820260221MFIU10');
assert.equal(scoreReport.general.sportCode, 'D05GJSSD1820260221');
assert.equal(scoreReport.summary.classmentCount, 1);
assert.equal(scoreReport.normalized.classment[0].name, '李禹辰');
assert.equal(scoreReport.normalized.classment[0].rank, 1);
assert.equal(hasScoreRankingRows(scoreReport), true);

const emptyScoreReport = buildScoreReport(buildScorePayloadFromClassmentRank({
  code: 0,
  msg: 'ok',
  data: [],
}, {
  sourceEventCode: 'RZSS2035011MFIU6',
  sourceSportCode: 'RZSS2035011',
  itemName: 'U6',
}, {
  sportName: 'Nanyang',
}), { sourceType: 'classmentrank' });
assert.equal(emptyScoreReport.summary.classmentCount, 0);
assert.equal(hasScoreRankingRows(emptyScoreReport), false);

console.log('platform sync planning is covered');
