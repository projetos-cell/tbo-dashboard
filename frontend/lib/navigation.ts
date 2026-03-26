import type { SubNavItem } from "@/lib/constants";
import {
  PESSOAS_NAV_ITEMS,
  FINANCEIRO_NAV_ITEMS,
  COMERCIAL_NAV_ITEMS,
  CLIENTES_NAV_ITEMS,
  CONTRATOS_NAV_ITEMS,
  COMPRAS_NAV_ITEMS,
  OKRS_NAV_ITEMS,
  CULTURA_NAV_ITEMS,
  MERCADO_NAV_ITEMS,
  MARKETING_NAV_ITEMS,
  ATIVOS_NAV_ITEMS,
  SOPS_NAV_ITEMS,
  WEBSITE_ADMIN_NAV_ITEMS,
} from "@/lib/constants";

/** A single navigation item in the L1 sidebar. */
export interface NavGroupItem {
  readonly href: string;
  readonly label: string;
  readonly icon: string;
  readonly module: string;
  /** L2 sub-items shown inline when module is active. */
  readonly subItems?: readonly SubNavItem[];
}

/** A labeled group of navigation items (collapsible). */
export interface NavGroup {
  readonly label: string;
  readonly items: readonly NavGroupItem[];
}

/** Fixed top-level nav items — always visible, no collapsible group. */
export const PINNED_NAV_ITEMS: readonly NavGroupItem[] = [
  { href: "/dashboard", label: "Meu Dashboard", icon: "layout-dashboard", module: "dashboard" },
  { href: "/tarefas", label: "Minhas Tarefas", icon: "list-checks", module: "tarefas" },
  { href: "/chat", label: "Chat", icon: "message-square", module: "chat" },
  { href: "/projetos", label: "Projetos", icon: "folder-kanban", module: "projetos" },
] as const;

/**
 * Main sidebar navigation groups.
 * Each item's `module` is checked against RBAC (canSee).
 * Items with `subItems` expand inline sub-nav when active.
 */
export const SIDEBAR_NAV_GROUPS: readonly NavGroup[] = [
  // ── Comercial (motor de receita) ──────────────────────────────
  {
    label: "Comercial",
    items: [
      { href: "/comercial", label: "Pipeline", icon: "briefcase", module: "comercial", subItems: COMERCIAL_NAV_ITEMS },
      { href: "/clientes", label: "Clientes", icon: "building-2", module: "clientes", subItems: CLIENTES_NAV_ITEMS },
      { href: "/portal-cliente", label: "Portal do Cliente", icon: "external-link", module: "portal-cliente" },
      { href: "/contratos", label: "Contratos", icon: "file-text", module: "contratos", subItems: CONTRATOS_NAV_ITEMS },
    ],
  },
  // ── Financeiro (caixa & controle) ─────────────────────────────
  {
    label: "Financeiro",
    items: [
      { href: "/financeiro", label: "Visão Geral", icon: "dollar-sign", module: "financeiro", subItems: FINANCEIRO_NAV_ITEMS },
      { href: "/compras", label: "Compras & Fornecedores", icon: "truck", module: "compras", subItems: COMPRAS_NAV_ITEMS },
    ],
  },
  // ── Pessoas (gestão de time) ──────────────────────────────────
  {
    label: "Pessoas",
    items: [
      { href: "/pessoas", label: "Pessoas", icon: "users", module: "pessoas", subItems: PESSOAS_NAV_ITEMS },
    ],
  },
  // ── Cultura (identidade & rituais) ────────────────────────────
  {
    label: "Cultura",
    items: [
      { href: "/cultura", label: "Cultura", icon: "heart-handshake", module: "cultura", subItems: CULTURA_NAV_ITEMS as unknown as SubNavItem[] },
      { href: "/cultura/pesquisa-clima", label: "Pesquisa de Clima", icon: "clipboard-check", module: "cultura" },
    ],
  },
  // ── Marketing (execução & conteúdo) ───────────────────────────
  {
    label: "Marketing",
    items: [
      { href: "/marketing", label: "Marketing", icon: "speakerphone", module: "marketing", subItems: MARKETING_NAV_ITEMS as unknown as SubNavItem[] },
      { href: "/blog", label: "Blog", icon: "file-text", module: "marketing" },
    ],
  },
  // ── Estratégia (direção & inteligência) ───────────────────────
  {
    label: "Estratégia",
    items: [
      { href: "/okrs", label: "OKRs", icon: "target", module: "okrs", subItems: OKRS_NAV_ITEMS },
      { href: "/mercado", label: "Mercado", icon: "trending-up", module: "mercado", subItems: MERCADO_NAV_ITEMS },
      { href: "/relatorios", label: "Relatórios", icon: "bar-chart-3", module: "relatorios" },
    ],
  },
  // ── Ativos & Acervo ───────────────────────────────────────────
  {
    label: "Ativos & Acervo",
    items: [
      { href: "/ativos", label: "Ativos", icon: "monitor", module: "ativos", subItems: ATIVOS_NAV_ITEMS },
    ],
  },
  // ── Base de Conhecimento (SOPs, Templates, Guias) ─────────────
  {
    label: "Base de Conhecimento",
    items: [
      { href: "/conhecimento/sops", label: "SOPs", icon: "book-marked", module: "conhecimento", subItems: SOPS_NAV_ITEMS },
      { href: "/conhecimento/templates", label: "Templates", icon: "copy", module: "conhecimento" },
      { href: "/conhecimento/guias", label: "Guias & Processos", icon: "map", module: "conhecimento" },
    ],
  },
  // ── Website Admin (CMS do site) ───────────────────────────
  {
    label: "Website - Admin",
    items: [
      { href: "/website-admin", label: "Website Admin", icon: "world", module: "website-admin", subItems: WEBSITE_ADMIN_NAV_ITEMS as unknown as SubNavItem[] },
    ],
  },
  // ── Sistema (admin unificado) ─────────────────────────────────
  {
    label: "Sistema",
    items: [
      { href: "/usuarios", label: "Usuários", icon: "users-cog", module: "usuarios" },
      { href: "/configuracoes", label: "Configurações", icon: "settings", module: "configuracoes" },
      { href: "/audit-log", label: "Audit Log", icon: "shield", module: "audit-log", subItems: undefined },
      { href: "/changelog", label: "Changelog", icon: "history", module: "changelog" },
    ],
  },
] as const;

/** Footer nav items (always visible, outside collapsible groups). */
export const FOOTER_NAV_ITEMS = [] as const;
