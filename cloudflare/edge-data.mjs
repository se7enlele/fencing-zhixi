const UNKNOWN = '未知';

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function scoreValue(value) {
  if (value === 'V') return 'V';
  return numberOrNull(value);
}

function countBy(rows, getter) {
  return rows.reduce((map, row) => {
    const value = getter(row) ?? UNKNOWN;
    map[value] = (map[value] ?? 0) + 1;
    return map;
  }, {});
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

export function parseUploadedJsonText(content) {
  const text = String(content || '').trim();
  if (!text) throw new Error('上传内容为空。');

  try {
    return JSON.parse(text);
  } catch {
    const objectMatch = text.match(/=\s*({[\s\S]*}|\[[\s\S]*\])\s*;?\s*$/);
    if (!objectMatch) throw new Error('无法识别 JSON 或官方 score JS 数据。');
    return JSON.parse(objectMatch[1]);
  }
}

export function looksLikeProjectList(payload) {
  return Array.isArray(payload)
    && payload.length > 0
    && payload.every((row) => row && typeof row === 'object')
    && payload.some((row) => row.eventCode && row.sportId && row.eventName);
}

export function extractRosterRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.records)) return payload.data.records;
  if (Array.isArray(payload?.records)) return payload.records;
  return null;
}

export function looksLikeRegistrationRoster(payload) {
  const rows = extractRosterRows(payload);
  return Array.isArray(rows)
    && rows.length > 0
    && rows.every((row) => row && typeof row === 'object')
    && rows.some((row) => row.eventCode && row.sportCode && (row.athleteName || row.registerCode));
}

export function rosterDedupeKey(row) {
  if (row.sigupId) return `sigup:${row.sigupId}`;
  if (row.sportCode && row.eventCode && row.registerCode) {
    return `entry:${row.sportCode}:${row.eventCode}:${row.registerCode}`;
  }
  return `fallback:${row.sportCode || ''}:${row.eventCode || ''}:${row.athleteName || ''}:${row.birthday || ''}:${row.organCode || ''}`;
}

export function normalizeRosterRecord(row) {
  return {
    sigupId: row.sigupId || null,
    registerType: row.registerType || null,
    registerId: row.registerId || null,
    registerCode: row.registerCode || null,
    athleteName: row.athleteName || '',
    birthday: row.birthday || null,
    sex: row.sex || null,
    sexDes: row.sexDes || null,
    weapon: row.weapon || null,
    weaponDes: row.weaponDes || null,
    hand: row.hand || null,
    sportCode: row.sportCode || null,
    sportName: row.sportName || null,
    eventCode: row.eventCode || null,
    eventName: row.eventName || null,
    organCode: row.organCode || null,
    organShortName: row.organShortName || null,
    organName: row.organName || null,
    approveStatus: row.approveStatus || null,
    sigupTime: row.sigupTime || null,
    sigupPoints: row.sigupPoints ?? null,
    sigupRank: row.sigupRank ?? null,
    regType: row.regType || null,
    regTypeDes: row.regTypeDes || null,
    dedupeKey: rosterDedupeKey(row),
  };
}

export function buildRegistrationRosterReport(payload, source = {}) {
  const rows = extractRosterRows(payload);
  if (!Array.isArray(rows)) throw new Error('报名名单数据应该包含 data.records 或 records。');
  const records = rows.map(normalizeRosterRecord);
  return {
    ok: true,
    importType: 'registration-roster',
    source,
    page: {
      current: payload?.data?.current ?? payload?.current ?? null,
      size: payload?.data?.size ?? payload?.size ?? records.length,
      total: payload?.data?.total ?? payload?.total ?? null,
    },
    summary: {
      recordCount: records.length,
      sportCodes: [...new Set(records.map((row) => row.sportCode).filter(Boolean))],
      eventCodes: [...new Set(records.map((row) => row.eventCode).filter(Boolean))],
      athleteCount: new Set(records.map((row) => row.registerCode || row.athleteName).filter(Boolean)).size,
      clubCount: new Set(records.map((row) => row.organName || row.organCode).filter(Boolean)).size,
    },
    normalized: { records },
  };
}

