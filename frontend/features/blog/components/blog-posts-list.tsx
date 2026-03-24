"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  IconPlus,
  IconSearch,
  IconArticle,
  IconFilter,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogPosts } from "../hooks/use-blog-posts";
import { BlogStatusBadge } from "./blog-status-badge";
import type { BlogPostStatus } from "../types";
import { getInitials } from "@/lib/utils";

export function BlogPostsList() {
  const router = useRouter();
  const { data: posts, isLoading } = useBlogPosts();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BlogPostStatus | "all">("all");

  const filtered = useMemo(() => {
    if (!posts) return [];
    return posts.filter((p) => {
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [posts, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os artigos do blog da empresa
          </p>
        </div>
        <Button onClick={() => router.push("/blog/novo")} size="sm">
          <IconPlus className="h-4 w-4 mr-1.5" />
          Novo Artigo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar artigos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as BlogPostStatus | "all")}
        >
          <SelectTrigger className="w-40 h-9">
            <IconFilter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="revisao">Revisao</SelectItem>
            <SelectItem value="publicado">Publicado</SelectItem>
            <SelectItem value="arquivado">Arquivado</SelectItem>
          </SelectContent>
        </Select>
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
            {search || statusFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Crie seu primeiro artigo para comecar"}
          </p>
          {!search && statusFilter === "all" && (
            <Button onClick={() => router.push("/blog/novo")} size="sm">
              <IconPlus className="h-4 w-4 mr-1.5" />
              Criar Artigo
            </Button>
          )}
        </div>
      )}

      {/* Posts grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => router.push(`/blog/${post.id}`)}
              className="group rounded-lg border bg-card text-left hover:border-primary/30 hover:shadow-sm transition-all overflow-hidden"
            >
              {/* Cover */}
              <div className="h-40 bg-muted relative overflow-hidden">
                {post.cover_url ? (
                  <Image
                    src={post.cover_url}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <IconArticle className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <BlogStatusBadge status={post.status} />
                  {post.tags.length > 0 && (
                    <span className="text-[10px] text-muted-foreground truncate">
                      {post.tags.slice(0, 2).join(", ")}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  {post.author_name && (
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={post.author_avatar_url ?? undefined} />
                        <AvatarFallback className="text-[8px]">
                          {getInitials(post.author_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{post.author_name}</span>
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(post.updated_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
