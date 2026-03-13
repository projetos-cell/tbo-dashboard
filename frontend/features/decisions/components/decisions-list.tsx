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
  Users,
  Eye,
  Pencil,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteDecision } from "@/features/decisions/hooks/use-decisions";
import type { Database } from "@/lib/supabase/types";

type DecisionRow = Database["public"]["Tables"]["decisions"]["Row"];

interface DecisionsListProps {
  decisions: DecisionRow[];
  onSelect: (decision: DecisionRow) => void;
  onEdit: (decision: DecisionRow) => void;
}

export function DecisionsList({
  decisions,
  onSelect,
  onEdit,
}: DecisionsListProps) {
  const deleteDecision = useDeleteDecision();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  if (decisions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <CheckSquare className="mb-3 h-10 w-10 text-gray-500/50" />
        <p className="text-sm font-medium">Nenhuma decisão encontrada</p>
        <p className="text-xs text-gray-500">
          Ajuste os filtros ou crie uma nova decisão.
        </p>
      </div>
    );
  }

  const handleDeleteRequest = (e: React.MouseEvent, decision: DecisionRow) => {
    e.stopPropagation();
    setDeleteTarget({ id: decision.id, title: decision.title });
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await deleteDecision.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {decisions.map((decision) => {
        const descriptionPreview = decision.description ?? null;

        const tasksCount = decision.tasks_created?.length ?? 0;

        return (
          <Card
            key={decision.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => onSelect(decision)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-semibold leading-tight line-clamp-2">
                  {decision.title}
                </CardTitle>

                {/* Context menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Acoes"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(decision);
                        }}
                      >
                        <Eye className="size-3.5 mr-2" />
                        Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(decision);
                        }}
                      >
                        <Pencil className="size-3.5 mr-2" />
                        Editar
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500"
                      onClick={(e) => handleDeleteRequest(e, decision)}
                    >
                      <Trash2 className="size-3.5 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {descriptionPreview && (
                <CardDescription className="text-xs line-clamp-3">
                  {descriptionPreview}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                {/* Decided by */}
                {decision.decided_by && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {decision.decided_by}
                  </span>
                )}

                {/* Project link */}
                {decision.project_id && (
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <FolderOpen className="h-2.5 w-2.5" />
                    Projeto
                  </Badge>
                )}

                {/* Meeting link */}
                {decision.meeting_id && (
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <Calendar className="h-2.5 w-2.5" />
                    Reunião
                  </Badge>
                )}

                {/* Tasks count */}
                {tasksCount > 0 && (
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <CheckSquare className="h-2.5 w-2.5" />
                    {tasksCount} {tasksCount === 1 ? "tarefa" : "tarefas"}
                  </Badge>
                )}
              </div>

              {/* Created date */}
              {decision.created_at && (
                <p className="mt-2 text-[11px] text-gray-500">
                  {format(new Date(decision.created_at), "dd MMM yyyy", {
                    locale: ptBR,
                  })}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>

    <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir decisão?</AlertDialogTitle>
          <AlertDialogDescription>
            A decisão &ldquo;{deleteTarget?.title}&rdquo; será excluída permanentemente. Esta ação
            não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteDecision.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            disabled={deleteDecision.isPending}
            className="bg-red-500 text-white hover:bg-red-500/90 disabled:opacity-60"
          >
            {deleteDecision.isPending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
