"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateDecision } from "@/hooks/use-decisions";
import { useAuthStore } from "@/stores/auth-store";

interface DecisionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DecisionForm({ open, onOpenChange }: DecisionFormProps) {
  const createDecision = useCreateDecision();
  const tenantId = useAuthStore((s) => s.tenantId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [decidedBy, setDecidedBy] = useState("");
  const [projectId, setProjectId] = useState("");
  const [meetingId, setMeetingId] = useState("");

  const reset = () => {
    setTitle("");
    setDescription("");
    setDecidedBy("");
    setProjectId("");
    setMeetingId("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !tenantId) return;

    createDecision.mutate(
      {
        tenant_id: tenantId,
        title: title.trim(),
        description: description.trim() || null,
        decided_by: decidedBy.trim() || null,
        project_id: projectId.trim() || null,
        meeting_id: meetingId.trim() || null,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Decisao</DialogTitle>
          <DialogDescription>
            Preencha os campos para registrar uma nova decisao.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="decision-title">Titulo *</Label>
            <Input
              id="decision-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Aprovacao do novo escopo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="decision-desc">Descricao</Label>
            <textarea
              id="decision-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes da decisao..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="decision-decided-by">Decidido por</Label>
            <Input
              id="decision-decided-by"
              value={decidedBy}
              onChange={(e) => setDecidedBy(e.target.value)}
              placeholder="Nome da pessoa ou grupo"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="decision-project">Projeto</Label>
              <Input
                id="decision-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="ID do projeto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="decision-meeting">Reuniao</Label>
              <Input
                id="decision-meeting"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                placeholder="ID da reuniao"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createDecision.isPending || !title.trim()}
            >
              {createDecision.isPending ? "Criando..." : "Criar Decisao"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
