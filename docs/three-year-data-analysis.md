# 最近 3 年数据补充、清洗与分析状态

生成日期：2026-06-08

范围：2024、2025、2026 三个赛季。

## 当前结论

当前公开数据包已经可以支撑最近 3 年的比赛、选手、俱乐部分析：

| 指标 | 数量 |
| --- | ---: |
| 比赛 | 412 |
| 已有成绩层比赛 | 213 |
| 已有项目及以上比赛 | 251 |
| 仍停留在赛事目录层 | 161 |
| 选手参赛记录 | 38496 |
| 去重选手 | 11922 |
| 俱乐部项目记录 | 13918 |
| 去重俱乐部 | 652 |

成绩覆盖率：52%

项目及以上覆盖率：61%

## 已生成产物

运行：

```bash
npm run analysis:three-year
```

会生成：

| 文件 | 说明 |
| --- | --- |
| `analysis-output/three-year/competitions.csv` | 最近 3 年比赛清洗表 |
| `analysis-output/three-year/athletes.csv` | 最近 3 年选手聚合表 |
| `analysis-output/three-year/clubs.csv` | 最近 3 年俱乐部聚合表 |
| `analysis-output/three-year/coverage-gaps.csv` | 仍缺项目、报名或成绩的比赛清单 |
| `analysis-output/three-year/sync-targets.csv` | 按业务优先级排序的下一批补数目标 |
| `analysis-output/three-year/summary.json` | 机器可读摘要 |
| `analysis-output/three-year/stats.md` | 统计分析报告 |

`analysis-output/` 是本地生成产物目录，当前仍不纳入提交；可通过脚本重复生成。

## 数据缺口

当前最主要缺口不是选手和俱乐部的聚合能力，而是赛事覆盖层级：

| 下一步 | 比赛数 |
| --- | ---: |
| 补项目清单 | 161 |
| 补报名名单或成绩 | 35 |
| 补赛后成绩对阵 | 3 |

## 本次补数验证

已用 `tools/sync-platform-data.mjs` 对最近未开赛赛事做小批量 projectlist 同步验证：

```bash
node tools/sync-platform-data.mjs --status all --limit 5 --no-score --timeout-sec 25
```

结果：

| sportId | sportCode | 结果 |
| --- | --- | --- |
| 101258 | D05GJSJS0620261201 | 官方当前返回 0 个项目，已记录 |
| 101259 | D05GJSHUB0120261201 | 官方当前返回 0 个项目，已记录 |

这说明代理和解析链路可用；当前没有提升覆盖率，是因为这两场官方项目清单尚未开放。

2026-06-09 继续按 `sync-targets.csv` 补报名名单：

```bash
node tools/sync-platform-data.mjs --sport-id 101134 --roster --no-score --roster-max-pages 4 --roster-page-size 20 --timeout-sec 25
```

结果：

| sportId | sportCode | 赛事 | 结果 |
| --- | --- | --- | --- |
| 101134 | RZSS2035020 | 2026年九江“庐山杯”击剑公开赛 | 已补前 5 个男子花剑项目报名名单，原始分页 240 条，分析层聚合 239 人次，覆盖层级从 project 提升到 roster |

说明：当前同步脚本默认 `rosterLimit=5`，本次只补了项目清单中的前 5 个项目；如果要完整覆盖该赛事报名名单，需要继续扩大 `--roster-limit` 或按具体项目分批补齐。

2026-06-09 第二批继续补报名中赛事：

```bash
node tools/sync-platform-data.mjs --sport-id 101228 --roster --no-score --roster-max-pages 4 --roster-page-size 20 --timeout-sec 25
node tools/sync-platform-data.mjs --sport-id 101136 --roster --no-score --roster-max-pages 4 --roster-page-size 20 --timeout-sec 25
node tools/sync-platform-data.mjs --sport-id 101299 --roster --no-score --roster-max-pages 4 --roster-page-size 20 --timeout-sec 25
```

结果：

| sportId | sportCode | 赛事 | 结果 |
| --- | --- | --- | --- |
| 101228 | RZSS2036062 | 2026年“乐动长宁杯”上海击剑公开赛 | 已补前 5 个男子花剑项目报名名单，分析层聚合 165 人次，覆盖层级从 project 提升到 roster |
| 101136 | RZSS2035021 | 2026年“长城之巅”击剑公开赛（石家庄站） | 官方当前返回 0 条，已记录，覆盖层级仍为 project |
| 101299 | RZSSAH0120260620 | 2026年汕尾击剑公开赛 | 已补前 5 个男子花剑项目报名名单，分析层聚合 206 人次，覆盖层级从 project 提升到 roster |

