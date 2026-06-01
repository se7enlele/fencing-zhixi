const fileInput = document.querySelector('#fileInput');
const sourceUrl = document.querySelector('#sourceUrl');
const contentInput = document.querySelector('#contentInput');
const previewBtn = document.querySelector('#previewBtn');
const commitBtn = document.querySelector('#commitBtn');
const statusBox = document.querySelector('#statusBox');
const previewBox = document.querySelector('#previewBox');

const token = new URLSearchParams(window.location.search).get('token') || '';
let lastPayload = null;

function setStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.classList.toggle('error', isError);
}

function renderPreview(data) {
  const preview = data.preview;
  const general = preview.general || {};
  const summary = preview.summary || {};
  const cards = [
    ['类型', preview.importType === 'projectlist' ? '项目清单' : '成绩数据'],
    ['项目', general.eventName || '-'],
    ['比赛', general.sportName || '-'],
    ['日期', general.openDate || '-'],
    ['地点', general.venue || '-'],
    ['EventCode', preview.eventCode || '-'],
    ['目标文件', preview.targetFile || '-'],
    ['项目数', summary.itemCount ?? '-'],
    ['报名人次', summary.totalParticipants ?? '-'],
    ['总人数', summary.classmentCount ?? '-'],
    ['小组', summary.poolCount ?? '-'],
    ['小组对阵', summary.poolBoutCount ?? '-'],
    ['淘汰赛', summary.playedEliminationMatchCount ?? '-'],
    ['Bye', summary.byeMatchCount ?? '-'],
    ['状态', data.exists ? '将覆盖现有数据' : '新增数据'],
  ];

  previewBox.innerHTML = `
    ${preview.note ? `<div class="preview-note">${preview.note}</div>` : ''}
    ${cards.map(([label, value]) => `
      <div class="preview-card">
        <strong>${String(value)}</strong>
        <span>${String(label)}</span>
      </div>
    `).join('')}
  `;
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
    setStatus(result.exists ? '解析成功：该数据已存在，确认后会覆盖。' : '解析成功：确认后会写入系统。');
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
    setStatus(`${result.overwritten ? '覆盖' : '新增'}成功：${result.targetFile || result.eventCode}`);
  } catch (error) {
    setStatus(error.message, true);
    commitBtn.disabled = false;
  }
});
