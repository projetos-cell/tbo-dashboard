"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  IconPlus, IconSearch, IconArticle, IconFilter, IconLayoutGrid,
  IconLayoutList, IconTrash, IconArchive, IconCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBlogPosts, useUpdateBlogPost, useDeleteBlogPost, useBlogTags, useBlogRealtime } from "../hooks/use-blog-posts";
import { BlogStatusBadge, deriveVisualStatus } from "./blog-status-badge";
import type { BlogPostStatus, BlogPostWithAuthor } from "../types";
import { getInitials } from "@/lib/utils";

type SortOption = "newest" | "oldest" | "az" | "za";
type ViewMode = "grid" | "list";

function sortPosts(posts: BlogPostWithAuthor[], sort: SortOption): BlogPostWithAuthor[] {
  return [...posts].sort((a, b) => {
    switch (sort) {
      case "newest": return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      case "oldest": return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      case "az": return a.title.localeCompare(b.title, "pt-BR");
      case "za": return b.title.localeCompare(a.title, "pt-BR");
    }
  });
}

export function BlogPostsList() {
  const router = useRouter();
  const { data: posts, isLoading } = useBlogPosts();
  const { data: allTags = [] } = useBlogTags();
  const updateMutation = useUpdateBlogPost();
  const deleteMutation = useDeleteBlogPost();
  useBlogRealtime();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BlogPostStatus | "agendado" | "all">("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [authorFilter, setAuthorFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<"archive" | "delete" | null>(null);

  // Build unique authors list from posts
  const authors = useMemo(() => {
    if (!posts) return [];
    const map = new Map<string, string>();
    for (const p of posts) {
      if (p.author_id && p.author_name) map.set(p.author_id, p.author_name);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [posts]);

  const filtered = useMemo(() => {
    if (!posts) return [];
    const base = posts.filter((p) => {
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const visual = deriveVisualStatus(p.status, p.published_at);
      const matchStatus = statusFilter === "all" || visual === statusFilter;
      const matchAuthor = authorFilter === "all" || p.author_id === authorFilter;
      const matchTag = tagFilter === "all" || p.tags.includes(tagFilter);
      return matchSearch && matchStatus && matchAuthor && matchTag;
    });
    return sortPosts(base, sortOption);
  }, [posts, search, statusFilter, authorFilter, tagFilter, sortOption]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  }

  async function confirmBulkAction() {
    if (bulkAction === "archive") {
      for (const id of selectedIds) {
        await updateMutation.mutateAsync({ id, data: { status: "arquivado" } });
      }
    } else if (bulkAction === "delete") {
      for (const id of selectedIds) {
        await deleteMutation.mutateAsync(id);
      }
    }
    setSelectedIds(new Set());
    setBulkAction(null);
  }

  const hasFilters = search || statusFilter !== "all" || authorFilter !== "all" || tagFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie os artigos do blog da empresa</p>
        </div>
        <Button onClick={() => router.push("/cultura/blog/novo")} size="sm">
          <IconPlus className="h-4 w-4 mr-1.5" />Novo Artigo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar artigos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BlogPostStatus | "agendado" | "all")}>
          <SelectTrigger className="w-36 h-9">
            <IconFilter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="revisao">Revisao</SelectItem>
            <SelectItem value="publicado">Publicado</SelectItem>
            <SelectItem value="agendado">Agendado</SelectItem>
            <SelectItem value="arquivado">Arquivado</SelectItem>
          </SelectContent>
        </Select>

        {authors.length > 0 && (
          <Select value={authorFilter} onValueChange={setAuthorFilter}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Autor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos autores</SelectItem>
              {authors.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {allTags.length > 0 && (
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas tags</SelectItem>
              {allTags.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mais recentes</SelectItem>
            <SelectItem value="oldest">Mais antigos</SelectItem>
            <SelectItem value="az">A-Z</SelectItem>
            <SelectItem value="za">Z-A</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center rounded-lg border bg-muted/30 p-0.5 ml-auto">
          <button type="button" title="Grid" onClick={() => setViewMode("grid")} className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>
            <IconLayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button type="button" title="Lista" onClick={() => setViewMode("list")} className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>
            <IconLayoutList className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <IconArticle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Nenhum artigo encontrado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {hasFilters ? "Tente ajustar os filtros de busca" : "Crie seu primeiro artigo para comecar"}
          </p>
          {!hasFilters && (
            <Button onClick={() => router.push("/cultura/blog/novo")} size="sm">
              <IconPlus className="h-4 w-4 mr-1.5" />Criar Artigo
            </Button>
          )}
        </div>
      )}

      {/* Bulk select bar */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex items-center gap-3">
          <Checkbox
            checked={selectedIds.size === filtered.length && filtered.length > 0}
            onCheckedChange={toggleSelectAll}
            aria-label="Selecionar todos"
          />
          <span className="text-xs text-muted-foreground">
            {selectedIds.size > 0 ? `${selectedIds.size} selecionado(s)` : "Selecionar todos"}
          </span>
        </div>
      )}

      {/* Posts - Grid */}
      {!isLoading && filtered.length > 0 && viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <div key={post.id} className="group relative rounded-lg border bg-card hover:border-primary/30 hover:shadow-sm transition-all overflow-hidden">
              <div className="absolute top-3 left-3 z-10">
                <Checkbox
                  checked={selectedIds.has(post.id)}
                  onCheckedChange={() => toggleSelect(post.id)}
                  className="bg-background border-border"
                />
              </div>
              <button type="button" onClick={() => router.push(`/blog/${post.id}`)} className="text-left w-full">
                <div className="h-40 bg-muted relative overflow-hidden">
                  {post.cover_url ? (
                    <Image src={post.cover_url} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <IconArticle className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <BlogStatusBadge status={post.status} publishedAt={post.published_at} />
                    {post.tags.length > 0 && (
                      <span className="text-[10px] text-muted-foreground truncate">{post.tags.slice(0, 2).join(", ")}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                  {post.excerpt && <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>}
                  <div className="flex items-center gap-2 pt-1">
                    {post.author_name && (
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={post.author_avatar_url ?? undefined} />
                          <AvatarFallback className="text-[8px]">{getInitials(post.author_name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{post.author_name}</span>
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">{new Date(post.updated_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Posts - List */}
      {!isLoading && filtered.length > 0 && viewMode === "list" && (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="w-8 px-3 py-2"></th>
                <th className="text-left px-3 py-2 font-medium text-xs text-muted-foreground">Titulo</th>
                <th className="text-left px-3 py-2 font-medium text-xs text-muted-foreground w-24">Status</th>
                <th className="text-left px-3 py-2 font-medium text-xs text-muted-foreground w-32 hidden md:table-cell">Autor</th>
                <th className="text-left px-3 py-2 font-medium text-xs text-muted-foreground w-28 hidden sm:table-cell">Atualizado</th>
                <th className="px-3 py-2 w-40 hidden lg:table-cell"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((post) => (
                <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2">
                    <Checkbox checked={selectedIds.has(post.id)} onCheckedChange={() => toggleSelect(post.id)} />
                  </td>
                  <td className="px-3 py-2">
                    <button type="button" onClick={() => router.push(`/blog/${post.id}`)} className="text-left hover:text-primary transition-colors">
                      <p className="font-medium text-sm line-clamp-1">{post.title}</p>
                      {post.tags.length > 0 && (
                        <div className="flex gap-1 mt-0.5">
                          {post.tags.slice(0, 3).map((t) => (
                            <Badge key={t} variant="secondary" className="text-[10px] h-4 px-1">{t}</Badge>
                          ))}
                        </div>
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <BlogStatusBadge status={post.status} publishedAt={post.published_at} />
                  </td>
                  <td className="px-3 py-2 hidden md:table-cell">
                    {post.author_name && (
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={post.author_avatar_url ?? undefined} />
                          <AvatarFallback className="text-[8px]">{getInitials(post.author_name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{post.author_name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground hidden sm:table-cell">
                    {new Date(post.updated_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-3 py-2 hidden lg:table-cell">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => router.push(`/blog/${post.id}`)}>Editar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full border bg-background shadow-lg px-4 py-2.5">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <IconCheck className="h-4 w-4 text-primary" />
            {selectedIds.size} selecionado(s)
          </div>
          <div className="w-px h-4 bg-border" />
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setBulkAction("archive")}>
            <IconArchive className="h-3.5 w-3.5" />Arquivar
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-destructive hover:text-destructive" onClick={() => setBulkAction("delete")}>
            <IconTrash className="h-3.5 w-3.5" />Excluir
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedIds(new Set())}>
            Cancelar
          </Button>
        </div>
      )}

      {/* Bulk action confirmation */}
      <AlertDialog open={bulkAction !== null} onOpenChange={(o) => { if (!o) setBulkAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === "delete" ? `Excluir ${selectedIds.size} artigo(s)?` : `Arquivar ${selectedIds.size} artigo(s)?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === "delete"
                ? "Essa acao nao pode ser desfeita."
                : "Os artigos serao movidos para arquivado."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkAction}
              className={bulkAction === "delete" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
