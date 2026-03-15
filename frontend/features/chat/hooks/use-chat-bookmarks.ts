"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
} from "../services/chat-bookmarks";

export function useBookmarks() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["chat-bookmarks", userId],
    queryFn: () => getBookmarks(supabase, userId!),
    enabled: !!userId,
  });
}

export function useAddBookmark() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => addBookmark(supabase, userId!, messageId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-bookmarks", userId] });
      toast.success("Mensagem salva nos favoritos");
    },
    onError: () => toast.error("Erro ao salvar mensagem"),
  });
}

export function useRemoveBookmark() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => removeBookmark(supabase, userId!, messageId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-bookmarks", userId] });
      toast.success("Removido dos favoritos");
    },
    onError: () => toast.error("Erro ao remover favorito"),
  });
}
