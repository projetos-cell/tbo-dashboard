// ============================================================================
// TBO OS — Edge Function: Reportei ETL Sync (v2 API)
// Pulls social media metrics from Reportei API v2 → upserts into Supabase
// Trigger: Vercel Cron (daily) or manual call
// Query params: ?tenant_id=xxx (optional, syncs all if omitted)
//
// Reportei v2 flow:
//   1. GET /integrations → list connected social accounts
//   2. GET /metrics?integration_slug=xxx → list available metric definitions
//   3. POST /metrics/get-data → fetch actual metric values
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const REPORTEI_BASE_URL = "https://app.reportei.com/api/v2";

interface SyncStats {
  accounts_synced: number;
  metrics_upserted: number;
  posts_upserted: number;
  errors: string[];
}

serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const targetTenantId = url.searchParams.get("tenant_id");
    const daysBack = parseInt(url.searchParams.get("days") || "7");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Get all tenants with Reportei integration configured
    let configQuery = supabase
      .from("integration_configs")
      .select("tenant_id, settings")
      .eq("provider", "reportei")
      .eq("is_active", true);

    if (targetTenantId) {
      configQuery = configQuery.eq("tenant_id", targetTenantId);
    }

    const { data: configs, error: cfgError } = await configQuery;
    if (cfgError || !configs || configs.length === 0) {
      return jsonResponse({
        message: "Nenhuma integracao Reportei configurada",
        error: cfgError?.message,
      });
    }

    const results: Record<string, SyncStats> = {};

    for (const cfg of configs) {
      const apiKey = cfg.settings?.api_key;
      if (!apiKey) continue;

      const tenantId = cfg.tenant_id;
      const stats: SyncStats = { accounts_synced: 0, metrics_upserted: 0, posts_upserted: 0, errors: [] };

      // Create sync run log
      const { data: run } = await supabase
        .from("reportei_sync_runs")
        .insert({ tenant_id: tenantId, status: "running" })
        .select("id")
        .single();

      const runId = run?.id;

      try {
        // 2. Fetch integrations (social accounts) from Reportei v2
        const integrationsRes = await fetchReportei(apiKey, "/integrations?per_page=100");
        const integrations = integrationsRes?.data;

        if (!integrations || integrations.length === 0) {
          stats.errors.push("No integrations returned from Reportei");
        } else {
          for (const integ of integrations) {
            try {
              // Map integration to platform
              const platform = mapPlatform(integ.slug || integ.name || "");

              // Upsert account into rsm_accounts
              const { error: acctErr } = await supabase
                .from("rsm_accounts")
                .upsert({
                  tenant_id: tenantId,
                  reportei_account_id: String(integ.id),
                  platform,
                  handle: integ.name || String(integ.id),
                  profile_url: null,
                  followers_count: 0,
                  platform_id: String(integ.id),
                  is_active: integ.status === "active" || integ.status === undefined,
                }, { onConflict: "reportei_account_id", ignoreDuplicates: false });

              if (acctErr) {
                stats.errors.push(`Integration ${integ.id}: ${acctErr.message}`);
                continue;
              }
              stats.accounts_synced++;

              // Get the rsm_accounts id for this integration
              const { data: localAcct } = await supabase
                .from("rsm_accounts")
                .select("id")
                .eq("reportei_account_id", String(integ.id))
                .eq("tenant_id", tenantId)
                .single();

              if (!localAcct) continue;

              // 3. Fetch available metrics for this integration
              const integSlug = integ.slug || "";
              if (!integSlug) {
                stats.errors.push(`Integration ${integ.id}: no slug, skipping metrics`);
                continue;
              }

              let availableMetrics: any[] = [];
              try {
                const metricsListRes = await fetchReportei(apiKey, `/metrics?integration_slug=${integSlug}&per_page=100`);
                availableMetrics = metricsListRes?.data || [];
              } catch (e) {
                stats.errors.push(`Metrics list for ${integSlug}: ${e.message}`);
              }

              if (availableMetrics.length === 0) continue;

              // 4. Fetch actual metric data via POST /metrics/get-data
              const endDate = new Date().toISOString().split("T")[0];
              const startDate = new Date(Date.now() - daysBack * 86400000).toISOString().split("T")[0];

              try {
                const metricsData = await fetchReporteiPost(apiKey, "/metrics/get-data", {
                  start: startDate,
                  end: endDate,
                  integration_id: integ.id,
                  metrics: availableMetrics,
                });

                if (metricsData) {
                  // Parse the metrics response — it returns an object with metric IDs as keys
                  const metricValues = extractMetricValues(metricsData, availableMetrics);

                  // Upsert a single daily metric snapshot
                  const { error: mErr } = await supabase
                    .from("rsm_metrics")
                    .upsert({
                      tenant_id: tenantId,
                      account_id: localAcct.id,
                      date: endDate,
                      source: "reportei",
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
                    }, { onConflict: "account_id,date,source", ignoreDuplicates: false });

                  if (!mErr) stats.metrics_upserted++;
                  else stats.errors.push(`Metric upsert ${integSlug}: ${mErr.message}`);
                }
              } catch (e) {
                stats.errors.push(`Metrics data for ${integSlug}: ${e.message}`);
              }

            } catch (e) {
              stats.errors.push(`Integration ${integ.id}: ${e.message}`);
            }
          }
        }

        // Update sync run
        if (runId) {
          await supabase.from("reportei_sync_runs").update({
            finished_at: new Date().toISOString(),
            status: stats.errors.length > 0 ? "partial" : "success",
            accounts_synced: stats.accounts_synced,
            metrics_upserted: stats.metrics_upserted,
            posts_upserted: stats.posts_upserted,
            error_message: stats.errors.length > 0 ? stats.errors.join("; ") : null,
            details: stats,
          }).eq("id", runId);
        }
      } catch (e) {
        if (runId) {
          await supabase.from("reportei_sync_runs").update({
            finished_at: new Date().toISOString(),
            status: "error",
            error_message: e.message,
          }).eq("id", runId);
        }
        stats.errors.push(e.message);
      }

      results[tenantId] = stats;
    }

    return jsonResponse({ message: "Sync concluido", results });
  } catch (err) {
    console.error("[reportei-sync] Fatal:", err);
    return jsonResponse({ error: err.message }, 500);
  }
});

