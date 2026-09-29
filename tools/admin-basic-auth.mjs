const ADMIN_USER = 'admin';
const encoder = new TextEncoder();

function hexBytes(value) {
  if (!/^[0-9a-f]+$/i.test(value) || value.length % 2) return null;
  return Uint8Array.from(value.match(/.{2}/g), (part) => Number.parseInt(part, 16));
}

function constantEqual(left, right) {
  let difference = left.length ^ right.length;
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    difference |= (left[index] || 0) ^ (right[index] || 0);
  }
  return difference === 0;
}

export async function verifyAdminBasicAuth(header, passwordRecord) {
  if (!passwordRecord || !/^Basic [A-Za-z0-9+/=]+$/i.test(header || '')) return false;
  const [version, iterationText, saltHex, expectedHex] = String(passwordRecord).split(':');
  const iterations = Number(iterationText);
  const salt = hexBytes(saltHex || '');
  const expected = hexBytes(expectedHex || '');
  if (version !== 'pbkdf2-sha256-v1' || iterations < 100000 || iterations > 500000 || !salt || salt.length < 16 || !expected || expected.length !== 32) return false;
  let credentials;
  try { credentials = atob(header.slice(6)); }
  catch { return false; }
  const separator = credentials.indexOf(':');
  if (separator < 0 || credentials.slice(0, separator) !== ADMIN_USER) return false;
  const password = credentials.slice(separator + 1);
  if (!password || password.length > 256) return false;
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derived = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256));
  return constantEqual(derived, expected);
}

export function adminChallenge(isPage = false) {
  return new Response(isPage ? '需要管理员账号登录。' : JSON.stringify({ ok: false, message: '需要管理员账号登录。' }), {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="FencingAI Admin", charset="UTF-8"',
      'Cache-Control': 'no-store',
      'Content-Type': isPage ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    },
  });
}
