import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const escapeStart = source.indexOf('function escapeHtml');
const renderStart = source.indexOf('function renderLeaders');
const renderEnd = source.indexOf('function renderChampionPath');

if (escapeStart === -1 || renderStart === -1 || renderEnd === -1 || renderEnd <= renderStart) {
  throw new Error('Unable to locate renderLeaders helpers in viewer.js');
}

const context = {
  leadersList: { innerHTML: '' },
};
vm.createContext(context);
vm.runInContext(`${source.slice(escapeStart, source.indexOf('function parseDate'))}
${source.slice(renderStart, renderEnd)}
globalThis.renderLeaders = renderLeaders;
`, context);

context.renderLeaders({
  eliminationLeaders: [{
    name: 'Fallback Athlete',
    club: 'Fallback Club',
    wins: 2,
    losses: 1,
    diff: 1,
  }],
});

assert.doesNotMatch(context.leadersList.innerHTML, /undefined:undefined/);
assert.match(context.leadersList.innerHTML, />-</);

console.log('event leader score fallback is covered');
