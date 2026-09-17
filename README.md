# QY Browser Web

这是 QY Browser 的 Cloudflare Pages 静态站点。

## 本地预览

静态页面不需要构建：

```text
index.html
fp/news/index.html
fp/register/index.html
```

## 更新新闻快照

新闻页面从旧站点的公开页面导出为静态 HTML。发布新文章后，在项目根目录运行：

```powershell
node scripts/export-public-pages.mjs
```

脚本会生成 `/`、`/fp/news/`、每篇文章详情页、`/fp/register/`、帮助中心、协议、找回密码和两套开发文档。默认来源是 `https://usefullc.com`，也可以通过 `SOURCE_ORIGIN` 指定来源。

详情页默认复用已存在的静态快照，避免触发旧后端的阅读量自增；需要重新抓取详情时再设置 `REFRESH_DETAILS=1`。

## Cloudflare Pages API 代理

`worker.js` 会把 `/api/*` 转发到现有 FastAPI 服务，其余请求交给 Workers Static Assets。`functions/api/[[path]].js` 仍保留用于 Pages Functions 部署模式。

当前后端地址配置为：

```text
BACKEND_ORIGIN=https://api.usefullc.com
```

如果使用 Cloudflare Pages 而不是 Workers Static Assets，请在 Pages 的生产环境变量中设置同名变量。

后端仍然负责数据库、Redis、邮件验证码和短信验证码；Pages 只托管静态页面并代理 API。
