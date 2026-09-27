const pointsUi = { metadata: null, result: null, loading: false, error: '', requestId: 0, query: { gender: 'M', weapon: 'F', groupCode: 'U10', week: '', current: 1, q: '' } };

function pointsOption(value, label, selected) {
  return `<option value="${escapeHtml(value)}" ${value === selected ? 'selected' : ''}>${escapeHtml(label)}</option>`;
}

function pointsRowHtml(row) {
  return `<article class="points-row ${row.rank <= 3 ? `points-top-${row.rank}` : ''}"><span class="points-rank" aria-label="第 ${row.rank} 名">${row.rank}</span><div class="points-person"><strong>${escapeHtml(row.name)}</strong><span>${escapeHtml(row.club || '所属单位未公布')}</span><button type="button" data-points-athlete="${escapeHtml(row.name)}" aria-label="查找${escapeHtml(row.name)}的参赛记录">查参赛记录 ›</button></div><div class="points-value"><strong>${Number(row.points).toLocaleString('zh-CN', { maximumFractionDigits: 2 })}</strong><small>积分</small></div></article>`;
}

function drawPointsPage() {
  const page = document.querySelector('#pointsPage');
  if (!page) return;
  const ui = pointsUi, meta = ui.metadata, result = ui.result, query = ui.query;
  const date = result?.fetchedAt ? new Date(result.fetchedAt).toLocaleString('zh-CN', { hour12: false }) : '';
  const group = meta?.groups.find(r => r.value === query.groupCode)?.label || query.groupCode;
  const scope = `${query.gender === 'M' ? '男子' : '女子'}${{ F: '花剑', E: '重剑', S: '佩剑' }[query.weapon]} · ${group}`;
  page.innerHTML = `<section class="points-intro"><span class="eyebrow">中国击剑协会 · ${escapeHtml(meta?.season || '')} 赛季</span><h2>个人积分</h2><p>${escapeHtml(query.week || '正在获取官方周榜')}</p></section>
    ${meta ? `<section class="points-controls panel"><div class="points-filter-row"><label><span>性别</span><select id="pointsGender">${pointsOption('M','男子',query.gender)}${pointsOption('F','女子',query.gender)}</select></label><label><span>剑种</span><select id="pointsWeapon">${[['F','花剑'],['E','重剑'],['S','佩剑']].map(([v,l])=>pointsOption(v,l,query.weapon)).join('')}</select></label><label><span>组别</span><select id="pointsGroup">${meta.groups.map(r=>pointsOption(r.value,r.label,query.groupCode)).join('')}</select></label></div><label class="points-week-label"><span>榜单周次</span><select id="pointsWeek">${meta.weeks.map(r=>pointsOption(r.value,r.value,query.week)).join('')}</select></label><form id="pointsSearch" class="home-search" role="search"><label class="sr-only" for="pointsName">在当前组别搜索姓名</label><input type="search" id="pointsName" placeholder="在当前组别搜索姓名" maxlength="50" value="${escapeHtml(query.q)}"><button type="submit">搜索</button></form>${query.q ? '<button type="button" class="points-clear" data-points-clear>清除姓名，查看完整榜单</button>' : ''}</section>` : ''}
    <section aria-live="polite" aria-busy="${ui.loading}" class="points-results">
    ${ui.loading ? '<div class="points-loading panel"><span class="points-loading-dot" aria-hidden="true"></span><strong>正在读取官方积分</strong><p>首次查询可能需要几秒钟，请稍候。</p></div>' : ui.error ? `<div class="agenda-empty"><strong>这次没有读到榜单</strong><p>${escapeHtml(ui.error)}</p><button type="button" data-points-retry>重新加载</button></div>` : result ? `<div class="agenda-heading"><h3>${escapeHtml(scope)}</h3><span>${query.q ? '匹配 ' : '共 '}${result.total} 人</span></div>${result.cacheStatus === 'stale' || result.metadataStatus === 'stale' ? '<p class="points-warning">官方服务部分数据暂未刷新，以下为已成功获取的榜单，周次以上方标注为准。</p>' : ''}${result.rows.length ? `<div class="points-list">${result.rows.map(pointsRowHtml).join('')}</div>` : `<div class="agenda-empty"><strong>${query.q ? '当前组别未找到这个名字' : '本组周榜暂无排名记录'}</strong><p>${query.q ? '可以切换组别或检查姓名；未上榜不代表没有参赛记录。' : '此结果来自官方接口，不代表其他组别没有积分。'}</p></div>`}<nav class="points-pagination" aria-label="积分分页"><button type="button" data-points-page="${query.current - 1}" ${query.current <= 1 ? 'disabled' : ''}>上一页</button><span>${query.current} / ${Math.max(1,Math.ceil(result.total / result.pageSize))}</span><button type="button" data-points-page="${query.current + 1}" ${query.current * result.pageSize >= result.total ? 'disabled' : ''}>下一页</button></nav><p class="points-source-note">${query.q ? '搜索结果保留官方原始名次。' : '名次与积分按官方榜单展示。'}<br>获取时间：${escapeHtml(date)}<br><a href="${escapeHtml(result.source)}" target="_blank" rel="noopener noreferrer">查看官方积分来源 ↗</a></p>` : ''}
    </section><p class="home-data-note">组别与周次来自官方公开目录。积分榜与单场赛果不同；查参赛记录后，请结合俱乐部核对同名选手。</p>`;
  for (const [id, key] of [['pointsGender','gender'],['pointsWeapon','weapon'],['pointsGroup','groupCode'],['pointsWeek','week']]) {
    page.querySelector(`#${id}`)?.addEventListener('change', event => {
      ui.query[key] = event.target.value; ui.query.current = 1;
      loadPointsPage();
    });
  }
  page.querySelector('#pointsSearch')?.addEventListener('submit', event => {
    event.preventDefault(); ui.query.q = page.querySelector('#pointsName').value.trim(); ui.query.current = 1; loadPointsPage();
  });
  page.querySelector('[data-points-clear]')?.addEventListener('click', () => { ui.query.q = ''; ui.query.current = 1; loadPointsPage(); });
  page.querySelector('[data-points-retry]')?.addEventListener('click', () => loadPointsPage());
  page.querySelectorAll('[data-points-page]').forEach(button => button.addEventListener('click', () => { ui.query.current = Number(button.dataset.pointsPage); loadPointsPage(); page.scrollIntoView({ block: 'start', behavior: 'smooth' }); }));
  page.querySelectorAll('[data-points-athlete]').forEach(button => button.addEventListener('click', () => openHomeSearch(button.dataset.pointsAthlete)));
}

