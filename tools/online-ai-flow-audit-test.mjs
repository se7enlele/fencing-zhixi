import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('./online-ai-flow-audit.mjs', import.meta.url), 'utf8');
const p0Source = await readFile(new URL('./online-p0-interaction-audit.mjs', import.meta.url), 'utf8');
const packageJson = await readFile(new URL('../package.json', import.meta.url), 'utf8');

assert.match(source, /const realUserContextByCase = \{/, 'online AI audit must map cases to real user contexts');
assert.match(source, /role: '进阶家长'[\s\S]*stage: '成长复盘期'/, 'online AI audit must include parent growth-review context');
assert.match(source, /role: '小型剑馆教练'[\s\S]*stage: '学员管理期'/, 'online AI audit must include coach student-management context');
assert.match(source, /role: '竞品对比家长'[\s\S]*stage: '选馆判断期'/, 'online AI audit must include club-comparison parent context');
assert.match(source, /query: '2027年北京击剑联赛第一站'/, 'missing competition recovery should use a truly missing future-year case');
assert.match(source, /expect: \['暂时没有2027年这场赛事记录', '赛事记录', '项目名单', '赛果成绩'\]/, 'missing competition recovery must assert coverage-layer copy');
assert.match(source, /function userJudgmentForResult\(/, 'online AI audit must classify result quality from the user perspective');
assert.match(source, /function markdownReport\(payload\)/, 'online AI audit must produce a markdown real-user evaluation report');
assert.match(source, /real-user-ai-evaluation-\$\{runId\}\.md/, 'online AI audit must save the markdown evaluation artifact');
assert.match(source, /document\.body\?\.dataset\?\.fencingaiReady === 'true'/, 'online AI audit must wait for the app-level data-ready marker before submitting questions');

assert.match(packageJson, /"audit:online-p0": "node tools\/online-p0-interaction-audit\.mjs"/, 'package scripts must expose the P0 interaction audit');
assert.match(p0Source, /const expectedAssetVersion = process\.env\.FENCINGAI_EXPECTED_ASSET_VERSION \|\| 'fencingai-product-20260722-focused-home-1'/, 'P0 audit must verify the deployed asset version');
assert.match(p0Source, /async function auditAssetVersion\(page\)/, 'P0 audit must check HTML asset cache-busting references');
assert.match(p0Source, /assets\.script\.includes\(expectedAssetVersion\)/, 'P0 audit must require the expected viewer.js version');
assert.match(p0Source, /assets\.stylesheet\.includes\(expectedAssetVersion\)/, 'P0 audit must require the expected viewer.css version');
assert.match(p0Source, /async function auditFocusedHome\(page\)/, 'P0 audit must verify the focused landing page structure');
assert.match(p0Source, /priorityCards === 1/, 'P0 audit must catch stacked home priority cards');
assert.match(p0Source, /result\.text\.includes\('下一步'\) && !result\.text\.includes\('关注与赛事'\)/, 'P0 audit must require the focused next-step heading');
assert.match(p0Source, /async function auditGenericFallback\(page\)/, 'P0 audit must verify generic AI fallback recovery');
assert.match(p0Source, /labels\[0\] === '进入数据库'/, 'P0 audit must require the database recovery action to stay first');
assert.match(p0Source, /async function auditChildFallback\(page\)/, 'P0 audit must verify child-investment fallback recovery');
assert.match(p0Source, /labels\[0\] === '管理关注对象'/, 'P0 audit must require the followed-object recovery action to stay first');
assert.match(p0Source, /async function auditFollowFilterSheet\(page\)/, 'P0 audit must verify the my-follow filter sheet interaction');
assert.match(p0Source, /options\.includes\('我的关注'\) && options\.includes\('关注选手'\)/, 'P0 audit must require follow-scope options in the shared sheet');
assert.match(p0Source, /async function auditMyAccountState\(page\)/, 'P0 audit must verify My page account-state consistency');
assert.match(p0Source, /inlineLoginForms === 0/, 'P0 audit must ensure My page does not render inline login forms');
assert.match(p0Source, /currentTabs\.length === 1 && currentTabs\[0\] === 'my'/, 'P0 audit must catch double-selected bottom-nav states');

console.log('online AI flow audit real-user context is covered');
