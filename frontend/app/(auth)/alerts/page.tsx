"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorState, EmptyState } from "@/components/shared";
import {
  useNotifications,
  useActorNames,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "@/hooks/use-alerts";
import { computeAlertKPIs } from "@/services/alerts";
import type { NotificationRow } from "@/services/alerts";
import { NotificationCard, TRIGGER_CONFIG } from "@/features/alerts/components/notification-card";
import { NotificationsGrouped } from "@/features/alerts/components/notifications-grouped";
import {
  IconBell,
  IconChecks,
  IconInbox,
  IconLayoutGrid,
  IconList,
} from "@tabler/icons-react";

const T = {
  text: "#0f0f0f",
  muted: "#4a4a4a",
  orange: "#c45a1a",
  orangeGlow: "rgba(196,90,26,0.10)",
  glass: "rgba(255,255,255,0.65)",
  glassBorder: "rgba(255,255,255,0.45)",
  glassShadow: "0 8px 32px rgba(15,15,15,0.06), 0 1px 3px rgba(15,15,15,0.04)",
  glassBlur: "blur(16px) saturate(180%)",
  r: "16px",
  rSm: "10px",
};

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-5 ${className}`} style={{ background: T.glass, backdropFilter: T.glassBlur, WebkitBackdropFilter: T.glassBlur, border: `1px solid ${T.glassBorder}`, borderRadius: T.r, boxShadow: T.glassShadow }}>
      {children}
    </div>
  );
}

type StatusFilter = "all" | "unread" | "read";
type ViewMode = "flat" | "grouped";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "unread", label: "Não lidas" },
  { value: "read", label: "Lidas" },
];

const TYPE_FILTER_KEYS = ["mention", "thread_reply", "task_assigned", "task_updated", "task_overdue", "task_reminder"] as const;

export default function AlertsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("flat");

  const { data: allNotifications = [], isLoading, error, refetch } = useNotifications();
  const markRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();
  const deleteNotif = useDeleteNotification();

  const kpis = useMemo(() => computeAlertKPIs(allNotifications), [allNotifications]);

  const filtered = useMemo(() => {
    let result = allNotifications;
    if (statusFilter === "unread") result = result.filter((n) => !n.read);
    if (statusFilter === "read") result = result.filter((n) => n.read);
    if (typeFilter) result = result.filter((n) => n.trigger_type === typeFilter);
    return result;
  }, [allNotifications, statusFilter, typeFilter]);

  const actorIds = useMemo(() => filtered.map((n) => n.actor_id).filter((id): id is string => !!id), [filtered]);
  const { data: actorMap } = useActorNames(actorIds);

  function handleClick(notification: NotificationRow) {
    if (!notification.read) markRead.mutate(notification.id);
    if (notification.action_url) router.push(notification.action_url);
  }
  function handleMarkRead(e: React.MouseEvent, id: string) { e.stopPropagation(); markRead.mutate(id); }
  function handleDelete(e: React.MouseEvent, id: string) { e.stopPropagation(); deleteNotif.mutate(id); }

  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <div className="-mx-4 md:-mx-8 lg:-mx-12 -my-6">
      <div className="flex gap-0 min-h-[calc(100dvh-64px)]">
        {/* Left Sidebar — KPIs */}
        <aside className="hidden lg:flex flex-col w-[260px] shrink-0 p-4 gap-4" style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderRight: `1px solid ${T.glassBorder}` }}>
          <SectionCard>
            <h3 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Resumo</h3>
            <div className="space-y-2.5">
              {[
                { label: "Total", value: kpis.total, color: T.muted },
                { label: "Não lidas", value: kpis.unread, color: "#ef4444" },
                { label: "Hoje", value: kpis.today, color: "#3b82f6" },
                { label: "Esta semana", value: kpis.thisWeek, color: "#8b5cf6" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: T.muted }}>{item.label}</span>
                  {isLoading ? <Skeleton className="h-4 w-10" /> : (
                    <span className="text-sm font-semibold tabular-nums" style={{ color: item.color }}>{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Type filters in sidebar */}
          <SectionCard>
            <h3 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Filtro por Tipo</h3>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setTypeFilter(null)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ background: typeFilter === null ? T.orangeGlow : "transparent", color: typeFilter === null ? T.orange : T.text }}
              >
                <IconBell className="size-3.5" />
                Todos os tipos
              </button>
              {TYPE_FILTER_KEYS.map((key) => {
                const config = TRIGGER_CONFIG[key];
                const Icon = config.icon;
                const count = allNotifications.filter((n) => n.trigger_type === key).length;
                if (count === 0) return null;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTypeFilter(typeFilter === key ? null : key)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors hover:bg-black/[0.03]"
                    style={{ background: typeFilter === key ? config.bg : "transparent", color: typeFilter === key ? config.color : T.text }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="size-3.5" />
                      <span className="font-medium">{config.label}</span>
                    </div>
                    <span className="text-[10px] tabular-nums" style={{ color: T.muted }}>{count}</span>
                  </button>
                );
              })}
            </div>
          </SectionCard>
        </aside>

        {/* Center */}
        <main className="flex-1 min-w-0 p-5 space-y-4">
          {/* Header Bar */}
          <div className="relative overflow-hidden p-4" style={{ background: "linear-gradient(135deg, #1a1410 0%, #2d1810 50%, #c45a1a 100%)", borderRadius: T.r, boxShadow: "0 8px 32px rgba(196,90,26,0.15)" }}>
            <div className="absolute inset-0 opacity-[0.04]"><div className="absolute -top-8 -right-8 size-32 border-[2px] border-white rounded-full" /><div className="absolute bottom-0 left-10 size-16 border-[2px] border-white rounded-full" /></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex gap-2">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors"
                    style={{ background: statusFilter === tab.value ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)" }}
                  >
                    {tab.label}
                    {tab.value === "unread" && kpis.unread > 0 && (
                      <span className="text-[9px] bg-red-500 text-white px-1 rounded-full">{kpis.unread}</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode(viewMode === "flat" ? "grouped" : "flat")}
                  className="p-1.5 rounded-lg text-white/60 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  {viewMode === "flat" ? <IconLayoutGrid className="size-3.5" /> : <IconList className="size-3.5" />}
                </button>
                <button
                  onClick={() => markAllRead.mutate()}
                  disabled={kpis.unread === 0 || markAllRead.isPending}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors disabled:opacity-40"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <IconChecks className="size-3.5" />
                  Marcar lidas
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={IconInbox} title="Nenhuma notificação" description={statusFilter !== "all" || typeFilter ? "Nenhuma notificação nesta categoria." : "Você está em dia!"} />
          ) : viewMode === "grouped" ? (
            <NotificationsGrouped notifications={filtered} actorMap={actorMap} onClickNotification={handleClick} onMarkRead={handleMarkRead} onDelete={handleDelete} />
          ) : (
            <div className="space-y-2">
              {filtered.map((n) => (
                <NotificationCard key={n.id} notification={n} actorInfo={n.actor_id ? actorMap?.get(n.actor_id) : undefined} onClick={() => handleClick(n)} onMarkRead={(e) => handleMarkRead(e, n.id)} onDelete={(e) => handleDelete(e, n.id)} />
              ))}
            </div>
          )}
        </main>

        {/* Right Sidebar — empty for now, can add widgets later */}
        <aside className="hidden xl:flex flex-col w-[300px] shrink-0 p-4 gap-4" style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderLeft: `1px solid ${T.glassBorder}` }}>
          <SectionCard>
            <div className="text-center py-4">
              <IconBell className="size-5 mx-auto mb-1" style={{ color: T.muted, opacity: 0.3 }} />
              <p className="text-[11px]" style={{ color: T.muted }}>Configure suas preferências de notificação em Configurações.</p>
            </div>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
