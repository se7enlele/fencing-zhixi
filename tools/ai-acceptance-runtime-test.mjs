import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');

function extractFunction(name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Missing function ${name}`);
  const paramsEnd = source.indexOf(')', start);
  const bodyStart = source.indexOf('{', paramsEnd);
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
  'itemFilterLabel',
  'competitionItemCount',
  'competitionItemFilterLabels',
  'competitionMetricTotal',
  'chineseAdminAlias',
  'withoutYearAlias',
  'competitionAliasTerms',
  'competitionNameAliasTerms',
  'competitionSearchHaystack',
  'cachedCompetitionSearchHaystack',
  'competitionEntrantCount',
  'competitionItemEntrantRows',
  'competitionHasItems',
  'competitionYear',
  'competitionMonth',
  'normalizeSearchText',
  'compactText',
  'statusLabel',
  'coverageLabel',
  'coverageDetail',
  'competitionCoverageLevel',
  'competitionCoverageState',
  'rosterAthleteLabel',
  'rosterClubText',
  'rosterEventLabel',
  'rosterHistoryMatch',
  'prematchRosterRows',
  'rosterItemSummary',
  'rosterClubSummary',
  'rosterPreparationRows',
  'parseDateCandidates',
  'displayDateLabel',
  'competitionDateValue',
  'daysFromToday',
  'aiAcceptanceQueryCases',
  'aiEntityCandidateTerms',
  'normalizeAiName',
  'aiAthletePool',
  'aiClubPool',
  'detectAthletesInQuery',
  'detectExactAthletesInQuery',
  'detectAthleteComparisonIntent',
  'detectComparisonAthletesInQuery',
  'detectCompetitionInQuery',
  'detectCompetitionCoverageQuestion',
  'competitionCoverageNameHint',
  'shouldRecoverStaleCompetitionNameMatch',
  'detectCompetitionLikeQuery',
  'competitionNameMatchKey',
  'relatedCompetitionsForQuery',
  'competitionMissingDiagnosisRows',
  'missingCompetitionCoverageCards',
  'competitionCoverageStageCards',
  'competitionCoverageDiagnosisRows',
  'missingCompetitionCoverageRows',
  'buildAiCompetitionCoverageReport',
  'aiFallbackCandidateTerms',
  'fallbackMatchScore',
  'aiFallbackCandidates',
  'aiFallbackRewriteActions',
  'aiOriginalQuestionSearchAction',
  'aiFallbackClarificationRows',
  'aiCandidateSummaryCards',
  'detectClubInQuery',
  'detectClubsInQuery',
  'hasClubComparisonIntent',
  'detectClubComparisonQuery',
  'detectCapabilityGuideQuery',
  'uniqueBy',
  'entityCoverageCounts',
  'officialCoverageCount',
  'normalizeAiFilterYears',
  'aiCompetitionFilterSummary',
  'aiFilterScopeText',
  'aiFilterCardLabel',
  'buildAiAnswer',
  'detectOfficialDirectoryQuery',
  'buildAiOfficialDirectoryReport',
  'buildAiCapabilityGuideReport',
  'buildAiFallbackReport',
  'detectCompetitionStatsQuery',
  'detectCompetitionRankingQuery',
  'detectProductTemplateQuery',
  'detectBusinessInsightQuery',
  'detectClubRecruitingQuery',
  'detectPreMatchQuery',
  'detectYearInQuery',
  'detectMonthInQuery',
  'detectRegionInQuery',
  'detectStatusInQuery',
  'aiProjectHints',
  'aiProjectScopeLabel',
  'aiFocusedAthletes',
  'aiAthleteProjectLabels',
  'competitionMatchesProjectLabel',
  'aiPreMatchFocusRows',
  'aiPreMatchPersonalRelevanceRows',
  'aiPreMatchRosterInsightRows',
  'aiPreMatchActionRows',
  'projectMatchesAiHints',
  'aiClubEvidenceEvents',
  'detectYearsInQuery',
  'aiClubComparisonFilters',
  'aiClubEventYear',
  'aiClubEventGender',
  'aiClubEventWeapon',
  'aiClubEventMatchesFilters',
  'aiClubComparisonMetric',
  'aiClubComparisonScore',
  'aiClubComparisonWinner',
  'aiClubComparisonQuantityWinner',
  'aiClubComparisonEfficiencyScore',
  'aiClubComparisonEfficiencyWinner',
  'aiClubComparisonPercent',
  'aiClubComparisonScopeLabel',
  'aiClubComparisonGenderLabel',
  'aiClubComparisonRefineQuery',
  'aiClubComparisonRefineLabel',
  'aiClubComparisonCardLabel',
  'aiClubComparisonCardValue',
  'aiClubComparisonQuantitySummary',
  'aiClubComparisonEfficiencySummary',
  'aiClubComparisonRateLine',
  'aiClubComparisonMetricLine',
  'aiClubComparisonConclusionRows',
  'aiClubComparisonQuantityRows',
  'aiClubComparisonReasonRows',
  'aiClubComparisonEvidenceRows',
  'aiClubComparisonItemFilter',
  'aiClubComparisonListFilters',
  'competitionsMatchingAiListFilters',
  'buildAiClubComparisonReport',
  'aiCompetitionFilterEvidence',
  'aiCompetitionStatsDecisionRows',
  'aiDefaultClub',
  'buildAiCompetitionStats',
  'buildAiCompetitionRanking',
  'businessMetricRows',
  'businessRegionRows',
  'businessClubOpportunityRows',
  'isActionablePrematchCompetition',
  'businessCoverageOpportunityRows',
  'businessRoleConversionRows',
  'businessPriorityRows',
  'businessProductOpportunityRows',
  'businessMonetizationRows',
  'buildAiBusinessInsightReport',
  'productTemplateTitle',
  'productTemplateMetricRows',
  'productTemplateSections',
  'productTemplateEvidence',
  'aiProductTemplateAthlete',
  'aiProductTemplateClub',
  'buildAiProductTemplateReport',
  'buildAiPreMatchReport',
  'buildAiAthleteComparison',
  'athleteEventYear',
  'athleteYearSummaryRows',
  'buildAiAthleteGrowth',
  'buildAiClubReport',
  'buildAiClubRecruitingReport',
  'buildAiCompetitionLookupReport',
  'clubWorkspaceAthletes',
  'clubProjectRows',
  'clubPeerRows',
  'buildClubBusinessCards',
  'clubShareHighlights',
  'buildClubCommunicationScripts',
  'athleteStrengthScore',
  'athleteMetricLine',
  'athleteProfileEvidence',
  'clubProfileEvidence',
  'athleteComparisonRiskRows',
  'athleteComparisonConfidence',
  'athleteRankGapText',
  'athleteTrendLabel',
  'sharedAthleteEvents',
  'directOpponentRows',
  'topEvidenceEvents',
  'aiEvidenceKind',
  'aiFollowAthleteAction',
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
    items: [{
      eventCode: 'TJ2026REG-U8MF',
      eventName: 'U8 男子花剑',
      shortEventName: 'U8 男花',
      roster: [
        { athleteName: '马潇', organName: '北京金石', eventName: 'U8 男子花剑' },
        { athleteName: '陶嘉月', organName: '山东小众体育', eventName: 'U8 男子花剑' },
        { athleteName: '蔡廷彧', organName: '个人', eventName: 'U8 男子花剑' },
      ],
    }],
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
    sportCode: 'BIG2026DONE',
    sportName: '\u0032\u0030\u0032\u0036\u5e74\u5927\u578b\u51fb\u5251\u516c\u5f00\u8d5b',
    dateLabel: '2026-05-01 / 2026-05-02',
    venue: '\u5317\u4eac',
    region: '\u5317\u4eac',
    status: 'completed',
    items: [
      { eventCode: 'BIG2026DONE-U8MF', eventName: 'U8 \u7537\u5b50\u82b1\u5251', shortEventName: 'U8 \u7537\u82b1', competitionNo: 75 },
      { eventCode: 'BIG2026DONE-U10MF', eventName: 'U10 \u7537\u5b50\u82b1\u5251', shortEventName: 'U10 \u7537\u82b1', competitionNo: 65 },
    ],
  },
  {
    sportCode: 'TJ2026JUNE',
    sportName: '\u0032\u0030\u0032\u0036\u5e74\u5929\u6d25\u516d\u6708\u51fb\u5251\u516c\u5f00\u8d5b',
    dateLabel: '2026-06-12 / 2026-06-13',
    venue: '\u5929\u6d25',
    region: '\u5929\u6d25',
    status: 'registration',
    isPreEvent: true,
    rosterStatus: 'partial',
    registrationSummary: { expectedRegistrationCount: 80, rosterCount: 20 },
    items: [{ eventCode: 'TJ2026JUNE-U10MF', eventName: 'U10 \u7537\u5b50\u82b1\u5251', shortEventName: 'U10 \u7537\u82b1' }],
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
  {
    sportCode: 'BJLEAGUE2026S1',
    sportName: '\u0032\u0030\u0032\u0036\u5e74\u5317\u4eac\u5e02\u51fb\u5251\u8054\u8d5b\uff08\u7b2c\u4e00\u7ad9\uff09',
    season: '2026',
    dateLabel: '2026.04.11 / 2026.04.12',
    venue: '\u5317\u4eac\u00b7\u987a\u4e49',
    region: '\u5317\u4eac',
    status: 'completed',
    itemCount: 1,
    items: [{ eventCode: 'BJLEAGUE2026S1-U10MF', eventName: 'U10 \u7537\u5b50\u82b1\u5251', shortEventName: 'U10 \u7537\u82b1' }],
  },
  {
    sportCode: 'RZSS2021040',
    sportName: '\u0032\u0030\u0032\u0031\u5317\u4eac\u51fb\u5251\u8054\u8d5b\u7b2c\u4e00\u7ad9',
    season: '2021',
    dateLabel: '2021.04.03 / 2021.04.05',
    venue: '\u5317\u4eac \u5317\u4eac\u5e02',
    region: '\u5317\u4eac',
    status: 'completed',
    itemCount: 0,
    items: [],
  },
  {
    sportCode: 'FUTIAN2026',
    sportName: '\u0032\u0030\u0032\u0036\u5e74\u201c\u798f\u7530\u676f\u201d\u96f7\u58f0\u51fb\u5251\u516c\u5f00\u8d5b',
    season: '2026',
    dateLabel: '2026.12.12 / 2026.12.13',
    venue: '\u5e7f\u4e1c \u5e7f\u5dde',
    region: '\u5e7f\u4e1c',
    status: 'upcoming',
    itemCount: 2,
    items: [{ eventCode: 'FUTIAN2026-U10MF', eventName: 'U10 \u7537\u5b50\u82b1\u5251', shortEventName: 'U10 \u7537\u82b1' }],
  },
  {
    sportCode: 'CANGZHOU2026LIVE',
    sportName: '\u0032\u0030\u0032\u0036\u5e74\u6cb3\u5317\u6ca7\u5dde\u51fb\u5251\u516c\u5f00\u8d5b',
    season: '2026',
    dateLabel: '\u65e5\u671f\u5f85\u786e\u8ba4',
    venue: '\u6cb3\u5317\u00b7\u6ca7\u5dde',
    region: '\u6cb3\u5317',
    status: 'live',
    itemCount: 1,
    items: [{ eventCode: 'CANGZHOU2026LIVE-U10MF', eventName: 'U10 \u7537\u5b50\u82b1\u5251', shortEventName: 'U10 \u7537\u82b1' }],
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
const ma = athletes.find((athlete) => athlete.id === 'ma');
const tao = athletes.find((athlete) => athlete.id === 'tao');

const sampleClub = {
  id: 'club-sdzx',
  club: '山东小众体育',
  entrants: 43,
  top8: 15,
  medals: 8,
  bestRank: 1,
  events: [
    { eventCode: 'CLUB-U12MF', eventName: 'U12 男子花剑', shortEventName: 'U12 男花', sportName: '2026年赛事', entrants: 20, top8: 8, medals: 4, bestRank: 1, openDate: '2026.04.01' },
    { eventCode: 'CLUB-U8MF', eventName: 'U8 男子花剑', shortEventName: 'U8 男花', sportName: '2026年赛事', entrants: 10, top8: 6, medals: 2, bestRank: 1, openDate: '2026.04.01' },
    { eventCode: 'CLUB-U10MF', eventName: 'U10 男子花剑', shortEventName: 'U10 男花', sportName: '2026年赛事', entrants: 4, top8: 1, medals: 0, bestRank: 9, openDate: '2026.04.01' },
  ],
};

const jinshiClub = {
  id: 'club-jinshi',
  club: '北京金石',
  entrants: 266,
  top8: 70,
  medals: 41,
  bestRank: 1,
  events: [
    { sportCode: 'BJ2026A', eventCode: 'BJ2026A-U10MF', eventName: 'U10 男子花剑', shortEventName: 'U10 男花', sportName: '2026年北京U10花剑公开赛', entrants: 120, top8: 34, medals: 19, bestRank: 1, openDate: '2026.05.01' },
    { sportCode: 'BJ2025A', eventCode: 'BJ2025A-U10MF', eventName: 'U10 男子花剑', shortEventName: 'U10 男花', sportName: '2025年北京U10花剑公开赛', entrants: 112, top8: 29, medals: 17, bestRank: 1, openDate: '2025.05.01' },
    { sportCode: 'BJ2026B', eventCode: 'BJ2026B-U10FF', eventName: 'U10 女子花剑', shortEventName: 'U10 女花', sportName: '2026年北京U10花剑公开赛', entrants: 34, top8: 7, medals: 5, bestRank: 1, openDate: '2026.05.02' },
  ],
};

const airuiteClub = {
  id: 'club-airuite',
  club: '北京艾鲁特',
  entrants: 279,
  top8: 54,
  medals: 29,
  bestRank: 1,
  events: [
    { sportCode: 'BJ2026A', eventCode: 'BJ2026A-U10MF-A', eventName: 'U10 男子花剑', shortEventName: 'U10 男花', sportName: '2026年北京U10花剑公开赛', entrants: 110, top8: 20, medals: 11, bestRank: 1, openDate: '2026.05.01' },
    { sportCode: 'BJ2025A', eventCode: 'BJ2025A-U10MF-A', eventName: 'U10 男子花剑', shortEventName: 'U10 男花', sportName: '2025年北京U10花剑公开赛', entrants: 112, top8: 20, medals: 10, bestRank: 1, openDate: '2025.05.01' },
    { sportCode: 'BJ2026B', eventCode: 'BJ2026B-U10FF-A', eventName: 'U10 女子花剑', shortEventName: 'U10 女花', sportName: '2026年北京U10花剑公开赛', entrants: 57, top8: 14, medals: 8, bestRank: 1, openDate: '2026.05.02' },
  ],
};

const context = {
  __state: {
    competitions: sampleCompetitions,
    athletesById: Object.fromEntries(athletes.map((athlete) => [athlete.id, athlete])),
    athleteSearchIndex: athletes,
    clubSearchIndex: [sampleClub, jinshiClub, airuiteClub],
    clubsById: { [sampleClub.id]: sampleClub, [jinshiClub.id]: jinshiClub, [airuiteClub.id]: airuiteClub },
    competitionSearchCache: new Map(),
    followedAthletes: [{ id: 'cai', name: '\u8521\u5ef7\u5f67', club: '\u4e2a\u4eba' }],
    selectedChildId: 'cai',
  },
};
vm.createContext(context);
vm.runInContext(`const state = globalThis.__state;\n${functionNames.map(extractFunction).join('\n')}\nglobalThis.buildAiAnswer = buildAiAnswer;\nglobalThis.aiAcceptanceQueryCases = aiAcceptanceQueryCases;\nglobalThis.detectRegionInQuery = detectRegionInQuery;\nglobalThis.detectYearInQuery = detectYearInQuery;\nglobalThis.aiEntityCandidateTerms = aiEntityCandidateTerms;\nglobalThis.businessMetricRows = businessMetricRows;\nglobalThis.businessPriorityRows = businessPriorityRows;\nglobalThis.businessProductOpportunityRows = businessProductOpportunityRows;\nglobalThis.businessMonetizationRows = businessMonetizationRows;`, context);

function hasEvidenceTarget(row = {}) {
  return Boolean(row.eventCode || row.sportCode || row.athleteId || row.clubId || row.mainTab || row.filters);
}

function hasRunnableActionTarget(row = {}) {
  return Boolean(
    row.query
    || row.sportCode
    || row.eventCode
    || row.athleteId
    || row.clubId
    || row.mainTab
    || row.filters
    || row.followAthleteId
    || row.followCompetitionCode
    || row.parentGrowthAthleteId
    || row.coachSegmentationClubId
    || row.prematchTemplateKind
    || row.prematchSportCode
    || row.officialSearchQuery,
  );
}

function assertTraceableEvidence(report, label) {
  for (const [index, row] of (report.evidence || []).entries()) {
    assert.ok(hasEvidenceTarget(row), `${label} evidence ${index + 1} should open a source record or filtered list`);
  }
}

function assertRunnableActions(report, label) {
  assert.ok(report.actions?.length, `${label} should include a next action`);
  assert.ok(
    report.actions.some((action) => hasRunnableActionTarget(action)),
    `${label} should include a runnable next action target`,
  );
}

assert.equal(context.detectRegionInQuery('2026年天津有几场比赛'), '天津', 'AI region detection must not depend on the current dataset containing that city');

const comparisonTerms = context.aiEntityCandidateTerms('\u5206\u6790\u9a6c\u6d88\u548c\u9676\u5609\u6708\u7684\u5bf9\u6218\u60c5\u51b5');
assert.ok(comparisonTerms.includes('\u9a6c\u6f47'), 'AI entity hydration should normalize common athlete name typos');
const clubComparisonTerms = context.aiEntityCandidateTerms('\u770b2025\u548c2026\u5e74\uff0cU10\u82b1\u5251\uff0c\u7537\u5b50\u548c\u5973\u5b50\uff0c\u5317\u4eac\u91d1\u77f3\u662f\u4e0d\u662f\u6bd4\u5317\u4eac\u827e\u9c81\u7279\u6210\u7ee9\u66f4\u597d');
assert.ok(clubComparisonTerms.includes('\u5317\u4eac\u91d1\u77f3'), 'AI entity hydration should keep the first city-prefixed club name');
assert.ok(clubComparisonTerms.includes('\u5317\u4eac\u827e\u9c81\u7279'), 'AI entity hydration should keep the second city-prefixed club name');
assert.ok(comparisonTerms.includes('\u9676\u5609\u6708'), 'AI entity hydration should extract the second athlete name');

const clubTerms = context.aiEntityCandidateTerms('\u5c71\u4e1c\u5c0f\u4f17\u4f53\u80b2 U8 \u7537\u82b1\u600e\u4e48\u6837');
assert.ok(clubTerms.includes('\u5c71\u4e1c\u5c0f\u4f17\u4f53\u80b2'), 'AI entity hydration should extract club names from scoped club questions');

const seasonOnlyStats = context.buildAiAnswer('\u0032\u0030\u0032\u0036\u5e74\u5929\u6d25\u6709\u51e0\u573a\u6bd4\u8d5b');
assert.equal(seasonOnlyStats.type, 'competition-stats', 'season-based regional query should route to competition stats');
assert.equal(seasonOnlyStats.cards[0][1], '4 \u573a', 'AI competition stats should count events whose year is available only from season');
assert.equal(seasonOnlyStats.evidence[0].kind, '\u8d5b\u4e8b\u5217\u8868', 'AI competition stats should make the filtered event list the primary source');
assert.equal(seasonOnlyStats.evidence[0].mainTab, 'competitions', 'AI competition stats primary source should open the database list');
assert.equal(
  JSON.stringify(seasonOnlyStats.evidence[0].filters),
  JSON.stringify({ year: '2026', month: '', region: '\u5929\u6d25', item: '', status: '', query: '\u0032\u0030\u0032\u0036\u5e74\u5929\u6d25\u6709\u51e0\u573a\u6bd4\u8d5b' }),
  'AI competition stats primary source should preserve the exact filter set and source question',
);

const namedCompetition = context.buildAiAnswer('\u5317\u4eac\u51fb\u5251\u8054\u8d5b\u7b2c\u4e00\u7ad9');
assert.equal(namedCompetition.type, 'competition-lookup', 'plain competition-name questions should route to a competition lookup instead of regional stats');
assert.match(namedCompetition.title, /\u5317\u4eac\u5e02\u51fb\u5251\u8054\u8d5b/, 'competition lookup should show the matched competition name');
assert.equal(namedCompetition.evidence[0].sportCode, 'BJLEAGUE2026S1', 'competition lookup should cite the matched competition');
assert.equal(namedCompetition.actions.find((action) => action.sportCode)?.sportCode, 'BJLEAGUE2026S1', 'competition lookup should open the matched competition directly');

const missingDataQuestion = context.buildAiAnswer('\u4e3a\u4ec0\u4e48\u6211\u7684\u6570\u636e\u5e93\u91cc\u6ca1\u6709\u5317\u4eac\u51fb\u5251\u8054\u8d5b\u7684\u6570\u636e\uff1f');
assert.equal(missingDataQuestion.type, 'fallback', 'missing-data wording should route to coverage diagnosis instead of plain lookup');
assert.match(missingDataQuestion.title, /\u540d\u79f0\u76f8\u8fd1/, 'missing-data diagnosis should explain likely name mismatch when a similar event exists');
assert.ok(missingDataQuestion.cards.some(([label, value]) => label === '\u8d5b\u4e8b\u8bb0\u5f55' && value === '\u627e\u5230\u76f8\u8fd1\u8bb0\u5f55'), 'missing-data diagnosis should show that a similar event record exists');
assert.ok(missingDataQuestion.cards.some(([label]) => label === '\u9879\u76ee\u540d\u5355'), 'missing-data diagnosis should expose project availability for the similar event');
assert.ok(missingDataQuestion.cards.some(([label]) => label === '\u62a5\u540d\u540d\u5355'), 'missing-data diagnosis should expose roster availability for the similar event');
assert.ok(missingDataQuestion.cards.some(([label]) => label === '\u8d5b\u679c\u6210\u7ee9'), 'missing-data diagnosis should expose result availability for the similar event');
assert.ok(missingDataQuestion.cards.some(([label, value]) => label === '\u9879\u76ee\u540d\u5355' && value === '\u53ef\u67e5\u770b'), 'missing-data diagnosis should show project data as available when the similar event has items');
assert.ok(missingDataQuestion.cards.some(([label, value]) => label === '\u62a5\u540d\u540d\u5355' && value === '\u6682\u65e0\u540d\u5355'), 'missing-data diagnosis should distinguish missing rosters from unavailable events');
assert.ok(missingDataQuestion.cards.some(([label, value]) => label === '\u8d5b\u679c\u6210\u7ee9' && value === '\u6682\u65e0\u6210\u7ee9'), 'missing-data diagnosis should distinguish missing scores from unavailable events');
assert.ok(missingDataQuestion.actions.some((action) => action.filters?.searchKeyword === '\u4e3a\u4ec0\u4e48\u6211\u7684\u6570\u636e\u5e93\u91cc\u6ca1\u6709\u5317\u4eac\u51fb\u5251\u8054\u8d5b\u7684\u6570\u636e\uff1f'), 'missing-data diagnosis should preserve the original question for database search recovery');
assert.ok(missingDataQuestion.actions.some((action) => action.sportCode === 'BJLEAGUE2026S1'), 'missing-data diagnosis should let users open the similar competition');
assert.ok(missingDataQuestion.sections.some((section) => section.title === '\u53ef\u4ee5\u8fd9\u6837\u6838\u5bf9'), 'missing-data diagnosis should provide verification guidance');
assert.ok(missingDataQuestion.sections.some((section) => section.title === '\u53ef\u67e5\u5185\u5bb9'), 'missing-data diagnosis should show a visible coverage section for similar events');
assert.ok(!/\u76f4\u63a5\u6253\u5f00\u6838\u5bf9\u9879\u76ee\u3001\u62a5\u540d\u548c\u6210\u7ee9/.test(missingDataQuestion.summary), 'missing-data diagnosis should not imply every coverage layer is available for a similar event');
assert.ok(/(\u5b8c\u5168\u4e00\u81f4|\u76f8\u8fd1\u8bb0\u5f55|\u540d\u79f0\u76f8\u8fd1)/.test(`${missingDataQuestion.title}${missingDataQuestion.summary}${missingDataQuestion.cards.map((row) => row.join('')).join('')}`), 'missing-data diagnosis should frame coverage as exact-match versus similar-record status');
assert.ok(!/(\u5bfc\u5165|\u540e\u7eed|\u6570\u636e\u8fb9\u754c|\u6682\u672a\u8bc6\u522b)/.test(`${missingDataQuestion.title}${missingDataQuestion.summary}${missingDataQuestion.sections.map((section) => section.rows.join('')).join('')}`), 'missing-data diagnosis should avoid internal data-pipeline wording');

const recoveryButtonQuestion = context.buildAiAnswer('\u6211\u7684\u6570\u636e\u5e93\u91cc\u6ca1\u6709\u5317\u4eac\u51fb\u5251\u8054\u8d5b\u7b2c\u4e00\u7ad9\uff0c\u4e3a\u4ec0\u4e48\u6ca1\u6709\u627e\u5230');
assert.equal(recoveryButtonQuestion.type, 'fallback', 'database recovery button question should route to coverage diagnosis');
assert.match(recoveryButtonQuestion.title, /(\u540d\u79f0\u76f8\u8fd1|\u6ca1\u6709\u627e\u5230.*\u5b8c\u5168\u4e00\u81f4)/, 'database recovery button question should explain the coverage state');
assert.ok(recoveryButtonQuestion.cards.some(([label]) => label === '\u8d5b\u4e8b\u8bb0\u5f55'), 'database recovery button question should expose event-record coverage');
assert.ok(recoveryButtonQuestion.sections.some((section) => section.title === '\u53ef\u4ee5\u8fd9\u6837\u6838\u5bf9'), 'database recovery button question should provide verification guidance');
assert.ok(recoveryButtonQuestion.actions.some((action) => action.filters?.searchKeyword === '\u6211\u7684\u6570\u636e\u5e93\u91cc\u6ca1\u6709\u5317\u4eac\u51fb\u5251\u8054\u8d5b\u7b2c\u4e00\u7ad9\uff0c\u4e3a\u4ec0\u4e48\u6ca1\u6709\u627e\u5230'), 'database recovery button question should preserve the original recovery question');

const originalCompetitions = context.__state.competitions;
context.__state.competitions = originalCompetitions.filter((competition) => competition.sportCode === 'RZSS2021040');
context.__state.competitionSearchCache = new Map();
const staleCompetitionName = context.buildAiAnswer('\u5317\u4eac\u51fb\u5251\u8054\u8d5b\u7b2c\u4e00\u7ad9');
assert.equal(staleCompetitionName.type, 'fallback', 'plain station-league queries should not silently open a stale old-year event');
assert.match(staleCompetitionName.title, /\u6ca1\u6709\u627e\u5230\u5b8c\u5168\u4e00\u81f4\u8d5b\u4e8b/, 'stale competition recovery should explain that the requested event is not directly found');
assert.match(staleCompetitionName.summary, /\u8fd9\u4e0d\u4ee3\u8868\u8d5b\u4e8b\u4e0d\u5b58\u5728/, 'stale competition recovery should distinguish missing records from non-existent events');
assert.ok(staleCompetitionName.evidence.some((row) => row.kind === '\u76f8\u8fd1\u8d5b\u4e8b' && row.sportCode === 'RZSS2021040'), 'stale competition recovery should still expose the old similar event as a source');
assert.ok(staleCompetitionName.actions.some((action) => action.sportCode === 'RZSS2021040'), 'stale competition recovery should let users inspect the old similar event if needed');
context.__state.competitions = originalCompetitions;
context.__state.competitionSearchCache = new Map();

const juneStats = context.buildAiAnswer('\u0032\u0030\u0032\u0036\u5e74\u0036\u6708\u5929\u6d25\u6709\u51e0\u573a\u6bd4\u8d5b');
assert.equal(juneStats.type, 'competition-stats', 'month-based regional query should route to competition stats');
assert.equal(juneStats.cards[0][1], '2 \u573a', 'AI competition stats should filter by month');
assert.equal(juneStats.cards.find(([label]) => label === '\u6708\u4efd')[1], '6\u6708', 'AI competition stats should expose the matched month');
assert.ok(juneStats.sections.some((section) => section.title === '\u884c\u52a8\u5224\u65ad'), 'AI competition stats should turn counts into next-step judgment');
assert.ok(juneStats.sections.some((section) => section.title === '\u8fd1\u671f\u53ef\u770b'), 'AI competition stats should expose actionable upcoming matches');
const statsPrematchAction = juneStats.actions.find((action) => action.prematchTemplateKind === 'prematch-pack');
assert.equal(statsPrematchAction.prematchSportCode, 'TJ2026JUNE', 'AI competition stats should open a prematch report for the nearest actionable competition');
const statsFollowAction = juneStats.actions.find((action) => action.followCompetitionCode);
assert.equal(statsFollowAction.followCompetitionCode, 'TJ2026JUNE', 'AI competition stats should offer the nearest actionable competition as a reminder');
const juneFilterAction = juneStats.actions.find((action) => action.filters);
assert.equal(JSON.stringify(juneFilterAction.filters), JSON.stringify({ year: '2026', month: '6', region: '\u5929\u6d25', status: '' }), 'AI competition stats action should preserve the matched filters');

const scaleStats = context.buildAiAnswer('\u54ea\u573a\u6bd4\u8d5b\u4eba\u6570\u6700\u591a\uff1f');
assert.equal(scaleStats.type, 'competition-ranking', 'competition scale query should route to competition ranking');
assert.equal(scaleStats.cards[0][1], '140 \u4eba\u6b21', 'AI competition scale answer should rank by actual entrant totals');
assert.equal(scaleStats.evidence[0].sportCode, 'BIG2026DONE', 'AI competition scale answer should cite the largest competition first');
assert.equal(scaleStats.actions.find((action) => action.sportCode)?.sportCode, 'BIG2026DONE', 'AI competition scale answer should open the largest competition directly');

const itemScaleStats = context.buildAiAnswer('\u54ea\u4e2a\u9879\u76ee\u4eba\u6570\u6700\u591a\uff1f');
assert.equal(itemScaleStats.type, 'competition-ranking', 'project scale query should route to competition ranking');
assert.equal(itemScaleStats.cards[0][1], 'U8 \u7537\u82b1', 'AI project scale answer should name the largest project');
assert.equal(itemScaleStats.cards[1][1], '75 \u4eba\u6b21', 'AI project scale answer should rank by project entrants');
assert.equal(itemScaleStats.evidence[0].eventCode, 'BIG2026DONE-U8MF', 'AI project scale answer should cite the largest event item first');
assert.equal(itemScaleStats.actions.find((action) => action.sportCode)?.sportCode, 'BIG2026DONE', 'AI project scale answer should open the parent competition directly');

const prematchReport = context.buildAiAnswer('\u0032\u0030\u0032\u0036\u5e74\u0036\u6708\u5929\u6d25\u8d5b\u524d\u60c5\u62a5');
assert.equal(prematchReport.type, 'prematch', 'prematch query should route to prematch intelligence');
assert.ok(prematchReport.cards.length <= 4, 'AI prematch reports should keep the first screen focused');
assert.ok(prematchReport.cards.some(([label, value]) => label === '\u62a5\u540d\u540d\u5355' && value === '38/200'), 'AI prematch reports should expose roster progress as one focused metric');
assert.ok(prematchReport.cards.some(([label, value]) => label === '\u5173\u6ce8\u5bf9\u8c61' && value === '1 \u4eba'), 'AI prematch reports should expose focused-object count');
assert.ok(prematchReport.sections.some((section) => section.title === '\u5173\u6ce8\u5bf9\u8c61'), 'AI prematch reports should show object-bound rows when a child or athlete is selected');
assert.ok(prematchReport.sections.find((section) => section.title === '\u5173\u6ce8\u5bf9\u8c61')?.rows.some((row) => row.includes('\u4eba\u6570\u6700\u591a\u9879\u76ee')), 'AI prematch reports should still include roster structure with a focused object');
assert.ok(prematchReport.sections.find((section) => section.title === '\u5173\u6ce8\u5bf9\u8c61')?.rows.some((row) => row.includes('\u62a5\u540d\u6700\u591a\u4ff1\u4e50\u90e8')), 'AI prematch reports should still highlight the most active registered club');
assert.ok(prematchReport.sections.find((section) => section.title === '\u5173\u6ce8\u5bf9\u8c61')?.rows.some((row) => row.includes('\u8521\u5ef7\u5f67') && row.includes('\u5df2\u5728\u62a5\u540d\u540d\u5355')), 'AI prematch reports should identify when the selected child is already in the roster');
assert.ok(prematchReport.sections.find((section) => section.title === '\u4f18\u5148\u5173\u6ce8')?.rows.some((row) => row.includes('\u5173\u6ce8\u5bf9\u8c61') || row.includes('\u62a5\u540d\u540d\u5355')), 'AI prematch reports should include actionable preparation guidance');
const prematchReportAction = prematchReport.actions.find((action) => action.prematchTemplateKind === 'prematch-pack');
assert.equal(prematchReportAction.prematchSportCode, 'TJ2026JUNE', 'AI prematch reports should open a report scoped to the nearest matched competition');

const savedChildId = context.__state.selectedChildId;
const savedFollowedAthletes = context.__state.followedAthletes;
context.__state.selectedChildId = '';
context.__state.followedAthletes = [];
const noFocusPrematchReport = context.buildAiAnswer('\u0032\u0030\u0032\u0036\u5e74\u0036\u6708\u5929\u6d25\u8d5b\u524d\u60c5\u62a5');
assert.equal(noFocusPrematchReport.type, 'prematch', 'prematch query without a focused athlete should still route to prematch intelligence');
assert.ok(noFocusPrematchReport.cards.some(([label, value]) => label === '\u5173\u6ce8\u5bf9\u8c61' && value === '-'), 'prematch without a focused object should show no focused-object count');
assert.ok(noFocusPrematchReport.sections.some((section) => section.title === '\u8d5b\u524d\u91cd\u70b9'), 'prematch without a focused object should stay at event and roster level');
assert.ok(noFocusPrematchReport.sections.find((section) => section.title === '\u8d5b\u524d\u91cd\u70b9')?.rows.some((row) => row.includes('\u62a5\u540d\u7ed3\u6784')), 'prematch without a focused object should describe roster structure');
assert.ok(!noFocusPrematchReport.sections.find((section) => section.title === '\u8d5b\u524d\u91cd\u70b9')?.rows.some((row) => row.includes('\u8521\u5ef7\u5f67') || row.includes('\u5386\u53f2\u5bf9\u624b')), 'prematch without a focused object must not show athlete-specific opponent rows');
assert.ok(noFocusPrematchReport.actions.some((action) => action.label === '\u5148\u5173\u6ce8\u5b69\u5b50\u6216\u5b66\u5458' && action.mainTab === 'my'), 'prematch without a focused object should show a visible follow-object action');
context.__state.selectedChildId = savedChildId;
context.__state.followedAthletes = savedFollowedAthletes;

const broadRegistrationReport = context.buildAiAnswer('\u5929\u6d25\u8fd1\u671f\u62a5\u540d\u60c5\u51b5');
assert.equal(broadRegistrationReport.type, 'prematch', 'broad registration-status questions should route to prematch intelligence');
assert.equal(broadRegistrationReport.title, '\u5929\u6d25\u8d5b\u524d\u63d0\u9192', 'broad prematch title should not expose all-year or all-month filler text');
assert.ok(!/(\u5168\u90e8\u5e74\u4efd|\u5168\u90e8\u6708\u4efd)/.test(`${broadRegistrationReport.title}${broadRegistrationReport.summary}`), 'broad prematch copy should use natural scope wording');
assert.equal(broadRegistrationReport.cards[0][1], '3 \u573a', 'broad registration-status questions should include upcoming prematch competitions, not only registration status');
assert.ok(broadRegistrationReport.sections.some((section) => section.title === '\u4f18\u5148\u5173\u6ce8'), 'broad registration-status questions should produce actionable competition rows');

const strictRegistrationReport = context.buildAiAnswer('\u5929\u6d25\u62a5\u540d\u4e2d\u7684\u6bd4\u8d5b');
assert.equal(strictRegistrationReport.type, 'prematch', 'explicit registration-only questions should route to prematch intelligence');
assert.equal(strictRegistrationReport.cards[0][1], '2 \u573a', 'explicit registration-only questions should keep the registration status filter');

const currentYear = String(new Date().getFullYear());
assert.equal(context.detectYearInQuery('\u4eca\u5e74\u5929\u6d25\u6709\u51e0\u573a\u6bd4\u8d5b'), currentYear, 'AI year detection should support current-year wording');
const broadScaleStats = context.buildAiAnswer('\u54ea\u573a\u6bd4\u8d5b\u4eba\u6570\u6700\u591a\uff1f');
assert.ok(!/(\u5168\u90e8\u5e74\u4efd|\u5168\u90e8\u6708\u4efd)/.test(`${broadScaleStats.title}${broadScaleStats.summary}`), 'broad competition stats copy should not expose all-year or all-month filler text');
assert.equal(context.detectStatusInQuery('\u6cb3\u5317\u6ca7\u5dde\u6b63\u5728\u6bd4\u8d5b\u7684\u8d5b\u4e8b'), 'live', 'AI status detection should understand current competition wording');
assert.equal(context.detectStatusInQuery('\u6cb3\u5317\u6ca7\u5dde\u6bd4\u8d5b\u4e2d\u7684\u8d5b\u4e8b'), 'live', 'AI status detection should understand in-competition wording');
assert.equal(context.detectStatusInQuery('\u6cb3\u5317\u6ca7\u5dde\u6b63\u5728\u8fdb\u884c\u7684\u8d5b\u4e8b'), 'live', 'AI status detection should understand in-progress wording');
const liveStatsReport = context.buildAiAnswer('\u6cb3\u5317\u6ca7\u5dde\u6b63\u5728\u6bd4\u8d5b\u7684\u8d5b\u4e8b');
assert.equal(liveStatsReport.type, 'competition-stats', 'current competition wording should route to competition statistics');
assert.ok(liveStatsReport.evidence.some((row) => row.sportCode === 'CANGZHOU2026LIVE'), 'current competition stats should cite the matched live competition');
assert.ok(liveStatsReport.actions.some((action) => action.filters?.status === 'live'), 'current competition stats action should preserve the live status filter');

const originalAthleteSearchIndex = context.__state.athleteSearchIndex;
const originalClubSearchIndex = context.__state.clubSearchIndex;
const originalAthletesById = context.__state.athletesById;
const originalClubsById = context.__state.clubsById;
context.__state.athleteSearchIndex = [];
context.__state.clubSearchIndex = [];
context.__state.athletesById = {};
context.__state.clubsById = {};
context.__state.dataCoverage = { athletes: 27264, clubs: 825 };
assert.equal(
  JSON.stringify(context.businessMetricRows().slice(1, 3)),
  JSON.stringify([['选手画像', '27264 人'], ['俱乐部画像', '825 个']]),
  'business metric cards must use aggregate entity coverage when full indexes are not hydrated',
);
assert.ok(context.businessPriorityRows().some((row) => row.includes('825 个俱乐部画像')), 'business priority rows must use aggregate club coverage');
assert.ok(context.businessProductOpportunityRows().some((row) => row.includes('27264 个选手画像')), 'business opportunity rows must use aggregate athlete coverage');
assert.ok(context.businessProductOpportunityRows().some((row) => row.includes('825 个俱乐部画像')), 'business opportunity rows must use aggregate club coverage');
assert.ok(context.businessMonetizationRows().some((row) => row.includes('825 个俱乐部画像')), 'business monetization rows must use aggregate club coverage');
context.__state.athleteSearchIndex = originalAthleteSearchIndex;
context.__state.clubSearchIndex = originalClubSearchIndex;
context.__state.athletesById = originalAthletesById;
context.__state.clubsById = originalClubsById;
delete context.__state.dataCoverage;

const businessCoverageReport = context.buildAiAnswer('这些击剑数据能产生什么商业价值');
assert.equal(businessCoverageReport.type, 'business-insight', 'business-value questions should route to business insight');
const prematchEvidence = businessCoverageReport.evidence.filter((row) => row.kind === '赛前机会');
assert.ok(prematchEvidence.length, 'business insight should cite actionable prematch opportunities when available');
assert.ok(!prematchEvidence.some((row) => row.sportCode === 'TJ2026REG'), 'business insight should not treat past registration rows as prematch opportunities');
assert.ok(prematchEvidence.every((row) => context.isActionablePrematchCompetition(context.__state.competitions.find((competition) => competition.sportCode === row.sportCode))), 'business insight prematch evidence must use actionable future or live competitions');

for (const item of context.aiAcceptanceQueryCases()) {
  const report = context.buildAiAnswer(item.query);
  assert.equal(report.type, item.expectedType, `${item.query} should return ${item.expectedType}`);
  assert.ok(report.cards?.length, `${item.query} should return metric cards`);
  assertRunnableActions(report, item.query);
  if (report.type !== 'growth') {
    assert.ok(report.evidence?.length, `${item.query} should include clickable evidence`);
  }
}

const growthReport = context.buildAiAnswer('蔡廷彧最近几场有没有进步');
assert.equal(growthReport.type, 'growth', 'athlete growth query with 最近 must not route to prematch');
assert.equal(growthReport.evidence[0]?.athleteId, 'cai', 'growth reports should make the athlete profile the primary evidence target');
assert.ok(growthReport.evidence.some((row) => row.eventCode), 'growth reports should keep competition records after the athlete profile');

const yearlyGrowthReport = context.buildAiAnswer('蔡廷彧2025和2026年的表现有什么变化');
assert.equal(yearlyGrowthReport.type, 'growth', 'yearly athlete change queries should route to growth');
assert.match(yearlyGrowthReport.summary, /2025.*2026|2026.*2025/, 'yearly athlete change summaries should expose the requested years on the first screen');
assert.ok(yearlyGrowthReport.sections.some((section) => section.title === '年度对比'), 'yearly athlete change queries should include a yearly comparison section');
assert.ok(yearlyGrowthReport.sections.find((section) => section.title === '年度对比')?.rows.some((row) => row.includes('2025')), 'yearly athlete change queries should mention the 2025 record');
assert.ok(yearlyGrowthReport.sections.find((section) => section.title === '年度对比')?.rows.some((row) => row.includes('2026')), 'yearly athlete change queries should mention the 2026 record');

const namedGrowthReport = context.buildAiAnswer('帮我生成蔡廷彧成长报告');
assert.equal(namedGrowthReport.type, 'growth', 'named growth report requests should prioritize the athlete over a generic report template');
assert.match(namedGrowthReport.title, /蔡廷彧/, 'named growth report requests should keep the athlete name in the result');

const clubReport = context.buildAiAnswer('山东小众体育 U8 男花怎么样');
assert.equal(clubReport.type, 'club');
assert.match(clubReport.title, /U8 男花/, 'club scoped query should preserve natural project hints in title');
assert.doesNotMatch(clubReport.title, /U8 男 花/, 'club scoped query should not split gender and weapon in the visible title');
assert.ok(clubReport.sections.some((section) => section.title === '重点项目'), 'club scoped query should show focused projects');
assert.equal(clubReport.evidence[0].clubId, 'club-sdzx', 'club scoped query should make the stable club profile the primary evidence target');
assert.ok(
  clubReport.evidence.some((row) => row.eventCode === 'CLUB-U8MF' && /U8.*男.*花/.test(row.label)),
  'club scoped query should keep matching project evidence as a supporting source',
);


const recruitingReport = context.buildAiAnswer('山东小众体育招生怎么讲');
assert.equal(recruitingReport.type, 'club-recruiting', 'club recruiting questions should route to recruiting display');
assert.ok(recruitingReport.sections.some((section) => section.title === '对外可讲'), 'club recruiting report should include parent-facing talking points');
assert.ok(recruitingReport.evidence.some((row) => row.kind === '招生素材来源'), 'club recruiting report should cite concrete event evidence');
assert.ok(recruitingReport.actions.some((action) => action.clubId === 'club-sdzx'), 'club recruiting report should open the club recruiting card');
assert.ok(recruitingReport.actions.some((action) => action.coachSegmentationClubId === 'club-sdzx'), 'club recruiting report should connect to coach segmentation');

const comparisonReport = context.buildAiAnswer('\u5206\u6790\u9a6c\u6d88\u548c\u9676\u5609\u6708\u7684\u5bf9\u6218\u60c5\u51b5');
assert.equal(comparisonReport.type, 'comparison', 'athlete comparison query should route to comparison report');
assert.ok(comparisonReport.evidence.some((row) => row.athleteId === 'ma'), 'athlete comparison should cite the first athlete profile as evidence');
assert.ok(comparisonReport.evidence.some((row) => row.athleteId === 'tao'), 'athlete comparison should cite the second athlete profile as evidence');
assert.ok(comparisonReport.evidence.some((row) => row.eventCode), 'athlete comparison should keep shared or recent project records as evidence');
assert.equal(
  JSON.stringify(comparisonReport.sections.map((section) => section.title)),
  JSON.stringify(['\u76f4\u63a5\u4ea4\u624b', '\u5171\u540c\u8d5b\u4e8b', '\u8fd1\u51b5\u5dee\u8ddd', '\u9700\u8981\u7559\u610f']),
  'athlete comparison report should use the prematch analysis section structure',
);
assert.ok(
  comparisonReport.sections.find((section) => section.title === '\u9700\u8981\u7559\u610f').rows.length,
  'athlete comparison report should include actionable caution rows',
);

const savedAthleteDetailsForComparison = context.__state.athletesById;
const savedAthleteSearchForComparison = context.__state.athleteSearchIndex;
context.__state.athletesById = { tao };
context.__state.athleteSearchIndex = [ma, tao];
const mixedPoolComparisonReport = context.buildAiAnswer('\u5206\u6790\u9a6c\u6f47\u548c\u9676\u5609\u6708\u7684\u5bf9\u6218\u60c5\u51b5');
assert.equal(mixedPoolComparisonReport.type, 'comparison', 'athlete comparison intent must not fall back to growth when one athlete is only in the search index');
assert.match(mixedPoolComparisonReport.title, /\u9a6c\u6f47/);
assert.match(mixedPoolComparisonReport.title, /\u9676\u5609\u6708/);
context.__state.athletesById = savedAthleteDetailsForComparison;
context.__state.athleteSearchIndex = savedAthleteSearchForComparison;

const clubComparisonReport = context.buildAiAnswer('\u770b2025\u548c2026\u5e74\uff0cU10\u82b1\u5251\u7537\u5b50\u548c\u5973\u5b50\uff0c\u5317\u4eac\u91d1\u77f3\u662f\u4e0d\u662f\u6bd4\u5317\u4eac\u827e\u9c81\u7279\u66f4\u597d');
assert.equal(clubComparisonReport.type, 'club-comparison', 'two-club strength questions should route to club comparison');
assert.match(clubComparisonReport.title, /\u5317\u4eac\u91d1\u77f3 vs \u5317\u4eac\u827e\u9c81\u7279/, 'club comparison title should preserve the order from the user question');
assert.match(clubComparisonReport.summary, /\u5317\u4eac\u91d1\u77f3/, 'club comparison should name the leading club in the summary');
assert.match(clubComparisonReport.summary, /\u6210\u7ee9\u79ef\u7d2f\u4e0a/, 'club comparison should explain accumulated result signals separately');
assert.match(clubComparisonReport.summary, /\u6548\u7387/, 'club comparison should explain the efficiency signal separately');
assert.ok(clubComparisonReport.reasons?.some((row) => /\u89c4\u6a21/.test(row) && /\u5317\u4eac\u91d1\u77f3/.test(row) && /\u5317\u4eac\u827e\u9c81\u7279/.test(row)), 'club comparison should expose a user-facing scale reason');
assert.ok(clubComparisonReport.reasons?.some((row) => /\u6210\u7ee9/.test(row) && /\u524d\u516b/.test(row) && /\u5956\u724c/.test(row)), 'club comparison should expose top-8 and medal reasons');
assert.ok(clubComparisonReport.reasons?.some((row) => /\u5206\u9879/.test(row) && /\u7537\u5b50/.test(row) && /\u5973\u5b50/.test(row)), 'club comparison should explain gender-split differences when both genders are requested');
assert.match(clubComparisonReport.cards[0][1], /2025\u30012026.*U10.*\u82b1\u5251.*\u7537\u5b50 \/ \u5973\u5b50/, 'club comparison should expose the requested years, age, weapon and gender scope');
assert.ok(clubComparisonReport.cards.some(([label]) => label === '\u6210\u7ee9\u79ef\u7d2f'), 'club comparison should show an accumulated result card');
assert.ok(clubComparisonReport.cards.some(([label]) => label === '\u6548\u7387\u4fe1\u53f7'), 'club comparison should show an efficiency signal card');
assert.ok(clubComparisonReport.cards.some(([label, value]) => label === '\u7537\u5b50\u7ed3\u8bba' && /\u5317\u4eac\u91d1\u77f3/.test(value)), 'club comparison should show a male result card');
assert.ok(clubComparisonReport.cards.some(([label, value]) => label === '\u5973\u5b50\u7ed3\u8bba' && /\u5317\u4eac\u827e\u9c81\u7279/.test(value)), 'club comparison should show a female result card');
assert.ok(clubComparisonReport.cards.some(([label, value]) => label === '\u5408\u8ba1\u7ed3\u8bba' && /\u5317\u4eac\u91d1\u77f3/.test(value)), 'club comparison should show a total result card');
assert.match(
  clubComparisonReport.cards.slice(0, 4).map(([label]) => label).join('|'),
  /^\u5bf9\u6bd4\u8303\u56f4\|\u7537\u5b50\u7ed3\u8bba\|\u5973\u5b50\u7ed3\u8bba\|\u5408\u8ba1\u7ed3\u8bba$/,
  'club comparison first-screen cards should prioritize requested male, female and total conclusions',
);
assert.ok(!clubComparisonReport.cards.some(([label]) => label === '\u5206\u6790\u53e3\u5f84'), 'club comparison should not expose internal analysis scope as a card');
assert.ok(!clubComparisonReport.sections.some((section) => /(\u5206\u6790\u53e3\u5f84|\u5224\u65ad\u53e3\u5f84|\u540e\u7eed|\u4e0b\u4e00\u6b65)/.test(section.title)), 'club comparison should not expose internal workflow labels as sections');
assert.ok(clubComparisonReport.sections.some((section) => section.title === '\u6570\u91cf\u5224\u65ad'), 'club comparison should include a dedicated quantity judgment section');
assert.ok(clubComparisonReport.sections.find((section) => section.title === '\u6570\u91cf\u5224\u65ad')?.rows.some((row) => /\u4eba\u6b21/.test(row) && /\u524d\u516b/.test(row) && /\u5956\u724c/.test(row) && /\u51a0\u519b/.test(row)), 'club comparison quantity judgment should expose participation, top-8, medal and champion counts');
assert.ok(clubComparisonReport.sections.some((section) => section.title === '\u5bf9\u6bd4\u7ed3\u8bba'), 'club comparison should include user-facing comparison rows');
assert.ok(clubComparisonReport.sections.find((section) => section.title === '\u5bf9\u6bd4\u7ed3\u8bba')?.rows.some((row) => row.includes('\u7537\u5b50') && row.includes('\u5317\u4eac\u91d1\u77f3\u9886\u5148')), 'club comparison should split male foil judgment');
assert.ok(clubComparisonReport.sections.find((section) => section.title === '\u5bf9\u6bd4\u7ed3\u8bba')?.rows.some((row) => row.includes('\u5973\u5b50') && row.includes('\u5317\u4eac\u827e\u9c81\u7279\u9886\u5148')), 'club comparison should split female foil judgment');
assert.ok(clubComparisonReport.sections.find((section) => section.title === '\u5bf9\u6bd4\u7ed3\u8bba')?.rows.some((row) => /\u524d\u516b\u7387.*\u5956\u724c\u7387/.test(row)), 'club comparison should include top-8 and medal-rate evidence in conclusion rows');
assert.ok(!/训练质量更好/.test(`${clubComparisonReport.summary}${clubComparisonReport.sections.map((section) => section.rows.join(' ')).join(' ')}`), 'club comparison should not infer training quality from participation counts');
assert.ok(clubComparisonReport.evidence.some((row) => row.kind === '\u4ff1\u4e50\u90e8\u6210\u7ee9'), 'club comparison should cite concrete event evidence with customer-facing source labels');
assert.ok(clubComparisonReport.evidence.some((row) => row.clubId === 'club-jinshi'), 'club comparison should cite the first club profile as evidence');
assert.ok(clubComparisonReport.evidence.some((row) => row.clubId === 'club-airuite'), 'club comparison should cite the second club profile as evidence');
assert.ok(clubComparisonReport.evidence.some((row) => row.mainTab === 'competitions' && row.filters), 'club comparison should keep a filtered competition list as evidence');
assert.ok(clubComparisonReport.evidence.length >= 4, 'club comparison should keep enough source records for traceable review');
assert.ok(!clubComparisonReport.evidence.some((row) => row.kind === '\u4ff1\u4e50\u90e8\u5bf9\u6bd4\u8bc1\u636e'), 'club comparison evidence must not expose internal source labels');
assert.ok(clubComparisonReport.actions.some((action) => action.clubId === 'club-jinshi'), 'club comparison should link to the first club profile');
assert.ok(clubComparisonReport.actions.some((action) => action.clubId === 'club-airuite'), 'club comparison should link to the second club profile');
assert.ok(clubComparisonReport.actions.some((action) => action.query && /\u67e5\u770bU10\u82b1\u5251\u7537\u5973\u5bf9\u6bd4/.test(action.label)), 'club comparison should offer a scoped gender-split follow-up');
assert.ok(clubComparisonReport.actions.some((action) => /\u5317\u4eac\u91d1\u77f3/.test(action.query || '') && /\u5317\u4eac\u827e\u9c81\u7279/.test(action.query || '')), 'club comparison follow-up should preserve both club names');

const openScopeClubComparison = context.buildAiAnswer('\u5317\u4eac\u91d1\u77f3\u548c\u5317\u4eac\u827e\u9c81\u7279U10\u7537\u82b1\u8c01\u66f4\u5f3a');
assert.equal(openScopeClubComparison.type, 'club-comparison', 'club comparison should support scoped questions without an explicit year');
assert.ok(!/(\u5168\u90e8\u5e74\u4efd|\u5168\u90e8\u5251\u79cd|\u5168\u90e8\u6027\u522b)/.test(`${openScopeClubComparison.summary}${openScopeClubComparison.cards.map((row) => row.join(' ')).join(' ')}`), 'club comparison should not expose all-scope filler labels');

const abbreviatedClubComparison = context.buildAiAnswer('\u5317\u4eac\u91d1\u77f3\u548c\u827e\u9c81\u7279U10\u7537\u82b1\u8c01\u66f4\u5f3a');
assert.equal(abbreviatedClubComparison.type, 'club-comparison', 'club comparison should recover abbreviated club names');
assert.ok(abbreviatedClubComparison.title.includes('\u5317\u4eac\u827e\u9c81\u7279'), 'abbreviated club comparison should resolve the full club name');
assert.ok(abbreviatedClubComparison.actions.some((action) => action.clubId === 'club-airuite'), 'abbreviated club comparison should link to the recovered club');

const savedClubSearchIndexForComparison = context.__state.clubSearchIndex;
context.__state.clubSearchIndex = [];
const clubsByIdOnlyComparison = context.buildAiAnswer('\u770b2025\u548c2026\u5e74\uff0cU10\u82b1\u5251\uff0c\u7537\u5b50\u548c\u5973\u5b50\uff0c\u5317\u4eac\u91d1\u77f3\u662f\u4e0d\u662f\u6bd4\u5317\u4eac\u827e\u9c81\u7279\u6210\u7ee9\u66f4\u597d\uff0c\u5148\u7528\u6570\u91cf\u5224\u65ad');
assert.equal(clubsByIdOnlyComparison.type, 'club-comparison', 'club comparison should work from clubsById even when the club search index is not ready');
assert.ok(clubsByIdOnlyComparison.evidence.some((row) => row.clubId === 'club-jinshi'), 'clubsById fallback should cite the first club');
assert.ok(clubsByIdOnlyComparison.evidence.some((row) => row.clubId === 'club-airuite'), 'clubsById fallback should cite the second club');
context.__state.clubSearchIndex = savedClubSearchIndexForComparison;

const childInvestmentFallback = context.buildAiAnswer('\u5b69\u5b50\u51fb\u5251\u503c\u4e0d\u503c\u5f97\u7ee7\u7eed');
assert.equal(childInvestmentFallback.type, 'fallback', 'general child investment questions should stay in recovery when no child is named');
assert.match(childInvestmentFallback.title, /\u5148\u9009\u62e9\u5b69\u5b50\u6216\u9009\u624b/, 'child investment fallback should ask for the child or athlete first');
assert.ok(childInvestmentFallback.actions.some((action) => action.mainTab === 'my'), 'child investment fallback should route users to manage followed children');
assert.equal(childInvestmentFallback.actions[0]?.mainTab, 'my', 'child investment fallback should keep the follow-object action visible in the first action slot');
assert.ok(childInvestmentFallback.actions.some((action) => action.query === '\u5929\u6d25\u8fd1\u671f\u62a5\u540d\u60c5\u51b5'), 'child investment fallback should offer a runnable rewrite suggestion');
assert.ok(!/(\u6682\u672a\u8bc6\u522b|\u5206\u6790\u53e3\u5f84|\u540e\u7eed)/.test(`${childInvestmentFallback.title}${childInvestmentFallback.summary}`), 'fallback copy should avoid internal or dead-end wording');

const missingCompetitionFallback = context.buildAiAnswer('\u0032\u0030\u0032\u0037\u5e74\u5317\u4eac\u51fb\u5251\u8054\u8d5b\u7b2c\u4e00\u7ad9');
assert.equal(missingCompetitionFallback.type, 'fallback', 'year-mismatched competition names should not silently open another year');
assert.match(missingCompetitionFallback.title, /\u6ca1\u6709\u627e\u52302027\u5e74\u5b8c\u5168\u4e00\u81f4\u8d5b\u4e8b/, 'missing competition fallback should explain the missing competition in user-facing copy');
assert.match(missingCompetitionFallback.summary, /\u8fd9\u4e0d\u4ee3\u8868\u8d5b\u4e8b\u4e0d\u5b58\u5728/, 'missing competition fallback should distinguish missing records from non-existent events');
assert.ok(missingCompetitionFallback.cards.some(([label, value]) => label === '\u8d5b\u4e8b\u8bb0\u5f55' && value === '\u672a\u5b8c\u5168\u547d\u4e2d'), 'missing competition fallback should expose event-record coverage');
assert.ok(missingCompetitionFallback.cards.some(([label, value]) => label === '\u9879\u76ee\u540d\u5355' && value === '\u786e\u8ba4\u540e\u67e5\u770b'), 'missing competition fallback should expose project-list coverage with an action');
assert.ok(missingCompetitionFallback.cards.some(([label, value]) => label === '\u62a5\u540d\u540d\u5355' && value === '\u786e\u8ba4\u540e\u67e5\u770b'), 'missing competition fallback should expose roster coverage with an action');
assert.ok(missingCompetitionFallback.cards.some(([label, value]) => label === '\u8d5b\u679c\u6210\u7ee9' && value === '\u786e\u8ba4\u540e\u67e5\u770b'), 'missing competition fallback should expose result coverage with an action');
assert.ok(missingCompetitionFallback.sections.some((section) => section.title === '\u53ef\u67e5\u5185\u5bb9'), 'missing competition fallback should show a user-facing coverage section');
assert.ok(missingCompetitionFallback.sections.find((section) => section.title === '\u53ef\u67e5\u5185\u5bb9')?.rows.some((row) => /\u9879\u76ee\u540d\u5355/.test(row) && /\u786e\u8ba4\u8d5b\u4e8b\u540d\u79f0/.test(row)), 'missing competition coverage should explain that project rows depend on confirming the event name first');
assert.ok(missingCompetitionFallback.sections.some((section) => section.title === '\u53ef\u4ee5\u8fd9\u6837\u6838\u5bf9'), 'missing competition fallback should show a user-facing diagnosis section');
assert.ok(missingCompetitionFallback.sections.find((section) => section.title === '\u53ef\u4ee5\u8fd9\u6837\u6838\u5bf9')?.rows.some((row) => /\u5730\u65b9\u8054\u8d5b|\u76f8\u8fd1/.test(row)), 'missing competition fallback should explain local league or similar-name checks');
assert.ok(missingCompetitionFallback.cards.some(([label, value]) => label === '\u5e74\u4efd' && value === '2027'), 'missing competition fallback should preserve parsed year');
assert.ok(missingCompetitionFallback.cards.some(([label, value]) => label === '\u76f8\u8fd1\u8d5b\u4e8b' && /[12] \u573a/.test(value)), 'missing competition fallback should tell users when another year has a similar competition');
assert.ok(missingCompetitionFallback.actions.some((action) => action.filters?.year === '2027' && action.filters?.region === '\u5317\u4eac'), 'missing competition fallback should offer a filtered database path');
assert.ok(missingCompetitionFallback.actions.some((action) => action.filters?.searchKeyword === '\u0032\u0030\u0032\u0037\u5e74\u5317\u4eac\u51fb\u5251\u8054\u8d5b\u7b2c\u4e00\u7ad9'), 'missing competition fallback should preserve the original question as a database search keyword');
assert.ok(missingCompetitionFallback.actions.some((action) => action.sportCode === 'BJLEAGUE2026S1'), 'missing competition fallback should let users open the nearest similar competition');
assert.ok(missingCompetitionFallback.actions.some((action) => action.query), 'missing competition fallback should offer a runnable follow-up question');
assert.ok(missingCompetitionFallback.evidence.some((row) => row.kind === '\u76f8\u8fd1\u8d5b\u4e8b' && row.sportCode === 'BJLEAGUE2026S1'), 'missing competition fallback should cite similar competitions as source evidence');
assert.ok(!/(\u5bfc\u5165|\u7ee7\u7eed\u751f\u6210|\u540e\u7eed|\u6570\u636e\u8fb9\u754c|\u6682\u672a\u8bc6\u522b)/.test(`${missingCompetitionFallback.title}${missingCompetitionFallback.summary}${missingCompetitionFallback.sections.map((section) => section.rows.join('')).join('')}`), 'missing competition fallback should use user-facing collection copy');

const noYearMissingCompetitionFallback = context.buildAiAnswer('\u5317\u4eac\u51fb\u5251\u8054\u8d5b\u7b2c\u4e8c\u7ad9');
assert.equal(noYearMissingCompetitionFallback.type, 'fallback', 'specific event-name queries without a year should not be treated as regional competition stats');
assert.match(noYearMissingCompetitionFallback.title, /\u6ca1\u6709\u627e\u5230\u5b8c\u5168\u4e00\u81f4\u8d5b\u4e8b/, 'specific missing event names should explain the event is not currently found');
assert.match(noYearMissingCompetitionFallback.summary, /\u8fd9\u4e0d\u4ee3\u8868\u8d5b\u4e8b\u4e0d\u5b58\u5728/, 'specific missing event names should distinguish missing records from non-existent events');
assert.ok(noYearMissingCompetitionFallback.sections.some((section) => section.title === '\u53ef\u4ee5\u8fd9\u6837\u6838\u5bf9'), 'specific missing event names should show verification guidance');
assert.ok(noYearMissingCompetitionFallback.actions.some((action) => action.filters?.region === '\u5317\u4eac'), 'specific missing event names should still offer a filtered database path');
assert.ok(!/(\u8d5b\u4e8b\u7edf\u8ba1|\u5317\u4eac\u8d5b\u4e8b\u7edf\u8ba1|\u6682\u672a\u8bc6\u522b|\u5206\u6790\u53e3\u5f84|\u540e\u7eed)/.test(`${noYearMissingCompetitionFallback.title}${noYearMissingCompetitionFallback.summary}`), 'specific missing event names should avoid statistics and internal wording');

const exactCompetitionWithSameYearNoise = context.detectCompetitionInQuery('\u0032\u0030\u0032\u0036\u5e74\u5317\u4eac\u51fb\u5251\u8054\u8d5b\u7b2c\u4e00\u7ad9');
assert.equal(exactCompetitionWithSameYearNoise?.sportCode, 'BJLEAGUE2026S1', 'competition lookup must not match a random same-year event when the name points elsewhere');

const fuzzyObjectFallback = context.buildAiAnswer('\u5c0f\u4f17');
assert.equal(fuzzyObjectFallback.type, 'fallback', 'short incomplete object queries should enter guided recovery');
assert.match(fuzzyObjectFallback.title, /\u9009\u62e9\u4f60\u60f3\u770b\u7684\u5bf9\u8c61/, 'fuzzy fallback should ask the user to confirm a specific object');
assert.ok(fuzzyObjectFallback.evidence.some((row) => row.kind === '\u5251\u9986' && row.clubId === 'club-sdzx'), 'fuzzy fallback should surface matching club candidates');
assert.ok(fuzzyObjectFallback.actions.some((action) => action.clubId === 'club-sdzx'), 'fuzzy fallback should let users open the matching club');
assert.equal(fuzzyObjectFallback.actions[0]?.clubId, 'club-sdzx', 'club-like fuzzy fallback should prioritize the matching club action');
assert.ok(fuzzyObjectFallback.actions.slice(0, 3).some((action) => action.filters?.searchKeyword === '\u5c0f\u4f17'), 'fuzzy fallback should keep the original text available as a database search action');
assert.ok(fuzzyObjectFallback.actions.some((action) => action.query && /\u5c71\u4e1c\u5c0f\u4f17\u4f53\u80b2/.test(action.query)), 'fuzzy fallback should offer a runnable club-analysis rewrite');
assert.equal(fuzzyObjectFallback.evidence[0]?.clubId, 'club-sdzx', 'club-like fuzzy fallback should show the matching club first');
assert.ok(fuzzyObjectFallback.sections?.some((section) => section.title === '\u53ef\u4ee5\u5148\u786e\u8ba4'), 'fuzzy fallback should explain the candidate choices');
assert.ok(!fuzzyObjectFallback.cards.some(([, value]) => /^0 /.test(value)), 'fuzzy fallback should not show zero-count candidate categories');

const singleSurnameFallback = context.buildAiAnswer('\u8521');
assert.equal(singleSurnameFallback.type, 'fallback', 'single-character surname queries should stay in guided recovery');
assert.ok(singleSurnameFallback.evidence.some((row) => row.kind === '\u9009\u624b' && row.athleteId === 'cai'), 'single-character surname recovery should surface matching athletes');
assert.ok(singleSurnameFallback.actions.some((action) => action.athleteId === 'cai'), 'single-character surname recovery should let users open the matching athlete');
assert.ok(singleSurnameFallback.actions.some((action) => action.query && /\u8521\u5ef7\u5f67/.test(action.query)), 'single-character surname recovery should offer a runnable growth question');
assert.ok(!/(\u6682\u672a\u8bc6\u522b|\u5206\u6790\u53e3\u5f84|\u540e\u7eed)/.test(`${singleSurnameFallback.title}${singleSurnameFallback.summary}`), 'single-character surname recovery should avoid dead-end wording');
assert.ok(!singleSurnameFallback.cards.some(([, value]) => /^0 /.test(value)), 'single-character surname recovery should not show zero-count candidate categories');

const genericFallback = context.buildAiAnswer('\u968f\u4fbf\u770b\u770b');
assert.equal(genericFallback.type, 'fallback', 'generic unclear questions should stay in guided recovery');
assert.equal(genericFallback.actions[0]?.mainTab, 'competitions', 'generic fallback should keep the database recovery action visible in the first action slot');
assert.ok(genericFallback.actions.slice(0, 3).some((action) => action.mainTab === 'competitions'), 'generic fallback first-screen actions must include the database path');
assert.ok(genericFallback.actions.slice(0, 3).some((action) => action.query), 'generic fallback first-screen actions must still include a runnable rewritten question');
assert.ok(!/(\u6682\u672a\u8bc6\u522b|\u5206\u6790\u53e3\u5f84|\u540e\u7eed)/.test(`${genericFallback.title}${genericFallback.summary}`), 'generic fallback copy should avoid internal or dead-end wording');

const capabilityGuide = context.buildAiAnswer('\u6211\u60f3\u770b\u770b\u8fd9\u4e2a\u4ea7\u54c1\u80fd\u505a\u4ec0\u4e48');
assert.equal(capabilityGuide.type, 'capability-guide', 'generic exploratory questions should route to a capability guide, not a dead-end fallback');
assert.ok(capabilityGuide.cards?.some(([label]) => label === '\u8d5b\u4e8b'), 'capability guide should expose competition coverage');
assert.ok(capabilityGuide.cards?.some(([label]) => label === '\u9009\u624b'), 'capability guide should expose athlete coverage');
assert.ok(capabilityGuide.sections?.some((section) => section.title === '\u5e38\u7528\u95ee\u9898'), 'capability guide should explain useful question patterns');
assert.ok(capabilityGuide.actions?.some((action) => action.query === '\u0032\u0030\u0032\u0036\u5e74\u5929\u6d25\u6709\u51e0\u573a\u6bd4\u8d5b'), 'capability guide should offer a runnable competition-stat example');
assert.ok(capabilityGuide.actions?.some((action) => action.query?.includes('\u6700\u8fd1\u6709\u6ca1\u6709\u8fdb\u6b65')), 'capability guide should offer a runnable growth example');
assert.ok(capabilityGuide.evidence?.some((row) => row.kind === '\u8d5b\u4e8b\u6570\u636e'), 'capability guide should keep traceable data sources');
assert.ok(!/(\u6682\u672a\u8bc6\u522b|\u5206\u6790\u53e3\u5f84|\u540e\u7eed|\u6570\u636e\u8fb9\u754c)/.test(`${capabilityGuide.title}${capabilityGuide.summary}`), 'capability guide copy should avoid dead-end or internal wording');

const officialDirectoryReport = context.buildAiAnswer('\u80fd\u67e5\u6559\u7ec3\u5458\u548c\u88c1\u5224\u5458\u5417');
assert.equal(officialDirectoryReport.type, 'official-directory', 'coach and referee questions should route to personnel availability instead of generic fallback');
assert.match(officialDirectoryReport.title, /\u6559\u7ec3\u5458\u548c\u88c1\u5224\u5458\u8d44\u6599/, 'official-directory report should show a clear personnel title');
assert.ok(officialDirectoryReport.cards.some(([label, value]) => label === '\u6559\u7ec3/\u88c1\u5224' && value === '\u8865\u5145\u4e2d'), 'official-directory report should expose personnel availability without a broken zero state');
assert.ok(officialDirectoryReport.sections.some((section) => section.title === '\u53ef\u4ee5\u5148\u8fd9\u6837\u67e5'), 'official-directory report should guide users to available search paths');
assert.ok(officialDirectoryReport.actions.some((action) => action.officialSearchQuery), 'official-directory report should expose a direct personnel search action');
assertTraceableEvidence(officialDirectoryReport, 'official-directory report');
assert.ok(!/(\u6682\u672a\u8bc6\u522b|\u5206\u6790\u53e3\u5f84|\u540e\u7eed|\u6570\u636e\u8fb9\u754c|\u6682\u65e0\u8d44\u6599)/.test(`${officialDirectoryReport.title}${officialDirectoryReport.summary}${officialDirectoryReport.sections.map((section) => section.rows.join('')).join('')}`), 'official-directory copy should avoid dead-end or internal wording');

const businessReport = context.buildAiAnswer('\u8fd9\u4e9b\u51fb\u5251\u6570\u636e\u80fd\u4ea7\u751f\u4ec0\u4e48\u5546\u4e1a\u4ef7\u503c');
assert.equal(businessReport.type, 'business-insight', 'data value questions should route to business insight');
assert.ok(businessReport.cards.length >= 4, 'business insight should expose asset metrics');
assert.ok(businessReport.sections.some((section) => section.title === '\u4f18\u5148\u843d\u5730\u573a\u666f'), 'business insight should prioritize productized opportunities');
assert.ok(businessReport.sections.some((section) => section.title === '\u89d2\u8272\u8f6c\u5316\u8def\u5f84'), 'business insight should include role conversion paths');
assert.ok(businessReport.sections.some((section) => section.title === '\u6570\u636e\u6210\u719f\u5ea6'), 'business insight should show which data is ready for which business scenario');
assert.ok(businessReport.sections.some((section) => section.title === '\u4f18\u5148\u4f7f\u7528\u573a\u666f'), 'business insight should include a user-facing service sequence');
assert.ok(
  businessReport.sections.find((section) => section.title === '\u4f18\u5148\u4f7f\u7528\u573a\u666f')?.rows.some((row) => row.includes('\u8d5b\u524d\u63d0\u9192')),
  'business insight should name prematch reminders as the first opportunity',
);
assert.ok(
  businessReport.sections.find((section) => section.title === '\u4f18\u5148\u4f7f\u7528\u573a\u666f')?.rows.some((row) => row.includes('\u5bb6\u957f\u6210\u957f\u62a5\u544a')),
  'business insight should map parent growth into the rollout',
);
assert.ok(
  businessReport.sections.find((section) => section.title === '\u4f18\u5148\u4f7f\u7528\u573a\u666f')?.rows.some((row) => row.includes('\u6559\u7ec3\u5de5\u4f5c\u53f0')),
  'business insight should map coach workspace into the rollout',
);
assert.ok(businessReport.sections.some((section) => section.title === '\u533a\u57df\u673a\u4f1a'), 'business insight should include regional opportunity analysis');
assert.ok(businessReport.evidence.some((row) => row.kind === '\u8d5b\u524d\u673a\u4f1a'), 'business insight should cite prematch opportunity evidence');
assert.ok(businessReport.evidence.some((row) => row.kind === '\u4ff1\u4e50\u90e8\u8d44\u4ea7'), 'business insight should cite club asset evidence');
assert.ok(businessReport.actions.some((action) => action.prematchTemplateKind === 'prematch-pack'), 'business insight should open the prematch package path');
assert.ok(businessReport.actions.some((action) => action.parentGrowthAthleteId), 'business insight should open the parent growth path when athlete data exists');
assert.ok(businessReport.actions.some((action) => action.coachSegmentationClubId), 'business insight should open the coach workspace path when club data exists');

const prematchTemplate = context.buildAiAnswer('\u751f\u6210\u8d5b\u524d\u60c5\u62a5\u5305\u6a21\u677f');
assert.equal(prematchTemplate.type, 'product-template', 'prematch package request should route to product templates');
assert.equal(prematchTemplate.templateKind, 'prematch-pack', 'prematch package template should preserve template kind');
assert.ok(prematchTemplate.sections.some((section) => section.title === '\u62a5\u544a\u4f1a\u5305\u542b'), 'prematch template should include user-facing report contents');
assert.ok(prematchTemplate.evidence.some((row) => row.kind === '\u8d5b\u524d\u8d5b\u4e8b'), 'prematch template should cite prematch competitions');
assert.ok(!prematchTemplate.evidence.some((row) => row.sportCode === 'RZSS2021040'), 'prematch template evidence should not cite completed historical competitions');
assert.equal(prematchTemplate.evidence[0].sportCode, 'TJ2026JUNE', 'prematch template evidence should prioritize the nearest actionable competition');
assert.ok(prematchTemplate.actions.some((action) => action.prematchTemplateKind === 'prematch-pack'), 'prematch template should open the real prematch report');

const parentTemplate = context.buildAiAnswer('\u751f\u6210\u5bb6\u957f\u6210\u957f\u62a5\u544a\u6a21\u677f');
assert.equal(parentTemplate.type, 'product-template', 'parent growth report request should route to product templates');
assert.equal(parentTemplate.templateKind, 'parent-growth-report', 'parent template should preserve template kind');
assert.ok(parentTemplate.sections.some((section) => section.title === '\u91cd\u70b9\u6570\u5b57'), 'parent template should include user-facing key numbers');
assert.ok(parentTemplate.actions.some((action) => action.parentGrowthAthleteId), 'parent template should open a real growth report when athlete data exists');

const coachTemplate = context.buildAiAnswer('\u751f\u6210\u6559\u7ec3\u5b66\u5458\u5206\u5c42\u6a21\u677f');
assert.equal(coachTemplate.type, 'product-template', 'coach segmentation request should route to product templates');
assert.equal(coachTemplate.templateKind, 'coach-segmentation', 'coach template should preserve template kind');
assert.ok(coachTemplate.evidence.some((row) => row.kind === '\u4ff1\u4e50\u90e8\u8d44\u4ea7'), 'coach template should cite club assets');
assert.ok(coachTemplate.actions.some((action) => action.coachSegmentationClubId), 'coach template should open a real segmentation report when club data exists');

[
  ['season competition stats', seasonOnlyStats],
  ['named competition', namedCompetition],
  ['stale competition recovery', staleCompetitionName],
  ['monthly competition stats', juneStats],
  ['competition scale stats', scaleStats],
  ['project scale stats', itemScaleStats],
  ['prematch report', prematchReport],
  ['broad registration report', broadRegistrationReport],
  ['business coverage report', businessCoverageReport],
  ['growth report', growthReport],
  ['yearly growth report', yearlyGrowthReport],
  ['named growth report', namedGrowthReport],
  ['club report', clubReport],
  ['recruiting report', recruitingReport],
  ['athlete comparison report', comparisonReport],
  ['mixed athlete comparison report', mixedPoolComparisonReport],
  ['club comparison report', clubComparisonReport],
  ['missing competition fallback', missingCompetitionFallback],
  ['fuzzy object fallback', fuzzyObjectFallback],
  ['single surname fallback', singleSurnameFallback],
  ['capability guide', capabilityGuide],
  ['business report', businessReport],
  ['prematch template', prematchTemplate],
  ['parent template', parentTemplate],
  ['coach template', coachTemplate],
].forEach(([label, report]) => assertTraceableEvidence(report, label));

console.log('AI acceptance runtime queries are covered');
