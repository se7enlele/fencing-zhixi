import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const start = source.indexOf('function compactCompetitionBarRows');
const end = source.indexOf('function renderCompetitionInsights');

if (start === -1 || end === -1 || end <= start) {
  throw new Error('Unable to locate competition detail helpers in viewer.js');
}

const context = {
  displayEventName: (row) => row.shortEventName || row.eventName || '',
};
vm.createContext(context);
vm.runInContext(`${source.slice(start, end)}
globalThis.compactCompetitionBarRows = compactCompetitionBarRows;
globalThis.compactCompetitionEventRows = compactCompetitionEventRows;
`, context);

const compactAgeRows = context.compactCompetitionBarRows([
  { label: '2016 上半年', entrants: 14, top8: 2 },
  { label: '2016 下半年', entrants: 11, top8: 3 },
  { label: '2017 上半年', entrants: 8, top8: 1 },
  { label: '2017 下半年', entrants: 18, top8: 1 },
  { label: '2018 上半年', entrants: 21, top8: 7 },
  { label: '2018 下半年', entrants: 21, top8: 5 },
  { label: '2019 上半年', entrants: 10, top8: 0 },
  { label: '2019 下半年', entrants: 5, top8: 0 },
], {
  limit: 5,
  otherLabel: '其他年龄段',
  valueKey: 'entrants',
  aggregateKeys: ['top8'],
});

assert.equal(compactAgeRows.length, 6);
assert.equal(JSON.stringify(compactAgeRows.map((row) => row.label)), JSON.stringify([
  '2018 上半年',
  '2018 下半年',
  '2017 下半年',
  '2016 上半年',
  '2016 下半年',
  '其他年龄段',
]));
assert.equal(compactAgeRows.at(-1).entrants, 23);
assert.equal(compactAgeRows.at(-1).top8, 1);

const compactEventRows = context.compactCompetitionEventRows([
  { shortEventName: 'U8 男花', competitionNo: 55 },
  { shortEventName: 'U10 男花', competitionNo: 55 },
  { shortEventName: 'U6 男花', competitionNo: 18 },
  { shortEventName: 'U12 男花', competitionNo: 9 },
  { shortEventName: 'U14 男花', competitionNo: 4 },
]);

assert.equal(compactEventRows.length, 4);
assert.equal(JSON.stringify(compactEventRows.map((row) => row.shortEventName)), JSON.stringify([
  'U10 男花',
  'U8 男花',
  'U6 男花',
  'U12 男花',
]));

console.log('competition detail compact distributions are covered');
