import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');

assert.match(js, /const result = await fetchJson\('\/api\/competitions'\)/, 'initial competition load must use safe JSON handling');
assert.doesNotMatch(js, /const response = await fetch\('\/api\/competitions'\);[\s\S]*response\.json\(\)/, 'initial competition load must not parse raw non-JSON responses directly');
assert.doesNotMatch(js, /API returned non-JSON/, 'frontend copy must not expose API/non-JSON wording');
assert.doesNotMatch(js, /Unexpected token|DOCTYPE/, 'frontend copy must not expose parser/runtime internals');
assert.doesNotMatch(js, new RegExp(['项目规模', '和名单信息更新后会自动完善'].join('')), 'competition cards must not expose data-pipeline wording');
assert.doesNotMatch(js, new RegExp(['当前先看项目规模', '和比赛时间'].join('')), 'pre-event copy must describe user value instead of data availability');
assert.doesNotMatch(js, new RegExp(['名单更新后', '会更准确'].join('')), 'pre-event metrics must avoid back-office data freshness wording');
assert.doesNotMatch(js, new RegExp(['已识别 \\$\\{model\\.registered\\}', ' 条报名记录'].join('')), 'pre-event intelligence must avoid technical recognition wording');
assert.doesNotMatch(js, /更新优先级|补项目清单|补报名名单|补赛后成绩|下一阶段会接入/, 'frontend copy must not expose internal roadmap or back-office task wording');
assert.match(js, /function friendlyErrorMessage\(scope\)/, 'detail failures must use a product-facing fallback');
assert.match(js, /赛前准备/, 'data status should explain available data in user-facing product language');
assert.match(js, /成长变化、对手表现和队伍表现/, 'data status should connect full score data to user-facing analysis value');

assert.doesNotMatch(js, /后续信息更新|名单继续更新|等待名单完善|名单完善后/, 'competition detail copy must avoid back-office data-progress wording');
assert.doesNotMatch(js, /当前收录|后续数据|当前只有/, 'athlete-facing copy must avoid database-progress wording');
assert.doesNotMatch(js, /已产品化|产品模板|报告模板|生成赛前情报包模板|生成家长成长报告模板|生成教练学员分层模板/, 'frontend copy must avoid internal productization/template wording');
assert.doesNotMatch(js, /第一阶段|预留微信|微信登录已预留|后续接入|账号状态见账号中心/, 'account and my-page copy must not expose rollout or implementation wording');
assert.doesNotMatch(js, /AI增强解读|增强解读/, 'AI answer copy must avoid implementation-oriented enhancement wording');
assert.doesNotMatch(js, /数据处理进度|服务进度|处理编号|服务编号|本机已记录/, 'my-page request records must use user-facing application wording');
assert.doesNotMatch(js, /当前筛选|全部数据|平台赛事|当前范围|深度赛事|报告资产|持续沉淀|按当前数据|工作台状态/, 'database and my-page copy must avoid internal data/workspace wording');
assert.match(js, /常用报告/, 'home report center should use user-facing report copy');
assert.match(js, /报告方案/, 'AI report planning answers should use user-facing report wording');

assert.doesNotMatch(js, /\bP0\b|\bP1\b/, 'frontend copy must avoid internal priority labels');

assert.doesNotMatch(js, /\u751f\u6210\u5224\u65ad/, 'AI submit button should use action-oriented copy instead of judgment-generation wording');
assert.match(js, /\u5f00\u59cb\u5206\u6790/, 'AI submit button should use concise user-facing analysis copy');
assert.doesNotMatch(js, /AI 分析入口|为你而生|主动洞察/, 'home and detail copy must avoid internal or vague AI-entry wording');
assert.doesNotMatch(js, /label: '判断口径'|口径下|当前已收录|第一层结论/, 'AI answer copy must avoid internal methodology labels');
assert.doesNotMatch(js, /\['当前判断'|\['证据强度'|'数据助手'/, 'AI answer labels must stay user-facing and avoid internal/generic helper copy');
assert.doesNotMatch(js, /<button type="button" data-ai-feedback=/, 'AI answer result should not show product feedback controls as primary user content');

[
  '先看能否稳定进入后续轮次',
  '后续出现接近比分后',
  '后续有淘汰赛对阵后',
  '沉淀后续动作',
  '后续可直接复用',
  '后续订阅报名和重点对手更新',
  '后续赛事生成',
  '后续再扩展会员或教练端 SaaS',
  '后续提醒、报告或工作台',
  '后续报告入口',
  "label: '后续'",
  '后续赛程',
  '后续再细化到选手对标',
  '后续名单和成绩补齐',
  '后续成长报告',
  '后续招生案例',
  '后续训练反馈',
  '后续成长复盘样本',
  '后续赛前报告',
  '暂未识别到',
].forEach((phrase) => {
  assert.ok(!js.includes(phrase), `frontend copy must not expose internal or dead-end wording: ${phrase}`);
});

console.log('product-facing copy is covered');
