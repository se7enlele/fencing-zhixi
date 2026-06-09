import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getPublicEventsPayload } from '../server.mjs';

const currentYear = new Date().getFullYear();
const years = [currentYear - 2, currentYear - 1, currentYear];
const yearSet = new Set(years.map(String));
const outputDir = path.resolve('analysis-output', 'three-year');

function csvValue(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function csv(rows, columns) {
  return [
    columns.map((column) => csvValue(column.title)).join(','),
    ...rows.map((row) => columns.map((column) => csvValue(column.value(row))).join(',')),
  ].join('\n');
}

function mdTable(rows, columns) {
  const header = `| ${columns.map((column) => column.title).join(' | ')} |`;
  const sep = `| ${columns.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${columns.map((column) => String(column.value(row) ?? '').replace(/\|/g, '/')).join(' | ')} |`);
  return [header, sep, ...body].join('\n');
}

function firstYear(...values) {
  const text = values.filter(Boolean).join(' ');
  return text.match(/20\d{2}/)?.[0] || '';
}

function itemName(item) {
  return item.shortEventName || item.eventName || '';
}

function itemYear(item) {
  return firstYear(item.openDate, item.dateLabel, item.sportName, item.eventName);
}

function competitionYear(competition) {
  return firstYear(
    competition.dateLabel,
    competition.sportName,
    competition.platformMeta?.season,
    ...(competition.items || []).map((item) => item.openDate),
  );
}

function eventYear(event) {
  return firstYear(event.openDate, event.dateLabel, event.sportName, event.eventName);
}

function hasScoreItem(item) {
  return Boolean(item?.athleteProfiles?.length || item?.poolGroups?.length || item?.eliminationMatches?.length || item?.participants?.length);
}

function coverageOfCompetition(competition, scoreSportCodes) {
  if (scoreSportCodes.has(competition.sportCode)) return 'score';
  const items = competition.items || [];
  if (items.some(hasScoreItem)) return 'score';
  if (items.some((item) => (item.roster || []).length || Number(item.registrationCount) > 0)) return 'roster';
  if (items.length) return 'project';
  return 'directory';
}

function statusOf(competition) {
  return competition.status || 'unknown';
}

function parseDateValue(...values) {
  for (const value of values) {
    const normalized = String(value || '').replace(/\./g, '-').replace(' ', 'T');
    const timestamp = Date.parse(normalized);
    if (Number.isFinite(timestamp)) return timestamp;
  }
  return 0;
}

function regionOf(row) {
  return row.region || row.venue || row.areaDesc || row.provinceName || '待确认';
}

function summarize(rows, keyFn, limit = rows.length) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row) || '待确认';
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || String(a.key).localeCompare(String(b.key), 'zh-CN'))
    .slice(0, limit);
}

function rate(value, total) {
  return total ? `${Math.round((value / total) * 100)}%` : '0%';
}

function isYouthItem(label) {
  return /U6|U8|U10|U12|U14|青少年/.test(label || '');
}

function isFoilOrEpee(label) {
  return /花剑|重剑|FI|EI/.test(label || '');
}

function priorityForCompetition(row) {
  let score = 0;
  const reasons = [];
  if (row.coverage === 'directory') {
    score += 50;
    reasons.push('缺项目清单');
  } else if (row.coverage === 'project') {
    score += 40;
    reasons.push('缺报名/成绩');
  } else if (row.coverage === 'roster') {
    score += 30;
    reasons.push('缺赛后成绩');
  }
  if (['registration', 'upcoming', 'live'].includes(row.status)) {
    score += 35;
    reasons.push('近期赛前');
  }
  if (row.year === String(currentYear)) {
    score += 20;
    reasons.push('当前赛季');
  }
  if (row.itemLabels.some(isYouthItem) || /青少年|少年|U\d+/.test(row.sportName)) {
    score += 15;
    reasons.push('青少年');
  }
  if (row.itemLabels.some(isFoilOrEpee) || /花剑|重剑/.test(row.sportName)) {
    score += 10;
    reasons.push('花剑/重剑');
  }
  if (/山东|济南|青岛|潍坊|泰安|威海|小众体育/.test([row.sportName, row.venue, row.region].join(' '))) {
    score += 12;
    reasons.push('山东/目标样板');
  }
  return { score, reasons };
}

