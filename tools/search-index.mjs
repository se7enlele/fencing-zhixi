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

function chineseAdminAlias(value) {
  const compact = compactText(value);
  if (!/[\u4e00-\u9fa5]/.test(compact)) return '';
  return compact.replace(/(省|市|自治区|特别行政区|地区|区|县)/g, '');
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

function competitionAliasTerms(competition) {
  const values = [
    competition.sportName,
    competition.venue,
    competition.region,
    competition.dateLabel,
    competition.season,
    competition.status,
    competition.sportCode,
  ];

  const aliases = [];
  for (const value of values.filter(Boolean)) {
    aliases.push(value);
    const noAdmin = chineseAdminAlias(value);
    if (noAdmin && noAdmin !== compactText(value)) aliases.push(noAdmin);
    const noYear = String(value).replace(/20\d{2}年?/g, '');
    if (noYear !== String(value)) aliases.push(noYear);
    const noAdminNoYear = chineseAdminAlias(noYear);
    if (noAdminNoYear) aliases.push(noAdminNoYear);
  }
  return [...new Set(aliases.filter(Boolean))];
}

export function compactCompetitionForSearch(competition) {
  const row = {
    sportCode: competition.sportCode || competition.sportId || '',
    sportName: competition.sportName || competition.name || '',
    venue: competition.venue || '',
    region: competition.region || '',
    dateLabel: competition.dateLabel || '',
    season: competition.season || '',
    status: competition.status || '',
    itemCount: competition.items?.length || competition.itemCount || 0,
    entrantCount: competition.entrantCount || competition.competitionNo || competition.participants || 0,
  };
  row.searchText = normalizeSearchText(competitionAliasTerms(competition).join(' '));
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

export function buildSearchIndexes(athletes = [], clubs = [], coaches = [], referees = [], competitions = []) {
  return {
    athletes: athletes.map(compactAthleteForSearch),
    clubs: clubs.map(compactClubForSearch),
    coaches: coaches.map((person) => compactOfficialForSearch(person, 'coach')),
    referees: referees.map((person) => compactOfficialForSearch(person, 'referee')),
    competitions: competitions.map(compactCompetitionForSearch),
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

function competitionMatchReason(competition, keyword) {
  const compactKeyword = compactText(keyword);
  if (compactText(competition.sportName) === compactKeyword || compactText(competition.sportName).includes(compactKeyword)) return '赛事名称匹配';
  if (chineseAdminAlias(competition.sportName).includes(compactKeyword) || chineseAdminAlias(competition.sportName).includes(chineseAdminAlias(keyword))) return '赛事名称匹配';
  if (compactText(competition.venue).includes(compactKeyword) || compactText(competition.region).includes(compactKeyword)) return '地区匹配';
  return '相关赛事匹配';
}

function publicOfficialResult(person, keyword) {
  const { searchText: _searchText, ...publicPerson } = person;
  return {
    ...publicPerson,
    matchReason: officialMatchReason(person, keyword),
  };
}

function publicCompetitionResult(competition, keyword) {
  const { searchText: _searchText, ...publicCompetition } = competition;
  return {
    ...publicCompetition,
    matchReason: competitionMatchReason(competition, keyword),
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
  const competitionLimit = Number(options.competitionLimit) || 8;

  if (!keyword) {
    return { athletes: [], clubs: [], coaches: [], referees: [], competitions: [] };
  }

  const matchText = (row) => (
    tokens.every((token) => row.searchText?.includes(token))
    || String(row.searchText || '').replace(/\s+/g, '').includes(compactKeyword)
  );

  const athletes = ['club', 'coach', 'referee', 'competition'].includes(type) ? [] : (indexes.athletes || [])
    .filter(matchText)
    .map((athlete) => ({
      ...athlete,
      matchScore: entityMatchScore(athlete, keyword, [athlete.name, athlete.club]),
    }))
    .sort((a, b) => b.matchScore - a.matchScore || (a.name?.length || 99) - (b.name?.length || 99) || (a.bestRank ?? 999) - (b.bestRank ?? 999) || b.appearances - a.appearances)
    .slice(0, athleteLimit)
    .map((athlete) => publicAthleteResult(athlete, keyword));

  const clubs = ['athlete', 'coach', 'referee', 'competition'].includes(type) ? [] : (indexes.clubs || [])
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

  const competitions = !['all', 'competition'].includes(type) ? [] : (indexes.competitions || [])
    .filter(matchText)
    .map((competition) => ({
      ...competition,
      matchScore: entityMatchScore(competition, keyword, [competition.sportName, competition.venue, competition.region, competition.season, competition.status]),
    }))
    .sort((a, b) => b.matchScore - a.matchScore || String(b.dateLabel || '').localeCompare(String(a.dateLabel || ''), 'zh-CN') || (b.entrantCount || 0) - (a.entrantCount || 0))
    .slice(0, competitionLimit)
    .map((competition) => publicCompetitionResult(competition, keyword));

  return { athletes, clubs, coaches, referees, competitions };
}
