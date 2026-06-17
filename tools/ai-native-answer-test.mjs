import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js = await readFile(new URL('../web/viewer.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../web/viewer.css', import.meta.url), 'utf8');

assert.match(js, /function athleteComparisonConfidence\(direct, shared\)/, 'AI athlete comparison must expose evidence strength');
assert.match(js, /function athleteRankGapText\(left, right\)/, 'AI athlete comparison must explain rank gap');
assert.match(js, /function aiAcceptanceQueryCases\(\)/, 'AI must keep a stable acceptance query set');
assert.match(js, /expectedType: 'competition-stats'/, 'AI acceptance queries must cover regional competition stats');
assert.match(js, /expectedType: 'prematch'/, 'AI acceptance queries must cover prematch registration questions');
assert.match(js, /expectedType: 'club'/, 'AI acceptance queries must cover scoped club analysis');
assert.match(js, /expectedType: 'growth'/, 'AI acceptance queries must cover athlete growth analysis');
assert.match(js, /expectedType: 'comparison'/, 'AI acceptance queries must cover athlete comparison');
assert.match(js, /aiAcceptanceQueryCases\(\)\.slice\(1, 4\)/, 'AI home presets must reuse acceptance questions');
assert.match(js, /function detectExactAthletesInQuery\(normalizedQuery\)/, 'AI routing must separate exact athlete matches from fuzzy matches');
assert.match(js, /function aiEntityCandidateTerms\(query\)/, 'AI must extract entity candidates before answering from the home prompt');
assert.match(js, /async function ensureAiEntityContext\(query\)/, 'AI must hydrate athlete and club context on demand');
assert.match(js, /await ensureAiEntityContext\(normalizedQuery\)/, 'AI home prompt must load relevant entity context before building an answer');
assert.match(js, /const club = detectClubInQuery\(text\);[\s\S]*if \(club\) return buildAiClubReport\(text, club\);[\s\S]*const athletes = detectAthletesInQuery\(text\);/, 'AI routing must prefer exact club matches before fuzzy athlete guesses');
assert.match(js, /function aiProjectHints\(query\)/, 'AI club reports must detect project hints like U8 male foil');
assert.match(js, /function projectMatchesAiHints\(label, hints\)/, 'AI club reports must filter projects by question hints');
assert.match(js, /title: hints\.length \? '匹配项目' : '优势项目'/, 'AI club reports must label scoped project answers');
assert.match(js, /function detectPreMatchQuery\(query\)/, 'AI must detect prematch and registration questions');
assert.match(js, /function detectYearInQuery\(normalizedQuery\)/, 'AI competition questions must support relative year wording');
assert.match(js, /function detectMonthInQuery\(normalizedQuery\)/, 'AI competition questions must support month filters');
assert.match(js, /function competitionMonth\(competition\)/, 'AI competition questions must filter competitions by month');
assert.match(js, /function buildAiPreMatchReport\(query, filters\)/, 'AI must build prematch reports from registration and project data');
assert.match(js, /report\.type === 'prematch' \? '赛前情报'/, 'AI answer header must label prematch reports');
assert.match(js, /kind: '赛前赛事'/, 'AI prematch evidence must label prematch competitions');
assert.match(js, /名单未完整时，只做项目级和赛事级判断/, 'AI prematch report must disclose incomplete roster boundaries');
assert.match(js, /暂未发现两人的直接交手记录/, 'AI comparison must not imply direct bouts when none are found');
assert.match(js, /没有直接交手时，不会推断真实胜负/, 'AI comparison must disclose data boundary');
assert.match(js, /title: '时间分布'/, 'AI competition stats must include month distribution when available');
assert.match(js, /kind: '共同项目'/, 'AI evidence must label shared project evidence');
assert.match(js, /reason: '用于比较同一项目里的名次差距'/, 'AI evidence must explain why a source supports the answer');
assert.match(js, /function aiEvidenceKind\(row\)/, 'AI evidence renderer must normalize evidence type labels');
assert.match(js, /class="ai-source-note"/, 'AI answer must render data boundary notes');
assert.match(js, /<em>\$\{escapeHtml\(aiEvidenceKind\(row\)\)\}<\/em>/, 'AI evidence cards must show evidence type');
assert.match(js, /<small>\$\{escapeHtml\(row\.reason\)\}<\/small>/, 'AI evidence cards must show relevance reason');

assert.match(css, /\.ai-source-note/, 'AI source note styles must exist');
assert.match(css, /\.ai-evidence button em/, 'AI evidence type badge styles must exist');
assert.match(css, /\.ai-evidence button small/, 'AI evidence reason styles must exist');

console.log('AI native answers are covered');
