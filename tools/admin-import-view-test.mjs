import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js = await readFile(new URL('../web/admin-import.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/admin-import.css', import.meta.url), 'utf8');
const html = await readFile(new URL('../web/admin-import.html', import.meta.url), 'utf8');

assert.match(js, /function rosterProgressText\(summary, importStats\)/, 'admin import must summarize roster page progress');
assert.match(js, /function renderRosterProgress\(preview, importStats\)/, 'admin import must render roster progress');
assert.match(js, /本页新增/, 'roster preview must show new records for the current page');
assert.match(js, /重复跳过/, 'roster preview must show duplicate records for the current page');
assert.match(js, /累计报名/, 'roster preview must show cumulative roster records');
assert.match(js, /请继续按页导入/, 'roster preview must guide page-by-page imports');
assert.match(js, /报名名单分页已入库：\$\{rosterProgressText/, 'commit status must reuse page progress summary');

assert.match(css, /\.roster-progress/, 'roster progress panel styles must exist');
assert.match(css, /\.roster-progress-grid/, 'roster progress metrics must have a layout');

assert.match(html, /admin-import\.js\?v=fencingai-product-20260617-admin-2/, 'admin import JS cache key must be bumped');
assert.match(html, /admin-import\.css\?v=fencingai-product-20260617-admin-2/, 'admin import CSS cache key must be bumped');

console.log('admin import page feedback is covered');
