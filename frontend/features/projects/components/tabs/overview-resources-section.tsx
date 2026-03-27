"use client";

import { useState } from "react";
import {
  IconLink,
  IconPlus,
  IconLoader,
  IconTrash,
  IconExternalLink,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/auth-store";
import {
  useProjectResources,
  useCreateProjectResource,
  useDeleteProjectResource,
} from "@/features/projects/hooks/use-project-resources";

interface OverviewResourcesSectionProps {
  projectId: string;
}

export function OverviewResourcesSection({ projectId }: OverviewResourcesSectionProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const { data: resources = [] } = useProjectResources(projectId);
  const createResource = useCreateProjectResource();
  const deleteResource = useDeleteProjectResource(projectId);

  const [addResourceOpen, setAddResourceOpen] = useState(false);
  const [newResourceLabel, setNewResourceLabel] = useState("");
  const [newResourceUrl, setNewResourceUrl] = useState("");
  const [newResourceType, setNewResourceType] = useState("link");

  function handleAddResource() {
    if (!newResourceLabel.trim() || !newResourceUrl.trim() || !tenantId) return;
    createResource.mutate(
      {
        project_id: projectId,
        tenant_id: tenantId,
        label: newResourceLabel.trim(),
        url: newResourceUrl.trim(),
        type: newResourceType,
        created_by: userId,
      },
      {
        onSuccess: () => {
          setAddResourceOpen(false);
          setNewResourceLabel("");
          setNewResourceUrl("");
          setNewResourceType("link");
        },
      },
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Recursos-Chave
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {resources.length > 0 ? (
            resources.map((resource) => (
              <div
                key={resource.id}
                className="group flex items-center gap-3 rounded-lg bg-muted/40 px-4 py-3 text-sm transition-colors hover:bg-muted/60"
              >
                <IconLink className="size-4 text-muted-foreground shrink-0" />
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-foreground hover:underline truncate"
                >
                  {resource.label}
                </a>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                >
                  <IconExternalLink className="size-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => deleteResource.mutate(resource.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                >
                  <IconTrash className="size-3.5" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic px-4 py-2">
              Nenhum recurso adicionado.
            </p>
          )}
          <button
            type="button"
            onClick={() => setAddResourceOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconPlus className="size-3.5" />
            Adicionar recurso
          </button>
        </CardContent>
      </Card>

      <Dialog open={addResourceOpen} onOpenChange={setAddResourceOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Recurso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nome</label>
              <Input
                placeholder="Ex: Brief do cliente"
                value={newResourceLabel}
                onChange={(e) => setNewResourceLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddResource(); }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">URL</label>
              <Input
                placeholder="https://..."
                value={newResourceUrl}
                onChange={(e) => setNewResourceUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddResource(); }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={newResourceType} onValueChange={setNewResourceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="drive">Google Drive</SelectItem>
                  <SelectItem value="contract">Contrato</SelectItem>
                  <SelectItem value="html">Documento HTML</SelectItem>
                  <SelectItem value="file">Arquivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddResourceOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddResource}
              disabled={!newResourceLabel.trim() || !newResourceUrl.trim() || createResource.isPending}
              className="gap-1.5"
            >
              {createResource.isPending ? (
                <IconLoader className="size-3.5 animate-spin" />
              ) : (
                <IconPlus className="size-3.5" />
              )}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
