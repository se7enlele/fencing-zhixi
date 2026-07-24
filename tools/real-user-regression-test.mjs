import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const viewer = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const onlineAudit = await readFile(new URL('./online-ai-flow-audit.mjs', import.meta.url), 'utf8');
const upgradeList = await readFile(new URL('../docs/real-user-feedback-upgrade-list.md', import.meta.url), 'utf8');
const packageJson = await readFile(new URL('../package.json', import.meta.url), 'utf8');

const fixedQuestions = [
  '北京击剑联赛第一站',
  '为什么我的数据库里没有北京击剑联赛的数据',
  '2026年天津有几场比赛',
  '哪场比赛人数最多',
  '蔡廷彧最近有没有进步',
  '山东小众体育U8男花怎么样',
  '山东小众体育招生怎么讲',
  '分析马潇和陶嘉月的对战情况',
];

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
  assertContainsQuestion(upgradeList, question, 'the published regression list');
  assertContainsQuestion(onlineAudit, question, 'the online real-user audit');
}

const acceptanceBlock = viewer.match(/function aiAcceptanceQueryCases\(\) \{[\s\S]*?\n\}/)?.[0] || '';
for (const question of fixedQuestions) {
  assertContainsQuestion(acceptanceBlock, question, 'local AI acceptance cases');
}

assert.match(packageJson, /"test:real-user": "node tools\/real-user-regression-test\.mjs"/, 'package scripts must expose the real-user regression gate');
assert.match(packageJson, /node tools\/real-user-regression-test\.mjs/, 'smoke must include the real-user regression gate');

console.log('real-user regression questions are covered');
