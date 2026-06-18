import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');

assert.match(js, /function rosterAthleteLabel\(row\)/, 'prematch intelligence must normalize roster athlete names');
assert.match(js, /function rosterItemSummary\(rosterRows\)/, 'prematch intelligence must summarize roster by project');
assert.match(js, /function rosterPreparationRows\(rosterRows, knownAthletes = \[\]\)/, 'prematch intelligence must connect roster entries to athlete history');
assert.match(js, /function preMatchActionCards\(rosterRows, opponentPool, relevantCompetitions\)/, 'prematch intelligence must expose action cards');
assert.match(js, /class="prematch-action-grid"/, 'prematch intelligence must render action cards');
assert.match(js, /class="prematch-roster-summary"/, 'prematch intelligence must render roster project summary');
assert.match(js, /class="prematch-roster-focus"/, 'prematch intelligence must render roster-level preparation cues');
assert.match(js, /备赛名单画像/, 'prematch intelligence must label roster preparation clearly');
assert.match(js, /重点关注前八机会/, 'prematch intelligence must classify strong roster athletes for coaches');
assert.match(js, /已识别到 \$\{rosterRows\.length\} 条本馆报名记录/, 'prematch copy must be coach-facing and data-backed');

assert.match(css, /\.prematch-action-grid/, 'prematch action card layout must exist');
assert.match(css, /\.prematch-action-card/, 'prematch action card styles must exist');
assert.match(css, /\.prematch-roster-summary/, 'prematch roster summary styles must exist');
assert.match(css, /\.prematch-roster-focus/, 'prematch roster focus styles must exist');

assert.match(js, /function athleteMatchesProjectLabel\(athlete, label\)/, 'prematch intelligence must match external opponents to club projects');
assert.match(js, /function coachOpponentProjectRows\(opponentPool, projectRows\)/, 'prematch intelligence must summarize strong opponents by project');
assert.match(js, /class="opponent-project-list"/, 'prematch intelligence must render project-level opponent summaries');
assert.match(js, /可关注强手/, 'prematch opponent summary must be coach-facing and action-oriented');
assert.match(css, /\.opponent-project-list/, 'project-level opponent summary layout must exist');
assert.match(css, /\.opponent-project-card/, 'project-level opponent summary cards must be styled');

assert.match(js, /function athleteProjectLabelsForPrematch\(athlete\)/, 'prematch intelligence must derive project labels for club athletes');
assert.match(js, /function coachAthleteOpponentRows\(\{ rosterRows, athletes, opponentPool, projectRows \}\)/, 'prematch intelligence must pair club athletes with likely strong opponents');
assert.match(js, /class="athlete-opponent-plan-list"/, 'prematch intelligence must render athlete-level opponent plans');
assert.match(js, /学员对手预案/, 'prematch intelligence must expose athlete-opponent preparation as a coach-facing section');
assert.match(css, /\.athlete-opponent-plan-list/, 'athlete-opponent preparation layout must exist');

console.log('prematch intelligence view is covered');
