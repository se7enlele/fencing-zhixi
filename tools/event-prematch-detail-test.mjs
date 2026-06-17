import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');

assert.match(js, /function eventRosterRows\(event\)/, 'event detail must normalize roster rows from pre-event participants');
assert.match(js, /function buildEventPreMatchModel\(event\)/, 'event detail must build a prematch model from roster data');
assert.match(js, /function renderEventPreMatchIntelligence\(event\)/, 'event detail must render prematch intelligence');
assert.match(js, /renderEventPreMatchIntelligence\(event\),[\s\S]{0,120}progressChart\('比赛压力'/, 'prematch intelligence should appear before post-event pressure charts');
assert.match(js, /class="event-prematch-metrics"/, 'prematch intelligence must show registration metrics');
assert.match(js, /class="event-prematch-list"/, 'prematch intelligence must show roster-derived lists');
assert.match(js, /rosterHistoryMatch\(row\)/, 'prematch intelligence should try to match registered athletes to historical profiles');

assert.match(css, /\.event-prematch-card/, 'event prematch card style must exist');
assert.match(css, /\.event-prematch-metrics/, 'event prematch metric layout must exist');
assert.match(css, /\.event-prematch-list/, 'event prematch list layout must exist');

console.log('event prematch detail view is covered');
