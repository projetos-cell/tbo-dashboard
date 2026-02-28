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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCheckin, useUpdateKeyResult } from "@/hooks/use-okrs";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";

type KeyResultRow = Database["public"]["Tables"]["okr_key_results"]["Row"];

interface OkrCheckinDialogProps {
  kr: KeyResultRow | null;
  open: boolean;
  onClose: () => void;
}

export function OkrCheckinDialog({ kr, open, onClose }: OkrCheckinDialogProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const createCheckin = useCreateCheckin();
  const updateKr = useUpdateKeyResult();

  const [newValue, setNewValue] = useState("");
  const [confidence, setConfidence] = useState("0.7");
  const [notes, setNotes] = useState("");

  function handleOpen() {
    if (kr) {
      setNewValue(String(kr.current_value ?? kr.start_value ?? 0));
      setConfidence(String(kr.confidence ?? 0.7));
      setNotes("");
    }
  }

  async function handleSubmit() {
    if (!kr || !tenantId) return;

    const numValue = parseFloat(newValue) || 0;
    const numConfidence = parseFloat(confidence) || 0.7;

    await createCheckin.mutateAsync({
      tenant_id: tenantId,
      key_result_id: kr.id,
      previous_value: kr.current_value ?? kr.start_value ?? 0,
      new_value: numValue,
      confidence: numConfidence,
      notes: notes || null,
      author_id: userId ?? null,
    });

    await updateKr.mutateAsync({
      id: kr.id,
      updates: {
        current_value: numValue,
        confidence: numConfidence,
      },
    });

    onClose();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
        else handleOpen();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Check-in</DialogTitle>
        </DialogHeader>

        {kr && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{kr.title}</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Valor Atual</Label>
                <p className="text-sm font-medium mt-1">
                  {kr.current_value ?? kr.start_value ?? 0}
                  {kr.unit ? ` ${kr.unit}` : ""}
                </p>
              </div>
              <div>
                <Label>Meta</Label>
                <p className="text-sm font-medium mt-1">
                  {kr.target_value ?? 0}
                  {kr.unit ? ` ${kr.unit}` : ""}
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="new-value">Novo Valor</Label>
              <Input
                id="new-value"
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="confidence">Confiança</Label>
              <Select value={confidence} onValueChange={setConfidence}>
                <SelectTrigger id="confidence">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1.0 — Alta</SelectItem>
                  <SelectItem value="0.7">0.7 — Média</SelectItem>
                  <SelectItem value="0.5">0.5 — Baixa</SelectItem>
                  <SelectItem value="0.3">0.3 — Muito baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="O que mudou desde o último check-in?"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createCheckin.isPending || updateKr.isPending}
          >
            {createCheckin.isPending ? "Salvando..." : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
