import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import vm from 'node:vm';
import { competitionCoverageLevel, normalizeCompetitionState } from './competition-index.mjs';
import { isTeamEvent } from './entity-kind.mjs';
import { buildAthleteDirectory } from '../server.mjs';
import { buildAthleteDirectoryFromEvents } from '../cloudflare/edge-data.mjs';
import { buildScheduledSyncStatus, runScheduledTasks } from './scheduled-sync.mjs';
import { summarizeImportLog, fetchTextWithNode, postJsonTextWithNode, useProxyTransport, isUnpublishedScore, fetchScorePayload } from './sync-platform-data.mjs';
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const viewer = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
function extract(name) {
  const value = viewer.match(new RegExp(`function ${name}\\([^\\n]*\\) \\{[\\s\\S]*?\\n\\}`))?.[0];
  assert.ok(value, name);
  return value;
}
const ui = vm.createContext({ state: { userRole: 'parent' }, Date });
vm.runInContext(['competitionCoverageLevel', 'summarizeDataCoverage', 'roleAiPromptPresets', 'isActionablePrematchCompetition', 'isPrematchCompetition', 'prematchReportCompetitions', 'isPrematchStatusValue', 'isLiveCompetitionStatus'].map(extract).join('\n'), ui);
const layers = [
  [{ isPreEvent: true, items: [] }, 'directory'],
  [{ isPreEvent: true, itemCount: 0, coverageLevel: 'project' }, 'directory'],
  [{ isPreEvent: true, items: [{ isPreEvent: true, competitionNo: 1000 }] }, 'project'],
  [{ items: [{ isPreEvent: true, participants: [{ name: 'A' }], registrationCount: 1 }] }, 'roster'],
  [{ isPreEvent: true, items: [{ isPreEvent: false, competitionNo: 8 }] }, 'score'],
];
for (const [row, expected] of layers) {
  assert.equal(competitionCoverageLevel(row), expected);
  assert.equal(ui.competitionCoverageLevel(row), expected);
}
assert.equal(ui.summarizeDataCoverage(layers.map(([row]) => row)).score, 1);
const old = { status: 'registration', dateLabel: '2026.09.22 / 2026.09.23', isPreEvent: true, items: [] };
assert.equal(normalizeCompetitionState(old, Date.parse('2026-09-23T15:59:59Z')).status, 'registration');
const expired = normalizeCompetitionState(old, Date.parse('2026-09-23T16:00:00Z'));
assert.equal(expired.status, 'needs-verification');
assert.equal(expired.sourceStatus, 'registration');
assert.equal(ui.isActionablePrematchCompetition(expired), false);
assert.equal(ui.isPrematchCompetition(expired), false);
ui.state.competitions = [expired, { ...expired, status: 'completed' }];
assert.equal(ui.prematchReportCompetitions().length, 0, 'automatic recommendations must exclude historical pre-event records');
vm.runInContext(['parseDateCandidates', 'competitionDateValue'].map(extract).join('\n'), ui);
const multiDay = { dateLabel: '2026.09.25 / 2026.09.27', sportName: '2026年测试比赛' };
assert.equal(new Date(ui.competitionDateValue(multiDay, 'start')).getDate(), 25);
assert.equal(new Date(ui.competitionDateValue(multiDay)).getDate(), 27);
assert.equal(normalizeCompetitionState({ ...old, dateLabel: '日期待确认' }).status, 'registration');
assert.equal(normalizeCompetitionState({ ...old, status: 'completed' }).status, 'completed');
assert.equal(normalizeCompetitionState({ ...expired, dateLabel: '2026.12.01' }, Date.parse('2026-09-23')).status, 'registration');
const presets = ui.roleAiPromptPresets(null, null).join(' ');
assert.doesNotMatch(presets, /蔡廷彧|马潇|陶嘉月|天津|山东小众/);
assert.match(ui.roleAiPromptPresets({ name: '测试孩子' }, null).join(' '), /测试孩子/);

const individual = { eventCode: 'XMFIU10', eventName: 'U10男子花剑个人', athleteProfiles: [{ id: 'person-1', name: '选手', medal: '金', finalRank: 1 }] };
const team = { ...individual, eventCode: 'XMFTU10', eventName: 'U10男子花剑团体', athleteProfiles: [{ id: 'UNITE1', name: '联合团体1队', medal: '金', finalRank: 1 }] };
assert.equal(isTeamEvent(team), true);
assert.equal(isTeamEvent(individual), false);
const edgePeople = buildAthleteDirectoryFromEvents({ individual, team });
assert.equal(edgePeople.length, 1);
assert.equal(edgePeople[0].medals, 1, 'one medal must not be counted twice');
const reports = await Promise.all(['MFIU10', 'MFTU10'].map(async (suffix) => {
  const fileName = `score-RZSS2034020${suffix}-analysis.json`;
  return { fileName, report: JSON.parse(await readFile(new URL(`../data/analysis/${fileName}`, import.meta.url), 'utf8')) };
}));
const people = buildAthleteDirectory(reports);
assert.ok(people.length > 0);
assert.ok(people.every((person) => person.events.every((event) => !isTeamEvent(event))));
assert.equal(buildAthleteDirectory([reports[1]]).length, 0, 'team event cannot create personal profiles');

