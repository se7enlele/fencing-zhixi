import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.FENCINGAI_AUDIT_URL || 'https://fencingai.uk/';
const outputDir = process.env.ANALYSIS_OUTPUT_DIR || 'analysis-output';
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const chromiumExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '';

const bannedCopy = [
  '分析口径',
  '判断路径',
  '判断口径',
  '数据边界',
  '当前已收录',
  '已收录',
  '已展示',
  '本次问题重点匹配',
  '报名名单已有',
  '暂时没有可用于计算',
  '暂未发现',
  '第一层结论',
  '后续接入',
  '平台赛事',
  'AI 分析入口',
  'Unexpected token',
  'DOCTYPE',
  'undefined',
];

const cases = [
  {
    id: 'competition-lookup',
    query: '北京击剑联赛第一站',
    expectAny: [
      ['赛事', '北京击剑联赛'],
      ['没有找到这场赛事', '相近赛事'],
    ],
    requireEvidence: true,
  },
  {
    id: 'competition-count',
    query: '2026年天津有几场比赛',
    expect: ['赛事统计', '天津', '赛事数量'],
  },
  {
    id: 'competition-largest',
    query: '哪场比赛人数最多',
    expect: ['赛事规模', '人数', '查看赛事'],
    requireEvidence: true,
  },
  {
    id: 'athlete-growth-recent',
    query: '蔡廷彧最近有没有进步',
    expect: ['成长', '蔡廷彧', '近期变化'],
    requireEvidence: true,
  },
  {
    id: 'athlete-growth-yearly',
    query: '蔡廷彧2025和2026年的表现有什么变化',
    expect: ['成长', '蔡廷彧', '2025'],
    requireEvidence: true,
  },
  {
    id: 'prematch-registration',
    query: '天津近期报名情况',
    expect: ['赛前提醒', '报名名单', '先关注'],
    requireEvidence: true,
  },
  {
    id: 'club-project',
    query: '山东小众体育U8男花怎么样',
    expect: ['山东小众体育', 'U8 男花'],
    requireEvidence: true,
  },
  {
    id: 'club-recruiting',
    query: '山东小众体育招生怎么讲',
    expect: ['山东小众体育', '招生'],
    requireEvidence: true,
  },
  {
    id: 'club-comparison',
    query: '北京金石和北京艾鲁特U10男花谁更强',
    expect: ['剑馆对比', '北京金石', '北京艾鲁特'],
    requireEvidence: true,
  },
  {
    id: 'athlete-comparison',
    query: '分析马潇和陶嘉月的对战情况',
    expect: ['马潇', '陶嘉月'],
    requireEvidence: true,
  },
  {
    id: 'growth-report-template',
    query: '帮我生成蔡廷彧成长报告',
    expect: ['蔡廷彧', '成长'],
  },
  {
    id: 'prematch-template',
    query: '帮我生成赛前情报包',
    expect: ['赛前提醒'],
  },
  {
    id: 'business-value',
    query: '这些击剑数据能产生什么商业价值',
    expect: ['商业洞察', '27264', '825', '选手画像', '俱乐部画像'],
  },
  {
    id: 'competition-missing-year',
    query: '2027年北京击剑联赛第一站',
    expect: ['当前未收录2027年这场赛事', '可查内容', '赛事记录', '项目名单'],
  },
  {
    id: 'recovery',
    query: '孩子击剑值不值得继续',
    expect: ['先确定关注对象'],
  },
  {
    id: 'fuzzy-object-recovery',
    query: '小众',
    expect: ['先确认你要看的对象', '山东小众体育', '相近俱乐部'],
    requireEvidence: true,
  },
];

