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

console.log('worker public cache policy is covered');
