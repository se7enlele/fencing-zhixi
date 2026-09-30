export function rosterRequest(item, event, args, page = 1) {
  const eventCode = item.sourceEventCode || item.eventCode;
  const sportCode = item.sourceSportCode || item.sportCode || event.sportCode;
  const individual = item.itemTypeCode === 'I' || item.itemType === '个人';
  const api = args.rosterApi || 'auto';
  const certified = api === 'condition-query' || (api === 'auto' && /^RZSS/.test(sportCode || '') && individual);
  const base = args.rosterBase || args.proxyBase;
  if (certified) {
    if (!individual) throw new Error('conditionQuery team roster has not been verified; use legacy for team projects.');
    const body = {
      sportId: String(item.sourceSportId || item.sportId || event.sportId || ''),
      registerType: 'athlete',
      gender: item.genderCode,
      weapon: item.weaponCode,
      ecode: item.ageGroupCode,
    };
    if (!body.sportId || !body.gender || !body.weapon || !body.ecode) throw new Error('Missing conditionQuery sportId/gender/weapon/group parameters.');
    return { url: `${base}/matchregister/v3/signup/conditionQuery`, body, sourceType: 'condition-query', wholeList: true };
  }
  const size = args.rosterPageSize > 0 ? args.rosterPageSize : 100;
  return {
    url: `${base}/fencingapi/sigup/memberlistbytype?current=${page}&size=${size}`,
    body: { eventCode, searchName: '', userType: individual ? 'athlete' : 'team' },
    sourceType: 'legacy-roster', wholeList: false,
  };
}

export function assertRosterRefresh(report, previous) {
  if (!report.summary.recordCount && (report.source.sourceType !== 'condition-query' || previous?.summary?.recordCount > 0)) {
    throw new Error('Empty roster response needs source verification; existing roster retained (not proof of no entrants).');
  }
  if (previous?.summary?.recordCount > 0 && report.source.sourceType === 'legacy-roster' && report.page.total === 0) {
    throw new Error('Roster total conflicts with records; existing roster retained.');
  }
  if (report.normalized.records.some(r => !r.athleteName || !r.eventCode || !r.sportCode)) throw new Error('Roster contains unidentified entries or missing project metadata.');
}
