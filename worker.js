const allowedOrigins = new Set(['https://usefullc.com', 'https://www.usefullc.com']);

function corsHeaders(request) {
  const headers = {
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  };
  const origin = request.headers.get('Origin');
  if (allowedOrigins.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

async function proxyApi(request, env) {
  const headers = corsHeaders(request);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (!env.BACKEND_ORIGIN) return new Response('BACKEND_ORIGIN is not configured', { status: 500, headers });

  const source = new URL(request.url);
  const backend = new URL(`${source.pathname}${source.search}`, env.BACKEND_ORIGIN);
  const forwardHeaders = new Headers(request.headers);
  forwardHeaders.delete('host');
  const response = await fetch(backend, {
    method: request.method,
    headers: forwardHeaders,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    redirect: 'manual',
  });
  const responseHeaders = new Headers(response.headers);
  Object.entries(headers).forEach(([key, value]) => responseHeaders.set(key, value));
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: responseHeaders });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api' || pathname.startsWith('/api/')) return proxyApi(request, env);
    return env.ASSETS.fetch(request);
  },
};
