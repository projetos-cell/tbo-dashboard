"use client";

import { useState } from "react";
import {
  IconGlobe,
  IconSpeakerphone,
  IconLink,
  IconCheck,
  IconExternalLink,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectStatusUpdates } from "@/features/projects/hooks/use-project-status-updates";
import { useUpdateProject } from "@/features/projects/hooks/use-projects";
import { PROJECT_HEALTH, type ProjectHealthKey } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { PortalTrackProject } from "@/features/projects/components/portal/portal-track-project";

interface ProjectPortalProps {
  projectId: string;
  projectName?: string;
  dueDate?: string | null;
  bus?: string[] | null;
  portalToken?: string | null;
}

export function ProjectPortal({ projectId, projectName, dueDate, bus, portalToken }: ProjectPortalProps) {
  const { data: updates = [], isLoading: updatesLoading } = useProjectStatusUpdates(projectId);
  const updateProject = useUpdateProject();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const latestUpdate = updates[0];

  const portalUrl = portalToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/portal/projeto/${portalToken}`
    : null;

  function handleGenerateToken() {
    const token = crypto.randomUUID();
    updateProject.mutate(
      { id: projectId, updates: { portal_token: token } as never },
      {
        onSuccess: () => toast({ title: "Link do portal gerado" }),
        onError: () => toast({ title: "Erro ao gerar link", variant: "destructive" }),
      },
    );
  }

  function handleCopy() {
    if (!portalUrl) return;
    navigator.clipboard.writeText(portalUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-6">
      {/* Header + Share */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <IconGlobe className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Portal do Cliente</h2>
            <p className="text-sm text-muted-foreground">
              Visao do cliente sobre o progresso do projeto
              {projectName ? ` "${projectName}"` : ""}
            </p>
          </div>
        </div>

        {/* Share link */}
        <div className="flex items-center gap-2">
          {portalUrl ? (
            <>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={handleCopy}>
                {copied ? <IconCheck className="size-3.5 text-green-500" /> : <IconLink className="size-3.5" />}
                {copied ? "Copiado" : "Copiar link"}
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                  <IconExternalLink className="size-3.5" />
                </a>
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={handleGenerateToken}
              disabled={updateProject.isPending}
            >
              <IconGlobe className="size-3.5" />
              {updateProject.isPending ? "Gerando..." : "Gerar link publico"}
            </Button>
          )}
        </div>
      </div>

      {/* Track Project — stepper + stats + tasks + checklist + timeline */}
      <PortalTrackProject projectId={projectId} dueDate={dueDate ?? null} bus={bus} />

      {/* Latest status update */}
      {!updatesLoading && latestUpdate && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <IconSpeakerphone className="size-4" />
              Ultimo Update
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <Badge
                variant="outline"
                style={{
                  borderColor:
                    PROJECT_HEALTH[latestUpdate.health as ProjectHealthKey]?.color,
                  color:
                    PROJECT_HEALTH[latestUpdate.health as ProjectHealthKey]?.color,
                  backgroundColor:
                    PROJECT_HEALTH[latestUpdate.health as ProjectHealthKey]?.bg,
                }}
              >
                {PROJECT_HEALTH[latestUpdate.health as ProjectHealthKey]?.label}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="text-sm">{latestUpdate.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(latestUpdate.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
