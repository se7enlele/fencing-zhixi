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
assert.match(js, /function renderFeedback\(rows = \[\]\)/, 'admin import must render user feedback requests');
assert.match(js, /function loadFeedback\(\)/, 'admin import must load feedback from the admin API');
assert.match(js, /\/api\/admin\/feedback\?token=/, 'admin import feedback must use the admin feedback API');
assert.match(js, /function renderAnalytics\(result\)/, 'admin import must render traffic analytics');
assert.match(js, /function loadAnalytics\(\)/, 'admin import must load analytics from the admin API');
assert.match(js, /\/api\/admin\/analytics\?token=/, 'admin import analytics must use the admin analytics API');
assert.match(js, /PV/, 'admin analytics must expose page views');
assert.match(js, /UV/, 'admin analytics must expose unique visitors');
assert.match(js, /平均停留/, 'admin analytics must expose average duration');
assert.match(js, /function feedbackTypeLabel\(type\)/, 'admin import must label correction and hide requests');
assert.match(js, /'ai-helpful': 'AI 有帮助'/, 'admin import must label helpful AI feedback');
assert.match(js, /'ai-needs-work': 'AI 需调整'/, 'admin import must label AI feedback that needs adjustment');
assert.match(js, /function feedbackStatusLabel\(status\)/, 'admin import must label feedback workflow status');
assert.match(js, /function updateFeedbackStatus\(id, status\)/, 'admin import must update feedback status');
assert.match(js, /\/api\/admin\/feedback\/status\?token=/, 'admin import feedback actions must use the admin status API');
assert.match(js, /data-feedback-status/, 'admin import feedback cards must expose workflow action buttons');
assert.match(js, /function escapeHtml\(value\)/, 'admin import must escape feedback text before rendering');
assert.match(js, /<pre>\$\{escapeHtml\(row\.message \|\| ''\)\}<\/pre>/, 'admin import must not render raw feedback messages');

assert.match(css, /\.roster-progress/, 'roster progress panel styles must exist');
assert.match(css, /\.roster-progress-grid/, 'roster progress metrics must have a layout');
assert.match(css, /\.feedback-list/, 'admin feedback list styles must exist');
assert.match(css, /\.feedback-card/, 'admin feedback card styles must exist');
assert.match(css, /\.feedback-actions/, 'admin feedback workflow action styles must exist');
assert.match(css, /\.analytics-summary/, 'admin analytics summary styles must exist');
assert.match(css, /\.analytics-card/, 'admin analytics metric cards must exist');
assert.match(css, /\.analytics-day-row/, 'admin analytics daily trend styles must exist');
assert.match(css, /\.analytics-rank-row/, 'admin analytics ranking styles must exist');

assert.match(html, /id="feedbackList"/, 'admin import page must expose a feedback list');
assert.match(html, /id="feedbackStatus"/, 'admin import page must expose feedback load status');
assert.match(html, /id="analyticsSummary"/, 'admin import page must expose analytics summary');
assert.match(html, /id="analyticsTrend"/, 'admin import page must expose analytics trend');
assert.match(html, /id="analyticsPages"/, 'admin import page must expose analytics page rankings');
assert.match(html, /admin-import\.js\?v=fencingai-product-20260629-analytics-1/, 'admin import JS cache key must be bumped');
assert.match(html, /admin-import\.css\?v=fencingai-product-20260629-analytics-1/, 'admin import CSS cache key must be bumped');

console.log('admin import page feedback is covered');
