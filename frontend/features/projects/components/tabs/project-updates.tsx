"use client";

import { useState } from "react";
import {
  IconSend,
  IconTrash,
  IconCircleCheck,
  IconAlertTriangle,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PROJECT_HEALTH, type ProjectHealthKey } from "@/lib/constants";
import {
  useProjectStatusUpdates,
  useCreateProjectStatusUpdate,
  useDeleteProjectStatusUpdate,
} from "@/features/projects/hooks/use-project-status-updates";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";

interface ProjectUpdatesProps {
  projectId: string;
}

const HEALTH_OPTIONS: { key: ProjectHealthKey; icon: typeof IconCircleCheck }[] = [
  { key: "on_track", icon: IconCircleCheck },
  { key: "at_risk", icon: IconAlertTriangle },
  { key: "off_track", icon: IconAlertCircle },
];

export function ProjectUpdates({ projectId }: ProjectUpdatesProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();
  const { data: updates, isLoading } = useProjectStatusUpdates(projectId);
  const createUpdate = useCreateProjectStatusUpdate();
  const deleteUpdate = useDeleteProjectStatusUpdate(projectId);

  const [health, setHealth] = useState<ProjectHealthKey>("on_track");
  const [content, setContent] = useState("");
  const [composing, setComposing] = useState(false);

  const handlePublish = () => {
    if (!content.trim() || !tenantId || !user) return;
    createUpdate.mutate(
      {
        project_id: projectId,
        tenant_id: tenantId,
        author_id: user.id,
        author_name: user.user_metadata?.full_name ?? user.email ?? "Usuário",
        health,
        content: content.trim(),
      },
      {
        onSuccess: () => {
          setContent("");
          setComposing(false);
          toast({ title: "Status update publicado" });
        },
        onError: () => {
          toast({ title: "Erro ao publicar update", variant: "destructive" });
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    deleteUpdate.mutate(id, {
      onSuccess: () => toast({ title: "Update removido" }),
      onError: () => toast({ title: "Erro ao remover", variant: "destructive" }),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header + compose toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Status Updates</h2>
          <p className="text-sm text-muted-foreground">
            Atualizações de progresso e saúde do projeto.
          </p>
        </div>
        {!composing && (
          <Button size="sm" className="gap-1.5" onClick={() => setComposing(true)}>
            <IconSend className="size-3.5" />
            Publicar update
          </Button>
        )}
      </div>

      {/* Compose form */}
      {composing && (
        <div className="rounded-lg border border-border/60 bg-card p-4 space-y-4">
          {/* Health selector */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Status de saúde</span>
            <div className="flex gap-2">
              {HEALTH_OPTIONS.map(({ key, icon: Icon }) => {
                const cfg = PROJECT_HEALTH[key];
                const isActive = health === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setHealth(key)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all",
                      isActive
                        ? "border-current"
                        : "border-transparent opacity-50 hover:opacity-75",
                    )}
                    style={
                      isActive
                        ? { backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.color }
                        : { color: cfg.color }
                    }
                  >
                    <Icon className="size-3.5" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="O que mudou desde o último update? Compartilhe o progresso, bloqueios e próximos passos..."
            className="w-full min-h-[120px] rounded-md border border-border/60 bg-background px-3 py-2 text-sm outline-none resize-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setComposing(false); setContent(""); }}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={handlePublish}
              disabled={!content.trim() || createUpdate.isPending}
            >
              <IconSend className="size-3.5" />
              {createUpdate.isPending ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </div>
      )}

      {/* Updates feed */}
      {(!updates || updates.length === 0) && !composing && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted/60">
            <IconSend className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Nenhum status update publicado</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Publique o primeiro update para compartilhar o progresso do projeto.
          </p>
          <Button size="sm" className="mt-4 gap-1.5" onClick={() => setComposing(true)}>
            <IconSend className="size-3.5" />
            Publicar update
          </Button>
        </div>
      )}

      {updates && updates.length > 0 && (
        <div className="space-y-4">
          {updates.map((update) => {
            const healthCfg = PROJECT_HEALTH[update.health as ProjectHealthKey] ?? PROJECT_HEALTH.on_track;
            const HealthIcon = HEALTH_OPTIONS.find((h) => h.key === update.health)?.icon ?? IconCircleCheck;
            const initials = update.author_name
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <div
                key={update.id}
                className="group rounded-lg border border-border/50 bg-card p-4 space-y-3"
              >
                {/* Header: author + date + health badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarFallback className="text-[9px] bg-muted">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{update.author_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(update.created_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="gap-1 text-[10px]"
                      style={{ backgroundColor: healthCfg.bg, color: healthCfg.color }}
                    >
                      <HealthIcon className="size-3" />
                      {healthCfg.label}
                    </Badge>
                    {user?.id === update.author_id && (
                      <button
                        type="button"
                        onClick={() => handleDelete(update.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        disabled={deleteUpdate.isPending}
                      >
                        <IconTrash className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {update.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
