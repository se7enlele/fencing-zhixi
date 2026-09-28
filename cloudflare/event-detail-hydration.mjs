export function derivedLatestMatches(event) {
  return (event?.eliminationPhaseGroups || [])
    .flatMap((group) => group.matches || [])
    .sort((left, right) => Number(right.matchId || 0) - Number(left.matchId || 0))
    .slice(0, 12);
}

export function compactEventDetail(event) {
  if (!Array.isArray(event?.latestMatches) || !event.latestMatches.length) return event;
  const derived = derivedLatestMatches(event);
  if (JSON.stringify(derived) !== JSON.stringify(event.latestMatches)) return event;
  const { latestMatches, ...compact } = event;
  return compact;
}

export function hydrateEventDetail(event) {
  if (!event || Object.hasOwn(event, 'latestMatches') || !event.eliminationPhaseGroups?.length) return event;
  return { ...event, latestMatches: derivedLatestMatches(event) };
}
