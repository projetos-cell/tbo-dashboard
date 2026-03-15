import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TemplateTask {
  title: string;
  description?: string;
  priority: "urgente" | "alta" | "media" | "baixa";
  status: "pendente";
  order_index: number;
}

export interface TemplateSection {
  title: string;
  color: string;
  order_index: number;
  tasks: TemplateTask[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  construtora?: string;
  sections: TemplateSection[];
}

// ─── Template definitions ─────────────────────────────────────────────────────

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "horizonte-lancamento",
    name: "Lançamento Imobiliário",
    description:
      "Template padrão para projetos de lançamento imobiliário — briefing, identidade, produção, revisão e entrega.",
    category: "Imobiliário",
    icon: "🏗️",
    construtora: "HORIZONTE",
    sections: [
      {
        title: "Briefing & Estratégia",
        color: "#8b5cf6",
        order_index: 0,
        tasks: [
          { title: "Reunião de briefing com cliente", priority: "alta", status: "pendente", order_index: 0 },
          { title: "Análise de concorrência e mercado", priority: "alta", status: "pendente", order_index: 1 },
          { title: "Definição de público-alvo e persona", priority: "media", status: "pendente", order_index: 2 },
          { title: "Conceito criativo e naming", priority: "alta", status: "pendente", order_index: 3 },
          { title: "Aprovação do briefing pelo cliente", priority: "urgente", status: "pendente", order_index: 4 },
        ],
      },
      {
        title: "Identidade Visual",
        color: "#e85102",
        order_index: 1,
        tasks: [
          { title: "Logotipo e variações", priority: "alta", status: "pendente", order_index: 0 },
          { title: "Paleta de cores e tipografia", priority: "media", status: "pendente", order_index: 1 },
          { title: "Manual de identidade visual", priority: "media", status: "pendente", order_index: 2 },
          { title: "Aprovação da identidade pelo cliente", priority: "urgente", status: "pendente", order_index: 3 },
        ],
      },
      {
        title: "Produção de Materiais",
        color: "#3b82f6",
        order_index: 2,
        tasks: [
          { title: "Peças para redes sociais (feed + stories)", priority: "alta", status: "pendente", order_index: 0 },
          { title: "Folder / material impresso", priority: "media", status: "pendente", order_index: 1 },
          { title: "Planta humanizada e perspectivas", priority: "alta", status: "pendente", order_index: 2 },
          { title: "Vídeo de lançamento (roteiro)", priority: "alta", status: "pendente", order_index: 3 },
          { title: "Vídeo de lançamento (produção)", priority: "alta", status: "pendente", order_index: 4 },
          { title: "Landing page / hotsite", priority: "media", status: "pendente", order_index: 5 },
          { title: "Tour virtual / 3D", priority: "media", status: "pendente", order_index: 6 },
        ],
      },
      {
        title: "Revisão & Aprovação",
        color: "#f59e0b",
        order_index: 3,
        tasks: [
          { title: "Revisão interna de todos os materiais", priority: "alta", status: "pendente", order_index: 0 },
          { title: "Apresentação ao cliente — rodada 1", priority: "alta", status: "pendente", order_index: 1 },
          { title: "Ajustes pós-apresentação", priority: "media", status: "pendente", order_index: 2 },
          { title: "Aprovação final pelo cliente", priority: "urgente", status: "pendente", order_index: 3 },
        ],
      },
      {
        title: "Entrega & Arquivamento",
        color: "#22c55e",
        order_index: 4,
        tasks: [
          { title: "Entrega de arquivos finais editáveis", priority: "alta", status: "pendente", order_index: 0 },
          { title: "Publicação nas plataformas digitais", priority: "alta", status: "pendente", order_index: 1 },
          { title: "Organização e arquivamento no Drive", priority: "baixa", status: "pendente", order_index: 2 },
          { title: "Alinhamento pós-lançamento / feedback", priority: "media", status: "pendente", order_index: 3 },
        ],
      },
    ],
  },
  {
    id: "branding",
    name: "Branding",
    description: "Projeto de criação ou reposicionamento de marca — pesquisa, conceito, identidade e aplicações.",
    category: "Branding",
    icon: "🎨",
    sections: [
      {
        title: "Diagnóstico",
        color: "#8b5cf6",
        order_index: 0,
        tasks: [
          { title: "Pesquisa de mercado e concorrentes", priority: "alta", status: "pendente", order_index: 0 },
          { title: "Entrevistas com stakeholders", priority: "alta", status: "pendente", order_index: 1 },
          { title: "Análise de DNA de marca", priority: "media", status: "pendente", order_index: 2 },
        ],
      },
      {
        title: "Estratégia de Marca",
        color: "#e85102",
        order_index: 1,
        tasks: [
          { title: "Posicionamento e proposta de valor", priority: "alta", status: "pendente", order_index: 0 },
          { title: "Naming e tagline", priority: "alta", status: "pendente", order_index: 1 },
          { title: "Arquitetura de marca", priority: "media", status: "pendente", order_index: 2 },
        ],
      },
      {
        title: "Design de Identidade",
        color: "#3b82f6",
        order_index: 2,
        tasks: [
          { title: "Logotipo e variações", priority: "alta", status: "pendente", order_index: 0 },
          { title: "Paleta de cores e tipografia", priority: "media", status: "pendente", order_index: 1 },
          { title: "Iconografia e elementos gráficos", priority: "media", status: "pendente", order_index: 2 },
          { title: "Manual de identidade visual", priority: "alta", status: "pendente", order_index: 3 },
        ],
      },
      {
        title: "Aplicações",
        color: "#22c55e",
        order_index: 3,
        tasks: [
          { title: "Papelaria corporativa", priority: "media", status: "pendente", order_index: 0 },
          { title: "Templates para redes sociais", priority: "media", status: "pendente", order_index: 1 },
          { title: "Entrega e apresentação final", priority: "alta", status: "pendente", order_index: 2 },
        ],
      },
    ],
  },
  {
    id: "social-media",
    name: "Gestão de Redes Sociais",
    description: "Planejamento e execução mensal de conteúdo para redes sociais.",
    category: "Marketing",
    icon: "📱",
    sections: [
      {
        title: "Planejamento",
        color: "#3b82f6",
        order_index: 0,
        tasks: [
          { title: "Calendário editorial do mês", priority: "alta", status: "pendente", order_index: 0 },
          { title: "Pauta de conteúdo aprovada", priority: "alta", status: "pendente", order_index: 1 },
          { title: "Referências e moodboard", priority: "baixa", status: "pendente", order_index: 2 },
        ],
      },
      {
        title: "Produção",
        color: "#e85102",
        order_index: 1,
        tasks: [
          { title: "Criação de posts (feed)", priority: "alta", status: "pendente", order_index: 0 },
          { title: "Criação de stories", priority: "media", status: "pendente", order_index: 1 },
          { title: "Criação de Reels / vídeos curtos", priority: "media", status: "pendente", order_index: 2 },
          { title: "Redação das legendas", priority: "media", status: "pendente", order_index: 3 },
        ],
      },
      {
        title: "Aprovação & Publicação",
        color: "#22c55e",
        order_index: 2,
        tasks: [
          { title: "Revisão interna", priority: "alta", status: "pendente", order_index: 0 },
          { title: "Aprovação pelo cliente", priority: "urgente", status: "pendente", order_index: 1 },
          { title: "Agendamento e publicação", priority: "alta", status: "pendente", order_index: 2 },
          { title: "Relatório de resultados", priority: "media", status: "pendente", order_index: 3 },
        ],
      },
    ],
  },
  {
    id: "audiovisual",
    name: "Projeto Audiovisual",
    description: "Produção de vídeo do briefing ao entregável final — roteiro, gravação e edição.",
    category: "Audiovisual",
    icon: "🎬",
    sections: [
      {
        title: "Pré-produção",
        color: "#8b5cf6",
        order_index: 0,
        tasks: [
          { title: "Briefing e objetivos do vídeo", priority: "alta", status: "pendente", order_index: 0 },
          { title: "Roteiro / storyboard", priority: "alta", status: "pendente", order_index: 1 },
          { title: "Locação e elenco", priority: "media", status: "pendente", order_index: 2 },
          { title: "Aprovação do roteiro", priority: "urgente", status: "pendente", order_index: 3 },
        ],
      },
      {
        title: "Produção",
        color: "#e85102",
        order_index: 1,
        tasks: [
          { title: "Gravação — dia 1", priority: "alta", status: "pendente", order_index: 0 },
          { title: "Gravação — dia 2 (se necessário)", priority: "media", status: "pendente", order_index: 1 },
          { title: "Captação de imagens aéreas (drone)", priority: "media", status: "pendente", order_index: 2 },
        ],
      },
      {
        title: "Pós-produção",
        color: "#3b82f6",
        order_index: 2,
        tasks: [
          { title: "Edição e corte", priority: "alta", status: "pendente", order_index: 0 },
          { title: "Color grading", priority: "media", status: "pendente", order_index: 1 },
          { title: "Motion graphics e letreiros", priority: "media", status: "pendente", order_index: 2 },
          { title: "Trilha sonora e áudio", priority: "media", status: "pendente", order_index: 3 },
          { title: "Revisão e aprovação", priority: "urgente", status: "pendente", order_index: 4 },
          { title: "Exportação e entrega dos arquivos", priority: "alta", status: "pendente", order_index: 5 },
        ],
      },
    ],
  },
];

