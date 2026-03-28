import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { ProposalWithItems } from "./proposals";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConversionStatus {
  hasContract: boolean;
  hasProject: boolean;
  contractId: string | null;
  projectId: string | null;
}

export interface ContractRow {
  id: string;
  tenant_id: string;
  proposal_id: string | null;
  client: string | null;
  company: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  value: number;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface ProjectRow {
  id: string;
  tenant_id: string;
  proposal_id: string | null;
  name: string;
  client: string | null;
  status: string;
  budget: number;
  notes: string | null;
  created_at: string;
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Creates a contract record from an approved proposal.
 * Updates proposal.contract_id with the new contract ID.
 */
export async function convertProposalToContract(
  supabase: SupabaseClient<Database>,
  proposalId: string,
  tenantId: string,
): Promise<ContractRow> {
  // Fetch proposal
  const { data: proposalData, error: propError } = await supabase
    .from("proposals" as never)
    .select("*")
    .eq("id", proposalId)
    .single();
  if (propError) throw propError;

  const proposal = proposalData as unknown as ProposalWithItems;

  // Create contract
  const { data: contract, error: contractError } = await supabase
    .from("contracts" as never)
    .insert({
      tenant_id: tenantId,
      proposal_id: proposalId,
      client: proposal.client,
      company: proposal.company,
      contact_name: proposal.contact_name,
      contact_email: proposal.contact_email,
      contact_phone: proposal.contact_phone,
      value: proposal.value,
      status: "active",
      notes: proposal.notes,
    } as never)
    .select()
    .single();
  if (contractError) throw contractError;

  const created = contract as unknown as ContractRow;

  // Update proposal with contract_id
  const { error: updateError } = await supabase
    .from("proposals" as never)
    .update({
      contract_id: created.id,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", proposalId);
  if (updateError) throw updateError;

  return created;
}

/**
 * Creates a project from a proposal (after conversion to contract).
 * Updates proposal.project_id with the new project ID.
 */
export async function convertProposalToProject(
  supabase: SupabaseClient<Database>,
  proposalId: string,
  tenantId: string,
): Promise<ProjectRow> {
  // Fetch proposal
  const { data: proposalData, error: propError } = await supabase
    .from("proposals" as never)
    .select("*")
    .eq("id", proposalId)
    .single();
  if (propError) throw propError;

  const proposal = proposalData as unknown as ProposalWithItems;

  // Create project
  const { data: project, error: projectError } = await supabase
    .from("projects" as never)
    .insert({
      tenant_id: tenantId,
      proposal_id: proposalId,
      name: proposal.name,
      client: proposal.client ?? proposal.company,
      status: "planning",
      budget: proposal.value,
      notes: proposal.notes,
    } as never)
    .select()
    .single();
  if (projectError) throw projectError;

  const created = project as unknown as ProjectRow;

  // Update proposal with project_id
  const { error: updateError } = await supabase
    .from("proposals" as never)
    .update({
      project_id: created.id,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", proposalId);
  if (updateError) throw updateError;

  return created;
}

/**
 * Returns the conversion status of a proposal (contract + project).
 */
export async function getConversionStatus(
  supabase: SupabaseClient<Database>,
  proposalId: string,
): Promise<ConversionStatus> {
  const { data, error } = await supabase
    .from("proposals" as never)
    .select("contract_id, project_id")
    .eq("id", proposalId)
    .single();
  if (error) throw error;

  const row = data as unknown as { contract_id: string | null; project_id: string | null };

  return {
    hasContract: !!row.contract_id,
    hasProject: !!row.project_id,
    contractId: row.contract_id,
    projectId: row.project_id,
  };
}
