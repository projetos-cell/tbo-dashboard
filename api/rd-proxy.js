// Vercel Serverless Function — CORS Proxy for RD Station CRM API
// Routes: /api/rd-proxy?endpoint=/deals&token=xxx
// RD Station CRM API: crm.rdstation.com/api/v1 (plugcrm.net redirects here)
// Auth: token passed as query parameter
// Seguranca: CORS whitelist, Supabase auth, rate limiting, path whitelist

// ── Whitelist de origens permitidas ──
const ALLOWED_ORIGINS = [
  'https://tbo-dashboard-main.vercel.app',
  'https://tbo-os.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

// ── Whitelist de paths RD Station permitidos ──
const ALLOWED_RD_PATHS = [
  '/deals', '/contacts', '/deal_stages', '/activities',
  '/tasks', '/organizations', '/products', '/deal_sources',
  '/campaigns', '/deal_pipelines', '/custom_fields', '/users'
];

// ── Rate limiting em memoria ──
const rateLimiter = {};
const RATE_LIMIT = 100; // requisicoes por minuto
const RATE_WINDOW = 60 * 1000; // 1 minuto

function checkRateLimit(identifier) {
  const now = Date.now();
  if (!rateLimiter[identifier]) {
    rateLimiter[identifier] = { count: 1, resetAt: now + RATE_WINDOW };
    return true;
  }
  if (now > rateLimiter[identifier].resetAt) {
    rateLimiter[identifier] = { count: 1, resetAt: now + RATE_WINDOW };
    return true;
  }
  rateLimiter[identifier].count++;
  return rateLimiter[identifier].count <= RATE_LIMIT;
}

export default async function handler(req, res) {
  // ── CORS com whitelist de origens ──
  const origin = req.headers.origin || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ── Validar token de autenticacao Supabase (via fetch direto, sem SDK) ──
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticacao ausente' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || 'https://olnndpultyllyhzxuyxh.supabase.co';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

  let user;
  try {
    const authRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': authHeader,
        'apikey': supabaseKey
      }
    });
    if (!authRes.ok) {
      return res.status(401).json({ error: 'Token invalido ou expirado' });
    }
    user = await authRes.json();
    if (!user || !user.id) {
      return res.status(401).json({ error: 'Usuario nao encontrado' });
    }
  } catch (e) {
    return res.status(401).json({ error: 'Erro ao validar autenticacao' });
  }

  // ── Rate limiting por usuario ──
  if (!checkRateLimit(user.id)) {
    return res.status(429).json({ error: 'Limite de requisicoes excedido. Tente novamente em 1 minuto.' });
  }

  // ── Validar parametros ──
  const { endpoint, token: rdToken } = req.query;

  if (!endpoint || !rdToken) {
    return res.status(400).json({ error: 'Missing endpoint or token parameter' });
  }

  // ── Validar path contra whitelist ──
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  const basePath = cleanEndpoint.split('?')[0]; // remover query params
  const pathSegments = basePath.split('/').filter(Boolean); // ex: ['deals', '123', 'products']
  const rootPath = '/' + (pathSegments[0] || '');

  if (!ALLOWED_RD_PATHS.includes(rootPath)) {
    return res.status(400).json({ error: 'Path nao permitido' });
  }

  // ── Logging ──
  console.log(`[API Proxy] ${req.method} ${cleanEndpoint} by user ${user.id}`);

  // Use crm.rdstation.com directly (plugcrm.net 301s here)
  const separator = cleanEndpoint.includes('?') ? '&' : '?';
  const url = `https://crm.rdstation.com/api/v1${cleanEndpoint}${separator}token=${rdToken}`;

  try {
    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      redirect: 'follow'
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      options.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(url, options);
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text.slice(0, 500) };
    }

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({
      error: 'Proxy request failed',
      message: error.message
    });
  }
}
