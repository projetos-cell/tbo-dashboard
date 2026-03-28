import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { formatProjectName, generateProjectCode } from "@/features/projects/services/projects";
import { createD3DFlow } from "@/features/projects/d3d-pipeline/service";
import { logAuditTrail } from "@/lib/audit-trail";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];

// ── Types ────────────────────────────────────────────────────────────

export interface DealWonAutomationResult {
  project: {
    id: string;
    name: string;
    code: string;
  };
  d3dFlowCreated: boolean;
  meetingCreated: boolean;
  meetingId: string | null;
}

export interface DealWonAutomationParams {
  deal: DealRow;
  tenantId: string;
  userId: string;
  /** Optional: schedule kickoff meeting */
  kickoff?: {
    date: string;       // ISO date YYYY-MM-DD
    time: string;       // HH:mm
    durationMinutes?: number;
    participants?: string[];
    agenda?: string;
  };
}

// ── BU Detection ─────────────────────────────────────────────────────

const BU_KEYWORDS: Record<string, string[]> = {
  "Digital 3D": ["3d", "digital 3d", "modelagem", "render", "imagem", "imagens estáticas", "animação 3d", "foto inserção"],
  "Audiovisual": ["audiovisual", "filme", "vídeo", "video", "captação", "drone", "edição", "roteirização"],
  "Branding": ["branding", "marca", "identidade visual", "logo"],
  "Marketing": ["marketing", "campanha", "mídia", "social media"],
  "Gamificação": ["gamificação", "gamificacao", "game", "interativo"],
  "Interiores": ["interiores", "interior", "decoração"],
};

/** Detect BUs from deal services and notes */
function detectBUs(deal: DealRow): string[] {
  const services = deal.services ?? [];
  const searchText = [
    ...services,
    deal.name,
    deal.notes ?? "",
  ].join(" ").toLowerCase();

  const detected = new Set<string>();
  for (const [bu, keywords] of Object.entries(BU_KEYWORDS)) {
    for (const kw of keywords) {
      if (searchText.includes(kw)) {
        detected.add(bu);
        break;
      }
    }
  }

  return detected.size > 0 ? Array.from(detected) : ["Digital 3D"];
}

/** Extract construtora from deal company name */
function extractConstrutora(company: string | null): string | null {
  if (!company) return null;
  // Remove common suffixes: Construtora, Incorporadora, S.A., Ltda
  return company
    .replace(/\s*(construtora|incorporadora|s\.?a\.?|ltda\.?|eireli)\s*/gi, "")
    .trim() || company;
}

