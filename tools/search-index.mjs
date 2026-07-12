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

function compactOfficialForSearch(person, defaultRole) {
  const role = person.role || defaultRole;
  const row = {
    id: person.id,
    name: person.name,
    role,
    club: person.club || '',
    province: person.province || '',
    city: person.city || '',
    level: person.level || '',
    competitionCount: person.competitionCount || person.appearances || 0,
  };
  row.searchText = normalizeSearchText([
    row.name,
    row.role === 'coach' ? '教练 教练员 coach' : '',
    row.role === 'referee' ? '裁判 裁判员 referee' : '',
    row.club,
    row.province,
    row.city,
    row.level,
  ].join(' '));
  return row;
}

export function buildSearchIndexes(athletes = [], clubs = [], coaches = [], referees = []) {
  return {
    athletes: athletes.map(compactAthleteForSearch),
    clubs: clubs.map(compactClubForSearch),
    coaches: coaches.map((person) => compactOfficialForSearch(person, 'coach')),
    referees: referees.map((person) => compactOfficialForSearch(person, 'referee')),
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

function officialMatchReason(person, keyword) {
  const compactKeyword = compactText(keyword);
  if (compactText(person.name) === compactKeyword || compactText(person.name).includes(compactKeyword)) return '姓名匹配';
  if (compactText(person.club).includes(compactKeyword)) return '俱乐部匹配';
  if (compactText(person.city).includes(compactKeyword) || compactText(person.province).includes(compactKeyword)) return '地区匹配';
  if (compactText(person.role).includes(compactKeyword)) return '身份匹配';
  return '公开资料匹配';
}

function publicOfficialResult(person, keyword) {
  const { searchText: _searchText, ...publicPerson } = person;
  return {
    ...publicPerson,
    matchReason: officialMatchReason(person, keyword),
  };
}

export function searchIndexes(indexes, query, options = {}) {
  const keyword = normalizeSearchText(query);
  const compactKeyword = compactText(keyword);
  const tokens = searchTokens(keyword);
  const type = options.type || 'all';
  const athleteLimit = Number(options.athleteLimit) || 20;
  const clubLimit = Number(options.clubLimit) || 6;
  const coachLimit = Number(options.coachLimit) || 6;
  const refereeLimit = Number(options.refereeLimit) || 6;

  if (!keyword) {
    return { athletes: [], clubs: [], coaches: [], referees: [] };
  }

  const matchText = (row) => (
    tokens.every((token) => row.searchText?.includes(token))
    || String(row.searchText || '').replace(/\s+/g, '').includes(compactKeyword)
  );

  const athletes = ['club', 'coach', 'referee'].includes(type) ? [] : (indexes.athletes || [])
    .filter(matchText)
    .map((athlete) => ({
      ...athlete,
      matchScore: entityMatchScore(athlete, keyword, [athlete.name, athlete.club]),
    }))
    .sort((a, b) => b.matchScore - a.matchScore || (a.name?.length || 99) - (b.name?.length || 99) || (a.bestRank ?? 999) - (b.bestRank ?? 999) || b.appearances - a.appearances)
    .slice(0, athleteLimit)
    .map((athlete) => publicAthleteResult(athlete, keyword));

  const clubs = ['athlete', 'coach', 'referee'].includes(type) ? [] : (indexes.clubs || [])
    .filter(matchText)
    .map((club) => ({
      ...club,
      matchScore: entityMatchScore(club, keyword, [club.club]),
    }))
    .sort((a, b) => b.matchScore - a.matchScore || (a.club?.length || 99) - (b.club?.length || 99) || (a.bestRank ?? 999) - (b.bestRank ?? 999) || b.entrants - a.entrants)
    .slice(0, clubLimit)
    .map((club) => publicClubResult(club, keyword));

  const coaches = !['all', 'coach'].includes(type) ? [] : (indexes.coaches || [])
    .filter(matchText)
    .map((person) => ({
      ...person,
      matchScore: entityMatchScore(person, keyword, [person.name, person.club, person.province, person.city, person.level, '教练', '教练员']),
    }))
    .sort((a, b) => b.matchScore - a.matchScore || (a.name?.length || 99) - (b.name?.length || 99) || b.competitionCount - a.competitionCount)
    .slice(0, coachLimit)
    .map((person) => publicOfficialResult(person, keyword));

  const referees = !['all', 'referee'].includes(type) ? [] : (indexes.referees || [])
    .filter(matchText)
    .map((person) => ({
      ...person,
      matchScore: entityMatchScore(person, keyword, [person.name, person.club, person.province, person.city, person.level, '裁判', '裁判员']),
    }))
    .sort((a, b) => b.matchScore - a.matchScore || (a.name?.length || 99) - (b.name?.length || 99) || b.competitionCount - a.competitionCount)
    .slice(0, refereeLimit)
    .map((person) => publicOfficialResult(person, keyword));

  return { athletes, clubs, coaches, referees };
}
