// Vercel Serverless Function — CORS Proxy for RD Station CRM API
// Routes: /api/rd-proxy?endpoint=/deals&token=xxx
// RD Station CRM API: crm.rdstation.com/api/v1 (plugcrm.net redirects here)
// Auth: token passed as query parameter

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { endpoint, token } = req.query;

  if (!endpoint || !token) {
    return res.status(400).json({ error: 'Missing endpoint or token parameter' });
  }

  // Use crm.rdstation.com directly (plugcrm.net 301s here)
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  const separator = cleanEndpoint.includes('?') ? '&' : '?';
  const url = `https://crm.rdstation.com/api/v1${cleanEndpoint}${separator}token=${token}`;

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
