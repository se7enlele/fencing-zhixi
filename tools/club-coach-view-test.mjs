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
assert.match(js, /function buildCoachWorkspaceTasks\(\{ club, projectRows, athletes, athleteBuckets, rosterRows \}\)/, 'club detail must build the three coach workspace tasks');
assert.match(js, /function renderCoachWorkspaceTasks\(tasks\)/, 'club detail must render coach workspace tasks');
assert.match(js, /function buildCoachQuickActions\(\{ club, projectRows, athletes, athleteBuckets, rosterRows \}\)/, 'club detail must build compact weekly coach actions');
assert.match(js, /function renderCoachQuickActions\(actions\)/, 'club detail must render compact weekly coach actions');
assert.match(js, /<h2>教练工作台<\/h2>[\s\S]*先处理这三件事/, 'coach workspace must explain the first three coach jobs');
assert.match(js, /title: '学员分层'[\s\S]*title: '重点跟进'[\s\S]*title: '招生素材'/, 'coach workspace must focus on segmentation, followup and recruiting assets');
assert.match(js, /renderCoachWorkspaceTasks\(workspaceTasks\)/, 'club detail must show coach workspace before deeper report sections');
assert.match(js, /renderCoachQuickActions\(quickActions\)/, 'club detail must show weekly coach actions before the deeper action plan');
assert.match(js, /<h2>本周行动<\/h2>[\s\S]*直接处理/, 'weekly coach actions must be framed as direct user actions');
assert.match(js, /title: '重点学员'[\s\S]*title: '家长沟通'[\s\S]*title: '赛前准备'[\s\S]*title: '招生素材'/, 'weekly coach actions must map to student, parent, prematch and recruiting jobs');
assert.match(js, /data-coach-quick-action/, 'weekly coach actions must be trackable');
assert.match(js, /data-coach-task-action/, 'coach workspace actions must be trackable and clickable');
assert.match(js, /data-coach-segmentation-club-id/, 'coach workspace segmentation action must open the segmentation report');
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
assert.match(css, /\.coach-workspace-tasks/, 'coach workspace must have a distinct section style');
assert.match(css, /\.coach-workspace-task-grid/, 'coach workspace tasks must have mobile layout styles');
assert.match(css, /\.coach-workspace-task-card/, 'coach workspace task cards must be styled');
assert.match(css, /\.coach-workspace-task-actions/, 'coach workspace task actions must be compact on mobile');
assert.match(css, /\.coach-quick-actions/, 'weekly coach actions must have a distinct mobile section style');
assert.match(css, /\.coach-quick-action-grid/, 'weekly coach actions must use a compact mobile grid');
assert.match(css, /\.coach-quick-action small/, 'weekly coach actions must expose compact action labels');
assert.match(css, /\.coach-followup-list/, 'athlete followup list must have mobile layout styles');
assert.match(css, /\.coach-followup-card/, 'athlete followup cards must be styled');
assert.match(css, /\.coach-followup-tags/, 'athlete followup cards must expose compact evidence tags');
assert.match(css, /\.club-script-list/, 'parent-facing communication scripts must have mobile layout styles');
assert.match(css, /\.club-script-card/, 'parent-facing communication script cards must be styled');
assert.match(css, /\.peer-card/, 'peer comparison cards must have a distinct style hook');

console.log('club coach business view is covered');
