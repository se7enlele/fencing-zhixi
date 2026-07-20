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
  '第一层结论',
  '后续接入',
  '平台赛事',
  'AI 分析入口',
  'Unexpected token',
  'DOCTYPE',
];

const cases = [
  {
    id: 'club-comparison',
    query: '看2025和2026年，U10花剑男子和女子，北京金石是不是比北京艾鲁特更好',
    expect: ['剑馆对比', '北京金石', '北京艾鲁特', '只看U10男花'],
  },
  {
    id: 'competition-count',
    query: '2026年天津有几场比赛',
    expect: ['赛事统计', '天津', '赛事数量'],
  },
  {
    id: 'competition-lookup',
    query: '北京击剑联赛第一站',
    expect: ['赛事', '北京击剑联赛'],
  },
  {
    id: 'competition-missing-year',
    query: '2026年北京击剑联赛第一站',
    expect: ['未找到2026年同名赛事', '相近赛事', '查看相关赛事'],
  },
  {
    id: 'recovery',
    query: '孩子击剑值不值得继续',
    expect: ['先确定关注对象'],
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
  await page.locator('#aiQueryInput').fill(testCase.query);
  await page.locator('#aiQueryForm button[data-ai-submit="true"]').waitFor({ state: 'visible', timeout: 30000 });
  await page.waitForFunction(() => document.body.textContent.includes('赛事雷达'), null, { timeout: 30000 });
  await page.waitForTimeout(500);
  await page.locator('#aiQueryForm button[type="submit"]').click();
  await page.waitForFunction(
    (expected) => {
      const node = document.querySelector('#aiAnswer');
      if (!node) return false;
      const text = node.textContent || '';
      return expected.every((phrase) => text.includes(phrase));
    },
    testCase.expect,
    { timeout: 30000 },
  );
  await page.locator('#aiAnswer .ai-answer-card').first().waitFor({ state: 'visible', timeout: 30000 });
  await page.waitForTimeout(300);

  const answer = page.locator('#aiAnswer .ai-answer-card').first();
  const text = await answer.innerText();
  const viewportTop = await answer.boundingBox();
  const actionLabels = await answer.locator('.ai-action-row button').evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
  const metricCount = await answer.locator('.ai-metric').count();
  const sectionCount = await answer.locator('.ai-section').count();
  const evidenceCount = await answer.locator('.ai-evidence button').count();
  const hasEvidenceSummary = await answer.locator('.ai-evidence-summary').count();

  const missingExpected = testCase.expect.filter((phrase) => !text.includes(phrase));
  const bannedHits = bannedCopy.filter((phrase) => text.includes(phrase));

  assertCase(!missingExpected.length, `${testCase.id} missing expected copy`, { missingExpected, text });
  assertCase(!bannedHits.length, `${testCase.id} exposes internal copy`, { bannedHits, text });
  assertCase(metricCount <= 4, `${testCase.id} renders too many metric cards`, { metricCount });
  assertCase(sectionCount <= 2, `${testCase.id} renders too many explanation sections`, { sectionCount });
  assertCase(evidenceCount <= 3, `${testCase.id} renders too many source records`, { evidenceCount });
  assertCase(actionLabels.length <= 3, `${testCase.id} renders too many action buttons`, { actionLabels });
  assertCase(viewportTop && viewportTop.y < 740, `${testCase.id} answer did not scroll into reachable viewport`, { viewportTop });

  return {
    id: testCase.id,
    query: testCase.query,
    actionLabels,
    metricCount,
    sectionCount,
    evidenceCount,
    hasEvidenceSummary: Boolean(hasEvidenceSummary),
    answerTop: viewportTop.y,
    title: text.split('\n').slice(0, 4).join(' / '),
  };
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
  await page.locator('#aiQueryInput').waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('#aiQueryForm button[data-ai-submit="true"]').waitFor({ state: 'visible', timeout: 30000 });

  for (const testCase of cases) {
    results.push(await runCase(page, testCase));
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
