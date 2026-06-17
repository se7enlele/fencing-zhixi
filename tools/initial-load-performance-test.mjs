import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const worker = await readFile(new URL('../cloudflare/worker.mjs', import.meta.url), 'utf8');
const server = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');

assert.match(js, /const result = await fetchJson\('\/api\/competitions'\)/, 'initial load must fetch only the competition index');
assert.doesNotMatch(
  js,
  /state\.athletesById\s*=\s*Object\.fromEntries\(\(result\.athletes/,
  'initial load must not hydrate the athlete directory from /api/competitions',
);
assert.doesNotMatch(
  js,
  /state\.clubsById\s*=\s*Object\.fromEntries\(\(result\.clubs/,
  'initial load must not hydrate the club directory from /api/competitions',
);
assert.doesNotMatch(
  js,
  /state\.athleteSearchIndex\s*=\s*buildAthleteSearchIndex\(\);[\s\S]{0,80}state\.clubSearchIndex\s*=\s*buildClubSearchIndex\(\);/,
  'initial load must not build local entity search indexes from full directories',
);

const competitionRoute = worker.slice(
  worker.indexOf("if (url.pathname === '/api/competitions'"),
  worker.indexOf("if (url.pathname === '/api/events'"),
);
assert.match(competitionRoute, /getCompetitionIndex\(env\)/, 'worker competition route should use the lightweight competition index');
assert.doesNotMatch(competitionRoute, /getMergedData\(env\)|loadBundledData\(env\)/, 'worker competition route must not load full detail chunks');

assert.match(server, /async function getCompetitionIndexPayload\(\)/, 'local server must expose a dedicated competition index payload');
assert.match(server, /compactCompetitionIndex\(payload\.competitions\)/, 'local competition index should be compacted for initial load');
assert.doesNotMatch(
  server.slice(server.indexOf('async function getCompetitionIndexPayload()'), server.indexOf('async function getEventIndexPayload()')),
  /athletes|clubs/,
  'local competition index payload must not include entity directories',
);
assert.match(worker, /competitions:\s*compactCompetitionIndex\(competitions\)/, 'worker competition index should be compacted for initial load');

console.log('initial load performance contract is covered');
