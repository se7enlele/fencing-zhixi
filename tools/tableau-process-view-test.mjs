import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');

assert.match(js, /function matchWinnerName\(match\)/, 'tableau view must resolve promoted athlete names');
assert.match(js, /function sortedTableauMatches\(matches\)/, 'tableau matches must have stable display order');
assert.match(js, /function tableauPhaseStats\(matches\)/, 'tableau view must expose phase summary stats');
assert.match(js, /class="tableau-phase-summary"/, 'tableau tab must render a phase summary');
assert.match(js, /class="bracket-board tableau-board"/, 'tableau tab must use the process board layout');
assert.match(js, /class="tableau-score-pill"/, 'tableau match cards must show a compact score pill');
assert.match(js, /class="tableau-advance-row"/, 'tableau match cards must show promoted athlete');

assert.match(css, /\.tableau-phase-summary/, 'tableau phase summary styles must exist');
assert.match(css, /\.tableau-match-body\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\) auto/, 'tableau cards must fit mobile width');
assert.match(css, /\.tableau-match::after\s*\{[\s\S]*display:\s*none/, 'tableau cards must not add overflow connector lines');
assert.match(css, /\.tableau-player-stack \.bracket-row\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/, 'tableau athlete rows must not require horizontal scrolling');

console.log('tableau process view is covered');