// ─── Custom (user-saved) templates ──────────────────────────────────────────

export interface SavedTemplate {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  sections_json: TemplateSection[];
  created_at: string;
}

/** Save an existing project's structure (sections + tasks) as a reusable template. */
export async function saveProjectAsTemplate(
  projectId: string,
  tenantId: string,
  name: string,
  description?: string,
): Promise<SavedTemplate> {
  const supabase = createClient();

  // 1. Load sections
  const { data: sections, error: secErr } = await supabase
    .from("os_sections")
    .select("id,title,color,order_index")
    .eq("project_id", projectId)
    .order("order_index", { ascending: true });

  if (secErr) throw secErr;

  // 2. Load tasks (parent-only, strip assignee/dates)
  const { data: tasks, error: taskErr } = await supabase
    .from("os_tasks")
    .select("title,description,priority,status,order_index,section_id")
    .eq("project_id", projectId)
    .is("parent_id", null)
    .order("order_index", { ascending: true });

  if (taskErr) throw taskErr;

  // 3. Build template sections with tasks
  const templateSections: TemplateSection[] = (sections ?? []).map((sec) => ({
    title: sec.title,
    color: sec.color ?? "#6b7280",
    order_index: sec.order_index,
    tasks: (tasks ?? [])
      .filter((t) => t.section_id === sec.id)
      .map((t) => ({
        title: t.title ?? "",
        description: t.description ?? undefined,
        priority: (t.priority ?? "media") as TemplateTask["priority"],
        status: "pendente" as const,
        order_index: t.order_index,
      })),
  }));

  // 4. Insert into project_templates table
  const insertPayload = {
    tenant_id: tenantId,
    name,
    description: description ?? null,
    sections_json: JSON.stringify(templateSections),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (supabase as any)
    .from("project_templates")
    .insert(insertPayload)
    .select("*")
    .single() as { data: Record<string, unknown> | null; error: { message: string } | null };

  if (result.error) throw result.error;
  return {
    ...result.data,
    sections_json: templateSections,
  } as SavedTemplate;
}

/** Fetch all custom saved templates for the tenant. */
export async function getSavedTemplates(
  tenantId: string,
): Promise<SavedTemplate[]> {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (supabase as any)
    .from("project_templates")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false }) as {
      data: Record<string, unknown>[] | null;
      error: { message: string } | null;
    };

  if (result.error) throw result.error;
  return (result.data ?? []).map((d) => ({
    ...d,
    sections_json: typeof d.sections_json === "string"
      ? JSON.parse(d.sections_json as string)
      : d.sections_json,
  })) as SavedTemplate[];
}

