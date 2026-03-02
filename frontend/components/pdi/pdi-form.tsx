"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfiles } from "@/hooks/use-people";
import { useAuthStore } from "@/stores/auth-store";
import { useCreatePdi, useUpdatePdi } from "@/hooks/use-pdi";
import { useToast } from "@/hooks/use-toast";
import { PDI_STATUS_KEYS, PDI_STATUS } from "@/lib/pdi-utils";
import type { PdiRow } from "@/services/pdi";

interface PdiFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: PdiRow | null;
  /** Pre-fill person when creating from 1:1 detail */
  defaultPersonId?: string;
}

export function PdiForm({ open, onOpenChange, editData, defaultPersonId }: PdiFormProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const { data: profiles } = useProfiles();
  const createMutation = useCreatePdi();
  const updateMutation = useUpdatePdi();
  const { toast } = useToast();

  const [title, setTitle] = useState(editData?.title ?? "");
  const [personId, setPersonId] = useState(editData?.person_id ?? defaultPersonId ?? "");
  const [status, setStatus] = useState(editData?.status ?? "Em andamento");

  const isEdit = !!editData;
  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleOpenChange(v: boolean) {
    if (!v) {
      setTitle(editData?.title ?? "");
      setPersonId(editData?.person_id ?? defaultPersonId ?? "");
      setStatus(editData?.status ?? "Em andamento");
    }
    onOpenChange(v);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !personId || !tenantId) return;

    if (isEdit) {
      updateMutation.mutate(
        { id: editData.id, updates: { title, person_id: personId, status } },
        {
          onSuccess: () => {
            toast({ title: "PDI atualizado" });
            handleOpenChange(false);
          },
          onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
        }
      );
    } else {
      createMutation.mutate(
        { tenant_id: tenantId, person_id: personId, title, status },
        {
          onSuccess: () => {
            toast({ title: "PDI criado" });
            handleOpenChange(false);
          },
          onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
        }
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar PDI" : "Novo PDI"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pdi-title">Título</Label>
            <Input
              id="pdi-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Desenvolvimento de liderança"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdi-person">Colaborador</Label>
            <Select value={personId} onValueChange={setPersonId} required>
              <SelectTrigger id="pdi-person">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {(profiles ?? []).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.full_name ?? "Sem nome"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isEdit && (
            <div className="space-y-2">
              <Label htmlFor="pdi-status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="pdi-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PDI_STATUS_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {PDI_STATUS[key].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !title.trim() || !personId}>
              {isPending ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
