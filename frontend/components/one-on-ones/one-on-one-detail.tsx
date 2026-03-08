"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/tbo-ui/sheet";
import { Button } from "@/components/tbo-ui/button";
import { Badge } from "@/components/tbo-ui/badge";
import { Textarea } from "@/components/tbo-ui/textarea";
import { Separator } from "@/components/tbo-ui/separator";
import { ConfirmDialog } from "@/components/shared";
import { OneOnOneActions } from "./one-on-one-actions";
import { useUpdateOneOnOne, useDeleteOneOnOne } from "@/hooks/use-one-on-ones";
import { useProfiles } from "@/hooks/use-people";
import { useToast } from "@/hooks/use-toast";
import {
  ONE_ON_ONE_STATUS,
  STATUS_KEYS,
  getStatusBadgeProps,
  formatDateTime,
  recurrenceLabel,
  type OneOnOneStatusKey,
} from "@/lib/one-on-one-utils";
import type { OneOnOneRow } from "@/services/one-on-ones";
import {
  CheckCircle,
  XCircle,
  Trash2,
  CalendarDays,
  Repeat,
  FileText,
  Edit3,
  Save,
  Target,
} from "lucide-react";
import { PdiForm } from "@/components/pdi/pdi-form";

interface OneOnOneDetailProps {
  oneOnOne: OneOnOneRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OneOnOneDetail({ oneOnOne, open, onOpenChange }: OneOnOneDetailProps) {
  const { data: profiles } = useProfiles();
  const updateMutation = useUpdateOneOnOne();
  const deleteMutation = useDeleteOneOnOne();
  const { toast } = useToast();

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [pdiFormOpen, setPdiFormOpen] = useState(false);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p.full_name ?? "Sem nome"])
  );
  function getName(id: string) {
    return profileMap.get(id) ?? "Desconhecido";
  }

  if (!oneOnOne) return null;

  const isScheduled = oneOnOne.status === "scheduled" || !oneOnOne.status;

  function handleStatusChange(status: OneOnOneStatusKey) {
    updateMutation.mutate(
      { id: oneOnOne!.id, updates: { status } },
      {
        onSuccess: () => toast({ title: `Status alterado para ${ONE_ON_ONE_STATUS[status].label}` }),
        onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
      }
    );
  }

  function handleSaveNotes() {
    updateMutation.mutate(
      { id: oneOnOne!.id, updates: { notes: notesValue } },
      {
        onSuccess: () => {
          toast({ title: "Notas salvas" });
          setEditingNotes(false);
        },
      }
    );
  }

  function handleDelete() {
    deleteMutation.mutate(oneOnOne!.id, {
      onSuccess: () => {
        toast({ title: "1:1 removida" });
        onOpenChange(false);
      },
      onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
    });
  }

  return (
    <>
      <PdiForm
        open={pdiFormOpen}
        onOpenChange={setPdiFormOpen}
        defaultPersonId={oneOnOne.collaborator_id}
      />
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-xl">
          <div className="space-y-5 p-6">
            {/* Header */}
            <SheetHeader className="space-y-1">
              <SheetTitle className="text-lg">
                {getName(oneOnOne.leader_id)} ↔ {getName(oneOnOne.collaborator_id)}
              </SheetTitle>
              <p className="text-sm text-gray-500">Reunião 1:1</p>
            </SheetHeader>

            {/* Quick status actions */}
            {isScheduled && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleStatusChange("completed")}
                  disabled={updateMutation.isPending}
                >
                  <CheckCircle className="mr-1 h-4 w-4" /> Marcar Concluída
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange("cancelled")}
                  disabled={updateMutation.isPending}
                >
                  <XCircle className="mr-1 h-4 w-4" /> Cancelar
                </Button>
              </div>
            )}

            {/* Status badges */}
            <div className="flex flex-wrap gap-2">
              {STATUS_KEYS.map((key) => {
                const { label, style } = getStatusBadgeProps(key);
                const active = (oneOnOne.status ?? "scheduled") === key;
                return (
                  <Badge
                    key={key}
                    variant={active ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    style={active ? style : undefined}
                    onClick={() => handleStatusChange(key)}
                  >
                    {label}
                  </Badge>
                );
              })}
            </div>

            <Separator />

            {/* Date & Recurrence */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-gray-500" />
                <span>{formatDateTime(oneOnOne.scheduled_at)}</span>
              </div>
              {oneOnOne.recurrence && (
                <div className="flex items-center gap-2 text-sm">
                  <Repeat className="h-4 w-4 text-gray-500" />
                  <span>{recurrenceLabel(oneOnOne.recurrence)}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                  <FileText className="h-4 w-4" /> Notas
                </h4>
                {!editingNotes ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7"
                    onClick={() => {
                      setNotesValue(oneOnOne.notes ?? "");
                      setEditingNotes(true);
                    }}
                  >
                    <Edit3 className="mr-1 h-3 w-3" /> Editar
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7"
                    onClick={handleSaveNotes}
                    disabled={updateMutation.isPending}
                  >
                    <Save className="mr-1 h-3 w-3" /> Salvar
                  </Button>
                )}
              </div>
              {editingNotes ? (
                <Textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  rows={4}
                  autoFocus
                />
              ) : (
                <p className="whitespace-pre-wrap text-sm text-gray-500">
                  {oneOnOne.notes || "Sem notas"}
                </p>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <OneOnOneActions oneOnOneId={oneOnOne.id} mode="full" />

            {/* Create PDI from 1:1 */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPdiFormOpen(true)}
              >
                <Target className="mr-1 h-4 w-4" /> Criar PDI
              </Button>
              <span className="text-xs text-gray-500">
                Criar plano de desenvolvimento para o colaborador
              </span>
            </div>

            {/* Transcript summary */}
            {oneOnOne.transcript_summary && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Resumo da Transcrição</h4>
                  <p className="whitespace-pre-wrap rounded-lg bg-gray-100/50 p-3 text-sm">
                    {oneOnOne.transcript_summary}
                  </p>
                </div>
              </>
            )}

            <Separator />

            {/* Delete */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-500">
                Criada em {oneOnOne.created_at ? formatDateTime(oneOnOne.created_at) : "—"}
              </p>
              <ConfirmDialog
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-500"
                  >
                    <Trash2 className="mr-1 h-3 w-3" /> Excluir
                  </Button>
                }
                title="Excluir 1:1"
                description="Tem certeza? Esta ação não pode ser desfeita. As ações vinculadas também serão removidas."
                onConfirm={handleDelete}
                confirmLabel="Excluir"
                variant="destructive"
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
