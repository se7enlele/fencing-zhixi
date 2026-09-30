import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('web/viewer.js', 'utf8');
const entries = [{ state: null, url: 'https://fencingai.uk/' }];
let index = 0;
let listener;
let shown = '';
let context;
const history = {
  get state() { return entries[index].state; },
  replaceState(state, _title, url) { entries[index] = { state: structuredClone(state), url }; },
  pushState(state, _title, url) { entries.splice(++index); entries.push({ state: structuredClone(state), url }); },
  back() { if (index) { index--; listener({ state: history.state }); } },
  forward() { if (index < entries.length - 1) { index++; listener({ state: history.state }); } },
};
const state = { viewStack: ['home'], activeMainTab: 'home' };
const noop = () => {};
context = vm.createContext({
  state, URL, Map, Promise, accountAuthMode: 'login',
  window: { history, location: { get href() { return new URL(entries[index].url, 'https://fencingai.uk/').href; } }, addEventListener: (_name, fn) => { listener = fn; } },
  views: Object.fromEntries(['home','my','points','competitions','follow','roleHome','athlete','event','competition','club','parentGrowthReport','prematchReport','coachSegmentationReport','accountLogin','aiAnalysis'].map(name => [name, {}])),
  MAIN_TABS: ['home','my','points','competitions'],
  showView: name => { shown = name; },
  renderHomePage: noop, renderPointsPage: noop, renderFocusPage: noop, renderPersonalPages: noop, renderAccountLoginPage: noop, renderAiAnalysisPage: noop, scrollToPageTop: noop,
  normalizeAiCards: rows => rows,
  findAiReportSnapshot: query => ({ query, title: query, cards: [] }),
  openAthlete: async id => { state.currentAthleteId = id; context.navigateTo('athlete'); },
  openCompetition: async id => { state.currentCompetition = { sportCode: id }; context.navigateTo('competition'); },
  openEvent: async id => { state.currentEvent = { eventCode: id }; context.navigateTo('event'); },
  openClub: async id => { state.currentClub = { id }; context.navigateTo('club'); },
  openParentGrowthReport: id => { state.currentGrowthAthleteId = id; context.navigateTo('parentGrowthReport'); },
  openPrematchReport: (_kind, id) => { state.currentPrematchCode = id; context.navigateTo('prematchReport'); },
  openCoachSegmentationReport: id => { state.currentCoachClubId = id; context.navigateTo('coachSegmentationReport'); },
});
vm.runInContext(source.slice(source.indexOf('let navigationReady ='), source.indexOf('function buildCompetitionsFromEvents')), context);
vm.runInContext('navigationReady = true; syncViewUrl("home", true)', context);
const settled = () => vm.runInContext('navigationRestoreQueue', context);
context.navigateMain('my');
await context.openAthlete('athlete-A');
context.openParentGrowthReport('athlete-A');
context.goBack(); await settled();
assert.equal(shown, 'athlete'); assert.equal(state.currentAthleteId, 'athlete-A');
history.forward(); await settled();
assert.equal(shown, 'parentGrowthReport'); assert.equal(state.currentGrowthAthleteId, 'athlete-A');
context.goBack(); await settled();
await context.openAthlete('athlete-B');
context.goBack(); await settled();
assert.equal(state.currentAthleteId, 'athlete-A', 'same page type must restore the previous entity');
await context.openCompetition('competition-A');
await context.openEvent('event-A');
await context.openCompetition('competition-B');
context.goBack(); await settled();
assert.equal(state.currentEvent.eventCode, 'event-A');
context.goBack(); await settled();
assert.equal(state.currentCompetition.sportCode, 'competition-A');
context.navigateTo('accountLogin');
vm.runInContext('accountAuthMode = "register"; syncViewUrl("accountLogin")', context);
context.goBack(); await settled();
assert.equal(vm.runInContext('accountAuthMode', context), 'login');
state.aiActiveQuery = 'comparison-A'; state.aiActiveReport = { title: 'comparison-A', cards: [] };
context.navigateTo('aiAnalysis');
context.navigateMain('home');
context.goBack(); await settled();
assert.equal(shown, 'aiAnalysis'); assert.equal(state.aiActiveReport.title, 'comparison-A');
assert.equal(new URL(entries[index].url, 'https://fencingai.uk/').searchParams.get('analysis'), '1');
console.log('navigation history: browser/app back, forward, same-view entities, event parents, auth modes and analysis restoration passed');
