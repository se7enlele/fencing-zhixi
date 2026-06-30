import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { hasPublicSensitiveKey, sanitizePublicData } from './public-sanitize.mjs';

const fixture = {
  athlete: {
    id: 'opaque-athlete-id',
    name: '测试选手',
    licence: '20100101M202401010001',
    birthday: '2010-01-01',
    registerId: 'register-raw-id',
    nested: {
      sourceLicence: 'source-id',
      mobile: '13800000000',
      safe: 'kept',
    },
  },
  rows: [
    { name: 'A', registerCode: 'code-a', score: 10 },
    { name: 'B', phone: '13900000000', score: 4 },
  ],
};

const sanitized = sanitizePublicData(fixture);
assert.equal(hasPublicSensitiveKey(sanitized), false, 'public sanitizer should remove sensitive keys recursively');
assert.equal(sanitized.athlete.id, 'opaque-athlete-id', 'public sanitizer should preserve opaque ids');
assert.equal(sanitized.athlete.name, '测试选手', 'public sanitizer should preserve display names');
assert.equal(sanitized.athlete.nested.safe, 'kept', 'public sanitizer should preserve non-sensitive nested values');
assert.equal(sanitized.rows[0].score, 10, 'public sanitizer should preserve performance metrics');

const buildScript = await readFile(new URL('./build-cloudflare-data.mjs', import.meta.url), 'utf8');
assert.match(buildScript, /sanitizePublicData\(stripListOnlyFields\(workerPublicEvents\)\)/, 'public event index must be sanitized before writing static assets');
assert.match(buildScript, /eventsByCode:\s+sanitizePublicData\(/, 'event detail chunks must be sanitized before writing static assets');
assert.match(buildScript, /athletesById:\s+sanitizePublicData\(/, 'athlete chunks must be sanitized before writing static assets');
assert.match(buildScript, /buildSearchIndexes\(athletes,\s*clubs\)/, 'search indexes should still be built from complete internal directories before sanitizing output');
assert.match(buildScript, /removeStalePublicDataFiles\(\)/, 'static build must remove stale public-data chunks before writing sanitized chunks');
assert.match(buildScript, /public-data-\(events\|athletes\|clubs\|search\)-\\d\+\\\.json/, 'static build cleanup must target generated public-data chunks');

const workerScript = await readFile(new URL('../cloudflare/worker.mjs', import.meta.url), 'utf8');
assert.match(workerScript, /import \{ sanitizePublicData \} from '\.\.\/tools\/public-sanitize\.mjs';/, 'worker must import the public sanitizer');
assert.match(workerScript, /url\.pathname === '\/api\/events'[\s\S]*?sanitizePublicData\(/, 'worker event index endpoint must sanitize output');
assert.match(workerScript, /url\.pathname === '\/api\/search'[\s\S]*?sanitizePublicData\(/, 'worker search endpoint must sanitize output');
assert.match(workerScript, /event = sanitizePublicData\(event\);/, 'worker event detail endpoint must sanitize static and dynamic details');
assert.match(workerScript, /const athlete = sanitizePublicData\(/, 'worker athlete detail endpoint must sanitize output');
assert.match(workerScript, /club = sanitizePublicData\(club\);/, 'worker club detail endpoint must sanitize output');

const serverScript = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
assert.match(serverScript, /import \{ sanitizePublicData \} from '\.\/tools\/public-sanitize\.mjs';/, 'local server must import the public sanitizer');
assert.match(serverScript, /sanitizePublicData\(await getEventIndexPayload\(\)\)/, 'local event index endpoint must sanitize output');
assert.match(serverScript, /sanitizePublicData\(await getCompetitionIndexPayload\(\)\)/, 'local competition endpoint must sanitize output');
assert.match(serverScript, /sanitizePublicData\(\{\s*ok: true,\s*version: APP_VERSION,\s*event: buildEventDetail/s, 'local event detail endpoint must sanitize output');
assert.match(serverScript, /sanitizePublicData\(\{ ok: true, version: APP_VERSION, athlete: found \}\)/, 'local athlete endpoint must sanitize output');
assert.match(serverScript, /sanitizePublicData\(\{ ok: true, version: APP_VERSION, club: found \}\)/, 'local club endpoint must sanitize output');

console.log('public-data-privacy ok');
