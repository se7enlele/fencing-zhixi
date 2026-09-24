import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildEventDateFallbacks, enrichScoreReportDates } from './event-date.mjs';
import { getAthleteDirectory } from '../server.mjs';

const fallbacks = buildEventDateFallbacks({
  projectLists: [{
    report: {
      normalizedItems: [{
        sourceEventCode: 'EVENT-WFIU8',
        sourceSportCode: 'SPORT-1',
        startDate: '2025-04-19 08:00:00',
        endDate: '2025-04-20 23:59:59',
      }],
    },
  }],
  platformEventLists: [{
    report: {
      normalizedEvents: [{
        sportCode: 'SPORT-1',
        startDate: '2025-04-12 08:00:00',
        endDate: '2025-04-13 23:59:59',
      }],
    },
  }],
});

const scoreWithoutDate = {
  general: {
    eventCode: 'EVENT-WFIU8',
    sportCode: 'SPORT-1',
    openDate: null,
  },
};
const enriched = enrichScoreReportDates(scoreWithoutDate, fallbacks);
assert.equal(enriched.general.openDate, '2025-04-19 08:00:00', 'specific project date should fill a missing score date');
assert.equal(enriched.general.endDate, '2025-04-20 23:59:59');
assert.equal(enriched.general.dateSource, 'projectlist');
assert.equal(scoreWithoutDate.general.openDate, null, 'date enrichment must not mutate imported score reports');

const existingDate = enrichScoreReportDates({
  general: {
    eventCode: 'EVENT-WFIU8',
    sportCode: 'SPORT-1',
    openDate: '2025-04-18 09:00:00',
  },
}, fallbacks);
assert.equal(existingDate.general.openDate, '2025-04-18 09:00:00', 'score date should remain the highest-priority source');
assert.equal(existingDate.general.dateSource, undefined);

const platformFallback = enrichScoreReportDates({
  general: {
    eventCode: 'UNKNOWN-EVENT',
    sportCode: 'SPORT-1',
    openDate: null,
  },
}, fallbacks);
assert.equal(platformFallback.general.openDate, '2025-04-12 08:00:00', 'competition date should be the final fallback');
assert.equal(platformFallback.general.dateSource, 'competition-list');

const athletes = await getAthleteDirectory();
const wangXinqing = athletes.find((athlete) => athlete.id === '20170709F202402261051');
assert.ok(wangXinqing, 'fixture athlete Wang Xinqing should exist');
const qinhuangdao = wangXinqing.events.find((event) => event.eventCode === 'RZSS2031030WFIU8');
const zhumadian = wangXinqing.events.find((event) => event.eventCode === 'RZSS2032120WFIU10');
assert.equal(qinhuangdao?.openDate, '2025-04-19 08:00:00', 'athlete timeline should use the Qinhuangdao project date');
assert.equal(zhumadian?.openDate, '2025-05-01 08:00:00', 'athlete timeline should use the Zhumadian project date');

const worker = await readFile(new URL('../cloudflare/worker.mjs', import.meta.url), 'utf8');
assert.match(worker, /enrichDynamicScoreReports\(dynamicReports, preEventReports\)/, 'Worker dynamic score data should receive the same date enrichment');

console.log('event date enrichment is covered');
