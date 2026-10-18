import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildAthleteDirectory, getEventDetailByCode } from '../server.mjs';
import { buildAthleteDirectoryFromEvents } from '../cloudflare/edge-data.mjs';
import { compareEventDates, eventDateTime } from './event-date.mjs';
assert.equal(compareEventDates('2026.05.23','2026-05-23'),0);
assert.ok(compareEventDates('2026-05-23','2026.04.19')>0);
assert.ok(compareEventDates('2025/12/31','2026.01.01')<0);
assert.ok(compareEventDates(null,'2026.01.01')<0);
assert.equal(eventDateTime('2026-02-31'),null);
const codes=['RZSS20240517MFIU6','RZSS2035083MFIU8'];
const reports=codes.map(code=>({fileName:`score-${code}-analysis.json`,report:JSON.parse(fs.readFileSync(`data/analysis/score-${code}-analysis.json`))}));
const events=await Promise.all(codes.map(code=>getEventDetailByCode(code)));
for(const order of [[0,1],[1,0]]){
 const local=buildAthleteDirectory(order.map(i=>reports[i])).find(p=>p.name==='焦兴元');
 const edge=buildAthleteDirectoryFromEvents(Object.fromEntries(order.map(i=>[codes[i],events[i]]))).find(p=>p.name==='焦兴元');
 for(const person of [local,edge]){
  assert.equal(person.club,'山东小众体育','profile affiliation must use the latest source for the same registered identity');
  assert.equal(person.appearances,2);
  assert.equal(person.latestDate,'2026.04.19');
 }
}
console.log('athlete latest recorded affiliation is independent of input order');
const zhangCodes=['RZSS2035083MFIU8','RZSS2035082MFIU8'];
const zhangReports=zhangCodes.map((code,index)=>{const report=JSON.parse(fs.readFileSync(`data/analysis/score-${code}-analysis.json`));report.general.openDate=index?'2026-05-23 10:00:00':'2026.04.19';return {fileName:`score-${code}-analysis.json`,report};});
const {buildEventDetail}=await import('../cloudflare/edge-data.mjs');
for(const order of [[0,1],[1,0]]){
 const local=buildAthleteDirectory(order.map(i=>zhangReports[i])).find(p=>p.name==='张成蹊');
 const edge=buildAthleteDirectoryFromEvents(Object.fromEntries(order.map(i=>[zhangCodes[i],buildEventDetail(zhangReports[i].report,zhangReports[i].fileName)]))).find(p=>p.name==='张成蹊');
 for(const person of [local,edge]){
  assert.equal(person.latestDate,'2026-05-23 10:00:00','mixed date separators must not hide a later match');
  assert.equal(person.latestRank,16);
 }
 assert.equal(local.events[0].eventCode,'RZSS2035082MFIU8');
}
