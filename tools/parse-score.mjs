import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { stableStringify } from './analyzer-core.mjs';

function parseArgs(argv) {
  const args = {
    input: 'E:\\Codex\\data\\scoredemo.js',
    sourceUrl: 'https://fencing.yy-sport.com.cn/Resource/score/RZSS2036022MFIU8.js',
    outputDir: 'data/analysis',
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--input' || arg === '-i') args.input = argv[++i];
    if (arg === '--source-url' || arg === '-u') args.sourceUrl = argv[++i];
    if (arg === '--output-dir' || arg === '-o') args.outputDir = argv[++i];
  }

  return args;
}

function countBy(rows, getter) {
  return rows.reduce((map, row) => {
    const value = getter(row) ?? '(空)';
    map[value] = (map[value] ?? 0) + 1;
    return map;
  }, {});
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function scoreValue(value) {
  if (value === 'V') return 'V';
  return numberOrNull(value);
}

function isBye(match) {
  return match.HomeFencer === 'Bye' || match.AwayFencer === 'Bye';
}

function normalizePoolBout(row) {
  return {
    poolId: row.PoolID,
    caseCode: row.CaseCode,
    order: row.Order,
    matchOrder: row.MatchOrder,
    homeNumber: row.NumberHome,
    awayNumber: row.NumberAway,
    homeLabel: row.HomeFencer,
    awayLabel: row.AwayFencer,
    homeScore: scoreValue(row.HScore),
    awayScore: scoreValue(row.AScore),
  };
}

function normalizeEliminationMatch(row, phaseById) {
  return {
    matchId: row.MatchID,
    matchCode: row.MatchCode,
    phaseId: row.PhaseID,
    phase: phaseById[row.PhaseID] ?? null,
    groupCode: row.GroupCode,
    innerOrder: row.F_InnerOrder,
    home: {
      position: row.HomePosition,
      name: row.HomeFencer,
      licence: row.HomeLicence || null,
      club: row.HomeNOC || null,
      points: row.HomePoints,
      result: row.HomeWLT,
    },
    away: {
      position: row.AwayPosition,
      name: row.AwayFencer,
      licence: row.AwayLicence || null,
      club: row.AwayNOC || null,
      points: row.AwayPoints,
      result: row.AwayWLT,
    },
    winner: {
      name: row.Winner,
      club: row.WinnerNOC,
    },
    piste: row.Piste,
    startTime: row.StartTime,
    isBye: isBye(row),
  };
}

function normalizePoolStanding(row) {
  return {
    rank: numberOrNull(row.Rank),
    displayPosition: row.DisPos,
    name: row.Name,
    licence: row.Licence,
    club: row.Delegation,
    wins: row.V,
    matches: row.M,
    winRate: row.Index,
    hitsScored: row.HS,
    hitsReceived: row.HR,
    indicator: row.HSMHR,
    remark: row.Remark,
  };
}

function normalizeClassment(row) {
  return {
    rank: numberOrNull(row.EventRank),
    displayRank: row.EventShowRank,
    name: row.Fencer,
    licence: row.Licence || null,
    club: row.NOCCode || null,
    birthday: row.Birthday || null,
    medal: row.Medal || null,
    status: row.Statut,
    sourcePosition: row.F_EventDisPos,
    qualifyStatusId: row.QualifyStatusId,
  };
}

function normalizePoolResult(row) {
  const boutCells = Object.fromEntries(
    Object.entries(row)
      .filter(([key]) => /^Result\d+$/.test(key))
      .map(([key, value]) => [key, value]),
  );

  return {
    drawNo: row.DrawNo,
    name: row.Fencer,
    licence: row.Licence,
    club: row.Delegation,
    poolId: row.PoolID,
    boutCells,
    wins: row.WinCount,
    matches: row.MatchCount,
    winRate: row.IndexChar,
    hitsScored: row.TG,
    hitsReceived: row.TR,
    indicator: row.Diff,
    phaseRank: row.PhaseRank,
  };
}

function getCompleteness(payload) {
  return Object.entries(payload).map(([section, value]) => {
    if (!Array.isArray(value)) {
      return { section, type: typeof value };
    }

    const keys = [...new Set(value.flatMap((row) => Object.keys(row || {})))];
    return {
      section,
      rows: value.length,
      fields: keys.map((key) => {
        const nonEmpty = value.filter((row) => {
          const cell = row[key];
          return cell !== null && cell !== undefined && cell !== '';
        }).length;
        return {
          key,
          nonEmpty,
          fillRate: value.length ? Number((nonEmpty / value.length).toFixed(4)) : 0,
          sampleValues: [...new Set(value.map((row) => row[key]).filter((cell) => cell !== null && cell !== undefined && cell !== ''))].slice(0, 8),
        };
      }),
    };
  });
}

export function buildScoreReport(payload, source = {}) {
  const general = payload.General?.[0] ?? {};
  const phaseById = Object.fromEntries((payload.Tableaus ?? []).map((phase) => [phase.PhaseID, {
    shortName: phase.PshortDes,
    longName: phase.PLongDes,
    order: phase.Porder,
    code: phase.PhaseCode,
    group: phase.PhaseGroup,
  }]));

  const eliminationMatches = (payload.Matchs ?? []).map((row) => normalizeEliminationMatch(row, phaseById));
  const playedEliminationMatches = eliminationMatches.filter((match) => !match.isBye);
  const poolBouts = (payload.PRDetails ?? []).map(normalizePoolBout);
  const poolStandings = (payload.PoolStanding ?? []).map(normalizePoolStanding);
  const poolResults = (payload.PoolResults ?? []).map(normalizePoolResult);
  const classment = (payload.Classment ?? []).map(normalizeClassment);

  const athleteLicences = new Set([
    ...(payload.Classment ?? []).map((row) => row.Licence),
    ...(payload.IniStarts ?? []).map((row) => row.Licence),
    ...(payload.PoolStanding ?? []).map((row) => row.Licence),
  ].filter(Boolean));

  return {
    ok: true,
    source,
    general: {
      sportName: general.SportName,
      eventName: general.EventName,
      openDate: general.OpenDate,
      venue: general.Venue,
      competitionNo: general.CompetitionNo,
      exemptionNo: general.ExemptionNo,
      poolFencerNo: general.PoolFencerNo,
      poolQualifyNo: general.PoolQualifyNo,
      preDeStartPhase: general.PDEstartPhase,
      deStartPhase: general.DEstartPhase,
      sportCode: general.Scode,
      eventCode: general.Ecode,
    },
    summary: {
      classmentCount: payload.Classment?.length ?? 0,
      initialSeedCount: payload.IniStarts?.length ?? 0,
      poolCount: payload.Pools?.length ?? 0,
      poolStandingCount: payload.PoolStanding?.length ?? 0,
      poolResultCount: payload.PoolResults?.length ?? 0,
      poolBoutCount: poolBouts.length,
      tableauCount: payload.Tableaus?.length ?? 0,
      eliminationMatchCount: eliminationMatches.length,
      playedEliminationMatchCount: playedEliminationMatches.length,
      byeMatchCount: eliminationMatches.length - playedEliminationMatches.length,
      athleteCountByLicence: athleteLicences.size,
    },
    distributions: {
      poolStatus: countBy(payload.Pools ?? [], (row) => row.PoolStatus),
      poolRemark: countBy(payload.PoolStanding ?? [], (row) => row.Remark || '(空)'),
      tableau: countBy(payload.Tableaus ?? [], (row) => row.PLongDes),
      eliminationByPhase: countBy(eliminationMatches, (row) => row.phase?.longName ?? '(未知阶段)'),
      eliminationResult: countBy(eliminationMatches, (row) => `${row.home.result || ''}/${row.away.result || ''}`),
      medal: countBy(payload.Classment ?? [], (row) => row.Medal || '(无奖牌)'),
    },
    normalized: {
      classment,
      poolStandings,
      poolResults,
      poolBouts,
      eliminationMatches,
    },
    completeness: getCompleteness(payload),
    analysisCapabilities: [
      '项目概要',
      '最终排名',
      '初始排位',
      '小组赛排名',
      '小组赛每场比分',
      '小组赛晋级人数',
      '淘汰赛阶段结构',
      '淘汰赛每场比分',
      '选手完整比赛路径',
      '对手交手记录',
      '胜负和净胜剑统计',
    ],
    privacyRecommendation: {
      publicFields: ['rank', 'name', 'club', 'scores', 'winner', 'medal'],
      privateFields: ['Licence', 'Birthday'],
      note: 'Licence 和 Birthday 只用于内部消歧，不建议公开展示。',
    },
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const raw = await readFile(args.input, 'utf8');
  const payload = JSON.parse(raw);
  const report = buildScoreReport(payload, {
    input: args.input,
    sourceUrl: args.sourceUrl,
    analyzedAt: new Date().toISOString(),
  });

  await mkdir(args.outputDir, { recursive: true });
  const eventCode = report.general.eventCode ?? 'unknown';
  const outputPath = path.join(args.outputDir, `score-${eventCode}-analysis.json`);
  await writeFile(outputPath, stableStringify(report), 'utf8');

  console.log(stableStringify({
    ok: true,
    outputPath,
    general: report.general,
    summary: report.summary,
    distributions: report.distributions,
  }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
