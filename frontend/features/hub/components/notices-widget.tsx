"use client";

import { IconBell } from "@tabler/icons-react";
import { useUnreadAnnouncements } from "@/features/hub/hooks/use-announcements";
import { SectionCard } from "./section-card";

export function NoticesWidget() {
  const { data: unread = [] } = useUnreadAnnouncements();

  return (
    <SectionCard>
      <div className="flex items-center gap-2 mb-3">
        <IconBell className="size-4 text-hub-orange" />
        <h3 className="text-sm font-semibold text-foreground">Avisos</h3>
        {unread.length > 0 && (
          <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-hub-orange-glow text-hub-orange">
            {unread.length}
          </span>
        )}
      </div>

      {unread.length === 0 ? (
        <div className="text-center py-4">
          <IconBell className="size-5 mx-auto mb-1 text-muted-foreground opacity-30" />
          <p className="text-[11px] text-muted-foreground">
            Nenhum aviso no momento
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {unread.slice(0, 3).map((ann) => (
            <div
              key={ann.id}
              className={`flex items-start gap-2 px-2 py-1.5 rounded-lg ${
                ann.priority === "urgent"
                  ? "bg-destructive/[0.06]"
                  : "bg-hub-orange-glow"
              }`}
            >
              <div
                className={`size-1.5 rounded-full shrink-0 mt-1.5 ${
                  ann.priority === "urgent"
                    ? "bg-destructive"
                    : ann.priority === "important"
                      ? "bg-hub-orange"
                      : "bg-blue-500"
                }`}
              />
              <div className="min-w-0">
                <p className="text-[11px] font-medium leading-snug truncate text-foreground">
                  {ann.title}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {ann.requires_read_confirmation ? "Requer confirmacao" : "Comunicado"}
                </p>
              </div>
            </div>
          ))}
          {unread.length > 3 && (
            <p className="text-[10px] text-center text-muted-foreground">
              +{unread.length - 3} mais
            </p>
          )}
        </div>
      )}
    </SectionCard>
  );
}
