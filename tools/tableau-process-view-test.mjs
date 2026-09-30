import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { getEventDetailByCode } from '../server.mjs';
import { buildEventDetail } from '../cloudflare/edge-data.mjs';
import { compactEventDetail, hydrateEventDetail } from '../cloudflare/event-detail-hydration.mjs';

const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');

assert.match(js, /function matchWinnerName\(match\)/, 'tableau view must resolve promoted athlete names');
assert.match(js, /function sortedTableauMatches\(matches\)/, 'tableau matches must have stable display order');
assert.match(js, /function tableauPhaseStats\(matches\)/, 'tableau view must expose phase summary stats');
assert.match(js, /function tableauWinnerRows\(matches, limit = 4\)/, 'tableau tab must summarize visible winners for mobile reading');
assert.match(js, /class="tableau-phase-summary"/, 'tableau tab must render a phase summary');
assert.match(js, /class="tableau-winner-strip"/, 'tableau tab must render a compact winner summary before match cards');
assert.match(js, /class="bracket-board tableau-board"/, 'tableau tab must use the process board layout');
assert.match(js, /class="tableau-score-pill"/, 'tableau match cards must show a compact score pill');
assert.match(js, /class="tableau-advance-row"/, 'tableau match cards must show promoted athlete');

assert.match(css, /\.tableau-phase-summary/, 'tableau phase summary styles must exist');
assert.match(css, /\.tableau-winner-strip/, 'tableau winner summary styles must exist');
assert.match(css, /\.tableau-match-body\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\) auto/, 'tableau cards must fit mobile width');
assert.match(css, /\.tableau-match::after\s*\{[\s\S]*display:\s*none/, 'tableau cards must not add overflow connector lines');
assert.match(css, /\.tableau-player-stack \.bracket-row\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/, 'tableau athlete rows must not require horizontal scrolling');

const report = JSON.parse(await readFile(new URL('../data/analysis/score-RZSS2034101MFIU8-analysis.json', import.meta.url), 'utf8'));
const local = await getEventDetailByCode('RZSS2034101MFIU8');
const edge = buildEventDetail(report, 'score-RZSS2034101MFIU8-analysis.json');
assert.deepEqual(hydrateEventDetail(JSON.parse(JSON.stringify(compactEventDetail(local)))), local, 'JSON transport must restore every bye and score without loss');
const mixed = { eliminationPhaseGroups: [{ phase: '32表', matches: [{ phase: { order: 1 }, isBye: false, points: 0 }, { phase: { order: 2 }, isBye: true, points: null }] }], latestMatches: [] };
assert.deepEqual(hydrateEventDetail(JSON.parse(JSON.stringify(compactEventDetail(mixed)))), mixed, 'distinct phases, zero and null must survive compaction');
assert.throws(() => hydrateEventDetail({ eliminationPhaseGroups: [{ _matchFields: ['isBye'], _matchRows: [[]] }] }), /Invalid compact tableau/);
for (const event of [local, edge, hydrateEventDetail(compactEventDetail(local))]) {
  const phase = event.eliminationPhaseGroups.find(group => group.phase === '32表');
  assert.equal(phase.matches.length, 16, 'all 32-table bracket slots must be preserved');
  assert.equal(phase.matches.filter(match => match.isBye).length, 14);
  assert.equal(phase.matches.filter(match => !match.isBye).length, 2);
  assert.equal(event.latestMatches.filter(match => match.isBye).length, 0, 'byes must not become played matches');
}
const ctx = vm.createContext({});
vm.runInContext(js.slice(js.indexOf('function matchWinnerName('), js.indexOf('function renderMatches(')), ctx);
const phase = local.eliminationPhaseGroups.find(group => group.phase === '32表');
const stats = ctx.tableauPhaseStats(phase.matches);
assert.equal(stats.contested, 2);
assert.equal(stats.played, 2);
assert.equal(stats.bye, 14);
assert.equal(ctx.tableauWinnerRows(phase.matches).length, 2, 'winner summary must prioritize actual bouts');
assert.match(js, /人轮空晋级/);
ctx.matchList = { innerHTML: '', querySelectorAll: () => [] };
ctx.escapeHtml = value => String(value);
ctx.focusClassForAthlete = () => '';
vm.runInContext(js.slice(js.indexOf('function phaseSeed('), js.indexOf('function fallbackPhaseGroups(')), ctx);
ctx.renderMatches(local, 0);
assert.equal((ctx.matchList.innerHTML.match(/class="bracket-match tableau-match/g) || []).length, 16);
assert.match(ctx.matchList.innerHTML, /2 场实际对阵 · 2 场已完成 · 14 人轮空晋级/);
assert.equal((ctx.matchList.innerHTML.match(/<span>轮空晋级<\/span>/g) || []).length, 14);
console.log('tableau process view: full bracket, actual bouts, byes and hydration passed');
