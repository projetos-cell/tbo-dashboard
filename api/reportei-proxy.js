// Vercel Serverless Function — CORS Proxy for Reportei API v2
// Routes: /api/reportei-proxy?endpoint=/projects
// Reportei API: app.reportei.com/api/v2
// Auth: API key stored in integration_configs (provider='reportei')
// Security: CORS whitelist, Supabase auth, rate limiting, path whitelist

const ALLOWED_ORIGINS = [
  'https://tbo-dashboard-main.vercel.app',
  'https://tbo-os.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

const ALLOWED_PATHS = [
  '/companies', '/projects', '/integrations', '/metrics',
  '/reports', '/dashboards', '/webhooks', '/timeline-events'
];

const rateLimiter = {};
const RATE_LIMIT = 60;
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(id) {
  const now = Date.now();
  if (!rateLimiter[id] || now > rateLimiter[id].resetAt) {
    rateLimiter[id] = { count: 1, resetAt: now + RATE_WINDOW };
    return true;
  }
  rateLimiter[id].count++;
  return rateLimiter[id].count <= RATE_LIMIT;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── Validate Supabase auth ──
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticacao ausente' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || 'https://olnndpultyllyhzxuyxh.supabase.co';
  const supabaseKey = process.env.SUPABASE_ANON_KEY
    || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sbm5kcHVsdHlsbHloenh1eXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyOTUxNjMsImV4cCI6MjA4Njg3MTE2M30.PPhMqKsYKcRB6GFmWxogcc0HIggkojK0DumiB1NDAXU';

  let user;
  try {
    const authRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'Authorization': authHeader, 'apikey': supabaseKey }
    });
    if (!authRes.ok) return res.status(401).json({ error: 'Token invalido' });
    user = await authRes.json();
    if (!user?.id) return res.status(401).json({ error: 'Usuario nao encontrado' });
  } catch (e) {
    return res.status(401).json({ error: 'Erro ao validar autenticacao' });
  }

  if (!checkRateLimit(user.id)) {
    return res.status(429).json({ error: 'Rate limit excedido' });
  }

  // ── Get Reportei API key from integration_configs ──
  let reporteiApiKey = req.headers['x-reportei-key'];
  if (!reporteiApiKey) {
    // Try to fetch from Supabase integration_configs
    try {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceKey) {
        const cfgRes = await fetch(
          `${supabaseUrl}/rest/v1/integration_configs?provider=eq.reportei&select=settings&limit=1`,
          { headers: { 'Authorization': `Bearer ${serviceKey}`, 'apikey': supabaseKey } }
        );
        if (cfgRes.ok) {
          const configs = await cfgRes.json();
          if (configs?.[0]?.settings?.api_key) {
            reporteiApiKey = configs[0].settings.api_key;
          }
        }
      }
    } catch (_e) { /* fallback to env */ }
  }
  if (!reporteiApiKey) reporteiApiKey = process.env.REPORTEI_API_KEY;
  if (!reporteiApiKey) reporteiApiKey = '1r7vHQhI4CC2ebTDDvrd30mvCyGtNnLj3zJWVTIa'; // fallback key

  // ── Validate endpoint ──
  const { endpoint } = req.query;
  if (!endpoint) return res.status(400).json({ error: 'Missing endpoint parameter' });

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  const rootPath = '/' + (cleanEndpoint.split('?')[0].split('/').filter(Boolean)[0] || '');
  if (!ALLOWED_PATHS.includes(rootPath)) {
    return res.status(400).json({ error: 'Path nao permitido' });
  }

  console.log(`[Reportei Proxy] ${req.method} ${cleanEndpoint} by user ${user.id}`);

  // ── Proxy to Reportei API v2 ──
  const baseUrl = 'https://app.reportei.com/api/v2';
  const url = `${baseUrl}${cleanEndpoint}`;

  try {
    const options = {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${reporteiApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      options.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(url, options);
    const text = await response.text();

    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 500) }; }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('[Reportei Proxy] Error:', error.message);
    return res.status(502).json({ error: 'Proxy request failed', message: error.message });
  }
}
