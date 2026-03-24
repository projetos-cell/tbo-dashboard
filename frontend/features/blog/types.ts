export type BlogPostStatus = "rascunho" | "revisao" | "publicado" | "arquivado";

export interface BlogPost {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  cover_url: string | null;
  status: BlogPostStatus;
  author_id: string | null;
  published_at: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

/** Joined view with author profile */
export interface BlogPostWithAuthor extends BlogPost {
  author_name: string | null;
  author_avatar_url: string | null;
}

export interface BlogPostInsert {
  tenant_id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: string;
  cover_url?: string | null;
  status?: BlogPostStatus;
  author_id?: string | null;
  published_at?: string | null;
  tags?: string[];
}

export type BlogPostUpdate = Partial<Omit<BlogPost, "id" | "tenant_id" | "created_at" | "updated_at">>;
