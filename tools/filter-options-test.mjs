import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
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
        region: '天津',
        items: [{ eventName: 'U8 男子花剑' }],
      },
      {
        sportName: '2026 上海公开赛',
        dateLabel: '2026.04.25',
        region: '北京',
        items: [{ eventName: 'U6 男子花剑' }],
      },
      {
        sportName: '2024 广州公开赛',
        dateLabel: '2024.03.10',
        region: '上海',
        items: [{ eventName: 'U8 女子重剑' }],
      },
    ],
  },
};

vm.createContext(context);
vm.runInContext(`${source.slice(start, end)}
globalThis.filterOptions = filterOptions;
`, context);

function assertSameArray(actual, expected) {
  assert.equal(JSON.stringify(actual), JSON.stringify(expected));
}

assertSameArray(context.filterOptions('year'), ['全部年份', '2026', '2025', '2024']);
assertSameArray(context.filterOptions('region'), ['全部地区', '北京', '上海', '天津']);
assertSameArray(context.filterOptions('item'), ['全部项目', 'U6 花剑', 'U8 花剑', 'U8 重剑']);

console.log('filter options are sorted');
