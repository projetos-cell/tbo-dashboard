// Vercel Serverless Function — CORS Proxy for Omie ERP API
// Routes: /api/omie-proxy?endpoint=financas/contapagar/
// Omie API: app.omie.com.br/api/v1/ (JSON-RPC style, always POST)
// Auth: app_key + app_secret no corpo da requisicao
// Seguranca: CORS whitelist, Supabase auth, rate limiting, endpoint whitelist

// ── Whitelist de origens permitidas ──
const ALLOWED_ORIGINS = [
  'https://tbo-dashboard-main.vercel.app',
  'https://tbo-os.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

// ── Whitelist de endpoints Omie permitidos ──
const ALLOWED_OMIE_ENDPOINTS = [
  'financas/contapagar/',
  'financas/contareceber/',
  'geral/clientes/',
  'geral/categorias/',
  'financas/mf/',
  'financas/contacorrente/',
  'financas/pesquisartitulos/'
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Omie API requires POST' });
  }

  // ── Validar token de autenticacao Supabase (via fetch direto, sem SDK) ──
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticacao ausente' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || 'https://olnndpultyllyhzxuyxh.supabase.co';
  // Anon key e publica por design — fallback hardcoded para quando env var nao esta definida
  const supabaseKey = process.env.SUPABASE_ANON_KEY
    || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sbm5kcHVsdHlsbHloenh1eXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyOTUxNjMsImV4cCI6MjA4Njg3MTE2M30.PPhMqKsYKcRB6GFmWxogcc0HIggkojK0DumiB1NDAXU';

  let user;
  try {
    const authRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': authHeader,
        'apikey': apiKey
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

  // ── Validar endpoint contra whitelist ──
  const { endpoint } = req.query;

  if (!endpoint) {
    return res.status(400).json({ error: 'Missing endpoint parameter' });
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  if (!ALLOWED_OMIE_ENDPOINTS.some(e => cleanEndpoint.startsWith(e))) {
    return res.status(400).json({ error: 'Endpoint nao permitido' });
  }

  const url = `https://app.omie.com.br/api/v1/${cleanEndpoint}`;

  // ── Logging ──
  console.log(`[API Proxy] ${req.method} ${cleanEndpoint} by user ${user.id}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    });

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
      error: 'Omie proxy request failed',
      message: error.message
    });
  }
}
