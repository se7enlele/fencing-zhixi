import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.FENCINGAI_AUDIT_URL || 'https://fencingai.uk/';
const outputDir = process.env.ANALYSIS_OUTPUT_DIR || 'analysis-output';
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const chromiumExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '';
const expectedAssetVersion = process.env.FENCINGAI_EXPECTED_ASSET_VERSION || 'fencingai-product-20260723-ai-reasons-1';

function assertAudit(condition, message, details = {}) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

async function waitForReady(page) {
  await page.waitForFunction(
    () => document.body?.dataset?.fencingaiReady === 'true'
      && typeof document.querySelector('#aiQueryForm')?.__runAiQuery === 'function',
    { timeout: 45000 },
  );
}

async function openHome(page, suffix = '') {
  const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}v=online-p0-${runId}${suffix}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForReady(page);
}

async function visibleAiAnswer(page, timeout = 45000) {
  const answer = page.locator('#aiAnswer .ai-answer-card:visible').first();
  await answer.waitFor({ state: 'visible', timeout });
  await answer.evaluate((node) => node.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'instant' }));
  await page.waitForTimeout(200);
  return answer;
}

async function runAiQuery(page, query) {
  await page.evaluate((text) => {
    const input = document.querySelector('#aiQueryInput');
    const form = document.querySelector('#aiQueryForm');
    if (!input || !form) return;
    input.value = text;
    input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    form.__runAiQuery?.(text);
  }, query);
  await visibleAiAnswer(page);
}

async function activeViewId(page) {
  return page.evaluate(() => document.querySelector('.view.active')?.id || '');
}

async function auditAssetVersion(page) {
  await openHome(page, '-asset-version');
  const assets = await page.evaluate(() => ({
    script: document.querySelector('script[src*="viewer.js"]')?.getAttribute('src') || '',
    stylesheet: document.querySelector('link[href*="viewer.css"]')?.getAttribute('href') || '',
  }));
  assertAudit(assets.script.includes(expectedAssetVersion), 'HTML should reference the expected viewer.js version', { assets, expectedAssetVersion });
  assertAudit(assets.stylesheet.includes(expectedAssetVersion), 'HTML should reference the expected viewer.css version', { assets, expectedAssetVersion });
  assertAudit(!assets.script.includes('official-data-state-1') && !assets.stylesheet.includes('official-data-state-1'), 'HTML should not reference the stale focused-home predecessor assets', { assets });
  return assets;
}

async function auditFocusedHome(page) {
  await openHome(page, '-focused-home');
  const result = await page.evaluate(() => {
    const home = document.querySelector('#homePage');
    return {
      activeView: document.querySelector('.view.active')?.id || '',
      hasFocusedHome: Boolean(home?.querySelector('.home-dashboard-focused')),
      priorityCards: home?.querySelectorAll('.home-priority-item')?.length || 0,
      shortcutLabels: [...(home?.querySelectorAll('.home-shortcut-strip button') || [])].map((node) => node.textContent.trim()),
      text: home?.innerText || '',
    };
  });
  assertAudit(result.activeView === 'view-home', 'focused home should be the active landing page', result);
  assertAudit(result.hasFocusedHome, 'home should render the focused dashboard', result);
  assertAudit(result.priorityCards === 1, 'focused home should show exactly one next-step priority card', result);
  assertAudit(result.text.includes('下一步') && !result.text.includes('关注与赛事'), 'focused home should use a single next-step heading instead of stacked priority copy', { text: result.text.slice(0, 800) });
  assertAudit(result.shortcutLabels.includes('查赛事和选手') && result.shortcutLabels.includes('我的关注'), 'focused home should keep the two compact shortcuts', result);
  return {
    activeView: result.activeView,
    priorityCards: result.priorityCards,
    shortcutLabels: result.shortcutLabels,
  };
}

async function auditGenericFallback(page) {
  await openHome(page, '-generic');
  await runAiQuery(page, '随便看看');
  const answer = await visibleAiAnswer(page);
  const labels = await answer.locator('.ai-action-row button').evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
  assertAudit(labels[0] === '进入数据库', 'generic fallback first action should open database', { labels });
  assertAudit(labels.slice(0, 3).some((label) => label.includes('问')), 'generic fallback should keep runnable rewritten questions visible', { labels });
  await answer.locator('.ai-action-row button', { hasText: '进入数据库' }).first().click();
  await page.waitForFunction(() => document.querySelector('#view-competitions')?.classList.contains('active'), { timeout: 10000 });
  return { labels, activeView: await activeViewId(page) };
}

