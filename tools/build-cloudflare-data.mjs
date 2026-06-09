import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  getAthleteDirectory,
  getClubDirectory,
  getEventDetailByCode,
  getPublicEventsPayload,
} from '../server.mjs';
import { buildSearchIndexes } from './search-index.mjs';

const assetOutDir = path.join('web', 'data');
const assetOutPath = path.join(assetOutDir, 'public-data-index.json');
const searchOutPath = path.join(assetOutDir, 'public-data-search-0.json');
const moduleOutDir = path.join('cloudflare', 'data');
const moduleOutPath = path.join(moduleOutDir, 'public-data.mjs');
const maxChunkBytes = 8 * 1024 * 1024;
const detailConcurrency = Math.max(1, Number(process.env.CF_BUILD_DETAIL_CONCURRENCY || 12));

function byteLength(value) {
  return Buffer.byteLength(JSON.stringify(value), 'utf8');
}

async function writeJsonFile(filePath, value) {
  const tempPath = `${filePath}.${process.pid}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(value)}\n`, 'utf8');
  await rename(tempPath, filePath);
}

async function writeObjectChunks(name, objectValue) {
  const entries = Object.entries(objectValue);
  const chunks = [];
  const chunkLookup = {};
  let chunk = {};
  let chunkIndex = 0;
  let chunkBytes = 2;

  async function flushChunk(currentChunk, currentIndex) {
    const fileName = `public-data-${name}-${currentIndex}.json`;
    const assetPath = `/data/${fileName}`;
    await writeJsonFile(path.join(assetOutDir, fileName), currentChunk);
    chunks.push(assetPath);
    for (const key of Object.keys(currentChunk)) {
      chunkLookup[key] = assetPath;
    }
  }

  for (const [key, value] of entries) {
    const entryBytes = byteLength(key) + byteLength(value) + 2;
    if (Object.keys(chunk).length && chunkBytes + entryBytes > maxChunkBytes) {
      await flushChunk(chunk, chunkIndex);
      chunk = { [key]: value };
      chunkBytes = 2 + entryBytes;
      chunkIndex += 1;
    } else {
      chunk[key] = value;
      chunkBytes += entryBytes;
    }
  }

  if (Object.keys(chunk).length || !entries.length) {
    await flushChunk(chunk, chunkIndex);
  }

  return { chunks, chunkLookup };
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  });
  await Promise.all(workers);
  return results;
}

const publicEvents = await getPublicEventsPayload();
const {
  athletes: _athletesForLocalApi,
  clubs: _clubsForLocalApi,
  ...workerPublicEvents
} = publicEvents;
const eventEntries = await mapLimit(
  publicEvents.events,
  detailConcurrency,
  async (event) => [event.eventCode, await getEventDetailByCode(event.eventCode)],
);
const athletes = await getAthleteDirectory();
const clubs = await getClubDirectory();

const payload = {
  version: publicEvents.version,
  publicEvents: workerPublicEvents,
  eventsByCode: Object.fromEntries(eventEntries),
  athletesById: Object.fromEntries(athletes.map((athlete) => [athlete.id, athlete])),
  clubsById: Object.fromEntries(clubs.map((club) => [club.id, club])),
};
const searchIndexes = buildSearchIndexes(athletes, clubs);

await mkdir(assetOutDir, { recursive: true });
await mkdir(moduleOutDir, { recursive: true });
const eventChunks = await writeObjectChunks('events', payload.eventsByCode);
const athleteChunks = await writeObjectChunks('athletes', payload.athletesById);
const clubChunks = await writeObjectChunks('clubs', payload.clubsById);
const chunks = {
  eventsByCode: eventChunks.chunks,
  athletesById: athleteChunks.chunks,
  clubsById: clubChunks.chunks,
  search: ['/data/public-data-search-0.json'],
};
const chunkLookup = {
  eventsByCode: eventChunks.chunkLookup,
  athletesById: athleteChunks.chunkLookup,
  clubsById: clubChunks.chunkLookup,
};
const indexPayload = {
  version: payload.version,
  publicEvents: payload.publicEvents,
  chunks,
  chunkLookup,
};
await writeFile(assetOutPath, `${JSON.stringify(indexPayload)}\n`, 'utf8');
await writeFile(searchOutPath, `${JSON.stringify(searchIndexes)}\n`, 'utf8');
await writeFile(moduleOutPath, `export default { version: ${JSON.stringify(payload.version)}, assetPath: '/data/public-data-index.json' };\n`, 'utf8');
console.log(JSON.stringify({
  ok: true,
  outPath: assetOutPath,
  moduleOutPath,
  chunks,
  events: publicEvents.events.length,
  competitions: publicEvents.competitions.length,
  athletes: athletes.length,
  clubs: clubs.length,
  detailConcurrency,
}, null, 2));