export function buildProjectListPreview(rows, source = {}) {
  const sportIds = [...new Set(rows.map((row) => row.sportId).filter(Boolean))];
  const eventCodes = [...new Set(rows.map((row) => row.eventCode).filter(Boolean))];
  return {
    importType: 'projectlist',
    eventCode: null,
    targetFile: `projectlist-${sportIds[0] || 'unknown'}-analysis.json`,
    general: {
      sportName: `项目清单 ${sportIds[0] || ''}`.trim(),
      eventName: `${rows.length} 个项目`,
      openDate: null,
      venue: null,
      sportId: sportIds[0] || null,
    },
    summary: {
      itemCount: rows.length,
      totalParticipants: rows.reduce((sum, row) => sum + (Number(row.totalRegNumber) || 0), 0),
      eventCodeCount: eventCodes.length,
      classmentCount: null,
      poolCount: null,
      poolBoutCount: null,
      playedEliminationMatchCount: null,
      byeMatchCount: null,
    },
    report: {
      ok: true,
      source,
      summary: {
        itemCount: rows.length,
        sportIds,
        eventCodeCount: eventCodes.length,
      },
      normalizedItems: rows,
    },
    note: '这是比赛项目清单，只补充项目元数据；前台成绩、对阵和分析仍需要导入对应 score JS。',
  };
}

export function buildScoreReport(payload, source = {}) {
  const general = payload.General?.[0] ?? {};
  const eventCode = general.Ecode || general.eventCode || payload.eventCode;
  if (!eventCode || !payload.General) {
    throw new Error('未识别到官方 score 数据中的 eventCode。请确认上传的是 /Resource/score/{eventCode}.js 的内容；projectlist 只能作为项目清单预览，不能生成成绩分析。');
  }

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
      eventCode,
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
      poolRemark: countBy(payload.PoolStanding ?? [], (row) => row.Remark || UNKNOWN),
      tableau: countBy(payload.Tableaus ?? [], (row) => row.PLongDes),
      eliminationByPhase: countBy(eliminationMatches, (row) => row.phase?.longName ?? UNKNOWN),
      eliminationResult: countBy(eliminationMatches, (row) => `${row.home.result || ''}/${row.away.result || ''}`),
      medal: countBy(payload.Classment ?? [], (row) => row.Medal || '无奖牌'),
    },
    normalized: {
      classment,
      poolStandings,
      poolResults,
      poolBouts,
      eliminationMatches,
    },
  };
}

export function previewImportPayload(payload, meta = {}) {
  if (looksLikeProjectList(payload)) return buildProjectListPreview(payload, meta);
  if (looksLikeRegistrationRoster(payload)) {
    const report = buildRegistrationRosterReport(payload, {
      fileName: meta.fileName || null,
      sourceUrl: meta.sourceUrl || null,
      importedAt: new Date().toISOString(),
    });
    const sportCode = report.summary?.sportCodes?.[0] || 'unknown';
    const page = report.page?.current || Date.now();
    return {
      importType: 'registration-roster',
      eventCode: null,
      targetFile: `registration-roster-${sportCode}-${page}-${Date.now()}.json`,
      general: {
        sportName: report.normalized.records.find((row) => row.sportName)?.sportName || `报名名单 ${sportCode}`,
        eventName: `${report.summary.recordCount} 条报名记录`,
        openDate: null,
        venue: null,
        sportCode,
      },
      summary: {
        recordCount: report.summary.recordCount,
        athleteCount: report.summary.athleteCount,
        clubCount: report.summary.clubCount,
        sportCodes: report.summary.sportCodes,
        eventCodes: report.summary.eventCodes,
        pageCurrent: report.page.current,
        pageSize: report.page.size,
        pageTotal: report.page.total,
        classmentCount: null,
        poolCount: null,
        poolBoutCount: null,
        playedEliminationMatchCount: null,
        byeMatchCount: null,
      },
      report,
      note: '这是报名名单分页数据；每页确认一次会追加为一个批次，后续按报名记录去重合并。',
    };
  }
  const report = buildScoreReport(payload, {
    fileName: meta.fileName || null,
    sourceUrl: meta.sourceUrl || null,
    importedAt: new Date().toISOString(),
  });
  return {
    importType: 'score',
    eventCode: report.general.eventCode,
    targetFile: `score-${report.general.eventCode}-analysis.json`,
    general: report.general,
    summary: report.summary,
    report,
  };
}

