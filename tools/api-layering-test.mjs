import { spawn } from 'node:child_process';

const port = 5191;
const baseUrl = `http://127.0.0.1:${port}`;

const server = spawn(process.execPath, ['server.mjs'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, PORT: String(port) },
});

function waitForServer() {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('server start timeout')), 5000);
    server.stdout.on('data', (chunk) => {
      if (chunk.toString().includes(baseUrl)) {
        clearTimeout(timeout);
        resolve();
      }
    });
    server.stderr.on('data', (chunk) => {
      console.error(chunk.toString());
    });
  });
}

try {
  await waitForServer();

  const competitionsResponse = await fetch(`${baseUrl}/api/competitions`);
  const competitionsPayload = await competitionsResponse.json();
  if (!competitionsResponse.ok || !competitionsPayload.ok) {
    throw new Error(competitionsPayload.message || `competitions status ${competitionsResponse.status}`);
  }
  if (!Array.isArray(competitionsPayload.competitions) || competitionsPayload.competitions.length < 700) {
    throw new Error('/api/competitions should include the competition index');
  }
  if ('events' in competitionsPayload || 'athletes' in competitionsPayload || 'clubs' in competitionsPayload) {
    throw new Error('/api/competitions must only return the competition index payload');
  }

  const eventsResponse = await fetch(`${baseUrl}/api/events`);
  const eventsPayload = await eventsResponse.json();
  if (!eventsResponse.ok || !eventsPayload.ok) {
    throw new Error(eventsPayload.message || `events status ${eventsResponse.status}`);
  }
  if (!Array.isArray(eventsPayload.events) || eventsPayload.events.length < 700) {
    throw new Error('/api/events should include the event index');
  }
  if ('competitions' in eventsPayload || 'athletes' in eventsPayload || 'clubs' in eventsPayload) {
    throw new Error('/api/events must only return the event index payload');
  }

  const athleteSearch = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent('蔡廷彧')}&type=athlete`);
  const athletePayload = await athleteSearch.json();
  if (!athleteSearch.ok || !athletePayload.ok) {
    throw new Error(athletePayload.message || `athlete search status ${athleteSearch.status}`);
  }
  if (!athletePayload.athletes?.some((athlete) => athlete.name === '蔡廷彧')) {
    throw new Error('athlete search should find 蔡廷彧');
  }

  const clubSearch = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent('山东小众体育')}&type=club`);
  const clubPayload = await clubSearch.json();
  if (!clubSearch.ok || !clubPayload.ok) {
    throw new Error(clubPayload.message || `club search status ${clubSearch.status}`);
  }
  if (!clubPayload.clubs?.some((club) => club.club === '山东小众体育')) {
    throw new Error('club search should find 山东小众体育');
  }

  console.log('api layering and search split are covered');
} finally {
  server.kill();
}