const realUserContextByCase = {
  'competition-lookup': { role: '新用户', stage: '探索期', task: '用赛事名称确认系统能否找到目标比赛', expectedIntent: '赛事名识别' },
  'competition-count': { role: '赛事运营方', stage: '赛事规划期', task: '查看指定地区和年份的赛事数量', expectedIntent: '赛事统计' },
  'competition-largest': { role: '赛事运营方', stage: '规模判断期', task: '找出参赛规模最大的比赛', expectedIntent: '赛事规模排行' },
  'athlete-growth-recent': { role: '进阶家长', stage: '成长复盘期', task: '判断孩子近期是否有进步', expectedIntent: '选手成长' },
  'athlete-growth-yearly': { role: '进阶家长', stage: '年度复盘期', task: '比较孩子跨年度表现变化', expectedIntent: '年度成长' },
  'prematch-registration': { role: '赛前家长', stage: '赛前准备期', task: '查看近期报名和关注对象准备重点', expectedIntent: '赛前情报' },
  'club-project': { role: '小型剑馆教练', stage: '学员管理期', task: '查看本馆指定项目表现', expectedIntent: '俱乐部项目分析' },
  'club-recruiting': { role: '剑馆管理者', stage: '招生沟通期', task: '把俱乐部成绩转成招生表达', expectedIntent: '招生展示' },
  'club-comparison': { role: '竞品对比家长', stage: '选馆判断期', task: '比较两家剑馆在指定项目的表现', expectedIntent: '俱乐部对比' },
  'athlete-comparison': { role: '深度数据用户', stage: '证据核验期', task: '比较两名选手历史表现和对战线索', expectedIntent: '选手对比' },
  'growth-report-template': { role: '潜在付费家长', stage: '报告决策期', task: '判断成长报告是否值得保存复用', expectedIntent: '报告产品化' },
  'prematch-template': { role: '潜在付费用户', stage: '赛前服务评估期', task: '判断赛前情报包是否可用', expectedIntent: '报告产品化' },
  'business-value': { role: '产品/商业评估者', stage: '商业判断期', task: '判断数据资产能产生哪些服务价值', expectedIntent: '商业洞察' },
  'competition-missing-year': { role: '新用户', stage: '失败恢复期', task: '搜索未收录赛事时理解缺在哪一层', expectedIntent: '未收录恢复' },
  recovery: { role: '入门家长', stage: '项目认知期', task: '提出模糊投入问题时获得下一步', expectedIntent: '模糊问题恢复' },
  'fuzzy-object-recovery': { role: '新用户', stage: '对象确认期', task: '输入简称时找到相近对象', expectedIntent: '模糊对象恢复' },
};

function caseEvaluationContext(testCase) {
  return realUserContextByCase[testCase.id] || {
    role: '真实用户',
    stage: '未分类',
    task: testCase.query,
    expectedIntent: '待确认',
  };
}

function userJudgmentForResult({ testCase, evidenceCount, actionLabels, evidenceNavigation, text }) {
  if (testCase.requireEvidence && !evidenceCount) return '不可用';
  if (testCase.requireEvidence && !evidenceNavigation) return '需要补证据';
  if (!actionLabels.length && /当前未收录|先确定|可以这样核对/.test(text)) return '基本可用';
  return '可信';
}

function failureRecoveryLabel(text) {
  if (/当前未收录|可以这样核对|先确定|相近赛事|补充方式|可以这样问/.test(text)) return '有下一步';
  return '非失败场景';
}

function markdownReport(payload) {
  const lines = [
    '# FencingAI 真实用户 AI 回归评测',
    '',
    `- 运行时间：${payload.checkedAt}`,
    `- 目标地址：${payload.baseUrl}`,
    `- 用例数量：${payload.results.length}`,
    '',
    '| 用户角色 | 阶段 | 原始问题 | 系统识别 | 证据来源 | 失败恢复 | 用户判断 |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...payload.results.map((row) => [
      row.role,
      row.stage,
      row.query,
      row.expectedIntent,
      row.evidenceStatus,
      row.failureRecovery,
      row.userJudgment,
    ].map((value) => String(value || '').replace(/\|/g, '/')).join(' | ')).map((row) => `| ${row} |`),
    '',
    '## 下一步使用方式',
    '',
    '- `可信`：可以作为当前能力保留，并继续观察真实用户是否信任结论。',
    '- `基本可用`：主路径可用，但需要继续优化文案、证据或动作。',
    '- `需要补证据`：优先补来源跳转或详情页承接。',
    '- `不可用`：进入 P0 修复。',
  ];
  return `${lines.join('\n')}\n`;
}

function assertCase(condition, message, details = {}) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

