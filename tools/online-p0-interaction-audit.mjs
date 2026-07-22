import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.FENCINGAI_AUDIT_URL || 'https://fencingai.uk/';
const outputDir = process.env.ANALYSIS_OUTPUT_DIR || 'analysis-output';
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const chromiumExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '';

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
  await page.locator('#aiAnswer .ai-answer-card').first().waitFor({ state: 'visible', timeout: 45000 });
  await page.waitForTimeout(250);
}

async function activeViewId(page) {
  return page.evaluate(() => document.querySelector('.view.active')?.id || '');
}

async function auditGenericFallback(page) {
  await openHome(page, '-generic');
  await runAiQuery(page, '随便看看');
  const answer = page.locator('#aiAnswer .ai-answer-card').first();
  const labels = await answer.locator('.ai-action-row button').evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
  assertAudit(labels[0] === '进入数据库', 'generic fallback first action should open database', { labels });
  assertAudit(labels.slice(0, 3).some((label) => label.includes('问')), 'generic fallback should keep runnable rewritten questions visible', { labels });
  await answer.locator('.ai-action-row button', { hasText: '进入数据库' }).first().click();
  await page.waitForFunction(() => document.querySelector('#view-competitions')?.classList.contains('active'), { timeout: 10000 });
  return { labels, activeView: await activeViewId(page) };
}

async function auditChildFallback(page) {
  await openHome(page, '-child');
  await runAiQuery(page, '孩子击剑值不值得继续');
  const answer = page.locator('#aiAnswer .ai-answer-card').first();
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
    results.genericFallback = await auditGenericFallback(page);
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
