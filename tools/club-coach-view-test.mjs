import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');

assert.match(js, /function clubPeerRows\(club, projectRows\)/, 'club coach view must compute same-project peers');
assert.match(js, /function buildClubBusinessCards\(club, projectRows, athletes, peerRows\)/, 'club coach view must build business-facing cards');
assert.match(js, /function buildCoachActionPlan\(\{ club, projectRows, athletes, athleteBuckets, peerRows, rosterRows \}\)/, 'club coach view must turn data into coach actions');
assert.match(js, /function renderCoachActionPlan\(cards\)/, 'club coach view must render a weekly action plan');
assert.match(js, /<h2>本周行动<\/h2>/, 'club detail must expose a coach action section');
assert.match(js, /训练安排/, 'coach action plan must include training actions');
assert.match(js, /家长沟通/, 'coach action plan must include parent retention actions');
assert.match(js, /赛前准备/, 'coach action plan must include prematch actions');
assert.match(js, /招生素材/, 'coach action plan must include recruiting actions');
assert.match(js, /<h2>招生名片<\/h2>/, 'club detail must expose a recruiting card section');
assert.match(js, /<h2>同项目对标<\/h2>/, 'club detail must expose peer benchmarking');
assert.match(js, /data-club-id/, 'peer club cards must navigate to club profiles');
assert.match(js, /openClub\(button\.dataset\.clubId\)/, 'peer cards must open the selected club profile');

assert.match(css, /\.business-card-grid/, 'recruiting cards must have mobile layout styles');
assert.match(css, /\.business-card:first-child/, 'primary recruiting card must be visually emphasized');
assert.match(css, /\.coach-action-grid/, 'coach action plan must have a mobile grid layout');
assert.match(css, /\.coach-action-card:first-child/, 'primary coach action must be visually emphasized');
assert.match(css, /\.peer-card/, 'peer comparison cards must have a distinct style hook');

console.log('club coach business view is covered');
