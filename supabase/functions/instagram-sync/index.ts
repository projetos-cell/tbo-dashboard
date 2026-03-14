// ============================================================================
// TBO OS — Edge Function: Instagram Graph API Sync
// Pulls account metrics, audience demographics, and media insights
// directly from Instagram Graph API → upserts into Supabase rsm_* tables
//
// Trigger: Manual (POST /instagram-sync?tenant_id=xxx) or cron
// Token: Stored in integration_configs (provider='instagram')
//
// Instagram Graph API v21.0 endpoints:
//   GET /{ig-user-id}                → account profile
//   GET /{ig-user-id}/insights       → account-level metrics
//   GET /{ig-user-id}/media          → recent media list
//   GET /{ig-media-id}/insights      → per-media metrics
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const IG_GRAPH_URL = "https://graph.facebook.com/v21.0";

// Rate-limit: Instagram allows ~200 calls/user/hour → 500ms between requests
const REQUEST_DELAY_MS = 500;

interface SyncStats {
  accounts_synced: number;
  metrics_upserted: number;
  posts_upserted: number;
  errors: string[];
}

interface IgInsightValue {
  value: number | Record<string, unknown>;
  end_time?: string;
}

interface IgInsightEntry {
  name: string;
  period: string;
  values: IgInsightValue[];
  title?: string;
  total_value?: { value: number | Record<string, unknown>; breakdowns?: unknown[] };
}

serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const targetTenantId = url.searchParams.get("tenant_id");
    const daysBack = parseInt(url.searchParams.get("days") || "7");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Get tenants with Instagram integration configured
    let configQuery = supabase
      .from("integration_configs")
      .select("tenant_id, settings")
      .eq("provider", "instagram")
      .eq("is_active", true);

    if (targetTenantId) {
      configQuery = configQuery.eq("tenant_id", targetTenantId);
    }

    const { data: configs, error: cfgError } = await configQuery;
    if (cfgError || !configs || configs.length === 0) {
      return jsonResponse({
        message: "Nenhuma integracao Instagram configurada",
        error: cfgError?.message,
      });
    }

    const results: Record<string, SyncStats> = {};

    for (const cfg of configs) {
      const settings = cfg.settings as Record<string, unknown> | null;
      const accessToken = settings?.access_token as string | undefined;
      const igUserId = settings?.ig_user_id as string | undefined;

      if (!accessToken || !igUserId) {
        results[cfg.tenant_id] = {
          accounts_synced: 0,
          metrics_upserted: 0,
          posts_upserted: 0,
          errors: ["Missing access_token or ig_user_id in settings"],
        };
        continue;
      }

      const tenantId = cfg.tenant_id;
      const stats: SyncStats = {
        accounts_synced: 0,
        metrics_upserted: 0,
        posts_upserted: 0,
        errors: [],
      };

      try {
        // ── Sync Account Profile ────────────────────────────────────────
        const profile = await igGet(
          accessToken,
          `/${igUserId}?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count`
        );

        const { error: acctErr } = await supabase.from("rsm_accounts").upsert(
          {
            tenant_id: tenantId,
            platform: "instagram",
            platform_id: String(profile.id),
            handle: profile.username || profile.name || String(profile.id),
            profile_url: `https://instagram.com/${profile.username || ""}`,
            followers_count: profile.followers_count ?? 0,
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "tenant_id,platform,platform_id" }
        );

        if (acctErr) {
          stats.errors.push(`Account upsert: ${acctErr.message}`);
        } else {
          stats.accounts_synced++;
        }

        // Get local account ID
        const { data: localAcct } = await supabase
          .from("rsm_accounts")
          .select("id")
          .eq("tenant_id", tenantId)
          .eq("platform", "instagram")
          .eq("platform_id", String(profile.id))
          .single();

        if (!localAcct) {
          stats.errors.push("Could not find local account after upsert");
          results[tenantId] = stats;
          continue;
        }

        const accountId = localAcct.id;

        // ── Sync Account-Level Insights ─────────────────────────────────
        const now = new Date();
        const since = new Date(now.getTime() - daysBack * 86400000);
        const sinceUnix = Math.floor(since.getTime() / 1000);
        const untilUnix = Math.floor(now.getTime() / 1000);

        // Call 1: daily metrics (reach, follower_count)
        let accountInsights: IgInsightEntry[] = [];
        try {
          const insightsRes = await igGet(
            accessToken,
            `/${igUserId}/insights?metric=reach,follower_count&period=day&since=${sinceUnix}&until=${untilUnix}`
          );
          accountInsights = insightsRes?.data || [];
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          stats.errors.push(`Account insights: ${msg}`);
        }

        await delay(REQUEST_DELAY_MS);

        // Call 2: total_value metrics (profile_views, accounts_engaged)
        let totalValueMetrics: Record<string, number> = {};
        try {
          const totalRes = await igGet(
            accessToken,
            `/${igUserId}/insights?metric=profile_views,accounts_engaged&period=day&metric_type=total_value&since=${sinceUnix}&until=${untilUnix}`
          );
          const entries = (totalRes?.data || []) as IgInsightEntry[];
          for (const entry of entries) {
            const tv = entry.total_value;
            if (tv && typeof tv.value === "number") {
              totalValueMetrics[entry.name] = tv.value;
            }
          }
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          stats.errors.push(`Account insights (total_value): ${msg}`);
        }

        await delay(REQUEST_DELAY_MS);

        // Aggregate insights into daily snapshots
        const dailyMetrics = aggregateInsights(accountInsights);

        // ── Sync Audience Demographics ──────────────────────────────────
        let audience: Record<string, unknown> = {};
        try {
          const demoRes = await igGet(
            accessToken,
            `/${igUserId}/insights?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=city,age,gender`
          );
          audience = parseAudienceDemographics(demoRes?.data || []);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          stats.errors.push(`Audience demographics: ${msg}`);
        }

        await delay(REQUEST_DELAY_MS);

        // ── Upsert Metrics ──────────────────────────────────────────────
        const today = now.toISOString().split("T")[0];

        // Use aggregated daily data or fallback to profile counts
        const latestReach = sumMetric(dailyMetrics, "reach");
        const latestProfileViews = totalValueMetrics["profile_views"] ?? 0;
        const latestEngaged = totalValueMetrics["accounts_engaged"] ?? 0;

        const totalInteractions = latestEngaged;
        const totalViews = totalInteractions;

        const metadata = {
          total_views: totalViews,
          total_interactions: totalInteractions,
          reach_paid: 0, // Instagram API doesn't split paid/organic at account level
          reach_organic: latestReach,
          audience,
          raw_daily: dailyMetrics,
        };

        const { error: mErr } = await supabase.from("rsm_metrics").upsert(
          {
            tenant_id: tenantId,
            account_id: accountId,
            date: today,
            source: "meta_api",
            followers: profile.followers_count ?? 0,
            following: profile.follows_count ?? 0,
            posts_count: profile.media_count ?? 0,
            reach: latestReach,
            impressions: totalViews,
            profile_views: latestProfileViews,
            engagement_rate:
              profile.followers_count > 0
                ? parseFloat(
                    ((totalInteractions / profile.followers_count) * 100).toFixed(2)
                  )
                : 0,
            clicks: 0,
            saves: 0,
            metadata,
          },
          { onConflict: "account_id,date,source" }
        );

        if (!mErr) stats.metrics_upserted++;
        else stats.errors.push(`Metrics upsert: ${mErr.message}`);

        // ── Sync Media (Posts) ──────────────────────────────────────────
        let media: unknown[] = [];
        try {
          const mediaRes = await igGet(
            accessToken,
            `/${igUserId}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,media_product_type&limit=25`
          );
          media = mediaRes?.data || [];
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          stats.errors.push(`Media list: ${msg}`);
        }

        for (const post of media as Record<string, unknown>[]) {
          await delay(REQUEST_DELAY_MS);

          const mediaId = String(post.id);
          let postMetrics: Record<string, number> = {};

          // Fetch per-media insights
          try {
            const isReels = post.media_product_type === "REELS";
            const isVideo = post.media_type === "VIDEO";
            const metricsToFetch = isReels
              ? "reach,saved,shares,total_interactions,ig_reels_avg_watch_time,ig_reels_video_view_total_time,clips_replays_count"
              : isVideo
                ? "reach,saved,shares,total_interactions,video_views"
                : "reach,saved,shares,total_interactions";

            const mediaInsightsRes = await igGet(
              accessToken,
              `/${mediaId}/insights?metric=${metricsToFetch}`
            );
            postMetrics = parseMediaInsights(mediaInsightsRes?.data || []);
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            // Some media types don't support insights — skip silently
            if (!msg.includes("not supported")) {
              stats.errors.push(`Media ${mediaId} insights: ${msg}`);
            }
          }

          const likeCount = (post.like_count as number) ?? 0;
          const commentCount = (post.comments_count as number) ?? 0;
          const totalPostInteractions =
            postMetrics.total_interactions ?? likeCount + commentCount + (postMetrics.saved ?? 0);
          const postReach = postMetrics.reach ?? 0;
          const engRate =
            postReach > 0
              ? parseFloat(((totalPostInteractions / postReach) * 100).toFixed(2))
              : 0;

          const metricsJson = {
            views: postMetrics.video_views ?? postMetrics.clips_replays_count ?? 0,
            reach: postReach,
            interactions: totalPostInteractions,
            engagement_rate: engRate,
            likes: likeCount,
            comments: commentCount,
            saves: postMetrics.saved ?? 0,
            shares: postMetrics.shares ?? 0,
            plays: postMetrics.clips_replays_count ?? 0,
          };

          // Map media_type to our post type
          const typeMap: Record<string, string> = {
            IMAGE: "feed",
            VIDEO: post.media_product_type === "REELS" ? "reel" : "feed",
            CAROUSEL_ALBUM: "carousel",
          };

          const { error: postErr } = await supabase.from("rsm_posts").upsert(
            {
              tenant_id: tenantId,
              account_id: accountId,
              external_post_id: mediaId,
              title: truncate(String(post.caption ?? ""), 120),
              content: String(post.caption ?? ""),
              type: typeMap[String(post.media_type)] ?? "feed",
              status: "published",
              published_date: post.timestamp
                ? new Date(String(post.timestamp)).toISOString().split("T")[0]
                : today,
              metrics: metricsJson,
              media_urls: post.media_url
                ? [String(post.media_url)]
                : post.thumbnail_url
                  ? [String(post.thumbnail_url)]
                  : [],
              source: "meta_api",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "account_id,external_post_id" }
          );

          if (!postErr) stats.posts_upserted++;
          else stats.errors.push(`Post ${mediaId}: ${postErr.message}`);
        }

        // ── Token Refresh Check ─────────────────────────────────────────
        try {
          await maybeRefreshToken(supabase, cfg, accessToken);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          stats.errors.push(`Token refresh: ${msg}`);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        stats.errors.push(`Fatal: ${msg}`);
      }

      results[tenantId] = stats;
    }

    return jsonResponse({ message: "Instagram sync concluido", results });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[instagram-sync] Fatal:", msg);
    return jsonResponse({ error: msg }, 500);
  }
});