function syncCommandFor(row) {
  if (row.coverage === 'directory') {
    return `node tools/sync-platform-data.mjs --sport-id ${row.sportId} --no-score`;
  }
  if (row.coverage === 'project') {
    return `node tools/sync-platform-data.mjs --sport-id ${row.sportId} --roster --no-score`;
  }
  if (row.coverage === 'roster') {
    return `node tools/sync-platform-data.mjs --sport-id ${row.sportId}`;
  }
  return '';
}

function athleteEventRows(athletes) {
  return athletes.flatMap((athlete) => (athlete.events || [])
    .filter((event) => yearSet.has(itemYear(event)))
    .map((event) => ({
      athleteId: athlete.id,
      name: athlete.name,
      club: event.club || athlete.club || '个人',
      year: itemYear(event),
      sportCode: event.sportCode,
      sportName: event.sportName,
      eventCode: event.eventCode,
      eventName: event.eventName,
      shortEventName: event.shortEventName,
      openDate: event.openDate,
      venue: event.venue,
      finalRank: Number(event.finalRank) || null,
      medal: event.medal || '',
      poolWins: Number(event.poolWins) || 0,
      poolMatches: Number(event.poolMatches) || 0,
      eliminationWins: Number(event.eliminationWins) || 0,
      eliminationLosses: Number(event.eliminationLosses) || 0,
    })));
}

function clubEventRows(clubs) {
  return clubs.flatMap((club) => (club.events || [])
    .filter((event) => yearSet.has(itemYear(event)))
    .map((event) => ({
      clubId: club.id,
      club: club.club,
      year: itemYear(event),
      sportCode: event.sportCode,
      sportName: event.sportName,
      eventCode: event.eventCode,
      eventName: event.eventName,
      shortEventName: event.shortEventName,
      openDate: event.openDate,
      venue: event.venue,
      entrants: Number(event.entrants) || 0,
      medals: Number(event.medals) || 0,
      top8: Number(event.top8) || 0,
      bestRank: Number(event.bestRank) || null,
    })));
}

function aggregateAthletes(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = row.athleteId;
    const current = map.get(key) || {
      athleteId: row.athleteId,
      name: row.name,
      club: row.club,
      appearances: 0,
      medals: 0,
      top8: 0,
      bestRank: null,
      poolWins: 0,
      poolMatches: 0,
      eliminationWins: 0,
      eliminationLosses: 0,
      years: new Set(),
      events: new Set(),
    };
    current.appearances += 1;
    current.medals += row.medal ? 1 : 0;
    current.top8 += row.finalRank && row.finalRank <= 8 ? 1 : 0;
    current.bestRank = current.bestRank === null ? row.finalRank : row.finalRank ? Math.min(current.bestRank, row.finalRank) : current.bestRank;
    current.poolWins += row.poolWins;
    current.poolMatches += row.poolMatches;
    current.eliminationWins += row.eliminationWins;
    current.eliminationLosses += row.eliminationLosses;
    current.years.add(row.year);
    current.events.add(row.eventCode);
    map.set(key, current);
  }
  return [...map.values()]
    .map((row) => ({
      ...row,
      years: [...row.years].sort().join('/'),
      eventCount: row.events.size,
      poolWinRate: row.poolMatches ? Math.round((row.poolWins / row.poolMatches) * 100) : '',
    }))
    .sort((a, b) => (b.medals - a.medals) || (b.top8 - a.top8) || (a.bestRank ?? 9999) - (b.bestRank ?? 9999) || b.appearances - a.appearances);
}

