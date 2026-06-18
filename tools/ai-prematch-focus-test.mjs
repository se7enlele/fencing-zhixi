import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');

assert.match(js, /function aiFocusedAthletes\(\)/, 'AI prematch answers must know selected and followed athletes');
assert.match(js, /function aiAthleteProjectLabels\(athlete\)/, 'AI prematch answers must derive project labels from focused athlete history');
assert.match(js, /function competitionMatchesProjectLabel\(competition, label\)/, 'AI prematch answers must match focused athlete projects to competitions');
assert.match(js, /function aiPreMatchFocusRows\(competitions\)/, 'AI prematch answers must build focused-athlete rows');
assert.match(js, /const focusRows = aiPreMatchFocusRows\(rows\)/, 'prematch report must compute focused-athlete rows from matched competitions');
assert.match(js, /\['关注选手', focusRows\.length \? `\$\{focusRows\.length\} 人` : '-'\]/, 'prematch report must expose focused-athlete count');
assert.match(js, /title: '关注选手',\s*rows: focusRows/, 'prematch report must include a focused-athlete section');

assert.match(js, /followCompetitionCode: rows\[0\]\.sportCode/, 'prematch report must expose a follow action for the nearest matched competition');
assert.match(js, /data-follow-competition-code/, 'AI answer buttons must render follow-competition actions');
assert.match(js, /querySelectorAll\('\[data-follow-competition-code\]'\)/, 'AI answer bindings must handle follow-competition actions');
assert.match(js, /upsertFollowedCompetition\(competition\)/, 'follow-competition actions must persist the selected competition');
assert.match(js, /navigateMain\('follow'\)/, 'follow-competition actions must take users to the follow/reminder page');

console.log('AI prematch focused-athlete answers are covered');
