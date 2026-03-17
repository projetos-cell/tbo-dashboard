import type {
  EmailTemplate,
  EmailCampaign,
  EmailSend,
  EmailAnalytics,
} from "../types/marketing";

const API_BASE = "/api/email-studio";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "Unknown error");
    throw new Error(`Email Studio API error (${res.status}): ${body}`);
  }
  return res.json() as Promise<T>;
}

// ── Templates ──────────────────────────────────────────────────────

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  return apiFetch<EmailTemplate[]>("/templates");
}

export async function getEmailTemplate(id: string): Promise<EmailTemplate> {
  return apiFetch<EmailTemplate>(`/templates/${id}`);
}

export async function createEmailTemplate(
  data: Pick<EmailTemplate, "name" | "subject" | "html_content" | "category" | "tags">,
): Promise<EmailTemplate> {
  return apiFetch<EmailTemplate>("/templates", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEmailTemplate(
  id: string,
  data: Partial<Pick<EmailTemplate, "name" | "subject" | "html_content" | "category" | "tags">>,
): Promise<EmailTemplate> {
  return apiFetch<EmailTemplate>(`/templates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteEmailTemplate(id: string): Promise<void> {
  await apiFetch<void>(`/templates/${id}`, { method: "DELETE" });
}

// ── Campaigns ──────────────────────────────────────────────────────

export async function getEmailCampaigns(): Promise<EmailCampaign[]> {
  return apiFetch<EmailCampaign[]>("/campaigns");
}

export async function getEmailCampaign(id: string): Promise<EmailCampaign> {
  return apiFetch<EmailCampaign>(`/campaigns/${id}`);
}

export async function createEmailCampaign(
  data: Pick<EmailCampaign, "name" | "subject" | "template_id" | "list_id" | "scheduled_at">,
): Promise<EmailCampaign> {
  return apiFetch<EmailCampaign>("/campaigns", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEmailCampaign(
  id: string,
  data: Partial<Pick<EmailCampaign, "name" | "subject" | "template_id" | "list_id" | "scheduled_at" | "status">>,
): Promise<EmailCampaign> {
  return apiFetch<EmailCampaign>(`/campaigns/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function sendEmailCampaign(id: string): Promise<EmailSend> {
  return apiFetch<EmailSend>(`/campaigns/${id}/send`, { method: "POST" });
}

// ── Sends ──────────────────────────────────────────────────────────

export async function getEmailSends(): Promise<EmailSend[]> {
  return apiFetch<EmailSend[]>("/sends");
}

export async function getEmailSendsByCampaign(campaignId: string): Promise<EmailSend[]> {
  return apiFetch<EmailSend[]>(`/campaigns/${campaignId}/sends`);
}

// ── Analytics ──────────────────────────────────────────────────────

export async function getEmailAnalytics(): Promise<EmailAnalytics[]> {
  return apiFetch<EmailAnalytics[]>("/analytics");
}

export async function getEmailCampaignAnalytics(campaignId: string): Promise<EmailAnalytics> {
  return apiFetch<EmailAnalytics>(`/analytics/${campaignId}`);
}
