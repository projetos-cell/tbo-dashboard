"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Rocket,
  Bug,
  Sparkles,
  AlertTriangle,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CHANGELOG_TAGS,
  NAV_ITEMS,
  type ChangelogTagKey,
} from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type ChangelogRow = Database["public"]["Tables"]["changelog_entries"]["Row"];

const TAG_ICONS: Record<string, React.ElementType> = {
  feature: Rocket,
  fix: Bug,
  improvement: Sparkles,
  breaking: AlertTriangle,
};

interface ChangelogListProps {
  entries: ChangelogRow[];
  isLoading: boolean;
  onEdit: (entry: ChangelogRow) => void;
  onDelete: (entry: ChangelogRow) => void;
}

export function ChangelogList({
  entries,
  isLoading,
  onEdit,
  onDelete,
}: ChangelogListProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4"
          >
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted/40" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 animate-pulse rounded bg-muted/40" />
              <div className="h-4 w-full animate-pulse rounded bg-muted/40" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted/40" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <Rocket className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium">Nenhuma entrada no changelog</p>
        <p className="text-xs text-muted-foreground">
          Adicione a primeira entrada para registrar as mudancas.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-8">
        {entries.map((entry) => {
          const tagDef = entry.tag
            ? CHANGELOG_TAGS[entry.tag as ChangelogTagKey]
            : null;
          const TagIcon = entry.tag
            ? TAG_ICONS[entry.tag] || Rocket
            : Rocket;

          const moduleDef = entry.module
            ? NAV_ITEMS.find((n) => n.module === entry.module)
            : null;

          return (
            <div key={entry.id} className="relative flex gap-4 pl-0 group">
              {/* Timeline dot */}
              <div
                className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background"
                style={{
                  backgroundColor: tagDef?.bg || "rgba(107,114,128,0.12)",
                }}
              >
                <TagIcon
                  className="size-4"
                  style={{ color: tagDef?.color || "#6b7280" }}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="secondary"
                      className="text-xs font-mono font-semibold"
                    >
                      v{entry.version}
                    </Badge>
                    <h3 className="text-sm font-semibold">{entry.title}</h3>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(entry)}>
                        <Pencil className="size-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(entry)}
                        className="text-destructive"
                      >
                        <Trash2 className="size-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(entry.published_at), "dd MMM yyyy", {
                      locale: ptBR,
                    })}
                  </span>

                  {tagDef && (
                    <Badge
                      variant="outline"
                      className="text-[10px]"
                      style={{
                        backgroundColor: tagDef.bg,
                        color: tagDef.color,
                        borderColor: tagDef.color,
                      }}
                    >
                      {tagDef.label}
                    </Badge>
                  )}

                  {moduleDef && (
                    <Badge variant="outline" className="text-[10px]">
                      {moduleDef.label}
                    </Badge>
                  )}

                  {entry.author && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="size-3" />
                      {entry.author}
                    </span>
                  )}
                </div>

                {entry.description && (
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {entry.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