// ── Instagram Graph API Helper ───────────────────────────────────────────────

async function igGet(token: string, endpoint: string): Promise<Record<string, unknown>> {
  const separator = endpoint.includes("?") ? "&" : "?";
  const url = `${IG_GRAPH_URL}${endpoint}${separator}access_token=${token}`;
  console.log(`[instagram-sync] GET ${endpoint.split("?")[0]}`);

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IG API ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json() as Promise<Record<string, unknown>>;
}

// ── Insights Aggregation ─────────────────────────────────────────────────────

function aggregateInsights(
  entries: IgInsightEntry[]
): Record<string, number> {
  const sums: Record<string, number> = {};
  for (const entry of entries) {
    const total = (entry.values || []).reduce((acc, v) => {
      return acc + (typeof v.value === "number" ? v.value : 0);
    }, 0);
    sums[entry.name] = total;
  }
  return sums;
}

function sumMetric(daily: Record<string, number>, key: string): number {
  return daily[key] ?? 0;
}

// ── Audience Demographics Parser ─────────────────────────────────────────────

function parseAudienceDemographics(
  entries: IgInsightEntry[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {
    gender: {} as Record<string, number>,
    top_cities: {} as Record<string, number>,
    age_ranges: {} as Record<string, number>,
  };

  for (const entry of entries) {
    if (entry.name !== "follower_demographics") continue;

    const totalValue = entry.total_value;
    if (!totalValue) continue;

    const breakdowns = totalValue.breakdowns as Array<{
      dimension_keys: string[];
      results: Array<{ dimension_values: string[]; value: number }>;
    }> | undefined;

    if (!breakdowns) continue;

    for (const breakdown of breakdowns) {
      const dims = breakdown.dimension_keys || [];
      const results = breakdown.results || [];

      if (dims.includes("city")) {
        const cities: Record<string, number> = {};
        for (const r of results) {
          const city = r.dimension_values?.[0] ?? "Unknown";
          cities[city] = r.value;
        }
        // Top 10 cities
        const sorted = Object.entries(cities)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10);
        result.top_cities = Object.fromEntries(sorted);
      }

      if (dims.includes("age")) {
        const ages: Record<string, number> = {};
        for (const r of results) {
          const age = r.dimension_values?.[0] ?? "Unknown";
          ages[age] = (ages[age] ?? 0) + r.value;
        }
        result.age_ranges = ages;
      }

      if (dims.includes("gender")) {
        const genders: Record<string, number> = {};
        for (const r of results) {
          const g = r.dimension_values?.[0] ?? "U";
          genders[g] = (genders[g] ?? 0) + r.value;
        }
        result.gender = genders;
      }
    }
  }

  return result;
}