assert.equal(summarizeImportLog({ scores: { imported: 1, failed: [{}] } }).failedCount, 1);
assert.equal(isUnpublishedScore(new Error('HTTP 404 Not Found'), { code: 0, data: [] }), true);
assert.equal(isUnpublishedScore(new Error('timeout'), { code: 0, data: [] }), false);
assert.equal(isUnpublishedScore(new Error('HTTP 404 Not Found'), { code: 1, data: [] }), false);
assert.equal(summarizeImportLog({ scores: { unavailable: [{}] } }).unavailableCount, 1);
assert.equal(buildScheduledSyncStatus({ eventListRefresh: { ok: false } }).ok, false);
assert.equal(buildScheduledSyncStatus({ results: [{ ok: false }] }).ok, false);
assert.equal(buildScheduledSyncStatus({ running: true }).ok, false);
const taskResults = await runScheduledTasks([{ scriptArgs: ['-e', 'setInterval(()=>{}, 1000)'] }], { taskTimeoutSec: 1 });
assert.equal(taskResults[0].ok, false, 'hung child must fail within the task budget');

const origin = createServer((request, response) => {
  if (request.url === '/fencingapi/matchresult/classmentrank/EMPTYTEAM') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ code: 0, data: [] }));
    return;
  }
  if (request.url === '/stall') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.flushHeaders();
    return;
  }
  response.writeHead(503);
  response.end('unavailable');
});
await new Promise((resolve) => origin.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${origin.address().port}`;
try {
  const emptyTeam = await fetchScorePayload({ eventCode: 'EMPTYTEAM', itemTypeCode: 'T' }, {}, `${base}/unavailable-resource`, { proxyBase: base, timeoutSec: 1, progress: false });
  assert.equal(emptyTeam.unavailable, true, 'an explicitly empty team ranking must not trigger a missing score-resource request');
  await assert.rejects(fetchTextWithNode(`${base}/stall`, 1), /abort/i, 'body reads must share the fetch timeout');
  await assert.rejects(postJsonTextWithNode(`${base}/stall`, {}, 1), /abort/i, 'roster body reads must share the request timeout');
  assert.equal(useProxyTransport(base), false, 'local requests must not go through an external proxy');
  const fixtureDir = path.resolve('analysis-output', `data-trust-fixture-${process.pid}`);
  await mkdir(fixtureDir, { recursive: true });
  const input = path.resolve('data/analysis/frontsporteventlist-analysis.json');
  const before = await readFile(input, 'utf8');
  const run = promisify(execFile);
  await assert.rejects(run(process.execPath, ['tools/scheduled-sync.mjs', '--input', input, '--output-dir', fixtureDir, '--report-dir', fixtureDir, '--event-list-url', `${base}/unavailable`, '--timeout-sec', '1'], { timeout: 15000 }), (error) => error.code === 1);
  const status = JSON.parse(await readFile(path.join(fixtureDir, 'scheduled-sync-status.json'), 'utf8'));
  assert.equal(status.ok, false);
  assert.equal(status.eventListRefresh.ok, false);
  assert.equal(await readFile(input, 'utf8'), before, 'failed refresh must preserve the source catalogue');
  const sportId = JSON.parse(before).normalizedEvents[0].sportId;
  await assert.rejects(run(process.execPath, ['tools/sync-platform-data.mjs', '--input', input, '--output-dir', fixtureDir, '--sport-id', String(sportId), '--proxy-base', base, '--no-score', '--delay-ms', '0'], { timeout: 15000 }), (error) => {
    const report = JSON.parse(error.stdout);
    return error.code === 1 && report.ok === false && report.summary.failedCount > 0;
  });
  await writeFile(path.join(fixtureDir, `projectlist-${sportId}-analysis.json`), JSON.stringify({ normalizedItems: [{ sourceEventCode: 'TESTMFIU6', sourceSportCode: 'TEST', itemTypeCode: 'I' }] }));
  await writeFile(path.join(fixtureDir, 'registration-roster-TEST-TESTMFIU6-1.json'), JSON.stringify({ ok: true, source: { importedAt: new Date().toISOString() }, page: { total: 0 }, summary: { recordCount: 0 } }));
  const resumed = await run(process.execPath, ['tools/sync-platform-data.mjs', '--input', input, '--output-dir', fixtureDir, '--sport-id', String(sportId), '--roster-base', base, '--no-projectlist', '--no-score', '--roster', '--force-roster', '--roster-max-age-minutes', '60'], { timeout: 15000 });
  assert.equal(JSON.parse(resumed.stdout).summary.skippedCount, 1, 'a fresh verified empty roster must be reusable during an upstream outage');
} finally {
  origin.closeAllConnections();
  await new Promise((resolve) => origin.close(resolve));
}
console.log('data trust: coverage, date boundaries, team isolation, personalized presets, sync failure and timeout regressions passed');
