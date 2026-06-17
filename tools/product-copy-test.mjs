import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');

assert.match(js, /const result = await fetchJson\('\/api\/competitions'\)/, 'initial competition load must use safe JSON handling');
assert.doesNotMatch(js, /const response = await fetch\('\/api\/competitions'\);[\s\S]*response\.json\(\)/, 'initial competition load must not parse raw non-JSON responses directly');
assert.doesNotMatch(js, /API returned non-JSON/, 'frontend copy must not expose API/non-JSON wording');
assert.doesNotMatch(js, /Unexpected token|DOCTYPE/, 'frontend copy must not expose parser/runtime internals');
assert.doesNotMatch(js, /更新优先级|补项目清单|补报名名单|补赛后成绩|下一阶段会接入/, 'frontend copy must not expose internal roadmap or back-office task wording');
assert.match(js, /function friendlyErrorMessage\(scope\)/, 'detail failures must use a product-facing fallback');
assert.match(js, /赛前准备/, 'data status should explain available data in user-facing product language');
assert.match(js, /成长复盘和队伍分析/, 'data status should connect full score data to user-facing analysis value');

console.log('product-facing copy is covered');
