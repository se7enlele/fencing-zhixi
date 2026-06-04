import { getPublicEventsPayload } from '../server.mjs';

const payload = await getPublicEventsPayload();
const club = (payload.clubs || []).find((item) => item.club === '山东小众体育');

if (!club) {
  throw new Error('山东小众体育 club profile missing');
}

const targetEvent = (club.events || []).find((event) => event.eventCode === 'RZSS2035083MFIU8');
if (!targetEvent) {
  throw new Error('山东小众体育 club profile is missing 焦兴元 2026 泗海杯 event');
}

if (!String(targetEvent.sportName || '').includes('2026年“泗海杯”')) {
  throw new Error(`unexpected club event sportName: ${targetEvent.sportName || ''}`);
}

if (targetEvent.openDate !== '2026.04.19') {
  throw new Error(`club event openDate missing or wrong: ${targetEvent.openDate || ''}`);
}

console.log('club directory includes full-event participation');
