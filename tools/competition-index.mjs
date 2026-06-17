export function compactCompetitionForIndex(competition) {
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
    itemCount: competition.items?.length || 0,
    items: (competition.items || []).map((item) => ({
      eventCode: item.eventCode,
      eventName: item.eventName,
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
    })),
  };
}

export function compactCompetitionIndex(competitions = []) {
  return competitions.map(compactCompetitionForIndex);
}
