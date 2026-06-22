import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');
const html = await readFile(new URL('../web/viewer.html', import.meta.url), 'utf8');

assert.match(html, /id="view-prematch-report"/, 'prematch report must have a real standalone view');
assert.match(html, /id="prematchReportHero"/, 'prematch report view must expose a hero');
assert.match(html, /id="prematchReportBody"/, 'prematch report view must expose report body');

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
assert.match(js, /function opponentStrengthLabel\(opponents\)/, 'prematch intelligence must classify opponent strength');
assert.match(js, /function coachOpponentMatchReason\(candidate, opponents\)/, 'prematch intelligence must explain why an opponent is matched');
assert.match(js, /function coachOpponentTrainingFocus\(candidate, opponents\)/, 'prematch intelligence must translate opponent matches into training focus');
assert.match(js, /class="opponent-project-list"/, 'prematch intelligence must render project-level opponent summaries');
assert.match(js, /可关注强手/, 'prematch opponent summary must be coach-facing and action-oriented');
assert.match(css, /\.opponent-project-list/, 'project-level opponent summary layout must exist');
assert.match(css, /\.opponent-project-card/, 'project-level opponent summary cards must be styled');

assert.match(js, /function athleteProjectLabelsForPrematch\(athlete\)/, 'prematch intelligence must derive project labels for club athletes');
assert.match(js, /function coachAthleteOpponentRows\(\{ rosterRows, athletes, opponentPool, projectRows \}\)/, 'prematch intelligence must pair club athletes with likely strong opponents');
assert.match(js, /class="athlete-opponent-plan-list"/, 'prematch intelligence must render athlete-level opponent plans');
assert.match(js, /class="opponent-match-meta"/, 'prematch opponent plans must show match rationale');
assert.match(js, /row\.trainingFocus/, 'prematch opponent plans must show a training focus');
assert.match(js, /学员对手预案/, 'prematch intelligence must expose athlete-opponent preparation as a coach-facing section');
assert.match(css, /\.athlete-opponent-plan-list/, 'athlete-opponent preparation layout must exist');
assert.match(css, /\.opponent-match-meta/, 'opponent match rationale styles must exist');

assert.match(js, /function submitAiQuery\(query\)/, 'prematch opponent plans must be able to submit an AI query');
assert.match(js, /data-ai-query/, 'athlete-opponent plans must carry a runnable comparison query');
assert.match(js, /clubEvents\.querySelectorAll\('\[data-ai-query\]'\)/, 'club detail must bind athlete-opponent AI query actions');
assert.match(js, /submitAiQuery\(button\.dataset\.aiQuery\)/, 'club detail AI query actions must open the AI workspace');
assert.match(css, /\.ai-plan-action/, 'athlete-opponent AI action chip must be styled');

assert.match(js, /function prematchReportCompetitions\(\)/, 'prematch report must choose actionable upcoming competitions');
assert.match(js, /function prematchReportFocusRows\(competitions\)/, 'prematch report must match focused athletes to competitions');
assert.match(js, /function prematchReportOpponentRows\(projectLabels\)/, 'prematch report must include strong-opponent signals');
assert.match(js, /function renderPrematchReport\(kind = 'prematch-pack'\)/, 'prematch report must render a real report view');
assert.match(js, /function openPrematchReport\(kind = 'prematch-pack'\)/, 'prematch report must be navigable');
assert.match(js, /data-prematch-template/, 'AI product template actions must open the prematch report');
assert.match(js, /openPrematchReport\(button\.dataset\.prematchTemplate/, 'prematch template action must bind to report navigation');
assert.match(js, /prematchReportBody\.querySelectorAll\('\[data-sport-code\]'\)/, 'prematch report competitions must be clickable');
assert.match(js, /prematchReportBody\.querySelectorAll\('\[data-athlete-id\]'\)/, 'prematch report athletes must be clickable');
assert.match(js, /执行清单/, 'prematch report must include an action checklist');
assert.match(css, /\.prematch-report-shell/, 'prematch report shell styles must exist');
assert.match(css, /\.prematch-report-metrics/, 'prematch report metrics must be styled');
assert.match(css, /\.prematch-report-list/, 'prematch report lists must be styled');
assert.match(css, /\.prematch-checklist/, 'prematch report checklist must be styled');

console.log('prematch intelligence view is covered');
