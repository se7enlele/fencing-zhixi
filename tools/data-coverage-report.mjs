import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getPublicEventsPayload } from '../server.mjs';

const outputDir = path.resolve('analysis-output');
const outputJson = path.join(outputDir, 'data-coverage-report.json');
const outputMd = path.join(outputDir, 'data-coverage-report.md');
const onlineUrl = process.argv.find((arg) => arg.startsWith('--url='))?.slice('--url='.length);

function pct(value, total) {
  return total ? `${Math.round((value / total) * 100)}%` : '0%';
}

function compactText(value) {
  return String(value || '').replace(/\s+/g, '').toLowerCase();
}

function competitionYear(competition) {
  const text = [competition.dateLabel, competition.sportName, competition.platformMeta?.season].filter(Boolean).join(' ');
  return text.match(/20\d{2}/)?.[0] || '待确认';
}

function regionOf(competition) {
  return competition.region || competition.areaDesc || competition.provinceName || '待确认';
}

function hasScoreItem(item) {
  return Boolean(item?.athleteProfiles?.length || item?.poolGroups?.length || item?.eliminationMatches?.length || item?.participants?.length);
}

function competitionCoverage(competition, scoreSportCodes = new Set()) {
  if (scoreSportCodes.has(competition.sportCode)) return 'score';
  const items = competition.items || [];
  const rosterItems = items.filter((item) => (item.roster || []).length || Number(item.registrationCount) > 0);
  const scoreItems = items.filter(hasScoreItem);
  if (scoreItems.length) return 'score';
  if (rosterItems.length) return 'roster';
  if (items.length) return 'project';
  return 'directory';
}

function statusGroup(competition) {
  if (competition.status === 'registration') return '报名中';
  if (competition.status === 'upcoming') return '未开赛';
  if (competition.status === 'running') return '进行中';
  if (competition.status === 'completed') return '已结束';
  return competition.status || '待确认';
}

function itemLabel(item) {
  return item.shortEventName || item.eventName || '';
}

function isYouthTarget(label) {
  return /U6|U8|U10|U12/i.test(label || '');
}

function isFoilOrEpee(label) {
  return /花剑|重剑|FI|EI/i.test(label || '');
}

function businessPriority(competition) {
  const text = compactText([
    competition.sportName,
    competition.venue,
    competition.region,
    ...(competition.items || []).map(itemLabel),
  ].join(' '));
  let score = 0;
  const reasons = [];

  if (/山东|济南|青岛|威海|潍坊|泰安/.test(text)) {
    score += 40;
    reasons.push('山东区域');
  }
  if (['registration', 'upcoming', 'running'].includes(competition.status)) {
    score += 35;
    reasons.push('赛前/近期');
  }
  if ((competition.items || []).some((item) => isYouthTarget(itemLabel(item)))) {
    score += 20;
    reasons.push('青少年组别');
  }
  if ((competition.items || []).some((item) => isFoilOrEpee(itemLabel(item)))) {
    score += 15;
    reasons.push('花剑/重剑');
  }
  if (/山东小众体育/.test(text)) {
    score += 60;
    reasons.push('目标俱乐部');
  }
  return { score, reasons };
}

function summarizeRows(rows, keyFn) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || String(a.key).localeCompare(String(b.key), 'zh-CN'));
}

function buildReport(payload) {
  const competitions = payload.competitions || [];
  const events = payload.events || [];
  const athletes = payload.athletes || [];
  const clubs = payload.clubs || [];

  const scoreSportCodes = new Set(events.map((event) => event.sportCode).filter(Boolean));

  const rows = competitions.map((competition) => {
    const items = competition.items || [];
    const coverage = competitionCoverage(competition, scoreSportCodes);
    const priority = businessPriority(competition);
    const itemCount = items.length;
    const rosterCount = items.reduce((sum, item) => sum + ((item.roster || []).length || Number(item.registrationCount) || 0), 0);
    const scoreItemCount = items.filter(hasScoreItem).length;
    return {
      sportCode: competition.sportCode,
      sportId: competition.sportId || competition.platformMeta?.sportId || null,
      sportName: competition.sportName,
      year: competitionYear(competition),
      region: regionOf(competition),
      venue: competition.venue || '',
      status: statusGroup(competition),
      coverage,
      itemCount,
      rosterCount,
      scoreItemCount,
      priorityScore: priority.score,
      priorityReasons: priority.reasons,
      nextDataNeed: coverage === 'directory'
        ? '补项目清单'
        : coverage === 'project'
          ? '补报名名单或成绩包'
          : coverage === 'roster'
            ? '补赛后成绩和对阵'
            : '可用于完整分析',
    };
  });

  const byCoverage = summarizeRows(rows, (row) => row.coverage);
  const byStatus = summarizeRows(rows, (row) => row.status);
  const byYear = summarizeRows(rows, (row) => row.year);
  const byRegion = summarizeRows(rows, (row) => row.region);
  const prioritized = rows
    .filter((row) => row.coverage !== 'score')
    .sort((a, b) => b.priorityScore - a.priorityScore || String(b.year).localeCompare(String(a.year), 'zh-CN'))
    .slice(0, 80);

  const coachTargets = prioritized.filter((row) => row.priorityReasons.includes('山东区域')).slice(0, 30);
  const prematchTargets = rows
    .filter((row) => ['报名中', '未开赛', '进行中'].includes(row.status) && row.coverage !== 'score')
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 30);
  const parentTargets = prioritized
    .filter((row) => row.priorityReasons.includes('青少年组别'))
    .slice(0, 30);

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      competitions: competitions.length,
      scorePackages: events.length,
      athletes: athletes.length,
      clubs: clubs.length,
      coverage: Object.fromEntries(byCoverage.map((row) => [row.key, row.count])),
      coverageRate: {
        score: pct(byCoverage.find((row) => row.key === 'score')?.count || 0, competitions.length),
        projectOrBetter: pct(competitions.length - (byCoverage.find((row) => row.key === 'directory')?.count || 0), competitions.length),
      },
    },
    byStatus,
    byYear,
    byRegion: byRegion.slice(0, 20),
    priorityBuckets: {
      coachClubManagement: coachTargets,
      coachPrematch: prematchTargets,
      parentGrowth: parentTargets,
      globalTopGaps: prioritized.slice(0, 40),
    },
    rows,
  };
}

