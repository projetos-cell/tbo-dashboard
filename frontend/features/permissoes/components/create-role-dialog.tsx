"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCreating: boolean;
  onSubmit: (name: string, slug: string, description: string) => void;
}

export function CreateRoleDialog({ open, onOpenChange, isCreating, onSubmit }: CreateRoleDialogProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit() {
    onSubmit(name, slug, description);
    setName("");
    setSlug("");
    setDescription("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Role</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="role-name">Nome</Label>
            <Input
              id="role-name"
              placeholder="Ex: Gerente de Projetos"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-slug">Slug</Label>
            <Input
              id="role-slug"
              placeholder="Ex: gerente-projetos"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-description">Descrição (opcional)</Label>
            <Input
              id="role-description"
              placeholder="Descrição da role..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || !slug.trim() || isCreating}>
            {isCreating ? "Criando..." : "Criar Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
