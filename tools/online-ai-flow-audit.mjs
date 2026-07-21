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
    expect: ['赛事', '北京击剑联赛'],
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
    expect: ['成长', '蔡廷彧', '最近比赛'],
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
    expect: ['赛前情报', '报名名单', '优先关注'],
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
    expect: ['赛前情报包'],
  },
  {
    id: 'competition-missing-year',
    query: '2026年北京击剑联赛第一站',
    expect: ['未找到2026年同名赛事', '相近赛事', '查看相近赛事'],
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

function assertCase(condition, message, details = {}) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

async function runCase(page, testCase) {
  const inputLocator = page.locator('#aiQueryInput:visible').first();
  const submitLocator = page.locator('#aiQueryForm button[data-ai-submit="true"]:visible').first();
  await inputLocator.waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('#aiQueryForm[data-ai-bound="true"]').waitFor({ state: 'attached', timeout: 30000 });
  await submitLocator.waitFor({ state: 'visible', timeout: 30000 });
  await inputLocator.evaluate((input, query) => {
    input.focus();
    input.value = query;
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
  await page.waitForFunction(
    (expected) => {
      const card = document.querySelector('#aiAnswer .ai-answer-card');
      if (!card) return false;
      const text = card.textContent || '';
      return expected.every((phrase) => text.includes(phrase));
    },
    testCase.expect,
    { timeout: 30000 },
  );
  await page.waitForTimeout(300);

  const answer = page.locator('#aiAnswer .ai-answer-card').first();
  const text = await answer.innerText();
  const viewportTop = await answer.boundingBox();
  const actionLabels = await answer.locator('.ai-action-row button').evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
  const metricCount = await answer.locator('.ai-metric').count();
  const sectionCount = await answer.locator('.ai-section').count();
  const evidenceCount = await answer.locator('.ai-evidence button:visible').count();
  const hasEvidenceSummary = await answer.locator('.ai-evidence-summary').count();
  const missingExpected = testCase.expect.filter((phrase) => !text.includes(phrase));
  const bannedHits = bannedCopy.filter((phrase) => text.includes(phrase));

  assertCase(!missingExpected.length, `${testCase.id} missing expected copy`, { missingExpected, text });
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
  return {
    id: testCase.id,
    query: testCase.query,
    actionLabels,
    metricCount,
    sectionCount,
    evidenceCount,
    hasEvidenceSummary: Boolean(hasEvidenceSummary),
    evidenceNavigation,
    answerTop: viewportTop.y,
    title: text.split('\n').slice(0, 4).join(' / '),
  };
}

async function verifyFirstEvidenceNavigation(page, answer, testCase) {
  const evidenceButton = answer.locator('.ai-evidence button:visible').first();
  const sourceText = (await evidenceButton.innerText()).split('\n').filter(Boolean).slice(0, 4).join(' / ');
  await evidenceButton.evaluate((button) => button.scrollIntoView({ block: 'center', inline: 'nearest' }));
  await evidenceButton.click();
  await page.waitForFunction(
    () => [...document.querySelectorAll('.hero-title')]
      .some((node) => node.offsetParent !== null && node.textContent.trim()),
    null,
    { timeout: 30000 },
  );
  await page.waitForTimeout(300);
  const bodyText = await page.locator('body').innerText();
  const heroTitle = await page.locator('.hero-title:visible').first().innerText();
  const failureCopy = ['读取失败', '不存在', 'Unexpected token', 'DOCTYPE', 'undefined'].filter((phrase) => bodyText.includes(phrase));
  assertCase(!failureCopy.length, `${testCase.id} evidence navigation opens an error state`, { sourceText, heroTitle, failureCopy });
  assertCase(Boolean(heroTitle.trim()), `${testCase.id} evidence navigation did not open a detail title`, { sourceText });

  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('[data-main-tab="home"]')];
    const visibleButton = buttons.find((button) => {
      const rect = button.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }) || buttons[0];
    visibleButton?.click();
  });
  await page.locator('#aiQueryInput:visible').first().waitFor({ state: 'visible', timeout: 30000 });
  return { sourceText, heroTitle };
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
  await page.goto(`${baseUrl}?v=online-ai-flow-audit-${runId}`, { waitUntil: 'domcontentloaded' });
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
  console.log(JSON.stringify(payload, null, 2));
} finally {
  await browser.close();
}