async function auditAiDatabaseEvidenceContext(page) {
  await openHome(page, '-ai-database-evidence');
  await runAiQuery(page, '2026年天津有几场比赛');
  const answer = await visibleAiAnswer(page);
  const labels = await answer.locator('.ai-action-row button').evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
  const listAction = labels.find((label) => label.includes('这几场赛事'))
    || labels.find((label) => label.includes('赛事列表'))
    || labels.find((label) => label.startsWith('看') && label.includes('赛事'));
  assertAudit(Boolean(listAction), 'competition stats answer should expose a competition-list action', { labels });
  await answer.locator('.ai-action-row button', { hasText: listAction }).first().click();
  await page.waitForFunction(() => document.querySelector('#view-competitions')?.classList.contains('active'), { timeout: 10000 });
  await page.locator('#competitionList .ai-filter-notice').first().waitFor({ state: 'visible', timeout: 10000 });
  const notice = await page.locator('#competitionList .ai-filter-notice').first().innerText();
  assertAudit(notice.includes('这次问题：2026年天津有几场比赛'), 'database evidence context should retain the original AI question', { notice });
  assertAudit(notice.includes('可核对赛事') && notice.includes('点击赛事卡'), 'database evidence context should explain the verifiable evidence path', { notice });
  assertAudit(notice.includes('可核对赛事 4 场'), 'database evidence context should keep the same result count as the AI answer', { notice });
  assertAudit(notice.includes('项目、名单和成绩'), 'database evidence context should tell users what can be checked after opening a card', { notice });
  return { labels, notice, activeView: await activeViewId(page) };
}

async function auditChildFallback(page) {
  await openHome(page, '-child');
  await runAiQuery(page, '孩子击剑值不值得继续');
  const answer = await visibleAiAnswer(page);
  const labels = await answer.locator('.ai-action-row button').evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
  assertAudit(labels[0] === '管理关注对象', 'child fallback first action should open My page', { labels });
  await answer.locator('.ai-action-row button', { hasText: '管理关注对象' }).first().click();
  await page.waitForFunction(() => document.querySelector('#view-my')?.classList.contains('active'), { timeout: 10000 });
  return { labels, activeView: await activeViewId(page) };
}

async function auditFollowFilterSheet(page) {
  await openHome(page, '-follow-filter');
  await page.locator('#bottomNav [data-main-tab="competitions"]').click();
  await page.waitForFunction(() => document.querySelector('#view-competitions')?.classList.contains('active'), { timeout: 10000 });
  await page.locator('#myFollowFilterButton').click();
  await page.waitForFunction(() => !document.querySelector('#filterSheet')?.hidden, { timeout: 10000 });
  const options = await page.locator('#filterSheetOptions .sheet-option').evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
  assertAudit(options.includes('我的关注') && options.includes('关注选手'), 'follow filter sheet should expose follow-scope options', { options });
  await page.locator('#filterSheetOptions .sheet-option', { hasText: '关注选手' }).click();
  await page.waitForFunction(() => document.querySelector('#filterSheet')?.hidden, { timeout: 10000 });
  const buttonText = await page.locator('#myFollowFilterButton').innerText();
  const expanded = await page.locator('#myFollowFilterButton').getAttribute('aria-expanded');
  assertAudit(buttonText.includes('关注选手'), 'follow filter button should show selected scope', { buttonText });
  assertAudit(expanded === 'false', 'follow filter button should reset expanded state after selection', { expanded });
  return { options, buttonText, expanded };
}

async function auditMyAccountState(page) {
  await openHome(page, '-my-account');
  await page.locator('#bottomNav [data-main-tab="my"]').click();
  await page.waitForFunction(() => document.querySelector('#view-my')?.classList.contains('active'), { timeout: 10000 });
  const myText = await page.locator('#myPage').innerText();
  const inlineLoginForms = await page.locator('#myPage .account-login-form').count();
  const currentTabs = await page.locator('#bottomNav [aria-current="page"]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-main-tab')));
  assertAudit(myText.includes('账号未登录') && myText.includes('当前未登录'), 'My page should show a consistent logged-out state', { myText: myText.slice(0, 500) });
  assertAudit(inlineLoginForms === 0, 'My page should not render an inline login form', { inlineLoginForms });
  assertAudit(currentTabs.length === 1 && currentTabs[0] === 'my', 'bottom nav should only mark My as selected', { currentTabs });
  await page.locator('#myPage [data-account-open-login]').first().click();
  await page.waitForFunction(() => document.querySelector('#view-account-login')?.classList.contains('active'), { timeout: 10000 });
  const loginForms = await page.locator('#accountLoginPage .account-login-form').count();
  assertAudit(loginForms === 1, 'dedicated login page should own the login form', { loginForms });
  return { inlineLoginForms, loginForms, currentTabs };
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    ...(chromiumExecutable ? { executablePath: chromiumExecutable } : {}),
  });
  const context = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const results = {};
  try {
    await context.clearCookies();
    results.assetVersion = await auditAssetVersion(page);
    results.focusedHome = await auditFocusedHome(page);
    results.genericFallback = await auditGenericFallback(page);
    results.aiDatabaseEvidenceContext = await auditAiDatabaseEvidenceContext(page);
    results.childFallback = await auditChildFallback(page);
    results.followFilterSheet = await auditFollowFilterSheet(page);
    results.myAccountState = await auditMyAccountState(page);
  } finally {
    await browser.close();
  }

  const payload = {
    ok: true,
    baseUrl,
    runId,
    results,
  };
  await mkdir(outputDir, { recursive: true });
  await writeFile(`${outputDir}/online-p0-interaction-audit-${runId}.json`, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(payload, null, 2));
}

main().catch(async (error) => {
  const payload = {
    ok: false,
    baseUrl,
    runId,
    message: error.message,
    details: error.details || {},
  };
  await mkdir(outputDir, { recursive: true });
  await writeFile(`${outputDir}/online-p0-interaction-audit-${runId}.json`, `${JSON.stringify(payload, null, 2)}\n`, 'utf8').catch(() => {});
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
});
