"use client";

import { useState } from "react";
import { z } from "zod";
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

const roleSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve ser kebab-case (ex: gerente-projetos)"),
  description: z.string().max(255, "Máximo 255 caracteres").optional(),
});

type RoleFormErrors = Partial<Record<keyof z.infer<typeof roleSchema>, string>>;

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
  const [errors, setErrors] = useState<RoleFormErrors>({});

  function handleSubmit() {
    const result = roleSchema.safeParse({ name, slug, description: description || undefined });
    if (!result.success) {
      const fieldErrors: RoleFormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof RoleFormErrors;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
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
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-slug">Slug</Label>
            <Input
              id="role-slug"
              placeholder="Ex: gerente-projetos"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setErrors((p) => ({ ...p, slug: undefined })); }}
              className={errors.slug ? "border-destructive" : ""}
            />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-description">Descrição (opcional)</Label>
            <Input
              id="role-description"
              placeholder="Descrição da role..."
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: undefined })); }}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
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
