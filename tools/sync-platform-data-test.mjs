import assert from 'node:assert/strict';
import {
  inferPlatformStatus,
  isHttpStatusError,
  selectEvents,
  selectEventsForSync,
} from './sync-platform-data.mjs';

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

console.log('platform sync planning is covered');
