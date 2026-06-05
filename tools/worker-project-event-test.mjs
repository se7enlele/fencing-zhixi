import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../cloudflare/worker.mjs', import.meta.url), 'utf8');
const start = source.indexOf('function findProjectOnlyEvent');
const end = source.indexOf('function normalizeDeviceId');
if (start === -1 || end === -1 || end <= start) {
  throw new Error('Unable to locate findProjectOnlyEvent in worker.mjs');
}

assert.match(
  source,
  /merged\.eventsByCode\[eventCode\]\s*\|\|\s*findProjectOnlyEvent\(merged\.publicEvents,\s*eventCode\)/,
  'Worker /api/events route must fall back to project-only event details',
);

const context = {};
vm.createContext(context);
vm.runInContext(`${source.slice(start, end)}
globalThis.findProjectOnlyEvent = findProjectOnlyEvent;
`, context);

const event = context.findProjectOnlyEvent({
  competitions: [{
    sportCode: 'TEST2026',
    sportName: 'Test Open',
    venue: 'Test City',
    rosterStatus: 'none',
    items: [{
      eventCode: 'TEST2026MFIU10',
      shortEventName: 'U10 男花',
      status: 'registration',
      isPreEvent: true,
    }],
  }],
}, 'TEST2026MFIU10');

assert.equal(event.sportCode, 'TEST2026');
assert.equal(event.sportName, 'Test Open');
assert.equal(event.eventCode, 'TEST2026MFIU10');
assert.equal(Array.isArray(event.participants), true);
assert.equal(event.participants.length, 0);
assert.equal(Array.isArray(event.poolGroups), true);
assert.equal(event.poolGroups.length, 0);
assert.equal(Array.isArray(event.eliminationMatches), true);
assert.equal(event.eliminationMatches.length, 0);

console.log('worker project-only event fallback is covered');
