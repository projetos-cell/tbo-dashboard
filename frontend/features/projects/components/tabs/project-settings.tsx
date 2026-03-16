"use client";

import { useState } from "react";
import {
  IconAdjustments,
  IconFlag,
  IconLayoutList,
  IconLayoutSidebar,
  IconTrash,
  IconPencil,
  IconPlus,
  IconGripVertical,
  IconLink,
  IconAlertTriangle,
  IconPlayerPause,
  IconChevronDown,
  IconChevronUp,
  IconClipboardText,
  IconCopy,
  IconCheck,
  IconBolt,
  IconPower,
  IconLoader2,
  IconDownload,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyEditor } from "@/features/projects/components/property-editor";
import { useProject, useUpdateProject, useDeleteProject } from "@/features/projects/hooks/use-projects";
import {
  useProjectSections,
  useCreateProjectSection,
  useUpdateProjectSection,
  useDeleteProjectSection,
} from "@/features/projects/hooks/use-project-tasks";
import {
  useIntakeForm,
  useCreateIntakeForm,
  useUpdateIntakeForm,
} from "@/features/projects/hooks/use-intake-forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { useTeamMembers } from "@/hooks/use-team";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import {
  useProjectRules,
  useCreateProjectRule,
  useUpdateProjectRule,
  useDeleteProjectRule,
} from "@/features/projects/hooks/use-project-rules";
import { TRIGGER_TYPES, ACTION_TYPES, type TriggerType } from "@/features/projects/services/project-rules";
import { cn } from "@/lib/utils";
import { TASK_STATUS, TASK_PRIORITY, type TaskStatusKey, type TaskPriorityKey } from "@/lib/constants";

interface ProjectSettingsProps {
  projectId: string;
}

const SECTION_COLORS = [
  "#6b7280", "#ef4444", "#f59e0b", "#22c55e",
  "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4",
];