export function formatShortEventName(name) {
  const text = String(name || '').trim();
  const age = text.match(/U\d+|\d+\+/)?.[0] || '';
  const gender = text.includes('男子') || text.includes('男') ? '男' : text.includes('女子') || text.includes('女') ? '女' : '';
  const weapon = text.includes('花剑') ? '花' : text.includes('重剑') ? '重' : text.includes('佩剑') ? '佩' : '';
  const type = text.includes('团体') ? '团体' : '';
  return [age, `${gender}${weapon}`.trim(), type].filter(Boolean).join(' ') || text;
}

export function inferRegionFromVenue(venue) {
  if (!venue) return '待确认';
  const normalized = String(venue).replace(/[·\s]/g, '');
  if (normalized.includes('北京')) return normalized.match(/北京[^·\s]*/)?.[0] || '北京';
  if (normalized.includes('上海')) return normalized.match(/上海[^·\s]*/)?.[0] || '上海';
  if (normalized.includes('河北')) return normalized.match(/河北[^·\s]*/)?.[0] || '河北';
  if (normalized.includes('山东')) return normalized.match(/山东[^·\s]*/)?.[0] || '山东';
  return normalized.split(/[市区县]/)[0] || normalized;
}

function birthHalfYear(birthday) {
  const match = String(birthday || '').match(/^(20\d{2})-(\d{2})-/);
  if (!match) return null;
  return `${match[1]} ${Number(match[2]) <= 6 ? '上半年' : '下半年'}`;
}

function makeAthleteId(name, licence, club) {
  return encodeURIComponent(licence || `${name || 'unknown'}__${club || 'unknown'}`);
}

function makeClubId(club) {
  return encodeURIComponent(club || 'unknown');
}

export function toEventSummary(report, fileName) {
  const athleteNames = [...new Set((report.normalized?.classment ?? [])
    .map((row) => row.name)
    .filter(Boolean))];
  return {
    fileName,
    eventCode: report.general?.eventCode,
    sportCode: report.general?.sportCode,
    sportName: report.general?.sportName,
    eventName: report.general?.eventName,
    shortEventName: formatShortEventName(report.general?.eventName),
    openDate: report.general?.openDate,
    venue: report.general?.venue,
    competitionNo: report.general?.competitionNo,
    poolCount: report.summary?.poolCount,
    poolQualifyNo: report.general?.poolQualifyNo,
    deStartPhase: report.general?.deStartPhase,
    eliminationMatchCount: report.summary?.eliminationMatchCount,
    playedEliminationMatchCount: report.summary?.playedEliminationMatchCount,
    byeMatchCount: report.summary?.byeMatchCount,
    athleteNames,
  };
}

