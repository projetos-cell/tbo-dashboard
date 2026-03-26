// ── Project (portfólio / cases) ─────────────────────────────
export type WebsiteProjectStatus = "rascunho" | "publicado" | "arquivado";

export type WebsiteProjectCategory =
  | "branding"
  | "archviz"
  | "campanha"
  | "naming"
  | "identidade-visual"
  | "site"
  | "material-grafico"
  | "outro";

export interface WebsiteProject {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  client_name: string | null;
  location: string | null;
  year: number | null;
  category: string;
  cover_url: string | null;
  gallery: string[];
  description: string;
  highlights: string[];
  services: string[];
  testimonial_text: string | null;
  testimonial_author: string | null;
  status: WebsiteProjectStatus;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebsiteProjectInsert {
  tenant_id: string;
  name: string;
  slug: string;
  client_name?: string | null;
  location?: string | null;
  year?: number | null;
  category?: string;
  cover_url?: string | null;
  gallery?: string[];
  description?: string;
  highlights?: string[];
  services?: string[];
  testimonial_text?: string | null;
  testimonial_author?: string | null;
  status?: WebsiteProjectStatus;
  sort_order?: number;
  seo_title?: string | null;
  seo_description?: string | null;
  published_at?: string | null;
}

export type WebsiteProjectUpdate = Partial<
  Omit<WebsiteProject, "id" | "tenant_id" | "created_at" | "updated_at">
>;

// ── Sections (blocos editáveis) ─────────────────────────────
export interface WebsiteSection {
  id: string;
  tenant_id: string;
  page: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown>;
  media_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  sort_order: number;
  is_visible: boolean;
  updated_at: string;
  updated_by: string | null;
}

export interface WebsiteSectionUpsert {
  tenant_id: string;
  page: string;
  section_key: string;
  title?: string | null;
  subtitle?: string | null;
  content?: Record<string, unknown>;
  media_url?: string | null;
  cta_label?: string | null;
  cta_url?: string | null;
  sort_order?: number;
  is_visible?: boolean;
  updated_by?: string | null;
}

// ── Settings (config geral) ────────────────────────────────
export interface SocialLinks {
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  behance?: string;
  vimeo?: string;
}

export interface WebsiteSettings {
  id: string;
  tenant_id: string;
  site_title: string;
  site_description: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  social_links: SocialLinks;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  analytics_id: string | null;
  custom_scripts: string | null;
  updated_at: string;
}

export type WebsiteSettingsUpdate = Partial<
  Omit<WebsiteSettings, "id" | "tenant_id" | "updated_at">
>;

// ── Constants ───────────────────────────────────────────────
export const CATEGORY_LABELS: Record<string, string> = {
  branding: "Branding",
  archviz: "Archviz",
  campanha: "Campanha",
  naming: "Naming",
  "identidade-visual": "Identidade Visual",
  site: "Site",
  "material-grafico": "Material Gráfico",
  outro: "Outro",
};

export const STATUS_LABELS: Record<WebsiteProjectStatus, string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
  arquivado: "Arquivado",
};

export const PAGE_LABELS: Record<string, string> = {
  home: "Home",
  about: "Sobre",
  services: "Serviços",
  contact: "Contato",
};
