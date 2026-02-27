// Vercel Cron Endpoint — Triggers Reportei ETL sync
// Schedule: daily at 06:00 UTC (vercel.json cron)
// Calls the Supabase Edge Function: reportei-sync

export default async function handler(req, res) {
  // Only allow GET (cron) and POST (manual trigger)
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify cron secret (Vercel injects CRON_SECRET header)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers['authorization'] !== `Bearer ${cronSecret}`) {
    // Allow if called from Supabase service role or manual trigger with valid auth
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL || 'https://olnndpultyllyhzxuyxh.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' });
  }

  const tenantId = req.query?.tenant_id || '';
  const days = req.query?.days || '7';
  const fnUrl = `${supabaseUrl}/functions/v1/reportei-sync?days=${days}${tenantId ? `&tenant_id=${tenantId}` : ''}`;

  console.log(`[Reportei Sync] Triggering ETL: ${fnUrl}`);

  try {
    const response = await fetch(fnUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log(`[Reportei Sync] Result:`, JSON.stringify(data).slice(0, 500));

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('[Reportei Sync] Error:', error.message);
    return res.status(502).json({ error: 'Failed to trigger sync', message: error.message });
  }
}
