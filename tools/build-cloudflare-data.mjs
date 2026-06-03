import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  getAthleteDirectory,
  getClubDirectory,
  getEventDetailByCode,
  getPublicEventsPayload,
} from '../server.mjs';

const assetOutDir = path.join('web', 'data');
const assetOutPath = path.join(assetOutDir, 'public-data.json');
const moduleOutDir = path.join('cloudflare', 'data');
const moduleOutPath = path.join(moduleOutDir, 'public-data.mjs');

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

await mkdir(assetOutDir, { recursive: true });
await mkdir(moduleOutDir, { recursive: true });
await writeFile(assetOutPath, `${JSON.stringify(payload)}\n`, 'utf8');
await writeFile(moduleOutPath, `export default { version: ${JSON.stringify(payload.version)}, assetPath: '/data/public-data.json' };\n`, 'utf8');
console.log(JSON.stringify({
  ok: true,
  outPath: assetOutPath,
  moduleOutPath,
  events: publicEvents.events.length,
  competitions: publicEvents.competitions.length,
  athletes: athletes.length,
  clubs: clubs.length,
}, null, 2));
