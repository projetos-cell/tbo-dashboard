import type { SupabaseClient } from "@supabase/supabase-js";

// helpdesk tables not in generated types — define manually
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedClient = SupabaseClient<any>;

// ── Types ─────────────────────────────────────────────────────

export type TicketPriority = "baixa" | "media" | "alta" | "urgente";
export type TicketStatus =
  | "aberto"
  | "em_andamento"
  | "aguardando"
  | "resolvido"
  | "fechado";

export interface HelpdeskTicket {
  id: string;
  tenant_id: string;
  created_by: string;
  assigned_to: string | null;
  title: string;
  description: string | null;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  sla_due_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  // joined
  creator?: { full_name: string | null; avatar_url: string | null };
  assignee?: { full_name: string | null; avatar_url: string | null } | null;
}

export interface HelpdeskComment {
  id: string;
  ticket_id: string;
  author_id: string;
  body: string;
  is_internal: boolean;
  created_at: string;
  author?: { full_name: string | null; avatar_url: string | null };
}

export interface HelpdeskFaq {
  id: string;
  tenant_id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type TicketInsert = Omit<
  HelpdeskTicket,
  "id" | "created_at" | "updated_at" | "resolved_at" | "closed_at" | "creator" | "assignee"
>;

export type TicketUpdate = Partial<
  Pick<
    HelpdeskTicket,
    | "title"
    | "description"
    | "category"
    | "priority"
    | "status"
    | "assigned_to"
    | "sla_due_at"
    | "resolved_at"
    | "closed_at"
  >
>;

// ── Tickets ───────────────────────────────────────────────────

const TICKET_COLS = `
  id, tenant_id, created_by, assigned_to,
  title, description, category, priority, status,
  sla_due_at, resolved_at, closed_at, created_at, updated_at,
  creator:profiles!helpdesk_tickets_created_by_fkey(full_name, avatar_url),
  assignee:profiles!helpdesk_tickets_assigned_to_fkey(full_name, avatar_url)
`;

export async function getTickets(
  supabase: UntypedClient,
  tenantId: string,
  filters?: { status?: TicketStatus; my_only?: boolean; user_id?: string }
): Promise<HelpdeskTicket[]> {
  let query = (supabase as UntypedClient)
    .from("helpdesk_tickets")
    .select(TICKET_COLS)
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.my_only && filters.user_id) {
    query = query.eq("created_by", filters.user_id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as HelpdeskTicket[];
}

export async function getTicketById(
  supabase: UntypedClient,
  id: string
): Promise<HelpdeskTicket | null> {
  const { data, error } = await (supabase as UntypedClient)
    .from("helpdesk_tickets")
    .select(TICKET_COLS)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as unknown as HelpdeskTicket;
}

export async function createTicket(
  supabase: UntypedClient,
  ticket: TicketInsert
): Promise<HelpdeskTicket> {
  const { data, error } = await (supabase as UntypedClient)
    .from("helpdesk_tickets")
    .insert(ticket)
    .select(TICKET_COLS)
    .single();

  if (error) throw error;
  return data as unknown as HelpdeskTicket;
}

export async function updateTicket(
  supabase: UntypedClient,
  id: string,
  updates: TicketUpdate
): Promise<HelpdeskTicket> {
  const { data, error } = await (supabase as UntypedClient)
    .from("helpdesk_tickets")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(TICKET_COLS)
    .single();

  if (error) throw error;
  return data as unknown as HelpdeskTicket;
}

// ── Comments ──────────────────────────────────────────────────

const COMMENT_COLS = `
  id, ticket_id, author_id, body, is_internal, created_at,
  author:profiles!helpdesk_comments_author_id_fkey(full_name, avatar_url)
`;

export async function getComments(
  supabase: UntypedClient,
  ticketId: string
): Promise<HelpdeskComment[]> {
  const { data, error } = await (supabase as UntypedClient)
    .from("helpdesk_comments")
    .select(COMMENT_COLS)
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as HelpdeskComment[];
}

export async function createComment(
  supabase: UntypedClient,
  comment: { ticket_id: string; author_id: string; body: string; is_internal?: boolean }
): Promise<HelpdeskComment> {
  const { data, error } = await (supabase as UntypedClient)
    .from("helpdesk_comments")
    .insert({ is_internal: false, ...comment })
    .select(COMMENT_COLS)
    .single();

  if (error) throw error;
  return data as unknown as HelpdeskComment;
}

// ── FAQs ──────────────────────────────────────────────────────

export async function getFaqs(
  supabase: UntypedClient,
  tenantId: string
): Promise<HelpdeskFaq[]> {
  const { data, error } = await (supabase as UntypedClient)
    .from("helpdesk_faqs")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("category")
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as HelpdeskFaq[];
}

// ── KPIs ──────────────────────────────────────────────────────

export interface HelpdeskKPIs {
  total: number;
  open: number;
  in_progress: number;
  resolved_today: number;
}

export async function getHelpdeskKPIs(
  supabase: UntypedClient,
  tenantId: string
): Promise<HelpdeskKPIs> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await (supabase as UntypedClient)
    .from("helpdesk_tickets")
    .select("status, resolved_at")
    .eq("tenant_id", tenantId);

  if (error) throw error;
  const rows = (data ?? []) as { status: string; resolved_at: string | null }[];

  return {
    total: rows.length,
    open: rows.filter((r) => r.status === "aberto").length,
    in_progress: rows.filter((r) => r.status === "em_andamento").length,
    resolved_today: rows.filter(
      (r) =>
        r.status === "resolvido" &&
        r.resolved_at &&
        new Date(r.resolved_at) >= today
    ).length,
  };
}
