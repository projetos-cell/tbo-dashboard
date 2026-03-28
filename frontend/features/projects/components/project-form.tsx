"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { useApplyProjectTemplate } from "@/features/projects/hooks/use-project-templates";
import { formatProjectName } from "@/features/projects/services/projects";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
import { BU_LIST, BU_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MemberPicker } from "./member-picker";
import { ConstrutoraFormPicker } from "./construtora-picker";
import { TemplateSelector, DEFAULT_TEMPLATE_ID } from "./template-selector";

const projectSchema = z.object({
  name: z.string().min(1, "Nome do projeto é obrigatório"),
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
  const [construtora, setConstrutora] = useState("HORIZONTE");
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [selectedBus, setSelectedBus] = useState<string[]>([]);
  const [useTemplate, setUseTemplate] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] =
    useState(DEFAULT_TEMPLATE_ID);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProjectFormData, string>>
  >({});

  const createProject = useCreateProject();
  const applyTemplate = useApplyProjectTemplate();
  const tenantId = useAuthStore((s) => s.tenantId);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const isPending = createProject.isPending || applyTemplate.isPending;

  function toggleBu(bu: string) {
    setSelectedBus((prev) =>
      prev.includes(bu) ? prev.filter((b) => b !== bu) : [...prev, bu],
    );
  }

  function resetForm() {
    setName("");
    setConstrutora("HORIZONTE");
    setOwnerId(null);
    setOwnerName("");
    setSelectedBus([]);
    setUseTemplate(true);
    setSelectedTemplateId(DEFAULT_TEMPLATE_ID);
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = projectSchema.safeParse({
      name: name.trim(),
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

    const project = await createProject.mutateAsync({
      name: result.data.name,
      construtora: result.data.construtora || null,
      owner_name: result.data.owner_name || null,
      owner_id: ownerId,
      bus: result.data.bus?.length ? JSON.stringify(result.data.bus) : null,
      status: "em_andamento",
      tenant_id: tenantId,
    } as never);

    const projectId = (project as { id?: string })?.id;

    if (useTemplate && projectId) {
      await applyTemplate.mutateAsync({
        projectId,
        tenantId,
        templateId: selectedTemplateId,
      });
    }

    if (projectId && user?.id) {
      const supabase = createClient();
      await supabase
        .from("project_memberships")
        .insert({
          project_id: projectId,
          user_id: user.id,
          tenant_id: tenantId,
          granted_by: user.id,
          role_id: "2faa534a-7672-4931-a071-0a4565b6f8db",
        } as never)
        .single();
    }

    resetForm();
    onOpenChange(false);

    if (projectId) {
      router.push(`/projetos/${projectId}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Projeto</DialogTitle>
          <DialogDescription>
            Crie um novo projeto para acompanhar no board.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Empreendimento *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Ex: Residencial Aurora"
              required
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
            {name.trim() && (
              <p className="text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground">
                  {formatProjectName(name, construtora)}
                </span>
                {" · "}TBO-{new Date().getFullYear()}-NNN
              </p>
            )}
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
                        ? {
                            backgroundColor: buStyle.color,
                            color: "#fff",
                            borderColor: "transparent",
                          }
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

          {/* Construtora */}
          <div className="space-y-2">
            <Label>Construtora / Incorporadora</Label>
            <ConstrutoraFormPicker
              value={construtora}
              onSelect={(v) => setConstrutora(v)}
              onClear={() => setConstrutora("")}
            />
          </div>

          {/* Responsável */}
          <div className="space-y-2">
            <Label>Responsável</Label>
            <MemberPicker
              value={ownerName}
              onSelect={(id, fullName) => {
                setOwnerId(id);
                setOwnerName(fullName);
              }}
              onClear={() => {
                setOwnerId(null);
                setOwnerName("");
              }}
            />
          </div>

          {/* Template */}
          <TemplateSelector
            useTemplate={useTemplate}
            onUseTemplateChange={setUseTemplate}
            selectedTemplateId={selectedTemplateId}
            onSelectedTemplateIdChange={setSelectedTemplateId}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {createProject.isPending
                ? "Criando..."
                : applyTemplate.isPending
                  ? "Aplicando template..."
                  : "Criar Projeto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
