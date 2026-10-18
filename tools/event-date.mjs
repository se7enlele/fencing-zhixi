function unwrapReport(entry) {
  return entry?.report || entry || {};
}

function dateText(value) {
  return String(value || '').trim();
}

// Compare the source calendar date without changing its display or provenance.
export function eventDateTime(value) {
  const match = dateText(value).match(/^(\d{4})[.\/-](\d{1,2})[.\/-](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (!match) return null;
  const [year, month, day, hour, minute, second] = match.slice(1).map(part => Number(part || 0));
  const time = Date.UTC(year, month - 1, day, hour, minute, second);
  const date = new Date(time);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day || hour > 23 || minute > 59 || second > 59) return null;
  return time;
}

export function compareEventDates(left, right) {
  const a = eventDateTime(left), b = eventDateTime(right);
  if (a === null) return b === null ? 0 : -1;
  return b === null ? 1 : a - b;
}

function dateCandidate(row, source) {
  const openDate = dateText(row?.startDate || row?.openDate);
  if (!openDate) return null;
  return {
    openDate,
    endDate: dateText(row?.endDate) || null,
    source,
  };
}

export function buildEventDateFallbacks({ projectLists = [], platformEventLists = [] } = {}) {
  const byEventCode = Object.create(null);
  const bySportCode = Object.create(null);

  for (const entry of platformEventLists) {
    const report = unwrapReport(entry);
    for (const row of report.normalizedEvents || []) {
      const sportCode = String(row?.sportCode || '').trim();
      const candidate = dateCandidate(row, 'competition-list');
      if (sportCode && candidate) bySportCode[sportCode] = candidate;
    }
  }

  for (const entry of projectLists) {
    const report = unwrapReport(entry);
    for (const row of report.normalizedItems || []) {
      const eventCode = String(row?.sourceEventCode || row?.eventCode || '').trim();
      const candidate = dateCandidate(row, 'projectlist');
      if (eventCode && candidate) byEventCode[eventCode] = candidate;
    }
  }

  return { byEventCode, bySportCode };
}

export function enrichScoreReportDates(report, fallbacks = {}) {
  const general = report?.general;
  if (!general || dateText(general.openDate)) return report;

  const eventCode = String(general.eventCode || '').trim();
  const sportCode = String(general.sportCode || '').trim();
  const candidate = fallbacks.byEventCode?.[eventCode] || fallbacks.bySportCode?.[sportCode];
  if (!candidate?.openDate) return report;

  return {
    ...report,
    general: {
      ...general,
      openDate: candidate.openDate,
      endDate: dateText(general.endDate) || candidate.endDate,
      dateSource: candidate.source,
    },
  };
}
