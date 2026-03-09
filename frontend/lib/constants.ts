// Project status configuration — matches legacy TBO_QUADRO_PROJETOS._STATUS
export const PROJECT_STATUS = {
  em_andamento: {
    label: "Em Andamento",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    icon: "play-circle",
  },
  producao: {
    label: "Em Produção",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
    icon: "zap",
  },
  em_revisao: {
    label: "Em Revisão",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    icon: "eye",
  },
  finalizado: {
    label: "Finalizado",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    icon: "check-circle-2",
  },
  parado: {
    label: "Parado",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    icon: "pause-circle",
  },
  pausado: {
    label: "Pausado",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    icon: "clock",
  },
} as const;

export type ProjectStatusKey = keyof typeof PROJECT_STATUS;

// Task status configuration — matches legacy TBO_TAREFAS statuses
export const TASK_STATUS = {
  pendente: { label: "Pendente", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  em_andamento: { label: "Em Andamento", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  revisao: { label: "Revisão", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  concluida: { label: "Concluída", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  bloqueada: { label: "Bloqueada", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  cancelada: { label: "Cancelada", color: "#9ca3af", bg: "rgba(156,163,175,0.12)" },
} as const;

export type TaskStatusKey = keyof typeof TASK_STATUS;

// Task priority configuration
export const TASK_PRIORITY = {
  urgente: { label: "Urgente", color: "#ef4444", sort: 0 },
  alta: { label: "Alta", color: "#f59e0b", sort: 1 },
  media: { label: "Média", color: "#3b82f6", sort: 2 },
  baixa: { label: "Baixa", color: "#6b7280", sort: 3 },
} as const;

export type TaskPriorityKey = keyof typeof TASK_PRIORITY;

// BU badge colors — matches legacy TBO_QUADRO_PROJETOS._BU_COLORS
export const BU_COLORS: Record<string, { bg: string; color: string }> = {
  Branding: { bg: "#fef3c7", color: "#92400e" },
  "Digital 3D": { bg: "#ede9fe", color: "#5b21b6" },
  Marketing: { bg: "#d1fae5", color: "#065f46" },
  Audiovisual: { bg: "#fce7f3", color: "#9d174d" },
  Interiores: { bg: "#e0f2fe", color: "#0c4a6e" },
};

// People status configuration
export const PEOPLE_STATUS = {
  active: { label: "Ativo", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  inactive: { label: "Inativo", color: "#9ca3af", bg: "rgba(156,163,175,0.12)" },
  vacation: { label: "Férias", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  away: { label: "Afastado", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  onboarding: { label: "Onboarding", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  offboarding: { label: "Offboarding", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
} as const;

export type PeopleStatusKey = keyof typeof PEOPLE_STATUS;

// Client status configuration
export const CLIENT_STATUS = {
  lead: { label: "Lead", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  prospect: { label: "Prospect", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  ativo: { label: "Ativo", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  vip: { label: "VIP", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  inativo: { label: "Inativo", color: "#9ca3af", bg: "rgba(156,163,175,0.12)" },
} as const;

export type ClientStatusKey = keyof typeof CLIENT_STATUS;

// Client interaction types
export const INTERACTION_TYPES = {
  email: { label: "E-mail", icon: "mail" },
  reuniao: { label: "Reunião", icon: "video" },
  call: { label: "Ligação", icon: "phone" },
  whatsapp: { label: "WhatsApp", icon: "message-circle" },
  presencial: { label: "Presencial", icon: "users" },
} as const;

export type InteractionTypeKey = keyof typeof INTERACTION_TYPES;

// Contract status configuration
export const CONTRACT_STATUS = {
  ativo: { label: "Ativo", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  pendente: { label: "Pendente", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  finalizado: { label: "Finalizado", color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  cancelado: { label: "Cancelado", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
} as const;

export type ContractStatusKey = keyof typeof CONTRACT_STATUS;

// ─── Deal pipeline stages (CRM) ──────────────────────────────────────
export const DEAL_STAGES = {
  lead: { label: "Lead", color: "#6366f1", bg: "rgba(99,102,241,0.12)", order: 0 },
  qualificacao: { label: "Qualificação", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", order: 1 },
  proposta: { label: "Proposta Enviada", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", order: 2 },
  negociacao: { label: "Negociação", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", order: 3 },
  fechado_ganho: { label: "Fechado Ganho", color: "#22c55e", bg: "rgba(34,197,94,0.12)", order: 4 },
  fechado_perdido: { label: "Fechado Perdido", color: "#ef4444", bg: "rgba(239,68,68,0.12)", order: 5 },
} as const;

export type DealStageKey = keyof typeof DEAL_STAGES;

export const DEAL_SOURCES = ["site", "indicacao", "rd_station", "linkedin", "evento", "outbound", "outro"] as const;

// ─── OKR status / levels ─────────────────────────────────────────────
export const OKR_STATUS = {
  on_track: { label: "No caminho", color: "#16a34a", bg: "rgba(34,197,94,0.1)" },
  attention: { label: "Atenção", color: "#d97706", bg: "rgba(245,158,11,0.1)" },
  at_risk: { label: "Em risco", color: "#dc2626", bg: "rgba(239,68,68,0.1)" },
  behind: { label: "Atrasado", color: "#dc2626", bg: "rgba(239,68,68,0.1)" },
} as const;

export type OkrStatusKey = keyof typeof OKR_STATUS;

export const OKR_LEVELS = {
  company: { label: "Empresa", color: "#7c3aed", bg: "rgba(139,92,246,0.1)" },
  directorate: { label: "Diretoria", color: "#2563eb", bg: "rgba(59,130,246,0.1)" },
  squad: { label: "Squad", color: "#0891b2", bg: "rgba(8,145,178,0.1)" },
  individual: { label: "Individual", color: "#16a34a", bg: "rgba(34,197,94,0.1)" },
} as const;

export type OkrLevelKey = keyof typeof OKR_LEVELS;

// ─── Demand status configuration (legacy demands table) ─────────────
export const DEMAND_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  Briefing: { label: "Briefing", color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
  Aprovado: { label: "Aprovado", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  Cronograma: { label: "Cronograma", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  "Apresentação": { label: "Apresentação", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  Desenvolvimento: { label: "Desenvolvimento", color: "#0ea5e9", bg: "rgba(14,165,233,0.12)" },
  "Revisão Interna": { label: "Revisão Interna", color: "#d97706", bg: "rgba(217,119,6,0.12)" },
  Pausado: { label: "Pausado", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  "Concluído": { label: "Concluído", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  Concluido: { label: "Concluído", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
};

// Demand priority configuration
export const DEMAND_PRIORITY: Record<string, { label: string; color: string }> = {
  urgente: { label: "Urgente", color: "#ef4444" },
  alta: { label: "Alta", color: "#f59e0b" },
  media: { label: "Média", color: "#3b82f6" },
  baixa: { label: "Baixa", color: "#6b7280" },
};

// Board columns for demands (status order)
export const DEMAND_BOARD_COLUMNS = [
  "Briefing",
  "Aprovado",
  "Cronograma",
  "Desenvolvimento",
  "Apresentação",
  "Revisão Interna",
  "Pausado",
  "Concluído",
] as const;

// Navigation items for the sidebar
export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "layout-dashboard", module: "dashboard" },
  { href: "/projetos", label: "Projetos", icon: "folder-kanban", module: "projetos" },
  { href: "/tarefas", label: "Tarefas", icon: "list-checks", module: "tarefas" },
  { href: "/pessoas", label: "Pessoas", icon: "users", module: "pessoas" },
  { href: "/agenda", label: "Agenda", icon: "calendar", module: "agenda" },
  { href: "/financeiro", label: "Financeiro", icon: "dollar-sign", module: "financeiro" },
  { href: "/clientes", label: "Clientes", icon: "building-2", module: "clientes" },
  { href: "/contratos", label: "Contratos", icon: "file-text", module: "contratos" },
  { href: "/comercial", label: "Comercial", icon: "briefcase", module: "comercial" },
  { href: "/mercado", label: "Mercado", icon: "map-pin", module: "mercado" },
  { href: "/okrs", label: "OKRs", icon: "target", module: "okrs" },
  { href: "/chat", label: "Chat", icon: "message-square", module: "chat" },
  { href: "/cultura", label: "Cultura", icon: "heart-handshake", module: "cultura" },
  { href: "/rsm", label: "Redes Sociais", icon: "share-2", module: "rsm" },
  { href: "/relatorios", label: "Relatórios", icon: "bar-chart-3", module: "relatorios" },
  { href: "/alerts", label: "Alertas", icon: "bell", module: "alerts" },
  { href: "/portal-cliente", label: "Portal Cliente", icon: "globe", module: "portal-cliente" },
  { href: "/conteudo", label: "Conteúdo", icon: "pen-tool", module: "conteudo" },
  { href: "/revisoes", label: "Revisões", icon: "check-circle", module: "revisoes" },
  { href: "/inteligencia", label: "Inteligência", icon: "lightbulb", module: "inteligencia" },
  { href: "/diretoria", label: "Diretoria", icon: "presentation", module: "diretoria" },
  { href: "/permissoes", label: "Permissões", icon: "lock", module: "permissoes" },
  { href: "/admin", label: "Admin", icon: "shield", module: "admin" },
  { href: "/system-health", label: "System Health", icon: "activity", module: "system-health" },
  { href: "/changelog", label: "Changelog", icon: "history", module: "changelog" },
  { href: "/configuracoes", label: "Configurações", icon: "settings", module: "configuracoes" },
] as const;

// Settings tabs
export const SETTINGS_TABS = [
  { id: "perfil", label: "Perfil & Conta", icon: "user" },
  { id: "aparencia", label: "Aparência", icon: "palette" },
  { id: "integracoes", label: "Integrações", icon: "plug" },
  { id: "usuarios", label: "Usuários", icon: "users" },
  { id: "audit", label: "Logs de Auditoria", icon: "shield" },
] as const;

export type SettingsTabId = (typeof SETTINGS_TABS)[number]["id"];

// ─── Custom Field types ───────────────────────────────────────────────
export const CUSTOM_FIELD_TYPES = {
  text: { label: "Texto", icon: "type" },
  number: { label: "Numero", icon: "hash" },
  date: { label: "Data", icon: "calendar" },
  select: { label: "Select", icon: "list" },
  multi_select: { label: "Multi Select", icon: "list-checks" },
  checkbox: { label: "Checkbox", icon: "check-square" },
  url: { label: "URL", icon: "link" },
} as const;

export type CustomFieldTypeKey = keyof typeof CUSTOM_FIELD_TYPES;

// ─── Activity action labels ──────────────────────────────────────────
export const ACTIVITY_ACTIONS: Record<string, string> = {
  created: "criou",
  updated: "atualizou",
  deleted: "excluiu",
  moved: "moveu",
  commented: "comentou",
  attached: "anexou",
  assigned: "atribuiu",
  unassigned: "removeu atribuicao",
  completed: "concluiu",
  reopened: "reabriu",
};

// ─── Cultura categories ──────────────────────────────────────────────
export const CULTURA_CATEGORIES = {
  pilar: { label: "Pilares", icon: "columns-3", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  ritual: { label: "Rituais", icon: "repeat", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  politica: { label: "Politicas", icon: "shield", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  reconhecimento: { label: "Reconhecimentos", icon: "award", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  valor: { label: "Valores", icon: "heart", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  documento: { label: "Documentos", icon: "file-text", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  manual: { label: "Manual", icon: "book-open", color: "#0ea5e9", bg: "rgba(14,165,233,0.12)" },
} as const;

export type CulturaCategoryKey = keyof typeof CULTURA_CATEGORIES;

// ─── Cultura internal sidebar navigation ─────────────────────────────
export const CULTURA_NAV_ITEMS = [
  { href: "/cultura", label: "Visao Geral", icon: "layout-dashboard" },
  { href: "/cultura/pilares", label: "Pilares", icon: "columns-3" },
  { href: "/cultura/rituais", label: "Rituais", icon: "repeat" },
  { href: "/cultura/politicas", label: "Politicas", icon: "shield" },
  { href: "/cultura/reconhecimentos", label: "Reconhecimentos", icon: "award" },
  { href: "/cultura/recompensas", label: "Recompensas", icon: "gift" },
  { href: "/cultura/manual", label: "Manual", icon: "book-open" },
  { href: "/cultura/analytics", label: "Analytics", icon: "bar-chart-3", founders_only: true },
] as const;

// ─── TBO Company Values ─────────────────────────────────────────────
export const TBO_VALUES = [
  { id: "ownership", name: "Ownership", emoji: "🏆", color: "#f59e0b" },
  { id: "excelencia", name: "Excelência", emoji: "⭐", color: "#8b5cf6" },
  { id: "colaboracao", name: "Colaboração", emoji: "🤝", color: "#3b82f6" },
  { id: "inovacao", name: "Inovação", emoji: "💡", color: "#22c55e" },
  { id: "transparencia", name: "Transparência", emoji: "🔍", color: "#0ea5e9" },
  { id: "cliente", name: "Foco no Cliente", emoji: "❤️", color: "#ef4444" },
] as const;

// ─── Recognition sources ────────────────────────────────────────────
export const RECOGNITION_SOURCES = {
  manual: { label: "Manual", color: "#3b82f6" },
  fireflies: { label: "Fireflies (IA)", color: "#8b5cf6" },
  slack: { label: "Slack", color: "#e01e5a" },
} as const;

// ─── Reward types ───────────────────────────────────────────────────
export const REWARD_TYPES = {
  experiencia: { label: "Experiência", icon: "sparkles", color: "#8b5cf6" },
  produto: { label: "Produto", icon: "package", color: "#3b82f6" },
  beneficio: { label: "Benefício", icon: "heart", color: "#ef4444" },
  folga: { label: "Day Off", icon: "calendar", color: "#22c55e" },
} as const;

// ─── Recognition tiers ──────────────────────────────────────────────
export const RECOGNITION_TIERS = [
  { name: "Bronze", minPoints: 0, maxPoints: 49, color: "#cd7f32", icon: "🥉" },
  { name: "Prata", minPoints: 50, maxPoints: 149, color: "#c0c0c0", icon: "🥈" },
  { name: "Ouro", minPoints: 150, maxPoints: 299, color: "#ffd700", icon: "🥇" },
  { name: "Diamante", minPoints: 300, maxPoints: Infinity, color: "#b9f2ff", icon: "💎" },
] as const;

// ─── Cultura item status ─────────────────────────────────────────────
export const CULTURA_STATUS = {
  draft: { label: "Rascunho", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  published: { label: "Publicado", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  archived: { label: "Arquivado", color: "#9ca3af", bg: "rgba(156,163,175,0.12)" },
} as const;

export type CulturaStatusKey = keyof typeof CULTURA_STATUS;

// ─── Policy categories ───────────────────────────────────────────────
export const POLICY_CATEGORIES = {
  etica: { label: "Etica", icon: "scale", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  pessoas: { label: "Pessoas", icon: "users", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  comercial: { label: "Comercial", icon: "briefcase", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  governanca: { label: "Governanca", icon: "landmark", color: "#0ea5e9", bg: "rgba(14,165,233,0.12)" },
  compliance: { label: "Compliance", icon: "shield-check", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
} as const;

export type PolicyCategoryKey = keyof typeof POLICY_CATEGORIES;

// ─── Policy status ──────────────────────────────────────────────────
export const POLICY_STATUS = {
  draft: { label: "Rascunho", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  active: { label: "Ativa", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  archived: { label: "Arquivada", color: "#9ca3af", bg: "rgba(156,163,175,0.12)" },
} as const;

export type PolicyStatusKey = keyof typeof POLICY_STATUS;

// ─── Changelog tags ───────────────────────────────────────────────────
export const CHANGELOG_TAGS = {
  feature: { label: "Nova Funcionalidade", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  fix: { label: "Correção", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  improvement: { label: "Melhoria", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  breaking: { label: "Breaking Change", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
} as const;

export type ChangelogTagKey = keyof typeof CHANGELOG_TAGS;


// ─── Module sub-navigation items (L2 sidebar) ──────────────────────
// Each module that has an L2 sidebar defines its nav items here.
// Pattern follows CULTURA_NAV_ITEMS: { href, label, icon, min_role? }

export type SubNavItem = {
  readonly href: string;
  readonly label: string;
  readonly icon: string;
  readonly min_role?: "founder" | "diretoria" | "lider";
};

export const PROJETOS_NAV_ITEMS: readonly SubNavItem[] = [
  { href: "/projetos", label: "Visão Geral", icon: "layout-dashboard" },
  { href: "/projetos/lista", label: "Lista", icon: "list" },
  { href: "/projetos/board", label: "Board", icon: "kanban" },
  { href: "/projetos/timeline", label: "Timeline", icon: "clock" },
  { href: "/projetos/gantt", label: "Gantt", icon: "gantt-chart-square" },
  { href: "/projetos/calendario", label: "Calendário", icon: "calendar" },
  { href: "/projetos/arquivos", label: "Arquivos", icon: "folder-open" },
  { href: "/projetos/templates", label: "Templates", icon: "copy" },
  { href: "/projetos/configuracoes", label: "Configurações", icon: "settings" },
] as const;

export const PESSOAS_NAV_ITEMS: readonly SubNavItem[] = [
  { href: "/pessoas", label: "Visão Geral", icon: "layout-dashboard" },
  { href: "/pessoas/colaboradores", label: "Colaboradores", icon: "users" },
  { href: "/pessoas/1on1", label: "1:1", icon: "message-square" },
  { href: "/pessoas/pdi", label: "PDI", icon: "target" },
  { href: "/pessoas/reconhecimentos", label: "Reconhecimentos", icon: "award" },
  { href: "/pessoas/performance", label: "Performance", icon: "trending-up" },
  { href: "/pessoas/timeline", label: "Timeline", icon: "activity" },
  { href: "/pessoas/configuracoes", label: "Configurações", icon: "settings" },
] as const;

export const FINANCEIRO_NAV_ITEMS: readonly SubNavItem[] = [
  { href: "/financeiro", label: "Visão Geral", icon: "bar-chart-3" },
  { href: "/financeiro/operacional", label: "Operacional", icon: "activity" },
] as const;

export const COMERCIAL_NAV_ITEMS: readonly SubNavItem[] = [
  { href: "/comercial", label: "Pipeline", icon: "kanban" },
  { href: "/comercial/leads", label: "Leads", icon: "user-plus" },
  { href: "/comercial/propostas", label: "Propostas", icon: "file-text" },
  { href: "/comercial/atividades", label: "Atividades", icon: "activity" },
  { href: "/comercial/relatorios", label: "Relatórios", icon: "bar-chart-3" },
  { href: "/comercial/integracoes", label: "Integrações", icon: "plug" },
  { href: "/comercial/configuracoes", label: "Configurações", icon: "settings" },
] as const;

export const CLIENTES_NAV_ITEMS: readonly SubNavItem[] = [
  { href: "/clientes", label: "Visão Geral", icon: "layout-dashboard" },
  { href: "/clientes/empresas", label: "Empresas", icon: "building-2" },
  { href: "/clientes/contatos", label: "Contatos", icon: "contact" },
  { href: "/clientes/projetos", label: "Projetos do Cliente", icon: "folder-kanban" },
  { href: "/clientes/documentos", label: "Documentos", icon: "file-text" },
  { href: "/clientes/configuracoes", label: "Configurações", icon: "settings" },
] as const;

export const OKRS_NAV_ITEMS: readonly SubNavItem[] = [
  { href: "/okrs", label: "Visão Geral", icon: "layout-dashboard" },
  { href: "/okrs/company", label: "Company OKRs", icon: "building" },
  { href: "/okrs/teams", label: "Teams", icon: "users" },
  { href: "/okrs/individuais", label: "Individuais", icon: "user" },
  { href: "/okrs/check-ins", label: "Check-ins", icon: "check-circle" },
  { href: "/okrs/dashboard", label: "Dashboard", icon: "bar-chart-3" },
  { href: "/okrs/configuracoes", label: "Configurações", icon: "settings" },
] as const;

/** Map of module prefix → nav items + title for the L2 sidebar */
export const MODULE_NAV_CONFIG: Record<string, { title: string; items: readonly SubNavItem[] }> = {
  "/projetos": { title: "Projetos", items: PROJETOS_NAV_ITEMS },
  "/pessoas": { title: "Pessoas", items: PESSOAS_NAV_ITEMS },
  "/financeiro": { title: "Financeiro", items: FINANCEIRO_NAV_ITEMS },
  "/comercial": { title: "Comercial", items: COMERCIAL_NAV_ITEMS },
  "/clientes": { title: "Clientes", items: CLIENTES_NAV_ITEMS },
  "/okrs": { title: "OKRs", items: OKRS_NAV_ITEMS },
};
