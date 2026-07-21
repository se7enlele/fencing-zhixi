# 教练员 / 裁判员目录

前台已经支持搜索教练员和裁判员。真实数据需要手工维护到：

`data/analysis/officials.json`

推荐结构：

```json
{
  "coaches": [
    {
      "name": "姓名",
      "role": "教练员",
      "club": "俱乐部",
      "province": "省份",
      "city": "城市",
      "level": "公开资料",
      "competitionCount": 1
    }
  ],
  "referees": [
    {
      "name": "姓名",
      "role": "裁判员",
      "province": "省份",
      "city": "城市",
      "level": "公开资料",
      "competitionCount": 1
    }
  ]
}
```

导入前先运行：

```bash
npm run validate:officials -- data/analysis/officials.json
```

通过后再运行：

```bash
npm run cf:build-data
```

构建完成后，`web/data/public-data-search-0.json` 会包含 `coaches` 和 `referees`，前台数据库页即可搜索人员姓名、俱乐部、城市和角色。
