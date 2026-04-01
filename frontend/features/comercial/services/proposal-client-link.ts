import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { ProposalWithItems } from "./proposals";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ClientDecision = "approved" | "rejected";

export interface ClientDecisionInput {
  decision: ClientDecision;
  feedback?: string;
}

export interface ClientLinkProposal extends ProposalWithItems {
  client_token: string | null;
  client_viewed_at: string | null;
  client_decided_at: string | null;
  client_feedback: string | null;
  sent_at: string | null;
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Generates a secure random token for sharing the proposal with the client.
 * Updates proposals.client_token.
 */
export async function generateClientToken(
  supabase: SupabaseClient<Database>,
  proposalId: string,
): Promise<string> {
  // Generate a cryptographically random token
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");

  const { error } = await supabase
    .from("proposals" as never)
    .update({
      client_token: token,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", proposalId);
  if (error) throw error;

  return token;
}

/**
 * Fetches a proposal by client token (public access, no auth required).
 * Marks client_viewed_at on first view.
 * Uses service role client to bypass RLS — caller must use createServiceClient().
 */
export async function getProposalByToken(
  supabase: SupabaseClient<Database>,
  token: string,
): Promise<ClientLinkProposal | null> {
  const { data: proposal, error } = await supabase
    .from("proposals" as never)
    .select("*")
    .eq("client_token", token)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw error;
  }

  const prop = proposal as unknown as ClientLinkProposal;

  // Mark first view
  if (!prop.client_viewed_at) {
    await supabase
      .from("proposals" as never)
      .update({ client_viewed_at: new Date().toISOString() } as never)
      .eq("client_token", token);
    prop.client_viewed_at = new Date().toISOString();
  }

  // Fetch items
  const { data: items, error: itemsError } = await supabase
    .from("proposal_items" as never)
    .select("*")
    .eq("proposal_id", prop.id)
    .order("sort_order", { ascending: true });
  if (itemsError) throw itemsError;

  return {
    ...prop,
    items: (items ?? []) as unknown as ClientLinkProposal["items"],
  };
}

/**
 * Submits the client's decision (approve/reject) for a proposal.
 */
const DECISION_TO_STATUS: Record<ClientDecision, string> = {
  approved: "aprovada",
  rejected: "recusada",
};

export async function submitClientDecision(
  supabase: SupabaseClient<Database>,
  token: string,
  { decision, feedback }: ClientDecisionInput,
  proposal?: ClientLinkProposal | null,
): Promise<void> {
  const { error } = await supabase
    .from("proposals" as never)
    .update({
      status: DECISION_TO_STATUS[decision],
      client_decided_at: new Date().toISOString(),
      client_feedback: feedback ?? null,
      ...(decision === "approved" ? { approved_at: new Date().toISOString() } : {}),
      updated_at: new Date().toISOString(),
    } as never)
    .eq("client_token", token);
  if (error) throw error;

  // Fire-and-forget notification email
  if (proposal) {
    notifyProposalDecision(proposal, decision, feedback ?? null, token).catch(
      (err) => console.error("Failed to send proposal notification:", err),
    );
  }
}

/**
 * Sends notification email to TBO team when client makes a decision.
 */
async function notifyProposalDecision(
  proposal: ClientLinkProposal,
  decision: ClientDecision,
  feedback: string | null,
  token: string,
): Promise<void> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!SUPABASE_URL) return;

  await fetch(`${SUPABASE_URL}/functions/v1/proposal-notify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      proposal_name: proposal.name,
      ref_code: proposal.ref_code,
      company: proposal.company,
      contact_name: proposal.contact_name,
      decision,
      feedback,
      value: proposal.value,
      token,
    }),
  });
}
