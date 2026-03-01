"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  CheckSquare,
  FolderOpen,
  MoreHorizontal,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InlineEditable } from "@/components/ui/inline-editable";
import { useUpdateDecision, useDeleteDecision } from "@/hooks/use-decisions";
import type { Database } from "@/lib/supabase/types";

type DecisionRow = Database["public"]["Tables"]["decisions"]["Row"];

interface DecisionDetailProps {
  decision: DecisionRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DecisionDetail({
  decision,
  open,
  onOpenChange,
}: DecisionDetailProps) {
  const updateDecision = useUpdateDecision();
  const deleteDecision = useDeleteDecision();

  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!decision) return null;

  // --- Handlers ---

  const handleUpdate = (
    updates: Database["public"]["Tables"]["decisions"]["Update"]
  ) => {
    updateDecision.mutate({ id: decision.id, updates });
  };

  const handleTitleSave = (title: string) => {
    handleUpdate({ title });
  };

  const handleDescriptionBlur = (
    e: React.FocusEvent<HTMLTextAreaElement>
  ) => {
    const description = e.target.value;
    if (description !== (decision.description || "")) {
      handleUpdate({ description: description || null });
    }
  };

  const handleDecidedByBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const decided_by = e.target.value;
    if (decided_by !== (decision.decided_by || "")) {
      handleUpdate({ decided_by: decided_by || null });
    }
  };

  const handleProjectIdBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const project_id = e.target.value;
    if (project_id !== (decision.project_id || "")) {
      handleUpdate({ project_id: project_id || null });
    }
  };

  const handleMeetingIdBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const meeting_id = e.target.value;
    if (meeting_id !== (decision.meeting_id || "")) {
      handleUpdate({ meeting_id: meeting_id || null });
    }
  };

  const handleDelete = () => {
    deleteDecision.mutate(decision.id, {
      onSuccess: () => {
        onOpenChange(false);
        setConfirmDelete(false);
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto p-0"
      >
        <SheetHeader className="px-6 pt-6 pb-2">
          <div className="flex items-start gap-3">
            <SheetTitle className="flex-1">
              <InlineEditable
                value={decision.title}
                onSave={handleTitleSave}
                variant="h2"
              />
            </SheetTitle>

            {/* Context menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  aria-label="Acoes"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Acoes</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="size-3.5 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <SheetDescription className="sr-only">
            Detalhes da decisao
          </SheetDescription>
        </SheetHeader>

        <div className="flex gap-0 min-h-[60vh]">
          {/* Left column - main content */}
          <div className="flex-1 px-6 py-4 space-y-5 border-r min-w-0">
            {/* Description */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Descricao
              </p>
              <textarea
                className="w-full min-h-[120px] text-sm bg-transparent border rounded-md p-2 resize-y focus:outline-none focus:ring-1 focus:ring-ring"
                defaultValue={decision.description || ""}
                placeholder="Adicionar descricao..."
                onBlur={handleDescriptionBlur}
              />
            </div>

            <Separator />

            {/* Tasks created */}
            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <CheckSquare className="h-3 w-3" /> Tarefas criadas
              </p>
              {decision.tasks_created && decision.tasks_created.length > 0 ? (
                <div className="space-y-1">
                  {decision.tasks_created.map((task, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <CheckSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{task}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Nenhuma tarefa vinculada
                </p>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-[220px] shrink-0 px-4 py-4 space-y-4 text-sm">
            {/* Decided by */}
            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Users className="h-3 w-3" /> Decidido por
              </p>
              <input
                type="text"
                className="w-full text-xs border rounded px-2 py-1 bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
                defaultValue={decision.decided_by || ""}
                placeholder="Nome..."
                onBlur={handleDecidedByBlur}
              />
            </div>

            {/* Project */}
            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <FolderOpen className="h-3 w-3" /> Projeto
              </p>
              <input
                type="text"
                className="w-full text-xs border rounded px-2 py-1 bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
                defaultValue={decision.project_id || ""}
                placeholder="ID do projeto..."
                onBlur={handleProjectIdBlur}
              />
            </div>

            {/* Meeting */}
            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3 w-3" /> Reuniao
              </p>
              <input
                type="text"
                className="w-full text-xs border rounded px-2 py-1 bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
                defaultValue={decision.meeting_id || ""}
                placeholder="ID da reuniao..."
                onBlur={handleMeetingIdBlur}
              />
            </div>

            <Separator />

            {/* Timestamps */}
            <div className="text-[11px] text-muted-foreground space-y-0.5">
              {decision.created_at && (
                <p>
                  Criada{" "}
                  {format(new Date(decision.created_at), "dd MMM yyyy", {
                    locale: ptBR,
                  })}
                </p>
              )}
              {decision.updated_at && (
                <p>
                  Atualizada{" "}
                  {format(new Date(decision.updated_at), "dd MMM yyyy", {
                    locale: ptBR,
                  })}
                </p>
              )}
            </div>

            {/* Created by */}
            {decision.created_by && (
              <div className="space-y-1.5">
                <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <User className="h-3 w-3" /> Criado por
                </p>
                <p className="text-xs">{decision.created_by}</p>
              </div>
            )}

            <Separator />

            {/* Delete */}
            <div>
              {confirmDelete ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-red-600">Excluir decisao?</p>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-6 text-xs"
                      onClick={handleDelete}
                      disabled={deleteDecision.isPending}
                    >
                      Confirmar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs"
                      onClick={() => setConfirmDelete(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-destructive hover:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="size-3 mr-1" />
                  Excluir
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
