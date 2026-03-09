"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";
import type { PeopleEventType, EventSeverity } from "@/features/people/services/people-events";
import {
  Activity,
  MessageSquare,
  Target,
  TrendingDown,
  UserCheck,
  Award,
  Flame,
} from "lucide-react";

type EventRow = Database["public"]["Tables"]["people_events"]["Row"];

// ---------------------------------------------------------------------------
// Config per event type
// ---------------------------------------------------------------------------

const EVENT_CONFIG: Record<
  PeopleEventType,
  { label: string; icon: typeof Activity; color: string; bg: string }
> = {
  auto_task_created: {
    label: "Tarefa automática",
    icon: Activity,
    color: "text-amber-700",
    bg: "bg-amber-50",
  },
  one_on_one_completed: {
    label: "1:1 realizado",
    icon: MessageSquare,
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
  pdi_updated: {
    label: "PDI atualizado",
    icon: Target,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  performance_changed: {
    label: "Performance alterada",
    icon: TrendingDown,
    color: "text-purple-700",
    bg: "bg-purple-50",
  },
  status_changed: {
    label: "Status alterado",
    icon: UserCheck,
    color: "text-sky-700",
    bg: "bg-sky-50",
  },
  recognition_received: {
    label: "Reconhecimento",
    icon: Award,
    color: "text-yellow-700",
    bg: "bg-yellow-50",
  },
  overload_detected: {
    label: "Sobrecarga detectada",
    icon: Flame,
    color: "text-red-700",
    bg: "bg-red-50",
  },
};

const SEVERITY_BADGE: Record<EventSeverity, { label: string; variant: string; className: string }> =
  {
    info: { label: "Info", variant: "secondary", className: "" },
    warning: {
      label: "Atenção",
      variant: "secondary",
      className: "bg-amber-100 text-amber-800 border-amber-200",
    },
    critical: {
      label: "Crítico",
      variant: "secondary",
      className: "bg-red-100 text-red-800 border-red-200",
    },
  };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface PeopleTimelineProps {
  events: EventRow[];
  isLoading?: boolean;
  className?: string;
  showPersonName?: boolean;
  /** Map of personId → name (for global view) */
  personNames?: Record<string, string>;
  emptyMessage?: string;
}

function parseMetadata(raw: unknown): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw as Record<string, unknown>;
}

export function PeopleTimeline({
  events,
  isLoading,
  className,
  showPersonName = true,
  personNames,
  emptyMessage = "Nenhum evento registrado",
}: PeopleTimelineProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <p
        className={cn(
          "text-sm text-gray-500 py-8 text-center",
          className
        )}
      >
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {events.map((event, index) => {
        const config =
          EVENT_CONFIG[event.event_type as PeopleEventType] ?? EVENT_CONFIG.auto_task_created;
        const severity = SEVERITY_BADGE[event.severity as EventSeverity] ?? SEVERITY_BADGE.info;
        const Icon = config.icon;
        const meta = parseMetadata(event.metadata);
        const personName =
          showPersonName && personNames
            ? personNames[event.person_id] ?? "—"
            : null;

        return (
          <div
            key={event.id}
            className="flex items-start gap-3 py-2 relative"
          >
            {/* Timeline connector */}
            {index < events.length - 1 && (
              <div className="absolute left-4 top-10 bottom-0 w-px bg-border -translate-x-1/2" />
            )}

            {/* Icon */}
            <div
              className={cn(
                "flex items-center justify-center size-8 rounded-full shrink-0 z-10",
                config.bg
              )}
            >
              <Icon className={cn("size-4", config.color)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{config.label}</span>
                {event.severity !== "info" && (
                  <Badge
                    variant="secondary"
                    className={cn("text-[10px] px-1.5 py-0", severity.className)}
                  >
                    {severity.label}
                  </Badge>
                )}
              </div>

              {/* Person name (global view) */}
              {personName != null ? (
                <p className="text-xs font-medium text-gray-900 mt-0.5">
                  {personName}
                </p>
              ) : null}

              {/* Metadata summary */}
              {meta.summary ? (
                <p className="text-xs text-gray-500 mt-0.5">
                  {String(meta.summary)}
                </p>
              ) : null}

              {/* Timestamp */}
              <p className="text-xs text-gray-500 mt-0.5">
                {formatDistanceToNow(new Date(event.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
