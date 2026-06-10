import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../web/viewer.html', import.meta.url), 'utf8');
const indexHtml = await readFile(new URL('../web/index.html', import.meta.url), 'utf8');
const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');

assert.match(html, /id="view-home"/, 'viewer must include a dedicated home page');
assert.match(html, /id="view-follow"/, 'viewer must include a dedicated follow page');
assert.match(html, /id="view-my"/, 'viewer must include a dedicated my page');
assert.match(html, /id="bottomNav"/, 'viewer must include bottom navigation');
assert.match(html, /data-main-tab="my"/, 'bottom navigation must expose my tab');
assert.match(html, /data-main-tab="follow"/, 'bottom navigation must expose follow tab');
assert.equal([...html.matchAll(/data-main-tab="my"/g)].length, 1, 'my tab must be unique');
assert.equal([...html.matchAll(/data-main-tab="follow"/g)].length, 1, 'follow tab must be unique');
assert.equal([...html.matchAll(/aria-current="page"/g)].length, 1, 'only one bottom navigation tab can be current in static HTML');
assert.match(html, /<section class="view active" id="view-home">/, 'home dashboard must be the default landing view');
assert.doesNotMatch(html, /<section class="view active" id="view-competitions">/, 'competition list must not be the default landing view');
assert.doesNotMatch(html, /<section class="view active" id="view-role-home">/, 'role selection must not be the default landing view');
assert.match(html, /<nav class="bottom-nav" id="bottomNav" aria-label="主导航">/, 'bottom navigation must be visible on first load');
assert.doesNotMatch(html, /class="active"\s+data-main-tab=/, 'bottom navigation must not ship stale active classes in HTML');
assert.equal(indexHtml, html, 'static index.html must stay in sync with viewer.html');

assert.match(js, /COMPETITION_FOLLOW_KEY = 'fencingai\.followedCompetitions\.v1'/, 'competition follow state must be persisted');
assert.match(js, /RECENT_KEY = 'fencingai\.recentItems\.v1'/, 'recent view state must be persisted');
assert.match(js, /viewStack: \['home'\]/, 'default navigation stack must start at home dashboard');
assert.match(js, /activeMainTab: 'home'/, 'home tab must be active by default');
assert.match(js, /button\.classList\.remove\('active'\)/, 'bottom tab rendering must clear stale active classes first');
assert.match(js, /button\.removeAttribute\('aria-current'\)/, 'bottom tab rendering must clear stale aria-current state');
assert.match(js, /setAttribute\('aria-selected', 'false'\)/, 'bottom tab rendering must clear stale selected state');
assert.match(js, /button\.blur\(\)/, 'bottom tab rendering must clear retained button focus');
assert.match(js, /button\.dataset\.mainTab === activeTab/, 'bottom tab rendering must activate exactly the current tab');
assert.match(js, /setAttribute\('aria-current', 'page'\)/, 'bottom tab rendering must expose a single current page');
assert.match(js, /role === 'data'[\s\S]*navigateMain\('competitions'\)/, 'data workspace must open the competition page instead of the home dashboard');
assert.match(js, /function renderHomePage\(\)/, 'home page renderer must exist');
assert.match(js, /function renderAiWorkspace\(\)/, 'home page must include an AI workspace renderer');
assert.match(js, /function buildAiAnswer\(query\)/, 'AI workspace must build structured answers from local data');
assert.match(js, /replaceAll\('马消', '马潇'\)/, 'AI workspace must tolerate common athlete name typos');
assert.match(js, /function renderFocusPage\(\)/, 'follow page renderer must exist');
assert.match(js, /function renderMyPage\(\)/, 'my page renderer must exist');
assert.match(js, /function upsertFollowedCompetition\(competition\)/, 'competition follow handler must exist');
assert.match(js, /trackRecentItem\(\{[\s\S]*type: 'competition'/, 'competition detail views must be tracked as recent items');

assert.match(css, /\.bottom-nav/, 'bottom navigation styles must exist');
assert.match(css, /\.bottom-nav button\[aria-current="page"\]/, 'bottom navigation selected style must be driven by aria-current');
assert.match(css, /\.bottom-nav button:not\(\[aria-current="page"\]\)/, 'bottom navigation must explicitly reset non-current tabs');
assert.match(css, /background: transparent !important/, 'non-current bottom tabs must not keep touch or focus selected backgrounds');
assert.match(css, /\.ai-workspace/, 'AI workspace styles must exist');
assert.match(css, /\.ai-evidence/, 'AI workspace must style source evidence cards');
assert.match(css, /\.my-page-shell/, 'personal page styles must exist');
assert.match(css, /\.competition-follow-tag/, 'competition follow tag styles must exist');

console.log('home, follow, my page and bottom navigation are covered');
