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
const dataHealthStatus = document.querySelector('#dataHealthStatus');
const dataHealthSummary = document.querySelector('#dataHealthSummary');
const dataHealthGaps = document.querySelector('#dataHealthGaps');
const feedbackStatus = document.querySelector('#feedbackStatus');
const feedbackList = document.querySelector('#feedbackList');
const pilotLeadSummary = document.querySelector('#pilotLeadSummary');
const feedbackFilterBar = document.querySelector('#feedbackFilterBar');

const token = new URLSearchParams(window.location.search).get('token') || '';
let lastPayload = null;
let feedbackRows = [];
let activeFeedbackFilter = 'all';

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

function formatDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('zh-CN');
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

function commercialSourceLabel(source) {
  const key = String(source || '').trim();
  return ({
    visitor: '访客',
    parent: '家长',
    coach: '教练',
    club: '俱乐部',
    data: '赛事数据',
    'home-pilot': '首页试用合作',
    'focus-workspace': '关注提醒服务',
    'my-membership': '我的页会员权益',
    'my-next-action': '我的页下一步',
    'member-panel': '会员横幅',
    'parent-growth-report': '成长报告',
    'prematch-single-report': '单场赛前情报',
    'prematch-pack-report': '赛前情报包',
    'coach-segmentation-report': '教练分层报告',
    'ai-prematch': 'AI 赛前分析',
    'ai-growth': 'AI 成长分析',
    'ai-coach': 'AI 教练分析',
    'ai-comparison': 'AI 选手对比',
    'ai-business': 'AI 商业洞察',
  })[key] || key;
}