function aggregateClubs(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = row.clubId;
    const current = map.get(key) || {
      clubId: row.clubId,
      club: row.club,
      entrants: 0,
      medals: 0,
      top8: 0,
      bestRank: null,
      years: new Set(),
      sports: new Set(),
      events: new Set(),
    };
    current.entrants += row.entrants;
    current.medals += row.medals;
    current.top8 += row.top8;
    current.bestRank = current.bestRank === null ? row.bestRank : row.bestRank ? Math.min(current.bestRank, row.bestRank) : current.bestRank;
    current.years.add(row.year);
    current.sports.add(row.sportCode);
    current.events.add(row.eventCode);
    map.set(key, current);
  }
  return [...map.values()]
    .map((row) => ({
      ...row,
      years: [...row.years].sort().join('/'),
      competitionCount: row.sports.size,
      eventCount: row.events.size,
      medalRate: row.entrants ? Math.round((row.medals / row.entrants) * 100) : '',
      top8Rate: row.entrants ? Math.round((row.top8 / row.entrants) * 100) : '',
    }))
    .sort((a, b) => (b.medals - a.medals) || (b.top8 - a.top8) || b.entrants - a.entrants || (a.bestRank ?? 9999) - (b.bestRank ?? 9999));
}

function buildInsights({ competitionRows, athleteRows, athleteSummary, clubRows, clubSummary }) {
  const scoreCount = competitionRows.filter((row) => row.coverage === 'score').length;
  const projectOrBetter = competitionRows.filter((row) => row.coverage !== 'directory').length;
  const directoryCount = competitionRows.filter((row) => row.coverage === 'directory').length;
  const topYears = summarize(competitionRows, (row) => row.year);
  const topRegions = summarize(competitionRows, (row) => row.region, 10);
  const topItems = summarize(competitionRows.flatMap((row) => row.itemLabels), (label) => label, 12);
  const topAthletes = athleteSummary.slice(0, 20);
  const topClubs = clubSummary.slice(0, 20);
  const statusRows = summarize(competitionRows, (row) => row.status);
  const needs = summarize(competitionRows, (row) => row.nextDataNeed);
  const syncTargets = competitionRows
    .filter((row) => row.coverage !== 'score')
    .sort((a, b) => b.priorityScore - a.priorityScore || b.dateValue - a.dateValue)
    .slice(0, 30);

  return `# 最近 3 年击剑数据清洗与分析

生成时间：${new Date().toISOString()}

范围：${years.join(' / ')} 赛季。

## 数据覆盖

- 比赛：${competitionRows.length}
- 可深度分析比赛：${scoreCount}，成绩覆盖率 ${rate(scoreCount, competitionRows.length)}
- 已有项目及以上比赛：${projectOrBetter}，项目覆盖率 ${rate(projectOrBetter, competitionRows.length)}
- 仍停留在赛事目录层：${directoryCount}
- 选手参赛记录：${athleteRows.length}
- 去重选手：${athleteSummary.length}
- 俱乐部项目记录：${clubRows.length}
- 去重俱乐部：${clubSummary.length}

## 按年份

${mdTable(topYears, [
  { title: '年份', value: (row) => row.key },
  { title: '比赛数', value: (row) => row.count },
])}

## 按状态

${mdTable(statusRows, [
  { title: '状态', value: (row) => row.key },
  { title: '比赛数', value: (row) => row.count },
])}

## 地域 TOP10

${mdTable(topRegions, [
  { title: '地域', value: (row) => row.key },
  { title: '比赛数', value: (row) => row.count },
])}

## 高频项目

${mdTable(topItems, [
  { title: '项目', value: (row) => row.key },
  { title: '出现次数', value: (row) => row.count },
])}

## 选手表现 TOP20

${mdTable(topAthletes, [
  { title: '选手', value: (row) => row.name },
  { title: '俱乐部', value: (row) => row.club },
  { title: '参赛', value: (row) => row.appearances },
  { title: '奖牌', value: (row) => row.medals },
  { title: '前八', value: (row) => row.top8 },
  { title: '最好', value: (row) => row.bestRank },
  { title: '年份', value: (row) => row.years },
])}

## 俱乐部表现 TOP20

${mdTable(topClubs, [
  { title: '俱乐部', value: (row) => row.club },
  { title: '人次', value: (row) => row.entrants },
  { title: '奖牌', value: (row) => row.medals },
  { title: '前八', value: (row) => row.top8 },
  { title: '比赛', value: (row) => row.competitionCount },
  { title: '最好', value: (row) => row.bestRank },
])}

## 数据补齐优先级

${mdTable(needs, [
  { title: '下一步', value: (row) => row.key },
  { title: '比赛数', value: (row) => row.count },
])}

## 下一批同步目标 TOP30

${mdTable(syncTargets, [
  { title: '赛事', value: (row) => row.sportName },
  { title: '年份', value: (row) => row.year },
  { title: '状态', value: (row) => row.status },
  { title: '覆盖', value: (row) => row.coverage },
  { title: '优先级', value: (row) => row.priorityScore },
  { title: '原因', value: (row) => row.priorityReasons.join('、') },
])}

## 产品判断

1. 最近 3 年的数据已经能支撑选手成长、俱乐部表现和部分赛事画像，但完整赛前情报还依赖报名名单与项目清单继续补齐。
2. 当前最大缺口不是选手/俱乐部聚合能力，而是仍有大量赛事停留在目录层，无法拆到具体项目和报名名单。
3. 对家长视角，应优先使用已有成绩包生成成长趋势、最好名次、前八稳定性和小组赛稳定性。
4. 对教练视角，应优先使用俱乐部项目记录生成队伍项目矩阵、重点学员、强项年龄段和赛前对手清单。
5. 下一轮数据工作应先补最近和报名中赛事的 projectlist 与 roster，再补目标俱乐部相关赛事的成绩对阵。
`;
}

