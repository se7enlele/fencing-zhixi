import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
const run = promisify(execFile);
const base = process.argv[2] || 'http://127.0.0.1:5199';
const checks = [];
async function get(path, expected = 200) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const { stdout } = await run(process.platform === 'win32' ? 'curl.exe' : 'curl', ['-sS', '-L', '--max-time', '45', '-w', '\n%{http_code}', base + path], { maxBuffer: 3 * 1024 * 1024 });
    const split = stdout.lastIndexOf('\n');
    const status = Number(stdout.slice(split + 1));
    if (status >= 500 && attempt === 0) continue;
    assert.equal(status, expected, `${path}: HTTP ${status}`);
    const data = JSON.parse(stdout.slice(0, split));
    assert.doesNotMatch(JSON.stringify(data), /birthday|memberInfo|athleteCode|photoUrl/);
    checks.push({ path, status, total: data.total, cacheStatus: data.cacheStatus, first: data.rows?.[0] });
    return data;
  }
}
const meta = await get('/api/points/meta');
assert.ok(meta.weeks.length > 0 && meta.groups.length > 0);
const first = await get('/api/points');
assert.equal(first.rows[0].rank, 1);
assert.equal(first.query.week, meta.weeks[0].value);
const second = await get('/api/points?current=2');
assert.equal(second.page, 2);
assert.ok(second.rows[0].rank >= first.rows.at(-1).rank);
assert.ok(!first.rows.some(a => second.rows.some(b => a.sourceAthleteId === b.sourceAthleteId)));
const search = await get(`/api/points?q=${encodeURIComponent(first.rows[0].name)}`);
assert.ok(search.rows.some(r => r.sourceAthleteId === first.rows[0].sourceAthleteId && r.points === first.rows[0].points && r.rank === first.rows[0].rank));
const empty = await get(`/api/points?q=${encodeURIComponent('不存在的测试姓名')}`);
assert.equal(empty.total, 0);
const women = await get('/api/points?gender=F&weapon=S');
assert.equal(women.query.gender, 'F'); assert.equal(women.query.weapon, 'S'); assert.ok(women.rows.length);
if (meta.weeks[1]) {
  const historical = await get(`/api/points?week=${encodeURIComponent(meta.weeks[1].value)}`);
  assert.equal(historical.query.week, meta.weeks[1].value);
}
await get('/api/points?weapon=X', 400);
const report = { verifiedAt: new Date().toISOString(), base, week: meta.weeks[0].value, groups: meta.groups.length, checks };
await mkdir('output', { recursive: true });
await writeFile(`output/points-verification-${new URL(base).hostname}.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
