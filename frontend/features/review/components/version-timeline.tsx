"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { VERSION_STATUS_CONFIG } from "@/features/review/constants";
import type { ReviewVersion } from "@/features/review/types";

interface VersionTimelineProps {
  versions: ReviewVersion[];
  selectedVersionId: string | null;
  onSelectVersion: (id: string) => void;
}

export function VersionTimeline({
  versions,
  selectedVersionId,
  onSelectVersion,
}: VersionTimelineProps) {
  if (versions.length === 0) return null;

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {versions.map((version, i) => {
        const isSelected = version.id === selectedVersionId;
        const isLast = i === versions.length - 1;
        const statusConfig = VERSION_STATUS_CONFIG[version.status];

        return (
          <div key={version.id} className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => onSelectVersion(version.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors hover:bg-muted",
                isSelected && "bg-primary/10 ring-1 ring-primary"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center size-7 rounded-full text-xs font-bold border-2 transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                {version.version_label.length <= 3 ? version.version_label : version.version_number}
              </div>
              <span className="text-[10px] font-medium">{version.version_label}</span>
              <Badge
                className="h-4 text-[9px] px-1 font-normal"
                style={{
                  backgroundColor: statusConfig.bg,
                  color: statusConfig.color,
                  border: `1px solid ${statusConfig.color}40`,
                }}
              >
                {statusConfig.label}
              </Badge>
            </button>

            {!isLast && (
              <div className="w-6 h-px bg-border mx-0.5 shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}