async function main() {
  const payload = await getPublicEventsPayload();
  const scoreSportCodes = new Set((payload.events || []).map((event) => event.sportCode).filter(Boolean));
  const competitionRows = (payload.competitions || [])
    .map((competition) => {
      const year = competitionYear(competition);
      const itemLabels = [...new Set((competition.items || []).map(itemName).filter(Boolean))];
      const coverage = coverageOfCompetition(competition, scoreSportCodes);
      const row = {
        sportCode: competition.sportCode,
        sportId: competition.sportId || competition.platformMeta?.sportId || '',
        sportName: competition.sportName,
        year,
        dateLabel: competition.dateLabel || '',
        dateValue: parseDateValue(competition.dateLabel, ...(competition.items || []).map((item) => item.openDate)),
        venue: competition.venue || '',
        region: regionOf(competition),
        status: statusOf(competition),
        coverage,
        itemCount: (competition.items || []).length,
        itemLabels,
        rosterCount: (competition.items || []).reduce((sum, item) => sum + ((item.roster || []).length || Number(item.registrationCount) || 0), 0),
        scoreItemCount: (competition.items || []).filter(hasScoreItem).length,
        nextDataNeed: coverage === 'directory'
          ? '补项目清单'
          : coverage === 'project'
            ? '补报名名单/成绩'
            : coverage === 'roster'
              ? '补赛后成绩对阵'
              : '可分析',
      };
      const priority = priorityForCompetition(row);
      return {
        ...row,
        priorityScore: priority.score,
        priorityReasons: priority.reasons,
        suggestedCommand: syncCommandFor(row),
      };
    })
    .filter((row) => yearSet.has(row.year))
    .sort((a, b) => String(b.year).localeCompare(String(a.year), 'zh-CN') || String(a.sportName).localeCompare(String(b.sportName), 'zh-CN'));

  const rawAthleteRows = athleteEventRows(payload.athletes || []);
  const athleteSummary = aggregateAthletes(rawAthleteRows);
  const rawClubRows = clubEventRows(payload.clubs || []);
  const clubSummary = aggregateClubs(rawClubRows);

  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'competitions.csv'), `${csv(competitionRows, [
    { title: 'sportCode', value: (row) => row.sportCode },
    { title: 'sportId', value: (row) => row.sportId },
    { title: 'sportName', value: (row) => row.sportName },
    { title: 'year', value: (row) => row.year },
    { title: 'dateLabel', value: (row) => row.dateLabel },
    { title: 'venue', value: (row) => row.venue },
    { title: 'region', value: (row) => row.region },
    { title: 'status', value: (row) => row.status },
    { title: 'coverage', value: (row) => row.coverage },
    { title: 'itemCount', value: (row) => row.itemCount },
    { title: 'rosterCount', value: (row) => row.rosterCount },
    { title: 'scoreItemCount', value: (row) => row.scoreItemCount },
    { title: 'itemLabels', value: (row) => row.itemLabels.join(' / ') },
    { title: 'nextDataNeed', value: (row) => row.nextDataNeed },
  ])}\n`, 'utf8');

  await writeFile(path.join(outputDir, 'athletes.csv'), `${csv(athleteSummary, [
    { title: 'athleteId', value: (row) => row.athleteId },
    { title: 'name', value: (row) => row.name },
    { title: 'club', value: (row) => row.club },
    { title: 'years', value: (row) => row.years },
    { title: 'appearances', value: (row) => row.appearances },
    { title: 'eventCount', value: (row) => row.eventCount },
    { title: 'medals', value: (row) => row.medals },
    { title: 'top8', value: (row) => row.top8 },
    { title: 'bestRank', value: (row) => row.bestRank },
    { title: 'poolWinRate', value: (row) => row.poolWinRate },
    { title: 'eliminationWins', value: (row) => row.eliminationWins },
    { title: 'eliminationLosses', value: (row) => row.eliminationLosses },
  ])}\n`, 'utf8');

  await writeFile(path.join(outputDir, 'clubs.csv'), `${csv(clubSummary, [
    { title: 'clubId', value: (row) => row.clubId },
    { title: 'club', value: (row) => row.club },
    { title: 'years', value: (row) => row.years },
    { title: 'competitionCount', value: (row) => row.competitionCount },
    { title: 'eventCount', value: (row) => row.eventCount },
    { title: 'entrants', value: (row) => row.entrants },
    { title: 'medals', value: (row) => row.medals },
    { title: 'top8', value: (row) => row.top8 },
    { title: 'bestRank', value: (row) => row.bestRank },
    { title: 'medalRate', value: (row) => row.medalRate },
    { title: 'top8Rate', value: (row) => row.top8Rate },
  ])}\n`, 'utf8');

  await writeFile(path.join(outputDir, 'coverage-gaps.csv'), `${csv(competitionRows.filter((row) => row.coverage !== 'score'), [
    { title: 'sportCode', value: (row) => row.sportCode },
    { title: 'sportName', value: (row) => row.sportName },
    { title: 'year', value: (row) => row.year },
    { title: 'region', value: (row) => row.region },
    { title: 'status', value: (row) => row.status },
    { title: 'coverage', value: (row) => row.coverage },
    { title: 'nextDataNeed', value: (row) => row.nextDataNeed },
  ])}\n`, 'utf8');

  const syncTargets = competitionRows
    .filter((row) => row.coverage !== 'score')
    .sort((a, b) => b.priorityScore - a.priorityScore || b.dateValue - a.dateValue);
  await writeFile(path.join(outputDir, 'sync-targets.csv'), `${csv(syncTargets, [
    { title: 'sportId', value: (row) => row.sportId },
    { title: 'sportCode', value: (row) => row.sportCode },
    { title: 'sportName', value: (row) => row.sportName },
    { title: 'year', value: (row) => row.year },
    { title: 'status', value: (row) => row.status },
    { title: 'coverage', value: (row) => row.coverage },
    { title: 'priorityScore', value: (row) => row.priorityScore },
    { title: 'priorityReasons', value: (row) => row.priorityReasons.join(' / ') },
    { title: 'nextDataNeed', value: (row) => row.nextDataNeed },
    { title: 'suggestedCommand', value: (row) => row.suggestedCommand },
  ])}\n`, 'utf8');

  const reportJson = {
    generatedAt: new Date().toISOString(),
    years,
    summary: {
      competitions: competitionRows.length,
      scoreCompetitions: competitionRows.filter((row) => row.coverage === 'score').length,
      projectOrBetterCompetitions: competitionRows.filter((row) => row.coverage !== 'directory').length,
      athleteEventRows: rawAthleteRows.length,
      athletes: athleteSummary.length,
      clubEventRows: rawClubRows.length,
      clubs: clubSummary.length,
    },
  };
  await writeFile(path.join(outputDir, 'summary.json'), `${JSON.stringify(reportJson, null, 2)}\n`, 'utf8');
  await writeFile(path.join(outputDir, 'stats.md'), buildInsights({
    competitionRows,
    athleteRows: rawAthleteRows,
    athleteSummary,
    clubRows: rawClubRows,
    clubSummary,
  }), 'utf8');

  console.log(JSON.stringify({ ok: true, outputDir, ...reportJson.summary }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
