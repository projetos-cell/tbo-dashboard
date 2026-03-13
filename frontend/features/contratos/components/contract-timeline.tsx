"use client";

import { cn } from "@/lib/utils";
import {
  IconSend,
  IconCircleX,
  IconCircleCheck,
  IconBell,
  IconFileText,
  IconClock,
  IconPencil,
  IconAlertTriangle,
  IconActivity,
} from "@tabler/icons-react";

interface TimelineEvent {
  id: string;
  event_type: string;
  description: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

interface ContractTimelineProps {
  events: TimelineEvent[];
}

const EVENT_ICONS: Record<string, { icon: typeof IconSend; color: string }> = {
  sent_to_clicksign: { icon: IconSend, color: "text-blue-500" },
  envelope_canceled: { icon: IconCircleX, color: "text-red-500" },
  envelope_closed: { icon: IconCircleCheck, color: "text-green-500" },
  document_signed: { icon: IconPencil, color: "text-green-500" },
  notification_sent: { icon: IconBell, color: "text-yellow-500" },
  document_uploaded: { icon: IconFileText, color: "text-blue-500" },
  deadline_warning: { icon: IconAlertTriangle, color: "text-orange-500" },
  created: { icon: IconFileText, color: "text-gray-500" },
  status_change: { icon: IconActivity, color: "text-purple-500" },
};

const DEFAULT_ICON = { icon: IconClock, color: "text-muted-foreground" };

export function ContractTimeline({ events }: ContractTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <IconClock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Nenhum evento registrado
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {events.map((event, index) => {
        const config = EVENT_ICONS[event.event_type] ?? DEFAULT_ICON;
        const Icon = config.icon;
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0",
                  config.color
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              {!isLast && <div className="w-px flex-1 bg-border my-1" />}
            </div>

            <div className={cn("pb-6 min-w-0", isLast && "pb-0")}>
              <p className="text-sm font-medium">
                {event.description ?? event.event_type}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(event.created_at).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
