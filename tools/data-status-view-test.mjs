import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');

assert.match(js, /function competitionCoverageLevel\(competition\)/, 'home data status must classify competition coverage');
assert.match(js, /function dataCoveragePriorityRows\(competitions, limit = 3\)/, 'home data status must surface priority gaps');
assert.match(js, /function renderHomeDataCoverage\(\)/, 'home page must render product-facing data coverage status');
assert.match(js, /function formatDataGeneratedAt\(value\)/, 'data status must format generatedAt for users');
assert.match(js, /state\.dataGeneratedAt = result\.generatedAt \|\| ''/, 'initial data load must store generatedAt from the public data index');
assert.match(js, /数据更新于/, 'home data status should show the data refresh time when available');
assert.match(js, /data-coverage-competition/, 'coverage priority rows must link back to competition details');
assert.match(js, /renderHomeDataCoverage\(\)/, 'home dashboard must include the data status panel');

assert.match(css, /\.data-status-panel/, 'data status panel styles must exist');
assert.match(css, /\.coverage-stage-strip/, 'coverage stages must use a compact mobile layout');
assert.match(css, /\.coverage-priority-list/, 'coverage priority rows must be styled');

console.log('home data status coverage is wired');
