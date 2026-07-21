import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { buildSearchIndexes, searchIndexes } from './search-index.mjs';
import { getCoachDirectory, getRefereeDirectory } from '../server.mjs';

const indexes = buildSearchIndexes(
  [],
  [],
  [
    {
      id: 'coach-zhang-san',
      name: '\u5f20\u4e09',
      role: 'coach',
      club: '\u5317\u4eac\u91d1\u77f3',
      province: '\u5317\u4eac',
      city: '\u5317\u4eac',
      level: '\u516c\u5f00\u4fe1\u606f',
      competitionCount: 3,
    },
  ],
  [
    {
      id: 'referee-li-si',
      name: '\u674e\u56db',
      role: 'referee',
      province: '\u4e0a\u6d77',
      city: '\u4e0a\u6d77',
      level: '\u516c\u5f00\u4fe1\u606f',
      competitionCount: 5,
    },
  ],
  [
    {
      sportCode: 'BJLEAGUE2026S1',
      sportName: '2026\u5e74\u5317\u4eac\u5e02\u51fb\u5251\u8054\u8d5b\uff08\u7b2c\u4e00\u7ad9\uff09',
      venue: '\u5317\u4eac\u00b7\u987a\u4e49',
      region: '\u5317\u4eac',
      dateLabel: '2026.04.11 / 2026.04.12',
      season: '2026',
      status: 'completed',
      items: [
        { shortEventName: 'U10 \u7537\u82b1', eventName: 'U10\u7537\u5b50\u82b1\u5251\u4e2a\u4eba', eventCode: 'BJLEAGUE2026S1-MFIU10' },
      ],
    },
  ],
);

const coachResult = searchIndexes(indexes, '\u5f20\u4e09');
assert.equal(coachResult.athletes.length, 0, 'coach search should not be returned as athlete');
assert.equal(coachResult.coaches.length, 1, 'coach search should return coach matches');
assert.equal(coachResult.coaches[0].name, '\u5f20\u4e09');
assert.equal(coachResult.coaches[0].role, 'coach');
assert.equal(coachResult.coaches[0].matchReason, '\u59d3\u540d\u5339\u914d');

const refereeResult = searchIndexes(indexes, '\u88c1\u5224 \u4e0a\u6d77');
assert.equal(refereeResult.referees.length, 1, 'referee search should support role and city tokens');
assert.equal(refereeResult.referees[0].name, '\u674e\u56db');
assert.equal(refereeResult.referees[0].role, 'referee');

const chineseRoleIndexes = buildSearchIndexes(
  [],
  [],
  [{ id: 'coach-cn', name: '\u738b\u6559\u7ec3', role: '\u6559\u7ec3\u5458', club: '\u5317\u4eac\u91d1\u77f3' }],
  [{ id: 'referee-cn', name: '\u8d75\u88c1\u5224', role: '\u88c1\u5224\u5458', city: '\u5317\u4eac' }],
);
assert.equal(searchIndexes(chineseRoleIndexes, '\u6559\u7ec3\u5458 \u738b').coaches.length, 1, 'coach search should support Chinese role labels from manual imports');
assert.equal(searchIndexes(chineseRoleIndexes, '\u88c1\u5224\u5458 \u5317\u4eac').referees.length, 1, 'referee search should support Chinese role labels from manual imports');

const coachOnlyResult = searchIndexes(indexes, '\u5317\u4eac', { type: 'coach' });
assert.equal(coachOnlyResult.coaches.length, 1, 'type=coach should return coach rows');
assert.equal(coachOnlyResult.athletes.length, 0, 'type=coach should suppress athletes');
assert.equal(coachOnlyResult.clubs.length, 0, 'type=coach should suppress clubs');
assert.equal(coachOnlyResult.referees.length, 0, 'type=coach should suppress referees');
assert.equal(coachOnlyResult.competitions.length, 0, 'type=coach should suppress competitions');

const competitionAliasResult = searchIndexes(indexes, '\u5317\u4eac\u51fb\u5251\u8054\u8d5b\u7b2c\u4e00\u7ad9');
assert.equal(competitionAliasResult.competitions.length, 1, 'competition search should match city-suffix and bracket-insensitive aliases');
assert.equal(competitionAliasResult.competitions[0].sportCode, 'BJLEAGUE2026S1');
assert.equal(competitionAliasResult.competitions[0].matchReason, '\u8d5b\u4e8b\u540d\u79f0\u5339\u914d');

const competitionOnlyResult = searchIndexes(indexes, '\u5317\u4eac', { type: 'competition' });
assert.equal(competitionOnlyResult.competitions.length, 1, 'type=competition should return competition rows');
assert.equal(competitionOnlyResult.athletes.length, 0, 'type=competition should suppress athletes');
assert.equal(competitionOnlyResult.clubs.length, 0, 'type=competition should suppress clubs');
assert.equal(competitionOnlyResult.coaches.length, 0, 'type=competition should suppress coaches');
assert.equal(competitionOnlyResult.referees.length, 0, 'type=competition should suppress referees');

const emptyIndexes = buildSearchIndexes([], []);
const emptyResult = searchIndexes(emptyIndexes, '\u738b');
assert.deepEqual(emptyResult.coaches, [], 'missing coach data should be an empty result list');
assert.deepEqual(emptyResult.referees, [], 'missing referee data should be an empty result list');
assert.deepEqual(emptyResult.competitions, [], 'missing competition data should be an empty result list');

assert.ok(Array.isArray(await getCoachDirectory()), 'server should expose a coach directory array');
assert.ok(Array.isArray(await getRefereeDirectory()), 'server should expose a referee directory array');
const validation = JSON.parse(execFileSync(process.execPath, ['tools/validate-officials.mjs', 'data/analysis/officials.example.json'], { encoding: 'utf8' }));
assert.equal(validation.ok, true, 'official directory example should pass validation');
assert.equal(validation.coaches, 1, 'official directory example should include a coach');
assert.equal(validation.referees, 1, 'official directory example should include a referee');

console.log('official search index behavior is covered');
