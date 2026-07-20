import assert from 'node:assert/strict';
import { buildPreEventCompetitions } from './pre-event-data.mjs';

const banned = /项目规模、报名名单和赛果更新后|项目明细已收录；报名名单更新后|更新优先级|补项目清单|补报名名单|补赛后成绩|后续数据|后续信息更新|后续接入|projectlist|score JS/;

function visibleCompetitionText(competition) {
  return JSON.stringify({
    cards: competition.insights?.summaryCards || [],
    bullets: competition.insights?.bullets || [],
  });
}

const platformReport = {
  ok: true,
  normalizedEvents: [{
    sportId: 1,
    sportCode: 'BASE001',
    season: '2026',
    sportName: '2026年北京击剑联赛第一站',
    gameDesc: '公开赛',
    startDate: '2026-04-11 08:00:00',
    endDate: '2026-04-12 18:00:00',
    provinceName: '北京',
    cityName: '北京市',
    areaDesc: '华北',
    sportactive: '0',
    sigupactive: '2',
    groupLabels: ['U8', 'U10'],
  }],
};

const baseOnly = buildPreEventCompetitions({
  platformEventLists: [{ fileName: 'frontsporteventlist-analysis.json', report: platformReport }],
})[0];

assert.match(visibleCompetitionText(baseOnly), /可先查看比赛时间、地点和组别/);
assert.doesNotMatch(visibleCompetitionText(baseOnly), banned);

const projectOnly = buildPreEventCompetitions({
  platformEventLists: [{ fileName: 'frontsporteventlist-analysis.json', report: platformReport }],
  projectLists: [{
    fileName: 'projectlist-1-analysis.json',
    report: {
      ok: true,
      normalizedItems: [{
        sourceSportId: 1,
        sourceSportCode: 'BASE001',
        sourceEventCode: 'BASE001U10MF',
        itemName: 'U10男子花剑个人',
        startDate: '2026-04-11 08:00:00',
        endDate: '2026-04-12 18:00:00',
        participantCount: 24,
      }],
    },
  }],
})[0];

assert.match(visibleCompetitionText(projectOnly), /可先查看项目安排和比赛时间/);
assert.match(visibleCompetitionText(projectOnly), /名单待确认/);
assert.doesNotMatch(visibleCompetitionText(projectOnly), banned);

console.log('public data copy is user-facing');
