import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { getPublicEventsPayload } from '../server.mjs';

const payload = await getPublicEventsPayload();
const caiName = '\u8521\u5ef7\u5f67';
const personalClub = '\u4e2a\u4eba';
const caiId = '20190918M202510090308';

assert.ok(Array.isArray(payload.athletes), 'public events payload should include athlete directory');
assert.ok(payload.athletes.some((athlete) => athlete.name === caiName), 'athlete directory should include Cai Tingyu');

const source = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');

{
  const start = source.indexOf('function shortEventName');
  const end = source.indexOf('function activeFilterValue');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Unable to locate search helper functions in viewer.js');
  }

  const context = {
    state: {
      competitions: payload.competitions,
      athletesById: Object.fromEntries(payload.athletes.map((athlete) => [athlete.id, athlete])),
    },
  };
  vm.createContext(context);
  vm.runInContext(`${source.slice(start, end)}
globalThis.buildAthleteSearchIndex = buildAthleteSearchIndex;
globalThis.normalizeSearchText = normalizeSearchText;
globalThis.searchTokens = searchTokens;
globalThis.entityMatchScore = entityMatchScore;
globalThis.athleteSearchResultLimit = athleteSearchResultLimit;
`, context);

  const index = context.buildAthleteSearchIndex();
  const cai = index.find((athlete) => athlete.name === caiName);
  assert.ok(cai, 'search index should include Cai Tingyu');
  assert.ok(cai.searchText.includes(caiName.slice(0, 1)), 'single-character surname should be searchable');
  assert.ok(cai.id, 'search result should keep athlete id for opening detail page');

  const maKeyword = context.normalizeSearchText('\u9a6c');
  const maTokens = context.searchTokens(maKeyword);
  const maCompact = maKeyword.replace(/\s+/g, '');
  const allMaMatches = index.filter((athlete) => athlete.searchText.includes(maCompact));
  const displayedMaMatches = index
    .filter((athlete) => maTokens.every((token) => athlete.searchText.includes(token)) || athlete.searchText.replace(/\s+/g, '').includes(maCompact))
    .map((athlete) => ({
      ...athlete,
      matchScore: context.entityMatchScore(athlete, maKeyword, [athlete.name, athlete.club]),
    }))
    .sort((a, b) => b.matchScore - a.matchScore || (a.name?.length || 99) - (b.name?.length || 99) || (a.bestRank ?? 999) - (b.bestRank ?? 999) || b.appearances - a.appearances)
    .slice(0, context.athleteSearchResultLimit(maKeyword));
  assert.ok(allMaMatches.length > 6, 'fixture should cover a surname with more than six matches');
  assert.equal(displayedMaMatches.length, allMaMatches.length, 'single-character searches should not truncate athlete matches');
}

{
  const start = source.indexOf('function renderFollowPanel');
  const end = source.indexOf('function clubRepresentativeAthletes');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Unable to locate follow panel functions in viewer.js');
  }

  const followPanel = {
    hidden: true,
    innerHTML: '',
    querySelectorAll: () => [],
  };
  const context = {
    state: {
      userRole: 'parent',
      athletesById: Object.fromEntries(payload.athletes.map((athlete) => [athlete.id, athlete])),
      followedAthletes: [{
        id: 'athlete-1',
        name: caiName,
        club: personalClub,
        bestRank: 32,
        appearances: 2,
      }],
    },
    followPanel,
    escapeHtml: (value) => String(value ?? ''),
    focusAthleteCards: () => context.state.followedAthletes,
    openAthlete: () => {},
  };
  vm.createContext(context);
  vm.runInContext(`${source.slice(start, end)}
globalThis.renderFollowPanel = renderFollowPanel;
`, context);

  context.renderFollowPanel();
  assert.equal(followPanel.hidden, false, 'follow panel should be visible when followed athletes exist');
  assert.match(followPanel.innerHTML, new RegExp(caiName));

  context.state.userRole = 'coach';
  context.renderFollowPanel();
  assert.equal(followPanel.hidden, true, 'follow panel should be hidden outside parent role');
  assert.equal(followPanel.innerHTML, '', 'follow panel should not render child content for coach role');
}

{
  const start = source.indexOf('function normalizeSearchText');
  const end = source.indexOf('function eventYear');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Unable to locate parent athlete resolution helpers in viewer.js');
  }

  const cai = payload.athletes.find((athlete) => athlete.id === caiId);
  assert.ok(cai, 'fixture should include complete followed athlete profile');
  assert.ok((cai.events || []).length > 0, 'complete athlete profile should include event data');

  const context = {
    state: {
      athletesById: Object.fromEntries(payload.athletes.map((athlete) => [athlete.id, athlete])),
      followedAthletes: [{
        id: 'stale-follow-id',
        name: cai.name,
        club: cai.club,
        appearances: 0,
        bestRank: null,
      }],
      athleteSearchIndex: payload.athletes.slice(0, 8),
    },
  };
  vm.createContext(context);
  vm.runInContext(`${source.slice(start, end)}
globalThis.childCandidates = childCandidates;
globalThis.resolveAthleteReference = resolveAthleteReference;
`, context);

  const candidates = context.childCandidates();
  assert.equal(candidates.length, 1, 'parent child picker should only show followed athletes');
  assert.equal(candidates[0].id, cai.id, 'stale follow record should resolve to the complete athlete profile');
  assert.equal(candidates[0].events.length, cai.events.length, 'resolved child should keep full event history');
}

console.log('search and follow panel behavior is covered');