/** Extract empreendimento name from deal name */
function extractEmpreendimento(dealName: string, company: string | null): string {
  let name = dealName;
  // Remove company prefix patterns: "Company — Name", "Company - Name"
  if (company) {
    const patterns = [
      new RegExp(`^${escapeRegex(company)}\\s*[—–\\-]\\s*`, "i"),
      new RegExp(`^${escapeRegex(company)}\\s+`, "i"),
    ];
    for (const pattern of patterns) {
      name = name.replace(pattern, "");
    }
  }
  return name.trim() || dealName;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── Main Automation ──────────────────────────────────────────────────

/**
 * Executes the deal-won automation pipeline:
 * 1. Creates project from deal data
 * 2. Initializes D3D pipeline (if BU includes Digital 3D)
 * 3. Creates kickoff meeting (if params provided)
 * 4. Logs activity on the deal
 */
export async function executeDealWonAutomation(
  supabase: SupabaseClient<Database>,
  params: DealWonAutomationParams,
): Promise<DealWonAutomationResult> {
  const { deal, tenantId, userId } = params;

  // ── 1. Check if project already exists for this deal ──────────────
  const { data: existingProject } = await supabase
    .from("projects")
    .select("id, name, code")
    .or(`deal_id.eq.${deal.id},and(source.eq.deal_automation,name.ilike.%${deal.company ?? "___NOMATCH___"}%)`)
    .limit(1)
    .maybeSingle();

  if (existingProject) {
    return {
      project: {
        id: existingProject.id,
        name: existingProject.name,
        code: existingProject.code ?? "",
      },
      d3dFlowCreated: false,
      meetingCreated: false,
      meetingId: null,
    };
  }

  // ── 2. Detect BUs and build project data ──────────────────────────
  const bus = detectBUs(deal);
  const construtora = extractConstrutora(deal.company);
  const empreendimento = extractEmpreendimento(deal.name, deal.company);
  const projectName = formatProjectName(empreendimento, construtora);
  const projectCode = await generateProjectCode(supabase);

  const projectData: ProjectInsert = {
    name: projectName,
    code: projectCode,
    tenant_id: tenantId,
    client: deal.contact ?? deal.company ?? null,
    client_company: deal.company ?? null,
    construtora: construtora,
    bus: bus,
    services: deal.services ?? [],
    value: deal.value ?? null,
    owner_id: deal.owner_id ?? null,
    owner_name: deal.owner_name ?? null,
    source: "deal_automation",
    status: "briefing",
    priority: deal.priority ?? "media",
    deal_id: deal.id,
    notes: buildProjectNotes(deal),
  };

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert(projectData as never)
    .select("id, name, code")
    .single();

  if (projectError) throw projectError;

  // ── 3. Initialize D3D pipeline (if applicable) ────────────────────
  let d3dFlowCreated = false;
  if (bus.includes("Digital 3D")) {
    try {
      await createD3DFlow(supabase, {
        projectId: project.id,
        tenantId,
        createdBy: userId,
      });
      d3dFlowCreated = true;
    } catch (err) {
      // Log but don't fail the whole automation
      console.error("[DealWonAutomation] Failed to create D3D flow:", err);
    }
  }

  // ── 4. Create kickoff meeting (if provided) ───────────────────────
  let meetingCreated = false;
  let meetingId: string | null = null;

  if (params.kickoff) {
    try {
      const { data: meeting, error: meetingError } = await supabase
        .from("meetings")
        .insert({
          title: `Kickoff — ${projectName}`,
          date: params.kickoff.date,
          time: params.kickoff.time,
          duration_minutes: params.kickoff.durationMinutes ?? 60,
          participants: params.kickoff.participants ?? [],
          project_id: project.id,
          project_name: projectName,
          category: "kickoff",
          status: "scheduled",
          agenda: params.kickoff.agenda ?? buildKickoffAgenda(deal, bus),
          created_by: userId,
          tenant_id: tenantId,
        } as never)
        .select("id")
        .single();

      if (meetingError) throw meetingError;
      meetingCreated = true;
      meetingId = meeting.id;
    } catch (err) {
      console.error("[DealWonAutomation] Failed to create meeting:", err);
    }
  }

  // ── 5. Log deal activity ──────────────────────────────────────────
  try {
    await supabase.from("crm_deal_activities").insert({
      deal_id: deal.id,
      tenant_id: tenantId,
      type: "won",
      title: `Projeto ${projectCode} criado automaticamente`,
      description: `BUs: ${bus.join(", ")}${d3dFlowCreated ? " | Pipeline D3D inicializado" : ""}${meetingCreated ? " | Kickoff agendado" : ""}`,
      metadata: JSON.stringify({
        project_id: project.id,
        project_code: projectCode,
        bus,
        d3d_flow_created: d3dFlowCreated,
        meeting_id: meetingId,
      }),
      created_by: userId,
    } as never);
  } catch {
    // Activity logging is non-critical
  }

  // ── 6. Audit trail ────────────────────────────────────────────────
  logAuditTrail({
    userId,
    action: "create",
    table: "projects",
    recordId: project.id,
    after: {
      source: "deal_automation",
      deal_id: deal.id,
      deal_name: deal.name,
      project_name: projectName,
      project_code: projectCode,
      bus,
    },
    metadata: { trigger: "deal_won_automation" },
  });

  return {
    project: {
      id: project.id,
      name: project.name,
      code: project.code ?? projectCode,
    },
    d3dFlowCreated,
    meetingCreated,
    meetingId,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────

function buildProjectNotes(deal: DealRow): string {
  const parts: string[] = [];
  parts.push(`Projeto criado automaticamente a partir do deal "${deal.name}".`);

  if (deal.contact) parts.push(`Contato: ${deal.contact}`);
  if (deal.contact_email) parts.push(`Email: ${deal.contact_email}`);
  if (deal.contact_phone) parts.push(`Tel: ${deal.contact_phone}`);
  if (deal.services && deal.services.length > 0) {
    parts.push(`Serviços: ${deal.services.join(", ")}`);
  }

  return parts.join("\n");
}

function buildKickoffAgenda(deal: DealRow, bus: string[]): string {
  const lines: string[] = [
    "## Pauta do Kickoff\n",
    "1. **Apresentação da equipe TBO**",
    "2. **Alinhamento de escopo e expectativas**",
  ];

  if (deal.services && deal.services.length > 0) {
    lines.push(`   - Serviços: ${deal.services.join(", ")}`);
  }

  lines.push("3. **Timeline e marcos do projeto**");

  if (bus.includes("Digital 3D")) {
    lines.push("   - Pipeline D3D: Briefing → Modelagem → Clay → Emissão → R01 → R02 → Entrega");
  }
  if (bus.includes("Audiovisual")) {
    lines.push("   - Pipeline AV: Roteirização → Captação → Edição → Entrega");
  }

  lines.push(
    "4. **Materiais necessários do cliente**",
    "   - Projeto arquitetônico (plantas, cortes, fachadas)",
    "   - Referências visuais",
    "   - Briefing de identidade visual",
    "5. **Canais de comunicação e aprovação**",
    "6. **Próximos passos**",
  );

  return lines.join("\n");
}