export function buildEventDetail(report, fileName) {
  const summary = toEventSummary(report, fileName);
  const classment = report.normalized?.classment ?? [];
  const poolResults = report.normalized?.poolResults ?? [];
  const poolStandings = report.normalized?.poolStandings ?? [];
  const poolBouts = report.normalized?.poolBouts ?? [];
  const eliminationMatches = report.normalized?.eliminationMatches ?? [];
  const playedElimination = eliminationMatches.filter((match) => !match.isBye);
  const poolByLicence = new Map(poolResults.filter((row) => row.licence).map((row) => [row.licence, row]));

  const eliminationPhaseGroups = Object.values(playedElimination.reduce((groups, match) => {
    const key = match.phase?.longName || '淘汰赛';
    if (!groups[key]) groups[key] = { phase: key, order: match.phase?.order ?? 999, matches: [] };
    groups[key].matches.push(match);
    return groups;
  }, {})).sort((a, b) => a.order - b.order);

  const participants = classment.map((entry) => {
    const pool = entry.licence ? poolByLicence.get(entry.licence) : null;
    return {
      id: makeAthleteId(entry.name, entry.licence, entry.club),
      name: entry.name,
      licence: entry.licence,
      club: entry.club,
      finalRank: entry.rank,
      medal: entry.medal,
      ageBand: birthHalfYear(entry.birthday),
      poolId: pool?.poolId ?? null,
      drawNo: pool?.drawNo ?? null,
      poolRank: pool?.phaseRank ?? null,
      poolWins: pool?.wins ?? null,
      poolMatches: pool?.matches ?? null,
      poolDiff: pool?.indicator ?? null,
      eliminationWins: 0,
      eliminationLosses: 0,
    };
  });

  const participantByLicence = new Map(participants.filter((item) => item.licence).map((item) => [item.licence, item]));
  for (const match of playedElimination) {
    const home = participantByLicence.get(match.home.licence);
    const away = participantByLicence.get(match.away.licence);
    if (home) match.home.result === 'W' ? home.eliminationWins += 1 : home.eliminationLosses += 1;
    if (away) match.away.result === 'W' ? away.eliminationWins += 1 : away.eliminationLosses += 1;
  }

  const poolGroups = Object.values(poolResults.reduce((groups, row) => {
    const poolId = row.poolId || 'unknown';
    if (!groups[poolId]) groups[poolId] = { poolId, title: `小组 ${Object.keys(groups).length + 1}`, athletes: [], bouts: [] };
    groups[poolId].athletes.push({
      id: makeAthleteId(row.name, row.licence, row.club),
      drawNo: row.drawNo,
      name: row.name,
      licence: row.licence,
      club: row.club,
      wins: row.wins,
      matches: row.matches,
      scored: row.hitsScored,
      received: row.hitsReceived,
      diff: row.indicator,
      phaseRank: row.phaseRank,
    });
    return groups;
  }, {})).map((group) => ({
    ...group,
    athletes: group.athletes.sort((a, b) => (a.phaseRank ?? 999) - (b.phaseRank ?? 999)),
    bouts: poolBouts.filter((bout) => String(bout.poolId) === String(group.poolId)).slice(0, 12),
  }));

  const clubDistribution = Object.fromEntries(
    Object.entries(countBy(classment, (entry) => entry.club || UNKNOWN)).sort((a, b) => b[1] - a[1]).slice(0, 20),
  );
  const birthBuckets = Object.values(classment.reduce((acc, entry) => {
    const label = birthHalfYear(entry.birthday) || UNKNOWN;
    if (!acc[label]) acc[label] = { label, entrants: 0, top8: 0, medals: 0, bestRank: 999 };
    acc[label].entrants += 1;
    if (entry.rank && entry.rank <= 8) acc[label].top8 += 1;
    if (entry.medal) acc[label].medals += 1;
    if (entry.rank && entry.rank < acc[label].bestRank) acc[label].bestRank = entry.rank;
    return acc;
  }, {})).map((row) => ({
    ...row,
    bestRank: row.bestRank === 999 ? null : row.bestRank,
    top8Rate: row.entrants ? Math.round((row.top8 / row.entrants) * 100) : 0,
  }));

  const clubProfiles = Object.entries(clubDistribution).map(([club, entrants]) => ({
    id: makeClubId(club),
    club,
    entrants,
    medals: classment.filter((row) => row.club === club && row.medal).length,
    top8: classment.filter((row) => row.club === club && row.rank && row.rank <= 8).length,
    bestRank: Math.min(...classment.filter((row) => row.club === club && row.rank).map((row) => row.rank), 999),
    athletes: classment.filter((row) => row.club === club).slice(0, 4).map((row) => ({
      id: makeAthleteId(row.name, row.licence, row.club),
      name: row.name,
      rank: row.rank,
      medal: row.medal,
    })),
  })).map((club) => ({ ...club, bestRank: club.bestRank === 999 ? null : club.bestRank }));

  const champion = classment[0] || null;
  return {
    ...summary,
    region: inferRegionFromVenue(summary.venue),
    distributions: report.distributions,
    topPoolStanding: poolStandings.slice(0, 12),
    latestMatches: playedElimination.slice(-12).reverse(),
    eliminationPhaseGroups,
    poolBouts: poolBouts.slice(0, 40),
    poolGroups,
    participants,
    eliminationLeaders: participants
      .map((item) => ({ ...item, wins: item.eliminationWins, losses: item.eliminationLosses, diff: item.eliminationWins - item.eliminationLosses }))
      .sort((a, b) => b.wins - a.wins || b.diff - a.diff)
      .slice(0, 10),
    championPath: playedElimination.filter((match) => match.winner.name === champion?.name).map((match) => ({
      phase: match.phase?.longName || '淘汰赛',
      matchCode: match.matchCode,
      championName: match.winner.name,
      championClub: match.winner.club,
      championScore: match.home.name === match.winner.name ? match.home.points : match.away.points,
      opponentName: match.home.name === match.winner.name ? match.away.name : match.home.name,
      opponentClub: match.home.name === match.winner.name ? match.away.club : match.home.club,
      opponentScore: match.home.name === match.winner.name ? match.away.points : match.home.points,
    })),
    keyOpponents: [],
    insights: {
      headline: champion ? `${champion.name} 获得冠军` : '暂无冠军信息',
      summaryCards: [
        { title: '冠军', value: champion?.name || '-', detail: champion?.club || '' },
        { title: '晋级线', value: `${summary.poolQualifyNo ?? '-'} / ${summary.competitionNo ?? '-'}`, detail: '小组赛后淘汰' },
        { title: '淘汰赛', value: `${summary.playedEliminationMatchCount ?? 0} 场`, detail: `Bye ${summary.byeMatchCount ?? 0} 场` },
      ],
      bullets: champion ? [`${champion.name} 最终排名第 1。`] : [],
      breakout: [],
      fade: [],
    },
    athleteProfiles: participants,
    clubProfiles,
    birthBuckets,
    clubDistribution,
  };
}

