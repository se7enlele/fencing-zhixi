import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');

assert.match(js, /function clubPeerRows\(club, projectRows\)/, 'club coach view must compute same-project peers');
assert.match(js, /function buildClubBusinessCards\(club, projectRows, athletes, peerRows\)/, 'club coach view must build business-facing cards');
assert.match(js, /function buildClubShareText\(club, projectRows, athletes\)/, 'club coach view must build shareable recruiting copy');
assert.match(js, /function buildClubCommunicationScripts\(club, projectRows, athletes\)/, 'club coach view must translate data into parent-facing communication scripts');
assert.match(js, /function renderClubCommunicationScripts\(club, projectRows, athletes\)/, 'club coach view must render parent-facing communication scripts');
assert.match(js, /function renderClubShareCard\(club, projectRows, athletes\)/, 'club coach view must render a shareable recruiting card');
assert.match(js, /function copyTextToClipboard\(text\)/, 'club share card must support copy action');
assert.match(js, /function buildCoachActionPlan\(\{ club, projectRows, athletes, athleteBuckets, peerRows, rosterRows \}\)/, 'club coach view must turn data into coach actions');
assert.match(js, /function renderCoachActionPlan\(cards\)/, 'club coach view must render a weekly action plan');
assert.match(js, /<h2>本周行动<\/h2>/, 'club detail must expose a coach action section');
assert.match(js, /训练安排/, 'coach action plan must include training actions');
assert.match(js, /家长沟通/, 'coach action plan must include parent retention actions');
assert.match(js, /赛前准备/, 'coach action plan must include prematch actions');
assert.match(js, /招生素材/, 'coach action plan must include recruiting actions');
assert.match(js, /<h2>招生名片<\/h2>/, 'club detail must expose a recruiting card section');
assert.match(js, /<h2>对外沟通话术<\/h2>/, 'club detail must expose parent-facing talking points');
assert.match(js, /对外沟通重点/, 'club share copy must include parent-facing talking points');
assert.match(js, /成绩背书/, 'club communication scripts must include proof points');
assert.match(js, /成长案例/, 'club communication scripts must include athlete growth cases');
assert.match(js, /<h2>同项目对标<\/h2>/, 'club detail must expose peer benchmarking');
assert.match(js, /data-club-id/, 'peer club cards must navigate to club profiles');
assert.match(js, /data-share-club/, 'club recruiting card must expose a share action');
assert.match(js, /openClub\(button\.dataset\.clubId\)/, 'peer cards must open the selected club profile');

assert.match(css, /\.business-card-grid/, 'recruiting cards must have mobile layout styles');
assert.match(css, /\.business-card:first-child/, 'primary recruiting card must be visually emphasized');
assert.match(css, /\.club-share-card/, 'shareable recruiting card must have a distinct mobile card layout');
assert.match(css, /\.club-share-kpis/, 'shareable recruiting card must expose compact proof points');
assert.match(css, /\.club-share-action/, 'shareable recruiting card must style its copy action');
assert.match(css, /\.coach-action-grid/, 'coach action plan must have a mobile grid layout');
assert.match(css, /\.coach-action-card:first-child/, 'primary coach action must be visually emphasized');
assert.match(css, /\.club-script-list/, 'parent-facing communication scripts must have mobile layout styles');
assert.match(css, /\.club-script-card/, 'parent-facing communication script cards must be styled');
assert.match(css, /\.peer-card/, 'peer comparison cards must have a distinct style hook');

console.log('club coach business view is covered');
