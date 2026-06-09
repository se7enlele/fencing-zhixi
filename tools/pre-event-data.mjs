function parseDate(value) {
  const timestamp = Date.parse(String(value || '').replace(' ', 'T'));
  return Number.isFinite(timestamp) ? timestamp : null;
}

function normalizeDateLabel(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  const dates = [...text.matchAll(/(20\d{2})[.\-/年](\d{1,2})[.\-/月](\d{1,2})/g)]
    .map((match) => {
      const year = match[1];
      const month = String(Number(match[2])).padStart(2, '0');
      const day = String(Number(match[3])).padStart(2, '0');
      return `${year}.${month}.${day}`;
    });
  const uniqueDates = [...new Set(dates)].sort();
  if (!uniqueDates.length) return text;
  if (uniqueDates.length === 1) return uniqueDates[0];
  return `${uniqueDates[0]} / ${uniqueDates[uniqueDates.length - 1]}`;
}

function inferStatusFromDates(items) {
  const now = Date.now();
  const starts = items.map((item) => parseDate(item.openDate || item.startDate)).filter((value) => value !== null);
  const ends = items.map((item) => parseDate(item.closeDate || item.endDate)).filter((value) => value !== null);
  if (ends.length && Math.max(...ends) < now) return 'completed';
  if (starts.length && Math.min(...starts) > now) return 'upcoming';
  return 'registration';
}

function inferPlatformStatus(event) {
  const now = Date.now();
  const start = parseDate(event.startDate);
  const end = parseDate(event.endDate);
  const signStart = parseDate(event.signStartDate);
  const signEnd = parseDate(event.signAthEndDate);

  if (String(event.sportactive) === '2' || (end && end < now)) return 'completed';
  if (String(event.sigupactive) === '1') return 'registration';
  if (signStart && signEnd && signStart <= now && signEnd >= now) return 'registration';
  if (start && end && start <= now && end >= now) return 'live';
  return 'upcoming';
}

function statusLabel(status) {
  if (status === 'registration') return '报名中';
  if (status === 'upcoming') return '未开赛';
  if (status === 'live') return '进行中';
  if (status === 'completed') return '已结束';
  return '状态待确认';
}

function normalizeProjectItem(item) {
  const participantCount = Number(item.participantCount ?? item.totalRegNumber) || 0;
  return {
    sportId: item.sourceSportId || item.sportId || null,
    sportCode: item.sourceSportCode || item.sportCode || null,
    eventCode: item.sourceEventCode || item.eventCode || null,
    eventName: item.itemName || item.eventName || '',
    weapon: item.weapon || item.weaponDesc || '',
    gender: item.gender || item.genderDesc || '',
    ageGroup: item.ageGroup || item.groupName || '',
    itemType: item.itemType || item.itemTypeDesc || '',
    openDate: item.startDate || item.openDate || null,
    closeDate: item.endDate || item.closeDate || null,
    participantCount,
    expectedRegistrationCount: 0,
  };
}

function competitionNameFor(sportCode, items, rosterRows) {
  const fromRoster = rosterRows.find((row) => row.sportCode === sportCode && row.sportName)?.sportName;
  if (fromRoster) return fromRoster;
  const sportId = items.find((item) => item.sportId)?.sportId;
  return sportId ? `赛前赛事 ${sportId}` : `赛前赛事 ${sportCode}`;
}

function buildPlatformEventCompetition(event) {
  const venue = [event.provinceName, event.cityName].filter(Boolean).join(' ');
  const groupLabels = event.groupLabels || event.groups?.map((group) => group.groupName).filter(Boolean) || [];
  const status = inferPlatformStatus(event);

  return {
    sportCode: event.sportCode || String(event.sportId),
    sportId: event.sportId,
    sportName: event.sportName,
    venue,
    region: event.areaDesc || event.provinceName || '',
    dateLabel: normalizeDateLabel([event.startDate, event.endDate].filter(Boolean).join(' / ')) || '日期待确认',
    status,
    rosterStatus: 'none',
    isPreEvent: true,
    isPlatformEventList: true,
    itemCount: 0,
    groupLabels,
    platformMeta: {
      season: event.season || null,
      gameDesc: event.gameDesc || null,
      gameLevel: event.gameLevel || null,
      sportactive: event.sportactive,
      sigupactive: event.sigupactive,
      signStartDate: event.signStartDate || null,
      signAthEndDate: event.signAthEndDate || null,
      sourceCoverage: 'event-list-only',
    },
    registrationSummary: {
      rosterCount: 0,
      expectedRegistrationCount: 0,
      itemCount: 0,
    },
    insights: {
      summaryCards: [
        {
          title: '赛事状态',
          value: statusLabel(status),
          detail: event.gameDesc || '类型待确认',
        },
        {
          title: '组别覆盖',
          value: groupLabels.length,
          detail: groupLabels.slice(0, 3).join(' / ') || '组别待确认',
        },
      ],
      bullets: [
        '赛事基础信息已收录。项目规模、报名名单和赛果更新后，会形成更完整的赛前/赛后分析。',
      ],
      eventCharts: [],
    },
    items: [],
  };
}

