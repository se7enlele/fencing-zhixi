const fileInput = document.querySelector('#fileInput');
const sourceUrl = document.querySelector('#sourceUrl');
const contentInput = document.querySelector('#contentInput');
const previewBtn = document.querySelector('#previewBtn');
const commitBtn = document.querySelector('#commitBtn');
const statusBox = document.querySelector('#statusBox');
const previewBox = document.querySelector('#previewBox');
const analyticsStatus = document.querySelector('#analyticsStatus');
const analyticsSummary = document.querySelector('#analyticsSummary');
const analyticsTrend = document.querySelector('#analyticsTrend');
const analyticsPages = document.querySelector('#analyticsPages');
const feedbackStatus = document.querySelector('#feedbackStatus');
const feedbackList = document.querySelector('#feedbackList');
const pilotLeadSummary = document.querySelector('#pilotLeadSummary');

const token = new URLSearchParams(window.location.search).get('token') || '';
let lastPayload = null;
let feedbackRows = [];

function setStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.classList.toggle('error', isError);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function formatInteger(value) {
  return String(Number(value) || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatDuration(ms) {
  const seconds = Math.round((Number(ms) || 0) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest ? `${minutes}m ${rest}s` : `${minutes}m`;
}

function pageLabel(page) {
  return ({
    roleHome: '角色选择',
    home: '首页',
    parentHome: '家长工作台',
    coachHome: '教练工作台',
    clubHome: '俱乐部工作台',
    competitions: '赛事列表',
    competition: '赛事详情',
    event: '项目详情',
    athlete: '选手详情',
    club: '俱乐部详情',
    prematchReport: '赛前报告',
    parentGrowthReport: '成长报告',
    coachSegmentationReport: '教练分层报告',
    follow: '关注',
    my: '我的',
  })[page] || page || '未知页面';
}

function analyticsActionLabel(action) {
  return ({
    ai_answer: 'AI 回答',
    home_ai_product: '首页数据价值',
    home_report: '首页报告入口',
    open_report: '打开报告',
    share_report: '复制报告',
    share_club: '复制招生名片',
    pilot_interest: '试用意向',
    membership_interest: '会员意向',
    follow_athlete: '关注选手',
    follow_competition: '关注赛事',
  })[action] || action || '未知动作';
}

function analyticsActionDetailLabel(key) {
  const [action, label] = String(key || '').split(':');
  const intentDetail = ['pilot_interest', 'membership_interest'].includes(action) ? ({
    visitor: '访客',
    parent: '家长',
    coach: '教练',
    club: '俱乐部',
    data: '赛事数据',
  })[label] : '';
  if (intentDetail) return `${analyticsActionLabel(action)} · ${intentDetail}`;
  const detail = ({
    prematch: '赛前情报',
    growth: '成长报告',
    coach: '学员分层',
    'club-recruiting': '招生展示',
    'parent-growth': '成长报告',
    'coach-segmentation': '学员分层',
    'prematch-single': '单场赛前',
    'prematch-pack': '赛前情报包',
    'business-insight': '商业洞察',
    'product-template': '报告方案',
    'ai-growth': 'AI 成长分析',
    'ai-prematch': 'AI 赛前分析',
    'ai-club-recruiting': 'AI 招生展示',
    'recruiting-card': '招生名片',
    query: 'AI 入口',
    athlete: '选手',
  })[label] || label || '未分类';
  return `${analyticsActionLabel(action)} · ${detail}`;
}

function mergeMetricRows(days, field) {
  const merged = new Map();
  days.forEach((day) => {
    (day[field] || []).forEach((row) => {
      merged.set(row.key, (merged.get(row.key) || 0) + (Number(row.value) || 0));
    });
  });
  return [...merged.entries()]
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value || a.key.localeCompare(b.key))
    .slice(0, 10);
}

function renderAnalytics(result) {
  if (!analyticsStatus || !analyticsSummary || !analyticsTrend || !analyticsPages) return;
  const days = result.days || [];
  const totals = result.totals || {};
  analyticsStatus.textContent = result.updatedAt
    ? `更新于 ${new Date(result.updatedAt).toLocaleString('zh-CN')}`
    : '暂无数据';
  analyticsSummary.innerHTML = [
    ['PV', totals.pv],
    ['UV', totals.uv],
    ['会话', totals.sessions],
    ['平均停留', formatDuration(totals.avgDurationMs)],
  ].map(([label, value]) => `
    <div class="analytics-card">
      <strong>${escapeHtml(label === '平均停留' ? value : formatInteger(value))}</strong>
      <span>${escapeHtml(label)}</span>
    </div>
  `).join('');

  analyticsTrend.innerHTML = days.length ? `
    <div class="analytics-block-title">最近 ${days.length} 天</div>
    ${days.map((day) => `
      <div class="analytics-day-row">
        <strong>${escapeHtml(day.day)}</strong>
        <span>PV ${escapeHtml(formatInteger(day.pv))}</span>
        <span>UV ${escapeHtml(formatInteger(day.uv))}</span>
        <span>停留 ${escapeHtml(formatDuration(day.avgDurationMs))}</span>
      </div>
    `).join('')}
  ` : '<div class="status muted">暂无访问统计。部署后从新访问开始累计。</div>';

  const pageRows = mergeMetricRows(days, 'pages');
  const durationRows = mergeMetricRows(days, 'durationsByPage');
  const actionRows = mergeMetricRows(days, 'actions');
  const actionLabelRows = mergeMetricRows(days, 'actionLabels');
  analyticsPages.innerHTML = `
    <div>
      <div class="analytics-block-title">页面 PV</div>
      ${pageRows.length ? pageRows.map((row) => `
        <div class="analytics-rank-row">
          <strong>${escapeHtml(pageLabel(row.key))}</strong>
          <span>${escapeHtml(formatInteger(row.value))}</span>
        </div>
      `).join('') : '<div class="status muted">暂无页面访问。</div>'}
    </div>
    <div>
      <div class="analytics-block-title">停留分布</div>
      ${durationRows.length ? durationRows.map((row) => `
        <div class="analytics-rank-row">
          <strong>${escapeHtml(pageLabel(row.key))}</strong>
          <span>${escapeHtml(formatDuration(row.value))}</span>
        </div>
      `).join('') : '<div class="status muted">暂无停留数据。</div>'}
    </div>
    <div>
      <div class="analytics-block-title">关键动作</div>
      ${actionRows.length ? actionRows.map((row) => `
        <div class="analytics-rank-row">
          <strong>${escapeHtml(analyticsActionLabel(row.key))}</strong>
          <span>${escapeHtml(formatInteger(row.value))}</span>
        </div>
      `).join('') : '<div class="status muted">暂无动作数据。</div>'}
    </div>
    <div>
      <div class="analytics-block-title">动作明细</div>
      ${actionLabelRows.length ? actionLabelRows.map((row) => `
        <div class="analytics-rank-row">
          <strong>${escapeHtml(analyticsActionDetailLabel(row.key))}</strong>
          <span>${escapeHtml(formatInteger(row.value))}</span>
        </div>
      `).join('') : '<div class="status muted">暂无动作明细。</div>'}
    </div>
  `;
}

async function loadAnalytics() {
  if (!analyticsStatus || !analyticsSummary) return;
  if (!token) {
    analyticsStatus.textContent = '缺少 token';
    renderAnalytics({ days: [], totals: {} });
    return;
  }
  try {
    analyticsStatus.textContent = '加载中';
    const response = await fetch(`/api/admin/analytics?token=${encodeURIComponent(token)}&days=14`);
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.message || `请求失败：${response.status}`);
    renderAnalytics(result);
  } catch (error) {
    analyticsStatus.textContent = '加载失败';
    analyticsSummary.innerHTML = `<div class="status error">${escapeHtml(error.message)}</div>`;
    analyticsTrend.innerHTML = '';
    analyticsPages.innerHTML = '';
  }
}

function pageCount(summary) {
  const total = Number(summary.pageTotal) || 0;
  const size = Number(summary.pageSize) || 0;
  return total && size ? Math.ceil(total / size) : null;
}

function rosterProgressText(summary, importStats) {
  const current = Number(summary.pageCurrent) || 1;
  const pages = pageCount(summary);
  const pageLabel = pages ? `第 ${current}/${pages} 页` : `第 ${current} 页`;
  const incoming = importStats?.incomingRecords ?? summary.recordCount ?? 0;
  const added = importStats?.newRecords ?? '-';
  const duplicate = importStats?.duplicateRecords ?? '-';
  const cumulative = importStats?.cumulativeRecords ?? '-';
  return `${pageLabel}，本页 ${incoming} 条，预计新增 ${added} 条，重复 ${duplicate} 条，累计 ${cumulative} 条。`;
}

function renderRosterProgress(preview, importStats) {
  if (preview.importType !== 'registration-roster') return '';
  const summary = preview.summary || {};
  const current = Number(summary.pageCurrent) || 1;
  const pages = pageCount(summary);
  const percent = pages ? Math.min(100, Math.round((current / pages) * 100)) : 0;
  const status = pages && current >= pages ? '这已经是预计最后一页。' : '请继续按页导入，直到最后一页确认完成。';
  return `
    <div class="roster-progress">
      <div class="roster-progress-head">
        <strong>报名分页进度</strong>
        <span>${rosterProgressText(summary, importStats)}</span>
      </div>
      ${pages ? `
        <div class="roster-progress-bar" aria-label="报名分页进度">
          <span style="width: ${percent}%"></span>
        </div>
      ` : ''}
      <div class="roster-progress-grid">
        <div><strong>${importStats?.newRecords ?? '-'}</strong><span>本页新增</span></div>
        <div><strong>${importStats?.duplicateRecords ?? '-'}</strong><span>重复跳过</span></div>
        <div><strong>${importStats?.cumulativeRecords ?? '-'}</strong><span>累计报名</span></div>
      </div>
      <p>${status}</p>
    </div>
  `;
}

function renderPreview(data) {
  const preview = data.preview;
  const general = preview.general || {};
  const summary = preview.summary || {};
  const importStats = data.importStats || null;
  const typeLabel = preview.importType === 'projectlist'
    ? '项目清单'
    : preview.importType === 'registration-roster'
      ? '报名名单分页'
      : '成绩数据';
  const cards = [
    ['类型', typeLabel],
    ['项目', general.eventName || '-'],
    ['比赛', general.sportName || '-'],
    ['日期', general.openDate || '-'],
    ['地点', general.venue || '-'],
    ['EventCode', preview.eventCode || '-'],
    ['目标文件', preview.targetFile || '-'],
    ['项目数', summary.itemCount ?? '-'],
    ['报名人次', summary.totalParticipants ?? '-'],
    ['本页记录', summary.recordCount ?? '-'],
    ['当前页', summary.pageCurrent ?? '-'],
    ['报名总数', summary.pageTotal ?? '-'],
    ['选手数', summary.athleteCount ?? '-'],
    ['俱乐部数', summary.clubCount ?? '-'],
    ['预计新增', importStats?.newRecords ?? '-'],
    ['重复跳过', importStats?.duplicateRecords ?? '-'],
    ['累计报名', importStats?.cumulativeRecords ?? '-'],
    ['总人数', summary.classmentCount ?? '-'],
    ['小组', summary.poolCount ?? '-'],
    ['小组对阵', summary.poolBoutCount ?? '-'],
    ['淘汰赛', summary.playedEliminationMatchCount ?? '-'],
    ['Bye', summary.byeMatchCount ?? '-'],
    ['状态', data.exists ? '将覆盖现有数据' : '新增数据'],
  ];

  previewBox.innerHTML = `
    ${preview.note ? `<div class="preview-note">${preview.note}</div>` : ''}
    ${renderRosterProgress(preview, importStats)}
    ${cards.map(([label, value]) => `
      <div class="preview-card">
        <strong>${String(value)}</strong>
        <span>${String(label)}</span>
      </div>
    `).join('')}
  `;
}

function feedbackTypeLabel(type) {
  return ({
    hide: '隐藏申请',
    correct: '纠错申请',
    'ai-helpful': 'AI 有帮助',
    'ai-needs-work': 'AI 需调整',
    'pilot-interest': '试用意向',
    'membership-interest': '会员意向',
  })[type] || '用户反馈';
}

function feedbackStatusLabel(status) {
  return ({
    new: '待处理',
    reviewing: '处理中',
    resolved: '已处理',
    ignored: '已忽略',
  })[status] || '待处理';
}

function feedbackStatusActions(row) {
  const current = row.status || 'new';
  return [
    ['reviewing', '处理中'],
    ['resolved', '已处理'],
    ['ignored', '忽略'],
  ].filter(([status]) => status !== current);
}

function parsePilotLeadMessage(message = '') {
  return Object.fromEntries(String(message).split('；').map((part) => {
    const [label, ...rest] = part.split('：');
    return [label?.trim(), rest.join('：').trim()];
  }).filter(([label]) => label));
}

function renderPilotLeadSummary(rows = []) {
  if (!pilotLeadSummary) return;
  const leads = rows.filter((row) => ['pilot-interest', 'membership-interest'].includes(row.type));
  if (!leads.length) {
    pilotLeadSummary.innerHTML = '<div class="status muted">暂无商业线索。</div>';
    return;
  }
  const openLeads = leads.filter((row) => !['resolved', 'ignored'].includes(row.status || 'new'));
  const roleCounts = leads.reduce((map, row) => {
    const detail = parsePilotLeadMessage(row.message);
    const role = detail['当前角色'] || row.athlete?.type || '未选择';
    map.set(role, (map.get(role) || 0) + 1);
    return map;
  }, new Map());
  const roleText = [...roleCounts.entries()].map(([role, count]) => `${role} ${count}`).join(' / ');
  const latest = [...leads].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);
  pilotLeadSummary.innerHTML = `
    <section class="pilot-lead-card">
      <div class="pilot-lead-head">
        <div>
          <span>商业线索</span>
          <strong>${openLeads.length} 条待跟进</strong>
        </div>
        <div class="pilot-lead-head-actions">
          <em>${escapeHtml(roleText || '角色待确认')}</em>
          <button type="button" data-copy-commercial-leads>复制线索</button>
        </div>
      </div>
      <div class="pilot-lead-list">
        ${latest.map((row) => {
          const detail = parsePilotLeadMessage(row.message);
          return `
            <article>
              <strong>${escapeHtml(feedbackTypeLabel(row.type))} · ${escapeHtml(detail['当前角色'] || row.athlete?.type || '未选择')}</strong>
              <span>${escapeHtml(row.createdAt ? new Date(row.createdAt).toLocaleString('zh-CN') : '-')}</span>
              <p>选手 ${escapeHtml(detail['关注选手'] || '0')} · 赛事 ${escapeHtml(detail['关注赛事'] || '0')} · 报告 ${escapeHtml(detail['最近报告'] || '0')} · AI ${escapeHtml(detail['最近 AI 分析'] || '0')}</p>
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;
  pilotLeadSummary.querySelector('[data-copy-commercial-leads]')?.addEventListener('click', (event) => {
    copyCommercialLeads(event.currentTarget, leads);
  });
}