// Default template used on "Novo Projeto"
export const DEFAULT_TEMPLATE_ID = "horizonte-lancamento";

export function getTemplateById(id: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find((t) => t.id === id);
}

// ─── Apply template to a created project ─────────────────────────────────────

export async function applyProjectTemplate(
  projectId: string,
  tenantId: string,
  templateId: string,
): Promise<void> {
  const template = getTemplateById(templateId);
  if (!template) throw new Error(`Template "${templateId}" não encontrado`);

  const supabase = createClient();

  for (const sectionDef of template.sections) {
    // Create section
    const { data: section, error: sectionError } = await supabase
      .from("os_sections")
      .insert({
        project_id: projectId,
        tenant_id: tenantId,
        title: sectionDef.title,
        color: sectionDef.color,
        order_index: sectionDef.order_index,
      } as never)
      .select("id")
      .single();

    if (sectionError || !section) {
      console.error("Erro ao criar seção:", sectionError);
      continue;
    }

    // Create tasks for this section
    const taskInserts = sectionDef.tasks.map((task) => ({
      project_id: projectId,
      section_id: section.id,
      tenant_id: tenantId,
      title: task.title,
      description: task.description ?? null,
      priority: task.priority,
      status: task.status,
      order_index: task.order_index,
      is_completed: false,
    }));

    if (taskInserts.length > 0) {
      const { error: tasksError } = await supabase
        .from("os_tasks")
        .insert(taskInserts as never[]);

      if (tasksError) {
        console.error("Erro ao criar tasks:", tasksError);
      }
    }
  }
}
