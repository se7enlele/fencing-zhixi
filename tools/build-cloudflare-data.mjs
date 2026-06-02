import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  getAthleteDirectory,
  getClubDirectory,
  getEventDetailByCode,
  getPublicEventsPayload,
} from '../server.mjs';

const outDir = path.join('cloudflare', 'data');
const outPath = path.join(outDir, 'public-data.mjs');

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

await mkdir(outDir, { recursive: true });
await writeFile(outPath, `export default ${JSON.stringify(payload, null, 2)};\n`, 'utf8');
console.log(JSON.stringify({
  ok: true,
  outPath,
  events: publicEvents.events.length,
  competitions: publicEvents.competitions.length,
  athletes: athletes.length,
  clubs: clubs.length,
}, null, 2));