// ── Helpers ──────────────────────────────────────────────────────────────────

async function fetchReportei(apiKey: string, endpoint: string): Promise<any> {
  const url = `${REPORTEI_BASE_URL}${endpoint}`;
  console.log(`[reportei-sync] GET ${url}`);
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reportei GET ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function fetchReporteiPost(apiKey: string, endpoint: string, body: unknown): Promise<any> {
  const url = `${REPORTEI_BASE_URL}${endpoint}`;
  console.log(`[reportei-sync] POST ${url}`);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reportei POST ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

/**
 * Extract standard metric values from Reportei's metrics/get-data response.
 * The response is an object keyed by metric ID with { value, comparison } objects.
 * We map known reference_keys to our DB columns.
 */
function extractMetricValues(
  metricsData: Record<string, any>,
  availableMetrics: any[]
): Record<string, number> {
  const result: Record<string, number> = {
    followers: 0,
    following: 0,
    posts_count: 0,
    engagement_rate: 0,
    reach: 0,
    impressions: 0,
    clicks: 0,
    saves: 0,
    profile_views: 0,
  };

  // Build a map: metric ID → reference_key
  const idToKey: Record<string, string> = {};
  for (const m of availableMetrics) {
    if (m.id && m.reference_key) {
      idToKey[String(m.id)] = m.reference_key.toLowerCase();
    }
  }

  // Map known reference keys to our DB columns
  const keyMap: Record<string, string> = {
    followers: "followers",
    followers_count: "followers",
    total_followers: "followers",
    following: "following",
    following_count: "following",
    posts: "posts_count",
    posts_count: "posts_count",
    media_count: "posts_count",
    engagement: "engagement_rate",
    engagement_rate: "engagement_rate",
    reach: "reach",
    total_reach: "reach",
    accounts_reached: "reach",
    impressions: "impressions",
    total_impressions: "impressions",
    clicks: "clicks",
    website_clicks: "clicks",
    profile_clicks: "clicks",
    saves: "saves",
    saved: "saves",
    profile_views: "profile_views",
    profile_visits: "profile_views",
  };

  // Extract values from the response
  for (const [metricId, metricData] of Object.entries(metricsData)) {
    const refKey = idToKey[metricId];
    if (!refKey) continue;

    const dbColumn = keyMap[refKey];
    if (!dbColumn) continue;

    const value = typeof metricData === "object" && metricData !== null
      ? (metricData.value ?? metricData.total ?? 0)
      : (typeof metricData === "number" ? metricData : 0);

    result[dbColumn] = parseFloat(String(value)) || 0;
  }

  return result;
}

function mapPlatform(raw: string): string {
  const lower = (raw || "").toLowerCase();
  const map: Record<string, string> = {
    instagram: "instagram",
    facebook: "facebook",
    "facebook-pages": "facebook",
    "facebook-ads": "facebook",
    tiktok: "tiktok",
    "tiktok-ads": "tiktok",
    linkedin: "linkedin",
    "linkedin-pages": "linkedin",
    youtube: "youtube",
    twitter: "twitter",
    x: "twitter",
    "google-analytics": "google_analytics",
    "google-ads": "google_ads",
    "google-business": "google_business",
    pinterest: "pinterest",
  };
  // Try exact match first, then partial
  if (map[lower]) return map[lower];
  for (const [key, val] of Object.entries(map)) {
    if (lower.includes(key)) return val;
  }
  return lower || "other";
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
