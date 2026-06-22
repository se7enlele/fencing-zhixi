import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../web/viewer.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');

assert.match(html, /id="followedEventFocus"/, 'event detail must expose followed athlete focus panel');
assert.match(html, /data-tab="pool">循环赛/, 'event detail must use competition-process pool tab');
assert.match(html, /data-tab="standing">小组排名/, 'event detail must expose pool standing tab');
assert.match(html, /data-tab="tableau">单败表/, 'event detail must expose bracket tab');
assert.match(html, /data-tab="participants">最终排名/, 'event detail must expose final ranking tab');

assert.match(js, /function trackedAthleteReferences\(\)/, 'event views must resolve selected child and followed athletes');
assert.match(js, /function renderFollowedEventFocus\(event\)/, 'event overview must render followed athletes in the project');
assert.match(js, /eventRenderedTabs:\s*new Set\(\)/, 'event detail must track rendered tabs for lazy rendering');
assert.match(js, /function renderEventTab\(tabName\)/, 'event detail must render non-current tabs on demand');
assert.match(js, /state\.eventRenderedTabs\.has\(tabName\)/, 'event tab rendering must avoid duplicate work');
assert.match(js, /function poolQuickSummaryRows\(group, resultRows\)/, 'pool process must summarize leading athletes before the score matrix');
assert.match(js, /class="pool-quick-summary"/, 'pool tab must render a mobile-readable leader summary');
assert.match(js, /class="process-scroll-hint"/, 'wide pool matrices must provide a horizontal scroll hint');
assert.match(js, /focusClassForAthlete\(match\.home\)/, 'bracket rows must highlight followed athletes');
assert.match(js, /focusClassForAthlete\(rowAthlete\)/, 'pool matrix rows must highlight followed athletes');
assert.match(js, /focusLabelForAthlete\(row\)/, 'final ranking rows must label followed athletes');
assert.match(js, /class="pool-matrix" style="--pool-size:/, 'pool matrix must size itself from the active group');
assert.match(js, /class="process-table pool-results-table"/, 'pool result table must have a mobile-specific width contract');
assert.match(js, /renderEventTab\('overview'\)/, 'opening an event should render only the visible overview tab immediately');
assert.doesNotMatch(js, /openEvent\(eventCode\)[\s\S]*renderPoolGroups\(state\.currentEvent\)[\s\S]*renderPoolStanding\(state\.currentEvent\)[\s\S]*renderMatches\(state\.currentEvent\)/, 'opening an event must not eagerly render all hidden process tabs');

assert.match(css, /body\s*\{[\s\S]*overflow-x:\s*hidden/, 'mobile body must not scroll horizontally');
assert.match(css, /html\s*\{[\s\S]*overflow-x:\s*hidden/, 'mobile document root must not scroll horizontally');
assert.match(css, /\.app\s*\{[\s\S]*overflow-x:\s*hidden/, 'mobile app shell must not be widened by tables');
assert.match(css, /\.pool-matrix-wrap\s*\{[\s\S]*overflow-x:\s*auto/, 'pool matrix must scroll inside its card');
assert.match(css, /\.pool-quick-summary/, 'pool quick summary styles must exist');
assert.match(css, /\.process-scroll-hint/, 'pool scroll hint styles must exist');
assert.match(css, /\.pool-result-table\s*\{[\s\S]*overflow-x:\s*auto/, 'pool result table must scroll inside its card');
assert.match(css, /\.pool-matrix\s*\{[\s\S]*--pool-size/, 'pool matrix width must be based on active group size');
assert.match(css, /\.pool-process-card\s*\{[\s\S]*contain:\s*inline-size/, 'pool process card must contain wide tables inside the mobile viewport');
assert.match(css, /\.pool-matrix\s*\{[\s\S]*width:\s*calc\(86px \+ \(var\(--pool-size, 7\) \* 32px\)\)/, 'pool matrix must use content-sized mobile-first fixed column widths');
assert.match(css, /\.pool-matrix th:not\(:first-child\),[\s\S]*\.pool-matrix td:not\(:first-child\)\s*\{[\s\S]*width:\s*32px/, 'pool matrix header and score columns must share compact fixed widths');
assert.match(css, /@media \(max-width:\s*430px\)[\s\S]*\.pool-matrix\s*\{[\s\S]*width:\s*calc\(76px \+ \(var\(--pool-size, 7\) \* 28px\)\)/, 'small phones must get a denser pool matrix without forcing page zoom');
assert.match(css, /\.pool-matrix th:first-child,[\s\S]*position:\s*sticky/, 'pool matrix first column must stay visible while scrolling');
assert.match(css, /\.pool-result-table\s*\{[\s\S]*display:\s*block/, 'pool result scroll container must not expand as a grid min-content box');
assert.match(css, /\.pool-results-table\s*\{[\s\S]*min-width:\s*324px/, 'pool results table must fit mobile first while still scrolling inside its card');
assert.match(css, /\.pool-results-table\s*\{[\s\S]*table-layout:\s*fixed/, 'pool results table must not expand from long cell content');
assert.match(css, /\.bracket-match\.has-focus-athlete/, 'bracket must visually mark followed athlete matches');
assert.match(css, /\.participant-card\.is-primary-focus/, 'final ranking must visually mark selected child');

console.log('event process focus and mobile overflow guards are covered');
