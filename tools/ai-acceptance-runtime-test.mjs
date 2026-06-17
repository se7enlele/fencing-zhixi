import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');

function extractFunction(name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Missing function ${name}`);
  const bodyStart = source.indexOf('{', start);
  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  throw new Error(`Unable to extract function ${name}`);
}

const functionNames = [
  'shortEventName',
  'displayEventName',
  'competitionItemSummaries',
  'competitionItemCount',
  'competitionItemFilterLabels',
  'competitionMetricTotal',
  'competitionHasItems',
  'competitionYear',
  'normalizeSearchText',
  'compactText',
  'statusLabel',
  'coverageLabel',
  'coverageDetail',
  'parseDateCandidates',
  'displayDateLabel',
  'competitionDateValue',
  'daysFromToday',
  'aiAcceptanceQueryCases',
  'normalizeAiName',
  'aiAthletePool',
  'detectAthletesInQuery',
  'detectExactAthletesInQuery',
  'detectClubInQuery',
  'uniqueBy',
  'buildAiAnswer',
  'detectCompetitionStatsQuery',
  'detectPreMatchQuery',
  'detectRegionInQuery',
  'detectStatusInQuery',
  'aiProjectHints',
  'projectMatchesAiHints',
  'buildAiCompetitionStats',
  'buildAiPreMatchReport',
  'buildAiAthleteComparison',
  'buildAiAthleteGrowth',
  'buildAiClubReport',
  'clubWorkspaceAthletes',
  'clubProjectRows',
  'athleteStrengthScore',
  'athleteMetricLine',
  'athleteComparisonConfidence',
  'athleteRankGapText',
  'athleteTrendLabel',
  'sharedAthleteEvents',
  'directOpponentRows',
  'topEvidenceEvents',
  'aiEvidenceKind',
];

const sampleCompetitions = [
  {
    sportCode: 'TJ2026REG',
    sportName: '2026年“运河之锋”天津武清击剑公开赛',
    dateLabel: '2026-06-06 / 2026-06-07',
    venue: '天津武清',
    region: '天津',
    status: 'registration',
    isPreEvent: true,
    rosterStatus: 'partial',
    registrationSummary: { expectedRegistrationCount: 120, rosterCount: 18 },
    items: [{ eventCode: 'TJ2026REG-U8MF', eventName: 'U8 男子花剑', shortEventName: 'U8 男花' }],
  },
  {
    sportCode: 'TJ2026DONE',
    sportName: '2026年天津青少年击剑公开赛',
    dateLabel: '2026-04-01 / 2026-04-02',
    venue: '天津',
    region: '天津',
    status: 'completed',
    items: [{ eventCode: 'TJ2026DONE-U8MF', eventName: 'U8 男子花剑', shortEventName: 'U8 男花' }],
  },
  {
    sportCode: 'TJSEASONONLY',
    sportName: '\u5929\u6d25\u8ba4\u8bc1\u8d5b',
    season: '2026',
    dateLabel: '\u65e5\u671f\u5f85\u786e\u8ba4',
    venue: '\u5929\u6d25',
    region: '\u5929\u6d25',
    status: 'upcoming',
    itemCount: 1,
    itemSummaries: [{ eventCode: 'TJSEASONONLY-U10MF', eventName: 'U10 \u7537\u5b50\u82b1\u5251', shortEventName: 'U10 \u7537\u82b1' }],
  },
];

const caiEvents = [
  { eventCode: 'CAI-1', eventName: 'U6 男子花剑', shortEventName: 'U6 男花', sportName: '2025年比赛', finalRank: 8, openDate: '2025.06.01' },
  { eventCode: 'CAI-2', eventName: 'U8 男子花剑', shortEventName: 'U8 男花', sportName: '2026年比赛', finalRank: 9, openDate: '2026.04.01' },
];
const maEvents = [
  { eventCode: 'SHARED-1', eventName: 'U8 男子花剑', shortEventName: 'U8 男花', sportName: '共同赛事', finalRank: 3, openDate: '2026.03.01' },
];
const taoEvents = [
  { eventCode: 'SHARED-1', eventName: 'U8 男子花剑', shortEventName: 'U8 男花', sportName: '共同赛事', finalRank: 6, openDate: '2026.03.01' },
];

const athletes = [
  { id: 'cai', name: '蔡廷彧', club: '个人', bestRank: 8, medals: 0, appearances: 2, events: caiEvents, opponents: [], eliminationWins: 3, eliminationLosses: 5 },
  { id: 'ma', name: '马潇', club: '北京金石', bestRank: 3, medals: 1, appearances: 4, events: maEvents, opponents: [], eliminationWins: 5, eliminationLosses: 2 },
  { id: 'tao', name: '陶嘉月', club: '山东小众体育', bestRank: 6, medals: 0, appearances: 3, events: taoEvents, opponents: [], eliminationWins: 2, eliminationLosses: 3 },
];

const sampleClub = {
  id: 'club-sdzx',
  club: '山东小众体育',
  entrants: 43,
  top8: 15,
  medals: 8,
  bestRank: 1,
  events: [
    { eventCode: 'CLUB-U8MF', eventName: 'U8 男子花剑', shortEventName: 'U8 男花', sportName: '2026年赛事', entrants: 10, top8: 6, medals: 2, bestRank: 1, openDate: '2026.04.01' },
    { eventCode: 'CLUB-U10MF', eventName: 'U10 男子花剑', shortEventName: 'U10 男花', sportName: '2026年赛事', entrants: 4, top8: 1, medals: 0, bestRank: 9, openDate: '2026.04.01' },
  ],
};

const context = {
  __state: {
    competitions: sampleCompetitions,
    athletesById: Object.fromEntries(athletes.map((athlete) => [athlete.id, athlete])),
    athleteSearchIndex: athletes,
    clubSearchIndex: [sampleClub],
  },
};
vm.createContext(context);
vm.runInContext(`const state = globalThis.__state;\n${functionNames.map(extractFunction).join('\n')}\nglobalThis.buildAiAnswer = buildAiAnswer;\nglobalThis.aiAcceptanceQueryCases = aiAcceptanceQueryCases;\nglobalThis.detectRegionInQuery = detectRegionInQuery;`, context);

assert.equal(context.detectRegionInQuery('2026年天津有几场比赛'), '天津', 'AI region detection must not depend on the current dataset containing that city');

const seasonOnlyStats = context.buildAiAnswer('\u0032\u0030\u0032\u0036\u5e74\u5929\u6d25\u6709\u51e0\u573a\u6bd4\u8d5b');
assert.equal(seasonOnlyStats.type, 'competition-stats', 'season-based regional query should route to competition stats');
assert.equal(seasonOnlyStats.cards[0][1], '3 \u573a', 'AI competition stats should count events whose year is available only from season');

for (const item of context.aiAcceptanceQueryCases()) {
  const report = context.buildAiAnswer(item.query);
  assert.equal(report.type, item.expectedType, `${item.query} should return ${item.expectedType}`);
  assert.ok(report.cards?.length, `${item.query} should return metric cards`);
  if (report.type !== 'growth') {
    assert.ok(report.evidence?.length, `${item.query} should include clickable evidence`);
  }
}

const growthReport = context.buildAiAnswer('蔡廷彧最近几场有没有进步');
assert.equal(growthReport.type, 'growth', 'athlete growth query with 最近 must not route to prematch');

const clubReport = context.buildAiAnswer('山东小众体育 U8 男花怎么样');
assert.equal(clubReport.type, 'club');
assert.match(clubReport.title, /U8 男 花|U8 男花|U8.*男.*花/, 'club scoped query should preserve project hints in title');
assert.ok(clubReport.sections.some((section) => section.title === '匹配项目'), 'club scoped query should show matched projects');

console.log('AI acceptance runtime queries are covered');
