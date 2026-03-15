"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  checkAndNotifyOverdueTasks,
  checkAndNotifyReminders,
} from "@/services/notification-triggers";

/**
 * Runs overdue + reminder checks once per session on mount.
 * Creates in-app notifications for overdue tasks and upcoming reminders.
 */
export function useOverdueCheck() {
  const user = useAuthStore((s) => s.user);
  const tenantId = useAuthStore((s) => s.tenantId);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!user?.id || !tenantId || hasRun.current) return;
    hasRun.current = true;

    const supabase = createClient();

    // Run checks in background — no await needed
    void checkAndNotifyOverdueTasks(supabase, {
      tenantId,
      userId: user.id,
    });

    void checkAndNotifyReminders(supabase, {
      tenantId,
      userId: user.id,
    });
  }, [user?.id, tenantId]);
}
