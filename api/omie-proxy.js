// Vercel Serverless Function — CORS Proxy for Omie ERP API
// Routes: /api/omie-proxy?endpoint=financas/contapagar/
// Omie API: app.omie.com.br/api/v1/ (JSON-RPC style, always POST)
// Auth: app_key + app_secret no corpo da requisicao

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Omie API requires POST' });
  }

  const { endpoint } = req.query;

  if (!endpoint) {
    return res.status(400).json({ error: 'Missing endpoint parameter' });
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `https://app.omie.com.br/api/v1/${cleanEndpoint}`;

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
