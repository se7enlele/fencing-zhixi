# classmentrank 接口解析记录

## 样本

- 来源 URL: `https://fencing.yy-sport.com.cn/fencingapi/matchresult/classmentrank/RZSS2036022MFIU8`
- 本地文件: `E:\Codex\data\classmentrank.txt`
- 分析报告: `data/analysis/classmentrank-RZSS2036022MFIU8-analysis.json`

## 数据性质

该接口返回某个项目的最终成绩排名。适合导入：

- `event_entries`
- `athletes`
- `clubs`
- `athlete_source_ids`

该数据包含未成年人生日和注册号，公开展示时必须做隐私降级。

## 样本统计

- 项目编码: `RZSS2036022MFIU8`
- 记录数: 44
- 排名范围: 1-44
- DNS: 1
- 奖牌: 金 1、银 1、铜 2
- 无奖牌记录: 40
- 俱乐部数量: 13

俱乐部人数 Top 10：

| 俱乐部 | 人数 |
|---|---:|
| 北京艾鲁特 | 9 |
| 北京清香 | 8 |
| 北京天奥 | 5 |
| 个人 | 5 |
| 北京斯沃德 | 4 |
| 北京万国 | 3 |
| 北京金汉 | 3 |
| 北京和信 | 2 |
| 临沂泰盛 | 1 |
| 北京张家瑰 | 1 |

## 核心字段映射

| 源字段 | 建议目标字段 | 含义 | 展示策略 |
|---|---|---|---|
| `eventshowrank` | `event_entries.display_rank` | 展示名次 | 可公开 |
| `eventrank` | `event_entries.final_rank` | 排序名次 | 可公开 |
| `fencer` | `athletes.display_name` | 运动员姓名 | 可公开但支持隐藏/纠错 |
| `licence` | `athlete_source_ids.source_licence` | 运动员注册号 | 不公开，仅内部消歧 |
| `noccode` | `clubs.name` | 代表单位/俱乐部 | 可公开 |
| `organname` | `clubs.source_organ_name` | 组织名称 | 当前为空 |
| `organcode` | `clubs.source_organ_code` | 组织编码 | 不公开 |
| `birthday` | `athlete_source_profiles.birthday` | 出生日期 | 不公开，未成年人敏感信息 |
| `medal` | `event_entries.medal` | 奖牌 | 可公开 |
| `statut` | `event_entries.source_status` | 源状态 | 内部保留 |
| `feventdispos` | `event_entries.source_position` | 源排序位置 | 可内部校验 |
| `points` | `event_entries.points` | 积分 | 当前为空 |
| `ecode` | `event_items.source_event_code` | 项目编码 | 可公开 |
| `qualifystatusid` | `event_entries.qualification_status` | 晋级/有效状态 | 可公开但含义待确认 |
| `members` | `event_entry_members.raw_members` | 团体成员 | 个人项目为空，团体项目需单独解析 |

## 字段完整率结论

完整率 100%：

- `eventshowrank`
- `eventrank`
- `fencer`
- `licence`
- `noccode`
- `statut`
- `feventdispos`
- `ecode`
- `qualifystatusid`

接近完整：

- `birthday`: 97.73%

低完整率或为空：

- `medal`: 9.09%，只在奖牌选手中有值
- `organname`
- `organcode`
- `valiable`
- `rid`
- `points`
- `itemtype`
- `members`

## 隐私规则

公开页建议展示：

- 名次
- 运动员姓名
- 俱乐部
- 奖牌

公开页默认不展示：

- `licence`
- `birthday`
- `organcode`

内部可以保留 `licence` 和 `birthday` 用于：

- 同名运动员消歧
- 年龄组校验
- 跨赛事运动员合并

但这些字段应设置为敏感字段，并支持隐藏、删除和纠错流程。

## 入库建议

`classmentrank` 应作为最终成绩表 `event_entries` 的来源。

建议唯一键：

```sql
unique(source_event_code, source_licence)
```

对于没有 licence 的记录，可退化为：

```sql
unique(source_event_code, display_name, club_name, final_rank)
```

## 与 projectlist 的关系

`classmentrank.ecode` 对应：

```text
projectlist.eventCode
```

本样本：

```text
RZSS2036022MFIU8
```

可以关联到 `projectlist` 中的：

```text
U8男子花剑个人
```

