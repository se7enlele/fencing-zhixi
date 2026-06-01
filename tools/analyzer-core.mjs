export function parseOfficialResultUrl(rawUrl) {
  if (!rawUrl) return null;

  const marker = '#';
  const hashIndex = rawUrl.indexOf(marker);
  const urlForParsing = hashIndex >= 0
    ? `https://placeholder.local/${rawUrl.slice(hashIndex + 1).replace(/^\//, '')}`
    : rawUrl;

  const parsed = new URL(urlForParsing);
  return {
    sportId: parsed.searchParams.get('id'),
    eventCode: parsed.searchParams.get('eventCode'),
    path: parsed.pathname,
    sourceUrl: rawUrl,
  };
}

export function stableStringify(value) {
  return JSON.stringify(value, null, 2);
}

function walk(value, visitor, trail = []) {
  visitor(value, trail);
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visitor, trail.concat(index)));
    return;
  }

  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      walk(child, visitor, trail.concat(key));
    }
  }
}

function getAtPath(root, trail) {
  return trail.reduce((current, key) => current?.[key], root);
}

function pathToString(trail) {
  return trail.map((part) => `[${JSON.stringify(part)}]`).join('');
}

function looksLikeRankingRow(row) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
  const keys = Object.keys(row).map((key) => key.toLowerCase());
  return keys.some((key) => key.includes('rank') || key.includes('place') || key.includes('position'))
    && keys.some((key) => key.includes('name') || key.includes('athlete') || key.includes('noc') || key.includes('club') || key.includes('team'));
}

function looksLikeMatchRow(row) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
  const keys = Object.keys(row).map((key) => key.toLowerCase());
  const hasScore = keys.some((key) => key.includes('score') || key.includes('touch') || key.includes('point'));
  const hasAthlete = keys.filter((key) => key.includes('athlete') || key.includes('name') || key.includes('team')).length >= 2;
  const hasBoutMarker = keys.some((key) => key.includes('match') || key.includes('bout') || key.includes('phase') || key.includes('round'));
  return hasScore && (hasAthlete || hasBoutMarker);
}

function summarizeArray(array) {
  const sample = array.find((item) => item && typeof item === 'object') ?? array[0];
  return {
    length: array.length,
    sampleType: Array.isArray(sample) ? 'array' : typeof sample,
    sampleKeys: sample && typeof sample === 'object' && !Array.isArray(sample)
      ? Object.keys(sample).slice(0, 80)
      : [],
    likelyRanking: array.some(looksLikeRankingRow),
    likelyMatch: array.some(looksLikeMatchRow),
  };
}

export function extractHarJsonResponses(har) {
  const entries = har?.log?.entries;
  if (!Array.isArray(entries)) return [];

  return entries.flatMap((entry) => {
    const text = entry?.response?.content?.text;
    if (!text) return [];

    try {
      return [{
        url: entry.request?.url,
        status: entry.response?.status,
        json: JSON.parse(text),
      }];
    } catch {
      return [];
    }
  });
}

export function analyzeJsonPayload(payload) {
  const arrays = [];
  const keyFrequency = new Map();

  walk(payload, (value, trail) => {
    if (Array.isArray(value)) {
      arrays.push({
        path: pathToString(trail),
        trail,
        ...summarizeArray(value),
      });
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const key of Object.keys(value)) {
        keyFrequency.set(key, (keyFrequency.get(key) ?? 0) + 1);
      }
    }
  });

  const candidateArrays = arrays
    .filter((item) => item.length > 0)
    .sort((a, b) => Number(b.likelyRanking || b.likelyMatch) - Number(a.likelyRanking || a.likelyMatch) || b.length - a.length);

  return {
    topLevelKeys: payload && typeof payload === 'object' && !Array.isArray(payload) ? Object.keys(payload) : [],
    candidateArrays: candidateArrays.slice(0, 50),
    frequentKeys: [...keyFrequency.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 120)
      .map(([key, count]) => ({ key, count })),
  };
}

export function extractRows(payload, analysis, sampleSize = 20) {
  const rankingCandidate = analysis.candidateArrays.find((item) => item.likelyRanking);
  const matchCandidate = analysis.candidateArrays.find((item) => item.likelyMatch);

  return {
    rankingPath: rankingCandidate?.path ?? null,
    matchPath: matchCandidate?.path ?? null,
    rankingSample: rankingCandidate ? getAtPath(payload, rankingCandidate.trail).slice(0, sampleSize) : [],
    matchSample: matchCandidate ? getAtPath(payload, matchCandidate.trail).slice(0, sampleSize) : [],
  };
}

export function loadJsonRecords(parsed) {
  const harResponses = extractHarJsonResponses(parsed);

  if (harResponses.length > 0) {
    return {
      kind: 'har',
      records: harResponses,
    };
  }

  return {
    kind: 'json',
    records: [{ url: null, status: null, json: parsed }],
  };
}

export function analyzeRecords(parsed, options = {}) {
  const loaded = loadJsonRecords(parsed);
  const records = loaded.records.map((record) => {
    const analysis = analyzeJsonPayload(record.json);
    return {
      url: record.url,
      status: record.status,
      analysis,
      extractedSamples: extractRows(record.json, analysis, options.sampleSize ?? 20),
    };
  });

  return {
    kind: loaded.kind,
    records,
  };
}
