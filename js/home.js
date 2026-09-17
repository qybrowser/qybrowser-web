const list = document.querySelector('#article-list');
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

fetch('/fp/news/data.json')
  .then((response) => response.ok ? response.json() : Promise.reject(new Error('文章数据加载失败')))
  .then((articles) => {
    list.innerHTML = articles.map((article) => `<a class="article-card" href="/fp/news/${encodeURIComponent(article.id)}/"><div class="article-meta"><span>${escapeHtml(article.category)}</span><time>${escapeHtml(article.date)}</time></div><h3>${escapeHtml(article.title)}</h3>${article.summary ? `<p>${escapeHtml(article.summary)}</p>` : ''}</a>`).join('');
  })
  .catch(() => { list.innerHTML = '<p class="loading">文章暂时无法加载，请稍后再试。</p>'; });
