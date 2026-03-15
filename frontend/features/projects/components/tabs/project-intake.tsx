"use client";

import { useState, useCallback } from "react";
import {
  IconClipboardList,
  IconPlus,
  IconTrash,
  IconGripVertical,
  IconLink,
  IconCheck,
  IconPower,
  IconCopy,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth-store";
import {
  useIntakeForm,
  useCreateIntakeForm,
  useUpdateIntakeForm,
  useDeleteIntakeForm,
} from "@/features/projects/hooks/use-intake-forms";
import { useProjectSections } from "@/features/projects/hooks/use-project-tasks";
import type { IntakeField } from "@/features/projects/services/intake-forms";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";

interface ProjectIntakeProps {
  projectId: string;
}

const FIELD_TYPES = [
  { value: "text", label: "Texto" },
  { value: "textarea", label: "Texto longo" },
  { value: "select", label: "Seleção" },
  { value: "date", label: "Data" },
  { value: "email", label: "E-mail" },
  { value: "url", label: "URL" },
] as const;

export function ProjectIntake({ projectId }: ProjectIntakeProps) {
  const { toast } = useToast();
  const tenantId = useAuthStore((s) => s.tenantId);
  const { data: form, isLoading } = useIntakeForm(projectId);
  const { data: sections = [] } = useProjectSections(projectId);
  const createForm = useCreateIntakeForm();
  const updateForm = useUpdateIntakeForm();
  const deleteForm = useDeleteIntakeForm();

  const [linkCopied, setLinkCopied] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleCreate = useCallback(() => {
    if (!tenantId) return;
    createForm.mutate({
      project_id: projectId,
      tenant_id: tenantId,
      title: "Formulário de Intake",
    } as never);
  }, [tenantId, projectId, createForm]);

  const handleUpdateFields = useCallback(
    (fields: IntakeField[]) => {
      if (!form) return;
      updateForm.mutate({
        id: form.id,
        updates: { fields_json: JSON.stringify(fields) } as never,
      });
    },
    [form, updateForm]
  );

  const handleAddField = useCallback(() => {
    if (!form) return;
    const current = parseFields(form.fields_json);
    const key = `field_${Date.now()}`;
    handleUpdateFields([
      ...current,
      { key, label: "Novo campo", type: "text", required: false },
    ]);
  }, [form, handleUpdateFields]);

  const handleRemoveField = useCallback(
    (key: string) => {
      if (!form) return;
      const current = parseFields(form.fields_json);
      handleUpdateFields(current.filter((f) => f.key !== key));
    },
    [form, handleUpdateFields]
  );

  const handleFieldChange = useCallback(
    (key: string, updates: Partial<IntakeField>) => {
      if (!form) return;
      const current = parseFields(form.fields_json);
      handleUpdateFields(
        current.map((f) => (f.key === key ? { ...f, ...updates } : f))
      );
    },
    [form, handleUpdateFields]
  );

  const handleCopyLink = useCallback(() => {
    if (!form) return;
    const url = `${window.location.origin}/intake/${form.token}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      toast({ title: "Link copiado" });
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }, [form, toast]);

  const handleToggleActive = useCallback(() => {
    if (!form) return;
    updateForm.mutate({
      id: form.id,
      updates: { is_active: !form.is_active } as never,
    });
  }, [form, updateForm]);

  const handleDeleteConfirm = useCallback(() => {
    if (!form) return;
    deleteForm.mutate(form.id);
  }, [form, deleteForm]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!form) {
    return (
      <EmptyState
        icon={IconClipboardList}
        title="Nenhum formulário de intake"
        description="Crie um formulário público para receber solicitações diretamente como tarefas neste projeto."
        cta={{
          label: "Criar formulário",
          onClick: handleCreate,
          icon: IconPlus,
        }}
      />
    );
  }

  const fields = parseFields(form.fields_json);
  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/intake/${form.token}`
    : `/intake/${form.token}`;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Formulário de Intake</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Link público que cria tarefas automaticamente neste projeto.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={form.is_active ? "default" : "secondary"}
            className="text-xs"
          >
            {form.is_active ? "Ativo" : "Inativo"}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={handleToggleActive}
            title={form.is_active ? "Desativar" : "Ativar"}
          >
            <IconPower className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Public link */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
        <label className="text-xs font-medium flex items-center gap-1.5">
          <IconLink className="size-3.5" />
          Link público
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 truncate rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground font-mono">
            {publicUrl}
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={handleCopyLink}>
            {linkCopied ? <IconCheck className="size-3.5 text-green-500" /> : <IconCopy className="size-3.5" />}
            {linkCopied ? "Copiado" : "Copiar"}
          </Button>
        </div>
      </div>

      {/* Form settings */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium">Título do formulário</label>
          <Input
            value={form.title}
            onChange={(e) =>
              updateForm.mutate({
                id: form.id,
                updates: { title: e.target.value } as never,
              })
            }
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium">Descrição (opcional)</label>
          <Textarea
            value={form.description ?? ""}
            onChange={(e) =>
              updateForm.mutate({
                id: form.id,
                updates: { description: e.target.value || null } as never,
              })
            }
            rows={2}
            className="text-sm"
            placeholder="Instruções para quem preencher o formulário..."
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Seção destino</label>
            <Select
              value={form.target_section_id ?? "none"}
              onValueChange={(v) =>
                updateForm.mutate({
                  id: form.id,
                  updates: { target_section_id: v === "none" ? null : v } as never,
                })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                {sections.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Status padrão</label>
            <Select
              value={form.default_status ?? "pendente"}
              onValueChange={(v) =>
                updateForm.mutate({
                  id: form.id,
                  updates: { default_status: v } as never,
                })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TASK_STATUS).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Prioridade padrão</label>
            <Select
              value={form.default_priority ?? "media"}
              onValueChange={(v) =>
                updateForm.mutate({
                  id: form.id,
                  updates: { default_priority: v } as never,
                })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TASK_PRIORITY).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Fields editor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Campos do formulário</label>
          <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={handleAddField}>
            <IconPlus className="size-3" />
            Adicionar campo
          </Button>
        </div>

        <div className="space-y-2">
          {fields.map((field) => (
            <div
              key={field.key}
              className="flex items-center gap-2 rounded-md border border-border bg-background p-2"
            >
              <IconGripVertical className="size-3.5 text-muted-foreground/50 shrink-0 cursor-grab" />

              <Input
                value={field.label}
                onChange={(e) => handleFieldChange(field.key, { label: e.target.value })}
                className="h-7 text-xs flex-1"
                placeholder="Nome do campo"
              />

              <Select
                value={field.type}
                onValueChange={(v) =>
                  handleFieldChange(field.key, { type: v as IntakeField["type"] })
                }
              >
                <SelectTrigger className="h-7 text-xs w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <label className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Switch
                  checked={field.required}
                  onCheckedChange={(v) => handleFieldChange(field.key, { required: v })}
                  className="scale-75"
                />
                Obrigatório
              </label>

              {field.key !== "title" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground hover:text-red-500 shrink-0"
                  onClick={() => handleRemoveField(field.key)}
                >
                  <IconTrash className="size-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 gap-1.5"
          onClick={() => setDeleteOpen(true)}
        >
          <IconTrash className="size-3.5" />
          Excluir formulário
        </Button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir formulário de intake"
        description="O link público deixará de funcionar. Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseFields(json: unknown): IntakeField[] {
  if (typeof json === "string") {
    try {
      return JSON.parse(json) as IntakeField[];
    } catch {
      return [];
    }
  }
  if (Array.isArray(json)) return json as IntakeField[];
  return [];
}
