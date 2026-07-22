import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('./online-ai-flow-audit.mjs', import.meta.url), 'utf8');

assert.match(source, /const realUserContextByCase = \{/, 'online AI audit must map cases to real user contexts');
assert.match(source, /role: '进阶家长'[\s\S]*stage: '成长复盘期'/, 'online AI audit must include parent growth-review context');
assert.match(source, /role: '小型剑馆教练'[\s\S]*stage: '学员管理期'/, 'online AI audit must include coach student-management context');
assert.match(source, /role: '竞品对比家长'[\s\S]*stage: '选馆判断期'/, 'online AI audit must include club-comparison parent context');
assert.match(source, /query: '2027年北京击剑联赛第一站'/, 'missing competition recovery should use a truly missing future-year case');
assert.match(source, /expect: \['当前未收录2027年这场赛事', '赛事记录', '项目名单', '赛果成绩'\]/, 'missing competition recovery must assert coverage-layer copy');
assert.match(source, /function userJudgmentForResult\(/, 'online AI audit must classify result quality from the user perspective');
assert.match(source, /function markdownReport\(payload\)/, 'online AI audit must produce a markdown real-user evaluation report');
assert.match(source, /real-user-ai-evaluation-\$\{runId\}\.md/, 'online AI audit must save the markdown evaluation artifact');
assert.match(source, /document\.body\?\.dataset\?\.fencingaiReady === 'true'/, 'online AI audit must wait for the app-level data-ready marker before submitting questions');

console.log('online AI flow audit real-user context is covered');
