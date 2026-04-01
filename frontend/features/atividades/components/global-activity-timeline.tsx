"use client";

import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconArrowRight,
  IconCheck,
  IconMessage,
  IconPaperclip,
  IconUser,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ACTIVITY_ACTIONS } from "@/lib/constants";
import type { GlobalActivityItem } from "@/features/atividades/services/global-activity";

// ─── Action config ───────────────────────────────────────────────────────────

const ACTION_ICONS: Record<string, { icon: typeof IconEdit; color: string }> = {
  created:    { icon: IconPlus,      color: "text-green-600" },
  updated:    { icon: IconEdit,      color: "text-blue-600" },
  deleted:    { icon: IconTrash,     color: "text-red-600" },
  moved:      { icon: IconArrowRight, color: "text-amber-600" },
  completed:  { icon: IconCheck,     color: "text-emerald-600" },
  reopened:   { icon: IconArrowRight, color: "text-gray-500" },
  commented:  { icon: IconMessage,   color: "text-violet-600" },
  attached:   { icon: IconPaperclip, color: "text-cyan-600" },
  assigned:   { icon: IconUser,      color: "text-indigo-600" },
  unassigned: { icon: IconUser,      color: "text-gray-400" },
};

function getActionConfig(action: string) {
  return ACTION_ICONS[action] ?? { icon: IconArrowRight, color: "text-gray-500" };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function formatEntityLabel(type: string): string {
  const labels: Record<string, string> = {
    project: "projeto",
    task:    "tarefa",
    section: "seção",
    comment: "comentário",
    attachment: "anexo",
  };
  return labels[type] ?? type;
}

function buildDescription(item: GlobalActivityItem): string {
  const verb = ACTIVITY_ACTIONS[item.action] ?? item.action;
  const entity = formatEntityLabel(item.entity_type);

  if (item.field_name) {
    return `${verb} o campo "${item.field_name}" ${entity === "tarefa" ? "na tarefa" : "no"} ${entity}`;
  }
  return `${verb} ${entity === "tarefa" ? "a" : "o"} ${entity}`;
}

// ─── Single item ─────────────────────────────────────────────────────────────

function ActivityItem({ item }: { item: GlobalActivityItem }) {
  const config = getActionConfig(item.action);
  const ActionIcon = config.icon;
  const actorName = item.actor?.full_name ?? "Alguém";

  return (
    <div className="group flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors">
      {/* Avatar */}
      <Avatar className="size-8 shrink-0 mt-0.5">
        {item.actor?.avatar_url && (
          <AvatarImage src={item.actor.avatar_url} alt={actorName} />
        )}
        <AvatarFallback className="text-xs">{getInitials(item.actor?.full_name ?? null)}</AvatarFallback>
      </Avatar>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-medium text-sm">{actorName}</span>
          <ActionIcon className={`size-3.5 shrink-0 ${config.color}`} />
          <span className="text-sm text-muted-foreground">{buildDescription(item)}</span>
          {item.project_name && (
            <Badge variant="secondary" className="text-[10px] font-normal max-w-[160px] truncate">
              {item.project_name}
            </Badge>
          )}
        </div>

        {/* Field change: old → new */}
        {item.field_name && item.old_value && item.new_value && (
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-muted-foreground line-through">
              {item.old_value}
            </span>
            <IconArrowRight className="size-3 text-muted-foreground" />
            <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-foreground">
              {item.new_value}
            </span>
          </div>
        )}
      </div>

      {/* Timestamp */}
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 mt-1 cursor-default">
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {format(new Date(item.created_at), "dd/MM/yyyy HH:mm:ss")}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function TimelineSkeleton() {
  return (
    <div className="space-y-4 px-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="size-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3 w-20 shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface GlobalActivityTimelineProps {
  items: GlobalActivityItem[];
  isLoading: boolean;
}

export function GlobalActivityTimeline({ items, isLoading }: GlobalActivityTimelineProps) {
  if (isLoading) return <TimelineSkeleton />;
  if (items.length === 0) return null;

  // Group by date
  const grouped = new Map<string, GlobalActivityItem[]>();
  for (const item of items) {
    const dateKey = format(new Date(item.created_at), "yyyy-MM-dd");
    const existing = grouped.get(dateKey) ?? [];
    existing.push(item);
    grouped.set(dateKey, existing);
  }

  function formatDateHeading(dateKey: string): string {
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(new Date(Date.now() - 86_400_000), "yyyy-MM-dd");
    if (dateKey === today) return "Hoje";
    if (dateKey === yesterday) return "Ontem";
    return format(new Date(dateKey), "EEEE, dd 'de' MMMM", { locale: ptBR });
  }

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {Array.from(grouped.entries()).map(([dateKey, dayItems]) => (
          <div key={dateKey}>
            {/* Sticky date heading */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 mb-2">
              <h3 className="text-sm font-medium text-muted-foreground capitalize">
                {formatDateHeading(dateKey)}
              </h3>
            </div>

            <div className="space-y-0.5">
              {dayItems.map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
