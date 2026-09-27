import { writeFile, rename, readFile, mkdir } from 'node:fs/promises';
import { normalizePointsMetadata, normalizePointsPage, pointsKey } from './points-data.mjs';
import { pointsSourceJson } from './points-source-node.mjs';

const season = String(new Date().getFullYear());
const params = new URLSearchParams({ season, itemType: 'I' });
const [weeks, groups] = await Promise.all([pointsSourceJson(`/fencingapi/rankinfo/total/getWeek?${params}`), pointsSourceJson(`/fencingapi/rankinfo/total/groupcode?${params}`)]);
const metadata = normalizePointsMetadata(weeks, groups, season);
const queries = metadata.groups.flatMap(({ value: groupCode }) => ['M','F'].flatMap(gender => ['F','E','S'].map(weapon => ({ season, week: metadata.weeks[0].value, gender, weapon, groupCode, current: 1, searchName: '' }))));
await mkdir(new URL('../output/', import.meta.url), { recursive: true });
const checkpoint = new URL('../output/points-seed-checkpoint.json', import.meta.url);
const existing = await readFile(checkpoint, 'utf8').then(JSON.parse).catch(() => null);
const pages = existing?.season === season && existing?.week === metadata.weeks[0].value ? existing.pages : {}, failures = [];
let checkpointWrite = Promise.resolve();
let index = 0;
await Promise.all(Array.from({ length: 2 }, async () => {
  while (index < queries.length) {
    const query = queries[index++];
    if (pages[pointsKey(query)] && Date.now() - Date.parse(pages[pointsKey(query)].fetchedAt) < 3600000) continue;
    delete pages[pointsKey(query)];
    let done = false;
    for (let attempt = 0; attempt < 2 && !done; attempt++) {
      try {
        const payload = await pointsSourceJson(`/fencingapi/rankinfo/total/week?${new URLSearchParams({ ...query, itemType: 'I', size: '20' })}`);
        pages[pointsKey(query)] = normalizePointsPage(payload, query);
        checkpointWrite = checkpointWrite.then(() => writeFile(checkpoint, JSON.stringify({ season, week: metadata.weeks[0].value, pages })));
        await checkpointWrite;
        console.log(`${query.groupCode} ${query.gender}${query.weapon}: ${pages[pointsKey(query)].total}`);
        done = true;
      } catch (error) { if (attempt === 1) failures.push({ group: `${query.groupCode}-${query.gender}-${query.weapon}`, message: error.message }); }
    }
  }
}));
await checkpointWrite;
if (!Object.keys(pages).length) throw new Error('No verified pages; previous snapshot retained');
const target = new URL('../data/points-seed.mjs', import.meta.url);
const temp = new URL('../data/points-seed.mjs.tmp', import.meta.url);
await writeFile(temp, `// Public ranking fields only. First-page outage fallback; remaining pages use the official API.\nexport default ${JSON.stringify({ metadata, pages, unavailableGroups: failures.map(r => r.group) })};\n`);
await rename(temp, target);
console.log(`Saved ${Object.keys(pages).length} verified group snapshots for ${metadata.weeks[0].value}`);
if (failures.length) { console.error(`Unavailable source groups (not fabricated): ${failures.map(r => r.group).join(', ')}`); process.exitCode = 1; }
