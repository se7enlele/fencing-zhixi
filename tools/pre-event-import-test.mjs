import assert from 'node:assert/strict';
import { buildRegistrationRosterReport } from './parse-registration-roster.mjs';
import { buildPreEventCompetitions } from './pre-event-data.mjs';

const rosterPage = {
  code: 0,
  msg: '操作成功',
  data: {
    records: [
      {
        sigupId: '253478895',
        registerType: 'athlete',
        registerId: '20081001M202305181026',
        registerCode: '20081001M202305181026',
        organCode: 'YUNYN0001',
        organShortName: '云南',
        organName: '云南击剑队',
        approveStatus: '2',
        sigupTime: '2026-05-29 15:08:04',
        sportName: '2025-2026赛季全国击剑冠军赛',
        sportCode: 'D05GJSSAN0820260104',
        eventName: '青年组男子佩剑个人',
        eventCode: 'D05GJSSAN0820260104MSIPJ',
        birthday: '2008-10-01',
        sex: 'M',
        sexDes: '男',
        weapon: 'S',
        weaponDes: '佩剑',
        athleteName: '李才博',
        regType: '0',
        regTypeDes: '竞技',
        hand: 'R',
      },
    ],
    current: 1,
    size: 10,
    total: 11,
  },
};

const report = buildRegistrationRosterReport(rosterPage, { fileName: 'member-page-1.json' });

assert.equal(report.importType, 'registration-roster');
assert.equal(report.summary.recordCount, 1);
assert.equal(report.summary.sportCodes[0], 'D05GJSSAN0820260104');
assert.equal(report.summary.eventCodes[0], 'D05GJSSAN0820260104MSIPJ');
assert.equal(report.summary.athleteCount, 1);
assert.equal(report.summary.clubCount, 1);
assert.equal(report.page.current, 1);
assert.equal(report.page.total, 11);
assert.equal(report.normalized.records[0].athleteName, '李才博');
assert.equal(report.normalized.records[0].dedupeKey, 'sigup:253478895');

const projectListReport = {
  ok: true,
  summary: { itemCount: 1, totalParticipants: 1000 },
  normalizedItems: [{
    sourceSportId: 101265,
    sourceSportCode: 'D05GJSSAN0820260104',
    sourceEventCode: 'D05GJSSAN0820260104MSIPJ',
    itemName: '青年组男子佩剑个人',
    weapon: '佩剑',
    gender: '男',
    ageGroup: '青年组',
    itemType: '个人',
    startDate: '2026-06-06 00:00:00',
    endDate: '2026-06-08 00:00:00',
    participantCount: 1000,
  }],
};

const competitions = buildPreEventCompetitions({
  projectLists: [{ fileName: 'projectlist-101265-analysis.json', report: projectListReport }],
  rosterBatches: [{ fileName: 'registration-roster-D05GJSSAN0820260104-1.json', report }],
});

assert.equal(competitions.length, 1);
assert.equal(competitions[0].sportCode, 'D05GJSSAN0820260104');
assert.equal(competitions[0].status, 'upcoming');
assert.equal(competitions[0].rosterStatus, 'partial');
assert.equal(competitions[0].items[0].registrationCount, 1);
assert.equal(competitions[0].items[0].roster.length, 1);
assert.equal(competitions[0].registrationSummary.rosterCount, 1);
assert.equal(competitions[0].registrationSummary.expectedRegistrationCount, 1000);

console.log('pre-event import parsing is covered');
