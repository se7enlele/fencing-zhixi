import assert from 'node:assert/strict';
import { buildFrontSportEventListReport, looksLikeFrontSportEventList } from './parse-frontsporteventlist.mjs';
import { buildPreEventCompetitions } from './pre-event-data.mjs';

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
  ],
};

assert.equal(looksLikeFrontSportEventList(payload), true);

const report = buildFrontSportEventListReport(payload, { fileName: 'frontsporteventlist.json' });
assert.equal(report.importType, 'frontsporteventlist');
assert.equal(report.summary.eventCount, 2);
assert.equal(report.normalizedEvents[0].sportCode, 'ENDED001');
assert.deepEqual(report.normalizedEvents[1].groupLabels, ['U10']);

let competitions = buildPreEventCompetitions({
  platformEventLists: [{ fileName: 'frontsporteventlist-analysis.json', report }],
});

assert.equal(competitions.length, 2);
assert.equal(competitions.find((row) => row.sportCode === 'ENDED001').status, 'completed');
assert.equal(competitions.find((row) => row.sportCode === 'REG001').status, 'registration');
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
  }],
};

competitions = buildPreEventCompetitions({
  platformEventLists: [{ fileName: 'frontsporteventlist-analysis.json', report }],
  projectLists: [{ fileName: 'projectlist-2-analysis.json', report: projectListReport }],
});

const enriched = competitions.find((row) => row.sportCode === 'REG001');
assert.equal(enriched.items.length, 1);
assert.equal(enriched.items[0].competitionNo, 24);
assert.equal(enriched.platformMeta.sourceCoverage, 'event-list-plus-projectlist');
assert.equal(enriched.status, 'registration');

console.log('platform event list parsing is covered');
