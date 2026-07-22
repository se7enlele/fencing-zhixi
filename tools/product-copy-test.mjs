import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../web/viewer.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');

assert.match(js, /const result = await fetchJson\('\/api\/competitions'\)/, 'initial competition load must use safe JSON handling');
assert.doesNotMatch(js, /const response = await fetch\('\/api\/competitions'\);[\s\S]*response\.json\(\)/, 'initial competition load must not parse raw non-JSON responses directly');
assert.doesNotMatch(js, /API returned non-JSON/, 'frontend copy must not expose API/non-JSON wording');
assert.doesNotMatch(js, /Unexpected token|DOCTYPE/, 'frontend copy must not expose parser/runtime internals');
assert.doesNotMatch(js, /重新启动新版服务|当前服务没有返回|赛程截图|报名页信息补充/, 'frontend copy must not expose service/debug or manual-import wording');
assert.doesNotMatch(js, /报名名单更新中|名单待更新|规模待确认|AI 分析项目/, 'event and competition detail copy must use user-facing state labels');
assert.doesNotMatch(js, /已收录 \${rosterRows\.length} 条报名记录|赛事基础信息已收录|项目明细已收录/, 'event and competition detail copy must avoid database-inventory wording');
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
assert.doesNotMatch(js, /第一阶段|预留微信|微信登录已预留|后续接入|账号状态见账号中心|微信登录开放后|登录或创建账号/, 'account and my-page copy must not expose rollout or implementation wording');
assert.doesNotMatch(js, /AI增强解读|增强解读/, 'AI answer copy must avoid implementation-oriented enhancement wording');
assert.doesNotMatch(js, /数据处理进度|服务进度|处理编号|服务编号|本机已记录|本机内容|同步清空/, 'my-page request records must use user-facing application wording');
assert.doesNotMatch(js, /当前筛选|全部数据|平台赛事|当前范围|深度赛事|报告资产|持续沉淀|按当前数据|工作台状态|来自 AI 问答|AI 历史|最近AI问题|最近 AI 分析|本地缓存/, 'database and my-page copy must avoid internal data/workspace wording');
assert.doesNotMatch(js, /label: 'AI分析'|label: '服务申请'|label: '档案申请'|title: '报告复用'|status: .*'可交付'|status: .*'待关注孩子'|status: .*'待选择俱乐部'|status: .*'可启动'|<h2>可用能力<\/h2>|<h2>可生成内容<\/h2>|<span>当前可用<\/span>|<span>按当前关注<\/span>|分析资产|报名与项目数据完善后|可复用记录|沉淀学员/, 'my page copy must use customer-facing wording');
assert.doesNotMatch(js, /继续生成赛前情报|可继续生成|人工跟进|试用说明/, 'AI and report copy must avoid process or sales-ops wording');
assert.match(js, /常用报告/, 'home report center should use user-facing report copy');
assert.match(js, /报告服务/, 'AI report planning answers should use user-facing report wording');
assert.doesNotMatch(js, /产品化方向|商业化落地顺序|商业闭环|SaaS|生成赛前情报包方案|生成家长成长报告方案|生成教练工作台方案|赛前情报包方案|家长成长报告方案|教练学员分层方案|家长沟通口径/, 'AI business and report copy must avoid internal product-planning wording');

assert.doesNotMatch(js, /\bP0\b|\bP1\b/, 'frontend copy must avoid internal priority labels');

