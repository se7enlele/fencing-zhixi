export function derivedLatestMatches(event) {
  return (event?.eliminationPhaseGroups || [])
    .flatMap((group) => group.matches || [])
    .filter((match) => !match.isBye)
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
  for (const key of ['participants', 'athleteProfiles']) {
    const rows = compact[key];
    if (!Array.isArray(rows) || rows.length < 2 || rows.some(row => !row || typeof row !== 'object' || Array.isArray(row))) continue;
    const fields = Object.keys(rows[0]);
    if (!fields.length || fields.some(field => ['__proto__', 'constructor', 'prototype'].includes(field))) continue;
    if (!rows.every(row => JSON.stringify(Object.keys(row)) === JSON.stringify(fields) && fields.every(field => row[field] !== undefined))) continue;
    compact._personTables ||= {};
    compact._personTables[key] = { fields, rows: rows.map(row => fields.map(field => row[field])) };
    delete compact[key];
  }
  if (event.latestMatches?.length && JSON.stringify(derivedLatestMatches(event)) === JSON.stringify(event.latestMatches)) delete compact.latestMatches;
  if (event.eliminationPhaseGroups?.length) {
    compact.eliminationPhaseGroups = event.eliminationPhaseGroups.map(group => {
      const matches = group.matches || [];
      if (matches.length < 2) return group;
      const fields = Object.keys(matches[0]);
      if (!matches.every(match => JSON.stringify(Object.keys(match)) === JSON.stringify(fields) && fields.every(field => match[field] !== undefined))) return group;
      const { matches: ignored, ...rest } = group;
      const sharedPhase = matches[0].phase && matches.every(match => JSON.stringify(match.phase) === JSON.stringify(matches[0].phase));
      return { ...rest, ...(sharedPhase ? { _matchPhase: matches[0].phase } : {}), _matchFields: fields, _matchRows: matches.map(match => fields.map(field => sharedPhase && field === 'phase' ? null : match[field])) };
    });
  }
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
  if (event._personTables) {
    for (const [key, table] of Object.entries(event._personTables)) {
      const { fields, rows } = table || {};
      if (!['participants', 'athleteProfiles'].includes(key) || !Array.isArray(fields) || !fields.length || fields.some(field => typeof field !== 'string' || ['__proto__', 'constructor', 'prototype'].includes(field)) || new Set(fields).size !== fields.length || !Array.isArray(rows) || rows.some(row => !Array.isArray(row) || row.length !== fields.length)) throw new Error('Invalid compact person table');
      hydrated[key] = rows.map(row => Object.fromEntries(fields.map((field, index) => [field, row[index]])));
    }
    delete hydrated._personTables;
  }
  if (event.eliminationPhaseGroups?.length) {
    hydrated.eliminationPhaseGroups = event.eliminationPhaseGroups.map(group => {
      if (!Array.isArray(group._matchFields) || !Array.isArray(group._matchRows)) return group;
      const { _matchFields: fields, _matchRows: rows, _matchPhase: sharedPhase, ...rest } = group;
      if (fields.some(field => typeof field !== 'string' || ['__proto__', 'constructor', 'prototype'].includes(field)) || new Set(fields).size !== fields.length || rows.some(row => !Array.isArray(row) || row.length !== fields.length)) throw new Error('Invalid compact tableau rows');
      return { ...rest, matches: rows.map(row => Object.fromEntries(fields.map((field, index) => [field, sharedPhase && field === 'phase' ? sharedPhase : row[index]]))) };
    });
  }
  if (event._emptyProcessLists === true) {
    for (const key of ['athleteProfiles', 'clubProfiles', 'poolGroups', 'poolBouts', 'poolStandings', 'eliminationMatches']) hydrated[key] = [];
    delete hydrated._emptyProcessLists;
  }
  if (!Object.hasOwn(event, 'latestMatches') && event.eliminationPhaseGroups?.length) hydrated.latestMatches = derivedLatestMatches(hydrated);
  if (Array.isArray(event._poolBoutIndexes)) {
    const bouts = (event.poolGroups || []).flatMap(group => group.bouts || []);
    if (event._poolBoutIndexes.some(index => !Number.isInteger(index) || index < 0 || index >= bouts.length)) throw new Error('Invalid compact pool bout index');
    hydrated.poolBouts = event._poolBoutIndexes.map(index => bouts[index]);
    delete hydrated._poolBoutIndexes;
  }
  return hydrated;
}
