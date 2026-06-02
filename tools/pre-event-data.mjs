function parseDate(value) {
  const timestamp = Date.parse(String(value || '').replace(' ', 'T'));
  return Number.isFinite(timestamp) ? timestamp : null;
}

function inferStatusFromDates(items) {
  const now = Date.now();
  const starts = items.map((item) => parseDate(item.openDate || item.startDate)).filter((value) => value !== null);
  const ends = items.map((item) => parseDate(item.closeDate || item.endDate)).filter((value) => value !== null);
  if (ends.length && Math.max(...ends) < now) return 'completed';
  if (starts.length && Math.min(...starts) > now) return 'upcoming';
  return 'registration';
}

function normalizeProjectItem(item) {
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
    participantCount: Number(item.participantCount ?? item.totalRegNumber) || 0,
  };
}

function competitionNameFor(sportCode, items, rosterRows) {
  const fromRoster = rosterRows.find((row) => row.sportCode === sportCode && row.sportName)?.sportName;
  if (fromRoster) return fromRoster;
  const sportId = items.find((item) => item.sportId)?.sportId;
  return sportId ? `赛前赛事 ${sportId}` : `赛前赛事 ${sportCode}`;
}

export function buildPreEventCompetitions({ projectLists = [], rosterBatches = [], completeRosters = new Set() }) {
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
      competitions.get(item.sportCode).items.push({
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
      });
    }
  }

  return [...competitions.values()].map((competition) => {
    const rosterCount = competition.items.reduce((sum, item) => sum + item.registrationCount, 0);
    const expectedRegistrationCount = competition.items.reduce((sum, item) => sum + item.expectedRegistrationCount, 0);
    const isComplete = completeRosters.has(competition.sportCode);
    return {
      ...competition,
      itemCount: competition.items.length,
      dateLabel: competition.items.map((item) => item.openDate).filter(Boolean).sort().join(' / ') || '日期待确认',
      status: inferStatusFromDates(competition.items),
      rosterStatus: rosterCount ? (isComplete ? 'complete' : 'partial') : 'none',
      registrationSummary: {
        rosterCount,
        expectedRegistrationCount,
        itemCount: competition.items.length,
      },
    };
  });
}