async function runCase(page, testCase) {
  await openAuditHome(page, `case-${testCase.id}`);
  const inputLocator = page.locator('#aiQueryInput:visible').first();
  const submitLocator = page.locator('#aiQueryForm button[data-ai-submit="true"]:visible').first();
  await inputLocator.waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('#aiQueryForm[data-ai-bound="true"]').waitFor({ state: 'attached', timeout: 30000 });
  await submitLocator.waitFor({ state: 'visible', timeout: 30000 });
  await inputLocator.fill('');
  await inputLocator.fill(testCase.query);
  await inputLocator.evaluate((input, query) => {
    input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: query }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, testCase.query);

  const confirmedQuery = await inputLocator.inputValue();
  assertCase(confirmedQuery === testCase.query, `${testCase.id} query input was not set`, {
    expected: testCase.query,
    actual: confirmedQuery,
  });

  const beforeAnswerText = await page.locator('#aiAnswer').innerText().catch(() => '');
  await submitLocator.click();
  await page.waitForFunction(
    (beforeText) => {
      const node = document.querySelector('#aiAnswer');
      if (!node) return false;
      const text = node.textContent || '';
      return text.trim() !== String(beforeText || '').trim()
        && Boolean(node.querySelector('.ai-loading-card, .ai-answer-card'));
    },
    beforeAnswerText,
    { timeout: 5000 },
  );
  const earlyAnswerText = await page.locator('#aiAnswer').innerText().catch(() => '');
  if (testCase.query && earlyAnswerText.includes('先输入一个问题')) {
    await page.evaluate((query) => {
      const form = document.querySelector('#aiQueryForm');
      const input = document.querySelector('#aiQueryInput');
      if (input) {
        input.value = query;
        input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: query }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      form?.__runAiQuery?.(query);
    }, testCase.query);
  }
  await page.waitForFunction(
    ({ expected, expectAny }) => {
      const card = document.querySelector('#aiAnswer .ai-answer-card');
      if (!card) return false;
      const text = card.textContent || '';
      if (Array.isArray(expectAny) && expectAny.length) {
        return expectAny.some((phrases) => phrases.every((phrase) => text.includes(phrase)));
      }
      return expected.every((phrase) => text.includes(phrase));
    },
    { expected: testCase.expect || [], expectAny: testCase.expectAny || [] },
    { timeout: 30000 },
  );
  await page.waitForTimeout(300);

  const answer = page.locator('#aiAnswer .ai-answer-card').first();
  const text = await answer.innerText();
  const viewportTop = await answer.boundingBox();
  const actionLabels = await answer.locator('.ai-action-row button').evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
  const metricCount = await answer.locator('.ai-metric').count();
  const sectionCount = await answer.locator('.ai-section').count();
  const evidenceCount = await answer.locator('.ai-key-source button:visible, .ai-evidence button:visible').count();
  const hasEvidenceSummary = await answer.locator('.ai-evidence-summary').count();
  const expectedMatched = testCase.expectAny?.length
    ? testCase.expectAny.some((phrases) => phrases.every((phrase) => text.includes(phrase)))
    : true;
  const missingExpected = testCase.expectAny?.length
    ? []
    : (testCase.expect || []).filter((phrase) => !text.includes(phrase));
  const bannedHits = bannedCopy.filter((phrase) => text.includes(phrase));

  assertCase(expectedMatched && !missingExpected.length, `${testCase.id} missing expected copy`, { missingExpected, expectAny: testCase.expectAny, text });
  assertCase(!bannedHits.length, `${testCase.id} exposes internal or broken copy`, { bannedHits, text });
  assertCase(metricCount <= 4, `${testCase.id} renders too many metric cards`, { metricCount });
  assertCase(sectionCount <= 2, `${testCase.id} renders too many explanation sections`, { sectionCount });
  assertCase(evidenceCount <= 3, `${testCase.id} renders too many source records`, { evidenceCount });
  assertCase(actionLabels.length <= 3, `${testCase.id} renders too many action buttons`, { actionLabels });
  assertCase(viewportTop && viewportTop.y < 740, `${testCase.id} answer did not scroll into reachable viewport`, { viewportTop });
  if (testCase.requireEvidence) {
    assertCase(evidenceCount > 0, `${testCase.id} should expose at least one traceable source`, { text });
  }

  const evidenceNavigation = evidenceCount ? await verifyFirstEvidenceNavigation(page, answer, testCase) : null;
  const userContext = caseEvaluationContext(testCase);
  return {
    id: testCase.id,
    ...userContext,
    query: testCase.query,
    actionLabels,
    metricCount,
    sectionCount,
    evidenceCount,
    hasEvidenceSummary: Boolean(hasEvidenceSummary),
    evidenceNavigation,
    evidenceStatus: evidenceNavigation ? '可打开来源' : evidenceCount ? '有来源摘要' : '无来源',
    failureRecovery: failureRecoveryLabel(text),
    userJudgment: userJudgmentForResult({ testCase, evidenceCount, actionLabels, evidenceNavigation, text }),
    answerTop: viewportTop.y,
    title: text.split('\n').slice(0, 4).join(' / '),
  };
}