function mdTable(rows, columns) {
  const header = `| ${columns.map((column) => column.title).join(' | ')} |`;
  const sep = `| ${columns.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${columns.map((column) => String(column.value(row) ?? '').replace(/\|/g, '/')).join(' | ')} |`);
  return [header, sep, ...body].join('\n');
}

function buildMarkdown(report) {
  const coverageRows = Object.entries(report.summary.coverage).map(([coverage, count]) => ({ coverage, count }));
  return `# 744 条赛事数据覆盖状态

生成时间：${report.generatedAt}

## 总览

- 赛事目录：${report.summary.competitions}
- 成绩项目包：${report.summary.scorePackages}
- 选手摘要：${report.summary.athletes}
- 俱乐部摘要：${report.summary.clubs}
- 成绩覆盖率：${report.summary.coverageRate.score}
- 项目及以上覆盖率：${report.summary.coverageRate.projectOrBetter}

## 覆盖分层

${mdTable(coverageRows, [
  { title: '覆盖层级', value: (row) => row.coverage },
  { title: '赛事数', value: (row) => row.count },
])}

说明：directory=只有赛事目录；project=已有项目清单；roster=已有报名名单；score=已有成绩/对阵，可支撑深度分析。

## 状态分布

${mdTable(report.byStatus, [
  { title: '状态', value: (row) => row.key },
  { title: '赛事数', value: (row) => row.count },
])}

## 年份分布

${mdTable(report.byYear.slice(0, 15), [
  { title: '年份', value: (row) => row.key },
  { title: '赛事数', value: (row) => row.count },
])}

## 家长成长报告优先补齐

${mdTable(report.priorityBuckets.parentGrowth.slice(0, 20), [
  { title: '赛事', value: (row) => row.sportName },
  { title: '年份', value: (row) => row.year },
  { title: '地区', value: (row) => row.region },
  { title: '当前覆盖', value: (row) => row.coverage },
  { title: '下一步', value: (row) => row.nextDataNeed },
])}

## 教练赛前情报优先补齐

${mdTable(report.priorityBuckets.coachPrematch.slice(0, 20), [
  { title: '赛事', value: (row) => row.sportName },
  { title: '状态', value: (row) => row.status },
  { title: '地区', value: (row) => row.region },
  { title: '当前覆盖', value: (row) => row.coverage },
  { title: '下一步', value: (row) => row.nextDataNeed },
])}

## 俱乐部经营分析优先补齐

${mdTable(report.priorityBuckets.coachClubManagement.slice(0, 20), [
  { title: '赛事', value: (row) => row.sportName },
  { title: '年份', value: (row) => row.year },
  { title: '地区', value: (row) => row.region },
  { title: '当前覆盖', value: (row) => row.coverage },
  { title: '原因', value: (row) => row.priorityReasons.join('、') },
  { title: '下一步', value: (row) => row.nextDataNeed },
])}
`;
}

async function main() {
  const payload = onlineUrl
    ? await fetch(onlineUrl).then(async (response) => {
      if (!response.ok) throw new Error(`Fetch failed ${response.status}: ${onlineUrl}`);
      return response.json();
    })
    : await getPublicEventsPayload();
  const report = buildReport(payload);
  await mkdir(outputDir, { recursive: true });
  await writeFile(outputJson, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await writeFile(outputMd, buildMarkdown(report), 'utf8');
  console.log(JSON.stringify({
    ok: true,
    outputJson,
    outputMd,
    summary: report.summary,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
