import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../web/viewer.html', import.meta.url), 'utf8');
const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');

assert.match(html, /id="view-my"/, 'viewer must include a dedicated my page');
assert.match(html, /id="bottomNav"/, 'viewer must include bottom navigation');
assert.match(html, /data-main-tab="my"/, 'bottom navigation must expose my tab');
assert.match(html, /<section class="view active" id="view-competitions">/, 'competition home must be the default landing view');
assert.doesNotMatch(html, /<section class="view active" id="view-role-home">/, 'role selection must not be the default landing view');
assert.match(html, /<nav class="bottom-nav" id="bottomNav" aria-label="主导航">/, 'bottom navigation must be visible on first load');

assert.match(js, /COMPETITION_FOLLOW_KEY = 'fencingai\.followedCompetitions\.v1'/, 'competition follow state must be persisted');
assert.match(js, /RECENT_KEY = 'fencingai\.recentItems\.v1'/, 'recent view state must be persisted');
assert.match(js, /viewStack: \['competitions'\]/, 'default navigation stack must start at competition home');
assert.match(js, /activeMainTab: 'home'/, 'home tab must be active by default');
assert.match(js, /function renderMyPage\(\)/, 'my page renderer must exist');
assert.match(js, /function upsertFollowedCompetition\(competition\)/, 'competition follow handler must exist');
assert.match(js, /trackRecentItem\(\{[\s\S]*type: 'competition'/, 'competition detail views must be tracked as recent items');

assert.match(css, /\.bottom-nav/, 'bottom navigation styles must exist');
assert.match(css, /\.my-page-shell/, 'my page styles must exist');
assert.match(css, /\.competition-follow-tag/, 'competition follow tag styles must exist');

console.log('my page and bottom navigation are covered');
