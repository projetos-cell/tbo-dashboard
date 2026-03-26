"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconMessageCircle2 } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { WORKFLOW_STAGE_CONFIG } from "@/features/review/constants";
import type { ReviewProject } from "@/features/review/types";

interface ReviewProjectCardProps {
  project: ReviewProject;
}

export function ReviewProjectCard({ project }: ReviewProjectCardProps) {
  const router = useRouter();
  const stageConfig = WORKFLOW_STAGE_CONFIG[project.workflow_stage];
  const total = project.scenes_count ?? 0;
  const approved = project.approved_count ?? 0;
  const progress = total > 0 ? Math.round((approved / total) * 100) : 0;

  return (
    <Card
      className="cursor-pointer border-border/50 transition-all hover:shadow-md hover:border-border"
      onClick={() => router.push(`/review/${project.id}`)}
    >
      {/* Thumbnail */}
      <div className="relative h-40 w-full overflow-hidden rounded-t-xl">
        {project.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.thumbnail_url}
            alt={project.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(135deg, ${stageConfig.color}33, ${stageConfig.color}11)`,
            }}
          />
        )}
        <div className="absolute top-2 right-2">
          <Badge
            className="text-xs font-medium"
            style={{
              backgroundColor: stageConfig.bg,
              color: stageConfig.color,
              border: `1px solid ${stageConfig.color}33`,
            }}
          >
            {stageConfig.label}
          </Badge>
        </div>
      </div>

      <CardContent className="space-y-3 p-4">
        <div>
          <h3 className="font-semibold leading-tight line-clamp-1">{project.name}</h3>
          {project.client_name && (
            <p className="mt-0.5 text-xs text-muted-foreground">{project.client_name}</p>
          )}
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{approved}/{total} cenas aprovadas</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  backgroundColor: "#22c55e",
                }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <IconMessageCircle2 className="h-3.5 w-3.5" />
            <span>{project.pending_count ?? 0} pendências</span>
          </div>
          <span>
            {formatDistanceToNow(new Date(project.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
