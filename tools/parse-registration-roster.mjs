export function extractRosterRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload?.data === null) return [];
  if (Array.isArray(payload?.data?.records)) return payload.data.records;
  if (Array.isArray(payload?.records)) return payload.records;
  return null;
}

export function looksLikeRegistrationRoster(payload) {
  const rows = extractRosterRows(payload);
  return Array.isArray(rows)
    && rows.length > 0
    && rows.every((row) => row && typeof row === 'object')
    && rows.some((row) => row.eventCode && row.sportCode && (row.athleteName || row.registerCode));
}

export function rosterDedupeKey(row) {
  if (row.sigupId) return `sigup:${row.sigupId}`;
  if (row.sportCode && row.eventCode && row.registerCode) {
    return `entry:${row.sportCode}:${row.eventCode}:${row.registerCode}`;
  }
  return `fallback:${row.sportCode || ''}:${row.eventCode || ''}:${row.athleteName || ''}:${row.birthday || ''}:${row.organCode || ''}`;
}

export function normalizeRosterRecord(row) {
  return {
    sigupId: row.sigupId || null,
    registerType: row.registerType || null,
    registerId: row.registerId || null,
    registerCode: row.registerCode || null,
    athleteName: row.athleteName || '',
    birthday: row.birthday || null,
    sex: row.sex || null,
    sexDes: row.sexDes || null,
    weapon: row.weapon || null,
    weaponDes: row.weaponDes || null,
    hand: row.hand || null,
    sportCode: row.sportCode || null,
    sportName: row.sportName || null,
    eventCode: row.eventCode || null,
    eventName: row.eventName || null,
    organCode: row.organCode || null,
    organShortName: row.organShortName || null,
    organName: row.organName || null,
    approveStatus: row.approveStatus || null,
    sigupTime: row.sigupTime || null,
    sigupPoints: row.sigupPoints ?? null,
    sigupRank: row.sigupRank ?? null,
    regType: row.regType || null,
    regTypeDes: row.regTypeDes || null,
    dedupeKey: rosterDedupeKey(row),
  };
}

export function buildRegistrationRosterReport(payload, source = {}) {
  const rows = extractRosterRows(payload);
  if (!Array.isArray(rows)) throw new Error('报名名单数据应该包含 data.records 或 records。');
  const records = rows.map(normalizeRosterRecord);
  return {
    ok: true,
    importType: 'registration-roster',
    source,
    page: {
      current: payload?.data?.current ?? payload?.current ?? source.page ?? null,
      size: payload?.data?.size ?? payload?.size ?? source.pageSize ?? records.length,
      total: payload?.data?.total ?? payload?.total ?? records.length,
    },
    summary: {
      recordCount: records.length,
      sportCodes: [...new Set(records.map((row) => row.sportCode).filter(Boolean))],
      eventCodes: [...new Set(records.map((row) => row.eventCode).filter(Boolean))],
      athleteCount: new Set(records.map((row) => row.registerCode || row.athleteName).filter(Boolean)).size,
      clubCount: new Set(records.map((row) => row.organName || row.organCode).filter(Boolean)).size,
    },
    normalized: { records },
  };
}
