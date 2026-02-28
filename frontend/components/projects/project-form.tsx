"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateProject } from "@/hooks/use-projects";
import { useAuthStore } from "@/stores/auth-store";

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectForm({ open, onOpenChange }: ProjectFormProps) {
  const [name, setName] = useState("");
  const [construtora, setConstrutora] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const createProject = useCreateProject();
  const tenantId = useAuthStore((s) => s.tenantId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !tenantId) return;

    await createProject.mutateAsync({
      name: name.trim(),
      construtora: construtora.trim() || null,
      owner_name: ownerName.trim() || null,
      status: "em_andamento",
      tenant_id: tenantId,
    });

    setName("");
    setConstrutora("");
    setOwnerName("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Projeto</DialogTitle>
          <DialogDescription>
            Crie um novo projeto para acompanhar no board.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Projeto *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Residencial Aurora"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="construtora">Construtora</Label>
            <Input
              id="construtora"
              value={construtora}
              onChange={(e) => setConstrutora(e.target.value)}
              placeholder="Ex: MRV"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner">Responsavel</Label>
            <Input
              id="owner"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Nome do responsavel"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? "Criando..." : "Criar Projeto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
