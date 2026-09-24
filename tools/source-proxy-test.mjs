import assert from 'node:assert/strict';
import proxy from '../cloudflare/source-proxy.mjs';

const originalFetch = globalThis.fetch;
let forwarded;
globalThis.fetch = async (url, options) => {
  forwarded = { url, options };
  return new Response('{"code":0}', { headers: { 'Content-Type': 'application/json' } });
};
try {
  const response = await proxy.fetch(new Request('https://proxy.example/fencingapi/sigup/memberlistbytype?current=1', {
    method: 'POST', headers: { 'Content-Type': 'application/json;charset=UTF-8' }, body: '{"eventCode":"TEST"}',
  }));
  assert.equal(response.status, 200);
  assert.equal(forwarded.options.headers['Content-Type'], 'application/json;charset=UTF-8');
  assert.equal(await new Response(forwarded.options.body).text(), '{"eventCode":"TEST"}');
  assert.match(forwarded.url, /memberlistbytype\?current=1$/);
  const attempts = [];
  globalThis.fetch = async (url, options) => {
    attempts.push({ url, body: options.body });
    if (attempts.length === 1) throw new Error('origin connection timed out');
    return new Response('{"code":0}');
  };
  await proxy.fetch(new Request('https://proxy.example/fencingapi/sigup/memberlistbytype', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"eventCode":"TEST"}',
  }));
  assert.equal(attempts.length, 2);
  assert.match(attempts[1].url, /^https:\/\/fencing\.yy-sport\.com\.cn\//);
  assert.equal(await new Response(attempts[1].body).text(), '{"eventCode":"TEST"}');
  let deniedCalls = 0;
  globalThis.fetch = async () => { deniedCalls += 1; return new Response('denied', { status: 403 }); };
  assert.equal((await proxy.fetch(new Request('https://proxy.example/'))).status, 403);
  assert.equal(deniedCalls, 1, 'access denials must not trigger alternate requests');
} finally {
  globalThis.fetch = originalFetch;
}
console.log('source proxy preserves JSON content type and request body');
