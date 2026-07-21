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
assert.match(js, /CLUB_FOLLOW_KEY = 'fencingai\.followedClubs\.v1'/, 'club follows must have a dedicated persisted key');
assert.match(js, /function followedClubCards\(\)/, 'club follows must resolve against current club data');
assert.match(js, /function upsertFollowedClub\(club\)/, 'club detail must support following a club');
assert.match(js, /id="followClubBtn"/, 'club detail hero must expose a compact follow tag');

assert.match(js, /function buildCoachActionPlan\(\{ club, projectRows, athletes, athleteBuckets, peerRows, rosterRows \}\)/, 'club coach view must turn data into coach actions');
assert.match(js, /function renderCoachActionPlan\(cards\)/, 'club coach view must render a weekly action plan');
assert.match(js, /function coachAthleteTrainingFocus\(athlete\)/, 'club coach view must derive athlete-level training followups');
assert.match(js, /function coachAthleteFollowupRows\(athletes\)/, 'club coach view must prioritize athletes for followup');
assert.match(js, /function renderCoachAthleteFollowups\(athletes\)/, 'club coach view must render athlete-level followup cards');
assert.match(js, /renderCoachAthleteFollowups\(athletes\)/, 'club detail must put athlete followups inside the existing-student section');
assert.match(js, /buildParentGrowthModel\(athlete\)/, 'coach athlete followups must reuse the same growth model as parent reporting');
assert.match(js, /data-athlete-id="\$\{escapeHtml\(row\.athlete\.id \|\| ''\)\}"/, 'athlete followup cards must open athlete profiles');

assert.match(js, /function renderPreMatchIntelligence\(club, projectRows, athletes, providedRosterRows = null\)/, 'club coach view must render prematch intelligence');
assert.match(js, /function coachAthleteOpponentRows\(\{ rosterRows, athletes, opponentPool, projectRows \}\)/, 'club coach view must pair athletes with likely strong opponents');
assert.match(js, /clubEvents\.querySelectorAll\('\[data-ai-query\]'\)/, 'club detail must bind AI comparison actions');
assert.match(js, /submitAiQuery\(button\.dataset\.aiQuery\)/, 'club AI action chips must open the AI workspace');

assert.match(js, /data-club-id/, 'peer club cards must navigate to club profiles');
assert.match(js, /data-share-club/, 'club recruiting card must expose a share action');
assert.match(js, /openClub\(button\.dataset\.clubId\)/, 'peer cards must open the selected club profile');
assert.match(js, /openAthlete\(button\.dataset\.athleteId\)/, 'coach athlete cards must open athlete profiles');

assert.match(css, /\.business-card-grid/, 'recruiting cards must have mobile layout styles');
assert.match(css, /\.business-card:first-child/, 'primary recruiting card must be visually emphasized');
assert.match(css, /\.club-share-card/, 'shareable recruiting card must have a distinct mobile card layout');
assert.match(css, /\.club-share-kpis/, 'shareable recruiting card must expose compact proof points');
assert.match(css, /\.club-share-action/, 'shareable recruiting card must style its copy action');
assert.match(css, /\.coach-action-grid/, 'coach action plan must have a mobile grid layout');
assert.match(css, /\.coach-action-card:first-child/, 'primary coach action must be visually emphasized');
assert.match(css, /\.coach-followup-list/, 'athlete followup list must have mobile layout styles');
assert.match(css, /\.coach-followup-card/, 'athlete followup cards must be styled');
assert.match(css, /\.coach-followup-tags/, 'athlete followup cards must expose compact evidence tags');
assert.match(css, /\.club-script-list/, 'parent-facing communication scripts must have mobile layout styles');
assert.match(css, /\.club-script-card/, 'parent-facing communication script cards must be styled');
assert.match(css, /\.peer-card/, 'peer comparison cards must have a distinct style hook');

console.log('club coach business view is covered');
