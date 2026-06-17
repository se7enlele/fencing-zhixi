function displayItemName(item) {
  return item?.shortEventName || item?.eventName || '';
}

function itemFilterLabel(item) {
  const name = displayItemName(item);
  const age = String(name).match(/U\d+|\d+\+/)?.[0] || '';
  const weapon = name.includes('男花') || name.includes('女花') ? '花剑'
    : name.includes('男重') || name.includes('女重') ? '重剑'
      : name.includes('男佩') || name.includes('女佩') ? '佩剑'
        : '';
  return [age, weapon].filter(Boolean).join(' ');
}

function compactText(value) {
  return String(value ?? '').toLowerCase().replace(/[，。、“”‘’"'|/\\()[\]{}:：；;]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function competitionCoverageLevel(competition) {
  const items = competition.items || [];
  const hasScore = items.some((item) => (
    (item.athleteProfiles || []).length
    || (item.poolGroups || []).length
    || (item.eliminationMatches || []).length
    || (item.participants || []).length
    || (!item.isPreEvent && (Number(item.playedEliminationMatchCount) > 0 || Number(item.competitionNo) > 0))
  ));
  if (hasScore) return 'score';
  const hasRoster = items.some((item) => (item.roster || []).length || Number(item.registrationCount) > 0);
  if (hasRoster || competition.rosterStatus === 'partial' || competition.rosterStatus === 'complete') return 'roster';
  if (items.length || competition.isPreEvent) return 'project';
  return 'directory';
}

function projectScope(labels) {
  const ages = [...new Set(labels.map((label) => String(label).match(/U\d+|\d+\+|年龄开放组/)?.[0]).filter(Boolean))];
  const weapons = [...new Set(labels.map((label) => {
    const text = compactText(label);
    if (text.includes('花')) return '花剑';
    if (text.includes('重')) return '重剑';
    if (text.includes('佩')) return '佩剑';
    return '';
  }).filter(Boolean))];
  const genders = [...new Set(labels.map((label) => {
    const text = compactText(label);
    if (text.includes('男')) return '男子';
    if (text.includes('女')) return '女子';
    return '';
  }).filter(Boolean))];
  return {
    ageText: ages.length ? `${ages.slice(0, 4).join(' / ')}${ages.length > 4 ? ` +${ages.length - 4}` : ''}` : '待确认',
    weaponText: weapons.length ? weapons.join(' / ') : '待确认',
    genderText: genders.length ? genders.join(' / ') : '待确认',
  };
}

export function compactCompetitionForIndex(competition) {
  const items = competition.items || [];
  const itemLabels = items.map(displayItemName).filter(Boolean);
  const itemFilters = [...new Set(items.map(itemFilterLabel).filter(Boolean))];
  const itemSummaries = [...items]
    .sort((a, b) => (Number(b.competitionNo) || Number(b.expectedRegistrationCount) || Number(b.registrationCount) || 0)
      - (Number(a.competitionNo) || Number(a.expectedRegistrationCount) || Number(a.registrationCount) || 0)
      || displayItemName(a).localeCompare(displayItemName(b), 'zh-CN'))
    .slice(0, 4)
    .map((item) => ({
      eventCode: item.eventCode,
      eventName: item.shortEventName || item.eventName,
      shortEventName: item.shortEventName,
      openDate: item.openDate,
      status: item.status,
      isPreEvent: item.isPreEvent,
      competitionNo: item.competitionNo,
      poolQualifyNo: item.poolQualifyNo,
      playedEliminationMatchCount: item.playedEliminationMatchCount,
      byeMatchCount: item.byeMatchCount,
      poolCount: item.poolCount,
      expectedRegistrationCount: item.expectedRegistrationCount,
      registrationCount: item.registrationCount,
    }));
  const metricTotals = {
    competitionNo: items.reduce((sum, item) => sum + (Number(item.competitionNo) || 0), 0),
    expectedRegistrationCount: items.reduce((sum, item) => sum + (Number(item.expectedRegistrationCount) || 0), 0),
    registrationCount: items.reduce((sum, item) => sum + (Number(item.registrationCount) || 0), 0),
    poolQualifyNo: items.reduce((sum, item) => sum + (Number(item.poolQualifyNo) || 0), 0),
    playedEliminationMatchCount: items.reduce((sum, item) => sum + (Number(item.playedEliminationMatchCount) || 0), 0),
    byeMatchCount: items.reduce((sum, item) => sum + (Number(item.byeMatchCount) || 0), 0),
  };
  const topItem = itemSummaries[0] || null;
  return {
    sportCode: competition.sportCode,
    sportName: competition.sportName,
    season: competition.season,
    dateLabel: competition.dateLabel,
    venue: competition.venue,
    region: competition.region,
    status: competition.status,
    groupLabels: competition.groupLabels,
    isPreEvent: competition.isPreEvent,
    isPlatformEventList: competition.isPlatformEventList,
    platformMeta: competition.platformMeta,
    rosterStatus: competition.rosterStatus,
    registrationSummary: competition.registrationSummary,
    coverageLevel: competitionCoverageLevel(competition),
    itemCount: items.length,
    itemSummaries,
    itemLabels: itemLabels.slice(0, 8),
    itemFilters,
    itemSearchText: compactText([...itemLabels, ...itemFilters, ...items.map((item) => item.eventCode)].filter(Boolean).join(' ')),
    metricTotals,
    topItemLabel: topItem ? displayItemName(topItem) : '',
    projectScope: projectScope(itemLabels.length ? itemLabels : competition.groupLabels || []),
  };
}

export function compactCompetitionIndex(competitions = []) {
  return competitions.map(compactCompetitionForIndex);
}
