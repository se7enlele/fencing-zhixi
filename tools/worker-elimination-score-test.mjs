import assert from 'node:assert/strict';
import { buildEventDetail } from '../cloudflare/edge-data.mjs';

const event = buildEventDetail({
  general: {
    eventCode: 'TEST-MFIU8',
    sportCode: 'TEST',
    sportName: 'Test Open',
    eventName: 'U8 男花',
    openDate: '2026.06.05',
    venue: 'Test Venue',
  },
  normalized: {
    classment: [
      { rank: 1, name: 'Winner', licence: 'W001', club: 'Club A' },
      { rank: 2, name: 'Runner', licence: 'R001', club: 'Club B' },
    ],
    poolResults: [],
    poolStandings: [],
    poolBouts: [],
    eliminationMatches: [{
      matchCode: 'F001',
      phase: { longName: '决赛', order: 1 },
      home: {
        name: 'Winner',
        licence: 'W001',
        club: 'Club A',
        points: 10,
        result: 'W',
      },
      away: {
        name: 'Runner',
        licence: 'R001',
        club: 'Club B',
        points: 4,
        result: 'L',
      },
      winner: { name: 'Winner', club: 'Club A' },
      isBye: false,
    }],
  },
}, 'test-score.json');

const winner = event.eliminationLeaders.find((row) => row.name === 'Winner');
const runner = event.eliminationLeaders.find((row) => row.name === 'Runner');

assert.ok(winner, 'winner should be included in elimination leaders');
assert.ok(runner, 'runner should be included in elimination leaders');
assert.equal(winner.wins, 1);
assert.equal(winner.losses, 0);
assert.equal(winner.scored, 10);
assert.equal(winner.received, 4);
assert.equal(winner.diff, 6);
assert.equal(runner.wins, 0);
assert.equal(runner.losses, 1);
assert.equal(runner.scored, 4);
assert.equal(runner.received, 10);
assert.equal(runner.diff, -6);

console.log('worker elimination leader score totals are covered');
