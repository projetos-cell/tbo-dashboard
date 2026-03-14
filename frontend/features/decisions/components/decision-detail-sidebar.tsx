"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  IconCalendar,
  IconFolderOpen,
  IconUser,
  IconUsers,
  IconTrash,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Database } from "@/lib/supabase/types";

type DecisionRow = Database["public"]["Tables"]["decisions"]["Row"];
type DecisionUpdate = Database["public"]["Tables"]["decisions"]["Update"];

interface DecisionDetailSidebarProps {
  decision: DecisionRow;
  confirmDelete: boolean;
  isDeleting: boolean;
  onUpdate: (updates: DecisionUpdate) => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}

export function DecisionDetailSidebar({
  decision,
  confirmDelete,
  isDeleting,
  onUpdate,
  onConfirmDelete,
  onCancelDelete,
  onDelete,
}: DecisionDetailSidebarProps) {
  function handleDecidedByBlur(e: React.FocusEvent<HTMLInputElement>) {
    const decided_by = e.target.value;
    if (decided_by !== (decision.decided_by || "")) {
      onUpdate({ decided_by: decided_by || null });
    }
  }

  function handleProjectIdBlur(e: React.FocusEvent<HTMLInputElement>) {
    const project_id = e.target.value;
    if (project_id !== (decision.project_id || "")) {
      onUpdate({ project_id: project_id || null });
    }
  }

  function handleMeetingIdBlur(e: React.FocusEvent<HTMLInputElement>) {
    const meeting_id = e.target.value;
    if (meeting_id !== (decision.meeting_id || "")) {
      onUpdate({ meeting_id: meeting_id || null });
    }
  }

  return (
    <div className="w-[220px] shrink-0 px-4 py-4 space-y-4 text-sm">
      {/* Decidido por */}
      <div className="space-y-1.5">
        <p className="flex items-center gap-1 text-xs font-medium text-gray-500">
          <IconUsers className="h-3 w-3" /> Decidido por
        </p>
        <input
          type="text"
          className="w-full text-xs border rounded px-2 py-1 bg-transparent focus:outline-none focus:ring-1 focus:ring-tbo-orange"
          defaultValue={decision.decided_by || ""}
          placeholder="Nome..."
          onBlur={handleDecidedByBlur}
        />
      </div>

      {/* Projeto */}
      <div className="space-y-1.5">
        <p className="flex items-center gap-1 text-xs font-medium text-gray-500">
          <IconFolderOpen className="h-3 w-3" /> Projeto
        </p>
        <input
          type="text"
          className="w-full text-xs border rounded px-2 py-1 bg-transparent focus:outline-none focus:ring-1 focus:ring-tbo-orange"
          defaultValue={decision.project_id || ""}
          placeholder="ID do projeto..."
          onBlur={handleProjectIdBlur}
        />
      </div>

      {/* Reunião */}
      <div className="space-y-1.5">
        <p className="flex items-center gap-1 text-xs font-medium text-gray-500">
          <IconCalendar className="h-3 w-3" /> Reuniao
        </p>
        <input
          type="text"
          className="w-full text-xs border rounded px-2 py-1 bg-transparent focus:outline-none focus:ring-1 focus:ring-tbo-orange"
          defaultValue={decision.meeting_id || ""}
          placeholder="ID da reuniao..."
          onBlur={handleMeetingIdBlur}
        />
      </div>

      <Separator />

      {/* Timestamps */}
      <div className="text-[11px] text-gray-500 space-y-0.5">
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

      {/* Criado por */}
      {decision.created_by && (
        <div className="space-y-1.5">
          <p className="flex items-center gap-1 text-xs font-medium text-gray-500">
            <IconUser className="h-3 w-3" /> Criado por
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
                onClick={onDelete}
                disabled={isDeleting}
              >
                Confirmar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs"
                onClick={onCancelDelete}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-red-500 hover:text-red-500"
            onClick={onConfirmDelete}
          >
            <IconTrash className="size-3 mr-1" />
            Excluir
          </Button>
        )}
      </div>
    </div>
  );
}
