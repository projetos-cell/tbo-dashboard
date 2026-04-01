"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  IconChecks,
  IconTrash,
  IconAt,
  IconMessage,
  IconUserPlus,
  IconRefresh,
  IconBell,
  IconClock,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { NotificationRow } from "@/services/alerts";

// ─── Trigger type config (all 6 types + default) ───

export const TRIGGER_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; bg: string; color: string }
> = {
  mention: { label: "Menção", icon: IconAt, bg: "#dbeafe", color: "#1d4ed8" },
  thread_reply: { label: "Comentário", icon: IconMessage, bg: "#dcfce7", color: "#15803d" },
  task_assigned: { label: "Atribuição", icon: IconUserPlus, bg: "#fef9c3", color: "#a16207" },
  task_updated: { label: "Atualização", icon: IconRefresh, bg: "#f3e8ff", color: "#7c3aed" },
  task_overdue: { label: "Vencida", icon: IconAlertTriangle, bg: "#fee2e2", color: "#dc2626" },
  task_reminder: { label: "Lembrete", icon: IconClock, bg: "#e0f2fe", color: "#0369a1" },
};

export const DEFAULT_TRIGGER = {
  label: "Sistema",
  icon: IconBell,
  bg: "#f1f5f9",
  color: "#475569",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Component ───

interface NotificationCardProps {
  notification: NotificationRow;
  actorInfo?: { name: string; avatar: string | null };
  onClick: () => void;
  onMarkRead: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function NotificationCard({
  notification,
  actorInfo,
  onClick,
  onMarkRead,
  onDelete,
}: NotificationCardProps) {
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
      className={`group flex items-start gap-3 rounded-lg border p-4 transition-colors cursor-pointer hover:bg-gray-100/50 ${
        !notification.read
          ? "bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900"
          : ""
      }`}
    >
      {/* Avatar or icon */}
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
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <TriggerIcon className="h-4 w-4 text-gray-500" />
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
              !notification.read ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {notification.title}
          </p>
        </div>

        {notification.body && (
          <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
            {notification.body}
          </p>
        )}

        <div className="flex items-center gap-2 mt-1.5">
          <Badge
            variant="secondary"
            className="text-[10px] h-5 px-1.5"
            style={{ backgroundColor: trigger.bg, color: trigger.color }}
          >
            <TriggerIcon className="h-3 w-3 mr-1" />
            {trigger.label}
          </Badge>
          <span className="text-xs text-gray-500">{timeLabel}</span>
        </div>
      </div>

      {/* Actions (hover-reveal) */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.read && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onMarkRead}
            title="Marcar como lida"
          >
            <IconChecks className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-red-500 hover:text-red-500"
          onClick={onDelete}
          title="Excluir"
        >
          <IconTrash className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
