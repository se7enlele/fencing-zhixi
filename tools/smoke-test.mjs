import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const port = 5188;
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
  const page = await fetch(`${baseUrl}/`);
  if (!page.ok) throw new Error(`page status ${page.status}`);

  const viewer = await fetch(`${baseUrl}/viewer`);
  if (!viewer.ok) throw new Error(`viewer status ${viewer.status}`);

  const adminPage = await fetch(`${baseUrl}/admin/import?token=fencingai-admin-2026`);
  if (!adminPage.ok) throw new Error(`admin import status ${adminPage.status}`);

  const events = await fetch(`${baseUrl}/api/events`);
  const eventsResult = await events.json();
  if (!events.ok || !eventsResult.ok) throw new Error(eventsResult.message || `events status ${events.status}`);
  if (!Array.isArray(eventsResult.competitions) || eventsResult.competitions.length === 0) {
    throw new Error('competitions payload missing');
  }

  const competitionCode = eventsResult.competitions[0].sportCode;
  const competition = await fetch(`${baseUrl}/api/competitions/${encodeURIComponent(competitionCode)}`);
  const competitionResult = await competition.json();
  if (!competition.ok || !competitionResult.ok) throw new Error(competitionResult.message || `competition status ${competition.status}`);

  const eventCode = competitionResult.competition.items[0].eventCode;
  const event = await fetch(`${baseUrl}/api/events/${encodeURIComponent(eventCode)}`);
  const eventResult = await event.json();
  if (!event.ok || !eventResult.ok) throw new Error(eventResult.message || `event status ${event.status}`);
  const athleteId = eventResult.event.athleteProfiles?.[0]?.id;
  const clubId = eventResult.event.clubProfiles?.[0]?.id;
  if (!athleteId) throw new Error('athlete profile id missing');
  if (!clubId) throw new Error('club profile id missing');
  if (!Array.isArray(eventResult.event.participants) || eventResult.event.participants.length === 0) {
    throw new Error('participants payload missing');
  }
  if (!Array.isArray(eventResult.event.poolGroups) || eventResult.event.poolGroups.length === 0) {
    throw new Error('pool groups payload missing');
  }

  const athlete = await fetch(`${baseUrl}/api/athletes/${athleteId}`);
  const athleteResult = await athlete.json();
  if (!athlete.ok || !athleteResult.ok) throw new Error(athleteResult.message || `athlete status ${athlete.status}`);

  const deviceId = 'device-smoke-test-20260527';
  const followSave = await fetch(`${baseUrl}/api/me/follows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, athlete: athleteResult.athlete }),
  });
  const followSaveResult = await followSave.json();
  if (!followSave.ok || !followSaveResult.ok) {
    throw new Error(followSaveResult.message || `follow save status ${followSave.status}`);
  }

  const follows = await fetch(`${baseUrl}/api/me/follows?deviceId=${encodeURIComponent(deviceId)}`);
  const followsResult = await follows.json();
  if (!follows.ok || !followsResult.ok) throw new Error(followsResult.message || `follows status ${follows.status}`);
  if (!followsResult.follows.some((item) => item.id === athleteId)) {
    throw new Error('followed athlete missing');
  }

  const followDelete = await fetch(`${baseUrl}/api/me/follows`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, athleteId }),
  });
  const followDeleteResult = await followDelete.json();
  if (!followDelete.ok || !followDeleteResult.ok) {
    throw new Error(followDeleteResult.message || `follow delete status ${followDelete.status}`);
  }

  const club = await fetch(`${baseUrl}/api/clubs/${clubId}`);
  const clubResult = await club.json();
  if (!club.ok || !clubResult.ok) throw new Error(clubResult.message || `club status ${club.status}`);

  const content = await readFile('data/samples/example-matchresult.json', 'utf8');
  const api = await fetch(`${baseUrl}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: 'example-matchresult.json',
      sourceUrl: 'https://fencing.yy-sport.com.cn/#/game/result?id=101199&eventCode=RZSS2035112MFIU10',
      content,
    }),
  });

  const result = await api.json();
  if (!api.ok || !result.ok) throw new Error(result.message || `api status ${api.status}`);

  const deniedPreview = await fetch(`${baseUrl}/api/admin/import/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: '{}' }),
  });
  if (deniedPreview.status !== 403) throw new Error(`admin preview should be forbidden, got ${deniedPreview.status}`);

  const existingScore = JSON.parse(await readFile('data/analysis/score-RZSS2036022MFIU6-analysis.json', 'utf8'));
  const syntheticScorePayload = {
    General: [{
      SportName: existingScore.general.sportName,
      EventName: existingScore.general.eventName,
      OpenDate: existingScore.general.openDate,
      Venue: existingScore.general.venue,
      CompetitionNo: existingScore.general.competitionNo,
      PoolQualifyNo: existingScore.general.poolQualifyNo,
      Scode: existingScore.general.sportCode,
      Ecode: existingScore.general.eventCode,
    }],
    Classment: existingScore.normalized.classment.map((row) => ({
      EventRank: row.rank,
      EventShowRank: row.displayRank,
      Fencer: row.name,
      Licence: row.licence,
      NOCCode: row.club,
      Birthday: row.birthday,
      Medal: row.medal,
      Statut: row.status,
      F_EventDisPos: row.sourcePosition,
      QualifyStatusId: row.qualifyStatusId,
    })),
    Pools: [],
    PoolStanding: [],
    PoolResults: [],
    PRDetails: [],
    Tableaus: [],
    Matchs: [],
    IniStarts: [],
  };
  const preview = await fetch(`${baseUrl}/api/admin/import/preview?token=fencingai-admin-2026`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: 'synthetic-score.json',
      sourceUrl: 'smoke-test',
      content: JSON.stringify(syntheticScorePayload),
    }),
  });
  const previewResult = await preview.json();
  if (!preview.ok || !previewResult.ok) throw new Error(previewResult.message || `admin preview status ${preview.status}`);
  const adminPreviewCode = previewResult.preview.eventCode;

  const rosterPreview = await fetch(`${baseUrl}/api/admin/import/preview?token=fencingai-admin-2026`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: 'member-page-1.json',
      sourceUrl: 'manual roster smoke',
      content: JSON.stringify({
        code: 0,
        msg: '操作成功',
        data: {
          records: [{
            sigupId: 'smoke-roster-1',
            registerType: 'athlete',
            registerId: '20100101MTEST',
            registerCode: '20100101MTEST',
            organCode: 'TESTCLUB',
            organName: '测试俱乐部',
            approveStatus: '2',
            sigupTime: '2026-05-29 15:08:04',
            sportName: '测试赛前赛事',
            sportCode: 'SMOKEPREEVENT',
            eventName: 'U8男子花剑个人',
            eventCode: 'SMOKEPREEVENTMFIU8',
            birthday: '2010-01-01',
            sex: 'M',
            sexDes: '男',
            weapon: 'F',
            weaponDes: '花剑',
            athleteName: '测试选手',
          }],
          current: 1,
          size: 10,
          total: 1,
        },
      }),
    }),
  });
  const rosterPreviewResult = await rosterPreview.json();
  if (!rosterPreview.ok || !rosterPreviewResult.ok) {
    throw new Error(rosterPreviewResult.message || `roster preview status ${rosterPreview.status}`);
  }
  if (rosterPreviewResult.preview.importType !== 'registration-roster') throw new Error('roster preview type missing');
  if (rosterPreviewResult.preview.summary.recordCount !== 1) throw new Error('roster preview count missing');
  if (rosterPreviewResult.importStats?.newRecords !== 1) throw new Error('roster preview import stats missing');

  console.log(JSON.stringify({
    ok: true,
    pageStatus: page.status,
    viewerStatus: viewer.status,
    adminStatus: adminPage.status,
    eventCount: eventsResult.events.length,
    competitionCount: eventsResult.competitions.length,
    firstCompetition: competitionCode,
    firstEvent: eventCode,
    participants: eventResult.event.participants.length,
    poolGroups: eventResult.event.poolGroups.length,
    athleteEvents: athleteResult.athlete.events.length,
    followCountAfterDelete: followDeleteResult.follows.length,
    clubEvents: clubResult.club.events.length,
    apiStatus: api.status,
    recordCount: result.records.length,
    adminPreviewCode,
    rosterPreviewType: rosterPreviewResult.preview.importType,
    rosterPreviewNewRecords: rosterPreviewResult.importStats.newRecords,
    rankingPath: result.records[0]?.extractedSamples?.rankingPath,
    matchPath: result.records[0]?.extractedSamples?.matchPath,
  }, null, 2));
} finally {
  server.kill();
}
