import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const worker = await readFile(new URL('../cloudflare/worker.mjs', import.meta.url), 'utf8');
const server = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');

assert.match(js, /const result = await fetchJson\('\/api\/competitions'\)/, 'initial load must fetch only the competition index');
assert.match(js, /const COMPETITION_LIST_PAGE_SIZE = 30;/, 'competition list must define a bounded render page size');
assert.match(js, /state\.filteredCompetitions\.slice\(0, state\.visibleCompetitionLimit\)/, 'competition list must render only the visible page instead of every row');
assert.match(js, /data-load-more-competitions/, 'competition list must expose an explicit load-more control');
assert.match(js, /state\.visibleCompetitionLimit \+= COMPETITION_LIST_PAGE_SIZE/, 'load-more control must extend the visible competition page');
assert.match(js, /competitionSearchCache: new Map\(\)/, 'competition search haystacks must be cached for growing datasets');
assert.match(js, /function cachedCompetitionSearchHaystack\(competition\)/, 'competition search must use a cached haystack helper');
assert.match(js, /const haystack = cachedCompetitionSearchHaystack\(competition\)/, 'filtering must reuse cached competition search text');
assert.match(js, /state\.competitionSearchCache\.clear\(\)/, 'competition search cache must reset when fresh data loads');
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
assert.match(js, /function entityCoverageCounts\(\)/, 'initial home render should use aggregate entity counts instead of full entity hydration');
assert.match(js, /positiveMax\([\s\S]*state\.dataCoverage\?\.athletes[\s\S]*state\.athleteSearchIndex\.length[\s\S]*Object\.keys\(state\.athletesById \|\| \{\}\)\.length/, 'initial aggregate counts should fall forward when coverage fields are zero or stale');

const competitionRoute = worker.slice(
  worker.indexOf("if (url.pathname === '/api/competitions'"),
  worker.indexOf("if (url.pathname === '/api/events'"),
);
assert.match(competitionRoute, /getCompetitionIndex\(env\)/, 'worker competition route should use the lightweight competition index');
assert.doesNotMatch(competitionRoute, /getMergedData\(env\)|loadBundledData\(env\)/, 'worker competition route must not load full detail chunks');

assert.match(server, /async function getCompetitionIndexPayload\(\)/, 'local server must expose a dedicated competition index payload');
assert.match(server, /athletes:\s*athletes\.length,[\s\S]{0,80}clubs:\s*clubs\.length,/, 'local competition index coverage should include aggregate entity counts');
assert.match(server, /compactCompetitionIndex\(payload\.competitions\)/, 'local competition index should be compacted for initial load');
assert.doesNotMatch(
  server.slice(server.indexOf('async function getCompetitionIndexPayload()'), server.indexOf('async function getEventIndexPayload()')),
  /athletes|clubs/,
  'local competition index payload must not include entity directories',
);
assert.match(worker, /competitions:\s*compactCompetitionIndex\(competitions\)/, 'worker competition index should be compacted for initial load');
assert.match(worker, /async function dataCoverageWithEntityCounts\(env, index\)/, 'worker competition index should repair missing aggregate entity counts without full detail hydration');
assert.match(worker, /const dataCoverage = await dataCoverageWithEntityCounts\(env, index\);[\s\S]{0,220}dataCoverage,/, 'worker competition route should return repaired aggregate entity counts');
assert.match(worker, /athletes:\s*Math\.max\(Number\(coverage\.athletes\) \|\| 0, indexes\.athletes\.length\)/, 'worker aggregate count repair should fall back to the lightweight athlete search index');
assert.match(worker, /clubs:\s*Math\.max\(Number\(coverage\.clubs\) \|\| 0, indexes\.clubs\.length\)/, 'worker aggregate count repair should fall back to the lightweight club search index');
assert.match(
  await readFile(new URL('./build-cloudflare-data.mjs', import.meta.url), 'utf8'),
  /payload\.publicEvents\.dataCoverage = \{[\s\S]*athletes:\s*athletes\.length,[\s\S]*clubs:\s*clubs\.length,/,
  'Cloudflare static data index should expose aggregate athlete and club counts',
);
assert.match(
  await readFile(new URL('./competition-index.mjs', import.meta.url), 'utf8'),
  /itemSummaries[\s\S]*itemFilters[\s\S]*metricTotals[\s\S]*projectScope/,
  'competition index should expose summaries, filter labels, metric totals and project scope instead of full items',
);

console.log('initial load performance contract is covered');
