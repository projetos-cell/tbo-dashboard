"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/tbo-ui/dialog";
import { Button } from "@/components/tbo-ui/button";
import { Input } from "@/components/tbo-ui/input";
import { Textarea } from "@/components/tbo-ui/textarea";
import { Label } from "@/components/tbo-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tbo-ui/select";
import { UserSelector, type UserOption } from "@/components/tbo-ui/user-selector";
import { useCreateOneOnOne, useUpdateOneOnOne } from "@/hooks/use-one-on-ones";
import { useProfiles } from "@/hooks/use-people";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import { RECURRENCE_OPTIONS } from "@/lib/one-on-one-utils";
import type { OneOnOneRow } from "@/services/one-on-ones";

interface OneOnOneFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: OneOnOneRow | null;
}

export function OneOnOneForm({ open, onOpenChange, initialData }: OneOnOneFormProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const { data: profiles } = useProfiles();
  const createMutation = useCreateOneOnOne();
  const updateMutation = useUpdateOneOnOne();
  const { toast } = useToast();

  const isEdit = !!initialData;

  const [leaderId, setLeaderId] = useState<string | null>(null);
  const [collaboratorId, setCollaboratorId] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [recurrence, setRecurrence] = useState("");
  const [notes, setNotes] = useState("");

  // Reset form when dialog opens or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setLeaderId(initialData.leader_id);
        setCollaboratorId(initialData.collaborator_id);
        setScheduledAt(initialData.scheduled_at?.slice(0, 16) ?? "");
        setRecurrence(initialData.recurrence ?? "");
        setNotes(initialData.notes ?? "");
      } else {
        setLeaderId(userId ?? null);
        setCollaboratorId(null);
        setScheduledAt("");
        setRecurrence("");
        setNotes("");
      }
    }
  }, [open, initialData, userId]);

  const users: UserOption[] = (profiles ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    avatar_url: p.avatar_url,
    email: p.email,
  }));

  const canSubmit = !!leaderId && !!collaboratorId && leaderId !== collaboratorId && !!scheduledAt;
  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleSubmit() {
    if (!canSubmit || !tenantId) return;

    if (isEdit && initialData) {
      updateMutation.mutate(
        {
          id: initialData.id,
          updates: {
            leader_id: leaderId!,
            collaborator_id: collaboratorId!,
            scheduled_at: new Date(scheduledAt).toISOString(),
            recurrence: recurrence || null,
            notes: notes || null,
          },
        },
        {
          onSuccess: () => {
            toast({ title: "1:1 atualizada" });
            onOpenChange(false);
          },
          onError: (err) => toast({ title: "Erro ao atualizar", description: err.message, variant: "destructive" }),
        }
      );
    } else {
      createMutation.mutate(
        {
          tenant_id: tenantId,
          leader_id: leaderId!,
          collaborator_id: collaboratorId!,
          scheduled_at: new Date(scheduledAt).toISOString(),
          recurrence: recurrence || null,
          notes: notes || null,
          created_by: userId ?? null,
          status: "scheduled",
        },
        {
          onSuccess: () => {
            toast({ title: "1:1 agendada" });
            onOpenChange(false);
          },
          onError: (err) => toast({ title: "Erro ao agendar", description: err.message, variant: "destructive" }),
        }
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar 1:1" : "Nova 1:1"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Líder</Label>
            <UserSelector
              mode="single"
              selected={leaderId}
              onChange={setLeaderId}
              users={users}
              placeholder="Selecione o líder"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Colaborador</Label>
            <UserSelector
              mode="single"
              selected={collaboratorId}
              onChange={setCollaboratorId}
              users={users}
              placeholder="Selecione o colaborador"
            />
            {leaderId && collaboratorId && leaderId === collaboratorId && (
              <p className="text-xs text-red-500">Líder e colaborador devem ser diferentes</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Data e Hora</Label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Recorrência</Label>
            <Select value={recurrence} onValueChange={setRecurrence}>
              <SelectTrigger>
                <SelectValue placeholder="Sem recorrência" />
              </SelectTrigger>
              <SelectContent>
                {RECURRENCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value || "__none__"}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Notas</Label>
            <Textarea
              placeholder="Pauta ou observações..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isPending}>
            {isPending ? "Salvando..." : isEdit ? "Salvar alterações" : "Agendar 1:1"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