async function pointsFetch(path) {
  const response = await fetch(path, { signal: AbortSignal.timeout(30000) });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.message || '官方服务暂不可用，请稍后重试。');
  return result;
}

async function loadPointsPage() {
  const id = ++pointsUi.requestId;
  pointsUi.loading = true; pointsUi.error = ''; drawPointsPage();
  try {
    if (!pointsUi.metadata || Date.now() - Date.parse(pointsUi.metadata.fetchedAt) > 15 * 60 * 1000) {
      const wasLatest = !pointsUi.metadata || pointsUi.query.week === pointsUi.metadata.weeks[0].value;
      const metadata = await pointsFetch('/api/points/meta');
      if (id !== pointsUi.requestId) return;
      pointsUi.metadata = metadata;
      if (wasLatest || !metadata.weeks.some(row => row.value === pointsUi.query.week)) pointsUi.query.week = metadata.weeks[0].value;
      if (!metadata.groups.some(r => r.value === pointsUi.query.groupCode)) pointsUi.query.groupCode = metadata.groups[0].value;
      drawPointsPage();
    }
    const query = { ...pointsUi.query, season: pointsUi.metadata.season };
    const result = await pointsFetch(`/api/points?${new URLSearchParams(query)}`);
    if (id !== pointsUi.requestId) return;
    pointsUi.result = result;
  } catch (error) {
    if (id !== pointsUi.requestId) return;
    pointsUi.error = error.name === 'TimeoutError' ? '请求超时，请稍后重试。' : error.message;
  } finally {
    if (id === pointsUi.requestId) { pointsUi.loading = false; drawPointsPage(); }
  }
}

function renderOfficialPointsPage() {
  drawPointsPage();
  if (!pointsUi.loading && (!pointsUi.result || Date.now() - Date.parse(pointsUi.result.fetchedAt) > 15 * 60 * 1000)) loadPointsPage();
}
