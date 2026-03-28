"use client";

import Image from "next/image";
import { IconAlertTriangle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface BlogSeoCardProps {
  title: string;
  slug: string;
  excerpt: string | null;
  coverUrl: string | null;
}

export function BlogSeoCard({ title, slug, excerpt, coverUrl }: BlogSeoCardProps) {
  const titleLen = title.length;
  const excerptLen = (excerpt ?? "").length;
  const titleWarning = titleLen > 60;
  const excerptWarning = excerptLen > 160;

  return (
    <div className="space-y-3">
      {/* Google preview */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Preview Google</p>
        <div className="rounded-md border p-3 space-y-0.5 bg-background">
          <p className="text-[11px] text-[#1a0dab] dark:text-blue-400 truncate">
            agenciatbo.com.br/blog/{slug || "slug-do-artigo"}
          </p>
          <p className={cn("text-sm font-medium truncate", titleWarning ? "text-destructive" : "text-foreground")}>
            {title || "Titulo do artigo"}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {excerpt || "Sem descricao. Adicione um resumo para melhorar o SEO."}
          </p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className={cn("text-[10px]", titleWarning ? "text-destructive" : "text-muted-foreground")}>
            Titulo: {titleLen}/60 chars {titleWarning && "⚠ Muito longo"}
          </span>
          <span className={cn("text-[10px]", excerptWarning ? "text-destructive" : "text-muted-foreground")}>
            Desc: {excerptLen}/160 chars {excerptWarning && "⚠ Muito longo"}
          </span>
        </div>
      </div>

      {/* OG / Social preview */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Preview LinkedIn / X</p>
        <div className="rounded-md border overflow-hidden bg-muted/30">
          <div className="relative w-full aspect-[1.91/1] bg-muted">
            {coverUrl ? (
              <Image src={coverUrl} alt="" fill className="object-cover" unoptimized />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-[10px] text-muted-foreground">Sem imagem de capa</span>
              </div>
            )}
          </div>
          <div className="px-3 py-2 space-y-0.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">agenciatbo.com.br</p>
            <p className="text-xs font-semibold line-clamp-2">{title || "Titulo do artigo"}</p>
            <p className="text-[11px] text-muted-foreground line-clamp-1">{excerpt || ""}</p>
          </div>
        </div>
        {!coverUrl && (
          <div className="flex items-center gap-1.5 mt-1">
            <IconAlertTriangle className="h-3 w-3 text-amber-500" />
            <span className="text-[10px] text-amber-500">Adicione uma capa para melhor engajamento social</span>
          </div>
        )}
      </div>
    </div>
  );
}
