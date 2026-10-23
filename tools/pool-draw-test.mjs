import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { buildPreEventCompetitions } from './pre-event-data.mjs';
const read = name => JSON.parse(fs.readFileSync(new URL('../data/analysis/' + name, import.meta.url), 'utf8'));
const draw = read('pool-draw-RZSS2036013MFIU8.json');
const args = {
  projectLists: [{ report: read('projectlist-101209-analysis.json') }],
  rosterBatches: [{ report: read('registration-roster-RZSS2036013-RZSS2036013MFIU8-1.json') }],
  platformEventLists: [{ report: { normalizedEvents: read('frontsporteventlist-analysis.json').normalizedEvents.filter(r => r.sportId === 101209) } }],
  poolDraws: [{ report: draw }],
};
const competition = buildPreEventCompetitions(args)[0];
const item = competition.items.find(row => row.eventCode === draw.general.eventCode);
assert.equal(item.openDate, '2026-10-25 09:00:00');
assert.equal(item.scheduleNeedsVerification, false);
assert.equal(item.poolDrawCount, 53);
assert.equal(item.registrationCount, 54, 'registration and pool-draw counts have different meanings');
assert.deepEqual(item.poolGroups.map(g => g.athletes.length), [7,7,7,6,7,6,7,6]);
assert.ok(item.poolGroups.every((g, i) => g.startTime === '09:00' && g.piste === String(i + 1) && !g.bouts.length));
assert.equal(item.poolGroups[6].athletes[4].name, '蔡廷彧');
const members = item.poolGroups.flatMap(g => g.athletes);
assert.equal(members.filter(r => r.name === '刘翰泽').length, 2);
assert.ok(members.every(r => !r.finalRank && !r.wins && !r.id));
assert.ok(members.every(r => item.roster.some(x => x.eventEntryKey === r.eventEntryKey)), 'pool entries must reconcile within this event only');
assert.ok(!members.some(r => r.name === '陈茈木'), 'withdrawn athlete is not in the published draw');
assert.ok(competition.items.filter(r => r.eventCode !== item.eventCode).every(r => !r.poolGroups));
assert.equal(buildPreEventCompetitions({ ...args, poolDraws: [] })[0].items.find(r => r.eventCode === item.eventCode).openDate, null);
const bad = structuredClone(draw); bad.summary.participantCount = 54;
assert.throws(() => buildPreEventCompetitions({ ...args, poolDraws: [{ report: bad }] }), /pool draw/i);

const source = fs.readFileSync(new URL('../web/viewer.js', import.meta.url), 'utf8');
const start = source.indexOf('function poolDrawGroupHtml(');
const end = source.indexOf('function renderPoolGroups(', start);
assert.ok(start >= 0 && end > start);
const ctx = vm.createContext({ escapeHtml: value => String(value) });
vm.runInContext(source.slice(start, end) + '\nglobalThis.drawHtml = poolDrawGroupHtml;', ctx);
const html = ctx.drawHtml(item.poolGroups[6]);
assert.match(html, /09:00/); assert.match(html, /剑道 7/); assert.match(html, /蔡廷彧/);
assert.match(html, /北京艾鲁特/); assert.match(html, /暂无本组比分和排名/);
assert.doesNotMatch(html, /胜|第54名|0 场|data-athlete-id/);
assert.match(html, /data-event-entry-key/);
const css = fs.readFileSync(new URL('../web/event-detail.css', import.meta.url), 'utf8');
assert.match(css, /\.pool-draw-table\s*\{[^}]*min-width:\s*0/);
console.log('published pool draw: 8 groups, 53 entries, schedule, identity isolation and no invented results passed');