// ── Media Insights Parser ────────────────────────────────────────────────────

function parseMediaInsights(entries: IgInsightEntry[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const entry of entries) {
    const val = entry.values?.[0]?.value;
    if (typeof val === "number") {
      result[entry.name] = val;
    }
  }
  return result;
}

// ── Token Refresh ────────────────────────────────────────────────────────────

async function maybeRefreshToken(
  supabase: ReturnType<typeof createClient>,
  config: { tenant_id: string; settings: Record<string, unknown> | null },
  currentToken: string
): Promise<void> {
  const settings = config.settings;
  if (!settings) return;

  const appId = settings.app_id as string | undefined;
  const appSecret = settings.app_secret as string | undefined;

  // Only refresh if app credentials are configured
  if (!appId || !appSecret) return;

  // Check token expiry via debug endpoint
  try {
    const debugRes = await fetch(
      `${IG_GRAPH_URL}/debug_token?input_token=${currentToken}&access_token=${appId}|${appSecret}`
    );
    if (!debugRes.ok) return;

    const debugData = (await debugRes.json()) as {
      data?: { expires_at?: number; is_valid?: boolean };
    };
    const expiresAt = debugData?.data?.expires_at;
    if (!expiresAt) return;

    const daysUntilExpiry =
      (expiresAt * 1000 - Date.now()) / (1000 * 60 * 60 * 24);

    if (daysUntilExpiry < 7) {
      console.log(
        `[instagram-sync] Token expires in ${daysUntilExpiry.toFixed(1)} days, refreshing...`
      );
      const refreshRes = await fetch(
        `${IG_GRAPH_URL}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${currentToken}`
      );
      if (refreshRes.ok) {
        const refreshData = (await refreshRes.json()) as {
          access_token?: string;
        };
        if (refreshData.access_token) {
          await supabase
            .from("integration_configs")
            .update({
              settings: {
                ...settings,
                access_token: refreshData.access_token,
                token_refreshed_at: new Date().toISOString(),
              },
            })
            .eq("tenant_id", config.tenant_id)
            .eq("provider", "instagram");
          console.log("[instagram-sync] Token refreshed successfully");
        }
      }
    }
  } catch {
    // Non-critical — token refresh failure shouldn't block sync
    console.warn("[instagram-sync] Token debug/refresh failed (non-critical)");
  }
}

// ── Utilities ────────────────────────────────────────────────────────────────

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "..." : str;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    },
  });
}