export function buildPreEventCompetitions({
  projectLists = [],
  rosterBatches = [],
  completeRosters = new Set(),
  platformEventLists = [],
}) {
  const rosterByEvent = new Map();
  const rosterRows = [];

  for (const batch of rosterBatches) {
    for (const row of batch.report.normalized?.records || []) {
      if (!row.eventCode) continue;
      rosterRows.push(row);
      if (!rosterByEvent.has(row.eventCode)) rosterByEvent.set(row.eventCode, new Map());
      rosterByEvent.get(row.eventCode).set(row.dedupeKey, row);
    }
  }

  const competitions = new Map();

  for (const { report } of platformEventLists) {
    for (const event of report.normalizedEvents || []) {
      const sportCode = event.sportCode || String(event.sportId || '');
      if (!sportCode || competitions.has(sportCode)) continue;
      competitions.set(sportCode, buildPlatformEventCompetition(event));
    }
  }

  for (const { report } of projectLists) {
    const items = (report.normalizedItems || []).map(normalizeProjectItem);
    for (const item of items) {
      if (!item.sportCode || !item.eventCode) continue;
      if (!competitions.has(item.sportCode)) {
        competitions.set(item.sportCode, {
          sportCode: item.sportCode,
          sportName: competitionNameFor(item.sportCode, items, rosterRows),
          venue: '',
          region: '',
          status: 'upcoming',
          rosterStatus: 'none',
          isPreEvent: true,
          items: [],
        });
      }

      const roster = [...(rosterByEvent.get(item.eventCode)?.values() || [])];
      const competition = competitions.get(item.sportCode);
      if (competition.platformMeta) {
        competition.platformMeta = {
          ...competition.platformMeta,
          sourceCoverage: 'event-list-plus-projectlist',
        };
      }
      const nextItem = {
        eventCode: item.eventCode,
        eventName: item.eventName,
        shortEventName: item.eventName,
        openDate: item.openDate,
        closeDate: item.closeDate,
        competitionNo: item.participantCount || roster.length,
        registrationCount: roster.length,
        expectedRegistrationCount: item.participantCount,
        roster,
        status: 'upcoming',
        isPreEvent: true,
      };

      const existingItem = competition.items.find((row) => row.eventCode === item.eventCode);
      if (existingItem) {
        existingItem.eventName = existingItem.eventName || nextItem.eventName;
        existingItem.shortEventName = existingItem.shortEventName || nextItem.shortEventName;
        existingItem.openDate = existingItem.openDate || nextItem.openDate;
        existingItem.closeDate = existingItem.closeDate || nextItem.closeDate;
        existingItem.competitionNo = Math.max(Number(existingItem.competitionNo) || 0, Number(nextItem.competitionNo) || 0);
        existingItem.registrationCount = Math.max(Number(existingItem.registrationCount) || 0, Number(nextItem.registrationCount) || 0);
        existingItem.expectedRegistrationCount = Math.max(Number(existingItem.expectedRegistrationCount) || 0, Number(nextItem.expectedRegistrationCount) || 0);
        if ((nextItem.roster || []).length > (existingItem.roster || []).length) existingItem.roster = nextItem.roster;
      } else {
        competition.items.push(nextItem);
      }
    }
  }

  return [...competitions.values()].map((competition) => {
    const rosterCount = competition.items.reduce((sum, item) => sum + item.registrationCount, 0);
    const expectedRegistrationCount = competition.items.reduce((sum, item) => sum + item.expectedRegistrationCount, 0);
    const isComplete = completeRosters.has(competition.sportCode);
    const dateLabel = normalizeDateLabel(competition.items.map((item) => item.openDate).filter(Boolean).sort().join(' / '))
      || normalizeDateLabel(competition.dateLabel)
      || '日期待确认';

    const insights = competition.insights || {
      summaryCards: [
        {
          title: '项目数量',
          value: competition.items.length,
          detail: competition.status === 'completed' ? '项目明细' : '赛前项目',
        },
        {
          title: '报名规模',
          value: expectedRegistrationCount || rosterCount || '-',
          detail: rosterCount ? `已有名单 ${rosterCount}` : '名单待更新',
        },
      ],
      bullets: [
        rosterCount
          ? `已有 ${rosterCount} 条报名记录，可结合关注选手做赛前对标。`
          : '项目明细已收录；报名名单更新后，可分析同组对手、熟悉对手和潜在强手。',
      ],
      eventCharts: competition.items,
    };

    return {
      ...competition,
      itemCount: competition.items.length,
      dateLabel,
      status: competition.platformMeta ? competition.status : (competition.items.length ? inferStatusFromDates(competition.items) : competition.status),
      rosterStatus: rosterCount ? (isComplete ? 'complete' : 'partial') : 'none',
      registrationSummary: {
        rosterCount,
        expectedRegistrationCount,
        itemCount: competition.items.length,
      },
      insights,
    };
  });
}
