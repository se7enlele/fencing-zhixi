import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { getPublicEventsPayload } from '../server.mjs';

const payload = await getPublicEventsPayload();

assert.ok(Array.isArray(payload.athletes), 'public events payload should include athlete directory');
assert.ok(payload.athletes.some((athlete) => athlete.name === '蔡廷彧'), 'athlete directory should include 蔡廷彧');

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
  const cai = index.find((athlete) => athlete.name === '蔡廷彧');
  assert.ok(cai, 'search index should include 蔡廷彧');
  assert.ok(cai.searchText.includes('蔡'), 'single-character surname should be searchable');
  assert.ok(cai.id, 'search result should keep athlete id for opening detail page');

  const maKeyword = context.normalizeSearchText('马');
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
      followedAthletes: [{
        id: 'athlete-1',
        name: '蔡廷彧',
        club: '个人',
        bestRank: 32,
        appearances: 2,
      }],
    },
    followPanel,
    escapeHtml: (value) => String(value ?? ''),
    openAthlete: () => {},
  };
  vm.createContext(context);
  vm.runInContext(`${source.slice(start, end)}
globalThis.renderFollowPanel = renderFollowPanel;
`, context);

  context.renderFollowPanel();
  assert.equal(followPanel.hidden, false, 'follow panel should be visible when followed athletes exist');
  assert.match(followPanel.innerHTML, /蔡廷彧/);
}

console.log('search and follow panel behavior is covered');
