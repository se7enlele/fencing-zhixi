import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');

assert.match(js, /function rosterAthleteLabel\(row\)/, 'prematch intelligence must normalize roster athlete names');
assert.match(js, /function rosterItemSummary\(rosterRows\)/, 'prematch intelligence must summarize roster by project');
assert.match(js, /function preMatchActionCards\(rosterRows, opponentPool, relevantCompetitions\)/, 'prematch intelligence must expose action cards');
assert.match(js, /class="prematch-action-grid"/, 'prematch intelligence must render action cards');
assert.match(js, /class="prematch-roster-summary"/, 'prematch intelligence must render roster project summary');
assert.match(js, /已识别到 \$\{rosterRows\.length\} 条本馆报名记录/, 'prematch copy must be coach-facing and data-backed');

assert.match(css, /\.prematch-action-grid/, 'prematch action card layout must exist');
assert.match(css, /\.prematch-action-card/, 'prematch action card styles must exist');
assert.match(css, /\.prematch-roster-summary/, 'prematch roster summary styles must exist');

console.log('prematch intelligence view is covered');
