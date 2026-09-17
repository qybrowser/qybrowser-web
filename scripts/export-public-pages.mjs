import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const origin = process.env.SOURCE_ORIGIN || 'https://usefullc.com';
const root = process.cwd();
const decode = (value = '') => value.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&#39;', "'").trim();
const strip = (value = '') => decode(value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' '));
const escape = (value = '') => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
async function get(path) { const response = await fetch(new URL(path, origin)); if (!response.ok) throw new Error(`${path}: ${response.status}`); return response.text(); }
async function getBytes(path) { const response = await fetch(new URL(path, origin)); if (!response.ok) throw new Error(`${path}: ${response.status}`); return Buffer.from(await response.arrayBuffer()); }
function parseArticles(html) {
  return [...html.matchAll(/<article[\s\S]*?<\/article>/gi)].map(({ 0: card }) => {
    const id = card.match(/\/fp\/news\/(\d+)/)?.[1];
    const image = card.match(/<img[^>]+src="([^"]+)"/)?.[1] || '';
    const title = strip(card.match(/<h2[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i)?.[1]);
    const category = strip(card.match(/<span[^>]*>([^<]+)<\/span>/i)?.[1]);
    const date = strip(card.match(/<span[^>]*text-slate-400[^>]*>([^<]+)<\/span>/i)?.[1]);
    const summary = strip(card.match(/<p[^>]*line-clamp-2[^>]*>([\s\S]*?)<\/p>/i)?.[1]);
    const views = strip(card.match(/<span[^>]*text-slate-400[^>]*>([^<]*次阅读)<\/span>/i)?.[1]);
    return id && title ? { id, image, title, category, date, summary, views } : null;
  }).filter(Boolean);
}
const articles = [];
for (let page = 1; page <= 100; page += 1) {
  const found = parseArticles(await get(`/fp/news?page=${page}`));
  if (!found.length) break;
  for (const article of found) if (!articles.some((item) => item.id === article.id)) articles.push(article);
}
const cards = articles.map((article) => `<article class="news-card">${article.image ? `<img src="${escape(article.image)}" alt="${escape(article.title)}" loading="lazy">` : '<div class="news-placeholder">QY</div>'}<div class="news-card-body"><div class="meta"><span>${escape(article.category)}</span><time>${escape(article.date)}</time></div><h2><a href="/fp/news/${article.id}/">${escape(article.title)}</a></h2>${article.summary ? `<p>${escape(article.summary)}</p>` : ''}<div class="card-footer"><small>${escape(article.views)}</small><a href="/fp/news/${article.id}/">阅读全文 →</a></div></div></article>`).join('');
const categories = [...new Set(articles.map(({ category }) => category).filter(Boolean))];
const buttons = ['全部', ...categories].map((category) => `<button type="button" data-category="${category}">${category}</button>`).join('');
const page = `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="启元指纹浏览器最新资讯、产品动态与行业解读"><title>新闻资讯 · QY Browser</title><link rel="stylesheet" href="/css/style.css"></head><body><header class="site-header"><a class="brand" href="/">QY<span>Browser</span></a><nav class="nav"><a href="/#features">特性</a><a href="/about.html">关于我们</a><a href="/products.html">产品</a><a href="/fp/news/">新闻资讯</a><a class="nav-button" href="/fp/register/">免费注册</a></nav></header><main class="news-page"><p class="eyebrow">NEWS</p><h1>新闻资讯</h1><p class="lead">了解 QY Browser 最新动态、行业资讯与产品解读。</p><div class="news-filters">${buttons}</div><div class="news-grid">${cards}</div><p class="snapshot-note">本文档为静态快照，内容更新后重新运行导出脚本即可同步。</p></main><footer><span>© 2026 QY Browser</span><span>Made for a calmer web.</span></footer><script>document.querySelectorAll('[data-category]').forEach((button)=>button.addEventListener('click',()=>{const value=button.dataset.category;document.querySelectorAll('.news-card').forEach((card)=>{card.hidden=value!=='全部'&&!card.querySelector('.meta span').textContent.includes(value)});document.querySelectorAll('[data-category]').forEach((item)=>item.classList.toggle('active',item===button))}));</script></body></html>`;
await mkdir(join(root, 'fp', 'news'), { recursive: true });
const customizedPage = page
  .replace('<nav class="nav"><a href="/#features">特性</a><a href="/about.html">关于我们</a><a href="/products.html">产品</a>', '<nav class="nav"><a href="/">首页</a><a href="/#features">特性</a>')
  .replace('<span>© 2026 QY Browser</span><span>Made for a calmer web.</span>', '<span>© 2026 QY Browser</span>');
await writeFile(join(root, 'fp', 'news', 'index.html'), customizedPage, 'utf8');
await writeFile(join(root, 'fp', 'news', 'data.json'), JSON.stringify(articles, null, 2), 'utf8');
for (const article of articles) {
  await mkdir(join(root, 'fp', 'news', article.id), { recursive: true });
  const detailPath = join(root, 'fp', 'news', article.id, 'index.html');
  if (process.env.REFRESH_DETAILS === '1') {
    await writeFile(detailPath, await get(`/fp/news/${article.id}`), 'utf8');
  } else {
    try { await readFile(detailPath, 'utf8'); } catch { await writeFile(detailPath, await get(`/fp/news/${article.id}`), 'utf8'); }
  }
}
await mkdir(join(root, 'fp', 'register'), { recursive: true });
await writeFile(join(root, 'fp', 'register', 'index.html'), await get('/fp/register'), 'utf8');
const snapshots = {
  '/': 'index.html',
  '/fp/help': 'fp/help/index.html',
  '/fp/privacy': 'fp/privacy/index.html',
  '/fp/reset-password': 'fp/reset-password/index.html',
  '/fp/terms': 'fp/terms/index.html',
  '/fp/docs/api': 'fp/docs/api/index.html',
  '/fp/docs/qiyuan-sdk': 'fp/docs/qiyuan-sdk/index.html',
  '/s.js': 's.js',
};
for (const [source, target] of Object.entries(snapshots)) {
  const targetPath = join(root, target);
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, await get(source), 'utf8');
}
const assetRefs = new Set();
for (const pagePath of ['fp/help/index.html', 'fp/docs/qiyuan-sdk/index.html']) {
  const html = await readFile(join(root, pagePath), 'utf8');
  for (const match of html.matchAll(/\/help-images\/[^"' )]+/g)) assetRefs.add(match[0]);
}
for (const asset of assetRefs) {
  const targetPath = join(root, asset);
  await mkdir(dirname(targetPath), { recursive: true });
  try { await readFile(targetPath); } catch { await writeFile(targetPath, await getBytes(asset)); }
}
console.log(`Exported ${articles.length} news articles and the register page from ${origin}`);
