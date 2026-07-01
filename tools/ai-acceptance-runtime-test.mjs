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
  'competitionItemCount',
  'competitionItemFilterLabels',
  'competitionMetricTotal',
  'competitionHasItems',
  'competitionYear',
  'competitionMonth',
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
  'aiEntityCandidateTerms',
  'normalizeAiName',
  'aiAthletePool',
  'detectAthletesInQuery',
  'detectExactAthletesInQuery',
  'detectClubInQuery',
  'uniqueBy',
  'buildAiAnswer',
  'detectCompetitionStatsQuery',
  'detectProductTemplateQuery',
  'detectBusinessInsightQuery',
  'detectClubRecruitingQuery',
  'detectPreMatchQuery',
  'detectYearInQuery',
  'detectMonthInQuery',
  'detectRegionInQuery',
  'detectStatusInQuery',
  'aiProjectHints',
  'aiFocusedAthletes',
  'aiAthleteProjectLabels',
  'competitionMatchesProjectLabel',
  'aiPreMatchFocusRows',
  'projectMatchesAiHints',
  'aiCompetitionStatsDecisionRows',
  'aiDefaultClub',
  'buildAiCompetitionStats',
  'businessMetricRows',
  'businessRegionRows',
  'businessClubOpportunityRows',
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
  'buildAiAthleteGrowth',
  'buildAiClubReport',
  'buildAiClubRecruitingReport',
  'clubWorkspaceAthletes',
  'clubProjectRows',
  'clubPeerRows',
  'buildClubBusinessCards',
  'clubShareHighlights',
  'buildClubCommunicationScripts',
  'athleteStrengthScore',
  'athleteMetricLine',
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
    clubsById: { [sampleClub.id]: sampleClub },
    followedAthletes: [{ id: 'cai', name: '\u8521\u5ef7\u5f67', club: '\u4e2a\u4eba' }],
    selectedChildId: 'cai',
  },
};
vm.createContext(context);
vm.runInContext(`const state = globalThis.__state;\n${functionNames.map(extractFunction).join('\n')}\nglobalThis.buildAiAnswer = buildAiAnswer;\nglobalThis.aiAcceptanceQueryCases = aiAcceptanceQueryCases;\nglobalThis.detectRegionInQuery = detectRegionInQuery;\nglobalThis.detectYearInQuery = detectYearInQuery;\nglobalThis.aiEntityCandidateTerms = aiEntityCandidateTerms;`, context);

assert.equal(context.detectRegionInQuery('2026年天津有几场比赛'), '天津', 'AI region detection must not depend on the current dataset containing that city');

const comparisonTerms = context.aiEntityCandidateTerms('\u5206\u6790\u9a6c\u6d88\u548c\u9676\u5609\u6708\u7684\u5bf9\u6218\u60c5\u51b5');
assert.ok(comparisonTerms.includes('\u9a6c\u6f47'), 'AI entity hydration should normalize common athlete name typos');
assert.ok(comparisonTerms.includes('\u9676\u5609\u6708'), 'AI entity hydration should extract the second athlete name');

const clubTerms = context.aiEntityCandidateTerms('\u5c71\u4e1c\u5c0f\u4f17\u4f53\u80b2 U8 \u7537\u82b1\u600e\u4e48\u6837');
assert.ok(clubTerms.includes('\u5c71\u4e1c\u5c0f\u4f17\u4f53\u80b2'), 'AI entity hydration should extract club names from scoped club questions');

const seasonOnlyStats = context.buildAiAnswer('\u0032\u0030\u0032\u0036\u5e74\u5929\u6d25\u6709\u51e0\u573a\u6bd4\u8d5b');
assert.equal(seasonOnlyStats.type, 'competition-stats', 'season-based regional query should route to competition stats');
assert.equal(seasonOnlyStats.cards[0][1], '4 \u573a', 'AI competition stats should count events whose year is available only from season');

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

const prematchReport = context.buildAiAnswer('\u0032\u0030\u0032\u0036\u5e74\u0036\u6708\u5929\u6d25\u8d5b\u524d\u60c5\u62a5');
assert.equal(prematchReport.type, 'prematch', 'prematch query should route to prematch intelligence');
const prematchReportAction = prematchReport.actions.find((action) => action.prematchTemplateKind === 'prematch-pack');
assert.equal(prematchReportAction.prematchSportCode, 'TJ2026JUNE', 'AI prematch reports should open a report scoped to the nearest matched competition');

const currentYear = String(new Date().getFullYear());
assert.equal(context.detectYearInQuery('\u4eca\u5e74\u5929\u6d25\u6709\u51e0\u573a\u6bd4\u8d5b'), currentYear, 'AI year detection should support current-year wording');

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


const recruitingReport = context.buildAiAnswer('山东小众体育招生怎么讲');
assert.equal(recruitingReport.type, 'club-recruiting', 'club recruiting questions should route to recruiting display');
assert.ok(recruitingReport.sections.some((section) => section.title === '对外可讲'), 'club recruiting report should include parent-facing talking points');
assert.ok(recruitingReport.evidence.some((row) => row.kind === '招生素材来源'), 'club recruiting report should cite concrete event evidence');
assert.ok(recruitingReport.actions.some((action) => action.clubId === 'club-sdzx'), 'club recruiting report should open the club recruiting card');
assert.ok(recruitingReport.actions.some((action) => action.coachSegmentationClubId === 'club-sdzx'), 'club recruiting report should connect to coach segmentation');

