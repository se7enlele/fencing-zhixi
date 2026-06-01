# 阶段 0 数据验证说明

## 当前结论

官方前端是前后端分离架构，结果页会通过 `/fencingapi` 下的接口读取赛事详情、项目列表和成绩数据。

已定位到的候选接口包括：

- `/fencingapi/competition/frontsporteventbyid/{sportId}`
- `/fencingapi/competition/projectlist?sportId={sportId}`
- `/fencingapi/matchresult/{sportId}/{eventCode}`
- `/Resource/score/{eventCode}.js`

但是直接使用命令行请求接口时，服务端返回 403，并明确提示存在 WAF 拦截和反爬识别：

- `请求被 WAF 拦截`
- `AI反爬模型判定`

因此第一版验证工具不继续伪装或绕过反爬，而是支持导入浏览器 Network 面板保存的 JSON 或 HAR 文件，做字段识别、数据质量检查和标准化样本分析。

## 如何导出样本

1. 在浏览器打开官方结果页。
2. 打开开发者工具的 Network 面板。
3. 切换到 Fetch/XHR。
4. 刷新页面。
5. 找到结果相关请求，例如 `matchresult`、`projectlist`、`frontsporteventbyid` 或 `Resource/score`。
6. 右键保存响应 JSON，或保存整个 HAR。
7. 放入 `data/samples/` 目录。

## 分析命令

```bash
node tools/analyze-sample.mjs --input data/samples/example.har --url 'https://fencing.yy-sport.com.cn/#/game/result?id=101199&eventCode=RZSS2035112MFIU10'
```

如果是单个 JSON 响应：

```bash
node tools/analyze-sample.mjs --input data/samples/matchresult-101199-RZSS2035112MFIU10.json --url 'https://fencing.yy-sport.com.cn/#/game/result?id=101199&eventCode=RZSS2035112MFIU10'
```

分析结果会输出到 `data/analysis/`。

## 需要验证的字段

赛事维度：

- 赛事 ID
- 赛事名称
- 城市
- 场馆
- 报名时间
- 比赛时间

项目维度：

- eventCode
- 项目名称
- 剑种
- 年龄组
- 性别组
- 个人/团体

排名维度：

- 名次
- 运动员姓名
- 俱乐部或代表单位
- 积分
- 最终阶段

对阵维度：

- 轮次
- 对阵顺序
- 运动员 A
- 运动员 B
- A 得分
- B 得分
- 胜者

## 产品风险记录

自动化采集不能作为第一版唯一依赖，原因：

- 接口存在 WAF 和反爬识别。
- 数据可能涉及未成年人。
- 商业化使用公开数据需要明确最小化展示、删除通道和监护人认领机制。

阶段 0 的目标应调整为：

- 先用人工导出的样本验证字段完整度。
- 建立标准化数据模型。
- 评估哪些数据适合公开展示。
- 再决定是否寻求官方授权、合作接口或用户授权导入。
