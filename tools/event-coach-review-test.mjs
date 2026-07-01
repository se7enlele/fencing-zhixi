import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');

assert.match(js, /function eventCoachReviewRows\(event\)/, 'event detail must derive coach review rows from event data');
assert.match(js, /function buildEventCoachReviewText\(event\)/, 'event detail must build copyable coach review text');
assert.match(js, /function coachReviewCard\(event\)/, 'event overview must render a coach review card');
assert.match(js, /function bindEventCoachReviewActions\(event\)/, 'event overview must bind coach review copy actions');
assert.match(js, /coachReviewCard\(event\)/, 'event analysis charts must include the coach review card');
assert.match(js, /bindEventCoachReviewActions\(event\)/, 'event overview must bind coach review after rendering analysis charts');
assert.match(js, /data-event-coach-review/, 'coach review card must expose a copy action');
assert.match(js, /trackAnalyticsAction\('share_report', 'event-coach-review'\)/, 'coach review copy must be tracked as a report share');
assert.match(js, /教练复盘/, 'coach review must use user-facing coach review copy');
assert.match(js, /训练安排/, 'coach review must translate event data into training guidance');
assert.match(js, /数据来源：FencingAI 已收录赛事成绩/, 'coach review copied text must include source context');

assert.match(css, /\.coach-review-card/, 'coach review card must be styled');
assert.match(css, /\.coach-review-copy/, 'coach review copy action must be styled');
assert.match(css, /\.coach-review-list/, 'coach review list must be styled');

console.log('event coach review is covered');
