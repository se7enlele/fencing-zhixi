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
} finally {
  globalThis.fetch = originalFetch;
}
console.log('source proxy preserves JSON content type and request body');
