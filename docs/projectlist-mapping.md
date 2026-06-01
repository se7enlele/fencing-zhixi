# projectlist 接口解析记录

## 样本

- 来源 URL: `https://fencing.yy-sport.com.cn/fencingapi/competition/projectlist?sportId=101212`
- 本地文件: `E:\Codex\data\projectlist.txt`
- 分析报告: `data/analysis/projectlist-101212-analysis.json`

## 数据性质

该接口返回赛事下的项目列表。它不包含具体排名和对阵结果，但会提供后续获取结果数据所必需的 `sportId` 和 `eventCode`。

## 样本统计

- 项目数量: 84
- 赛事 ID: 101212
- 赛事编码: `RZSS2036022`
- 总报名人数: 6300
- 每个项目报名人数: 75
- 剑种分布: 花剑 28、重剑 28、佩剑 28
- 性别分布: 男 42、女 42
- 年龄组分布: U6、U8、U10、U12、U14、U16、17+ 各 12 个项目
- 项目类型: 个人、团体

## 核心字段映射

| 源字段 | 建议目标字段 | 含义 | 备注 |
|---|---|---|---|
| `eventId` | `event_items.source_event_id` | 项目内部 ID | 官方项目主键 |
| `eventCode` | `event_items.source_event_code` | 项目编码 | 后续查成绩、对阵会用到 |
| `sportId` | `events.source_event_id` | 赛事 ID | 同一赛事下相同 |
| `sportCode` | `events.source_sport_code` | 赛事编码 | 可辅助去重 |
| `eventName` | `event_items.item_name` | 项目名称 | 例如 U10男子花剑个人 |
| `weaponCode` | `event_items.weapon_code` | 剑种编码 | F=花剑，E=重剑，S=佩剑 |
| `weaponDesc` | `event_items.weapon` | 剑种 | 中文展示 |
| `gender` | `event_items.gender_code` | 性别编码 | M=男，F=女 |
| `genderDesc` | `event_items.gender` | 性别 | 中文展示 |
| `groupCode` | `event_items.age_group_code` | 年龄组编码 | 17+ 在样本中为 `U17s` |
| `groupName` | `event_items.age_group` | 年龄组 | 展示值 |
| `itemType` | `event_items.item_type_code` | 项目类型编码 | I=个人，T=团体 |
| `itemTypeDesc` | `event_items.item_type` | 项目类型 | 中文展示 |
| `openDate` | `event_items.start_date` | 项目开始日期 | 当前样本均为 2026-03-21 |
| `closeDate` | `event_items.end_date` | 项目结束日期 | 当前样本均为 2026-03-22 |
| `ageMin` | `event_items.age_min` | 最小年龄 | 可用于年龄组校验 |
| `ageMax` | `event_items.age_max` | 最大年龄 | 17+ 样本最大值为 70 |
| `totalRegNumber` | `event_items.participant_count` | 报名人数 | 项目规模分析核心字段 |

## 预留字段

以下字段在当前样本中完整率为 0，但数据库建议保留：

- `regType`
- `proAgeMax`
- `proAgeMin`
- `amtAgeMax`
- `amtAgeMin`
- `seedsNumber`
- `poolRegNumber`
- `poolQualify`
- `perdeStartPhaseDes`
- `deStartPhaseDes`
- `ruleId`

## 后续结果数据定位

每个项目可以派生两个后续查找路径：

```text
/fencingapi/matchresult/{sportId}/{eventCode}
/Resource/score/{eventCode}.js
```

例如：

```text
/fencingapi/matchresult/101212/RZSS2036022MFIU10
/Resource/score/RZSS2036022MFIU10.js
```

## 入库建议

`projectlist` 应作为 `event_items` 的主数据来源。导入逻辑应使用 `(sportId, eventCode)` 做唯一键，避免重复导入。

建议唯一键：

```sql
unique(source_event_id, source_event_code)
```

其中：

- `source_event_id` 对应 `sportId`
- `source_event_code` 对应 `eventCode`

