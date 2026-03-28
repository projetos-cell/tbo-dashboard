"use client";

import { useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getBlogPosts,
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  uploadBlogCover,
  uploadBlogImage,
  checkSlugExists,
  getBlogTags,
} from "../services/blog-posts";
import type { BlogPostInsert, BlogPostUpdate } from "../types";
import { toast } from "sonner";

const QUERY_KEY = "blog-posts";

export function useBlogPosts() {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: [QUERY_KEY, tenantId],
    queryFn: () => getBlogPosts(createClient()),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useBlogPost(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getBlogPost(createClient(), id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BlogPostInsert) => createBlogPost(createClient(), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Artigo criado");
    },
    onError: () => toast.error("Erro ao criar artigo"),
  });
}

export function useUpdateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BlogPostUpdate }) =>
      updateBlogPost(createClient(), id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Artigo atualizado");
    },
    onError: () => toast.error("Erro ao atualizar artigo"),
  });
}

export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBlogPost(createClient(), id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Artigo excluido");
    },
    onError: () => toast.error("Erro ao excluir artigo"),
  });
}

export function useUploadBlogCover() {
  return useMutation({
    mutationFn: ({ tenantId, file }: { tenantId: string; file: File }) =>
      uploadBlogCover(createClient(), tenantId, file),
    onError: () => toast.error("Erro ao enviar imagem de capa"),
  });
}

export function useUploadBlogImage() {
  return useMutation({
    mutationFn: ({ tenantId, file }: { tenantId: string; file: File }) =>
      uploadBlogImage(createClient(), tenantId, file),
    onError: () => toast.error("Erro ao enviar imagem"),
  });
}

export function useCheckSlugExists() {
  return useCallback(
    (slug: string, excludeId?: string) =>
      checkSlugExists(createClient(), slug, excludeId),
    [],
  );
}

export function useBlogTags() {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["blog-tags", tenantId],
    queryFn: () => getBlogTags(createClient()),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

/** Realtime subscription — invalidates blog-posts cache on any remote change */
export function useBlogRealtime() {
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  useEffect(() => {
    if (!tenantId) return;
    const supabase = createClient();
    const channel = supabase
      .channel("blog_posts_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blog_posts" },
        () => {
          qc.invalidateQueries({ queryKey: [QUERY_KEY] });
          qc.invalidateQueries({ queryKey: ["blog-tags"] });
        },
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [tenantId, qc]);
}