function buildCompetitionInsights(items) {
  const totalCompetitionNo = items.reduce((sum, item) => sum + (Number(item.competitionNo) || 0), 0);
  const totalPoolQualifyNo = items.reduce((sum, item) => sum + (Number(item.poolQualifyNo) || 0), 0);
  const totalPlayedElimination = items.reduce((sum, item) => sum + (Number(item.playedEliminationMatchCount) || 0), 0);
  const totalBye = items.reduce((sum, item) => sum + (Number(item.byeMatchCount) || 0), 0);
  const largestEvent = [...items].sort((a, b) => (Number(b.competitionNo) || 0) - (Number(a.competitionNo) || 0))[0] || null;
  return {
    totalCompetitionNo,
    totalPoolQualifyNo,
    totalPlayedElimination,
    totalBye,
    largestEvent,
    eventCharts: items,
    qualifyRate: totalCompetitionNo ? Math.round((totalPoolQualifyNo / totalCompetitionNo) * 100) : 0,
    eliminationPlayRate: totalPlayedElimination + totalBye ? Math.round((totalPlayedElimination / (totalPlayedElimination + totalBye)) * 100) : 0,
    summaryCards: [
      { title: '总人数', value: totalCompetitionNo, detail: `${items.length} 个项目` },
      { title: '晋级人数', value: totalPoolQualifyNo, detail: totalPoolQualifyNo === totalCompetitionNo ? '全部晋级' : '含小组淘汰' },
      { title: '淘汰赛', value: `${totalPlayedElimination} 场`, detail: `Bye ${totalBye} 场` },
    ],
    bullets: largestEvent ? [`${largestEvent.shortEventName} 人数最多，${largestEvent.competitionNo} 人。`] : [],
  };
}

