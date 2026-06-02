import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { stableStringify } from './analyzer-core.mjs';

function stripBom(text) {
  return String(text || '').replace(/^\uFEFF/, '');
}

function parseArgs(argv) {
  const args = {
    input: 'analysis-output/fencing-platform/frontsporteventlist.json',
    outputDir: 'data/analysis',
    sourceUrl: 'https://fencing-proxy.aixindiandian.workers.dev/fencingapi/competition/frontsporteventlist?',
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--input' || arg === '-i') args.input = argv[++i];
    if (arg === '--output-dir' || arg === '-o') args.outputDir = argv[++i];
    if (arg === '--source-url' || arg === '-u') args.sourceUrl = argv[++i];
  }

  return args;
}

function rowsFromPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  throw new Error('frontsporteventlist payload should be an array or { data: [] }.');
}

export function looksLikeFrontSportEventList(payload) {
  let rows = [];
  try {
    rows = rowsFromPayload(payload);
  } catch {
    return false;
  }
  return rows.length > 0
    && rows.every((row) => row && typeof row === 'object')
    && rows.some((row) => row.sportId && row.sportName && row.startDate && row.sportactive !== undefined);
}

function countBy(rows, getter) {
  return rows.reduce((map, row) => {
    const value = getter(row) || '(empty)';
    map[value] = (map[value] || 0) + 1;
    return map;
  }, {});
}

function normalizeDate(value) {
  return value ? String(value) : null;
}

function normalizeEvent(row) {
  const groups = Array.isArray(row.groups) ? row.groups : [];
  return {
    sportId: row.sportId ?? null,
    sportCode: row.sportCode || null,
    sportName: row.sportName || '',
    season: row.season || '',
    gameType: row.gameType || null,
    gameDesc: row.gameDesc || '',
    gameLevel: row.gameLevel || row.gradeType || null,
    startDate: normalizeDate(row.startDate),
    endDate: normalizeDate(row.endDate),
    signStartDate: normalizeDate(row.signStartDate),
    signAthEndDate: normalizeDate(row.signAthEndDate),
    provinceName: row.provinceName || '',
    cityName: row.cityName || '',
    areaDesc: row.areaDesc || '',
    organizer: row.organizer || '',
    mainOrganizer: row.mainOrganizer || '',
    sportactive: String(row.sportactive ?? ''),
    sigupactive: String(row.sigupactive ?? ''),
    raceResType: row.raceResType || null,
    weaponCodes: row.weaponCodes || null,
    groups: groups.map((group) => ({
      groupCode: group.groupCode || null,
      groupName: group.groupName || '',
    })),
    groupLabels: [...new Set(groups.map((group) => group.groupName).filter(Boolean))],
    files: Array.isArray(row.sportTypeFiles)
      ? row.sportTypeFiles.map((file) => ({
        fileName: file.fileName || '',
        fileType: file.ftype || '',
        fileTypeDesc: file.ftypedesc || '',
        fileUrl: file.fileUrl || '',
      }))
      : [],
  };
}

export function buildFrontSportEventListReport(payload, source = {}) {
  const rows = rowsFromPayload(payload);
  const normalizedEvents = rows.map(normalizeEvent);

  return {
    ok: true,
    importType: 'frontsporteventlist',
    source,
    summary: {
      eventCount: normalizedEvents.length,
      sportIds: normalizedEvents.map((event) => event.sportId).filter(Boolean),
      sportCodes: normalizedEvents.map((event) => event.sportCode).filter(Boolean),
      seasons: [...new Set(normalizedEvents.map((event) => event.season).filter(Boolean))].sort(),
    },
    distributions: {
      season: countBy(normalizedEvents, (event) => event.season),
      gameDesc: countBy(normalizedEvents, (event) => event.gameDesc),
      provinceName: countBy(normalizedEvents, (event) => event.provinceName),
      areaDesc: countBy(normalizedEvents, (event) => event.areaDesc),
      sportactive: countBy(normalizedEvents, (event) => event.sportactive),
      sigupactive: countBy(normalizedEvents, (event) => event.sigupactive),
      groups: countBy(normalizedEvents.flatMap((event) => event.groupLabels), (label) => label),
    },
    normalizedEvents,
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const payload = JSON.parse(stripBom(await readFile(args.input, 'utf8')));
  const report = buildFrontSportEventListReport(payload, {
    input: args.input,
    sourceUrl: args.sourceUrl,
    analyzedAt: new Date().toISOString(),
  });

  await mkdir(args.outputDir, { recursive: true });
  const outputPath = path.join(args.outputDir, 'frontsporteventlist-analysis.json');
  await writeFile(outputPath, stableStringify(report), 'utf8');

  console.log(stableStringify({
    ok: true,
    outputPath,
    eventCount: report.summary.eventCount,
    seasons: report.summary.seasons,
    sportactive: report.distributions.sportactive,
    sigupactive: report.distributions.sigupactive,
  }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
