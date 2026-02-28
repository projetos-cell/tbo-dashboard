"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CheckCheck,
  Trash2,
  ExternalLink,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "@/hooks/use-alerts";
import { computeAlertKPIs } from "@/services/alerts";
import type { Database } from "@/lib/supabase/types";

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

const TYPE_OPTIONS = [
  { value: "all", label: "Todos os tipos" },
  { value: "task", label: "Tarefa" },
  { value: "project", label: "Projeto" },
  { value: "financial", label: "Financeiro" },
  { value: "system", label: "Sistema" },
];

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  task: { bg: "#dbeafe", color: "#1d4ed8" },
  project: { bg: "#dcfce7", color: "#15803d" },
  financial: { bg: "#fef9c3", color: "#a16207" },
  system: { bg: "#f3e8ff", color: "#7c3aed" },
};

export default function AlertsPage() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState("all");
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">(
    "all"
  );

  // Build filter object for the query
  const queryFilters = useMemo(() => {
    const f: { read?: boolean; type?: string } = {};
    if (readFilter === "unread") f.read = false;
    if (readFilter === "read") f.read = true;
    if (typeFilter !== "all") f.type = typeFilter;
    return Object.keys(f).length > 0 ? f : undefined;
  }, [typeFilter, readFilter]);

  const { data: notifications = [], isLoading, error } = useNotifications(queryFilters);
  const markRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();
  const deleteNotif = useDeleteNotification();

  // KPIs use all notifications (no filter)
  const { data: allNotifications = [] } = useNotifications();
  const kpis = useMemo(() => computeAlertKPIs(allNotifications), [allNotifications]);

  function handleClick(notification: NotificationRow) {
    if (!notification.read) {
      markRead.mutate(notification.id);
    }
    if (notification.action_url) {
      router.push(notification.action_url);
    }
  }

  function handleMarkRead(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    markRead.mutate(id);
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    deleteNotif.mutate(id);
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-destructive text-lg font-medium">
          Erro ao carregar notificações
        </p>
        <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Alertas & Notificações
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe todas as notificações do sistema em um só lugar.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => markAllRead.mutate()}
          disabled={kpis.unread === 0 || markAllRead.isPending}
        >
          <CheckCheck className="mr-2 h-4 w-4" />
          Marcar todos como lido
        </Button>
      </div>

      {/* KPIs */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Total" value={kpis.total} />
          <KpiCard label="Não lidas" value={kpis.unread} color="#ef4444" />
          <KpiCard label="Hoje" value={kpis.today} color="#3b82f6" />
          <KpiCard label="Esta semana" value={kpis.thisWeek} color="#8b5cf6" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center rounded-lg border p-0.5">
          <Button
            variant={readFilter === "all" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-3"
            onClick={() => setReadFilter("all")}
          >
            Todas
          </Button>
          <Button
            variant={readFilter === "unread" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-3"
            onClick={() => setReadFilter("unread")}
          >
            Não lidas
          </Button>
          <Button
            variant={readFilter === "read" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-3"
            onClick={() => setReadFilter("read")}
          >
            Lidas
          </Button>
        </div>
      </div>

      {/* Notification List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium">Nenhuma notificação</p>
          <p className="text-xs text-muted-foreground">
            Você está em dia! Nenhuma notificação para exibir.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onClick={() => handleClick(notification)}
              onMarkRead={(e) => handleMarkRead(e, notification.id)}
              onDelete={(e) => handleDelete(e, notification.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─── */

function KpiCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className="text-2xl font-bold mt-1"
        style={color ? { color } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

function NotificationCard({
  notification,
  onClick,
  onMarkRead,
  onDelete,
}: {
  notification: NotificationRow;
  onClick: () => void;
  onMarkRead: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const typeStyle = TYPE_COLORS[notification.type || ""] ?? {
    bg: "#f1f5f9",
    color: "#475569",
  };

  const timeLabel = notification.created_at
    ? formatDistanceToNow(new Date(notification.created_at), {
        locale: ptBR,
        addSuffix: true,
      })
    : "";

  return (
    <div
      onClick={onClick}
      className={`group flex items-start gap-3 rounded-lg border p-4 transition-colors cursor-pointer hover:bg-muted/50 ${
        !notification.read ? "bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900" : ""
      }`}
    >
      {/* Unread dot */}
      <div className="mt-1.5 shrink-0">
        {!notification.read ? (
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
        ) : (
          <div className="h-2.5 w-2.5 rounded-full bg-transparent" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p
            className={`text-sm font-medium truncate ${
              !notification.read ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {notification.title}
          </p>
          {notification.type && (
            <Badge
              variant="secondary"
              style={{
                backgroundColor: typeStyle.bg,
                color: typeStyle.color,
              }}
            >
              {notification.type}
            </Badge>
          )}
        </div>
        {notification.body && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {notification.body}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-muted-foreground">{timeLabel}</span>
          {notification.action_url && (
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.read && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onMarkRead}
            title="Marcar como lida"
          >
            <CheckCheck className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          onClick={onDelete}
          title="Excluir"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
