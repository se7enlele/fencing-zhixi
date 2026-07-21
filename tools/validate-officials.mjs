import { readFile } from 'node:fs/promises';
import path from 'node:path';

const inputPath = process.argv[2] || path.join('data', 'analysis', 'officials.json');

function normalizeRole(row = {}) {
  const roleText = String(row.role || row.type || row.identity || row.roleName || row.category || '').trim().toLowerCase();
  if (['coach', '教练', '教练员'].includes(roleText)) return 'coach';
  if (['referee', '裁判', '裁判员'].includes(roleText)) return 'referee';
  return '';
}

function sourceRows(rawValue) {
  if (Array.isArray(rawValue)) return rawValue;
  if (!rawValue || typeof rawValue !== 'object') return [];
  return [
    ...(rawValue.officials || []),
    ...(rawValue.coaches || []).map((row) => ({ ...row, role: row.role || 'coach' })),
    ...(rawValue.referees || []).map((row) => ({ ...row, role: row.role || 'referee' })),
  ];
}

function validateRows(rows) {
  const errors = [];
  const seen = new Set();
  const normalized = [];

  rows.forEach((row, index) => {
    const where = `row ${index + 1}`;
    const role = normalizeRole(row);
    const name = String(row?.name || row?.personName || '').trim();
    const club = String(row?.club || row?.clubName || '').trim();
    const province = String(row?.province || row?.provinceName || '').trim();
    const city = String(row?.city || row?.cityName || '').trim();
    const level = String(row?.level || row?.grade || row?.certification || '').trim();
    const competitionCount = Number(row?.competitionCount || row?.appearances || row?.eventCount || 0) || 0;

    if (!role) errors.push(`${where}: role must be coach/referee or 教练员/裁判员`);
    if (!name) errors.push(`${where}: name is required`);

    const duplicateKey = [role, name, club, province, city, level].join('|');
    if (role && name && seen.has(duplicateKey)) errors.push(`${where}: duplicate official ${name}`);
    seen.add(duplicateKey);

    if (role && name) {
      normalized.push({ name, role, club, province, city, level, competitionCount });
    }
  });

  return { errors, normalized };
}

try {
  const raw = JSON.parse(await readFile(inputPath, 'utf8'));
  const rows = sourceRows(raw);
  const { errors, normalized } = validateRows(rows);
  const coaches = normalized.filter((row) => row.role === 'coach').length;
  const referees = normalized.filter((row) => row.role === 'referee').length;

  if (errors.length) {
    console.error(JSON.stringify({ ok: false, path: inputPath, errors }, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify({
    ok: true,
    path: inputPath,
    rows: normalized.length,
    coaches,
    referees,
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({
    ok: false,
    path: inputPath,
    errors: [error.message],
  }, null, 2));
  process.exit(1);
}
