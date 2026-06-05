import { mkdir, writeFile } from 'node:fs/promises';
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

function byteLength(value) {
  return Buffer.byteLength(JSON.stringify(value), 'utf8');
}

async function writeObjectChunks(name, objectValue) {
  const entries = Object.entries(objectValue);
  const chunks = [];
  let chunk = {};
  let chunkIndex = 0;

  for (const [key, value] of entries) {
    const nextChunk = { ...chunk, [key]: value };
    if (Object.keys(chunk).length && byteLength(nextChunk) > maxChunkBytes) {
      const fileName = `public-data-${name}-${chunkIndex}.json`;
      await writeFile(path.join(assetOutDir, fileName), `${JSON.stringify(chunk)}\n`, 'utf8');
      chunks.push(`/data/${fileName}`);
      chunk = { [key]: value };
      chunkIndex += 1;
    } else {
      chunk = nextChunk;
    }
  }

  if (Object.keys(chunk).length || !entries.length) {
    const fileName = `public-data-${name}-${chunkIndex}.json`;
    await writeFile(path.join(assetOutDir, fileName), `${JSON.stringify(chunk)}\n`, 'utf8');
    chunks.push(`/data/${fileName}`);
  }

  return chunks;
}

const publicEvents = await getPublicEventsPayload();
const {
  athletes: _athletesForLocalApi,
  clubs: _clubsForLocalApi,
  ...workerPublicEvents
} = publicEvents;
const eventEntries = await Promise.all(
  publicEvents.events.map(async (event) => [event.eventCode, await getEventDetailByCode(event.eventCode)]),
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
const chunks = {
  eventsByCode: await writeObjectChunks('events', payload.eventsByCode),
  athletesById: await writeObjectChunks('athletes', payload.athletesById),
  clubsById: await writeObjectChunks('clubs', payload.clubsById),
  search: ['/data/public-data-search-0.json'],
};
const indexPayload = {
  version: payload.version,
  publicEvents: payload.publicEvents,
  chunks,
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
}, null, 2));
