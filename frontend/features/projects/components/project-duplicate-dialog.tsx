"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateProject } from "@/features/projects/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

interface DuplicateOptions {
  copySections: boolean;
  copyTasks: boolean;
  copyAssignees: boolean;
  copyDates: boolean;
}

interface ProjectDuplicateDialogProps {
  project: ProjectRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectDuplicateDialog({
  project,
  open,
  onOpenChange,
}: ProjectDuplicateDialogProps) {
  const createProject = useCreateProject();
  const { toast } = useToast();
  const tenantId = useAuthStore((s) => s.tenantId);
  const [duplicating, setDuplicating] = useState(false);
  const [dupOptions, setDupOptions] = useState<DuplicateOptions>({
    copySections: true,
    copyTasks: true,
    copyAssignees: false,
    copyDates: false,
  });

  const handleDuplicateConfirm = async () => {
    if (!tenantId) return;
    setDuplicating(true);

    try {
      const newProject = await createProject.mutateAsync({
        tenant_id: project.tenant_id,
        name: `${project.name} (cópia)`,
        status: project.status,
        client: project.client,
        client_company: project.client_company,
        client_id: project.client_id,
        owner_name: dupOptions.copyAssignees ? project.owner_name : null,
        owner_id: dupOptions.copyAssignees ? project.owner_id : null,
        priority: project.priority,
        due_date_start: dupOptions.copyDates ? project.due_date_start : null,
        due_date_end: dupOptions.copyDates ? project.due_date_end : null,
        bus: project.bus,
        services: project.services,
        notes: project.notes,
        notion_url: project.notion_url,
        value: project.value,
      } as never);

      const newId = (newProject as { id?: string })?.id;

      if (newId && (dupOptions.copySections || dupOptions.copyTasks)) {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        if (dupOptions.copySections) {
          const { data: origSections } = await supabase
            .from("os_sections")
            .select("*")
            .eq("project_id", project.id)
            .order("order_index", { ascending: true });

          const sectionMap = new Map<string, string>();

          for (const sec of origSections ?? []) {
            const { data: newSec } = await supabase
              .from("os_sections")
              .insert({
                project_id: newId,
                tenant_id: tenantId,
                title: sec.title,
                color: sec.color,
                order_index: sec.order_index,
              } as never)
              .select("id")
              .single();
            if (newSec) sectionMap.set(sec.id, newSec.id);
          }

          if (dupOptions.copyTasks) {
            const { data: origTasks } = await supabase
              .from("os_tasks")
              .select("*")
              .eq("project_id", project.id)
              .is("parent_id", null)
              .order("order_index", { ascending: true });

            for (const task of origTasks ?? []) {
              await supabase.from("os_tasks").insert({
                project_id: newId,
                tenant_id: tenantId,
                section_id: task.section_id ? (sectionMap.get(task.section_id) ?? null) : null,
                title: task.title,
                description: task.description,
                status: "pendente",
                priority: task.priority,
                order_index: task.order_index,
                assignee_id: dupOptions.copyAssignees ? task.assignee_id : null,
                assignee_name: dupOptions.copyAssignees ? task.assignee_name : null,
                start_date: dupOptions.copyDates ? task.start_date : null,
                due_date: dupOptions.copyDates ? task.due_date : null,
                is_completed: false,
              } as never);
            }
          }
        }
      }

      toast({ title: `Projeto duplicado — "${project.name} (cópia)"` });
    } catch {
      toast({ title: "Erro ao duplicar projeto", variant: "destructive" });
    } finally {
      setDuplicating(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Duplicar Projeto</DialogTitle>
          <DialogDescription>
            Selecione o que copiar para o novo projeto.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={dupOptions.copySections}
              onCheckedChange={(v) => setDupOptions((p) => ({ ...p, copySections: !!v }))}
            />
            <span className="text-sm">Copiar seções</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={dupOptions.copyTasks}
              disabled={!dupOptions.copySections}
              onCheckedChange={(v) => setDupOptions((p) => ({ ...p, copyTasks: !!v }))}
            />
            <span className="text-sm">Copiar tarefas</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={dupOptions.copyAssignees}
              onCheckedChange={(v) => setDupOptions((p) => ({ ...p, copyAssignees: !!v }))}
            />
            <span className="text-sm">Copiar responsáveis</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={dupOptions.copyDates}
              onCheckedChange={(v) => setDupOptions((p) => ({ ...p, copyDates: !!v }))}
            />
            <span className="text-sm">Copiar datas</span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDuplicateConfirm} disabled={duplicating}>
            {duplicating ? "Duplicando..." : "Duplicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
