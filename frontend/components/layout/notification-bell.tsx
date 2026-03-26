"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAlertCount } from "@/hooks/use-alert-count";
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "@/hooks/use-alerts";
import { IconBell, IconCheck, IconTrophy } from "@tabler/icons-react";
import { DealWonDrawer } from "./deal-won-drawer";
import type { NotificationRow } from "@/services/alerts";

function isDealWonNotification(n: NotificationRow): boolean {
  return n.type === "success" && n.entity_type === "deal" && (n.title?.includes("Deal Fechado") || n.title?.includes("Deal Fechado!") || n.title?.includes("Novo Deal Fechado"));
}

// ── Notification Item ─────────────────────────────────

export function NotificationItem({
  notification,
  onMarkRead,
  onClose,
  onDealWon,
}: {
  notification: NotificationRow;
  onMarkRead: (id: string) => void;
  onClose: () => void;
  onDealWon?: (dealId: string) => void;
}) {
  const router = useRouter();
  const timeLabel = notification.created_at
    ? formatDistanceToNow(new Date(notification.created_at), { locale: ptBR, addSuffix: false })
    : "";

  const isDealWon = isDealWonNotification(notification);

  return (
    <button
      onClick={() => {
        if (!notification.read) onMarkRead(notification.id);
        if (isDealWon && notification.entity_id && onDealWon) {
          onClose();
          onDealWon(notification.entity_id);
        } else {
          onClose();
          if (notification.action_url) router.push(notification.action_url);
        }
      }}
      className="flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent/50"
    >
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isDealWon ? "bg-[#fff4ec]" : "bg-muted"}`}>
        {isDealWon ? (
          <IconTrophy className="h-4 w-4 text-[#ff6200]" strokeWidth={1.5} />
        ) : (
          <IconBell className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${!notification.read ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
          {notification.title}
        </p>
        {notification.body && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{notification.body}</p>
        )}
        <p className="mt-1 text-[11px] text-muted-foreground/70">{timeLabel}</p>
      </div>
      {!notification.read && (
        <div className={`mt-2 h-2 w-2 shrink-0 rounded-full ${isDealWon ? "bg-[#ff6200]" : "bg-blue-500"}`} />
      )}
    </button>
  );
}

// ── Notification Bell ─────────────────────────────────

export function NotificationBell() {
  const router = useRouter();
  const count = useAlertCount();
  const [open, setOpen] = useState(false);
  const [dealWonOpen, setDealWonOpen] = useState(false);
  const [dealWonId, setDealWonId] = useState<string | null>(null);

  const { data: allNotifications = [] } = useNotifications();
  const markRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();

  const handleDealWon = (dealId: string) => {
    setDealWonId(dealId);
    setDealWonOpen(true);
  };

  const displayItems = useMemo(() => {
    const unread = allNotifications.filter((n) => !n.read);
    const read = allNotifications.filter((n) => n.read);
    return [...unread, ...read].slice(0, 8);
  }, [allNotifications]);

  return (
    <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          data-tour="notifications"
          className="relative rounded-md text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          aria-label={`Notificações${count > 0 ? ` (${count})` : ""}`}
        >
          <IconBell className="h-5 w-5" strokeWidth={1.5} />
          {count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-semibold leading-none text-white">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="text-sm font-semibold">Notificações</h4>
          {count > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <IconCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
              Marcar todas
            </button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <IconBell className="h-8 w-8 text-muted-foreground/40" strokeWidth={1.5} />
              <p className="mt-2 text-sm text-muted-foreground">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="py-1">
              {displayItems.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={(id) => markRead.mutate(id)}
                  onClose={() => setOpen(false)}
                  onDealWon={handleDealWon}
                />
              ))}
            </div>
          )}
        </ScrollArea>
        {allNotifications.length > 0 && (
          <div className="border-t">
            <button
              onClick={() => { setOpen(false); router.push("/alerts"); }}
              className="flex w-full items-center justify-center py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Ver todas as notificações
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>

    <DealWonDrawer
      open={dealWonOpen}
      onOpenChange={setDealWonOpen}
      dealId={dealWonId}
    />
    </>
  );
}
