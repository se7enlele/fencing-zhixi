import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const buildScript = await readFile(new URL('./build-cloudflare-data.mjs', import.meta.url), 'utf8');
const serverScript = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');

assert.match(
  buildScript,
  /const generatedAt = publicEvents\.generatedAt;/,
  'Cloudflare data build should reuse the data payload generatedAt timestamp',
);
assert.doesNotMatch(
  buildScript,
  /const generatedAt = new Date\(\)\.toISOString\(\);/,
  'Cloudflare data build must not stamp every build with wall-clock time',
);
assert.match(
  serverScript,
  /function collectAnalysisTimestamps\(value, timestamps = \[\]\)/,
  'server should derive data freshness from analysis report content',
);
assert.match(
  serverScript,
  /analyzedAt\|generatedAt\|importedAt\|fetchedAt\|updatedAt\|createdAt/,
  'data freshness should include known analysis timestamp fields',
);

console.log('public data generatedAt is content-derived');