function commercialLeadCsv(rows = []) {
  const headers = ['类型', '角色', '关注选手', '关注赛事', '最近报告', '最近AI分析', '状态', '时间'];
  const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map((row) => {
    const detail = parsePilotLeadMessage(row.message);
    return [
      feedbackTypeLabel(row.type),
      detail['当前角色'] || row.athlete?.type || '未选择',
      detail['关注选手'] || '0',
      detail['关注赛事'] || '0',
      detail['最近报告'] || '0',
      detail['最近 AI 分析'] || '0',
      feedbackStatusLabel(row.status),
      row.createdAt ? new Date(row.createdAt).toLocaleString('zh-CN') : '',
    ].map(escapeCsv).join(',');
  });
  return [headers.map(escapeCsv).join(','), ...lines].join('\n');
}

async function copyCommercialLeads(button, leads = []) {
  if (!button || !leads.length) return;
  const originalLabel = button.textContent;
  try {
    await navigator.clipboard.writeText(commercialLeadCsv(leads));
    button.textContent = '已复制';
  } catch {
    button.textContent = '复制失败';
  }
  setTimeout(() => {
    button.textContent = originalLabel;
  }, 1600);
}

function renderFeedback(rows = []) {
  if (!feedbackList || !feedbackStatus) return;
  feedbackRows = rows;
  renderPilotLeadSummary(rows);
  feedbackStatus.textContent = rows.length ? `${rows.length} 条` : '暂无反馈';
  feedbackList.innerHTML = rows.length ? rows.map((row) => `
    <article class="feedback-card">
      <div class="feedback-card-head">
        <span>${feedbackTypeLabel(row.type)}</span>
        <strong>${escapeHtml(row.athlete?.name || '-')}</strong>
        <em>${escapeHtml(feedbackStatusLabel(row.status))}</em>
      </div>
      <div class="feedback-meta">
        <span>${escapeHtml(row.athlete?.club || '俱乐部待确认')}</span>
        <span>${escapeHtml(row.createdAt ? new Date(row.createdAt).toLocaleString('zh-CN') : '-')}</span>
      </div>
      <pre>${escapeHtml(row.message || '')}</pre>
      <div class="feedback-actions">
        ${feedbackStatusActions(row).map(([status, label]) => `
          <button type="button" data-feedback-id="${escapeHtml(row.id)}" data-feedback-status="${escapeHtml(status)}">${escapeHtml(label)}</button>
        `).join('')}
      </div>
    </article>
  `).join('') : '<div class="status muted">暂无纠错或隐藏申请。</div>';
  feedbackList.querySelectorAll('[data-feedback-id]').forEach((button) => {
    button.addEventListener('click', () => updateFeedbackStatus(button.dataset.feedbackId, button.dataset.feedbackStatus));
  });
}

