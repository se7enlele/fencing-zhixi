# score 成绩包解析记录

## 样本

- 来源 URL: `https://fencing.yy-sport.com.cn/Resource/score/RZSS2036022MFIU8.js`
- 本地文件: `E:\Codex\data\scoredemo.js`
- 分析报告: `data/analysis/score-RZSS2036022MFIU8-analysis.json`

## 结论

`Resource/score/{eventCode}.js` 是目前最完整的数据包。它可以补齐 `projectlist` 和 `classmentrank` 缺失的比赛过程数据。

该文件包含：

- 项目概要
- 最终排名
- 初始排位
- 小组赛排名
- 小组赛每场比分
- 小组赛晋级人数
- 淘汰赛阶段结构
- 淘汰赛每场比分
- 选手晋级路径

## 顶层结构

| 字段 | 记录数 | 含义 |
|---|---:|---|
| `General` | 1 | 项目概要 |
| `Classment` | 44 | 最终排名 |
| `IniStarts` | 44 | 初始排位 |
| `PoolStanding` | 43 | 小组赛总排名 |
| `Pools` | 7 | 小组信息 |
| `PoolResults` | 44 | 每个选手小组赛成绩表 |
| `PRDetails` | 117 | 小组赛单场比分 |
| `Phases` | 1 | 阶段总类 |
| `Tableaus` | 6 | 淘汰赛轮次 |
| `Matchs` | 63 | 淘汰赛对阵 |

## 样本概要

- 赛事: 2026年城市副中心击剑公开赛
- 项目: U8男子花剑个人
- 地点: 北京·通州
- 项目人数: 44
- 小组赛人数: 44
- 小组赛晋级人数: 35
- 小组数量: 7
- 小组赛单场比分: 117
- 淘汰赛阶段: 64表、32表、16表、8表、半决赛、决赛
- 淘汰赛对阵: 63
- 实际淘汰赛对阵: 34
- Bye 对阵: 29

## 关键字段映射

### General

| 源字段 | 建议目标字段 | 含义 |
|---|---|---|
| `SportName` | `events.name` | 赛事名称 |
| `EventName` | `event_items.item_name` | 项目名称 |
| `OpenDate` | `event_items.match_date` | 比赛日期 |
| `Venue` | `events.venue` | 地点 |
| `CompetitionNo` | `event_items.participant_count` | 项目人数 |
| `PoolFencerNo` | `event_items.pool_participant_count` | 小组赛人数 |
| `PoolQualifyNo` | `event_items.pool_qualify_count` | 小组赛晋级人数 |
| `DEstartPhase` | `event_items.de_start_phase` | 淘汰赛起始轮次 |
| `Scode` | `events.source_sport_code` | 赛事编码 |
| `Ecode` | `event_items.source_event_code` | 项目编码 |

### PoolStanding

| 源字段 | 建议目标字段 | 含义 |
|---|---|---|
| `Rank` | `pool_standings.rank` | 小组赛综合排名 |
| `Name` | `athletes.display_name` | 运动员姓名 |
| `Licence` | `athlete_source_ids.source_licence` | 注册号，仅内部使用 |
| `Delegation` | `clubs.name` | 俱乐部 |
| `V` | `pool_standings.wins` | 胜场 |
| `M` | `pool_standings.matches` | 场次 |
| `Index` | `pool_standings.win_rate` | 胜率 |
| `HS` | `pool_standings.hits_scored` | 得剑 |
| `HR` | `pool_standings.hits_received` | 失剑 |
| `HSMHR` | `pool_standings.indicator` | 净胜剑 |
| `Remark` | `pool_standings.status` | Q=晋级，E=淘汰 |

### PRDetails

| 源字段 | 建议目标字段 | 含义 |
|---|---|---|
| `PoolID` | `pool_bouts.pool_id` | 小组 ID |
| `MatchOrder` | `pool_bouts.match_order` | 比赛顺序 |
| `HomeFencer` | `pool_bouts.home_label` | 主场选手文本 |
| `AwayFencer` | `pool_bouts.away_label` | 客场选手文本 |
| `HScore` | `pool_bouts.home_score` | 主场得分 |
| `AScore` | `pool_bouts.away_score` | 客场得分 |

`HScore` / `AScore` 中的 `V` 表示胜方，数字表示得分。

### Matchs

| 源字段 | 建议目标字段 | 含义 |
|---|---|---|
| `MatchID` | `elimination_matches.source_match_id` | 对阵 ID |
| `MatchCode` | `elimination_matches.match_code` | 对阵编码 |
| `PhaseID` | `elimination_matches.phase_id` | 轮次 ID |
| `HomeFencer` | `elimination_matches.home_name` | 主场选手 |
| `HomeLicence` | `elimination_matches.home_licence` | 主场注册号，仅内部 |
| `HomeNOC` | `elimination_matches.home_club` | 主场俱乐部 |
| `HomePoints` | `elimination_matches.home_score` | 主场得分 |
| `HomeWLT` | `elimination_matches.home_result` | W/L |
| `AwayFencer` | `elimination_matches.away_name` | 客场选手 |
| `AwayLicence` | `elimination_matches.away_licence` | 客场注册号，仅内部 |
| `AwayNOC` | `elimination_matches.away_club` | 客场俱乐部 |
| `AwayPoints` | `elimination_matches.away_score` | 客场得分 |
| `AwayWLT` | `elimination_matches.away_result` | W/L |
| `Winner` | `elimination_matches.winner_name` | 胜者 |
| `WinnerNOC` | `elimination_matches.winner_club` | 胜者俱乐部 |
| `GroupCode` | `elimination_matches.bracket_group_code` | 对阵树分组 |
| `F_InnerOrder` | `elimination_matches.inner_order` | 轮次内顺序 |

## 新增分析能力

有了 score 文件后，已经可以做：

- 小组赛胜率
- 小组赛净胜剑
- 小组赛晋级/淘汰
- 小组内每场比分
- 淘汰赛每轮比分
- 选手晋级路径
- 对手交手记录
- 胜负统计
- 净胜剑统计
- 俱乐部真实比赛表现
- “小组赛强、淘汰赛弱”等表现差异分析

## 隐私规则

公开页可以展示：

- 名次
- 姓名
- 俱乐部
- 比分
- 胜负
- 奖牌
- 轮次

默认不展示：

- `Licence`
- `Birthday`

这两个字段只用于内部去重、同名消歧和跨赛事合并。

