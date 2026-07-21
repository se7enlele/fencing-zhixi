# FencingAI User Feedback Upgrade Roadmap

Date: 2026-07-21

This roadmap summarizes the upgrade items exposed by recent real-user style feedback. The key product gap is not lack of pages, but lack of a stable decision workflow:

Ask -> answer -> evidence -> deeper view -> follow/save -> reuse later.

## P0: Main Decision Flow

### 1. AI question handling

Status: partially done.

Current progress:
- Supports common questions about event statistics, club comparison, athlete growth and data value.
- Club comparison now separates quantity advantage from efficiency signals.
- Loading state and result auto-scroll have been added.

Remaining upgrades:
- Better identify pure event-name questions such as "北京击剑联赛第一站".
- Better distinguish event, athlete, club, coach, referee and statistics questions.
- When a query is ambiguous, ask the user to add year, city, weapon, gender or age group instead of returning a weak result.

Acceptance examples:
- "2026年天津有几场比赛" returns a filtered event count.
- "哪场比赛人数最多" returns a ranked result with source events.
- "北京击剑联赛第一站" either opens a matched event or clearly says it is not currently included.
- "北京金石和北京艾鲁特U10男花谁更强" separates participation volume, top-eight count, medal count and rate indicators.

### 2. AI answer presentation

Status: partially done.

Current progress:
- Home AI answer copy has been cleaned once.
- Internal wording such as analysis path and follow-up process has been reduced.

Remaining upgrades:
- Standardize answer layout into: conclusion, key numbers, evidence, next action.
- Remove all remaining user-facing internal terms, including "分析口径", "判断路径", "后续", "数据边界", "第一版", "待升级" and similar system-process language.
- Make every strong conclusion visibly supported by one or more source rows.

Acceptance examples:
- A user can understand the answer in one screen.
- The first sentence is a user-facing conclusion, not a description of how the system worked.
- Every evidence chip opens an event, athlete, club or filtered database view.

### 3. Evidence traceability

Status: partially done.

Current progress:
- AI answers expose compact clickable evidence rows.
- Competition statistics now use the filtered competition list as the primary source, so users can verify the full result set.
- Competition ranking still opens the top event or project first, with the related competition list kept as a secondary source.

Remaining upgrades:
- Club comparison should link to both club profiles.
- Athlete growth answers should link to the athlete profile and specific competition records.
- Expand the same list-level source pattern to more report types where the conclusion is based on a group of records.

Acceptance examples:
- For any conclusion card, the user can tap into the exact supporting data.
- The target page lands on the relevant section, not only the top of a generic list.

### 4. Failure recovery

Status: partially done.

Remaining upgrades:
- "No result" must distinguish between not collected, not imported, not started, no roster, and no score.
- Unknown event names should not silently drift to similar old events.
- Questions like "孩子击剑值不值得继续" should first ask the user to choose or follow a child.

Acceptance examples:
- "北京击剑联赛第一站" does not mislead the user if the event is missing.
- Missing data produces a next action, such as "search database", "add follow target", or "check upcoming events".

## P1: Core User Scenarios

### 5. Parent growth report

Status: partially done.

Current progress:
- Followed children can appear on home and profile pages.
- Parent-facing wording has been adjusted away from harsh labels.

Remaining upgrades:
- Make the report structure stable: recent form, yearly trend, pool stability, elimination result, best rank, latest rank, next observation.
- Avoid emotional or final-sounding judgments.
- Add a shareable summary for parent-to-coach communication.

Acceptance examples:
- The parent sees the child's current stage and observable signals in one screen.
- The report avoids phrases that sound like a verdict on the child.

### 6. Prematch intelligence package

Status: early stage.

Remaining upgrades:
- Support events with roster only, before scores exist.
- Show registration heat, familiar opponents, strong entrants and club distribution.
- Only show "potential opponents" after the user's child or students are known.
- Clearly separate "registration data" from "score data".

Acceptance examples:
- For an upcoming Tianjin event, the page can show roster-based analysis without pretending matches have happened.
- If no child/student is selected, the product asks the user to choose a target first.

### 7. Coach workspace

Status: partially done.

