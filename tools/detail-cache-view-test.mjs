import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');

assert.match(js, /detailCache: \{[\s\S]*athletes: new Map\(\),[\s\S]*clubs: new Map\(\),[\s\S]*competitions: new Map\(\),[\s\S]*events: new Map\(\),/, 'viewer state must include detail caches for major detail pages');
assert.match(js, /async function fetchCachedDetail\(type, key, path, pick\)/, 'viewer must expose a shared cached detail fetcher');
assert.match(js, /cache\?\.has\(cacheKey\)/, 'detail fetcher must reuse cached entries');
assert.match(js, /cache\.set\(cacheKey, detail\)/, 'detail fetcher must store successful detail responses');
assert.match(js, /fetchCachedDetail\(\s*'athletes'/, 'athlete detail must use the cached fetcher');
assert.match(js, /fetchCachedDetail\(\s*'clubs'/, 'club detail must use the cached fetcher');
assert.match(js, /fetchCachedDetail\(\s*'competitions'/, 'competition detail must use the cached fetcher');
assert.match(js, /fetchCachedDetail\(\s*'events'/, 'event detail must use the cached fetcher');

console.log('detail page caching is covered');
