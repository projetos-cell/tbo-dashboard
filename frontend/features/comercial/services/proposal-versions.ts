import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { ProposalRow, ProposalItemRow } from "./proposals";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProposalVersion extends ProposalRow {
  version: number;
  parent_proposal_id: string | null;
}

export interface ProposalDiff {
  valueChange: number;
  valueChangePct: number;
  itemsAdded: ProposalItemRow[];
  itemsRemoved: ProposalItemRow[];
  itemsModified: Array<{
    before: ProposalItemRow;
    after: ProposalItemRow;
    changes: string[];
  }>;
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Creates a new version of an existing proposal.
 * Copies all fields + items, increments version, sets parent_proposal_id, status = 'draft'.
 */
export async function createProposalVersion(
  supabase: SupabaseClient<Database>,
  originalId: string,
): Promise<ProposalVersion> {
  // 1. Fetch original proposal
  const { data: original, error: origError } = await supabase
    .from("proposals" as never)
    .select("*")
    .eq("id", originalId)
    .single();
  if (origError) throw origError;

  const orig = original as unknown as ProposalVersion;

  // 2. Fetch items
  const { data: items, error: itemsError } = await supabase
    .from("proposal_items" as never)
    .select("*")
    .eq("proposal_id", originalId)
    .order("sort_order", { ascending: true });
  if (itemsError) throw itemsError;

  const currentVersion = (orig.version as number | null) ?? 1;
  const parentId = orig.parent_proposal_id ?? originalId;

  // 3. Create new proposal (new version)
  const { id: _id, created_at: _ca, updated_at: _ua, ref_code: _rc, ...rest } = orig;
  void _id; void _ca; void _ua; void _rc;

  const { data: newProposal, error: createError } = await supabase
    .from("proposals" as never)
    .insert({
      ...rest,
      version: currentVersion + 1,
      parent_proposal_id: parentId,
      status: "draft",
      client_token: null,
      client_viewed_at: null,
      client_decided_at: null,
      client_feedback: null,
      sent_at: null,
      approved_at: null,
      contract_id: null,
      project_id: null,
    } as never)
    .select()
    .single();
  if (createError) throw createError;

  const created = newProposal as unknown as ProposalVersion;

  // 4. Copy items to new proposal
  const originalItems = (items ?? []) as unknown as ProposalItemRow[];
  if (originalItems.length > 0) {
    const newItems = originalItems.map(({ id: _iid, created_at: _ica, updated_at: _iua, ...item }) => {
      void _iid; void _ica; void _iua;
      return {
        ...item,
        proposal_id: created.id,
      };
    });

    const { error: insertItemsError } = await supabase
      .from("proposal_items" as never)
      .insert(newItems as never);
    if (insertItemsError) throw insertItemsError;
  }

  return created;
}

/**
 * Returns all versions of a proposal (follows parent chain).
 */
export async function getProposalVersions(
  supabase: SupabaseClient<Database>,
  proposalId: string,
): Promise<ProposalVersion[]> {
  // Get the root proposal id (follow parent chain)
  const { data: proposal, error: propError } = await supabase
    .from("proposals" as never)
    .select("id, parent_proposal_id")
    .eq("id", proposalId)
    .single();
  if (propError) throw propError;

  const root = proposal as unknown as { id: string; parent_proposal_id: string | null };
  const rootId = root.parent_proposal_id ?? root.id;

  // Fetch all proposals that share this root (either are the root or have it as parent)
  const { data, error } = await supabase
    .from("proposals" as never)
    .select("*")
    .or(`id.eq.${rootId},parent_proposal_id.eq.${rootId}`)
    .order("version" as never, { ascending: true });
  if (error) throw error;

  return (data ?? []) as unknown as ProposalVersion[];
}

/**
 * Computes a human-readable diff between two proposal versions.
 */
export function getProposalDiff(
  proposal1: ProposalVersion & { items: ProposalItemRow[] },
  proposal2: ProposalVersion & { items: ProposalItemRow[] },
): ProposalDiff {
  const valueChange = proposal2.value - proposal1.value;
  const valueChangePct =
    proposal1.value !== 0 ? (valueChange / proposal1.value) * 100 : 0;

  const items1Map = new Map(proposal1.items.map((i) => [i.service_id ?? i.title, i]));
  const items2Map = new Map(proposal2.items.map((i) => [i.service_id ?? i.title, i]));

  const itemsAdded: ProposalItemRow[] = [];
  const itemsRemoved: ProposalItemRow[] = [];
  const itemsModified: ProposalDiff["itemsModified"] = [];

  // Added or modified in v2
  for (const [key, item2] of items2Map) {
    const item1 = items1Map.get(key);
    if (!item1) {
      itemsAdded.push(item2);
    } else {
      const changes: string[] = [];
      if (item1.quantity !== item2.quantity) changes.push("quantity");
      if (item1.unit_price !== item2.unit_price) changes.push("unit_price");
      if (item1.discount_pct !== item2.discount_pct) changes.push("discount_pct");
      if (item1.title !== item2.title) changes.push("title");
      if (changes.length > 0) {
        itemsModified.push({ before: item1, after: item2, changes });
      }
    }
  }

  // Removed in v2
  for (const [key, item1] of items1Map) {
    if (!items2Map.has(key)) {
      itemsRemoved.push(item1);
    }
  }

  return {
    valueChange,
    valueChangePct,
    itemsAdded,
    itemsRemoved,
    itemsModified,
  };
}
