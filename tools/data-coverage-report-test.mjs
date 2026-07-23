import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('./data-coverage-report.mjs', import.meta.url), 'utf8');

assert.match(
  source,
  /competition\.status === 'live' \|\| competition\.status === 'running'/,
  'data coverage report must classify current live competitions as in progress',
);

assert.match(
  source,
  /\['registration', 'upcoming', 'live', 'running'\]\.includes\(competition\.status\)/,
  'data coverage business priority must include live competitions in prematch/current work',
);

console.log('data coverage report live status handling is covered');
