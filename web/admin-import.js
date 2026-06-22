const fileInput = document.querySelector('#fileInput');
const sourceUrl = document.querySelector('#sourceUrl');
const contentInput = document.querySelector('#contentInput');
const previewBtn = document.querySelector('#previewBtn');
const commitBtn = document.querySelector('#commitBtn');
const statusBox = document.querySelector('#statusBox');
const previewBox = document.querySelector('#previewBox');
const feedbackStatus = document.querySelector('#feedbackStatus');
const feedbackList = document.querySelector('#feedbackList');

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

function renderFeedback(rows = []) {
  if (!feedbackList || !feedbackStatus) return;
  feedbackRows = rows;
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

loadFeedback();
