"use client";

import { NotificationCard, TRIGGER_CONFIG, DEFAULT_TRIGGER } from "./notification-card";
import type { NotificationRow } from "@/services/alerts";

interface NotificationsGroupedProps {
  notifications: NotificationRow[];
  actorMap?: Map<string, { name: string; avatar: string | null }>;
  onClickNotification: (n: NotificationRow) => void;
  onMarkRead: (e: React.MouseEvent, id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export function NotificationsGrouped({
  notifications,
  actorMap,
  onClickNotification,
  onMarkRead,
  onDelete,
}: NotificationsGroupedProps) {
  // Group by trigger_type, preserving insertion order
  const groupMap = new Map<string, NotificationRow[]>();
  for (const n of notifications) {
    const key = n.trigger_type ?? "general";
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(n);
  }

  // Sort groups: most unread first
  const groups = [...groupMap.entries()].sort(([, a], [, b]) => {
    const unreadA = a.filter((n) => !n.read).length;
    const unreadB = b.filter((n) => !n.read).length;
    return unreadB - unreadA;
  });

  return (
    <div className="space-y-6">
      {groups.map(([key, items]) => {
        const config = TRIGGER_CONFIG[key] ?? DEFAULT_TRIGGER;
        const Icon = config.icon;
        const unreadCount = items.filter((n) => !n.read).length;

        return (
          <div key={key}>
            {/* Section header */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className="h-5 w-5 rounded flex items-center justify-center shrink-0"
                style={{ backgroundColor: config.bg }}
              >
                <Icon className="h-3 w-3" style={{ color: config.color }} />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {config.label}
              </span>
              <span className="text-xs text-gray-400">({items.length})</span>
              {unreadCount > 0 && (
                <span className="h-4 min-w-4 px-1 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
              <div className="flex-1 h-px bg-gray-100 ml-1" />
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {items.map((n) => (
                <NotificationCard
                  key={n.id}
                  notification={n}
                  actorInfo={n.actor_id ? actorMap?.get(n.actor_id) : undefined}
                  onClick={() => onClickNotification(n)}
                  onMarkRead={(e) => onMarkRead(e, n.id)}
                  onDelete={(e) => onDelete(e, n.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
