import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../web/viewer.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');
const start = source.indexOf('function shortEventName');
const end = source.indexOf('function activeFilterValue');
if (start === -1 || end === -1 || end <= start) {
  throw new Error('Unable to locate filter helper functions in viewer.js');
}

const context = {
  state: {
    competitions: [
      {
        sportName: '2025 北京公开赛',
        dateLabel: '2025.05.23',
        region: '北京·北京',
        items: [{ eventName: 'U8 男子花剑' }],
      },
      {
        sportName: '2026 上海公开赛',
        dateLabel: '2026.04.25',
        region: '北京昌平',
        items: [{ eventName: 'U6 男子花剑' }],
      },
      {
        sportName: '2024 广州公开赛',
        dateLabel: '2024.03.10',
        region: '上海',
        items: [{ eventName: 'U8 女子重剑' }],
      },
      {
        sportName: '2026 安徽公开赛',
        dateLabel: '2026.06.10',
        region: '安徽蚌埠',
        items: [{ eventName: 'U10 女子佩剑' }],
      },
      {
        sportName: '2025 安徽邀请赛',
        dateLabel: '2025.07.10',
        venue: '安徽·滁州',
        items: [{ eventName: 'U10 男子重剑' }],
      },
    ],
  },
};

vm.createContext(context);
vm.runInContext(`${source.slice(start, end)}
globalThis.filterOptions = filterOptions;
globalThis.competitionMatchesDimensions = competitionMatchesDimensions;
`, context);

function assertSameArray(actual, expected) {
  assert.equal(JSON.stringify(actual), JSON.stringify(expected));
}

assertSameArray(context.filterOptions('year'), ['全部年份', '2026', '2025', '2024']);
assertSameArray(context.filterOptions('region'), ['全部地区', '安徽', '北京', '上海']);
assertSameArray(context.filterOptions('age'), ['全部年龄组', 'U6', 'U8', 'U10']);
assertSameArray(context.filterOptions('weapon'), ['全部剑种', '花剑', '重剑', '佩剑']);
assertSameArray(context.filterOptions('gender'), ['全部性别', '男子', '女子']);
assertSameArray(context.filterOptions('follow'), ['全部赛事', '我的关注', '关注选手', '关注赛事', '关注俱乐部']);
assert.equal(context.competitionMatchesDimensions(context.state.competitions[0], {
  age: 'U8',
  weapon: '花剑',
  gender: '男子',
}), true);
assert.equal(context.competitionMatchesDimensions(context.state.competitions[0], {
  age: 'U8',
  weapon: '重剑',
  gender: '男子',
}), false);
assert.equal(context.competitionMatchesDimensions({
  items: [
    { eventName: 'U8 男子花剑' },
    { eventName: 'U10 女子重剑' },
  ],
}, {
  age: 'U8',
  weapon: '花剑',
  gender: '女子',
}), false, 'all selected dimensions must match the same event item');
assert.equal(context.competitionMatchesDimensions({ filterBits: '2000000000000' }, {
  age: 'U8',
  weapon: '花剑',
  gender: '女子',
}), true, 'compact filter bitmap should preserve a valid project combination');
assert.equal(context.competitionMatchesDimensions({ filterBits: '2000000000000' }, {
  age: 'U8',
  weapon: '花剑',
  gender: '男子',
}), false, 'compact filter bitmap should not invent another gender');

assert.match(html, /id="ageFilterButton"/);
assert.match(html, /id="weaponFilterButton"/);
assert.match(html, /id="genderFilterButton"/);
assert.doesNotMatch(html, /id="itemFilterButton"/);
assert.match(css, /\.filter-actions\s*\{[\s\S]*grid-template-columns:\s*repeat\(6,/);
assert.match(css, /#ageFilterButton,[\s\S]*#weaponFilterButton,[\s\S]*#genderFilterButton\s*\{[\s\S]*grid-column:\s*span 2/);

console.log('filter options are normalized and separated');
