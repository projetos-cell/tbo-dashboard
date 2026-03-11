import type { Database } from "@/lib/supabase/types";

export type RsmMetricRow = Database["public"]["Tables"]["rsm_metrics"]["Row"];
export type RsmAccountRow = Database["public"]["Tables"]["rsm_accounts"]["Row"];
export type RsmPostRow = Database["public"]["Tables"]["rsm_posts"]["Row"];

export const MONTHS_PT: Record<number, string> = {
  1: "Jan", 2: "Fev", 3: "Mar", 4: "Abr", 5: "Mai", 6: "Jun",
  7: "Jul", 8: "Ago", 9: "Set", 10: "Out", 11: "Nov", 12: "Dez",
};

export function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2).replace(".", ",")}M`;
  if (n >= 1_000) return n.toLocaleString("pt-BR");
  return String(n);
}

export function fmtDate(d: string | null): string {
  if (!d) return "—";
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function fmtFullDate(d: string): string {
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2, "0")} ${MONTHS_PT[date.getMonth() + 1]} ${date.getFullYear()}`;
}

export interface TopPost {
  title: string;
  views: number;
  reach: number;
  interactions: number;
  engRate: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  date: string;
}

export function extractTopPosts(posts: RsmPostRow[]): TopPost[] {
  return posts.slice(0, 5).map((p) => {
    const m = (p.metrics ?? {}) as Record<string, unknown>;
    return {
      title: p.title ?? "Sem título",
      views: (m.views as number) ?? 0,
      reach: (m.reach as number) ?? 0,
      interactions: (m.interactions as number) ?? 0,
      engRate: (m.engagement_rate as number) ?? 0,
      likes: (m.likes as number) ?? 0,
      comments: (m.comments as number) ?? 0,
      saves: (m.saves as number) ?? 0,
      shares: (m.shares as number) ?? 0,
      date: fmtDate(p.published_date),
    };
  });
}
