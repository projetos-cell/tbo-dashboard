// ============================================================================
// TBO OS — Edge Function: Reportei ETL Sync
// Pulls social media metrics from Reportei API → upserts into Supabase
// Trigger: Vercel Cron (daily) or manual call
// Query params: ?tenant_id=xxx (optional, syncs all if omitted)
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const REPORTEI_BASE_URL = "https://api.reportei.com/v2";

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
      .select("tenant_id, config_json")
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
      const apiKey = cfg.config_json?.api_key;
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
        // 2. Fetch accounts from Reportei
        const accounts = await fetchReportei(apiKey, "/social-accounts");
        if (!accounts?.data) {
          stats.errors.push("No accounts returned from Reportei");
        } else {
          for (const acct of accounts.data) {
            try {
              // Upsert account into rsm_accounts
              const platform = mapPlatform(acct.network || acct.type);
              const { error: acctErr } = await supabase
                .from("rsm_accounts")
                .upsert({
                  tenant_id: tenantId,
                  reportei_account_id: String(acct.id),
                  platform,
                  handle: acct.name || acct.username || acct.id,
                  profile_url: acct.url || null,
                  followers_count: acct.followers || 0,
                  platform_id: acct.external_id || null,
                  is_active: true,
                }, { onConflict: "reportei_account_id", ignoreDuplicates: false });

              if (acctErr) {
                stats.errors.push(`Account ${acct.id}: ${acctErr.message}`);
                continue;
              }
              stats.accounts_synced++;

              // Get the rsm_accounts id for this account
              const { data: localAcct } = await supabase
                .from("rsm_accounts")
                .select("id")
                .eq("reportei_account_id", String(acct.id))
                .eq("tenant_id", tenantId)
                .single();

              if (!localAcct) continue;

              // 3. Fetch metrics for the last N days
              const endDate = new Date().toISOString().split("T")[0];
              const startDate = new Date(Date.now() - daysBack * 86400000).toISOString().split("T")[0];

              const metricsData = await fetchReportei(
                apiKey,
                `/metrics?account_id=${acct.id}&start_date=${startDate}&end_date=${endDate}`
              );

              if (metricsData?.data) {
                for (const m of metricsData.data) {
                  const metricDate = m.date || endDate;
                  const { error: mErr } = await supabase
                    .from("rsm_metrics")
                    .upsert({
                      tenant_id: tenantId,
                      account_id: localAcct.id,
                      date: metricDate,
                      source: "reportei",
                      followers: m.followers ?? 0,
                      following: m.following ?? 0,
                      posts_count: m.posts_count ?? 0,
                      engagement_rate: m.engagement_rate ?? 0,
                      reach: m.reach ?? 0,
                      impressions: m.impressions ?? 0,
                      clicks: m.clicks ?? 0,
                      saves: m.saves ?? 0,
                      profile_views: m.profile_views ?? 0,
                      metadata: m,
                    }, { onConflict: "account_id,date,source", ignoreDuplicates: false });

                  if (!mErr) stats.metrics_upserted++;
                  else stats.errors.push(`Metric ${metricDate}: ${mErr.message}`);
                }
              }

              // 4. Fetch recent posts
              const postsData = await fetchReportei(
                apiKey,
                `/posts?account_id=${acct.id}&start_date=${startDate}&end_date=${endDate}`
              );

              if (postsData?.data) {
                for (const post of postsData.data) {
                  const { error: pErr } = await supabase
                    .from("rsm_posts")
                    .upsert({
                      tenant_id: tenantId,
                      account_id: localAcct.id,
                      external_post_id: String(post.id),
                      title: (post.caption || post.text || "").substring(0, 200),
                      content: post.caption || post.text || "",
                      type: mapPostType(post.type),
                      status: "published",
                      published_date: post.published_at || post.created_at,
                      source: "reportei",
                      metrics: {
                        likes: post.likes ?? 0,
                        comments: post.comments ?? 0,
                        shares: post.shares ?? 0,
                        reach: post.reach ?? 0,
                        impressions: post.impressions ?? 0,
                      },
                    }, { onConflict: "account_id,external_post_id", ignoreDuplicates: false });

                  if (!pErr) stats.posts_upserted++;
                }
              }
            } catch (e) {
              stats.errors.push(`Account ${acct.id}: ${e.message}`);
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
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reportei ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

function mapPlatform(raw: string): string {
  const map: Record<string, string> = {
    instagram: "instagram",
    facebook: "facebook",
    tiktok: "tiktok",
    linkedin: "linkedin",
    youtube: "youtube",
    twitter: "twitter",
    x: "twitter",
  };
  return map[(raw || "").toLowerCase()] || "instagram";
}

function mapPostType(raw: string): string {
  const map: Record<string, string> = {
    image: "feed",
    video: "reel",
    carousel: "carousel",
    story: "story",
    reel: "reel",
  };
  return map[(raw || "").toLowerCase()] || "feed";
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