Current progress:
- Coach role and club profile entry exist.
- Coach-facing club modules have begun to replace parent modules.

Remaining upgrades:
- Default to student tiers, key students to follow, strong events, weak events and near-term competition focus.
- Add copyable parent communication notes.
- Support segmentation by weapon, gender and age group.
- Remove all parent-only modules from coach flow.

Acceptance examples:
- A coach entering a club profile does not see "我的孩子".
- The coach can quickly know who to follow, what to train, and what to communicate to parents.

### 8. Club growth and recruiting asset

Status: not complete.

Remaining upgrades:
- Generate a shareable club card with representative athletes, strong events, medals, top-eight results and best rank.
- Use restrained, evidence-backed recruiting language.
- Support copy/save for offline parent communication.

Acceptance examples:
- A small club can produce a credible external-facing achievement card.
- The card avoids exaggerated rankings or unsupported claims.

### 9. Database page as evidence layer

Status: partially done.

Current progress:
- Main tabs have been simplified into Home, Database and My.
- Follow filter sheet has been implemented.
- AI-to-database navigation now preserves the source question and shows it above the filtered competition list.
- Coach/referee search entry exists, but real official data is not yet imported.

Remaining upgrades:
- Make sorting consistent across year, region, event type, status and follow scope.
- Add official data import for coaches and referees.
- Keep database page focused on verification, not another home page.

Acceptance examples:
- From "2026天津有几场比赛", tapping evidence opens the same filtered result set.
- "我的关注" filter opens a real option panel and updates the list consistently.

## P2: Long-Term Commercial Product

### 10. Follow, save and reminder system

Status: partially done.

Remaining upgrades:
- Cover athletes, competitions, clubs and reports.
- Use compact tag or icon states for followed/unfollowed.
- Home should prioritize followed objects and upcoming reminders.
- Add reminder intent capture before full notification infrastructure.

Acceptance examples:
- Follow status is clear but not visually dominant.
- Users can return to recent people, events and reports from home.

### 11. Account and login system

Status: partially done.

Current progress:
- Basic account state and login page work are present.
- Logged-in and logged-out display conflict has been reduced.

Remaining upgrades:
- Finalize two clean states: logged out and logged in.
- Logged out: public browsing and local follows only.
- Logged in: synced follows, reports, history and reminders.
- Phase 1 can use phone/email plus password; Phase 2 can add WeChat login.

Acceptance examples:
- Logged-in users do not see phone/password login form.
- Logged-out users do not see language implying account-level selected children.

### 12. Report productization

Status: early stage.

Report types to productize:
- Parent growth report.
- Prematch intelligence package.
- Coach student-tier report.
- Club recruiting card.

Remaining upgrades:
- Each report needs a fixed structure, source links, save/reopen support and copyable summary.
- Reports should be generated naturally from AI questions.

Acceptance examples:
- A user can ask for a report, save it, reopen it, and trace the source data.

### 13. Data coverage and sync transparency

Status: partially done.

Current progress:
- Scheduled sync and manual data validation workflows exist.
- Official directory can be manually validated, but real official data is not imported.

Remaining upgrades:
- Show coverage by layer: event list, project list, roster, score, official directory.
- For in-progress events, show what is currently available rather than treating it as an error.
- Clarify missing data without exposing internal pipeline wording.

Acceptance examples:
- Users can tell whether an event has only roster data, partial scores, or complete results.
- Missing data is expressed as current coverage status, not as product failure.

## Suggested Execution Order

### Round 1: Close the AI main loop

1. Fix event-name intent and missing-event recovery.
2. Finish AI answer presentation cleanup.
3. Add clickable evidence actions.
4. Build regression tests for the top 10 real questions.

### Round 2: Make the product useful for the first paying-like users

1. Parent growth report v1.
2. Prematch roster intelligence v1.
3. Coach workspace v1.
4. Club share card v1.

### Round 3: Make usage repeatable

1. Follow/save/reminder consolidation.
2. Account state finalization.
3. Report save and reopen.
4. Data coverage layer display.

## Current Known Data Gaps

