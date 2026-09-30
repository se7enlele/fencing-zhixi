# 页面跳转与账号流程阶段发布（2026-09-30）

已发布到 https://fencingai.uk/ 和 https://www.fencingai.uk/ 。

- 发布代码：`44c50d8c`，包括此前成长页面修复提交 `8bcede9c`。
- Cloudflare Worker 版本：`a1311042-a413-4468-a8be-603e2470ac73`。
- 已启用 AccountVerification Durable Object 绑定及首次 SQLite migration。

## 行为

运动员画像“查看成长分析”按运动员 ID 打开独立成长报告；对手比较在专项分析页展示。分享成长页、最近分析复看、页面刷新、应用返回以及浏览器前进/后退恢复相应页面和对象。首页保留赛事与日历入口。

“我的”采用未登录与登录状态的独立展示。登录、邮箱注册、邮箱密码重置和旧账号找回邮箱绑定具有各自流程；登录不再隐式创建账号。旧手机号密码记录和已有关注资料保持兼容。密码重置测试验证了旧会话失效和资料保留。

## 已验证

- 全套 `npm run smoke` 通过，含账号 HTTP、验证码安全和导航历史新增回归；Cloudflare build、dry-run、实际 deploy 均成功。
- 生产 Playwright 移动视口检查：蔡廷彧画像 → 9 场成长报告 → 浏览器后退/前进 → 顶部返回；蔡廷彧 vs 马潇比较及前进、刷新恢复；马潇独立成长报告展示 14 场记录。
- 生产赛事 RZSS2034020 → 项目 RZSS2034020MFIU10 → 浏览器后退/前进，地址与页面对象一致。
- 生产“我的” → 登录 → 注册 → 浏览器后退 → 找回密码 → 刷新；密码显隐有效，390 px 账号页无横向溢出，未出现脚本异常。
- 8 个线上 HTML/JS/CSS 资源 SHA256 与发布目录一致。
- 发布前后数据基线一致：753 场赛事、2913 个成绩包、28114 名选手、847 家俱乐部，`generatedAt=2026-09-28T12:39:21.809Z`。

接口及资源核对结果保存在本地 `analysis-output/navigation-live-verification.json`；生产账号页截图为 `analysis-output/navigation-account-mobile.png`。可重复浏览器验收脚本为 `tools/navigation-browser-check.js`（以当前浏览器网址作为测试站点）。

## 仍需配置

生产 `/api/auth/config` 返回 `emailVerification=false`。当前没有 `RESEND_API_KEY` 与已验证的 `AUTH_EMAIL_FROM`，真实验证码邮件未开通，也未进行真实邮件收发验收。注册/重置/找回邮箱页面会显示“暂未开放”并禁用相关提交，已有账号登录继续可用。补齐邮件配置后需另行验证邮件送达和真实注册/重置。

浏览器验收使用移动视口；真实手机触控与微信客户端尚未验证。微信授权登录尚未接入。
