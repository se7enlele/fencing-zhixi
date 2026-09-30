const encoder = new TextEncoder();
export function authError(message, statusCode = 400) { return Object.assign(new Error(message), { statusCode }); }
export function emailIdentity(value) {
  const email = String(value || '').trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw authError('请输入有效邮箱。');
  return `email:${email}`;
}
export function newPassword(value) {
  if (typeof value !== 'string' || value.length < 10 || value.length > 64) throw authError('密码需为 10–64 位。');
  return value;
}
export async function digest(value) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))), b => b.toString(16).padStart(2, '0')).join('');
}
export function randomSecret() { return Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, '0')).join(''); }
export async function passwordRecord(password) {
  const salt = randomSecret();
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(salt), iterations: 100000 }, key, 256);
  return { codeSalt: salt, codeHash: Array.from(new Uint8Array(bits), b => b.toString(16).padStart(2, '0')).join(''), passwordAlgorithm: 'pbkdf2-sha256-v1' };
}
export async function passwordMatches(user, identity, password) {
  let actual;
  if (user.passwordAlgorithm === 'pbkdf2-sha256-v1') {
    const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(user.codeSalt), iterations: 100000 }, key, 256);
    actual = Array.from(new Uint8Array(bits), b => b.toString(16).padStart(2, '0')).join('');
  } else actual = await digest(`${identity}:${user.codeSalt}:${password.trim()}`);
  return constantEqual(actual, user.codeHash || '');
}
function constantEqual(a, b) { let diff = a.length ^ b.length; for(let i=0;i<Math.max(a.length,b.length);i++) diff |= (a.charCodeAt(i)||0) ^ (b.charCodeAt(i)||0); return diff===0; }
export function emailConfigured(env) { return Boolean(env.RESEND_API_KEY && env.AUTH_EMAIL_FROM); }
export async function sendAccountCode(env, to, code, purpose) {
  if (!emailConfigured(env)) throw authError('邮箱验证暂未开放，请稍后再试。已有账号仍可登录。', 503);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', signal: AbortSignal.timeout(15000),
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.AUTH_EMAIL_FROM, to: [to], subject: `FencingAI ${purpose === 'register' ? '注册' : '重置密码'}验证码`, text: `你的验证码是 ${code}，10 分钟内有效。请勿向他人透露。如非本人操作，请忽略此邮件。` }),
  });
  if (!response.ok) throw authError('验证码发送失败，请稍后重试。', 503);
}
// Stores only a random-code hash; never return verification secrets to callers.
export async function issueAccountCode(store, identity, purpose, send, now = Date.now()) {
  if (!['register', 'reset', 'bind'].includes(purpose)) throw authError('验证用途无效。');
  const key = `auth-code:${purpose}:${await digest(identity)}`;
  const old = await store.get(key);
  if (old && now - old.sentAt < 60000) throw authError('请等待 60 秒后再获取验证码。', 429);
  const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 100000000).padStart(8, '0');
  const record = { hash: await digest(`${identity}:${purpose}:${code}`), sentAt: now, expiresAt: now + 600000, attempts: 0, used: false };
  await store.put(key, { ...record, used: true });
  await send(identity.slice(6), code, purpose);
  await store.put(key, record);
  return { ok: true, message: '验证码已发送，请检查邮箱和垃圾邮件。', retryAfter: 60 };
}
export async function consumeAccountCode(store, identity, purpose, code, now = Date.now()) {
  const key = `auth-code:${purpose}:${await digest(identity)}`;
  const record = await store.get(key);
  if (!record || record.used || record.expiresAt < now || record.attempts >= 5) throw authError('验证码无效或已过期，请重新获取。');
  record.attempts++;
  const valid = /^\d{8}$/.test(String(code)) && constantEqual(await digest(`${identity}:${purpose}:${code}`), record.hash);
  if (valid) record.used = true;
  await store.put(key, record);
  if (!valid) throw authError('验证码不正确，请检查后重试。');
}

export async function accountAction(store, action, body, env, send = (to, code, purpose) => sendAccountCode(env, to, code, purpose), authenticatedUser = null, verification = null) {
  const identity = emailIdentity(body.identifier);
  const userId = await store.get(`identity:${identity}`);
  if (action === 'send-code') {
    if (!emailConfigured(env)) throw authError('邮箱验证暂未开放，请稍后再试。已有账号仍可登录。', 503);
    return verification ? verification.issue(identity, body.purpose) : issueAccountCode(store, identity, body.purpose, send);
  }
  if (action === 'bind-email') {
    if (!authenticatedUser) throw authError('请先登录。', 401);
    if (!await passwordMatches(authenticatedUser, authenticatedUser.identityKey, String(body.password || ''))) throw authError('当前密码不正确。');
    if (userId && userId !== authenticatedUser.id) throw authError('此邮箱已绑定其他账号。', 409);
    await (verification ? verification.consume(identity, 'bind', body.verificationCode) : consumeAccountCode(store, identity, 'bind', body.verificationCode));
    if (authenticatedUser.recoveryEmail && authenticatedUser.recoveryEmail !== identity) throw authError('已有找回邮箱，请使用原绑定邮箱。');
    await store.put(`user:${authenticatedUser.id}`, { ...authenticatedUser, recoveryEmail: identity, emailVerified: true });
    await store.put(`identity:${identity}`, authenticatedUser.id);
    return { ok: true, message: '找回邮箱已绑定，以后可用此邮箱登录或重置密码。' };
  }
  const password = newPassword(body.password);
  if (password !== body.confirmPassword) throw authError('两次输入的密码不一致。');
  if (!['register', 'reset-password'].includes(action)) throw authError('操作不存在。', 404);
  const purpose = action === 'register' ? 'register' : 'reset';
  await (verification ? verification.consume(identity, purpose, body.verificationCode) : consumeAccountCode(store, identity, purpose, body.verificationCode));
  if (action === 'register') {
    if (userId) throw authError('该邮箱已注册，请登录或找回密码。', 409);
    const id = `u_${(await digest(identity)).slice(0,24)}`;
    const now = new Date().toISOString();
    await store.put(`user:${id}`, { id, identityKey: identity, provider: 'password', emailVerified: true, ...await passwordRecord(password), authVersion: randomSecret(), profile: {}, createdAt: now, updatedAt: now });
    await store.put(`identity:${identity}`, id);
    return { ok: true, message: '注册成功，请使用新密码登录。' };
  }
  const user = userId && await store.get(`user:${userId}`);
  if (!user) throw authError('此邮箱尚未注册，请先创建账号。');
  await store.put(`user:${userId}`, { ...user, ...await passwordRecord(password), emailVerified: true, authVersion: randomSecret(), updatedAt: new Date().toISOString() });
  return { ok: true, message: '密码已更新，请重新登录。' };
}
