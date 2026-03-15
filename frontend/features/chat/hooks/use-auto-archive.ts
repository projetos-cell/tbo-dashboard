"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { getChannelsForAutoArchive, archiveChannel } from "@/features/chat/services/chat";
import { toast } from "sonner";

/**
 * #32 — Auto-archive
 * On mount, checks for channels that exceeded their auto_archive_days
 * threshold and archives them automatically. Only runs for founders/diretoria
 * to avoid race conditions with multiple clients.
 */
export function useAutoArchive() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const role = useAuthStore((s) => s.role);
  const qc = useQueryClient();

  useEffect(() => {
    // Only founders and diretoria trigger auto-archive to avoid race conditions
    if (!tenantId || !role) return;
    if (role !== "founder" && role !== "diretoria") return;

    const supabase = createClient();

    async function runAutoArchive() {
      try {
        const eligible = await getChannelsForAutoArchive(supabase);
        if (eligible.length === 0) return;

        await Promise.all(eligible.map((ch) => archiveChannel(supabase, ch.id)));

        qc.invalidateQueries({ queryKey: ["chat-channels", tenantId] });
        qc.invalidateQueries({ queryKey: ["chat-channels-with-members", tenantId] });

        toast.info(
          eligible.length === 1
            ? `Canal "${eligible[0].name}" foi auto-arquivado por inatividade.`
            : `${eligible.length} canais foram auto-arquivados por inatividade.`,
          { duration: 5000 },
        );
      } catch {
        // Silent — auto-archive failure is non-critical
      }
    }

    runAutoArchive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, role]);
}
