import assert from 'node:assert/strict';
import { buildSearchIndexes, searchIndexes } from './search-index.mjs';
import { getCoachDirectory, getRefereeDirectory } from '../server.mjs';

const indexes = buildSearchIndexes(
  [],
  [],
  [
    {
      id: 'coach-zhang-san',
      name: '张三',
      role: 'coach',
      club: '北京金石',
      province: '北京',
      city: '北京',
      level: '公开信息',
      competitionCount: 3,
    },
  ],
  [
    {
      id: 'referee-li-si',
      name: '李四',
      role: 'referee',
      province: '上海',
      city: '上海',
      level: '公开信息',
      competitionCount: 5,
    },
  ],
);

const coachResult = searchIndexes(indexes, '张三');
assert.equal(coachResult.athletes.length, 0, 'coach search should not be returned as athlete');
assert.equal(coachResult.coaches.length, 1, 'coach search should return coach matches');
assert.equal(coachResult.coaches[0].name, '张三');
assert.equal(coachResult.coaches[0].role, 'coach');
assert.equal(coachResult.coaches[0].matchReason, '姓名匹配');

const refereeResult = searchIndexes(indexes, '裁判 上海');
assert.equal(refereeResult.referees.length, 1, 'referee search should support role and city tokens');
assert.equal(refereeResult.referees[0].name, '李四');
assert.equal(refereeResult.referees[0].role, 'referee');

const coachOnlyResult = searchIndexes(indexes, '北京', { type: 'coach' });
assert.equal(coachOnlyResult.coaches.length, 1, 'type=coach should return coach rows');
assert.equal(coachOnlyResult.athletes.length, 0, 'type=coach should suppress athletes');
assert.equal(coachOnlyResult.clubs.length, 0, 'type=coach should suppress clubs');
assert.equal(coachOnlyResult.referees.length, 0, 'type=coach should suppress referees');

const emptyIndexes = buildSearchIndexes([], []);
const emptyResult = searchIndexes(emptyIndexes, '王');
assert.deepEqual(emptyResult.coaches, [], 'missing coach data should be an empty result list');
assert.deepEqual(emptyResult.referees, [], 'missing referee data should be an empty result list');

assert.ok(Array.isArray(await getCoachDirectory()), 'server should expose a coach directory array');
assert.ok(Array.isArray(await getRefereeDirectory()), 'server should expose a referee directory array');

console.log('official search index behavior is covered');
