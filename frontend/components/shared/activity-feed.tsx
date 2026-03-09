"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ACTIVITY_ACTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type Activity = Database["public"]["Tables"]["project_activity"]["Row"] & {
  actor?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

interface ActivityFeedProps {
  activities: Activity[];
  isLoading?: boolean;
  className?: string;
  emptyMessage?: string;
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatFieldChange(activity: Activity): string {
  const action = ACTIVITY_ACTIONS[activity.action] || activity.action;
  const entityLabel = getEntityLabel(activity.entity_type);

  if (activity.field_name) {
    return `${action} o campo "${activity.field_name}" de "${activity.old_value || "vazio"}" para "${activity.new_value || "vazio"}"`;
  }

  return `${action} ${entityLabel}`;
}

function getEntityLabel(entityType: string): string {
  const labels: Record<string, string> = {
    project: "o projeto",
    task: "a tarefa",
    section: "a secao",
    comment: "um comentario",
    attachment: "um anexo",
  };
  return labels[entityType] || entityType;
}

export function ActivityFeed({
  activities,
  isLoading,
  className,
  emptyMessage = "Nenhuma atividade registrada",
}: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return <p className={cn("py-8 text-center text-sm text-gray-500", className)}>{emptyMessage}</p>;
  }

  return (
    <div className={cn("space-y-1", className)}>
      {activities.map((activity, index) => (
        <div key={activity.id} className="relative flex items-start gap-3 py-2">
          {/* Timeline connector */}
          {index < activities.length - 1 && (
            <div className="bg-border absolute top-10 bottom-0 left-4 w-px -translate-x-1/2" />
          )}

          <Avatar className="z-10 size-8 shrink-0">
            <AvatarImage src={activity.actor?.avatar_url || undefined} />
            <AvatarFallback className="text-[10px]">{getInitials(activity.actor?.full_name || null)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="text-sm">
              <span className="font-medium">{activity.actor?.full_name || "Alguem"}</span>{" "}
              <span className="text-gray-500">{formatFieldChange(activity)}</span>
            </p>

            {activity.field_name && activity.old_value && activity.new_value && (
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-gray-500 line-through">
                  {activity.old_value}
                </span>
                <span className="text-gray-500">→</span>
                <span className="bg-tbo-orange/10 rounded px-1.5 py-0.5 text-gray-900">{activity.new_value}</span>
              </div>
            )}

            <p className="mt-0.5 text-xs text-gray-500">
              {formatDistanceToNow(new Date(activity.created_at!), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
