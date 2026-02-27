// Vercel Serverless Function — Reportei ETL Sync (inline)
// Schedule: daily at 06:00 UTC (vercel.json cron) + manual trigger
// Pulls social media metrics from Reportei API v2 → upserts into Supabase
// No dependency on Supabase Edge Functions.
//
// Reportei v2 flow:
//   1. GET /integrations → list connected social accounts
//   2. GET /metrics?integration_slug=xxx → list available metric definitions
//   3. POST /metrics/get-data → fetch actual metric values

const REPORTEI_BASE = 'https://app.reportei.com/api/v2';

const PLATFORM_MAP = {
  instagram: 'instagram',
  facebook: 'facebook',
  'facebook-pages': 'facebook',
  'facebook-ads': 'facebook',
  tiktok: 'tiktok',
  'tiktok-ads': 'tiktok',
  linkedin: 'linkedin',
  'linkedin-pages': 'linkedin',
  youtube: 'youtube',
  twitter: 'twitter',
  x: 'twitter',
  'google-analytics': 'google_analytics',
  'google-ads': 'google_ads',
  'google-business': 'google_business',
  pinterest: 'pinterest',
};

const METRIC_KEY_MAP = {
  followers: 'followers', followers_count: 'followers', total_followers: 'followers',
  following: 'following', following_count: 'following',
  posts: 'posts_count', posts_count: 'posts_count', media_count: 'posts_count',
  engagement: 'engagement_rate', engagement_rate: 'engagement_rate',
  reach: 'reach', total_reach: 'reach', accounts_reached: 'reach',
  impressions: 'impressions', total_impressions: 'impressions',
  clicks: 'clicks', website_clicks: 'clicks', profile_clicks: 'clicks',
  saves: 'saves', saved: 'saves',
  profile_views: 'profile_views', profile_visits: 'profile_views',
};

// ── Reportei HTTP helpers ──────────────────────────────────────────────────

async function reporteiGet(apiKey, endpoint) {
  const url = `${REPORTEI_BASE}${endpoint}`;
  console.log(`[reportei-sync] GET ${url}`);
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Reportei GET ${r.status}: ${txt.slice(0, 300)}`);
  }
  return r.json();
}

async function reporteiPost(apiKey, endpoint, body) {
  const url = `${REPORTEI_BASE}${endpoint}`;
  console.log(`[reportei-sync] POST ${url}`);
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Reportei POST ${r.status}: ${txt.slice(0, 300)}`);
  }
  return r.json();
}

// ── Supabase REST helper ───────────────────────────────────────────────────

