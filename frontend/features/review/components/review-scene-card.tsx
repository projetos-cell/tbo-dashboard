"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconMessageCircle2, IconVersions } from "@tabler/icons-react";
import { SCENE_TYPE_CONFIG, VERSION_STATUS_CONFIG } from "@/features/review/constants";
import type { ReviewScene } from "@/features/review/types";

interface ReviewSceneCardProps {
  scene: ReviewScene;
  projectId: string;
}

export function ReviewSceneCard({ scene, projectId }: ReviewSceneCardProps) {
  const router = useRouter();
  const typeConfig = SCENE_TYPE_CONFIG[scene.scene_type];
  const latestVersion = scene.latest_version;
  const statusConfig = latestVersion
    ? VERSION_STATUS_CONFIG[latestVersion.status]
    : null;

  return (
    <Card
      className="cursor-pointer border-border/50 transition-all hover:shadow-md hover:border-border"
      onClick={() => router.push(`/review/${projectId}/${scene.id}`)}
    >
      {/* Thumbnail */}
      <div className="relative h-36 w-full overflow-hidden rounded-t-xl">
        {latestVersion?.thumbnail_url ?? latestVersion?.file_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={latestVersion.thumbnail_url ?? latestVersion.file_url}
            alt={scene.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-xs text-muted-foreground">Sem versão</span>
          </div>
        )}
        {statusConfig && (
          <div className="absolute top-2 right-2">
            <Badge
              className="text-xs"
              style={{
                backgroundColor: statusConfig.bg,
                color: statusConfig.color,
                border: `1px solid ${statusConfig.color}33`,
              }}
            >
              {statusConfig.label}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-medium leading-tight line-clamp-1 text-sm">{scene.name}</h4>
          <Badge variant="outline" className="shrink-0 text-xs">
            {typeConfig.label}
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <IconVersions className="h-3.5 w-3.5" />
            <span>{scene.versions_count ?? 0} versões</span>
          </div>
          <div className="flex items-center gap-1">
            <IconMessageCircle2 className="h-3.5 w-3.5" />
            <span>{scene.annotations_count ?? 0} comentários</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
