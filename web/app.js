const fileInput = document.querySelector('#fileInput');
const analyzeBtn = document.querySelector('#analyzeBtn');
const clearBtn = document.querySelector('#clearBtn');
const statusEl = document.querySelector('#status');
const sourceUrl = document.querySelector('#sourceUrl');
const sourceMeta = document.querySelector('#sourceMeta');
const candidateArrays = document.querySelector('#candidateArrays');
const rankingPath = document.querySelector('#rankingPath');
const rankingSample = document.querySelector('#rankingSample');
const matchPath = document.querySelector('#matchPath');
const matchSample = document.querySelector('#matchSample');
const frequentKeys = document.querySelector('#frequentKeys');

let selectedFile = null;

function setStatus(text, type = '') {
  statusEl.textContent = text;
  statusEl.className = `status ${type}`.trim();
}

function clearResults() {
  sourceMeta.innerHTML = '';
  candidateArrays.innerHTML = '<span class="empty">暂无数据</span>';
  rankingPath.textContent = '';
  rankingSample.innerHTML = '<span class="empty">暂无排名样本</span>';
  matchPath.textContent = '';
  matchSample.innerHTML = '<span class="empty">暂无对阵样本</span>';
  frequentKeys.innerHTML = '<span class="empty">暂无字段</span>';
}

function renderMeta(source, kind, recordCount, savedTo) {
  const rows = [
    ['文件', source.fileName || '-'],
    ['类型', kind || '-'],
    ['记录数', String(recordCount)],
    ['sportId', source.parsedUrl?.sportId || '-'],
    ['eventCode', source.parsedUrl?.eventCode || '-'],
    ['保存位置', savedTo || '-'],
  ];

  sourceMeta.innerHTML = rows
    .map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`)
    .join('');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderCandidates(records) {
  const items = records.flatMap((record, recordIndex) => {
    return record.analysis.candidateArrays.slice(0, 18).map((item) => ({ ...item, recordIndex }));
  });

  if (!items.length) {
    candidateArrays.innerHTML = '<span class="empty">没有发现数组结构</span>';
    return;
  }

  candidateArrays.innerHTML = items.map((item) => {
    const tags = [
      item.likelyRanking ? '<span class="tag rank">排名候选</span>' : '',
      item.likelyMatch ? '<span class="tag match">对阵候选</span>' : '',
      `<span class="tag">记录 ${item.recordIndex + 1}</span>`,
      `<span class="tag">${item.length} 行</span>`,
    ].join('');

    const keys = item.sampleKeys.slice(0, 10).map((key) => `<span class="chip">${escapeHtml(key)}</span>`).join('');

    return `
      <div class="candidate">
        <strong>${escapeHtml(item.path)}</strong>
        <div class="tags">${tags}</div>
        <div class="chips">${keys}</div>
      </div>
    `;
  }).join('');
}

function tableFromRows(rows) {
  if (!rows || !rows.length) return '<span class="empty">没有识别到样本</span>';

  const keys = [...new Set(rows.flatMap((row) => Object.keys(row || {})))].slice(0, 16);
  const head = keys.map((key) => `<th>${escapeHtml(key)}</th>`).join('');
  const body = rows.slice(0, 30).map((row) => {
    return `<tr>${keys.map((key) => `<td>${escapeHtml(formatCell(row?.[key]))}</td>`).join('')}</tr>`;
  }).join('');

  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function formatCell(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
}

function renderSamples(records) {
  const rankingRecord = records.find((record) => record.extractedSamples.rankingSample.length);
  const matchRecord = records.find((record) => record.extractedSamples.matchSample.length);

  rankingPath.textContent = rankingRecord?.extractedSamples.rankingPath || '未识别到排名数组';
  rankingSample.innerHTML = tableFromRows(rankingRecord?.extractedSamples.rankingSample || []);

  matchPath.textContent = matchRecord?.extractedSamples.matchPath || '未识别到对阵数组';
  matchSample.innerHTML = tableFromRows(matchRecord?.extractedSamples.matchSample || []);
}

function renderFrequentKeys(records) {
  const merged = new Map();
  for (const record of records) {
    for (const item of record.analysis.frequentKeys) {
      merged.set(item.key, (merged.get(item.key) || 0) + item.count);
    }
  }

  const html = [...merged.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .map(([key, count]) => `<span class="chip">${escapeHtml(key)}: ${count}</span>`)
    .join('');

  frequentKeys.innerHTML = html || '<span class="empty">暂无字段</span>';
}

async function analyzeSelectedFile() {
  if (!selectedFile) return;

  try {
    setStatus('解析中');
    const content = await selectedFile.text();
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: selectedFile.name,
        sourceUrl: sourceUrl.value.trim(),
        content,
      }),
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.message || '解析失败');
    }

    renderMeta(result.source, result.kind, result.records.length, result.savedTo);
    renderCandidates(result.records);
    renderSamples(result.records);
    renderFrequentKeys(result.records);
    setStatus('解析完成', 'ok');
  } catch (error) {
    setStatus('解析失败', 'error');
    alert(error.message);
  }
}

fileInput.addEventListener('change', () => {
  selectedFile = fileInput.files?.[0] || null;
  analyzeBtn.disabled = !selectedFile;
  setStatus(selectedFile ? selectedFile.name : '等待上传');
});

analyzeBtn.addEventListener('click', analyzeSelectedFile);

clearBtn.addEventListener('click', () => {
  fileInput.value = '';
  selectedFile = null;
  analyzeBtn.disabled = true;
  sourceUrl.value = '';
  clearResults();
  setStatus('等待上传');
});

clearResults();
