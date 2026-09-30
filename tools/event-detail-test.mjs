import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { hydrateEventDetail } from '../cloudflare/event-detail-hydration.mjs';
const ctx = vm.createContext({ fallbackPhaseGroups: () => [] });
vm.runInContext(fs.readFileSync('web/event-detail.js', 'utf8') + '\nglobalThis.detail = EventDetail;', ctx);
const d = ctx.detail;
const signupLookup = JSON.parse(fs.readFileSync('web/data/public-data-lookup.json', 'utf8'));
const signupChunk = JSON.parse(fs.readFileSync('web/' + signupLookup.chunkLookup.eventsByCode.RZSS2036013MFIU8, 'utf8'));
const signupEvent = hydrateEventDetail(signupChunk.RZSS2036013MFIU8);
const signupEntries = d.athletes(signupEvent);
assert.equal(signupEntries.length, 53, 'all registration-schema rows must render');
assert.ok(signupEntries.every(entry => entry.row.name && entry.row.club));
assert.equal(signupEntries.filter(entry => entry.row.name === '刘翰泽').length, 2, 'same-name different clubs must stay separate');
ctx.escapeHtml = value => String(value);
const rosterHost = { innerHTML: '' };
ctx.document = { querySelector: () => rosterHost };
ctx.renderEventRoster(signupEvent);
assert.equal((rosterHost.innerHTML.match(/class="detail-person"/g) || []).length, 53);
assert.match(rosterHost.innerHTML, /孟泓睿/);
assert.match(rosterHost.innerHTML, /北京金石/);
assert.match(rosterHost.innerHTML, /待缴费/);
assert.doesNotMatch(rosterHost.innerHTML, /暂无参赛名单/);
const items = [
  { eventName: 'U10男子花剑个人', openDate: '2026-09-27 08:30:00' },
  { eventName: 'U10女子花剑团体', openDate: '2026-09-28' },
  { eventName: 'U12男子重剑个人' },
];
assert.equal(d.filter(items, { gender: '男子', weapon: '花剑', date: '2026-09-27' }).length, 1);
assert.equal(d.filter(items, { type: '团体', gender: '男子' }).length, 0);
assert.equal(d.filter(items, {}).length, 3);
assert.equal(d.facets(items[2]).date, '', 'missing dates must not be invented');
const event = {
  participants: [{ id: 'a', name: '同名', club: '甲' }, { id: 'b', name: '同名', club: '乙' }],
  poolGroups: [{ athletes: [{ id: 'a', name: '同名', club: '甲' }] }],
  eliminationPhaseGroups: [{ phase: '决赛', matches: [{ home: { name: '同名', club: '甲' }, away: { name: '其他', club: '丙' } }] }],
};
const entries = d.athletes(event);
assert.equal(entries.length, 2);
assert.equal(entries[0].poolIndex, 0);
assert.equal(entries[1].poolIndex, null);
assert.equal(d.phasesFor(event, entries[0]).length, 1);
assert.equal(d.phasesFor(event, entries[1]).length, 0, 'same name at another club must not get the bout');
event.participants.push({ id: 'c', name: '同名', club: '甲' });
assert.equal(d.phasesFor(event, entries[0]).length, 0, 'ambiguous name and club must not resolve a bout');
assert.equal(d.athletes({ participants: [{ name: '同名' }, { name: '同名' }] }).length, 2);
assert.equal(d.defaultTab(event), 'pool');
assert.equal(d.defaultTab({ participants: [{ finalRank: 3 }] }), 'participants');
assert.equal(d.defaultTab({ participants: [{ name: '报名选手' }] }), 'roster');
assert.equal(d.defaultTab({}), 'roster');
assert.equal(d.athletes({ participants: [], athleteProfiles: [], roster: [{ name: '报名选手' }] }).length, 1);
const viewer = fs.readFileSync('web/viewer.js', 'utf8');
vm.runInContext(viewer.slice(viewer.indexOf('function matchWinnerName('), viewer.indexOf('function matchScoreText(')), ctx);
assert.equal(ctx.matchWinnerName({ home: { name: '甲' }, away: { name: '乙' } }), '-');
assert.equal(ctx.matchWinnerName({ home: { name: '甲', result: 'W' }, away: { name: '乙' } }), '甲');
assert.equal(ctx.matchWinnerName({ home: { name: '甲', result: 'W' }, away: { name: '乙', result: 'W' } }), '-');
for (const file of ['web/index.html', 'web/viewer.html']) {
  const html = fs.readFileSync(file, 'utf8');
  assert.ok(html.indexOf('/event-detail.js') < html.indexOf('/viewer.js'));
  for (const id of ['eventFinder', 'eventRoster', 'projectFilters', 'eventReviewActions']) assert.equal(html.split(`id="${id}"`).length, 2);
}
console.log('event detail: combined filters, identity isolation, safe bout lookup, data-first tabs and unresolved winners passed');
