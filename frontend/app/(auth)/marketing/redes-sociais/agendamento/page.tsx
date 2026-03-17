"use client";

// Features #44 #45 #46 — Agendamento: filtro plataforma + modal criar post + calendário semanal

import { useState, useMemo } from "react";
import {
  IconPlus,
  IconCalendarEvent,
  IconSearch,
  IconList,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import {
  useRsmPosts,
  useRsmAccounts,
} from "@/features/marketing/hooks/use-marketing-social";
import { SocialPostFormModal } from "@/features/marketing/components/social/social-post-form-modal";
import type { Database } from "@/lib/supabase/types";

type Post = Database["public"]["Tables"]["rsm_posts"]["Row"];
type Account = Database["public"]["Tables"]["rsm_accounts"]["Row"];

const POST_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  rascunho: { label: "Rascunho", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  agendado: { label: "Agendado", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  publicado: { label: "Publicado", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  erro: { label: "Erro", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitter: "X (Twitter)",
  pinterest: "Pinterest",
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#e1306c",
  facebook: "#1877f2",
  linkedin: "#0a66c2",
  tiktok: "#010101",
  youtube: "#ff0000",
  twitter: "#1da1f2",
  pinterest: "#e60023",
};

// ── Weekly Calendar ────────────────────────────────────────────

function getWeekDays(refDate: Date): Date[] {
  const day = refDate.getDay(); // 0=Sun
  const monday = new Date(refDate);
  monday.setDate(refDate.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const WEEK_DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

interface WeekCalendarProps {
  posts: Post[];
  accountMap: Map<string, Account>;
  onNewPost: () => void;
}

function WeekCalendar({ posts, accountMap, onNewPost }: WeekCalendarProps) {
  const [refDate, setRefDate] = useState(() => new Date());
  const days = getWeekDays(refDate);

  const postsByDay = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const post of posts) {
      if (!post.scheduled_date) continue;
      const key = post.scheduled_date.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(post);
    }
    return map;
  }, [posts]);

  function prevWeek() {
    const d = new Date(refDate);
    d.setDate(d.getDate() - 7);
    setRefDate(d);
  }

  function nextWeek() {
    const d = new Date(refDate);
    d.setDate(d.getDate() + 7);
    setRefDate(d);
  }

  const todayStr = toDateStr(new Date());
  const weekLabel = `${days[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} — ${days[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}`;

  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Header nav */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
        <button
          onClick={prevWeek}
          className="p-1 rounded hover:bg-muted transition-colors"
          aria-label="Semana anterior"
        >
          <IconChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-medium">{weekLabel}</span>
        <button
          onClick={nextWeek}
          className="p-1 rounded hover:bg-muted transition-colors"
          aria-label="Próxima semana"
        >
          <IconChevronRight className="size-4" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 divide-x">
        {days.map((day, idx) => {
          const key = toDateStr(day);
          const dayPosts = postsByDay.get(key) ?? [];
          const isToday = key === todayStr;

          return (
            <div key={key} className="min-h-[140px] p-2 space-y-1.5">
              {/* Day header */}
              <div className="text-center mb-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {WEEK_DAY_LABELS[idx]}
                </p>
                <div
                  className={`mx-auto mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    isToday
                      ? "bg-foreground text-background"
                      : "text-foreground"
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>

              {/* Posts */}
              {dayPosts.length === 0 ? (
                <div
                  className="flex h-8 items-center justify-center rounded border border-dashed border-border/40 cursor-pointer hover:border-border transition-colors"
                  onClick={onNewPost}
                  title="Novo post neste dia"
                >
                  <IconPlus className="size-3 text-muted-foreground" />
                </div>
              ) : (
                dayPosts.slice(0, 3).map((post) => {
                  const acc = accountMap.get(post.account_id);
                  const platform = String(acc?.platform ?? "");
                  const color = PLATFORM_COLORS[platform] ?? "#6b7280";
                  const st = POST_STATUS[post.status ?? ""] ?? null;

                  return (
                    <div
                      key={post.id}
                      className="rounded px-1.5 py-1 text-[10px] leading-tight cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: `${color}18`, borderLeft: `2px solid ${color}` }}
                      title={post.title ?? post.content ?? ""}
                    >
                      <p className="font-medium truncate" style={{ color }}>
                        {PLATFORM_LABELS[platform] ?? platform}
                      </p>
                      <p className="text-muted-foreground truncate">
                        {post.title ?? (post.content ?? "").slice(0, 30)}
                      </p>
                      {st && (
                        <span
                          className="inline-block rounded px-1 mt-0.5"
                          style={{ backgroundColor: st.bg, color: st.color, fontSize: "9px" }}
                        >
                          {st.label}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
              {dayPosts.length > 3 && (
                <p className="text-[10px] text-muted-foreground text-center">
                  +{dayPosts.length - 3} posts
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────

function AgendamentoContent() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [view, setView] = useState<"lista" | "calendario">("lista");

  const { data: posts, isLoading, error, refetch } = useRsmPosts();
  const { data: accounts } = useRsmAccounts();

  const accountMap = new Map(
    (accounts ?? []).map((a) => [a.id, a])
  );

  const platforms = Array.from(
    new Set((accounts ?? []).map((a) => String(a.platform)))
  );

  const filtered = (posts ?? []).filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (platformFilter !== "all") {
      const acc = p.account_id ? accountMap.get(p.account_id) : null;
      if (!acc || String(acc.platform) !== platformFilter) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const titleMatch = (p.title ?? "").toLowerCase().includes(q);
      const contentMatch = (p.content ?? "").toLowerCase().includes(q);
      if (!titleMatch && !contentMatch) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agendamento</h1>
          <p className="text-sm text-muted-foreground">
            Agende e publique posts nas redes sociais.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* #46 — View toggle */}
          <div className="flex items-center rounded-lg border overflow-hidden">
            <button
              onClick={() => setView("lista")}
              className={`px-3 py-1.5 flex items-center gap-1.5 text-xs transition-colors ${
                view === "lista"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconList className="size-3.5" /> Lista
            </button>
            <button
              onClick={() => setView("calendario")}
              className={`px-3 py-1.5 flex items-center gap-1.5 text-xs transition-colors border-l ${
                view === "calendario"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconCalendar className="size-3.5" /> Semana
            </button>
          </div>
          <Button onClick={() => setPostModalOpen(true)}>
            <IconPlus className="mr-1 h-4 w-4" /> Novo Post
          </Button>
        </div>
      </div>

      {/* Filtros: status tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            {Object.entries(POST_STATUS).map(([key, def]) => (
              <TabsTrigger key={key} value={key}>
                {def.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Filtro plataforma + busca */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPlatformFilter("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              platformFilter === "all"
                ? "bg-foreground text-background border-transparent"
                : "bg-transparent text-muted-foreground border-border hover:border-foreground/40"
            }`}
          >
            Todas
          </button>
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                platformFilter === p
                  ? "bg-foreground text-background border-transparent"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground/40"
              }`}
            >
              {PLATFORM_LABELS[p] ?? p}
            </button>
          ))}
        </div>

        {view === "lista" && (
          <div className="relative max-w-sm flex-1">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
      </div>

      {error ? (
        <ErrorState message="Erro ao carregar posts." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : view === "calendario" ? (
        /* #46 — Weekly calendar view */
        <WeekCalendar
          posts={filtered}
          accountMap={accountMap}
          onNewPost={() => setPostModalOpen(true)}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={IconCalendarEvent}
          title={
            search || statusFilter !== "all" || platformFilter !== "all"
              ? "Nenhum post encontrado"
              : "Nenhum post ainda"
          }
          description={
            search || statusFilter !== "all" || platformFilter !== "all"
              ? "Ajuste os filtros ou crie um novo post."
              : "Crie seu primeiro post para as redes sociais."
          }
          cta={{ label: "Novo Post", onClick: () => setPostModalOpen(true), icon: IconPlus }}
        />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Conteúdo
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                  Plataforma
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                  Formato
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((post) => {
                const st = POST_STATUS[post.status ?? ""] ?? null;
                const acc = post.account_id ? accountMap.get(post.account_id) : null;
                const platformLabel = acc
                  ? (PLATFORM_LABELS[String(acc.platform)] ?? String(acc.platform))
                  : (post.type ?? "--");
                return (
                  <tr
                    key={post.id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium truncate max-w-xs">
                      {(post.title ?? post.content) || "--"}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell capitalize">
                      {platformLabel}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {post.type ?? "--"}
                    </td>
                    <td className="px-4 py-3">
                      {st ? (
                        <Badge
                          variant="secondary"
                          style={{ backgroundColor: st.bg, color: st.color }}
                        >
                          {st.label}
                        </Badge>
                      ) : (
                        post.status
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {post.scheduled_date
                        ? new Date(post.scheduled_date).toLocaleDateString("pt-BR")
                        : "--"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "post" : "posts"}
          </div>
        </div>
      )}

      <SocialPostFormModal
        open={postModalOpen}
        onClose={() => setPostModalOpen(false)}
      />
    </div>
  );
}

export default function AgendamentoPage() {
  return (
    <RequireRole module="marketing">
      <AgendamentoContent />
    </RequireRole>
  );
}
