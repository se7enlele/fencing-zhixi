import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../cloudflare/worker.mjs', import.meta.url), 'utf8');
const start = source.indexOf('function mergeDynamicCompetition');
const end = source.indexOf('function buildPreEventDetails');

if (start === -1 || end === -1 || end <= start) {
  throw new Error('Unable to locate dynamic competition helpers in worker.mjs');
}

assert.match(
  source,
  /url\.pathname === '\/api\/competitions'[\s\S]{0,220}getCompetitionIndex\(env\)/,
  'Worker /api/competitions must merge dynamic pre-event projectlists',
);

assert.match(
  source,
  /url\.pathname\.startsWith\('\/api\/competitions\/'\)[\s\S]{0,260}getCompetitionIndex\(env\)/,
  'Worker competition detail route must merge dynamic pre-event projectlists',
);

const context = {};
vm.createContext(context);
vm.runInContext(`${source.slice(start, end)}
globalThis.mergeDynamicCompetition = mergeDynamicCompetition;
`, context);

const merged = context.mergeDynamicCompetition({
  sportCode: 'RZSS2034112',
  sportName: '2026年“运河之锋”天津武清击剑公开赛',
  venue: '天津 天津市',
  region: '华北',
  isPreEvent: true,
  isPlatformEventList: true,
  items: [],
}, {
  sportCode: 'RZSS2034112',
  sportName: '赛前赛事 101122',
  venue: '',
  region: '',
  isPreEvent: true,
  itemCount: 66,
  items: [{ eventCode: 'RZSS2034112MFIU8' }],
});

assert.equal(merged.sportName, '2026年“运河之锋”天津武清击剑公开赛');
assert.equal(merged.venue, '天津 天津市');
assert.equal(merged.itemCount, 66);
assert.equal(merged.items.length, 1);

const scoreMerged = context.mergeDynamicCompetition({
  sportCode: 'D05GJSSD1820260221',
  sportName: '2025 score competition',
  isPreEvent: false,
  itemCount: 1,
  items: [{ eventCode: 'D05GJSSD1820260221MFIU10', eventName: 'U10' }],
  insights: { source: 'score' },
}, {
  sportCode: 'D05GJSSD1820260221',
  sportName: 'pre event 101246',
  isPreEvent: true,
  itemCount: 72,
  items: [
    { eventCode: 'D05GJSSD1820260221MFIU10', eventName: 'U10', isPreEvent: true },
    { eventCode: 'D05GJSSD1820260221WFIU16', eventName: 'W U16', isPreEvent: true },
  ],
  insights: { source: 'projectlist' },
});

assert.equal(scoreMerged.itemCount, 72);
assert.equal(scoreMerged.items.length, 2);
assert.equal(scoreMerged.items.find((item) => item.eventCode === 'D05GJSSD1820260221MFIU10').isPreEvent, undefined);
assert.equal(scoreMerged.items.some((item) => item.eventCode === 'D05GJSSD1820260221WFIU16' && item.isPreEvent), true);
assert.equal(scoreMerged.insights.source, 'score');

console.log('worker dynamic competition projectlists are covered');
