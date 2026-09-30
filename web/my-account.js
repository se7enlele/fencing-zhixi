function myIdentityMarkup(signed, user, eventCount, athleteCount) {
  const avatar = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3z"/></svg>';
  return `<section class="panel my-identity-card"><div class="my-identity-head"><span class="my-identity-avatar ${signed ? 'signed' : ''}">${avatar}</span><div><h2>${escapeHtml(signed ? user.displayName || user.identifier || '我的账号' : '未登录')}</h2><p>${signed ? '关注与报告，随账号保存' : '登录后保存你关注的赛事与选手'}</p></div></div>${signed ? `<div class="my-identity-counts"><button type="button" data-my-jump="关注赛事"><strong>${eventCount}</strong><span>关注赛事</span></button><button type="button" data-my-jump="athletes"><strong>${athleteCount}</strong><span>关注选手</span></button></div>` : ''}</section>`;
}
function organizeMyAccountPage(signed) {
  const root = myPage;
  const oldHero = root.querySelector('.my-hero');
  const role = oldHero?.querySelector('[data-role-switch]');
  const sections = [...root.children].filter(node => node !== oldHero && !node.classList.contains('my-stat-grid'));
  oldHero?.remove();
  root.querySelector('.my-stat-grid')?.remove();
  const header = document.createElement('div');
  header.innerHTML = myIdentityMarkup(signed, state.authUser, followedCompetitionCards().length, focusAthleteCards().length);
  root.prepend(header.firstElementChild);
  const menus = document.createElement('section');
  menus.className = 'panel my-account-menu';
  if (signed) menus.innerHTML = '<h2>常用功能</h2>';
  else menus.innerHTML = '<button type="button" class="my-signin-primary" data-account-open-login>登录 / 注册</button><p class="my-guest-note">未登录也可以查看公开赛事与积分。</p>';
  root.append(menus);
  for (const section of sections) {
    const title = section.querySelector('h2')?.textContent || '我的记录';
    const isAccount = section.classList.contains('account-center-panel');
    if (!signed && isAccount) { section.remove(); continue; }
    if (!signed && !section.querySelector('.follow-card, [data-row-id], [data-report-history-id], [data-ai-history-query]')) { section.remove(); continue; }
    const details = document.createElement('details');
    details.className = 'my-menu-detail';
    const summary = document.createElement('summary');
    summary.innerHTML = `<span class="my-menu-symbol" aria-hidden="true">${isAccount ? '◎' : title.includes('报告') ? '▤' : '◇'}</span><span><strong>${escapeHtml(isAccount ? '账号与安全' : title)}</strong><small>${escapeHtml(isAccount ? '找回邮箱、账号资料与退出登录' : !signed ? '这台设备上的浏览记录' : '展开查看')}</small></span><i aria-hidden="true">›</i>`;
    details.append(summary, section);
    if (title === myFollowSectionCopy().title) details.dataset.mySection = 'athletes';
    else details.dataset.mySection = title;
    menus.append(details);
  }
  const services = document.createElement('section');
  services.className = 'panel my-account-menu';
  services.innerHTML = `<h2>服务与说明</h2>
    <details class="my-menu-detail"><summary><span class="my-menu-symbol">?</span><span><strong>使用帮助</strong><small>查看赛事、关注选手与积分</small></span><i>›</i></summary><div class="my-help-copy">在赛事页查找比赛，进入详情可查看名单、小组成绩、淘汰赛和排名。点击关注后，可在“我的”中继续查看。积分页展示官方公布的榜单，不等同于单场排名。</div></details>
    <details class="my-menu-detail"><summary><span class="my-menu-symbol">▤</span><span><strong>服务与数据说明</strong><small>了解数据来源和使用范围</small></span><i>›</i></summary><div class="my-help-copy">公开赛事数据无需登录即可浏览。收录数据可能晚于现场进度，正式比赛安排和赛果以赛事官方发布为准。AI 分析用于辅助了解已有记录，不是官方评定。</div></details>
    <details class="my-menu-detail"><summary><span class="my-menu-symbol">◎</span><span><strong>账号与隐私说明</strong><small>查看资料保存方式</small></span><i>›</i></summary><div class="my-help-copy">未登录的关注和浏览记录保存在当前浏览器。登录后，关注、历史与报告可以保存在账号中；退出登录不会自动清除浏览器中的记录。登录后可在账号与安全中导出或清空账号资料。请勿在公共设备保留登录状态。</div></details>
    <details class="my-menu-detail"><summary><span class="my-menu-symbol">◇</span><span><strong>儿童信息使用提示</strong><small>由监护人管理关注与报告</small></span><i>›</i></summary><div class="my-help-copy">建议由监护人使用账号管理孩子的参赛记录。请勿在昵称、分析问题或反馈中填写身份证号、家庭住址等与赛事查询无关的信息。缺少比赛记录不代表选手能力较弱。</div></details>`;
  root.append(services);
  if (role) { role.className = 'my-role-entry'; role.textContent = `切换使用视角 · ${roleLabel(state.userRole || 'parent')}`; root.append(role); }
  root.querySelectorAll('[data-my-jump]').forEach(button => button.addEventListener('click', () => {
    const target = [...root.querySelectorAll('[data-my-section]')].find(node => node.dataset.mySection === button.dataset.myJump);
    if (target) { target.open = true; target.scrollIntoView({ block: 'start' }); }
  }));
}