assert.doesNotMatch(js, /\u751f\u6210\u5224\u65ad/, 'AI submit button must not use vague judgment copy');
assert.match(js, /\u5f00\u59cb\u5206\u6790/, 'AI submit button should use a direct action CTA');
assert.doesNotMatch(html, /id="followFilterMenu"/, 'my-follow filter should not use a fragile inline menu container');
assert.doesNotMatch(js, /function toggleFollowFilterMenu\(\)/, 'my-follow filter should use the shared sheet instead of an inline menu');
assert.doesNotMatch(js, /data-follow-filter-value/, 'my-follow filter should use the shared sheet option data attributes');
assert.match(js, /myFollowFilterButton\?\.addEventListener\('click', \(\) => openFilterSheet\('follow'\)\)/, 'my-follow filter button must open the shared sheet');
assert.doesNotMatch(css, /\.follow-filter-menu|\.follow-filter-option/, 'my-follow inline menu styles must not remain');
assert.doesNotMatch(js, /myFollowFilterButton\?\.addEventListener\('click', toggleFollowedCompetitionFilter\)/, 'my-follow dropdown-style filter must not be wired as a silent toggle');
assert.doesNotMatch(js, /AI 分析入口|为你而生|主动洞察/, 'home and detail copy must avoid internal or vague AI-entry wording');
assert.doesNotMatch(js, /专业分析入口|<h2>工作入口<\/h2>|按任务进入|<span>当前角色：/, 'home and role copy must avoid internal navigation or role-state wording');
assert.match(js, /<h2>常用功能<\/h2>/, 'home task cards should use user-facing function copy');
assert.match(js, /使用视角：/, 'role state should be phrased as a user-facing viewing perspective');
assert.doesNotMatch(js, /label: '判断口径'|口径下|当前已收录|第一层结论/, 'AI answer copy must avoid internal methodology labels');
assert.doesNotMatch(js, /\['当前判断'|\['证据强度'|'数据助手'/, 'AI answer labels must stay user-facing and avoid internal/generic helper copy');
assert.doesNotMatch(js, /<button type="button" data-ai-feedback=/, 'AI answer result should not show product feedback controls as primary user content');
assert.doesNotMatch(js, /当前匹配|匹配项目|匹配赛事和画像|正在匹配问题|已有项目明细|名单不完整|生成本场情报包|当前数据里|当前数据中|当前资料库/, 'AI answer and database copy must avoid internal matching or data-stage wording');
assert.doesNotMatch(js, /俱乐部对比证据|匹配赛事列表|title: '匹配赛事'|先进入匹配赛事列表/, 'AI result sources and sections must be phrased as user-facing records');
assert.doesNotMatch(js, /已收录赛事里|已收录赛事中|已收录画像|已展示 \$\{escapeHtml\(primaryEvidence\.length\)\} 条关键来源|基于已收录赛事数据生成|已收录 \$\{club\.entrants/, 'AI answer copy must avoid database-inventory wording');
assert.doesNotMatch(js, /本次问题重点匹配|报名名单已有|暂时没有可用于计算|暂未发现两人的直接交手记录|暂未发现两人出现在同一项目/, 'AI answer copy must avoid matching-process or dead-end wording');
assert.doesNotMatch(js, /按提问筛选|名单更新后再复核|报名名单更新后|继续积累项目和报名数据/, 'AI-to-database and prematch copy must avoid process-oriented wording');
assert.doesNotMatch(js, /姓名完全匹配|姓名匹配|俱乐部匹配|俱乐部完全匹配|俱乐部名称匹配|项目匹配|公开资料匹配|已为你匹配到|没有匹配的比赛/, 'search and result copy must not expose matching-process wording');
assert.doesNotMatch(js, /名单待补齐|名单补齐后|补齐后继续细化|报名名单还未完整收录|项目数据已收录|当前没有识别到近期赛前赛事/, 'prematch and event copy must not expose data-pipeline progress wording');
assert.match(js, /姓名一致/, 'search result reasons should use user-facing exact-name wording');
assert.match(js, /俱乐部名称一致/, 'club search result reasons should use user-facing exact-club wording');
assert.match(js, /相关项目：/, 'search result reasons should phrase project evidence as related records');
assert.match(js, /已看到 \$\{rosterRows\.length\} 人次报名信息/, 'prematch copy should describe visible roster information in user-facing language');
assert.match(js, /筛选结果：/, 'AI-to-database filter context should use user-facing wording');
assert.match(js, /选择或换个问法/, 'AI fallback action title should support both direct choices and rewritten questions');
assert.doesNotMatch(js, /\$\{yearLabel\} \$\{monthLabel\} \$\{regionLabel\}|\$\{yearLabel\}\$\{filters\.month \? monthLabel : ''\}/, 'AI answer copy must not concatenate all-year or all-month filler labels into titles and summaries');
assert.doesNotMatch(js, /'全部剑种'|'全部性别'|filters\.years\?\.length \? filters\.years\.join\('、'\) : '全部年份'/, 'AI comparison copy must not expose all-scope filler labels');

[
  '先看能否稳定进入后续轮次',
  '后续出现接近比分后',
  '后续有淘汰赛对阵后',
  '沉淀后续动作',
  '后续可直接复用',
  '后续订阅报名和重点对手更新',
  '后续赛事生成',
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
  '系统才能',
  '问题中的项目方向集中',
  '试试赛事统计',
  '试试选手成长',
].forEach((phrase) => {
  assert.ok(!js.includes(phrase), `frontend copy must not expose internal or dead-end wording: ${phrase}`);
});

console.log('product-facing copy is covered');