- Coaches and referees: search UI and validation path exist, but real data has not been imported.
- Beijing Fencing League: if not found in the platform data, the system should say it is not currently included and avoid matching unrelated events.
- Upcoming events: roster-only support is needed for useful prematch analysis.
- Generated static data files are currently dirty in the worktree and should not be committed unless explicitly requested.

## Regression Questions

Use these before release:

1. 2026年天津有几场比赛
2. 天津近期报名情况
3. 哪场比赛人数最多
4. 北京击剑联赛第一站
5. 北京金石和北京艾鲁特U10男花谁更强
6. 山东小众体育U8男花怎么样
7. 山东小众体育最近哪些学员值得关注
8. 蔡廷彧最近有没有进步
9. 帮我生成蔡廷彧成长报告
10. 分析马潇和陶嘉月的对战情况
11. 某场比赛U8男花淘汰赛表现怎么样
12. 孩子击剑值不值得继续

## Execution Log

### 2026-07-21

Shipped in commit `3566ee83` and deployed to Cloudflare version `2efdebd6-c8b2-4f6b-af9c-95610f0da3e5`.

Completed:
- Single-character surname recovery: short questions such as `蔡` can enter guided recovery and surface matching athletes instead of ending with a blank or unrelated answer.
- Abbreviated club comparison recovery remains covered by runtime tests.
- AI question submission has a visible loading state, progress steps, skeleton content and immediate scroll into the answer area.
- Database `我的关注` filter is wired to the shared filter sheet instead of silently toggling.
- My page account state is split into logged-in and logged-out displays; the login form lives on the dedicated login page.
- Product copy tests guard against user-facing implementation terms such as rollout language, login-code wording and vague combined login/signup copy.

Verification:
- `node --check web\viewer.js`
- `node tools\ai-native-answer-test.mjs`
- `node tools\ai-acceptance-runtime-test.mjs`
- `node tools\my-page-view-test.mjs`
- `node tools\product-copy-test.mjs`
- `npm.cmd run smoke`
- Online `https://fencingai.uk/viewer.js` verification found the deployed markers for single-character recovery, AI loading state and the shared follow filter sheet.

Still open:
- Event-name intent and missing-event recovery, especially queries such as `北京击剑联赛第一站`.
- Stronger evidence links for club comparison and athlete growth answers.
- Roster-only prematch intelligence for upcoming events.
- Real coach and referee data import.
- Generated static data files remain dirty after deployment and should stay out of commits unless a data release is explicitly requested.

### 2026-07-21 Follow-up

Shipped in commit `dfb91dc5` and deployed to Cloudflare version `1ad65c4a-e7f3-4185-8d2c-efd88f200175`.

Completed:
- Specific event-name questions without an explicit statistics intent no longer route to broad regional event statistics.
- Queries such as `北京击剑联赛第二站` now enter missing-event recovery instead of becoming a generic Beijing event count.
- Regional statistics questions still work when the user asks with count language, such as `2026年天津有几场比赛`.

Verification:
- `node --check web\viewer.js`
- `node tools\ai-native-answer-test.mjs`
- `node tools\ai-acceptance-runtime-test.mjs`
- `node tools\product-copy-test.mjs`
- `npm.cmd run smoke`
- Online `https://fencingai.uk/viewer.js` SHA256 matched the local deployed file and contains the explicit statistics-intent guard.

Still open:
- Real data coverage for `北京击剑联赛第一站` still depends on whether the event exists in the collected source data.
- If the event is not collected, the product should keep showing the user-facing missing-event recovery path and avoid implying the match does not exist.

### 2026-07-21 Evidence Action Follow-up

Completed:
- AI answer primary action buttons now use a centralized target helper.
- When an action has both `eventCode` and `sportCode`, the exact project/event target wins over the parent competition page.
- This closes a traceability gap for answers such as "which project has the most participants", where the user expects the action to open the specific project rather than the generic event page.

Verification:
- `node --check web\viewer.js`
- `node tools\ai-native-answer-test.mjs`
- `node tools\ai-acceptance-runtime-test.mjs`
- `node tools\my-page-view-test.mjs`
- `node tools\product-copy-test.mjs`
- `npm.cmd run smoke`
