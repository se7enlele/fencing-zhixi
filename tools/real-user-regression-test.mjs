import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const viewer = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const onlineAudit = await readFile(new URL('./online-ai-flow-audit.mjs', import.meta.url), 'utf8');
const upgradeList = await readFile(new URL('../docs/real-user-feedback-upgrade-list.md', import.meta.url), 'utf8');
const roadmap = await readFile(new URL('../docs/real-user-upgrade-roadmap-20260723.md', import.meta.url), 'utf8');
const packageJson = await readFile(new URL('../package.json', import.meta.url), 'utf8');

function publishedRegressionQuestions(markdown) {
  const section = String(markdown || '').match(/## 发布前固定回归问题([\s\S]*?)(?:\n## |\n# |$)/)?.[1] || '';
  return [...section.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
}

const fixedQuestions = publishedRegressionQuestions(upgradeList);
assert.ok(fixedQuestions.length >= 14, 'published regression list must keep at least 14 real-user questions');

const roadmapQuestions = publishedRegressionQuestions(roadmap);
for (const question of roadmapQuestions) {
  assert.ok(
    fixedQuestions.includes(question),
    `${question} from the real-user roadmap must be synced into the canonical upgrade list`,
  );
}

function comparableText(value) {
  return String(value || '').replace(/[\s？?]/g, '');
}

function assertContainsQuestion(source, question, label) {
  assert.ok(
    comparableText(source).includes(comparableText(question)),
    `${question} must remain in ${label}`,
  );
}

for (const question of fixedQuestions) {
  assertContainsQuestion(onlineAudit, question, 'the online real-user audit');
}

const acceptanceBlock = viewer.match(/function aiAcceptanceQueryCases\(\) \{[\s\S]*?\n\}/)?.[0] || '';
for (const question of fixedQuestions) {
  assertContainsQuestion(acceptanceBlock, question, 'local AI acceptance cases');
}

assert.match(packageJson, /"test:real-user": "node tools\/real-user-regression-test\.mjs"/, 'package scripts must expose the real-user regression gate');
assert.match(packageJson, /node tools\/real-user-regression-test\.mjs/, 'smoke must include the real-user regression gate');

console.log('real-user regression questions are covered');
