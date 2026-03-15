import type { SubNavItem } from "@/lib/constants";
import {
  PESSOAS_NAV_ITEMS,
  FINANCEIRO_NAV_ITEMS,
  COMERCIAL_NAV_ITEMS,
  CLIENTES_NAV_ITEMS,
  OKRS_NAV_ITEMS,
  CULTURA_NAV_ITEMS,
  MERCADO_NAV_ITEMS,
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

/**
 * Main sidebar navigation groups.
 * Each item's `module` is checked against RBAC (canSee).
 * Items with `subItems` expand inline sub-nav when active.
 */
export const SIDEBAR_NAV_GROUPS: readonly NavGroup[] = [
  {
    label: "Favoritos",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "layout-dashboard", module: "dashboard" },
      { href: "/tarefas", label: "Tarefas", icon: "list-checks", module: "tarefas" },
      { href: "/chat", label: "Chat", icon: "message-square", module: "chat" },
    ],
  },
  {
    label: "Execução",
    items: [
      { href: "/projetos", label: "Projetos", icon: "folder-kanban", module: "projetos" },
      { href: "/agenda", label: "Agenda", icon: "calendar", module: "agenda" },
    ],
  },
  {
    label: "Pessoas & Cultura",
    items: [
      { href: "/pessoas", label: "Pessoas", icon: "users", module: "pessoas", subItems: PESSOAS_NAV_ITEMS },
      { href: "/cultura", label: "Cultura", icon: "heart-handshake", module: "cultura", subItems: CULTURA_NAV_ITEMS as unknown as SubNavItem[] },
    ],
  },
  {
    label: "Receita",
    items: [
      { href: "/financeiro", label: "Financeiro", icon: "dollar-sign", module: "financeiro", subItems: FINANCEIRO_NAV_ITEMS },
      { href: "/comercial", label: "Comercial", icon: "briefcase", module: "comercial", subItems: COMERCIAL_NAV_ITEMS },
      { href: "/clientes", label: "Clientes", icon: "building-2", module: "clientes", subItems: CLIENTES_NAV_ITEMS },
      { href: "/contratos", label: "Contratos", icon: "file-text", module: "contratos" },
    ],
  },
  {
    label: "Estratégia",
    items: [
      { href: "/okrs", label: "OKRs", icon: "target", module: "okrs", subItems: OKRS_NAV_ITEMS },
      { href: "/mercado", label: "Mercado", icon: "trending-up", module: "mercado", subItems: MERCADO_NAV_ITEMS },
      { href: "/relatorios", label: "Relatórios", icon: "bar-chart-3", module: "relatorios" },
      { href: "/rsm", label: "Redes Sociais", icon: "share-2", module: "rsm" },
    ],
  },
  {
    label: "Administração",
    items: [
      { href: "/usuarios", label: "Usuários", icon: "users-group", module: "usuarios" },
      { href: "/configuracoes", label: "Configurações", icon: "settings", module: "configuracoes" },
    ],
  },
] as const;

/** Footer nav items (always visible, outside collapsible groups). */
export const FOOTER_NAV_ITEMS = [
  { href: "/changelog", label: "Changelog", icon: "history" },
] as const;
