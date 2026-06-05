import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { groupEventsBySport } from '../cloudflare/edge-data.mjs';
import { buildPreEventCompetitions } from './pre-event-data.mjs';

const viewerSource = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const viewerStart = viewerSource.indexOf('function displayDateLabel');
const viewerEnd = viewerSource.indexOf('function competitionDateValue');

if (viewerStart === -1 || viewerEnd === -1 || viewerEnd <= viewerStart) {
  throw new Error('Unable to locate displayDateLabel in viewer.js');
}

const context = {};
vm.createContext(context);
vm.runInContext(`${viewerSource.slice(viewerStart, viewerEnd)}
globalThis.displayDateLabel = displayDateLabel;
`, context);

const noisyDate = Array.from({ length: 8 }, () => '2026-06-05 10:00:00').join(' / ');
assert.equal(context.displayDateLabel(noisyDate), '2026.06.05');
assert.equal(context.displayDateLabel('2026-06-05 10:00:00 / 2026-06-07 10:00:00'), '2026.06.05 / 2026.06.07');

const grouped = groupEventsBySport([
  {
    sportCode: 'NOISY2026',
    sportName: 'Noisy Open',
    venue: '武汉',
    eventCode: 'NOISY2026MFIU6',
    eventName: 'U6 男花',
    openDate: noisyDate,
  },
  {
    sportCode: 'NOISY2026',
    sportName: 'Noisy Open',
    venue: '武汉',
    eventCode: 'NOISY2026MFIU8',
    eventName: 'U8 男花',
    openDate: noisyDate,
  },
]);

assert.equal(grouped[0].dateLabel, '2026.06.05');

const [preEventCompetition] = buildPreEventCompetitions({
  projectLists: [{
    report: {
      normalizedItems: [
        {
          sourceSportCode: 'PRE2026',
          sourceEventCode: 'PRE2026MFIU6',
          itemName: 'U6 男花',
          startDate: noisyDate,
          totalRegNumber: 16,
        },
        {
          sourceSportCode: 'PRE2026',
          sourceEventCode: 'PRE2026MFIU8',
          itemName: 'U8 男花',
          startDate: noisyDate,
          totalRegNumber: 10,
        },
      ],
    },
  }],
});

assert.equal(preEventCompetition.dateLabel, '2026.06.05');

console.log('date label normalization is covered');