function analyticsActionDetailLabel(key) {
  const [action, label] = String(key || '').split(':');
  const intentDetail = ['pilot_interest', 'membership_interest'].includes(action) ? commercialSourceLabel(label) : '';
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
    'ai-club': 'AI 俱乐部分析',
    'ai-business-insight': 'AI 商业洞察',
    'ai-product-template': 'AI 报告方案',
    'ai-comparison': 'AI 选手对比',
    'ai-competition-stats': 'AI 赛事统计',
    'ai-club-recruiting': 'AI 招生展示',
    'ai-report': 'AI报告',
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

function analyticsMetricValue(rows = [], key) {
  const row = rows.find((item) => item.key === key);
  return Number(row?.value) || 0;
}

function analyticsConversionRate(current, previous) {
  if (!previous) return '-';
  return `${Math.round((Number(current) || 0) / previous * 100)}%`;
}

function analyticsFunnelRows(actionRows = []) {
  const aiAnswers = analyticsMetricValue(actionRows, 'ai_answer');
  const openedReports = analyticsMetricValue(actionRows, 'open_report');
  const sharedReports = analyticsMetricValue(actionRows, 'share_report') + analyticsMetricValue(actionRows, 'share_club');
  const commercialLeads = analyticsMetricValue(actionRows, 'pilot_interest') + analyticsMetricValue(actionRows, 'membership_interest');
  return [
    { label: 'AI 回答', value: aiAnswers, rate: '-' },
    { label: '打开报告', value: openedReports, rate: analyticsConversionRate(openedReports, aiAnswers) },
    { label: '复制/分享', value: sharedReports, rate: analyticsConversionRate(sharedReports, openedReports || aiAnswers) },
    { label: '试用/会员意向', value: commercialLeads, rate: analyticsConversionRate(commercialLeads, openedReports || aiAnswers) },
  ];
}

function analyticsConversionInsight(funnelRows = []) {
  const byLabel = Object.fromEntries(funnelRows.map((row) => [row.label, Number(row.value) || 0]));
  if (!byLabel['AI 回答']) return '先观察 AI 问答入口是否产生使用量，再判断报告和试用转化。';
  if (!byLabel['打开报告']) return 'AI 问答已有使用，下一步优化回答里的报告入口，让用户进入成长、赛前或教练报告。';
  if (!byLabel['复制/分享']) return '报告已有打开，下一步优化报告结论和分享文案，促成家长或教练愿意转发。';
  if (!byLabel['试用/会员意向']) return '报告已有分享，下一步强化试用按钮和权益说明，把高意向访问转成可跟进线索。';
  return '漏斗已有完整转化，下一步按报告类型复盘线索质量，优先投入高转化的报告场景。';
}

function analyticsReportTypeRows(actionLabelRows = []) {
  const rowsByLabel = new Map();
  actionLabelRows.forEach((row) => {
    const [action, label = 'unknown'] = String(row.key || '').split(':');
    if (!['open_report', 'share_report'].includes(action)) return;
    const readable = analyticsActionDetailLabel(`${action}:${label}`).replace(/^打开报告 · |^复制报告 · /, '');
    const current = rowsByLabel.get(readable) || { label: readable, opens: 0, shares: 0 };
    if (action === 'open_report') current.opens += Number(row.value) || 0;
    if (action === 'share_report') current.shares += Number(row.value) || 0;
    rowsByLabel.set(readable, current);
  });
  return [...rowsByLabel.values()]
    .map((row) => ({
      ...row,
      total: row.opens + row.shares,
      shareRate: analyticsConversionRate(row.shares, row.opens),
    }))
    .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, 'zh-CN'))
    .slice(0, 6);
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
  const funnelRows = analyticsFunnelRows(actionRows);
  const funnelInsight = analyticsConversionInsight(funnelRows);
  const reportRows = analyticsReportTypeRows(actionLabelRows);
  analyticsPages.innerHTML = `
    <div class="analytics-funnel">
      <div class="analytics-block-title">商业转化漏斗</div>
      <div class="analytics-funnel-grid">
        ${funnelRows.map((row) => `
          <div class="analytics-funnel-step">
            <strong>${escapeHtml(formatInteger(row.value))}</strong>
            <span>${escapeHtml(row.label)}</span>
            <em>${escapeHtml(row.rate === '-' ? '起点' : `转化 ${row.rate}`)}</em>
          </div>
        `).join('')}
      </div>
      <div class="analytics-insight">${escapeHtml(funnelInsight)}</div>
    </div>
    <div class="analytics-report-types">
      <div class="analytics-block-title">报告热度</div>
      ${reportRows.length ? reportRows.map((row) => `
        <div class="analytics-report-row">
          <strong>${escapeHtml(row.label)}</strong>
          <span>打开 ${escapeHtml(formatInteger(row.opens))}</span>
          <span>复制 ${escapeHtml(formatInteger(row.shares))}</span>
          <em>${escapeHtml(row.shareRate === '-' ? '待观察' : `复制率 ${row.shareRate}`)}</em>
        </div>
      `).join('') : '<div class="status muted">暂无报告打开或复制数据。</div>'}
    </div>
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

function dataHealthCounts(competitions = []) {
  return competitions.reduce((counts, competition) => {
    const level = competition.coverageLevel || (competition.itemCount || competition.itemSummaries?.length ? 'project' : 'directory');
    counts.total += 1;
    if (level === 'score') counts.score += 1;
    else if (level === 'roster') counts.roster += 1;
    else if (level === 'project') counts.project += 1;
    else counts.directory += 1;
    if (['registration', 'upcoming', 'live'].includes(competition.status)) counts.active += 1;
    return counts;
  }, { total: 0, score: 0, roster: 0, project: 0, directory: 0, active: 0 });
}

function dataHealthGapRows(competitions = []) {
  return competitions
    .filter((competition) => (competition.coverageLevel || 'directory') !== 'score')
    .sort((a, b) => {
      const activeScore = (row) => ['registration', 'upcoming', 'live'].includes(row.status) ? 0 : 1;
      return activeScore(a) - activeScore(b)
        || new Date(b.startDate || b.dateLabel || 0) - new Date(a.startDate || a.dateLabel || 0);
    })
    .slice(0, 6);
}

function dataHealthLevelLabel(level) {
  return ({
    score: '成绩已覆盖',
    roster: '报名名单',
    project: '项目列表',
    directory: '赛事目录',
  })[level] || level || '赛事目录';
}

function dataHealthSyncAction(sync) {
  const failures = sync?.failures || [];
  const summary = sync?.summary || {};
  if (!sync?.generatedAt) return {
    title: '同步状态待确认',
    detail: '尚未读取到最近同步结果，先确认 GitHub Actions 或定时任务是否已运行。',
    level: 'warning',
  };
  if (failures.length || Number(summary.failedCount || 0) > 0) return {
    title: `同步失败 ${formatInteger(failures.length || summary.failedCount)} 项`,
    detail: '优先查看失败任务，确认接口、分页或数据格式是否变化，再重新触发同步。',
    level: 'danger',
  };
  return {
    title: `同步正常，成功 ${formatInteger(summary.successCount || 0)} / ${formatInteger(summary.taskCount || 0)}`,
    detail: '继续关注近期赛事报名名单和历史成绩回补，保持赛前情报与成长报告可用。',
    level: 'ok',
  };
}

function dataHealthFailureRows(sync) {
  const failures = Array.isArray(sync?.failures) ? sync.failures : [];
  return failures.slice(0, 5).map((failure) => {
    const name = failure.sportName || failure.eventCode || failure.sportCode || failure.sportId || '同步任务';
    const meta = [failure.type, failure.eventCode || failure.sportCode || failure.sportId].filter(Boolean).join(' · ');
    return {
      name,
      meta: meta || '任务信息待确认',
      message: failure.message || '未返回失败原因',
    };
  });
}

function renderDataHealth(result = {}) {
  if (!dataHealthStatus || !dataHealthSummary || !dataHealthGaps) return;
  const competitions = result.competitions || [];
  const counts = dataHealthCounts(competitions);
  const coveragePercent = counts.total ? Math.round((counts.score / counts.total) * 100) : 0;
  dataHealthStatus.textContent = result.generatedAt ? `更新于 ${formatDateTime(result.generatedAt)}` : '暂无数据';
  dataHealthSummary.innerHTML = [
    ['赛事总量', counts.total],
    ['可深度分析', counts.score],
    ['赛前可用', counts.project + counts.roster],
    ['近期赛事', counts.active],
  ].map(([label, value]) => `
    <div class="analytics-card">
      <strong>${escapeHtml(formatInteger(value))}</strong>
      <span>${escapeHtml(label)}</span>
    </div>
  `).join('');

  const sync = result.dataCoverage?.scheduledSync;
  const syncText = sync?.generatedAt
    ? `最近同步：${formatDateTime(sync.generatedAt)}，成功 ${formatInteger(sync.summary?.successCount || 0)} / ${formatInteger(sync.summary?.taskCount || 0)}`
    : '尚未读取到同步状态。';
  const syncAction = dataHealthSyncAction(sync);
  const failureRows = dataHealthFailureRows(sync);
  const gaps = dataHealthGapRows(competitions);
  dataHealthGaps.innerHTML = `
    <div class="data-health-note">
      <strong>成绩覆盖率 ${escapeHtml(coveragePercent)}%</strong>
      <span>${escapeHtml(syncText)}</span>
    </div>
    <div class="data-health-action ${escapeHtml(syncAction.level)}">
      <strong>${escapeHtml(syncAction.title)}</strong>
      <span>${escapeHtml(syncAction.detail)}</span>
    </div>
    ${failureRows.length ? `
      <div class="analytics-block-title">同步失败任务</div>
      <div class="data-health-failures">
        ${failureRows.map((failure) => `
          <div>
            <strong>${escapeHtml(failure.name)}</strong>
            <span>${escapeHtml(failure.meta)}</span>
            <em>${escapeHtml(failure.message)}</em>
          </div>
        `).join('')}
      </div>
    ` : ''}
    <div class="analytics-block-title">优先补齐</div>
    ${gaps.length ? gaps.map((competition) => `
      <div class="analytics-rank-row">
        <strong>${escapeHtml(competition.sportName || competition.name || '-')}</strong>
        <span>${escapeHtml(dataHealthLevelLabel(competition.coverageLevel || 'directory'))}</span>
      </div>
    `).join('') : '<div class="status muted">暂无明显数据缺口。</div>'}
  `;
}

async function loadDataHealth() {
  if (!dataHealthStatus || !dataHealthSummary || !dataHealthGaps) return;
  try {
    dataHealthStatus.textContent = '加载中';
    const response = await fetch('/api/events');
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.message || `请求失败：${response.status}`);
    renderDataHealth(result);
  } catch (error) {
    dataHealthStatus.textContent = '加载失败';
    dataHealthSummary.innerHTML = '';
    dataHealthGaps.innerHTML = `<div class="status error">${escapeHtml(error.message)}</div>`;
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

function commercialLeadDetail(row = {}) {
  const detail = parsePilotLeadMessage(row.message);
  const rawSource = detail['来源页面'] || row.athlete?.id || '';
  return {
    role: detail['当前角色'] || row.athlete?.type || '未选择',
    rawSource,
    source: commercialSourceLabel(rawSource),
    report: detail['触发报告'] || row.athlete?.name || '',
    contact: detail['联系方式'] || '',
    athletes: detail['关注选手'] || '0',
    competitions: detail['关注赛事'] || '0',
    reports: detail['最近报告'] || '0',
    ai: detail['最近 AI 分析'] || '0',
  };
}

function aiFeedbackDetail(row = {}) {
  const detail = parsePilotLeadMessage(row.message);
  return {
    type: detail['类型'] || row.athlete?.club || 'AI 回答',
    title: detail['标题'] || row.athlete?.name || 'FencingAI 回答',
    query: detail['原始问题'] || row.athlete?.query || '',
    service: detail['关联服务'] || '',
    source: detail['转化来源'] || '',
  };
}

function aiFeedbackQualityRows(rows = []) {
  const aiRows = rows.filter(isAiFeedback);
  const grouped = aiRows.reduce((map, row) => {
    const detail = aiFeedbackDetail(row);
    const key = detail.type || 'AI 回答';
    const current = map.get(key) || { label: key, helpful: 0, needsWork: 0, total: 0, latest: '' };
    current.total += 1;
    if (row.type === 'ai-helpful') current.helpful += 1;
    if (row.type === 'ai-needs-work') current.needsWork += 1;
    if (!current.latest || new Date(row.createdAt || 0) > new Date(current.latest || 0)) current.latest = row.createdAt || '';
    map.set(key, current);
    return map;
  }, new Map());
  return [...grouped.values()]
    .map((row) => ({
      ...row,
      needsWorkRate: row.total ? Math.round((row.needsWork / row.total) * 100) : 0,
      nextStep: row.needsWork
        ? '优先复盘需要调整的问题，补充证据、入口动作和用户可执行建议。'
        : '继续观察正向反馈，保留当前回答结构并扩大样本。',
    }))
    .sort((a, b) => (b.needsWorkRate - a.needsWorkRate) || (b.needsWork - a.needsWork) || (b.total - a.total))
    .slice(0, 4);
}

function commercialLeadReportLabel(row = {}) {
  const detail = commercialLeadDetail(row);
  const source = `${detail.rawSource || ''} ${detail.report || ''}`.toLowerCase();
  if (/prematch/.test(source)) return '赛前情报';
  if (/growth|parent/.test(source)) return '成长报告';
  if (/coach|club|recruiting/.test(source)) return '教练/剑馆';
  if (/membership/.test(source) || row.type === 'membership-interest') return '会员权益';
  if (/business|template|product/.test(source)) return '商业方案';
  return '试用合作';
}

function commercialLeadProductFocusRows(openLeads = []) {
  const rowsByLabel = openLeads.reduce((map, row) => {
    const label = commercialLeadReportLabel(row);
    const current = map.get(label) || { label, leads: 0, hot: 0, score: 0 };
    const priority = commercialLeadPriority(row);
    current.leads += 1;
    current.score += priority.score || 0;
    if (priority.level === 'high') current.hot += 1;
    map.set(label, current);
    return map;
  }, new Map());
  const nextStepByLabel = {
    赛前情报: '优先验证赛前情报包，围绕近期赛事和关注选手做连续提醒。',
    成长报告: '优先验证家庭成长报告，围绕阶段进步和训练投入做长期复盘。',
    '教练/剑馆': '优先验证教练工作台，围绕学员分层、续费沟通和招生展示推进。',
    会员权益: '优先确认会员权益，重点验证报告保存、提醒和复访需求。',
    商业方案: '优先复盘产品方案问题，判断哪个报告场景最容易形成付费。',
    试用合作: '先确认用户角色和关注对象，再匹配家庭、教练或赛前试用路径。',
  };
  return [...rowsByLabel.values()]
    .sort((a, b) => (b.hot - a.hot) || (b.leads - a.leads) || (b.score - a.score))
    .slice(0, 3)
    .map((row) => ({
      ...row,
      nextStep: nextStepByLabel[row.label] || '确认使用场景，再匹配对应的报告试用。',
    }));
}

function commercialLeadPriority(row = {}) {
  if (!isCommercialLead(row)) return { label: '普通', level: 'normal', score: 0 };
  const detail = commercialLeadDetail(row);
  const source = `${detail.rawSource || detail.source} ${detail.report}`.toLowerCase();
  let score = row.type === 'pilot-interest' ? 2 : 1;
  if (/prematch|growth|coach|club|template|report/.test(source)) score += 2;
  if (Number(detail.athletes) || Number(detail.competitions)) score += 1;
  if (Number(detail.reports) || Number(detail.ai)) score += 1;
  if (score >= 5) return { label: '高优先级', level: 'high', score };
  if (score >= 3) return { label: '中优先级', level: 'medium', score };
  return { label: '常规跟进', level: 'normal', score };
}

function commercialLeadNextStep(row = {}) {
  const detail = commercialLeadDetail(row);
  const source = `${detail.rawSource || ''} ${detail.report || ''}`.toLowerCase();
  if (/prematch/.test(source)) return '确认近期赛事和关注选手，推荐赛前情报试用。';
  if (/growth|parent/.test(source)) return '确认孩子姓名和目标周期，推荐成长报告试用。';
  if (/coach|club|recruiting/.test(source)) return '确认俱乐部和学员规模，推荐教练工作台试用。';
  if (row.type === 'membership-interest') return '确认关注选手、赛事提醒和报告保存需求。';
  return '确认用户角色、关注对象和下一场比赛。';
}

function commercialLeadFollowupScript(row = {}) {
  const detail = commercialLeadDetail(row);
  const source = `${detail.rawSource || ''} ${detail.report || ''}`.toLowerCase();
  const role = detail.role || '您';
  if (/prematch/.test(source)) return `${role}您好，可以先确认本次重点赛事和关注选手，我这边给您开通赛前情报试用，重点看报名名单、强手线索和提醒。`;
  if (/growth|parent/.test(source)) return `${role}您好，可以先确认孩子姓名和最近参赛目标，我这边给您开通成长报告试用，重点看阶段进步、短板和下一步训练建议。`;
  if (/coach|club|recruiting/.test(source)) return `${role}您好，可以先确认俱乐部和主要学员组别，我这边给您开通教练工作台试用，重点看学员分层、续费沟通和招生展示。`;
  if (row.type === 'membership-interest') return `${role}您好，可以先确认您最需要保存的是成长报告、赛前提醒还是俱乐部分析，我这边按使用场景说明会员权益。`;
  return `${role}您好，可以先确认关注对象和下一场比赛，我这边按家庭、教练或赛前场景帮您匹配试用服务。`;
}

function renderPilotLeadSummary(rows = []) {
  if (!pilotLeadSummary) return;
  const leads = rows.filter((row) => ['pilot-interest', 'membership-interest'].includes(row.type));
  if (!leads.length) {
    pilotLeadSummary.innerHTML = '<div class="status muted">暂无商业线索。</div>';
    return;
  }
  const openLeads = leads.filter((row) => !['resolved', 'ignored'].includes(row.status || 'new'));
  const hotLeads = openLeads.filter((row) => commercialLeadPriority(row).level === 'high');
  const newLeads = leads.filter((row) => (row.status || 'new') === 'new');
  const reviewingLeads = leads.filter((row) => row.status === 'reviewing');
  const roleCounts = leads.reduce((map, row) => {
    const detail = commercialLeadDetail(row);
    const role = detail.role;
    map.set(role, (map.get(role) || 0) + 1);
    return map;
  }, new Map());
  const roleText = [...roleCounts.entries()].map(([role, count]) => `${role} ${count}`).join(' / ');
  const reportCounts = openLeads.reduce((map, row) => {
    const label = commercialLeadReportLabel(row);
    map.set(label, (map.get(label) || 0) + 1);
    return map;
  }, new Map());
  const reportRows = [...reportCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const productFocusRows = commercialLeadProductFocusRows(openLeads);
  const latest = [...leads].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);
  pilotLeadSummary.innerHTML = `
    <section class="pilot-lead-card">
      <div class="pilot-lead-head">
        <div>
          <span>商业线索</span>
          <strong>${openLeads.length} 条待跟进</strong>
          <em>${hotLeads.length} 条高优先级 · ${newLeads.length} 条新线索 · ${reviewingLeads.length} 条处理中</em>
        </div>
        <div class="pilot-lead-head-actions">
          <em>${escapeHtml(roleText || '角色待确认')}</em>
          <button type="button" data-copy-commercial-leads>复制待跟进</button>
        </div>
      </div>
      ${reportRows.length ? `
        <div class="pilot-lead-report-mix">
          ${reportRows.map(([label, count]) => `
            <div>
              <strong>${escapeHtml(count)}</strong>
              <span>${escapeHtml(label)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${productFocusRows.length ? `
        <div class="pilot-lead-product-focus">
          <div class="analytics-block-title">优先验证方向</div>
          ${productFocusRows.map((row) => `
            <article>
              <strong>${escapeHtml(row.label)}</strong>
              <span>${escapeHtml(row.leads)} 条线索 · ${escapeHtml(row.hot)} 条高优先级</span>
              <em>${escapeHtml(row.nextStep)}</em>
            </article>
          `).join('')}
        </div>
      ` : ''}
      <div class="pilot-lead-list">
        ${latest.map((row) => {
          const detail = commercialLeadDetail(row);
          const priority = commercialLeadPriority(row);
          const nextStep = commercialLeadNextStep(row);
          return `
            <article>
              <strong>${escapeHtml(feedbackTypeLabel(row.type))} · ${escapeHtml(detail.role)}</strong>
              <em class="lead-priority ${escapeHtml(priority.level)}">${escapeHtml(priority.label)}</em>
              <span>${escapeHtml(row.createdAt ? new Date(row.createdAt).toLocaleString('zh-CN') : '-')}</span>
              <p>${escapeHtml(detail.report || '未标记报告')} · ${escapeHtml(detail.source || '来源待确认')}</p>
              ${detail.contact ? `<p class="lead-contact">联系方式：${escapeHtml(detail.contact)}</p>` : ''}
              <p>选手 ${escapeHtml(detail.athletes)} · 赛事 ${escapeHtml(detail.competitions)} · 报告 ${escapeHtml(detail.reports)} · AI ${escapeHtml(detail.ai)}</p>
              <p class="lead-next-step">下一步：${escapeHtml(nextStep)}</p>
              <p class="lead-followup-script">跟进话术：${escapeHtml(commercialLeadFollowupScript(row))}</p>
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;
  pilotLeadSummary.querySelector('[data-copy-commercial-leads]')?.addEventListener('click', (event) => {
    copyCommercialLeads(event.currentTarget, openLeads);
  });
}

function commercialLeadCsv(rows = []) {
  const headers = ['类型', '优先级', '产品形态', '角色', '联系方式', '来源页面', '触发报告', '关注选手', '关注赛事', '最近报告', '最近AI分析', '建议下一步', '跟进话术', '状态', '时间'];
  const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map((row) => {
    const detail = commercialLeadDetail(row);
    const priority = commercialLeadPriority(row);
    return [
      feedbackTypeLabel(row.type),
      priority.label,
      commercialLeadReportLabel(row),
      detail.role,
      detail.contact,
      detail.source,
      detail.report,
      detail.athletes,
      detail.competitions,
      detail.reports,
      detail.ai,
      commercialLeadNextStep(row),
      commercialLeadFollowupScript(row),
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

function isCommercialLead(row) {
  return ['pilot-interest', 'membership-interest'].includes(row.type);
}

function isAiFeedback(row) {
  return String(row.type || '').startsWith('ai-');
}

function isOpenFeedback(row) {
  return !['resolved', 'ignored'].includes(row.status || 'new');
}

function feedbackFilterOptions(rows = []) {
  const count = (filter) => rows.filter((row) => feedbackFilterMatches(row, filter)).length;
  return [
    ['all', '全部', rows.length],
    ['open', '待跟进', count('open')],
    ['new', '新提交', count('new')],
    ['reviewing', '处理中', count('reviewing')],
    ['hot-commercial', '高优先级', count('hot-commercial')],
    ['commercial', '商业线索', count('commercial')],
    ['ai', 'AI反馈', count('ai')],
  ];
}

function feedbackFilterMatches(row, filter = activeFeedbackFilter) {
  if (filter === 'open') return isOpenFeedback(row);
  if (filter === 'new') return (row.status || 'new') === 'new';
  if (filter === 'reviewing') return row.status === 'reviewing';
  if (filter === 'hot-commercial') return isCommercialLead(row) && isOpenFeedback(row) && commercialLeadPriority(row).level === 'high';
  if (filter === 'commercial') return isCommercialLead(row);
  if (filter === 'ai') return isAiFeedback(row);
  return true;
}

function renderFeedbackFilterBar(rows = []) {
  if (!feedbackFilterBar) return;
  feedbackFilterBar.innerHTML = feedbackFilterOptions(rows).map(([filter, label, count]) => `
    <button type="button" class="${filter === activeFeedbackFilter ? 'active' : ''}" data-feedback-filter="${escapeHtml(filter)}">
      ${escapeHtml(label)} <span>${escapeHtml(count)}</span>
    </button>
  `).join('');
  feedbackFilterBar.querySelectorAll('[data-feedback-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      activeFeedbackFilter = button.dataset.feedbackFilter || 'all';
      renderFeedback(feedbackRows);
    });
  });
}

function renderFeedback(rows = []) {
  if (!feedbackList || !feedbackStatus) return;
  feedbackRows = rows;
  renderPilotLeadSummary(rows);
  renderFeedbackFilterBar(rows);
  const visibleRows = rows.filter((row) => feedbackFilterMatches(row));
  const aiQualityRows = aiFeedbackQualityRows(rows);
  const aiQualityHtml = aiQualityRows.length ? `
    <section class="ai-quality-summary">
      <div class="analytics-block-title">AI 回答质量</div>
      ${aiQualityRows.map((row) => `
        <article>
          <strong>${escapeHtml(row.label)}</strong>
          <span>${escapeHtml(row.helpful)} 有帮助 · ${escapeHtml(row.needsWork)} 需调整 · ${escapeHtml(row.needsWorkRate)}%</span>
          <em>${escapeHtml(row.nextStep)}</em>
        </article>
      `).join('')}
    </section>
  ` : '';
  feedbackStatus.textContent = rows.length ? `${visibleRows.length} / ${rows.length} 条` : '暂无反馈';
  const feedbackRowsHtml = visibleRows.length ? visibleRows.map((row) => {
    const leadDetail = isCommercialLead(row) ? commercialLeadDetail(row) : null;
    const leadPriority = isCommercialLead(row) ? commercialLeadPriority(row) : null;
    const aiDetail = isAiFeedback(row) ? aiFeedbackDetail(row) : null;
    return `
    <article class="feedback-card">
      <div class="feedback-card-head">
        <span>${feedbackTypeLabel(row.type)}</span>
        <strong>${escapeHtml(row.athlete?.name || '-')}</strong>
        <em>${escapeHtml(feedbackStatusLabel(row.status))}</em>
      </div>
      ${leadDetail ? `
        <div class="feedback-commercial-meta">
          <span class="lead-priority ${escapeHtml(leadPriority.level)}">${escapeHtml(leadPriority.label)}</span>
          <span class="lead-segment">${escapeHtml(commercialLeadReportLabel(row))}</span>
          <strong>${escapeHtml(leadDetail.report || '未标记报告')}</strong>
          <em>${escapeHtml(leadDetail.source || '来源待确认')}</em>
          <p>下一步：${escapeHtml(commercialLeadNextStep(row))}</p>
        </div>
      ` : ''}
      ${aiDetail ? `
        <div class="feedback-ai-meta">
          <strong>${escapeHtml(aiDetail.title)}</strong>
          <span>${escapeHtml(aiDetail.query || '问题未记录')}</span>
          <em>${escapeHtml([aiDetail.type, aiDetail.service, aiDetail.source].filter(Boolean).join(' · ') || 'AI 回答')}</em>
        </div>
      ` : ''}
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
  `;
  }).join('') : '<div class="status muted">当前筛选下暂无反馈。</div>';
  feedbackList.innerHTML = `${aiQualityHtml}${feedbackRowsHtml}`;
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
loadDataHealth();
loadFeedback();