async function verifyFirstEvidenceNavigation(page, answer, testCase) {
  const evidenceButton = answer.locator('.ai-key-source button:visible, .ai-evidence button:visible').first();
  const sourceText = (await evidenceButton.innerText()).split('\n').filter(Boolean).slice(0, 4).join(' / ');
  await evidenceButton.evaluate((button) => button.scrollIntoView({ block: 'center', inline: 'nearest' }));
  await evidenceButton.click();
  await page.waitForFunction(
    () => {
      const detailOpen = [...document.querySelectorAll('.hero-title')]
        .some((node) => node.offsetParent !== null && node.textContent.trim());
      const competitionListOpen = document.querySelector('#view-competitions.active')
        || document.querySelector('#bottomNav')?.dataset.activeTab === 'competitions';
      return detailOpen || competitionListOpen;
    },
    null,
    { timeout: 30000 },
  );
  await page.waitForTimeout(300);
  const bodyText = await page.locator('body').innerText();
  const heroTitle = await page.locator('.hero-title:visible').first().innerText().catch(() => '赛事列表');
  const failureCopy = ['读取失败', '不存在', 'Unexpected token', 'DOCTYPE', 'undefined'].filter((phrase) => bodyText.includes(phrase));
  assertCase(!failureCopy.length, `${testCase.id} evidence navigation opens an error state`, { sourceText, heroTitle, failureCopy });
  assertCase(Boolean(heroTitle.trim()), `${testCase.id} evidence navigation did not open a detail title`, { sourceText });

  await openAuditHome(page, `return-${testCase.id}`);
  return { sourceText, heroTitle };
}

async function openAuditHome(page, tag = '') {
  const suffix = tag ? `-${tag}` : '';
  await page.goto(`${baseUrl}?v=online-ai-flow-audit-${runId}${suffix}`, { waitUntil: 'domcontentloaded' });
  await page.locator('#aiQueryInput:visible').first().waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('#aiQueryForm button[data-ai-submit="true"]:visible').first().waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('#aiQueryForm[data-ai-bound="true"]').waitFor({ state: 'attached', timeout: 30000 });
  await page.waitForFunction(
    () => {
      const text = document.body.textContent || '';
      return text.includes('选手画像') && text.includes('俱乐部') && !text.includes('正在加载数据');
    },
    null,
    { timeout: 60000 },
  );
}

const browser = await chromium.launch({
  headless: true,
  ...(chromiumExecutable ? { executablePath: chromiumExecutable } : {}),
});
const page = await browser.newPage({
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 3,
  isMobile: true,
});

page.setDefaultTimeout(30000);
await page.addInitScript(() => {
  localStorage.setItem('fencingai.role.v1', 'parent');
});

const results = [];
try {
  await openAuditHome(page, 'start');

  for (const testCase of cases) {
    try {
      results.push(await runCase(page, testCase));
    } catch (error) {
      const answerText = await page.locator('#aiAnswer').innerText().catch(() => '');
      error.message = `${testCase.id}: ${error.message}`;
      error.details = {
        ...(error.details || {}),
        query: testCase.query,
        expected: testCase.expect,
        answerText: answerText.slice(0, 2000),
      };
      throw error;
    }
  }

  const payload = {
    ok: true,
    baseUrl,
    runId,
    checkedAt: new Date().toISOString(),
    results,
  };
  await mkdir(outputDir, { recursive: true });
  await writeFile(`${outputDir}/online-ai-flow-audit-${runId}.json`, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  await writeFile(`${outputDir}/real-user-ai-evaluation-${runId}.md`, markdownReport(payload), 'utf8');
  console.log(JSON.stringify(payload, null, 2));
} finally {
  await browser.close();
}