export function groupEventsBySport(events) {
  const grouped = new Map();
  for (const event of events) {
    const sportCode = event.sportCode || event.fileName || event.eventCode;
    if (!grouped.has(sportCode)) {
      grouped.set(sportCode, {
        sportCode,
        sportName: event.sportName,
        venue: event.venue,
        region: inferRegionFromVenue(event.venue),
        dates: new Set(),
        items: [],
      });
    }
    const bucket = grouped.get(sportCode);
    if (event.openDate) bucket.dates.add(event.openDate);
    bucket.items.push(event);
  }
  return [...grouped.values()].map((bucket) => ({
    sportCode: bucket.sportCode,
    sportName: bucket.sportName,
    venue: bucket.venue,
    region: bucket.region,
    dateLabel: bucket.dates.size ? [...bucket.dates].sort().join(' / ') : '日期待确认',
    itemCount: bucket.items.length,
    insights: buildCompetitionInsights(bucket.items),
    items: bucket.items.sort((a, b) => String(a.eventName).localeCompare(String(b.eventName), 'zh-CN')),
  })).sort((a, b) => String(a.sportName).localeCompare(String(b.sportName), 'zh-CN'));
}

export function buildAthleteDirectoryFromEvents(eventsByCode) {
  const athletes = new Map();
  for (const event of Object.values(eventsByCode)) {
    for (const athlete of event.athleteProfiles || event.participants || []) {
      const id = athlete.id || makeAthleteId(athlete.name, athlete.licence, athlete.club);
      if (!athletes.has(id)) {
        athletes.set(id, {
          id,
          name: athlete.name,
          club: athlete.club,
          bestRank: athlete.finalRank ?? null,
          medals: athlete.medal ? 1 : 0,
          appearances: 0,
          eliminationWins: 0,
          eliminationLosses: 0,
          latestRank: athlete.finalRank ?? null,
          latestEventName: event.shortEventName,
          latestDate: event.openDate,
          events: [],
          opponents: [],
        });
      }
      const row = athletes.get(id);
      row.appearances += 1;
      row.eliminationWins += Number(athlete.eliminationWins) || 0;
      row.eliminationLosses += Number(athlete.eliminationLosses) || 0;
      if (athlete.medal) row.medals += 1;
      if (athlete.finalRank && (!row.bestRank || athlete.finalRank < row.bestRank)) row.bestRank = athlete.finalRank;
      if (!row.latestDate || String(event.openDate || '').localeCompare(String(row.latestDate || ''), 'zh-CN') > 0) {
        row.latestRank = athlete.finalRank ?? row.latestRank;
        row.latestEventName = event.shortEventName;
        row.latestDate = event.openDate;
      }
      row.events.push({
        sportCode: event.sportCode,
        sportName: event.sportName,
        eventCode: event.eventCode,
        eventName: event.eventName,
        shortEventName: event.shortEventName,
        openDate: event.openDate,
        venue: event.venue,
        finalRank: athlete.finalRank,
        medal: athlete.medal,
        poolRank: athlete.poolRank,
        poolWins: athlete.poolWins,
        poolMatches: athlete.poolMatches,
        poolDiff: athlete.poolDiff,
        ageBand: athlete.ageBand,
        eliminationWins: athlete.eliminationWins,
        eliminationLosses: athlete.eliminationLosses,
      });
    }
  }
  return [...athletes.values()].sort((a, b) => (a.bestRank ?? 999) - (b.bestRank ?? 999) || b.appearances - a.appearances);
}

export function buildClubDirectoryFromEvents(eventsByCode) {
  const clubs = new Map();
  for (const event of Object.values(eventsByCode)) {
    for (const club of event.clubProfiles || []) {
      const id = club.id || makeClubId(club.club);
      if (!clubs.has(id)) {
        clubs.set(id, { id, club: club.club, medals: 0, top8: 0, entrants: 0, bestRank: null, events: [] });
      }
      const row = clubs.get(id);
      row.medals += Number(club.medals) || 0;
      row.top8 += Number(club.top8) || 0;
      row.entrants += Number(club.entrants) || 0;
      if (club.bestRank && (!row.bestRank || club.bestRank < row.bestRank)) row.bestRank = club.bestRank;
      row.events.push({
        sportCode: event.sportCode,
        sportName: event.sportName,
        eventCode: event.eventCode,
        eventName: event.eventName,
        entrants: club.entrants,
        medals: club.medals,
        top8: club.top8,
        bestRank: club.bestRank,
      });
    }
  }
  return [...clubs.values()].sort((a, b) => b.medals - a.medals || b.top8 - a.top8 || (a.bestRank ?? 999) - (b.bestRank ?? 999));
}
