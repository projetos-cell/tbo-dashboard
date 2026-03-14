"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateProject } from "@/features/projects/hooks/use-projects";
import { useAuthStore } from "@/stores/auth-store";
import { BU_LIST, BU_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const projectSchema = z.object({
  name: z.string().min(1, "Nome do projeto é obrigatório"),
  code: z.string().optional(),
  construtora: z.string().optional(),
  owner_name: z.string().optional(),
  bus: z.array(z.string()).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectForm({ open, onOpenChange }: ProjectFormProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [construtora, setConstrutora] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [selectedBus, setSelectedBus] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});
  const createProject = useCreateProject();
  const tenantId = useAuthStore((s) => s.tenantId);

  function toggleBu(bu: string) {
    setSelectedBus((prev) =>
      prev.includes(bu) ? prev.filter((b) => b !== bu) : [...prev, bu],
    );
  }

  function resetForm() {
    setName("");
    setCode("");
    setConstrutora("");
    setOwnerName("");
    setSelectedBus([]);
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = projectSchema.safeParse({
      name: name.trim(),
      code: code.trim(),
      construtora: construtora.trim(),
      owner_name: ownerName.trim(),
      bus: selectedBus,
    });
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ProjectFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ProjectFormData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    if (!tenantId) return;

    await createProject.mutateAsync({
      name: result.data.name,
      code: result.data.code || null,
      construtora: result.data.construtora || null,
      owner_name: result.data.owner_name || null,
      bus: result.data.bus?.length ? JSON.stringify(result.data.bus) : null,
      status: "em_andamento",
      tenant_id: tenantId,
    } as never);

    resetForm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Novo Projeto</DialogTitle>
          <DialogDescription>
            Crie um novo projeto para acompanhar no board.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome + Código */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Nome do Projeto *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: undefined })); }}
                placeholder="Ex: Residencial Aurora"
                required
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex: AUR"
                className="font-mono uppercase"
                maxLength={10}
              />
            </div>
          </div>

          {/* BU Selection */}
          <div className="space-y-2">
            <Label>Setores (BU)</Label>
            <div className="flex flex-wrap gap-2">
              {BU_LIST.map((bu) => {
                const isSelected = selectedBus.includes(bu);
                const buStyle = BU_COLORS[bu];
                return (
                  <Badge
                    key={bu}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer select-none transition-colors",
                      !isSelected && "hover:bg-accent",
                    )}
                    style={
                      isSelected && buStyle
                        ? { backgroundColor: buStyle.color, color: "#fff", borderColor: "transparent" }
                        : undefined
                    }
                    onClick={() => toggleBu(bu)}
                  >
                    {bu}
                  </Badge>
                );
              })}
            </div>
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
            <Label htmlFor="owner">Responsável</Label>
            <Input
              id="owner"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Nome do responsável"
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
