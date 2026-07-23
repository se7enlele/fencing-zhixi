import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildFrontSportEventListReport, looksLikeFrontSportEventList } from './parse-frontsporteventlist.mjs';
import { buildPreEventCompetitions } from './pre-event-data.mjs';

const originalDateNow = Date.now;
Date.now = () => Date.parse('2026-04-01T12:00:00+08:00');

const payload = {
  code: 0,
  data: [
    {
      sportId: 1,
      sportCode: 'ENDED001',
      season: '2025',
      sportName: 'Ended event',
      gameDesc: 'League',
      startDate: '2025-04-01 08:00:00',
      endDate: '2025-04-02 18:00:00',
      provinceName: 'Beijing',
      cityName: 'Beijing',
      areaDesc: 'North',
      sportactive: '2',
      sigupactive: '2',
      groups: [{ groupCode: 'U8', groupName: 'U8' }],
    },
    {
      sportId: 2,
      sportCode: 'REG001',
      season: '2026',
      sportName: 'Registration event',
      gameDesc: 'Open',
      startDate: '2026-10-01 08:00:00',
      endDate: '2026-10-02 18:00:00',
      signStartDate: '2026-01-01 08:00:00',
      signAthEndDate: '2026-12-01 18:00:00',
      provinceName: 'Tianjin',
      cityName: 'Tianjin',
      areaDesc: 'North',
      sportactive: '0',
      sigupactive: '1',
      groups: [{ groupCode: 'U10', groupName: 'U10' }],
    },
    {
      sportId: 3,
      sportCode: 'LIVE001',
      season: '2026',
      sportName: 'Live event',
      gameDesc: 'Open',
      startDate: '2026-04-01 08:00:00',
      endDate: '2026-04-02 18:00:00',
      provinceName: 'Hebei',
      cityName: 'Cangzhou',
      areaDesc: 'North',
      sportactive: '1',
      sigupactive: '2',
      groups: [{ groupCode: 'U12', groupName: 'U12' }],
    },
  ],
};

assert.equal(looksLikeFrontSportEventList(payload), true);

const report = buildFrontSportEventListReport(payload, { fileName: 'frontsporteventlist.json' });
assert.equal(report.importType, 'frontsporteventlist');
assert.equal(report.summary.eventCount, 3);
assert.equal(report.normalizedEvents[0].sportCode, 'ENDED001');
assert.deepEqual(report.normalizedEvents[1].groupLabels, ['U10']);

let competitions = buildPreEventCompetitions({
  platformEventLists: [{ fileName: 'frontsporteventlist-analysis.json', report }],
});

assert.equal(competitions.length, 3);
assert.equal(competitions.find((row) => row.sportCode === 'ENDED001').status, 'completed');
assert.equal(competitions.find((row) => row.sportCode === 'REG001').status, 'registration');
assert.equal(competitions.find((row) => row.sportCode === 'LIVE001').status, 'live');
assert.equal(competitions.find((row) => row.sportCode === 'REG001').items.length, 0);

const projectListReport = {
  ok: true,
  normalizedItems: [{
    sourceSportId: 2,
    sourceSportCode: 'REG001',
    sourceEventCode: 'REG001U10MF',
    itemName: 'U10 Foil',
    startDate: '2026-04-01 08:00:00',
    endDate: '2026-04-02 18:00:00',
    participantCount: 24,
  }, {
    sourceSportId: 3,
    sourceSportCode: 'LIVE001',
    sourceEventCode: 'LIVE001U12MF',
    itemName: 'U12 Foil',
    startDate: '2026-04-01 08:00:00',
    endDate: '2026-04-02 18:00:00',
    participantCount: 18,
  }],
};

competitions = buildPreEventCompetitions({
  platformEventLists: [{ fileName: 'frontsporteventlist-analysis.json', report }],
  projectLists: [{ fileName: 'projectlist-2-analysis.json', report: projectListReport }],
});

const enriched = competitions.find((row) => row.sportCode === 'REG001');
assert.equal(enriched.items.length, 1);
assert.equal(enriched.items[0].competitionNo, 24);
assert.equal(enriched.registrationSummary.expectedRegistrationCount, 24);
assert.equal(enriched.platformMeta.sourceCoverage, 'event-list-plus-projectlist');
assert.equal(enriched.status, 'registration');
const liveEnriched = competitions.find((row) => row.sportCode === 'LIVE001');
assert.equal(liveEnriched.status, 'live');
assert.equal(liveEnriched.items[0].status, 'live');

const manualPlatformReport = JSON.parse(await readFile(new URL('../data/analysis/manual-platform-events.json', import.meta.url), 'utf8'));
const manualCompetitions = buildPreEventCompetitions({
  platformEventLists: [{ fileName: 'manual-platform-events.json', report: manualPlatformReport }],
});
const beijingLeague = manualCompetitions.find((row) => row.sportCode === 'BJLEAGUE2026S1');
assert.ok(beijingLeague, 'manual platform event supplement must include 2026 Beijing fencing league');
assert.equal(beijingLeague.sportName, '2026年北京击剑联赛第一站');
assert.equal(beijingLeague.venue, '北京市顺义区首都国际会展中心');
assert.equal(beijingLeague.status, 'completed');
assert.deepEqual(beijingLeague.groupLabels, ['U6', 'U8', 'U10', 'U12', 'U16']);
assert.equal(beijingLeague.items.length, 0);
assert.equal(beijingLeague.platformMeta.sourceCoverage, 'event-list-only');

console.log('platform event list parsing is covered');

Date.now = originalDateNow;
