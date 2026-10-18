import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildAthleteDirectory, getEventDetailByCode } from '../server.mjs';
import { buildAthleteDirectoryFromEvents } from '../cloudflare/edge-data.mjs';
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