function sbHeaders(serviceKey, anonKey) {
  return {
    Authorization: `Bearer ${serviceKey}`,
    apikey: anonKey,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
}

async function sbQuery(supabaseUrl, serviceKey, anonKey, path, opts = {}) {
  const url = `${supabaseUrl}/rest/v1/${path}`;
  const r = await fetch(url, {
    method: opts.method || 'GET',
    headers: {
      ...sbHeaders(serviceKey, anonKey),
      ...(opts.prefer ? { Prefer: opts.prefer } : {}),
      ...(opts.headers || {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { ok: r.ok, status: r.status, data };
}

// ── Mapping helpers ────────────────────────────────────────────────────────

function mapPlatform(raw) {
  const lower = (raw || '').toLowerCase();
  if (PLATFORM_MAP[lower]) return PLATFORM_MAP[lower];
  for (const [key, val] of Object.entries(PLATFORM_MAP)) {
    if (lower.includes(key)) return val;
  }
  return lower || 'other';
}

function extractMetricValues(metricsData, availableMetrics) {
  const result = {
    followers: 0, following: 0, posts_count: 0,
    engagement_rate: 0, reach: 0, impressions: 0,
    clicks: 0, saves: 0, profile_views: 0,
  };
  const idToKey = {};
  for (const m of availableMetrics) {
    if (m.id && m.reference_key) idToKey[String(m.id)] = m.reference_key.toLowerCase();
  }
  for (const [metricId, metricData] of Object.entries(metricsData)) {
    const refKey = idToKey[metricId];
    if (!refKey) continue;
    const dbCol = METRIC_KEY_MAP[refKey];
    if (!dbCol) continue;
    const val = (typeof metricData === 'object' && metricData !== null)
      ? (metricData.value ?? metricData.total ?? 0)
      : (typeof metricData === 'number' ? metricData : 0);
    result[dbCol] = parseFloat(String(val)) || 0;
  }
  return result;
}

// ── Main handler ───────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Auth: cron secret OR any Bearer token (user session)
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization || '';
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || 'https://olnndpultyllyhzxuyxh.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY
    || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sbm5kcHVsdHlsbHloenh1eXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyOTUxNjMsImV4cCI6MjA4Njg3MTE2M30.PPhMqKsYKcRB6GFmWxogcc0HIggkojK0DumiB1NDAXU';

  if (!serviceKey) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' });
  }

  const targetTenantId = req.query?.tenant_id || '';
  const daysBack = parseInt(req.query?.days || '7', 10);

  console.log(`[Reportei Sync] Starting inline ETL — tenant=${targetTenantId || 'ALL'}, days=${daysBack}`);

  try {
    // 1. Get tenants with Reportei integration configured
    let configPath = 'integration_configs?provider=eq.reportei&is_active=eq.true&select=tenant_id,settings';
    if (targetTenantId) configPath += `&tenant_id=eq.${targetTenantId}`;

    const { ok: cfgOk, data: configs } = await sbQuery(supabaseUrl, serviceKey, anonKey, configPath);
    if (!cfgOk || !Array.isArray(configs) || configs.length === 0) {
      return res.status(200).json({ message: 'Nenhuma integracao Reportei configurada', configs });
    }

    const results = {};

    for (const cfg of configs) {
      const apiKey = cfg.settings?.api_key;
      if (!apiKey) continue;

      const tenantId = cfg.tenant_id;
      const stats = { accounts_synced: 0, metrics_upserted: 0, errors: [] };

      // Create sync run log
      const { data: runArr } = await sbQuery(supabaseUrl, serviceKey, anonKey,
        'reportei_sync_runs?select=id', {
          method: 'POST',
          body: { tenant_id: tenantId, status: 'running' },
          prefer: 'return=representation',
        });
      const runId = Array.isArray(runArr) ? runArr[0]?.id : runArr?.id;

      try {
        // 2. Fetch integrations (social accounts) from Reportei v2
        const integrationsRes = await reporteiGet(apiKey, '/integrations?per_page=100');
        const integrations = integrationsRes?.data;

        if (!integrations || integrations.length === 0) {
          stats.errors.push('No integrations returned from Reportei');
        } else {
          for (const integ of integrations) {
            try {
              const platform = mapPlatform(integ.slug || integ.name || '');

              // Upsert account into rsm_accounts
              const { ok: acctOk, data: acctErr } = await sbQuery(supabaseUrl, serviceKey, anonKey,
                'rsm_accounts?on_conflict=reportei_account_id', {
                  method: 'POST',
                  body: {
                    tenant_id: tenantId,
                    reportei_account_id: String(integ.id),
                    platform,
                    handle: integ.name || String(integ.id),
                    profile_url: null,
                    followers_count: 0,
                    platform_id: String(integ.id),
                    is_active: integ.status === 'active' || integ.status === undefined,
                  },
                  prefer: 'resolution=merge-duplicates,return=representation',
                });

              if (!acctOk) {
                stats.errors.push(`Integration ${integ.id}: ${JSON.stringify(acctErr).slice(0, 200)}`);
                continue;
              }
              stats.accounts_synced++;

              // Get local account id
              const { data: localAccts } = await sbQuery(supabaseUrl, serviceKey, anonKey,
                `rsm_accounts?reportei_account_id=eq.${integ.id}&tenant_id=eq.${tenantId}&select=id&limit=1`);
              const localAcct = Array.isArray(localAccts) ? localAccts[0] : null;
              if (!localAcct) continue;

              // 3. Fetch available metrics for this integration
              const integSlug = integ.slug || '';
              if (!integSlug) {
                stats.errors.push(`Integration ${integ.id}: no slug, skipping metrics`);
                continue;
              }

              let availableMetrics = [];
              try {
                const metricsListRes = await reporteiGet(apiKey, `/metrics?integration_slug=${integSlug}&per_page=100`);
                availableMetrics = metricsListRes?.data || [];
              } catch (e) {
                stats.errors.push(`Metrics list for ${integSlug}: ${e.message}`);
              }
              if (availableMetrics.length === 0) continue;

              // 4. Fetch actual metric data
              const endDate = new Date().toISOString().split('T')[0];
              const startDate = new Date(Date.now() - daysBack * 86400000).toISOString().split('T')[0];

              try {
                const metricsData = await reporteiPost(apiKey, '/metrics/get-data', {
                  start: startDate,
                  end: endDate,
                  integration_id: integ.id,
                  metrics: availableMetrics,
                });

                if (metricsData) {
                  const metricValues = extractMetricValues(metricsData, availableMetrics);

                  const { ok: mOk, data: mErr } = await sbQuery(supabaseUrl, serviceKey, anonKey,
                    'rsm_metrics?on_conflict=account_id,date,source', {
                      method: 'POST',
                      body: {
                        tenant_id: tenantId,
                        account_id: localAcct.id,
                        date: endDate,
                        source: 'reportei',
                        followers: metricValues.followers ?? 0,
                        following: metricValues.following ?? 0,
                        posts_count: metricValues.posts_count ?? 0,
                        engagement_rate: metricValues.engagement_rate ?? 0,
                        reach: metricValues.reach ?? 0,
                        impressions: metricValues.impressions ?? 0,
                        clicks: metricValues.clicks ?? 0,
                        saves: metricValues.saves ?? 0,
                        profile_views: metricValues.profile_views ?? 0,
                        metadata: metricsData,
                      },
                      prefer: 'resolution=merge-duplicates,return=representation',
                    });

                  if (mOk) stats.metrics_upserted++;
                  else stats.errors.push(`Metric upsert ${integSlug}: ${JSON.stringify(mErr).slice(0, 200)}`);
                }
              } catch (e) {
                stats.errors.push(`Metrics data for ${integSlug}: ${e.message}`);
              }
            } catch (e) {
              stats.errors.push(`Integration ${integ.id}: ${e.message}`);
            }
          }
        }

        // Update sync run as completed
        if (runId) {
          await sbQuery(supabaseUrl, serviceKey, anonKey,
            `reportei_sync_runs?id=eq.${runId}`, {
              method: 'PATCH',
              body: {
                finished_at: new Date().toISOString(),
                status: stats.errors.length > 0 ? 'partial' : 'success',
                accounts_synced: stats.accounts_synced,
                metrics_upserted: stats.metrics_upserted,
                error_message: stats.errors.length > 0 ? stats.errors.join('; ') : null,
                details: stats,
              },
            });
        }
      } catch (e) {
        if (runId) {
          await sbQuery(supabaseUrl, serviceKey, anonKey,
            `reportei_sync_runs?id=eq.${runId}`, {
              method: 'PATCH',
              body: {
                finished_at: new Date().toISOString(),
                status: 'error',
                error_message: e.message,
              },
            });
        }
        stats.errors.push(e.message);
      }

      results[tenantId] = stats;
    }

    console.log('[Reportei Sync] Done:', JSON.stringify(results).slice(0, 500));
    return res.status(200).json({ message: 'Sync concluido', results });
  } catch (error) {
    console.error('[Reportei Sync] Fatal:', error.message);
    return res.status(500).json({ error: 'Sync failed', message: error.message });
  }
}
