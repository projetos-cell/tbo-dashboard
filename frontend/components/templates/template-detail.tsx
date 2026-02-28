"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TEMPLATE_TYPES } from "@/lib/constants";
import { useUpdateTemplate, useDeleteTemplate } from "@/hooks/use-templates";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Star,
  Trash2,
  Variable,
  BarChart3,
  Clock,
  User,
  FolderOpen,
  CheckSquare,
} from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type TemplateRow = Database["public"]["Tables"]["dynamic_templates"]["Row"];

interface TemplateDetailProps {
  template: TemplateRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplateDetail({
  template,
  open,
  onOpenChange,
}: TemplateDetailProps) {
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  if (!template) return null;

  const currentTypeConfig = TEMPLATE_TYPES[template.type] ?? {
    label: template.type,
    color: "#6b7280",
    bg: "rgba(107,114,128,0.12)",
  };

  function handleTypeChange(newType: string) {
    if (!template || newType === template.type) return;
    updateTemplate.mutate({ id: template.id, updates: { type: newType } });
  }

  function handleDelete() {
    if (!template) return;
    deleteTemplate.mutate(template.id, {
      onSuccess: () => onOpenChange(false),
    });
  }

  // Parse variables from JSON
  const variables =
    template.variables && typeof template.variables === "object"
      ? Object.keys(template.variables as Record<string, unknown>)
      : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {template.name}
            {template.is_default && (
              <Star className="h-4 w-4 flex-shrink-0 fill-amber-400 text-amber-400" />
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-4 pb-4">
          {/* Type selector */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Tipo
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(TEMPLATE_TYPES).map(([key, config]) => (
                <Badge
                  key={key}
                  variant="secondary"
                  className="cursor-pointer transition-opacity"
                  style={{
                    backgroundColor:
                      key === template.type ? config.bg : undefined,
                    color: key === template.type ? config.color : undefined,
                    opacity: key === template.type ? 1 : 0.5,
                  }}
                  onClick={() => handleTypeChange(key)}
                >
                  {config.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Description */}
          {template.description && (
            <>
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Descricao
                </p>
                <p className="text-sm leading-relaxed">{template.description}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Content preview */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Conteudo
            </p>
            <pre className="bg-muted rounded-lg p-4 text-sm font-mono overflow-auto max-h-64 whitespace-pre-wrap break-words">
              <code>{template.content}</code>
            </pre>
          </div>

          <Separator />

          {/* Variables */}
          {variables.length > 0 && (
            <>
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Variaveis
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {variables.map((v) => (
                    <Badge key={v} variant="outline" className="font-mono text-xs">
                      <Variable className="mr-1 h-3 w-3" />
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Info section */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Informacoes
            </p>

            {template.category && (
              <div className="flex items-center gap-2 text-sm">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Categoria:</span>
                <Badge variant="outline">{template.category}</Badge>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Usos:</span>
              <span>{template.usage_count ?? 0}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Padrao:</span>
              <span>{template.is_default ? "Sim" : "Nao"}</span>
            </div>

            {template.created_by_name && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Criado por:</span>
                <span>{template.created_by_name}</span>
              </div>
            )}

            {template.last_used_at && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Ultimo uso:</span>
                <span>
                  {format(new Date(template.last_used_at), "dd MMM yyyy, HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            )}

            {template.created_at && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Criado em:</span>
                <span>
                  {format(new Date(template.created_at), "dd MMM yyyy, HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        <SheetFooter>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
            disabled={deleteTemplate.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleteTemplate.isPending ? "Excluindo..." : "Excluir Template"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
