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
import { toast } from "sonner";
import { useCreateCrmStage } from "@/features/comercial/hooks/use-commercial";

const STAGE_COLORS = [
  { color: "#6366f1", bg: "rgba(99,102,241,0.12)", label: "Indigo" },
  { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Amber" },
  { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", label: "Blue" },
  { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", label: "Purple" },
  { color: "#0ea5e9", bg: "rgba(14,165,233,0.12)", label: "Cyan" },
  { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Emerald" },
  { color: "#f97316", bg: "rgba(249,115,22,0.12)", label: "Orange" },
  { color: "#ec4899", bg: "rgba(236,72,153,0.12)", label: "Pink" },
  { color: "#14b8a6", bg: "rgba(20,184,166,0.12)", label: "Teal" },
  { color: "#64748b", bg: "rgba(100,116,139,0.12)", label: "Slate" },
];

interface AddStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingStageCount: number;
}

export function AddStageDialog({ open, onOpenChange, existingStageCount }: AddStageDialogProps) {
  const createStage = useCreateCrmStage();
  const [label, setLabel] = useState("");
  const [selectedColor, setSelectedColor] = useState(0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;

    const id = label
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

    const colorPick = STAGE_COLORS[selectedColor];

    createStage.mutate(
      {
        id,
        label: label.trim(),
        sort_order: existingStageCount,
        color: colorPick.color,
        bg: colorPick.bg,
      },
      {
        onSuccess: () => {
          toast.success(`Etapa "${label.trim()}" criada`);
          setLabel("");
          setSelectedColor(0);
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova etapa do funil</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stage-label">Nome da etapa</Label>
            <Input
              id="stage-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: Reunião Agendada, Follow-up..."
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {STAGE_COLORS.map((c, idx) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setSelectedColor(idx)}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${
                    selectedColor === idx
                      ? "border-gray-900 scale-110"
                      : "border-transparent hover:border-gray-300"
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          {label.trim() && (
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: STAGE_COLORS[selectedColor].color }}
              />
              <span className="text-sm font-medium">{label.trim()}</span>
              <span className="text-xs text-gray-500 ml-auto">
                posição {existingStageCount + 1}
              </span>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!label.trim() || createStage.isPending}>
              {createStage.isPending ? "Criando..." : "Criar etapa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
