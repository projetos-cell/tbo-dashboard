"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CheckCheck,
  Trash2,
  Inbox,
  AtSign,
  MessageSquare,
  UserPlus,
  RefreshCw,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ErrorState, EmptyState } from "@/components/shared";
import {
  useNotifications,
  useActorNames,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "@/hooks/use-alerts";
import { computeAlertKPIs } from "@/services/alerts";
import type { NotificationRow, NotificationFilters } from "@/services/alerts";

// ─── Filter tabs ───

type FilterTab = "all" | "unread" | "mentions" | "assignments";

const FILTER_TABS: { value: FilterTab; label: string; icon: React.ElementType }[] = [
  { value: "all", label: "Todas", icon: Bell },
  { value: "unread", label: "Não lidas", icon: Inbox },
  { value: "mentions", label: "Menções", icon: AtSign },
  { value: "assignments", label: "Responsabilidades", icon: UserPlus },
];

function getFiltersForTab(tab: FilterTab): NotificationFilters | undefined {
  switch (tab) {
    case "unread":
      return { read: false };
    case "mentions":
      return { triggerType: "mention" };
    case "assignments":
      return { triggerType: "task_assigned" };
    default:
      return undefined;
  }
}

// ─── Trigger type display ───

const TRIGGER_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; bg: string; color: string }
> = {
  mention: { label: "Menção", icon: AtSign, bg: "#dbeafe", color: "#1d4ed8" },
  thread_reply: {
    label: "Comentário",
    icon: MessageSquare,
    bg: "#dcfce7",
    color: "#15803d",
  },
  task_assigned: {
    label: "Atribuição",
    icon: UserPlus,
    bg: "#fef9c3",
    color: "#a16207",
  },
  task_updated: {
    label: "Atualização",
    icon: RefreshCw,
    bg: "#f3e8ff",
    color: "#7c3aed",
  },
};

const DEFAULT_TRIGGER = {
  label: "Sistema",
  icon: Bell,
  bg: "#f1f5f9",
  color: "#475569",
};

// ─── Page ───

export default function AlertsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const queryFilters = getFiltersForTab(activeTab);

  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useNotifications(queryFilters);
  const markRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();
  const deleteNotif = useDeleteNotification();

  // KPIs always use unfiltered data
  const { data: allNotifications = [] } = useNotifications();
  const kpis = useMemo(
    () => computeAlertKPIs(allNotifications),
    [allNotifications]
  );

  // Actor names & avatars
  const actorIds = useMemo(
    () =>
      notifications
        .map((n) => n.actor_id)
        .filter((id): id is string => !!id),
    [notifications]
  );
  const { data: actorMap } = useActorNames(actorIds);

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
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
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
            Acompanhe menções, atribuições e atualizações em suas tarefas.
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
          <KpiCard
            label="Esta semana"
            value={kpis.thisWeek}
            color="#8b5cf6"
          />
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center rounded-lg border p-0.5 w-fit">
        {FILTER_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-3 gap-1.5"
              onClick={() => setActiveTab(tab.value)}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Notification list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Nenhuma notificação"
          description={
            activeTab === "all"
              ? "Você está em dia! Nenhuma notificação para exibir."
              : "Nenhuma notificação nesta categoria."
          }
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              actorInfo={
                notification.actor_id
                  ? actorMap?.get(notification.actor_id)
                  : undefined
              }
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

// ─── Sub-components ───

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

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function NotificationCard({
  notification,
  actorInfo,
  onClick,
  onMarkRead,
  onDelete,
}: {
  notification: NotificationRow;
  actorInfo?: { name: string; avatar: string | null };
  onClick: () => void;
  onMarkRead: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const triggerKey = notification.trigger_type ?? "";
  const trigger = TRIGGER_CONFIG[triggerKey] ?? DEFAULT_TRIGGER;
  const TriggerIcon = trigger.icon;

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
        !notification.read
          ? "bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900"
          : ""
      }`}
    >
      {/* Avatar or unread dot */}
      <div className="shrink-0 mt-0.5">
        {actorInfo ? (
          <Avatar className="h-8 w-8">
            {actorInfo.avatar && (
              <AvatarImage src={actorInfo.avatar} alt={actorInfo.name} />
            )}
            <AvatarFallback className="text-xs">
              {getInitials(actorInfo.name)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <TriggerIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {!notification.read && (
            <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
          )}
          <p
            className={`text-sm font-medium truncate ${
              !notification.read
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {notification.title}
          </p>
        </div>

        {notification.body && (
          <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
            {notification.body}
          </p>
        )}

        <div className="flex items-center gap-2 mt-1.5">
          <Badge
            variant="secondary"
            className="text-[10px] h-5 px-1.5"
            style={{
              backgroundColor: trigger.bg,
              color: trigger.color,
            }}
          >
            <TriggerIcon className="h-3 w-3 mr-1" />
            {trigger.label}
          </Badge>
          <span className="text-xs text-muted-foreground">{timeLabel}</span>
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
