import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');

assert.match(js, /function clubPeerRows\(club, projectRows\)/, 'club coach view must compute same-project peers');
assert.match(js, /function buildClubBusinessCards\(club, projectRows, athletes, peerRows\)/, 'club coach view must build business-facing cards');
assert.match(js, /<h2>招生名片<\/h2>/, 'club detail must expose a recruiting card section');
assert.match(js, /<h2>同项目对标<\/h2>/, 'club detail must expose peer benchmarking');
assert.match(js, /data-club-id/, 'peer club cards must navigate to club profiles');
assert.match(js, /openClub\(button\.dataset\.clubId\)/, 'peer cards must open the selected club profile');

assert.match(css, /\.business-card-grid/, 'recruiting cards must have mobile layout styles');
assert.match(css, /\.business-card:first-child/, 'primary recruiting card must be visually emphasized');
assert.match(css, /\.peer-card/, 'peer comparison cards must have a distinct style hook');

console.log('club coach business view is covered');
