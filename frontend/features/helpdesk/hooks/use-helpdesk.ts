"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  getComments,
  createComment,
  getFaqs,
  getHelpdeskKPIs,
  type TicketStatus,
  type TicketInsert,
  type TicketUpdate,
} from "@/features/helpdesk/services/helpdesk";

function useSupabase() {
  return createClient();
}

// ── Tickets ───────────────────────────────────────────────────

export function useTickets(filters?: { status?: TicketStatus; my_only?: boolean }) {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["helpdesk-tickets", tenantId, filters],
    queryFn: () =>
      getTickets(supabase, tenantId!, { ...filters, user_id: userId ?? undefined }),
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useTicket(id: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["helpdesk-ticket", id],
    queryFn: () => getTicketById(supabase, id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateTicket() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (ticket: Omit<TicketInsert, "tenant_id">) =>
      createTicket(supabase, { ...ticket, tenant_id: tenantId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["helpdesk-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["helpdesk-kpis"] });
    },
  });
}

export function useUpdateTicket() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TicketUpdate }) =>
      updateTicket(supabase, id, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["helpdesk-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["helpdesk-ticket", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["helpdesk-kpis"] });
    },
  });
}

// ── Comments ──────────────────────────────────────────────────

export function useTicketComments(ticketId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["helpdesk-comments", ticketId],
    queryFn: () => getComments(supabase, ticketId),
    enabled: !!ticketId,
    staleTime: 1000 * 30,
  });
}

export function useCreateComment() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: {
      ticket_id: string;
      author_id: string;
      body: string;
      is_internal?: boolean;
    }) => createComment(supabase, comment),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["helpdesk-comments", variables.ticket_id],
      });
    },
  });
}

// ── FAQs ──────────────────────────────────────────────────────

export function useFaqs() {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["helpdesk-faqs", tenantId],
    queryFn: () => getFaqs(supabase, tenantId!),
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 10,
  });
}

// ── KPIs ──────────────────────────────────────────────────────

export function useHelpdeskKPIs() {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["helpdesk-kpis", tenantId],
    queryFn: () => getHelpdeskKPIs(supabase, tenantId!),
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 2,
  });
}
