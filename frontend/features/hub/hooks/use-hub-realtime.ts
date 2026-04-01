"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

const POSTS_KEY = "hub-posts";

export function useHubRealtime() {
  const supabase = createClient();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [newCount, setNewCount] = useState(0);
  const lastFetch = useRef(Date.now());

  useEffect(() => {
    const channel = supabase
      .channel("hub-posts-realtime")
      .on(
        "postgres_changes" as never,
        {
          event: "INSERT",
          schema: "public",
          table: "hub_posts",
        },
        (payload: Record<string, unknown>) => {
          const row = payload.new as Record<string, unknown> | undefined;
          if (!row) return;
          // Don't count own posts
          if (row.author_id === user?.id) {
            qc.invalidateQueries({ queryKey: [POSTS_KEY] });
            return;
          }
          setNewCount((c) => c + 1);

          // Check if user was mentioned (body contains user id)
          const body = (row.body as string) ?? "";
          if (user?.id && body.includes(user.id)) {
            toast.info("Voce foi mencionado em um novo post no Hub");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user?.id, qc]);

  const loadNew = useCallback(() => {
    setNewCount(0);
    lastFetch.current = Date.now();
    qc.invalidateQueries({ queryKey: [POSTS_KEY] });
  }, [qc]);

  return { newCount, loadNew };
}