const comparisonReport = context.buildAiAnswer('\u5206\u6790\u9a6c\u6d88\u548c\u9676\u5609\u6708\u7684\u5bf9\u6218\u60c5\u51b5');
assert.equal(comparisonReport.type, 'comparison', 'athlete comparison query should route to comparison report');
assert.equal(
  JSON.stringify(comparisonReport.sections.map((section) => section.title)),
  JSON.stringify(['\u76f4\u63a5\u4ea4\u624b', '\u5171\u540c\u8d5b\u4e8b', '\u8fd1\u51b5\u5dee\u8ddd', '\u5173\u952e\u98ce\u9669']),
  'athlete comparison report should use the prematch analysis section structure',
);
assert.ok(
  comparisonReport.sections.find((section) => section.title === '\u5173\u952e\u98ce\u9669').rows.length,
  'athlete comparison report should include actionable risk rows',
);

const businessReport = context.buildAiAnswer('\u8fd9\u4e9b\u51fb\u5251\u6570\u636e\u80fd\u4ea7\u751f\u4ec0\u4e48\u5546\u4e1a\u4ef7\u503c');
assert.equal(businessReport.type, 'business-insight', 'data value questions should route to business insight');
assert.ok(businessReport.cards.length >= 4, 'business insight should expose asset metrics');
assert.ok(businessReport.sections.some((section) => section.title === '\u4f18\u5148\u843d\u5730\u573a\u666f'), 'business insight should prioritize productized opportunities');
assert.ok(businessReport.sections.some((section) => section.title === '\u89d2\u8272\u8f6c\u5316\u8def\u5f84'), 'business insight should include role conversion paths');
assert.ok(businessReport.sections.some((section) => section.title === '\u6570\u636e\u6210\u719f\u5ea6'), 'business insight should show which data is ready for which business scenario');
assert.ok(businessReport.sections.some((section) => section.title === '\u5546\u4e1a\u5316\u843d\u5730\u987a\u5e8f'), 'business insight should include a monetization rollout sequence');
assert.ok(
  businessReport.sections.find((section) => section.title === '\u4f18\u5148\u843d\u5730\u573a\u666f')?.rows.some((row) => row.includes('P0\uff1a\u8d5b\u524d\u60c5\u62a5\u5305')),
  'business insight should name prematch intelligence as the P0 opportunity',
);
assert.ok(
  businessReport.sections.find((section) => section.title === '\u5546\u4e1a\u5316\u843d\u5730\u987a\u5e8f')?.rows.some((row) => row.includes('P1 \u5bb6\u957f\u6210\u957f\u62a5\u544a')),
  'business insight should map parent growth into the P1 rollout',
);
assert.ok(
  businessReport.sections.find((section) => section.title === '\u5546\u4e1a\u5316\u843d\u5730\u987a\u5e8f')?.rows.some((row) => row.includes('P1 \u6559\u7ec3\u5de5\u4f5c\u53f0')),
  'business insight should map coach workspace into the P1 rollout',
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
assert.ok(prematchTemplate.sections.some((section) => section.title === '\u62a5\u544a\u7ed3\u6784'), 'prematch template should include report structure');
assert.ok(prematchTemplate.evidence.some((row) => row.kind === '\u8d5b\u524d\u8d5b\u4e8b'), 'prematch template should cite prematch competitions');
assert.ok(prematchTemplate.actions.some((action) => action.prematchTemplateKind === 'prematch-pack'), 'prematch template should open the real prematch report');

const parentTemplate = context.buildAiAnswer('\u751f\u6210\u5bb6\u957f\u6210\u957f\u62a5\u544a\u6a21\u677f');
assert.equal(parentTemplate.type, 'product-template', 'parent growth report request should route to product templates');
assert.equal(parentTemplate.templateKind, 'parent-growth-report', 'parent template should preserve template kind');
assert.ok(parentTemplate.sections.some((section) => section.title === '\u5173\u952e\u6307\u6807'), 'parent template should include metric requirements');
assert.ok(parentTemplate.actions.some((action) => action.parentGrowthAthleteId), 'parent template should open a real growth report when athlete data exists');

const coachTemplate = context.buildAiAnswer('\u751f\u6210\u6559\u7ec3\u5b66\u5458\u5206\u5c42\u6a21\u677f');
assert.equal(coachTemplate.type, 'product-template', 'coach segmentation request should route to product templates');
assert.equal(coachTemplate.templateKind, 'coach-segmentation', 'coach template should preserve template kind');
assert.ok(coachTemplate.evidence.some((row) => row.kind === '\u4ff1\u4e50\u90e8\u8d44\u4ea7'), 'coach template should cite club assets');
assert.ok(coachTemplate.actions.some((action) => action.coachSegmentationClubId), 'coach template should open a real segmentation report when club data exists');

console.log('AI acceptance runtime queries are covered');