async function loadFeedback() {
  if (!feedbackList || !feedbackStatus) return;
  if (!token) {
    feedbackStatus.textContent = '缺少 token';
    renderFeedback([]);
    return;
  }
  try {
    feedbackStatus.textContent = '加载中';
    const response = await fetch(`/api/admin/feedback?token=${encodeURIComponent(token)}`);
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.message || `请求失败：${response.status}`);
    renderFeedback(result.feedback || []);
  } catch (error) {
    feedbackStatus.textContent = '加载失败';
    feedbackList.innerHTML = `<div class="status error">${error.message}</div>`;
  }
}

async function updateFeedbackStatus(id, status) {
  if (!id || !status) return;
  const button = feedbackList?.querySelector(`[data-feedback-id="${CSS.escape(id)}"][data-feedback-status="${CSS.escape(status)}"]`);
  const originalLabel = button?.textContent || '';
  try {
    if (button) {
      button.disabled = true;
      button.textContent = '保存中';
    }
    const response = await fetch(`/api/admin/feedback/status?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.message || `请求失败：${response.status}`);
    feedbackRows = feedbackRows.map((row) => (row.id === id ? result.feedback : row));
    renderFeedback(feedbackRows);
  } catch (error) {
    if (button) {
      button.disabled = false;
      button.textContent = originalLabel;
    }
    feedbackStatus.textContent = `保存失败：${error.message}`;
  }
}

async function readSelectedFile() {
  const file = fileInput.files?.[0];
  if (!file) return;
  contentInput.value = await file.text();
  if (!sourceUrl.value) sourceUrl.value = file.name;
}

async function postJson(path) {
  const content = contentInput.value.trim();
  if (!token) throw new Error('缺少 token，请使用 /admin/import?token=...');
  if (!content) throw new Error('请先上传或粘贴数据。');
  const response = await fetch(`${path}?token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: fileInput.files?.[0]?.name || null,
      sourceUrl: sourceUrl.value.trim(),
      content,
    }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.message || `请求失败：${response.status}`);
  return result;
}

