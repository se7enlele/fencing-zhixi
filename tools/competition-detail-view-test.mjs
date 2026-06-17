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
globalThis.sortedCompetitionEventRows = sortedCompetitionEventRows;
globalThis.compactCompetitionBarRows = compactCompetitionBarRows;
globalThis.compactCompetitionEventRows = compactCompetitionEventRows;
`, context);

const compactAgeRows = context.compactCompetitionBarRows([
  { label: '2016 H1', entrants: 14, top8: 2 },
  { label: '2016 H2', entrants: 11, top8: 3 },
  { label: '2017 H1', entrants: 8, top8: 1 },
  { label: '2017 H2', entrants: 18, top8: 1 },
  { label: '2018 H1', entrants: 21, top8: 7 },
  { label: '2018 H2', entrants: 21, top8: 5 },
  { label: '2019 H1', entrants: 10, top8: 0 },
  { label: '2019 H2', entrants: 5, top8: 0 },
], {
  limit: 4,
  otherLabel: 'Other age bands',
  valueKey: 'entrants',
  aggregateKeys: ['top8'],
});

assert.equal(compactAgeRows.length, 5);
assert.equal(JSON.stringify(compactAgeRows.map((row) => row.label)), JSON.stringify([
  '2018 H1',
  '2018 H2',
  '2017 H2',
  '2016 H1',
  'Other age bands',
]));
assert.equal(compactAgeRows.at(-1).entrants, 34);
assert.equal(compactAgeRows.at(-1).top8, 4);

const compactEventRows = context.compactCompetitionEventRows([
  { shortEventName: 'U8 Foil', competitionNo: 55 },
  { shortEventName: 'U10 Foil', competitionNo: 55 },
  { shortEventName: 'U6 Foil', competitionNo: 18 },
  { shortEventName: 'U12 Foil', competitionNo: 9 },
  { shortEventName: 'U14 Foil', competitionNo: 4 },
]);

assert.equal(compactEventRows.length, 4);
assert.equal(JSON.stringify(compactEventRows.map((row) => row.shortEventName)), JSON.stringify([
  'U10 Foil',
  'U8 Foil',
  'U6 Foil',
  'U12 Foil',
]));

const sortedEventRows = context.sortedCompetitionEventRows([
  { shortEventName: 'U14 Foil', competitionNo: 4 },
  { shortEventName: 'U8 Foil', competitionNo: 55 },
  { shortEventName: 'U10 Foil', competitionNo: 55 },
]);
assert.equal(JSON.stringify(sortedEventRows.map((row) => row.shortEventName)), JSON.stringify(['U10 Foil', 'U8 Foil', 'U14 Foil']));

assert.match(source, /competitionChips\(competition, 4\)/, 'competition list cards must limit raw project chips and summarize the rest');
assert.match(source, /function competitionProjectSummaryChips\(competition\)/, 'competition hero must summarize project structure instead of listing raw labels');
assert.match(source, /function competitionProjectScope\(competition\)/, 'competition hero must render a structured project scope summary');
assert.match(source, /function competitionHeroSummaryText\(competition\)/, 'competition hero must explain available value in user-facing language');
assert.match(source, /const chips = competitionProjectSummaryChips\(competition\)/, 'competition hero must use structural project summary chips');
assert.match(source, /class="competition-scope-grid"/, 'competition hero must show compact scope metrics instead of raw full labels');
assert.match(source, /project-summary-row/, 'competition hero project summary must have a dedicated compact row');
assert.match(source, /compactCompetitionEventRows\(eventRows, 3\)/, 'competition insight project comparison should stay compact on mobile');
assert.match(source, /limit:\s*4,[\s\S]*otherLabel:\s*'其他年龄段'/, 'competition age distribution should aggregate lower-priority age buckets');
assert.match(source, /const primaryItems = sortedItems\.slice\(0, 4\)/, 'competition event list should show only priority projects by default');
assert.match(source, /class="event-list-more"/, 'competition event list must hide lower-priority projects behind an expandable section');
assert.match(source, /secondaryItems\.length/, 'competition event list must keep full project access without showing everything by default');

const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');
assert.match(css, /\.competition-scope-grid/, 'competition scope summary styles must exist');
assert.match(css, /\.competition-scope-grid strong,[\s\S]*text-overflow:\s*ellipsis/, 'competition scope cells must truncate long summaries');

console.log('competition detail compact distributions are covered');
