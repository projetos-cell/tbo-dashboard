"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmailTemplates,
  getEmailTemplate,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  getEmailCampaigns,
  getEmailCampaign,
  createEmailCampaign,
  updateEmailCampaign,
  sendEmailCampaign,
  getEmailSends,
  getEmailSendsByCampaign,
  getEmailAnalytics,
  getEmailCampaignAnalytics,
} from "../services/email-studio";
import type { EmailTemplate, EmailCampaign } from "../types/marketing";
import { toast } from "sonner";

// ── Templates ──────────────────────────────────────────────────────

export function useEmailTemplates() {
  return useQuery({
    queryKey: ["email-studio", "templates"],
    queryFn: getEmailTemplates,
    staleTime: 1000 * 60 * 5,
  });
}

export function useEmailTemplate(id: string | null) {
  return useQuery({
    queryKey: ["email-studio", "templates", id],
    queryFn: () => getEmailTemplate(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateEmailTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Pick<EmailTemplate, "name" | "subject" | "html_content" | "category" | "tags">) =>
      createEmailTemplate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["email-studio", "templates"] });
      toast.success("Template criado com sucesso");
    },
    onError: () => toast.error("Erro ao criar template"),
  });
}

export function useUpdateEmailTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<EmailTemplate, "name" | "subject" | "html_content" | "category" | "tags">> }) =>
      updateEmailTemplate(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["email-studio", "templates"] });
      toast.success("Template atualizado");
    },
    onError: () => toast.error("Erro ao atualizar template"),
  });
}

export function useDeleteEmailTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEmailTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["email-studio", "templates"] });
      toast.success("Template excluido");
    },
    onError: () => toast.error("Erro ao excluir template"),
  });
}

// Feature #16 — Duplicar template
export function useDuplicateEmailTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (template: Pick<EmailTemplate, "name" | "subject" | "html_content" | "category" | "tags">) =>
      createEmailTemplate({ ...template, name: `${template.name} (cópia)` }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["email-studio", "templates"] });
      toast.success("Template duplicado");
    },
    onError: () => toast.error("Erro ao duplicar template"),
  });
}

// ── Campaigns ──────────────────────────────────────────────────────

export function useEmailCampaigns() {
  return useQuery({
    queryKey: ["email-studio", "campaigns"],
    queryFn: getEmailCampaigns,
    staleTime: 1000 * 60 * 5,
  });
}

export function useEmailCampaign(id: string | null) {
  return useQuery({
    queryKey: ["email-studio", "campaigns", id],
    queryFn: () => getEmailCampaign(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateEmailCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Pick<EmailCampaign, "name" | "subject" | "template_id" | "list_id" | "scheduled_at">) =>
      createEmailCampaign(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["email-studio", "campaigns"] });
      toast.success("Campanha de email criada");
    },
    onError: () => toast.error("Erro ao criar campanha de email"),
  });
}

export function useUpdateEmailCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<EmailCampaign, "name" | "subject" | "template_id" | "list_id" | "scheduled_at" | "status">> }) =>
      updateEmailCampaign(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["email-studio", "campaigns"] });
      toast.success("Campanha atualizada");
    },
    onError: () => toast.error("Erro ao atualizar campanha"),
  });
}

export function useSendEmailCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sendEmailCampaign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["email-studio"] });
      toast.success("Campanha enviada");
    },
    onError: () => toast.error("Erro ao enviar campanha"),
  });
}

// ── Sends ──────────────────────────────────────────────────────────

export function useEmailSends() {
  return useQuery({
    queryKey: ["email-studio", "sends"],
    queryFn: getEmailSends,
    staleTime: 1000 * 60 * 2,
  });
}

export function useEmailSendsByCampaign(campaignId: string | null) {
  return useQuery({
    queryKey: ["email-studio", "sends", campaignId],
    queryFn: () => getEmailSendsByCampaign(campaignId!),
    enabled: !!campaignId,
    staleTime: 1000 * 60 * 2,
  });
}

// ── Analytics ──────────────────────────────────────────────────────

export function useEmailAnalytics() {
  return useQuery({
    queryKey: ["email-studio", "analytics"],
    queryFn: getEmailAnalytics,
    staleTime: 1000 * 60 * 5,
  });
}

export function useEmailCampaignAnalytics(campaignId: string | null) {
  return useQuery({
    queryKey: ["email-studio", "analytics", campaignId],
    queryFn: () => getEmailCampaignAnalytics(campaignId!),
    enabled: !!campaignId,
    staleTime: 1000 * 60 * 5,
  });
}
