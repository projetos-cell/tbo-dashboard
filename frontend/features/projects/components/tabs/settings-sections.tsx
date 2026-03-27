"use client";

import { useState } from "react";
import {
  IconLayoutSidebar,
  IconGripVertical,
  IconPencil,
  IconTrash,
  IconPlus,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useProjectSections,
  useCreateProjectSection,
  useUpdateProjectSection,
  useDeleteProjectSection,
} from "@/features/projects/hooks/use-project-tasks";
import { useTeamMembers } from "@/hooks/use-team";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { TASK_STATUS, TASK_PRIORITY, type TaskStatusKey, type TaskPriorityKey } from "@/lib/constants";

const SECTION_COLORS = ["#6b7280", "#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4"];

interface SettingsSectionsProps { projectId: string }

export function SettingsSections({ projectId }: SettingsSectionsProps) {
  const { data: sections = [] } = useProjectSections(projectId);
  const createSection = useCreateProjectSection(projectId);
  const updateSection = useUpdateProjectSection(projectId);
  const deleteSection = useDeleteProjectSection(projectId);
  const { data: members } = useTeamMembers({ is_active: true });
  const { toast } = useToast();

  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  const handleAddSection = () => {
    const title = newSectionTitle.trim();
    if (!title) return;
    createSection.mutate(
      { title, order_index: sections.length },
      {
        onSuccess: () => {
          setNewSectionTitle("");
          toast({ title: `Secao "${title}" criada` });
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
          toast({ title: "Secao renomeada" });
        },
      },
    );
  };

  const handleColorSection = (id: string, color: string) => {
    updateSection.mutate({ id, updates: { color } });
  };

  const handleDeleteSection = (id: string, title: string) => {
    deleteSection.mutate(id, {
      onSuccess: () => toast({ title: `Secao "${title}" removida` }),
      onError: () => toast({ title: "Erro ao remover secao", variant: "destructive" }),
    });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <IconLayoutSidebar className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Secoes</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Organize as tarefas em secoes. As tarefas sem secao ficam no topo.
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
                  title="Campos padrao da secao"
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

              {/* Section default fields */}
              {isExpanded && (
                <div className="border-t border-border/30 px-3 py-2.5 bg-muted/20 space-y-2">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    Campos padrao ao mover tarefa para esta secao
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
                      <label className="text-[10px] text-muted-foreground">Responsavel</label>
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
          placeholder="Nome da nova secao..."
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
  );
}
