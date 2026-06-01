# score 成绩包 U6/U8 对比

## 样本

U6:

- 文件: `E:\Codex\data\scoredemou6.js`
- 报告: `data/analysis/score-RZSS2036022MFIU6-analysis.json`
- 项目: `RZSS2036022MFIU6`

U8:

- 文件: `E:\Codex\data\scoredemo.js`
- 报告: `data/analysis/score-RZSS2036022MFIU8-analysis.json`
- 项目: `RZSS2036022MFIU8`

## 结构结论

U6 和 U8 的顶层结构完全一致：

- `General`
- `Classment`
- `IniStarts`
- `PoolStanding`
- `Pools`
- `PoolResults`
- `PRDetails`
- `Phases`
- `Tableaus`
- `Matchs`

这说明 `Resource/score/{eventCode}.js` 可以作为统一的项目成绩包解析入口。

## 赛制差异

| 指标 | U6 男花个人 | U8 男花个人 |
|---|---:|---:|
| 项目人数 | 6 | 44 |
| 小组数量 | 1 | 7 |
| 小组赛人数 | 6 | 44 |
| 小组赛晋级人数 | 6 | 35 |
| 小组赛单场比分 | 15 | 117 |
| 淘汰赛起始 | 8表 | 64表 |
| 淘汰赛轮次数 | 3 | 6 |
| 淘汰赛总对阵 | 7 | 63 |
| 实际比赛对阵 | 5 | 34 |
| Bye | 2 | 29 |

## U6 赛制

- 1 个小组
- 6 人全部晋级
- 淘汰赛从 8 表开始
- 轮次: 8表、半决赛、决赛
- 8 表有 2 个 Bye

## U8 赛制

- 7 个小组
- 44 人中 35 人晋级
- 淘汰赛从 64 表开始
- 轮次: 64表、32表、16表、8表、半决赛、决赛
- 64 表存在大量 Bye

## 产品建模结论

数据模型无需为 U6/U8 分开设计。应使用统一模型：

- `event_items`
- `event_entries`
- `pools`
- `pool_standings`
- `pool_bouts`
- `tableau_phases`
- `elimination_matches`

差异通过以下字段表达：

- `participant_count`
- `pool_count`
- `pool_qualify_count`
- `de_start_phase`
- `phase.order`
- `match.is_bye`

## 分析展示建议

项目分析页可以根据人数自动调整展示重点：

- 小人数项目突出完整路径和每场比分。
- 大人数项目突出小组赛排名、晋级线、淘汰赛路径和 Bye 数量。

