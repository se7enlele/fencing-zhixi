import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');

assert.match(js, /function athleteComparisonConfidence\(direct, shared\)/, 'AI athlete comparison must expose evidence strength');
assert.match(js, /function athleteRankGapText\(left, right\)/, 'AI athlete comparison must explain rank gap');
assert.match(js, /暂未发现两人的直接交手记录/, 'AI comparison must not imply direct bouts when none are found');
assert.match(js, /没有直接交手时，不会推断真实胜负/, 'AI comparison must disclose data boundary');
assert.match(js, /title: '时间分布'/, 'AI competition stats must include month distribution when available');
assert.match(js, /class="ai-source-note"/, 'AI answer must render data boundary notes');

assert.match(css, /\.ai-source-note/, 'AI source note styles must exist');

console.log('AI native answers are covered');
