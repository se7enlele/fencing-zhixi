export function derivedLatestMatches(event) {
  return (event?.eliminationPhaseGroups || [])
    .flatMap((group) => group.matches || [])
    .sort((left, right) => Number(right.matchId || 0) - Number(left.matchId || 0))
    .slice(0, 12);
}

export function compactEventDetail(event) {
  if (!event) return event;
  const compact = { ...event };
  const processLists = ['athleteProfiles', 'clubProfiles', 'poolGroups', 'poolBouts', 'poolStandings', 'eliminationMatches'];
  if (event.isPreEvent && processLists.every(key => Array.isArray(event[key]) && event[key].length === 0)) {
    for (const key of processLists) delete compact[key];
    compact._emptyProcessLists = true;
  }
  if (event.latestMatches?.length && JSON.stringify(derivedLatestMatches(event)) === JSON.stringify(event.latestMatches)) delete compact.latestMatches;
  const bouts = (event.poolGroups || []).flatMap(group => group.bouts || []);
  if (event.poolBouts?.length && bouts.length) {
    const positions = new Map(bouts.map((bout, index) => [JSON.stringify(bout), index]));
    const indexes = event.poolBouts.map(bout => positions.get(JSON.stringify(bout)));
    if (indexes.every(index => Number.isInteger(index))) {
      delete compact.poolBouts;
      compact._poolBoutIndexes = indexes;
    }
  }
  return compact;
}

export function hydrateEventDetail(event) {
  if (!event) return event;
  const hydrated = { ...event };
  if (event._emptyProcessLists === true) {
    for (const key of ['athleteProfiles', 'clubProfiles', 'poolGroups', 'poolBouts', 'poolStandings', 'eliminationMatches']) hydrated[key] = [];
    delete hydrated._emptyProcessLists;
  }
  if (!Object.hasOwn(event, 'latestMatches') && event.eliminationPhaseGroups?.length) hydrated.latestMatches = derivedLatestMatches(event);
  if (Array.isArray(event._poolBoutIndexes)) {
    const bouts = (event.poolGroups || []).flatMap(group => group.bouts || []);
    if (event._poolBoutIndexes.some(index => !Number.isInteger(index) || index < 0 || index >= bouts.length)) throw new Error('Invalid compact pool bout index');
    hydrated.poolBouts = event._poolBoutIndexes.map(index => bouts[index]);
    delete hydrated._poolBoutIndexes;
  }
  return hydrated;
}
