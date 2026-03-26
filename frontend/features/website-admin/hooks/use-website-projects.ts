"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getWebsiteProjects,
  getWebsiteProject,
  createWebsiteProject,
  updateWebsiteProject,
  deleteWebsiteProject,
  reorderWebsiteProjects,
  uploadWebsiteImage,
} from "../services/website-projects";
import type { WebsiteProjectInsert, WebsiteProjectUpdate } from "../types";
import { toast } from "sonner";

const QK = "website-projects";

export function useWebsiteProjects() {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: [QK, tenantId],
    queryFn: () => getWebsiteProjects(createClient()),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useWebsiteProject(id: string | null) {
  return useQuery({
    queryKey: [QK, id],
    queryFn: () => getWebsiteProject(createClient(), id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateWebsiteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: WebsiteProjectInsert) =>
      createWebsiteProject(createClient(), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success("Projeto criado");
    },
    onError: () => toast.error("Erro ao criar projeto"),
  });
}

export function useUpdateWebsiteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WebsiteProjectUpdate }) =>
      updateWebsiteProject(createClient(), id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success("Projeto atualizado");
    },
    onError: () => toast.error("Erro ao atualizar projeto"),
  });
}

export function useDeleteWebsiteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWebsiteProject(createClient(), id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success("Projeto excluído");
    },
    onError: () => toast.error("Erro ao excluir projeto"),
  });
}

export function useReorderWebsiteProjects() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: string; sort_order: number }[]) =>
      reorderWebsiteProjects(createClient(), items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
    },
    onError: () => toast.error("Erro ao reordenar projetos"),
  });
}

export function useUploadWebsiteImage() {
  return useMutation({
    mutationFn: ({
      tenantId,
      file,
      folder,
    }: {
      tenantId: string;
      file: File;
      folder?: string;
    }) => uploadWebsiteImage(createClient(), tenantId, file, folder),
    onError: () => toast.error("Erro ao enviar imagem"),
  });
}

/** Import an external image URL into Supabase Storage */
async function importImageFromUrl(
  url: string,
  tenantId: string,
  folder: string,
): Promise<string> {
  const res = await fetch("/api/website-admin/import-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, tenantId, folder }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Falha ao importar imagem");
  }
  const data = await res.json();
  return data.publicUrl as string;
}

/** Batch-import external images into Supabase Storage */
export function useImportExternalImages() {
  return useMutation({
    mutationFn: async ({
      urls,
      tenantId,
      folder,
      onProgress,
    }: {
      urls: string[];
      tenantId: string;
      folder: string;
      onProgress?: (done: number, total: number) => void;
    }) => {
      const results: string[] = [];
      for (let i = 0; i < urls.length; i++) {
        const newUrl = await importImageFromUrl(urls[i], tenantId, folder);
        results.push(newUrl);
        onProgress?.(i + 1, urls.length);
      }
      return results;
    },
    onError: () => toast.error("Erro ao importar imagens"),
  });
}
