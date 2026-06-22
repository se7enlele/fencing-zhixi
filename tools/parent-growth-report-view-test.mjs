import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../web/viewer.html', import.meta.url), 'utf8');
const indexHtml = await readFile(new URL('../web/index.html', import.meta.url), 'utf8');
const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');

assert.equal(indexHtml, html, 'static index.html must stay in sync with viewer.html');
assert.match(html, /id="view-parent-growth-report"/, 'parent growth report must have a standalone view');
assert.match(html, /id="parentGrowthReportHero"/, 'parent growth report must expose a hero region');
assert.match(html, /id="parentGrowthReportBody"/, 'parent growth report must expose a report body');

assert.match(js, /parentGrowthReportHero = document\.querySelector\('#parentGrowthReportHero'\)/, 'parent growth report hero selector must be wired');
assert.match(js, /parentGrowthReportBody = document\.querySelector\('#parentGrowthReportBody'\)/, 'parent growth report body selector must be wired');
assert.match(js, /parentGrowthReport: document\.querySelector\('#view-parent-growth-report'\)/, 'parent growth report view must be registered');
assert.match(js, /function parentGrowthReportTimelineRows\(athlete\)/, 'parent growth report must build a compact timeline');
assert.match(js, /function parentGrowthReportEvidenceRows\(model\)/, 'parent growth report must expose traceable evidence rows');
assert.match(js, /function renderParentGrowthReport\(athleteId = ''\)/, 'parent growth report must render from a selected or explicit athlete');
assert.match(js, /function openParentGrowthReport\(athleteId = ''\)/, 'parent growth report must be navigable');
assert.match(js, /navigateTo\('parentGrowthReport'\)/, 'parent growth report must use normal navigation');

assert.match(js, /data-parent-growth-athlete-id/, 'parent growth report actions must carry an athlete id');
assert.match(js, /parentGrowthAthleteId: aiFocusedAthletes\(\)\[0\]\.id/, 'AI parent-growth template must open the real report');
assert.match(js, /openParentGrowthReport\(button\.dataset\.parentGrowthAthleteId\)/, 'AI parent-growth action must bind to report navigation');
assert.match(js, /parentDashboard\.querySelectorAll\('\[data-parent-growth-athlete-id\]'\)/, 'parent dashboard must bind growth report actions');
assert.match(js, /roleWorkspace\.querySelectorAll\('\[data-parent-growth-athlete-id\]'\)/, 'role workspace must bind growth report actions');

assert.match(js, /parent-growth-decision/, 'growth report must render a parent-facing decision block');
assert.match(js, /class="parent-growth-metrics"/, 'growth report must render key metrics');
assert.match(js, /class="parent-growth-focus-list"/, 'growth report must render next focus points');
assert.match(js, /class="parent-growth-timeline"/, 'growth report must render a participation timeline');
assert.match(js, /class="parent-growth-evidence"/, 'growth report must render traceable evidence');
assert.match(js, /data-event-code="\$\{escapeHtml\(row\.eventCode/, 'growth report evidence and timeline must link to event detail');
assert.match(js, /查看完整选手画像/, 'growth report must allow drilling into the full athlete profile');

assert.match(css, /\.parent-growth-report-shell/, 'parent growth report shell styles must exist');
assert.match(css, /\.parent-growth-report-card/, 'parent growth report card styles must exist');
assert.match(css, /\.parent-growth-decision/, 'parent growth decision styles must exist');
assert.match(css, /\.parent-growth-metrics/, 'parent growth metric styles must exist');
assert.match(css, /\.parent-growth-timeline/, 'parent growth timeline styles must exist');
assert.match(css, /\.parent-growth-evidence/, 'parent growth evidence styles must exist');

console.log('parent growth report view is covered');
