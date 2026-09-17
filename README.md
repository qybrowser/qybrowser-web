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

脚本会生成 `/fp/news/`、每篇文章详情页和 `/fp/register/` 页面。默认来源是 `https://usefullc.com`，也可以通过 `SOURCE_ORIGIN` 指定来源。

## Cloudflare Pages API 代理

`functions/api/[[path]].js` 会把 `/api/*` 转发到现有 FastAPI 服务。需要在 Cloudflare Pages 的生产环境变量中设置：

```text
BACKEND_ORIGIN=https://你的后端域名
```

后端仍然负责数据库、Redis、邮件验证码和短信验证码；Pages 只托管静态页面并代理 API。
