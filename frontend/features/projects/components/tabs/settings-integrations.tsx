"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { IconLink, IconLoader2, IconDownload } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProject, useUpdateProject } from "@/features/projects/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SettingsIntegrationsProps {
  projectId: string;
}

export function SettingsIntegrations({ projectId }: SettingsIntegrationsProps) {
  const { data: project } = useProject(projectId);
  const updateProject = useUpdateProject();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [notionUrl, setNotionUrl] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [notionImporting, setNotionImporting] = useState(false);
  const [notionImportResult, setNotionImportResult] = useState<{
    tasks_created?: number;
    tasks_updated?: number;
    comments_imported?: number;
    errors?: string[];
    error?: string;
  } | null>(null);

  const projectNotionUrl = project?.notion_url ?? "";

  const handleSaveIntegrations = () => {
    const updates: Record<string, unknown> = {};
    if (notionUrl !== projectNotionUrl) updates.notion_url = notionUrl || null;
    if (Object.keys(updates).length > 0) {
      updateProject.mutate(
        { id: projectId, updates: updates as never },
        { onSuccess: () => toast({ title: "Integracoes salvas" }) },
      );
    }
  };

  const handleNotionImport = async () => {
    setNotionImporting(true);
    setNotionImportResult(null);

    try {
      const url = notionUrl || projectNotionUrl;
      const match = url?.match(/([a-f0-9]{32})/i);

      const rawName = project?.name ?? "";
      const notionProjectName = rawName.includes("_")
        ? rawName.split("_").slice(1).join("_")
        : rawName;

      let res: Response;
      let data: Record<string, unknown>;

      if (match) {
        const params = new URLSearchParams({
          mode: "project-import",
          project_id: projectId,
          database_id: match[1],
        });
        res = await fetch(`/api/notion/sync?${params}`);
        data = await res.json();

        if (!res.ok && typeof data.error === "string" && data.error.includes("Notion API")) {
          const fbParams = new URLSearchParams({
            mode: "demands-to-tasks",
            project_id: projectId,
            project_name: notionProjectName,
          });
          res = await fetch(`/api/notion/sync?${fbParams}`);
          data = await res.json();
        }
      } else {
        const params = new URLSearchParams({
          mode: "demands-to-tasks",
          project_id: projectId,
          project_name: notionProjectName,
        });
        res = await fetch(`/api/notion/sync?${params}`);
        data = await res.json();
      }

      if (!res.ok) {
        setNotionImportResult({ error: (data.error as string) ?? `HTTP ${res.status}` });
        toast({ title: "Erro na importacao", description: data.error as string, variant: "destructive" });
        return;
      }

      setNotionImportResult(data as typeof notionImportResult);
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-sections", projectId] });
      toast({
        title: "Importacao concluida",
        description: `${(data.tasks_created as number) ?? 0} tarefas criadas, ${(data.tasks_updated as number) ?? 0} atualizadas, ${(data.comments_imported as number) ?? 0} comentarios`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro de rede";
      setNotionImportResult({ error: msg });
      toast({ title: "Erro na importacao", description: msg, variant: "destructive" });
    } finally {
      setNotionImporting(false);
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <IconLink className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Integracoes</h3>
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
            Salvar integracoes
          </Button>

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
                  <span><strong>{notionImportResult.comments_imported}</strong> comentarios</span>
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
  );
}
