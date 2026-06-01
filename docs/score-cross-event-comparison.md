# score 成绩包跨赛事对比

## 样本

已验证 4 个项目：

| 赛事 | 项目 | eventCode | 文件 |
|---|---|---|---|
| 城市副中心击剑公开赛 | U6男子花剑个人 | `RZSS2036022MFIU6` | `scoredemou6.js` |
| 城市副中心击剑公开赛 | U8男子花剑个人 | `RZSS2036022MFIU8` | `scoredemo.js` |
| 滨海杯秦皇岛击剑公开赛 | U6男子花剑个人 | `RZSS2033120MFIU6` | `RZSS2033120MFIU6.js` |
| 滨海杯秦皇岛击剑公开赛 | U8男子花剑个人 | `RZSS2033120MFIU8` | `RZSS2033120MFIU8.js` |

## 结构稳定性

4 个样本的顶层结构完全一致：

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

这说明 score 成绩包格式具有较好的跨赛事稳定性，可以作为核心数据源。

## 关键差异

| eventCode | 人数 | 日期 | 小组数 | 晋级数 | 淘汰赛起始 | 淘汰赛轮次 | 实赛对阵 | Bye |
|---|---:|---|---:|---:|---|---|---:|---:|
| `RZSS2036022MFIU6` | 6 | 2026.03.21 | 1 | 6 | 8表 | 8表/半决赛/决赛 | 5 | 2 |
| `RZSS2036022MFIU8` | 44 | 2026.03.22 | 7 | 35 | 64表 | 64表/32表/16表/8表/半决赛/决赛 | 34 | 29 |
| `RZSS2033120MFIU6` | 8 | 空 | 2 | 8 | 8表 | 8表/半决赛/决赛 | 7 | 0 |
| `RZSS2033120MFIU8` | 24 | 空 | 4 | 19 | 32表 | 32表/16表/8表/半决赛/决赛 | 18 | 13 |

## 新发现

### 1. `OpenDate` 可能为空

秦皇岛样本中 `General.OpenDate` 为 `null`。数据库和页面都不能假设项目日期一定存在。

建议：

- `event_items.match_date` 允许为空。
- 优先从赛事详情、项目列表和 score 三处补齐日期。
- 页面日期为空时展示为“待确认”或直接隐藏。

### 2. 同年龄组赛制不固定

U8 不一定从 64 表开始：

- 城市副中心 U8: 44 人，从 64 表开始
- 秦皇岛 U8: 24 人，从 32 表开始

因此不能按年龄组硬编码轮次。应以 `General.DEstartPhase` 和 `Tableaus` 为准。

### 3. Bye 数量可为 0

U6 样本：

- 6 人 U6 有 2 个 Bye
- 8 人 U6 没有 Bye

应通过 `Matchs` 中是否出现 `Bye` 动态计算。

### 4. PoolStanding 可能少于项目人数

已观察：

- 城市副中心 U8: 项目人数 44，`PoolStanding` 43
- 秦皇岛 U8: 项目人数 24，`PoolStanding` 23

这可能与 DNS、退赛或异常记录有关，后续分析不能假设 `PoolStanding.length === CompetitionNo`。

## 建模结论

统一模型仍然成立，但字段必须允许变化：

- `event_items.match_date` nullable
- `event_items.de_start_phase` 使用原始文本和结构化轮次双字段
- `pool_standings` 与 `event_entries` 不强制一一对应
- `elimination_matches.is_bye` 动态计算
- `tableau_phases` 完全来自 `Tableaus`，不按年龄组预设

