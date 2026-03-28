"use client";

import Image from "next/image";
import {
  IconHistory,
  IconPhoto,
  IconCheck,
  IconX,
  IconMessageCircle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { D3DStageRevision, RevisionStatus } from "@/features/projects/services/d3d-enhancements";

const REVISION_STATUS_CONFIG: Record<RevisionStatus, {
  label: string;
  color: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = {
  pending: { label: "Aguardando", color: "text-amber-600", Icon: IconHistory },
  approved: { label: "Aprovado", color: "text-green-600", Icon: IconCheck },
  changes_requested: { label: "Revisao Solicitada", color: "text-red-600", Icon: IconX },
};

interface D3DRevisionCardProps {
  revision: D3DStageRevision;
  compareMode?: boolean;
  isSelectedForCompare?: boolean;
  canManage?: boolean;
  onImageClick?: (url: string) => void;
  onSelectCompare?: (id: string) => void;
  onApprove?: (revision: D3DStageRevision) => void;
  onRequestChanges?: (revision: D3DStageRevision) => void;
}

export function D3DRevisionCard({
  revision,
  compareMode,
  isSelectedForCompare,
  canManage,
  onImageClick,
  onSelectCompare,
  onApprove,
  onRequestChanges,
}: D3DRevisionCardProps) {
  const conf = REVISION_STATUS_CONFIG[revision.status];
  const StatusIcon = conf.Icon;

  return (
    <div
      className={`rounded-xl border p-3 transition-colors ${
        isSelectedForCompare
          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
          : "border-border/50 bg-card hover:bg-accent/20"
      }`}
    >
      <div className="flex items-start gap-3">
        {revision.image_url ? (
          <button
            className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted"
            onClick={() => onImageClick?.(revision.image_url!)}
          >
            <Image
              src={revision.image_url}
              alt={`Rev ${revision.revision_number}`}
              fill
              className="object-cover"
              unoptimized
            />
          </button>
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted">
            <IconPhoto className="size-6 text-muted-foreground/40" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">Revisao #{revision.revision_number}</span>
            <Badge variant="outline" className={`text-[10px] ${conf.color} border-current/30`}>
              <StatusIcon className="mr-1 size-2.5" />
              {conf.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {format(new Date(revision.created_at), "dd/MM/yyyy")}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Por: {revision.submitted_by}
          </p>
          {revision.notes && (
            <p className="mt-1 text-sm text-muted-foreground">{revision.notes}</p>
          )}
          {revision.feedback && (
            <div className="mt-2 flex items-start gap-1.5 rounded-md border border-border/50 bg-muted/40 px-2 py-1.5">
              <IconMessageCircle className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{revision.feedback}</p>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-1.5">
          {compareMode && (
            <Button
              size="sm"
              variant={isSelectedForCompare ? "secondary" : "outline"}
              className="h-7 text-xs"
              onClick={() => onSelectCompare?.(revision.id)}
            >
              {isSelectedForCompare ? "Selecionado" : "Selecionar"}
            </Button>
          )}
          {canManage && !compareMode && revision.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 border-green-400/60 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30"
                onClick={() => onApprove?.(revision)}
              >
                <IconCheck className="size-3" />
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 border-red-400/60 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                onClick={() => onRequestChanges?.(revision)}
              >
                <IconX className="size-3" />
                Solicitar revisao
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
