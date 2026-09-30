let accountAuthMode = 'login';
let accountAuthIdentifier = '';
let accountAuthNotice = '';
let accountCodeUntil = 0;
let accountEmailAvailable = null;
let accountConfigRequest = null;
async function refreshAccountAvailability(root) {
  if (!accountConfigRequest) accountConfigRequest = fetch('/api/auth/config', { signal: AbortSignal.timeout(10000) })
    .then(async response => {
      if (!response.ok) throw new Error('账号配置暂时无法读取。');
      const config = await response.json();
      accountEmailAvailable = config.emailVerification === true;
    }).catch(() => { accountEmailAvailable = false; accountConfigRequest = null; });
  await accountConfigRequest;
  if (!root.isConnected) return;
  const notice = root.querySelector('[data-auth-availability]');
  if (notice) notice.textContent = accountEmailAvailable ? '' : '邮箱注册与密码找回暂未开放，已有账号可继续登录。';
  root.querySelectorAll('[data-auth-send-code], [data-bind-send]').forEach(button => {
    button.disabled = !accountEmailAvailable || accountCodeUntil > Date.now();
  });
  if (root.querySelector('[name="verificationCode"]')) root.querySelector('[type="submit"]').disabled = !accountEmailAvailable;
}
function accountAuthMarkup() {
  const mode = accountAuthMode;
  const titles = { login: '欢迎回来', register: '创建你的账号', reset: '找回密码' };
  const subtitles = { login: '登录后，在不同设备上继续查看关注和报告。', register: '验证邮箱，保存你的关注、赛事记录与报告。', reset: '使用注册邮箱验证身份，再设置新密码。' };
  return `<section class="panel account-login-page auth-card">
    <div class="auth-brand"><span class="brand-mark" aria-hidden="true"></span>FencingAI · 你的击剑赛事助手</div>
    <h2>${titles[mode]}</h2><p class="auth-subtitle">${subtitles[mode]}</p>
    ${mode !== 'reset' ? `<nav class="auth-mode" aria-label="账号操作"><button type="button" data-auth-mode="login" aria-pressed="${mode === 'login'}">登录</button><button type="button" data-auth-mode="register" aria-pressed="${mode === 'register'}">注册</button></nav>` : ''}
    <p class="auth-help" data-auth-availability role="status"></p>
    <form class="account-login-form" data-account-login>
      <label for="authIdentifier"><span>${mode === 'login' ? '手机号或邮箱' : '邮箱'}</span><input id="authIdentifier" name="identifier" type="${mode === 'login' ? 'text' : 'email'}" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="254" required value="${escapeHtml(accountAuthIdentifier)}" placeholder="${mode === 'login' ? '输入你的手机号或邮箱' : '输入可接收验证码的邮箱'}"></label>
      ${mode !== 'login' ? `<label for="authVerification"><span>邮箱验证码</span><div class="auth-code-row"><input id="authVerification" name="verificationCode" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{8}" maxlength="8" required placeholder="8 位验证码"><button type="button" data-auth-send-code>获取验证码</button></div></label>` : ''}
      <label for="authPassword"><span>${mode === 'reset' ? '新密码' : '密码'}</span><div class="auth-password-row"><input id="authPassword" name="code" type="password" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}" minlength="${mode === 'login' ? '6' : '10'}" maxlength="64" required placeholder="${mode === 'login' ? '输入密码' : '10–64 位，建议使用长密码'}"><button type="button" data-auth-reveal aria-label="显示密码" aria-pressed="false">显示</button></div></label>
      ${mode !== 'login' ? '<label for="authConfirm"><span>确认密码</span><input id="authConfirm" name="confirmPassword" type="password" autocomplete="new-password" minlength="10" maxlength="64" required placeholder="再次输入密码"></label>' : '<button type="button" class="auth-forgot" data-auth-mode="reset">忘记密码？</button>'}
      <p data-account-status role="status" aria-live="polite">${escapeHtml(accountAuthNotice)}</p>
      <button type="submit" class="auth-submit">${mode === 'login' ? '登录账号' : mode === 'register' ? '注册账号' : '重置密码'}</button>
    </form>
    ${mode === 'reset' ? '<p class="auth-help">手机号账号请使用已绑定的找回邮箱；未绑定邮箱的账号暂不支持邮箱找回。</p><button type="button" class="auth-back" data-auth-mode="login">返回登录</button>' : ''}
    <button type="button" class="auth-guest" data-auth-guest>暂不登录，继续浏览赛事</button>
    <p class="auth-footnote">公开赛事与积分无需登录即可查看。</p>
  </section>`;
}
async function accountAuthRequest(path, body) {
  const response = await fetch(path, { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(body), signal: AbortSignal.timeout(20000) });
  let data;
  try { data = await response.json(); } catch { throw new Error('服务暂不可用，请稍后重试。'); }
  if (!response.ok || !data.ok) throw new Error(data.message || '操作失败，请稍后重试。');
  return data;
}

function renderRecoveryEmailForm() {
  accountLoginPage.innerHTML = `<section class="panel account-login-page auth-card"><h2>设置找回邮箱</h2><p class="auth-subtitle">验证邮箱与当前密码，之后可用邮箱找回这个账号。</p><form class="account-login-form"><label><span>找回邮箱</span><input name="identifier" type="email" required autocomplete="email" placeholder="输入你的邮箱"></label><label><span>邮箱验证码</span><div class="auth-code-row"><input name="verificationCode" required pattern="[0-9]{8}" maxlength="8" inputmode="numeric" autocomplete="one-time-code" placeholder="8 位验证码"><button type="button" data-bind-send>获取验证码</button></div></label><label><span>当前密码</span><input name="password" type="password" required autocomplete="current-password"></label><p role="status" data-account-status aria-live="polite"></p><button class="auth-submit" type="submit">验证并绑定</button></form><button type="button" class="auth-back" data-bind-back>返回我的</button></section>`;
  const form = accountLoginPage.querySelector('form');
  const status = form.querySelector('[data-account-status]');
  status.insertAdjacentHTML('beforebegin', '<p class="auth-help" data-auth-availability role="status"></p>');
  refreshAccountAvailability(accountLoginPage);
  const send = form.querySelector('[data-bind-send]');
  send.addEventListener('click', async () => {
    if (!form.elements.identifier.reportValidity()) return;
    send.disabled = true;
    try { const r = await accountAuthRequest('/api/auth/send-code', { identifier: form.elements.identifier.value, purpose: 'bind' }); status.textContent = r.message; setTimeout(() => { send.disabled = false; }, 60000); }
    catch(e) { status.textContent = e.message; send.disabled = false; }
  });
  form.addEventListener('submit', async event => {
    event.preventDefault(); const button = form.querySelector('[type="submit"]'); button.disabled = true;
    try { const r = await accountAuthRequest('/api/auth/bind-email', Object.fromEntries(new FormData(form))); status.textContent = r.message; form.elements.password.value = ''; }
    catch(e) { status.textContent = e.message; }
    finally { button.disabled = false; }
  });
  accountLoginPage.querySelector('[data-bind-back]').addEventListener('click', () => navigateMain('my'));
}
function bindAccountAuthPage() {
  const root = accountLoginPage;
  refreshAccountAvailability(root);
  const form = root.querySelector('form');
  const status = root.querySelector('[data-account-status]');
  const showError = message => { status.textContent = message; status.dataset.error = 'true'; };
  root.querySelectorAll('[data-auth-mode]').forEach(button => button.addEventListener('click', () => {
    accountAuthIdentifier = form.elements.identifier.value;
    if (button.dataset.authMode !== 'login' && !accountAuthIdentifier.includes('@')) accountAuthIdentifier = '';
    accountAuthMode = button.dataset.authMode;
    accountAuthNotice = '';
    renderAccountLoginPage();
    syncViewUrl('accountLogin');
    accountLoginPage.querySelector('input')?.focus();
  }));
  root.querySelector('[data-auth-guest]').addEventListener('click', () => navigateMain('home'));
  root.querySelector('[data-auth-reveal]').addEventListener('click', event => {
    const field = form.elements.code;
    field.type = field.type === 'password' ? 'text' : 'password';
    event.currentTarget.textContent = field.type === 'password' ? '显示' : '隐藏';
    event.currentTarget.setAttribute('aria-pressed', String(field.type === 'text'));
    event.currentTarget.setAttribute('aria-label', field.type === 'password' ? '显示密码' : '隐藏密码');
  });
  const send = root.querySelector('[data-auth-send-code]');
  const tick = () => {
    if (!send?.isConnected) return;
    const seconds = Math.max(0, Math.ceil((accountCodeUntil - Date.now()) / 1000));
    send.disabled = accountEmailAvailable === false || seconds > 0;
    send.textContent = seconds ? `${seconds} 秒后重发` : '获取验证码';
    if (seconds) setTimeout(tick, 1000);
  };
  tick();
  send?.addEventListener('click', async () => {
    if (!form.elements.identifier.reportValidity()) return;
    send.disabled = true;
    send.textContent = '正在发送';
    try {
      const result = await accountAuthRequest('/api/auth/send-code', { identifier: form.elements.identifier.value, purpose: accountAuthMode === 'register' ? 'register' : 'reset' });
      status.dataset.error = 'false'; status.textContent = result.message;
      accountCodeUntil = Date.now() + result.retryAfter * 1000;
    } catch(error) { showError(error.name === 'TimeoutError' ? '发送超时，请稍后重试。' : error.message); }
    finally { tick(); }
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const mode = accountAuthMode;
    if (mode !== 'login' && form.elements.code.value !== form.elements.confirmPassword.value) { showError('两次输入的密码不一致。'); form.elements.confirmPassword.focus(); return; }
    const controls = [...root.querySelectorAll('button')];
    controls.forEach(button => { button.disabled = true; });
    status.dataset.error = 'false'; status.textContent = mode === 'login' ? '正在登录…' : '正在验证…';
    try {
      if (mode === 'login') await submitAccountLogin(form);
      else {
        const result = await accountAuthRequest(`/api/auth/${mode === 'register' ? 'register' : 'reset-password'}`, { identifier: form.elements.identifier.value, verificationCode: form.elements.verificationCode.value, password: form.elements.code.value, confirmPassword: form.elements.confirmPassword.value });
        accountAuthIdentifier = form.elements.identifier.value;
        accountAuthMode = 'login'; accountAuthNotice = result.message;
        renderAccountLoginPage();
        syncViewUrl('accountLogin', true);
        accountLoginPage.querySelector('[name="code"]')?.focus();
      }
    } catch(error) { showError(error.name === 'TimeoutError' ? '请求超时，请重试。' : error.message); }
    finally {
      controls.forEach(button => { button.disabled = false; });
      tick();
      if (root.isConnected && mode !== 'login' && accountEmailAvailable === false) form.querySelector('[type="submit"]').disabled = true;
    }
  });
}
