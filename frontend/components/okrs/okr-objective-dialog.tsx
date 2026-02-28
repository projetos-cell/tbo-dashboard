"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateObjective, useUpdateObjective } from "@/hooks/use-okrs";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import { OKR_STATUS, OKR_LEVELS } from "@/lib/constants";
import type { OkrStatusKey, OkrLevelKey } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type ObjectiveRow = Database["public"]["Tables"]["okr_objectives"]["Row"];

interface OkrObjectiveDialogProps {
  open: boolean;
  onClose: () => void;
  objective?: ObjectiveRow | null;
  cycleId: string | null;
}

export function OkrObjectiveDialog({
  open,
  onClose,
  objective,
  cycleId,
}: OkrObjectiveDialogProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const createObjective = useCreateObjective();
  const updateObjective = useUpdateObjective();
  const { toast } = useToast();

  const isEdit = !!objective;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<string>("squad");
  const [status, setStatus] = useState<string>("on_track");
  const [ownerId, setOwnerId] = useState("");
  const [titleError, setTitleError] = useState("");

  // Pre-fill fields when opening
  useEffect(() => {
    if (open) {
      if (objective) {
        setTitle(objective.title ?? "");
        setDescription(objective.description ?? "");
        setLevel(objective.level ?? "squad");
        setStatus(objective.status ?? "on_track");
        setOwnerId(objective.owner_id ?? "");
      } else {
        setTitle("");
        setDescription("");
        setLevel("squad");
        setStatus("on_track");
        setOwnerId("");
      }
      setTitleError("");
    }
  }, [open, objective]);

  async function handleSubmit() {
    if (!title.trim()) {
      setTitleError("Titulo e obrigatorio");
      return;
    }
    setTitleError("");

    if (!tenantId) return;

    try {
      if (isEdit && objective) {
        await updateObjective.mutateAsync({
          id: objective.id,
          updates: {
            title: title.trim(),
            description: description.trim() || null,
            level,
            status,
            owner_id: ownerId.trim() || undefined,
          } as never,
        });
        toast({ title: "Objetivo atualizado" });
      } else {
        await createObjective.mutateAsync({
          tenant_id: tenantId,
          title: title.trim(),
          description: description.trim() || null,
          level,
          status,
          owner_id: ownerId.trim() || userId || "",
          period: cycleId || "",
        } as never);
        toast({ title: "Objetivo criado" });
      }
      onClose();
    } catch {
      toast({ title: "Erro ao salvar objetivo", variant: "destructive" });
    }
  }

  const isPending = createObjective.isPending || updateObjective.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Objetivo" : "Novo Objetivo"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="obj-title">Titulo *</Label>
            <Input
              id="obj-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError("");
              }}
              placeholder="Ex: Aumentar receita recorrente"
            />
            {titleError && (
              <p className="text-xs text-red-600 mt-1">{titleError}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="obj-desc">Descricao</Label>
            <Textarea
              id="obj-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Detalhe o objetivo..."
            />
          </div>

          {/* Level */}
          <div>
            <Label htmlFor="obj-level">Nivel</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger id="obj-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(OKR_LEVELS) as OkrLevelKey[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {OKR_LEVELS[key].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="obj-status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="obj-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(OKR_STATUS) as OkrStatusKey[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {OKR_STATUS[key].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Owner ID */}
          <div>
            <Label htmlFor="obj-owner">Responsavel (ID)</Label>
            <Input
              id="obj-owner"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              placeholder="ID do responsavel (opcional)"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
