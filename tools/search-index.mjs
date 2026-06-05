function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[，。、“”‘’（）()【】\[\]《》:：;；,./\\|·\-–—_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compactText(value) {
  return normalizeSearchText(value).replace(/\s+/g, '');
}

function searchTokens(value) {
  return normalizeSearchText(value).split(' ').filter(Boolean);
}

function entityMatchScore(entity, keyword, fields) {
  const compactKeyword = compactText(keyword);
  if (!compactKeyword) return 0;
  const normalizedFields = fields.map((field) => normalizeSearchText(field)).filter(Boolean);
  const compactFields = fields.map((field) => compactText(field)).filter(Boolean);
  if (compactFields.some((field) => field === compactKeyword)) return 100;
  if (compactFields.some((field) => field.startsWith(compactKeyword))) return 80;
  if (compactFields.some((field) => field.includes(compactKeyword))) return 60;
  if (normalizedFields.some((field) => field.includes(normalizeSearchText(keyword)))) return 45;
  return entity.searchText?.includes(normalizeSearchText(keyword)) ? 30 : 0;
}

function athleteMatchReason(athlete, keyword) {
  const compactKeyword = compactText(keyword);
  if (compactText(athlete.name) === compactKeyword) return '姓名完全匹配';
  if (compactText(athlete.name).includes(compactKeyword)) return '姓名匹配';
  if (compactText(athlete.club).includes(compactKeyword)) return '俱乐部匹配';
  return '相关记录匹配';
}

function clubMatchReason(club, keyword) {
  const compactKeyword = compactText(keyword);
  if (compactText(club.club) === compactKeyword) return '俱乐部完全匹配';
  if (compactText(club.club).includes(compactKeyword)) return '俱乐部名称匹配';
  return '相关记录匹配';
}

export function compactAthleteForSearch(athlete) {
  const row = {
    id: athlete.id,
    name: athlete.name,
    club: athlete.club || '',
    bestRank: athlete.bestRank ?? null,
    appearances: athlete.appearances || 0,
    medals: athlete.medals || 0,
    top8: athlete.top8 || 0,
    latestDate: athlete.latestDate || null,
    latestRank: athlete.latestRank ?? null,
    latestEventName: athlete.latestEventName || null,
    eliminationWins: athlete.eliminationWins || 0,
    eliminationLosses: athlete.eliminationLosses || 0,
  };
  row.searchText = normalizeSearchText([
    row.name,
    row.club,
    row.latestEventName,
  ].join(' '));
  return row;
}

export function compactClubForSearch(club) {
  const row = {
    id: club.id,
    club: club.club,
    entrants: club.entrants || 0,
    medals: club.medals || 0,
    top8: club.top8 || 0,
    bestRank: club.bestRank ?? null,
  };
  row.searchText = normalizeSearchText(row.club);
  return row;
}

export function buildSearchIndexes(athletes = [], clubs = []) {
  return {
    athletes: athletes.map(compactAthleteForSearch),
    clubs: clubs.map(compactClubForSearch),
  };
}

function publicAthleteResult(athlete, keyword) {
  const { searchText: _searchText, ...publicAthlete } = athlete;
  return {
    ...publicAthlete,
    matchReason: athleteMatchReason(athlete, keyword),
  };
}

function publicClubResult(club, keyword) {
  const { searchText: _searchText, ...publicClub } = club;
  return {
    ...publicClub,
    matchReason: clubMatchReason(club, keyword),
  };
}

export function searchIndexes(indexes, query, options = {}) {
  const keyword = normalizeSearchText(query);
  const compactKeyword = compactText(keyword);
  const tokens = searchTokens(keyword);
  const type = options.type || 'all';
  const athleteLimit = Number(options.athleteLimit) || 20;
  const clubLimit = Number(options.clubLimit) || 6;

  if (!keyword) {
    return { athletes: [], clubs: [] };
  }

  const matchText = (row) => (
    tokens.every((token) => row.searchText?.includes(token))
    || String(row.searchText || '').replace(/\s+/g, '').includes(compactKeyword)
  );

  const athletes = type === 'club' ? [] : (indexes.athletes || [])
    .filter(matchText)
    .map((athlete) => ({
      ...athlete,
      matchScore: entityMatchScore(athlete, keyword, [athlete.name, athlete.club]),
    }))
    .sort((a, b) => b.matchScore - a.matchScore || (a.name?.length || 99) - (b.name?.length || 99) || (a.bestRank ?? 999) - (b.bestRank ?? 999) || b.appearances - a.appearances)
    .slice(0, athleteLimit)
    .map((athlete) => publicAthleteResult(athlete, keyword));

  const clubs = type === 'athlete' ? [] : (indexes.clubs || [])
    .filter(matchText)
    .map((club) => ({
      ...club,
      matchScore: entityMatchScore(club, keyword, [club.club]),
    }))
    .sort((a, b) => b.matchScore - a.matchScore || (a.club?.length || 99) - (b.club?.length || 99) || (a.bestRank ?? 999) - (b.bestRank ?? 999) || b.entrants - a.entrants)
    .slice(0, clubLimit)
    .map((club) => publicClubResult(club, keyword));

  return { athletes, clubs };
}