export function ProjectSettings({ projectId }: ProjectSettingsProps) {
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: sections = [], isLoading: sectionsLoading } = useProjectSections(projectId);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const createSection = useCreateProjectSection(projectId);
  const updateSection = useUpdateProjectSection(projectId);
  const deleteSection = useDeleteProjectSection(projectId);
  const { toast } = useToast();
  const router = useRouter();

  const [notionUrl, setNotionUrl] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [intakeCopied, setIntakeCopied] = useState(false);
  const [notionImporting, setNotionImporting] = useState(false);
  const [notionImportResult, setNotionImportResult] = useState<{
    tasks_created?: number;
    tasks_updated?: number;
    comments_imported?: number;
    errors?: string[];
    error?: string;
  } | null>(null);
  const { data: members } = useTeamMembers({ is_active: true });
  const { data: intakeForm } = useIntakeForm(projectId);
  const createIntakeForm = useCreateIntakeForm();
  const updateIntakeForm = useUpdateIntakeForm();
  const tenantId = useAuthStore((s) => s.tenantId);

  // Rules engine
  const { data: rules = [] } = useProjectRules(projectId);
  const createRule = useCreateProjectRule();
  const updateRule = useUpdateProjectRule(projectId);
  const deleteRule = useDeleteProjectRule(projectId);

  // Init external URLs from project
  const projectNotionUrl = project?.notion_url ?? "";
  const projectNotes = project?.notes ?? "";

  if (projectLoading || sectionsLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const handleAddSection = () => {
    const title = newSectionTitle.trim();
    if (!title) return;
    createSection.mutate(
      { title, order_index: sections.length },
      {
        onSuccess: () => {
          setNewSectionTitle("");
          toast({ title: `Seção "${title}" criada` });
        },
      },
    );
  };

  const handleRenameSection = (id: string) => {
    const title = editingSectionTitle.trim();
    if (!title) return;
    updateSection.mutate(
      { id, updates: { title } },
      {
        onSuccess: () => {
          setEditingSectionId(null);
          toast({ title: "Seção renomeada" });
        },
      },
    );
  };

  const handleColorSection = (id: string, color: string) => {
    updateSection.mutate({ id, updates: { color } });
  };

  const handleDeleteSection = (id: string, title: string) => {
    deleteSection.mutate(id, {
      onSuccess: () => toast({ title: `Seção "${title}" removida` }),
      onError: () => toast({ title: "Erro ao remover seção", variant: "destructive" }),
    });
  };

  const handleSaveIntegrations = () => {
    const updates: Record<string, unknown> = {};
    if (notionUrl !== projectNotionUrl) updates.notion_url = notionUrl || null;
    if (Object.keys(updates).length > 0) {
      updateProject.mutate(
        { id: projectId, updates: updates as never },
        { onSuccess: () => toast({ title: "Integrações salvas" }) },
      );
    }
  };

  const handleNotionImport = async () => {
    // Extract database ID from Notion URL
    const url = notionUrl || projectNotionUrl;
    if (!url) {
      toast({ title: "Configure a Notion URL primeiro", variant: "destructive" });
      return;
    }

    const match = url.match(/([a-f0-9]{32})/i);
    if (!match) {
      toast({ title: "URL do Notion inválida — não foi possível extrair o ID", variant: "destructive" });
      return;
    }

    const databaseId = match[1];
    setNotionImporting(true);
    setNotionImportResult(null);

    try {
      const params = new URLSearchParams({
        mode: "project-import",
        project_id: projectId,
        database_id: databaseId,
      });

      const res = await fetch(`/api/notion/sync?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setNotionImportResult({ error: data.error ?? `HTTP ${res.status}` });
        toast({ title: "Erro na importação", description: data.error, variant: "destructive" });
        return;
      }

      setNotionImportResult(data);
      toast({
        title: "Importação concluída",
        description: `${data.tasks_created ?? 0} tarefas criadas, ${data.tasks_updated ?? 0} atualizadas, ${data.comments_imported ?? 0} comentários`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro de rede";
      setNotionImportResult({ error: msg });
      toast({ title: "Erro na importação", description: msg, variant: "destructive" });
    } finally {
      setNotionImporting(false);
    }
  };

  const handleArchive = () => {
    updateProject.mutate(
      { id: projectId, updates: { status: "parado" } },
      { onSuccess: () => toast({ title: "Projeto pausado" }) },
    );
  };

  const handleDeleteConfirm = () => {
    deleteProject.mutate(projectId, {
      onSuccess: () => {
        toast({ title: "Projeto excluído" });
        router.push("/projetos");
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Configurações do Projeto</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie status, prioridades, seções e integrações.
        </p>
      </div>

      {/* 1. Status Editor */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <IconLayoutList className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Status das Tarefas</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Defina os status disponíveis para tarefas neste projeto.
        </p>
        <PropertyEditor
          property="status"
          trigger={
            <Button variant="outline" size="sm" className="gap-2">
              <IconAdjustments className="size-3.5" />
              Editar Status
            </Button>
          }
        />
      </section>

      {/* 2. Priority Editor */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <IconFlag className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Prioridades</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Configure os níveis de prioridade e suas cores.
        </p>
        <PropertyEditor
          property="priority"
          trigger={
            <Button variant="outline" size="sm" className="gap-2">
              <IconAdjustments className="size-3.5" />
              Editar Prioridades
            </Button>
          }
        />
      </section>

      {/* 3. Seções */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <IconLayoutSidebar className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Seções</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Organize as tarefas em seções. As tarefas sem seção ficam no topo.
        </p>

        <div className="space-y-1.5">
          {sections.map((sec) => {
            const isExpanded = expandedSectionId === sec.id;
            const hasDefaults = !!(sec.default_status || sec.default_priority || sec.default_assignee_id);
            return (
              <div key={sec.id} className="rounded-md border border-border/50 bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 group">
                  <IconGripVertical className="size-3.5 text-muted-foreground/40" />
                  <div
                    className="size-3 shrink-0 rounded-full border border-black/10"
                    style={{ backgroundColor: sec.color ?? "#6b7280" }}
                  />

                  {editingSectionId === sec.id ? (
                    <input
                      value={editingSectionTitle}
                      onChange={(e) => setEditingSectionTitle(e.target.value)}
                      onBlur={() => handleRenameSection(sec.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameSection(sec.id);
                        if (e.key === "Escape") setEditingSectionId(null);
                      }}
                      className="flex-1 h-6 bg-transparent text-sm outline-none border-b border-primary"
                      autoFocus
                    />
                  ) : (
                    <span className="flex-1 text-sm">{sec.title}</span>
                  )}

                  {hasDefaults && !isExpanded && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 font-normal text-muted-foreground">
                      Defaults
                    </Badge>
                  )}

                  {/* Color picker */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {SECTION_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleColorSection(sec.id, c)}
                        className={cn(
                          "size-3 rounded-full border transition-transform hover:scale-125",
                          sec.color === c ? "border-foreground" : "border-transparent",
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  {/* Expand defaults */}
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setExpandedSectionId(isExpanded ? null : sec.id)}
                    title="Campos padrão da seção"
                  >
                    {isExpanded ? <IconChevronUp className="size-3.5" /> : <IconChevronDown className="size-3.5" />}
                  </button>

                  <button
                    type="button"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setEditingSectionId(sec.id);
                      setEditingSectionTitle(sec.title);
                    }}
                  >
                    <IconPencil className="size-3.5" />
                  </button>

                  <button
                    type="button"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteSection(sec.id, sec.title)}
                  >
                    <IconTrash className="size-3.5" />
                  </button>
                </div>

                {/* A02: Section default fields */}
                {isExpanded && (
                  <div className="border-t border-border/30 px-3 py-2.5 bg-muted/20 space-y-2">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      Campos padrão ao mover tarefa para esta seção
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {/* Default status */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Status</label>
                        <Select
                          value={sec.default_status ?? "__none__"}
                          onValueChange={(val) =>
                            updateSection.mutate({
                              id: sec.id,
                              updates: { default_status: val === "__none__" ? null : val },
                            })
                          }
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder="Nenhum" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Nenhum</SelectItem>
                            {(Object.entries(TASK_STATUS) as [TaskStatusKey, (typeof TASK_STATUS)[TaskStatusKey]][]).map(
                              ([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-1.5">
                                    <div className="size-2 rounded-full" style={{ backgroundColor: config.color }} />
                                    {config.label}
                                  </div>
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Default priority */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Prioridade</label>
                        <Select
                          value={sec.default_priority ?? "__none__"}
                          onValueChange={(val) =>
                            updateSection.mutate({
                              id: sec.id,
                              updates: { default_priority: val === "__none__" ? null : val },
                            })
                          }
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder="Nenhuma" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Nenhuma</SelectItem>
                            {(Object.entries(TASK_PRIORITY) as [TaskPriorityKey, (typeof TASK_PRIORITY)[TaskPriorityKey]][]).map(
                              ([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-1.5">
                                    <div className="size-2 rounded-full" style={{ backgroundColor: config.color }} />
                                    {config.label}
                                  </div>
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Default assignee */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Responsável</label>
                        <Select
                          value={sec.default_assignee_id ?? "__none__"}
                          onValueChange={(val) =>
                            updateSection.mutate({
                              id: sec.id,
                              updates: { default_assignee_id: val === "__none__" ? null : val },
                            })
                          }
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder="Nenhum" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Nenhum</SelectItem>
                            {(members ?? []).map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add section */}
        <div className="flex items-center gap-2">
          <Input
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            placeholder="Nome da nova seção..."
            className="h-8 text-sm flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleAddSection()}
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={handleAddSection}
            disabled={!newSectionTitle.trim() || createSection.isPending}
          >
            <IconPlus className="size-3.5" />
            Adicionar
          </Button>
        </div>
      </section>

      {/* 4. Integrações */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <IconLink className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Integrações</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Links externos associados ao projeto.
        </p>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Notion URL</label>
            <Input
              value={notionUrl || projectNotionUrl}
              onChange={(e) => setNotionUrl(e.target.value)}
              placeholder="https://www.notion.so/..."
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Google Drive Folder</label>
            <Input
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="h-8 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveIntegrations}
              disabled={updateProject.isPending}
            >
              Salvar integrações
            </Button>

            {(notionUrl || projectNotionUrl) && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleNotionImport}
                disabled={notionImporting}
              >
                {notionImporting ? (
                  <IconLoader2 className="size-3.5 animate-spin" />
                ) : (
                  <IconDownload className="size-3.5" />
                )}
                {notionImporting ? "Importando..." : "Importar do Notion"}
              </Button>
            )}
          </div>

          {/* Notion import result */}
          {notionImportResult && (
            <div
              className={cn(
                "rounded-md border px-3 py-2.5 text-sm space-y-1",
                notionImportResult.error
                  ? "border-red-200 bg-red-50/50 text-red-700 dark:border-red-900/50 dark:bg-red-950/10 dark:text-red-400"
                  : "border-green-200 bg-green-50/50 text-green-700 dark:border-green-900/50 dark:bg-green-950/10 dark:text-green-400",
              )}
            >
              {notionImportResult.error ? (
                <p>{notionImportResult.error}</p>
              ) : (
                <>
                  <div className="flex items-center gap-4 text-xs">
                    <span><strong>{notionImportResult.tasks_created}</strong> tarefas criadas</span>
                    <span><strong>{notionImportResult.tasks_updated}</strong> atualizadas</span>
                    <span><strong>{notionImportResult.comments_imported}</strong> comentários</span>
                  </div>
                  {notionImportResult.errors && notionImportResult.errors.length > 0 && (
                    <details className="text-xs text-muted-foreground">
                      <summary className="cursor-pointer">
                        {notionImportResult.errors.length} aviso(s)
                      </summary>
                      <ul className="mt-1 list-disc pl-4 space-y-0.5">
                        {notionImportResult.errors.slice(0, 10).map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 5. Formulário de Intake */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <IconClipboardText className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Formulário de Intake</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Link público para receber solicitações que criam tarefas automaticamente.
        </p>

        {intakeForm ? (
          <div className="space-y-3">
            {/* Toggle active */}
            <div className="flex items-center justify-between">
              <span className="text-sm">
                Formulário {intakeForm.is_active ? (
                  <Badge variant="secondary" className="ml-1 bg-green-50 text-green-700 text-[10px]">Ativo</Badge>
                ) : (
                  <Badge variant="secondary" className="ml-1 text-[10px]">Inativo</Badge>
                )}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateIntakeForm.mutate({
                    id: intakeForm.id,
                    updates: { is_active: !intakeForm.is_active },
                  })
                }
              >
                {intakeForm.is_active ? "Desativar" : "Ativar"}
              </Button>
            </div>

            {/* Intake URL */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Link público</label>
              <div className="flex items-center gap-2">
                <Input
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/intake/${intakeForm.token}`}
                  readOnly
                  className="h-8 text-sm flex-1 bg-muted/30"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1"
                  onClick={() => {
                    void navigator.clipboard.writeText(
                      `${window.location.origin}/intake/${intakeForm.token}`
                    );
                    setIntakeCopied(true);
                    setTimeout(() => setIntakeCopied(false), 2000);
                  }}
                >
                  {intakeCopied ? (
                    <IconCheck className="size-3.5 text-green-600" />
                  ) : (
                    <IconCopy className="size-3.5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Target section */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Seção destino</label>
              <Select
                value={intakeForm.target_section_id ?? "__none__"}
                onValueChange={(val) =>
                  updateIntakeForm.mutate({
                    id: intakeForm.id,
                    updates: { target_section_id: val === "__none__" ? null : val },
                  })
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Primeira seção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Primeira seção</SelectItem>
                  {sections.map((sec) => (
                    <SelectItem key={sec.id} value={sec.id}>
                      {sec.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Default status */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Status padrão</label>
              <Select
                value={intakeForm.default_status ?? "pendente"}
                onValueChange={(val) =>
                  updateIntakeForm.mutate({
                    id: intakeForm.id,
                    updates: { default_status: val },
                  })
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(TASK_STATUS) as [TaskStatusKey, (typeof TASK_STATUS)[TaskStatusKey]][]).map(
                    ([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }} />
                          {config.label}
                        </div>
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={createIntakeForm.isPending}
            onClick={() => {
              if (!tenantId) return;
              createIntakeForm.mutate({
                project_id: projectId,
                tenant_id: tenantId,
              });
            }}
          >
            <IconPlus className="size-3.5" />
            Criar formulário de intake
          </Button>
        )}
      </section>

      {/* 6. Rules Engine (A01) */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <IconBolt className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Regras de Automação</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Automatize ações quando eventos ocorrerem nas tarefas.
        </p>

        <div className="space-y-2">
          {rules.map((rule) => {
            const triggerLabel = TRIGGER_TYPES[rule.trigger_type as TriggerType]?.label ?? rule.trigger_type;
            const actions = (rule.actions_json ?? []) as Array<{ type: string; value: string }>;
            const actionLabels = actions
              .map((a) => ACTION_TYPES[a.type as keyof typeof ACTION_TYPES]?.label ?? a.type)
              .join(", ");

            return (
              <div
                key={rule.id}
                className="flex items-center gap-3 rounded-md border border-border/50 bg-card px-3 py-2 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{rule.name}</span>
                    {!rule.is_active && (
                      <Badge variant="secondary" className="text-[9px]">Inativa</Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    Quando: {triggerLabel}
                    {actionLabels && ` → ${actionLabels}`}
                  </div>
                </div>

                <button
                  type="button"
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all"
                  onClick={() =>
                    updateRule.mutate({
                      id: rule.id,
                      updates: { is_active: !rule.is_active } as never,
                    })
                  }
                  title={rule.is_active ? "Desativar" : "Ativar"}
                >
                  <IconPower className="size-3.5" />
                </button>

                <button
                  type="button"
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                  onClick={() => deleteRule.mutate(rule.id)}
                >
                  <IconTrash className="size-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Quick-add rule */}
        <div className="flex items-center gap-2">
          <Select
            value=""
            onValueChange={(triggerType) => {
              if (!tenantId) return;
              const triggerLabel = TRIGGER_TYPES[triggerType as TriggerType]?.label ?? triggerType;
              createRule.mutate({
                project_id: projectId,
                tenant_id: tenantId,
                name: triggerLabel,
                trigger_type: triggerType,
              } as never);
            }}
          >
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue placeholder="Adicionar regra..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TRIGGER_TYPES).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {rules.length === 0 && (
          <p className="text-[11px] text-muted-foreground pl-1">
            Nenhuma regra configurada. Selecione um gatilho acima para criar.
          </p>
        )}
      </section>

      {/* 7. Danger zone */}
      <section className="space-y-3 rounded-lg border border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/10 p-4">
        <div className="flex items-center gap-2">
          <IconAlertTriangle className="size-4 text-red-500" />
          <h3 className="text-sm font-medium text-red-700 dark:text-red-400">Zona de perigo</h3>
        </div>
        <p className="text-xs text-red-600/80 dark:text-red-400/80">
          Ações irreversíveis. Tenha cuidado.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50"
            onClick={handleArchive}
            disabled={updateProject.isPending || project?.status === "parado"}
          >
            <IconPlayerPause className="size-3.5" />
            Pausar projeto
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-red-300 text-red-700 hover:bg-red-50"
            onClick={() => setDeleteOpen(true)}
          >
            <IconTrash className="size-3.5" />
            Excluir projeto
          </Button>
        </div>
      </section>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir projeto"
        description={`Excluir "${project?.name}"? Esta ação não pode ser desfeita e todas as tarefas serão removidas.`}
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
