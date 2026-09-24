function unwrapReport(entry) {
  return entry?.report || entry || {};
}

function dateText(value) {
  return String(value || '').trim();
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
