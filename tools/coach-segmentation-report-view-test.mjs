import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../web/viewer.html', import.meta.url), 'utf8');
const indexHtml = await readFile(new URL('../web/index.html', import.meta.url), 'utf8');
const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');

assert.equal(indexHtml, html, 'static index.html must stay in sync with viewer.html');
assert.match(html, /id="view-coach-segmentation-report"/, 'coach segmentation report must have a standalone view');
assert.match(html, /id="coachSegmentationReportHero"/, 'coach segmentation report must expose a hero');
assert.match(html, /id="coachSegmentationReportBody"/, 'coach segmentation report must expose a body');

assert.match(js, /coachSegmentationReportHero = document\.querySelector\('#coachSegmentationReportHero'\)/, 'coach segmentation hero selector must be wired');
assert.match(js, /coachSegmentationReportBody = document\.querySelector\('#coachSegmentationReportBody'\)/, 'coach segmentation body selector must be wired');
assert.match(js, /coachSegmentationReport: document\.querySelector\('#view-coach-segmentation-report'\)/, 'coach segmentation view must be registered');
assert.match(js, /currentClub: null/, 'current club detail must be cached for report generation');
assert.match(js, /state\.currentClub = renderedClub/, 'openClub must keep the loaded detail for reports');

assert.match(js, /function coachSegmentationBuckets\(athletes\)/, 'coach segmentation must classify athletes into buckets');
assert.match(js, /title: '冲成绩学员'/, 'segmentation must include score-focused athletes');
assert.match(js, /title: '稳定成长学员'/, 'segmentation must include steady-growth athletes');
assert.match(js, /title: '需要关注学员'/, 'segmentation must include risk/follow-up athletes');
assert.match(js, /title: '样本积累学员'/, 'segmentation must include sample-building athletes');
assert.match(js, /function coachSegmentationEvidenceRows\(club, projectRows\)/, 'segmentation report must expose traceable project evidence');
assert.match(js, /function coachBusinessGrowthRows\(club, projectRows, buckets\)/, 'coach report must derive recruiting and reputation assets');
assert.match(js, /function buildCoachSegmentationShareText\(club, buckets, followups, projectRows, businessRows = \[\]\)/, 'segmentation report must build shareable summary text');
assert.match(js, /function renderCoachSegmentationReport\(clubId = ''\)/, 'segmentation report must render from a club id');
assert.match(js, /function openCoachSegmentationReport\(clubId = ''\)/, 'segmentation report must be navigable');
assert.match(js, /trackReportHistory\(\{[\s\S]*type: 'coach-segmentation'/, 'opening a coach segmentation report must save it to recent reports');
assert.match(js, /navigateTo\('coachSegmentationReport'\)/, 'segmentation report must use normal navigation');

assert.match(js, /function aiProductTemplateClub\(\)/, 'AI coach template must resolve a club from current or strongest context');
assert.match(js, /coachSegmentationClubId: templateClub\.id/, 'AI coach template must open the real segmentation report');
assert.match(js, /data-coach-segmentation-club-id/, 'AI and club actions must carry a club id');
assert.match(js, /openCoachSegmentationReport\(button\.dataset\.coachSegmentationClubId\)/, 'AI coach segmentation action must bind to report navigation');
assert.match(js, /clubEvents\.querySelectorAll\('\[data-coach-segmentation-club-id\]'\)/, 'club detail must bind segmentation report actions');
assert.match(js, /生成学员分层报告/, 'club detail must expose a product-facing segmentation report CTA');

assert.match(js, /coach-segmentation-summary/, 'segmentation report must show a coach summary');
assert.match(js, /class="coach-segmentation-metrics"/, 'segmentation report must show bucket metrics');
assert.match(js, /class="coach-segmentation-buckets"/, 'segmentation report must show athlete buckets');
assert.match(js, /class="coach-segmentation-followups"/, 'segmentation report must show follow-up actions');
assert.match(js, /class="panel coach-segmentation-report-card coach-business-growth"/, 'segmentation report must expose recruiting and reputation assets');
assert.match(js, /招生与口碑素材/, 'coach report must include business-growth copy');
assert.match(js, /const businessRows = coachBusinessGrowthRows\(club, projectRows, buckets\)/, 'coach report must render business rows from current club data');
assert.match(js, /buildCoachSegmentationShareText\(club, buckets, followups, projectRows, businessRows\)/, 'coach report share text must include business rows');
assert.match(js, /class="coach-segmentation-evidence"/, 'segmentation report must show traceable evidence');
assert.match(js, /data-report-share="coach-segmentation"/, 'segmentation report must expose a copy summary action');
assert.match(js, /bindCopyTextButton\(coachSegmentationReportHero\.querySelector\('\[data-report-share="coach-segmentation"\]'\)/, 'segmentation report copy action must be wired');
assert.match(js, /已复制，可继续申请教练试用。/, 'segmentation report copy action must guide users toward coach trial');
assert.match(js, /source: 'coach-segmentation-report'/, 'coach segmentation report must expose a report-scoped commercial source');
assert.match(js, /申请教练试用/, 'coach segmentation report must include a coach trial conversion action');
assert.match(js, /bindReportConversionActions\(coachSegmentationReportBody\)/, 'coach segmentation conversion actions must be wired');
assert.match(js, /coachSegmentationReportBody\.querySelectorAll\('\[data-athlete-id\]'\)/, 'segmentation report athletes must be clickable');
assert.match(js, /coachSegmentationReportBody\.querySelectorAll\('\[data-event-code\]'\)/, 'segmentation report evidence must be clickable');
assert.match(js, /查看完整俱乐部画像/, 'segmentation report must allow drilling into the full club profile');

assert.match(css, /\.coach-segmentation-report-shell/, 'coach segmentation shell styles must exist');
assert.match(css, /\.coach-segmentation-report-card/, 'coach segmentation card styles must exist');
assert.match(css, /\.coach-segmentation-metrics/, 'coach segmentation metric styles must exist');
assert.match(css, /\.coach-segmentation-bucket/, 'coach segmentation bucket styles must exist');
assert.match(css, /\.coach-segmentation-followups/, 'coach segmentation follow-up styles must exist');
assert.match(css, /\.coach-business-grid/, 'coach business-growth grid styles must exist');
assert.match(css, /\.coach-business-card/, 'coach business-growth cards must be styled');
assert.match(css, /\.coach-segmentation-evidence/, 'coach segmentation evidence styles must exist');
assert.match(css, /\.report-share-action/, 'report share button styles must exist');
assert.match(css, /\.report-conversion-card/, 'report conversion card styles must exist');

console.log('coach segmentation report view is covered');
