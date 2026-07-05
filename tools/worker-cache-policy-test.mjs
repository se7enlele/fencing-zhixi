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
  /url\.pathname === '\/api\/auth\/login' && request\.method === 'POST'[\s\S]{0,200}handleAuthLogin/,
  'Worker should expose a lightweight login endpoint outside public cached data',
);
assert.match(
  source,
  /url\.pathname === '\/api\/auth\/me' && request\.method === 'GET'[\s\S]{0,200}handleAuthMe/,
  'Worker should expose an authenticated user profile reader',
);
assert.match(
  source,
  /url\.pathname === '\/api\/auth\/wechat\/status' && request\.method === 'GET'[\s\S]{0,160}handleWechatAuthStatus/,
  'Worker should expose a reserved WeChat auth status endpoint',
);
assert.match(
  source,
  /url\.pathname === '\/api\/me\/profile' && request\.method === 'POST'[\s\S]{0,200}handleSaveUserProfile/,
  'Worker should expose an authenticated user profile sync endpoint',
);
assert.match(
  source,
  /url\.pathname === '\/api\/me\/export' && request\.method === 'GET'[\s\S]{0,200}handleExportUserProfile/,
  'Worker should expose an authenticated profile export endpoint',
);
assert.match(
  source,
  /url\.pathname === '\/api\/me\/profile' && request\.method === 'DELETE'[\s\S]{0,200}handleClearUserProfile/,
  'Worker should expose an authenticated profile clear endpoint',
);
assert.match(
  source,
  /const AUTH_SESSION_TTL_SECONDS = 60 \* 60 \* 24 \* 90/,
  'Worker auth sessions should expire instead of living forever',
);
assert.match(
  source,
  /const LOGIN_RATE_LIMIT_MAX = 12/,
  'Worker should define a basic login rate limit',
);
assert.match(
  source,
  /auth-attempt:\$\{await requestClientKey\(request, identityKey\)\}/,
  'Worker should rate-limit auth attempts by identity and client',
);
assert.match(
  source,
  /MAX_PROFILE_BODY_BYTES = 160 \* 1024/,
  'Worker should limit account profile payload size',
);
assert.match(
  source,
  /function sanitizeProfileRows\(rows, limit\)/,
  'Worker should sanitize account profile rows before saving',
);
assert.match(
  source,
  /codeHash: await hashLoginCode\(identityKey, code, salt\)/,
  'Worker should store login-code hashes instead of plaintext codes',
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
  /'correct', 'hide', 'claim-athlete'/,
  'Worker should accept athlete correction, hide, and claim request types',
);
assert.match(
  source,
  /'ai-helpful', 'ai-needs-work', 'pilot-interest', 'membership-interest'/,
  'Worker should accept AI answer quality feedback and commercial interest types',
);
assert.match(
  source,
  /const isSubjectFeedback = isAiFeedback \|\| type === 'pilot-interest' \|\| type === 'membership-interest';/,
  'Worker should route AI feedback and commercial interest through subject validation',
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
  /'pageview', 'duration', 'action'/,
  'Worker should accept product action analytics events',
);
assert.match(
  source,
  /actions: topMetricRows\(day\.actions\)/,
  'Admin analytics should expose top product actions',
);
assert.match(
  source,
  /actionLabels: topMetricRows\(day\.actionLabels\)/,
  'Admin analytics should expose action detail labels',
);
assert.match(
  source,
  /if \(type === 'action' && action\)/,
  'Worker should aggregate action events separately from page views',
);

assert.match(
  source,
  /async function handleAdminAnalytics\(env, url\)/,
  'Worker should expose an admin analytics reader',
);

console.log('worker public cache policy is covered');
