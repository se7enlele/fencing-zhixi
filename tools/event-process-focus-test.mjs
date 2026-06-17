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
assert.match(js, /focusClassForAthlete\(match\.home\)/, 'bracket rows must highlight followed athletes');
assert.match(js, /focusClassForAthlete\(rowAthlete\)/, 'pool matrix rows must highlight followed athletes');
assert.match(js, /focusLabelForAthlete\(row\)/, 'final ranking rows must label followed athletes');

assert.match(css, /body\s*\{[\s\S]*overflow-x:\s*hidden/, 'mobile body must not scroll horizontally');
assert.match(css, /\.app\s*\{[\s\S]*overflow-x:\s*hidden/, 'mobile app shell must not be widened by tables');
assert.match(css, /\.pool-matrix-wrap\s*\{[\s\S]*overflow-x:\s*auto/, 'pool matrix must scroll inside its card');
assert.match(css, /\.pool-result-table\s*\{[\s\S]*overflow-x:\s*auto/, 'pool result table must scroll inside its card');
assert.match(css, /\.bracket-match\.has-focus-athlete/, 'bracket must visually mark followed athlete matches');
assert.match(css, /\.participant-card\.is-primary-focus/, 'final ranking must visually mark selected child');

console.log('event process focus and mobile overflow guards are covered');
