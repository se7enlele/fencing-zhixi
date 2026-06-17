import assert from 'node:assert/strict';
import { buildScheduledSyncPlan } from './scheduled-sync.mjs';

const events = [
  {
    sportId: 101,
    sportCode: 'REG2026',
    sportName: 'Registration Event',
    startDate: '2026-06-25 08:00:00',
    endDate: '2026-06-26 18:00:00',
    signStartDate: '2026-06-01 08:00:00',
    signAthEndDate: '2026-06-20 18:00:00',
    sportactive: '0',
    sigupactive: '1',
  },
  {
    sportId: 102,
    sportCode: 'UP2026',
    sportName: 'Upcoming Event',
    startDate: '2026-07-05 08:00:00',
    endDate: '2026-07-06 18:00:00',
    sportactive: '0',
    sigupactive: '0',
  },
  {
    sportId: 103,
    sportCode: 'DONE2026',
    sportName: 'Completed Event',
    startDate: '2026-06-01 08:00:00',
    endDate: '2026-06-02 18:00:00',
    sportactive: '2',
    sigupactive: '0',
  },
  {
    sportId: 104,
    sportCode: 'OLD2025',
    sportName: 'Old Event',
    startDate: '2025-01-01 08:00:00',
    endDate: '2025-01-02 18:00:00',
    sportactive: '2',
    sigupactive: '0',
  },
];

const plan = buildScheduledSyncPlan(events, {
  now: '2026-06-17T00:00:00+08:00',
  activeLimit: 2,
  completedLimit: 1,
  recentCompletedDays: 30,
  rosterPageSize: 80,
  rosterMaxPages: 20,
  scoreLimit: 9,
  scoreConcurrency: 2,
});

assert.equal(plan.tasks.length, 3);
assert.deepEqual(plan.tasks.map((task) => task.sportId), [101, 102, 103]);

const rosterTask = plan.tasks[0];
assert.equal(rosterTask.type, 'pre-event-roster');
assert.ok(rosterTask.scriptArgs.includes('--roster'));
assert.ok(rosterTask.scriptArgs.includes('--no-score'));
assert.ok(rosterTask.scriptArgs.includes('--force-projectlist'));
assert.ok(rosterTask.scriptArgs.includes('--force-roster'));
assert.deepEqual(
  rosterTask.scriptArgs.slice(
    rosterTask.scriptArgs.indexOf('--roster-base'),
    rosterTask.scriptArgs.indexOf('--roster-base') + 2,
  ),
  ['--roster-base', 'https://fencing-proxy.aixindiandian.workers.dev'],
);
assert.deepEqual(
  rosterTask.scriptArgs.slice(
    rosterTask.scriptArgs.indexOf('--roster-page-size'),
    rosterTask.scriptArgs.indexOf('--roster-page-size') + 2,
  ),
  ['--roster-page-size', '80'],
);

const scoreTask = plan.tasks[2];
assert.equal(scoreTask.type, 'completed-score');
assert.ok(scoreTask.scriptArgs.includes('--force-score'));
assert.ok(!scoreTask.scriptArgs.includes('--roster'));
assert.deepEqual(
  scoreTask.scriptArgs.slice(
    scoreTask.scriptArgs.indexOf('--proxy-base'),
    scoreTask.scriptArgs.indexOf('--proxy-base') + 2,
  ),
  ['--proxy-base', 'https://fencing-proxy.aixindiandian.workers.dev'],
);
assert.deepEqual(
  scoreTask.scriptArgs.slice(
    scoreTask.scriptArgs.indexOf('--score-limit'),
    scoreTask.scriptArgs.indexOf('--score-limit') + 2,
  ),
  ['--score-limit', '9'],
);

assert.equal(plan.selected.completed.length, 1);
assert.equal(plan.selected.completed[0].sportId, 103);
assert.equal(plan.policy.scoreConcurrency, 2);

console.log('scheduled sync planning is covered');