补完后，最近 3 年缺口变为：`补报名名单/成绩 32`，`补赛后成绩对阵 6`。

## 产品影响

家长视角：
已有成绩层数据可以支持成长趋势、最好名次、前八稳定性、小组赛稳定性、淘汰赛胜负等分析。

教练视角：
已有俱乐部项目记录可以支持队伍项目矩阵、重点学员、强项年龄段、俱乐部表现排行；赛前对手情报仍依赖报名名单和项目清单继续补齐。

赛事视角：
已完成成绩层的 213 场比赛可以深度展示；目录层的 161 场比赛应避免展示过度分析，只展示赛事基础信息和“待补项目清单”的后台状态。

## 后续补数优先级

1. 优先补最近、报名中、未开赛赛事的 `projectlist`。
2. 已有 `projectlist` 的比赛，优先补报名名单 `roster`。
3. 目标俱乐部相关赛事优先补成绩对阵，用于教练样板用户。
4. 青少年 U6/U8/U10/U12 花剑、重剑项目优先级高于泛成人赛事。
5. 每次补数后运行 `npm run analysis:three-year`，查看覆盖率和缺口变化。
6. 具体补数顺序以 `analysis-output/three-year/sync-targets.csv` 为准，里面包含建议执行命令。

## 2026-06-09 第三批报名名单补齐

本轮继续按 `analysis-output/three-year/sync-targets.csv` 处理报名中/近期未开赛赛事，重点补齐赛前报名名单。执行时已将默认限制从 `rosterLimit=5 / rosterMaxPages=4` 扩大为 `--roster-limit 0` 和更高分页上限，避免只得到前几个项目的样本数据。

执行命令：

```bash
node tools/sync-platform-data.mjs --sport-id 101127 --roster --no-score --roster-limit 0 --roster-max-pages 10 --roster-page-size 20 --timeout-sec 25
node tools/sync-platform-data.mjs --sport-id 101318 --roster --no-score --roster-limit 0 --roster-max-pages 12 --roster-page-size 20 --timeout-sec 25
node tools/sync-platform-data.mjs --sport-id 101218 --roster --no-score --roster-limit 0 --roster-max-pages 12 --roster-page-size 20 --timeout-sec 25
node tools/sync-platform-data.mjs --sport-id 101150 --roster --no-score --roster-limit 0 --roster-max-pages 14 --roster-page-size 20 --timeout-sec 25
npm run analysis:three-year
```

补齐结果：

| sportId | sportCode | 赛事 | 覆盖变化 | 分析层 rosterCount | 完整度 |
| --- | --- | --- | --- | ---: | --- |
| 101127 | RZSS2034123 | 2026年凉都论剑少年锋芒击剑公开赛 | project -> roster | 378 | 44/44 项完整 |
| 101318 | RZSSSAN0120260612 | 2026年西安市“万河荟”杯 Rapier 击剑公开赛 | project -> roster | 1332 | 58/58 项完整 |
| 101218 | RZSS2036041 | 2026年东体之星击剑公开赛（宁波站） | project -> roster | 777 | 31/34 项完整，3 项接口返回结构异常 |
| 101150 | RZSS2035030 | 2026年武汉击剑公开赛 | project -> roster | 2549 | 60/62 项完整，2 项接口返回结构异常 |

本轮新增赛前报名分析规模：4 场赛事、约 5036 条去重报名记录进入赛事分析层。`analysis-output/three-year/competitions.csv` 已显示这 4 场覆盖层均为 `roster`。

重新生成后的缺口变化：

| 缺口类型 | 上轮 | 本轮 |
| --- | ---: | ---: |
| 补报名名单/成绩 | 32 | 28 |
| 补赛后成绩对阵 | 6 | 10 |

说明：`athleteEventRows / athletes / clubEventRows / clubs` 当前仍只统计成绩层选手和俱乐部表现，不统计赛前报名名单。因此本轮补入的报名名单会提升赛事覆盖层和赛前分析能力，但不会改变成绩类选手/俱乐部聚合指标。后续如要把“已报名但未参赛”的选手、俱乐部纳入单独分析，应在 `three-year-analysis.mjs` 中新增 `registrationAthleteRows`、`registrationClubRows`、`registrationClubs` 等独立指标，避免和赛后成绩指标混在一起。
