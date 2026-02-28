"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  MoreVertical,
  Star,
  Variable,
  BarChart3,
  Clock,
  Play,
  Pencil,
  Copy,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TEMPLATE_TYPES } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type TemplateRow = Database["public"]["Tables"]["dynamic_templates"]["Row"];

interface TemplatesGridProps {
  templates: TemplateRow[];
  isLoading: boolean;
  onSelect: (template: TemplateRow) => void;
  onUse?: (template: TemplateRow) => void;
  onEdit?: (template: TemplateRow) => void;
  onDuplicate?: (template: TemplateRow) => void;
  onDelete?: (template: TemplateRow) => void;
}

export function TemplatesGrid({
  templates,
  isLoading,
  onSelect,
  onUse,
  onEdit,
  onDuplicate,
  onDelete,
}: TemplatesGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-52 animate-pulse rounded-lg border bg-muted/40"
          />
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium">Nenhum template encontrado</p>
        <p className="text-xs text-muted-foreground">
          Ajuste os filtros ou crie um novo template.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onClick={() => onSelect(template)}
          onUse={onUse ? () => onUse(template) : undefined}
          onEdit={onEdit ? () => onEdit(template) : undefined}
          onDuplicate={onDuplicate ? () => onDuplicate(template) : undefined}
          onDelete={onDelete ? () => onDelete(template) : undefined}
        />
      ))}
    </div>
  );
}

interface TemplateCardProps {
  template: TemplateRow;
  onClick: () => void;
  onUse?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

function TemplateCard({
  template,
  onClick,
  onUse,
  onEdit,
  onDuplicate,
  onDelete,
}: TemplateCardProps) {
  const typeConfig = TEMPLATE_TYPES[template.type] ?? {
    label: template.type,
    color: "#6b7280",
    bg: "rgba(107,114,128,0.12)",
  };

  const variablesCount =
    template.variables && typeof template.variables === "object"
      ? Object.keys(template.variables).length
      : 0;

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header: name + context menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold truncate">{template.name}</p>
              {template.is_default && (
                <Star className="h-3.5 w-3.5 flex-shrink-0 fill-amber-400 text-amber-400" />
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuLabel>Acoes</DropdownMenuLabel>
              <DropdownMenuGroup>
                {onUse && (
                  <DropdownMenuItem onClick={onUse}>
                    <Play className="mr-2 h-4 w-4" />
                    Usar template
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onDuplicate && (
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicar
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Badges: type + category */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge
            variant="secondary"
            style={{ backgroundColor: typeConfig.bg, color: typeConfig.color }}
          >
            {typeConfig.label}
          </Badge>
          {template.category && (
            <Badge variant="outline" className="text-xs">
              {template.category}
            </Badge>
          )}
        </div>

        {/* Description */}
        {template.description && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        )}

        {/* Footer stats */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {variablesCount > 0 && (
            <div className="flex items-center gap-1">
              <Variable className="h-3 w-3" />
              <span>{variablesCount} var.</span>
            </div>
          )}
          {(template.usage_count ?? 0) > 0 && (
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              <span>{template.usage_count} usos</span>
            </div>
          )}
          {template.last_used_at && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(template.last_used_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
