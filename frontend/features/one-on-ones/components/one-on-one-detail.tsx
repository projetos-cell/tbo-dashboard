"use client";

import { useState, useMemo } from "react";
import { marked } from "marked";
import { sanitizeHtml } from "@/lib/sanitize";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/shared";
import { OneOnOneActions } from "./one-on-one-actions";
import { useUpdateOneOnOne, useDeleteOneOnOne } from "@/features/one-on-ones/hooks/use-one-on-ones";
import { useProfiles } from "@/features/people/hooks/use-people";
import { useToast } from "@/hooks/use-toast";
import {
  ONE_ON_ONE_STATUS,
  STATUS_KEYS,
  getStatusBadgeProps,
  formatDateTime,
  recurrenceLabel,
  type OneOnOneStatusKey,
} from "@/features/one-on-ones/utils/one-on-one-utils";
import type { OneOnOneRow } from "@/features/one-on-ones/services/one-on-ones";
import {
  IconCircleCheck,
  IconCircleX,
  IconTrash,
  IconCalendar,
  IconRepeat,
  IconFileText,
  IconPencil,
  IconDeviceFloppy,
  IconTarget,
  IconLink,
  IconCheck,
} from "@tabler/icons-react";
import { PdiForm } from "@/features/pdi/components/pdi-form";

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
  const [linkCopied, setLinkCopied] = useState(false);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p.full_name ?? "Sem nome"])
  );
  function getName(id: string) {
    return profileMap.get(id) ?? "Desconhecido";
  }

  const transcriptHtml = useMemo(() => {
    if (!oneOnOne?.transcript_summary) return "";
    const raw = marked.parse(oneOnOne.transcript_summary);
    return sanitizeHtml(typeof raw === "string" ? raw : "");
  }, [oneOnOne?.transcript_summary]);

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
              <div className="flex items-start justify-between gap-2">
                <div>
                  <SheetTitle className="text-lg">
                    {getName(oneOnOne.leader_id)} ↔ {getName(oneOnOne.collaborator_id)}
                  </SheetTitle>
                  <p className="text-sm text-gray-500">Reunião 1:1</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-xs text-gray-500"
                  onClick={() => {
                    const url = `${window.location.origin}/pessoas/1on1?id=${oneOnOne.id}`;
                    navigator.clipboard.writeText(url);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2000);
                  }}
                >
                  {linkCopied ? (
                    <><IconCheck className="mr-1 h-3.5 w-3.5 text-green-600" /> Copiado</>
                  ) : (
                    <><IconLink className="mr-1 h-3.5 w-3.5" /> Copiar link</>
                  )}
                </Button>
              </div>
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
                  <IconCircleCheck className="mr-1 h-4 w-4" /> Marcar Concluída
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange("cancelled")}
                  disabled={updateMutation.isPending}
                >
                  <IconCircleX className="mr-1 h-4 w-4" /> Cancelar
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
                <IconCalendar className="h-4 w-4 text-gray-500" />
                <span>{formatDateTime(oneOnOne.scheduled_at)}</span>
              </div>
              {oneOnOne.recurrence && (
                <div className="flex items-center gap-2 text-sm">
                  <IconRepeat className="h-4 w-4 text-gray-500" />
                  <span>{recurrenceLabel(oneOnOne.recurrence)}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                  <IconFileText className="h-4 w-4" /> Notas
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
                    <IconPencil className="mr-1 h-3 w-3" /> Editar
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7"
                    onClick={handleSaveNotes}
                    disabled={updateMutation.isPending}
                  >
                    <IconDeviceFloppy className="mr-1 h-3 w-3" /> Salvar
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
                <IconTarget className="mr-1 h-4 w-4" /> Criar PDI
              </Button>
              <span className="text-xs text-gray-500">
                Criar plano de desenvolvimento para o colaborador
              </span>
            </div>

            {/* Transcript summary */}
            {transcriptHtml && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Resumo da Transcrição</h4>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none rounded-lg bg-gray-100/50 p-4
                      prose-headings:font-semibold prose-headings:tracking-tight
                      prose-h2:text-base prose-h2:mt-6 prose-h2:mb-2 prose-h2:pb-1.5 prose-h2:border-b
                      prose-h3:text-sm prose-h3:mt-4 prose-h3:mb-1.5
                      prose-p:leading-relaxed prose-p:text-gray-600
                      prose-li:text-gray-600 prose-li:leading-relaxed
                      prose-strong:text-gray-900 prose-strong:font-semibold
                      prose-ul:my-2 prose-ol:my-2"
                    dangerouslySetInnerHTML={{ __html: transcriptHtml }}
                  />
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
                    <IconTrash className="mr-1 h-3 w-3" /> Excluir
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