fileInput.addEventListener('change', () => {
  readSelectedFile().catch((error) => setStatus(error.message, true));
});

previewBtn.addEventListener('click', async () => {
  try {
    commitBtn.disabled = true;
    setStatus('正在解析...');
    const result = await postJson('/api/admin/import/preview');
    lastPayload = result.preview;
    renderPreview(result);
    commitBtn.disabled = false;
    if (result.preview.importType === 'registration-roster') {
      setStatus(`解析成功：${rosterProgressText(result.preview.summary || {}, result.importStats || null)}`);
    } else {
      setStatus(result.exists ? '解析成功：该数据已存在，确认后会覆盖。' : '解析成功：确认后会写入系统。');
    }
  } catch (error) {
    lastPayload = null;
    commitBtn.disabled = true;
    setStatus(error.message, true);
  }
});

commitBtn.addEventListener('click', async () => {
  if (!lastPayload) return;
  if (!window.confirm('确认写入数据并刷新前台数据？')) return;
  try {
    commitBtn.disabled = true;
    setStatus('正在写入...');
    const result = await postJson('/api/admin/import/commit');
    if (result.importStats) {
      setStatus(`报名名单分页已入库：${rosterProgressText(result.summary || {}, result.importStats)}`);
    } else {
      setStatus(`${result.overwritten ? '覆盖' : '新增'}成功：${result.targetFile || result.eventCode}`);
    }
  } catch (error) {
    setStatus(error.message, true);
    commitBtn.disabled = false;
  }
});

loadAnalytics();
loadFeedback();
