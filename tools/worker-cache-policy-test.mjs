import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../cloudflare/worker.mjs', import.meta.url), 'utf8');

function routeBlock(marker, nextMarker) {
  const start = source.indexOf(marker);
  const end = nextMarker ? source.indexOf(nextMarker, start + marker.length) : -1;
  assert.notEqual(start, -1, `Missing route marker ${marker}`);
  return source.slice(start, end === -1 ? source.length : end);
}

assert.match(
  source,
  /const PUBLIC_INDEX_CACHE = 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400';/,
  'Worker should define CDN caching for stable public indexes',
);

assert.match(
  source,
  /const PUBLIC_DETAIL_CACHE = 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800';/,
  'Worker should define CDN caching for stable public details',
);

assert.match(
  routeBlock("url.pathname === '/api/competitions'", "url.pathname === '/api/events'"),
  /PUBLIC_INDEX_CACHE/,
  'Competition index endpoint should use public CDN cache',
);

assert.match(
  routeBlock("url.pathname === '/api/events'", "url.pathname === '/api/search'"),
  /PUBLIC_INDEX_CACHE/,
  'Event index endpoint should use public CDN cache',
);

assert.match(
  routeBlock("url.pathname.startsWith('/api/events/')", "url.pathname.startsWith('/api/athletes/')"),
  /PUBLIC_DETAIL_CACHE/,
  'Event detail endpoint should use public CDN cache',
);

assert.match(
  source,
  /url\.pathname === '\/api\/me\/follows'[\s\S]{0,160}handleFollows/,
  'Follow endpoint should stay isolated from public cached data',
);

assert.match(
  source,
  /url\.pathname === '\/api\/feedback'[\s\S]{0,160}handleFeedback/,
  'Feedback endpoint should stay isolated from public cached data',
);

assert.match(
  source,
  /const FEEDBACK_INDEX_KEY = 'feedback:index';/,
  'Worker should index user feedback requests in KV',
);
assert.match(
  source,
  /const ANALYTICS_INDEX_KEY = 'analytics:index';/,
  'Worker should index analytics day buckets in KV',
);

assert.match(
  source,
  /'ai-helpful', 'ai-needs-work'/,
  'Worker should accept AI answer quality feedback types',
);
assert.match(
  source,
  /const isAiFeedback = type\.startsWith\('ai-'\);/,
  'Worker should route AI feedback through subject validation',
);

assert.match(
  source,
  /url\.pathname === '\/api\/admin\/feedback' && request\.method === 'GET'[\s\S]{0,160}handleAdminFeedback/,
  'Admin feedback endpoint should be token-gated and no-store',
);

assert.match(
  source,
  /url\.pathname === '\/api\/analytics'[\s\S]{0,160}handleAnalytics/,
  'Analytics ingest endpoint should stay isolated from public cached data',
);

assert.match(
  source,
  /url\.pathname === '\/api\/admin\/analytics' && request\.method === 'GET'[\s\S]{0,160}handleAdminAnalytics/,
  'Admin analytics endpoint should be token-gated and no-store',
);

assert.match(
  source,
  /url\.pathname === '\/api\/admin\/feedback\/status' && request\.method === 'POST'[\s\S]{0,180}handleAdminFeedbackStatus/,
  'Admin feedback status endpoint should be token-gated and no-store',
);

assert.match(
  source,
  /async function handleAdminFeedback\(env, url\)/,
  'Worker should expose an admin feedback reader',
);

assert.match(
  source,
  /async function handleAdminFeedbackStatus\(request, env, url\)/,
  'Worker should expose an admin feedback workflow updater',
);

assert.match(
  source,
  /async function handleAnalytics\(request, env\)/,
  'Worker should expose an analytics ingestion endpoint',
);

assert.match(
  source,
  /async function handleAdminAnalytics\(env, url\)/,
  'Worker should expose an admin analytics reader',
);

console.log('worker public cache policy is covered');
