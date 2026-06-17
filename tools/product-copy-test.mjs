import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');

assert.doesNotMatch(js, /API returned non-JSON/, 'frontend copy must not expose API/non-JSON wording');
assert.doesNotMatch(js, /详情读取失败：\$\{error\.message\}/, 'detail pages must not expose raw error messages');
assert.doesNotMatch(js, /Unexpected token|DOCTYPE/, 'frontend copy must not expose parser/runtime internals');
assert.doesNotMatch(js, /补齐优先级|优先补齐/, 'data status copy must use user-facing update language');
assert.match(js, /function friendlyErrorMessage\(scope\)/, 'detail failures must use a product-facing fallback');
assert.match(js, /更新优先级/, 'data status should explain data freshness in product language');

console.log('product-facing copy is covered');
