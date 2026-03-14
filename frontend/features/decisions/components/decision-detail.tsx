"use client";

import { useState } from "react";
import {
  IconSquareCheck,
  IconDots,
  IconTrash,
} from "@tabler/icons-react";
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
import { useUpdateDecision, useDeleteDecision } from "@/features/decisions/hooks/use-decisions";
import type { Database } from "@/lib/supabase/types";
import { DecisionDetailSidebar } from "./decision-detail-sidebar";

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
                  <IconDots className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Acoes</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500"
                  onClick={() => setConfirmDelete(true)}
                >
                  <IconTrash className="size-3.5 mr-2" />
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
              <p className="text-xs font-medium text-gray-500">Descricao</p>
              <textarea
                className="w-full min-h-[120px] text-sm bg-transparent border rounded-md p-2 resize-y focus:outline-none focus:ring-1 focus:ring-tbo-orange"
                defaultValue={decision.description || ""}
                placeholder="Adicionar descricao..."
                onBlur={handleDescriptionBlur}
              />
            </div>

            <Separator />

            {/* Tasks created */}
            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-gray-500">
                <IconSquareCheck className="h-3 w-3" /> Tarefas criadas
              </p>
              {decision.tasks_created && decision.tasks_created.length > 0 ? (
                <div className="space-y-1">
                  {decision.tasks_created.map((task, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm text-gray-900"
                    >
                      <IconSquareCheck className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                      <span className="truncate">{task}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  Nenhuma tarefa vinculada
                </p>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <DecisionDetailSidebar
            decision={decision}
            confirmDelete={confirmDelete}
            isDeleting={deleteDecision.isPending}
            onUpdate={handleUpdate}
            onConfirmDelete={() => setConfirmDelete(true)}
            onCancelDelete={() => setConfirmDelete(false)}
            onDelete={handleDelete}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
