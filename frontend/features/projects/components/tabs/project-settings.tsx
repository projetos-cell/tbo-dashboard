"use client";

import { IconAdjustments, IconFlag, IconLayoutList } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyEditor } from "@/features/projects/components/property-editor";
import { useProject } from "@/features/projects/hooks/use-projects";
import { useProjectSections } from "@/features/projects/hooks/use-project-tasks";
import { SettingsSections } from "./settings-sections";
import { SettingsIntegrations } from "./settings-integrations";
import { SettingsIntakeForm } from "./settings-intake-form";
import { SettingsRulesEngine } from "./settings-rules-engine";
import { SettingsDangerZone } from "./settings-danger-zone";

interface ProjectSettingsProps {
  projectId: string;
}

export function ProjectSettings({ projectId }: ProjectSettingsProps) {
  const { isLoading: projectLoading } = useProject(projectId);
  const { isLoading: sectionsLoading } = useProjectSections(projectId);

  if (projectLoading || sectionsLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Configuracoes do Projeto</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie status, prioridades, secoes e integracoes.
        </p>
      </div>

      {/* 1. Status Editor */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <IconLayoutList className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Status das Tarefas</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Defina os status disponiveis para tarefas neste projeto.
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
          Configure os niveis de prioridade e suas cores.
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

      {/* 3. Sections */}
      <SettingsSections projectId={projectId} />

      {/* 4. Integrations */}
      <SettingsIntegrations projectId={projectId} />

      {/* 5. Intake Form */}
      <SettingsIntakeForm projectId={projectId} />

      {/* 6. Rules Engine */}
      <SettingsRulesEngine projectId={projectId} />

      {/* 7. Danger Zone */}
      <SettingsDangerZone projectId={projectId} />
    </div>
  );
}
