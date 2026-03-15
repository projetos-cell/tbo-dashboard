"use client";

import { useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IconCamera } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  PROJECT_STATUS,
  BU_COLORS,
  type ProjectStatusKey,
} from "@/lib/constants";
import { parseBus } from "@/features/projects/utils/parse-bus";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectGalleryProps {
  projects: Project[];
}

/** Generates a gradient from the project name for a visual thumbnail. */
function nameToGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = Math.abs(hash % 360);
  const h2 = (h1 + 40 + Math.abs((hash >> 8) % 60)) % 360;
  return `linear-gradient(135deg, hsl(${h1}, 60%, 55%), hsl(${h2}, 50%, 45%))`;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function useProjectProgress(projectId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["project-task-stats", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("os_tasks")
        .select("id,is_completed")
        .eq("project_id", projectId)
        .is("parent_id", null);
      if (error) throw error;
      const total = data?.length ?? 0;
      const done = data?.filter((t) => t.is_completed).length ?? 0;
      return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
    },
    staleTime: 1000 * 60 * 5,
  });
}

function useUploadProjectCover() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ projectId, file }: { projectId: string; file: File }) => {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `project-covers/${projectId}.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(path);
      const coverUrl = urlData.publicUrl;

      // Update project record
      const { error: updateError } = await supabase
        .from("projects")
        .update({ cover_url: coverUrl } as never)
        .eq("id", projectId);

      if (updateError) throw updateError;

      return coverUrl;
    },
    onSuccess: () => {
      toast({ title: "Capa atualizada" });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar capa",
        description: "Tente novamente.",
        variant: "destructive",
      });
    },
  });
}

function GalleryCard({ project }: { project: Project }) {
  const router = useRouter();
  const statusConfig = PROJECT_STATUS[project.status as ProjectStatusKey];
  const bus = parseBus(project.bus);
  const { data: progress } = useProjectProgress(project.id);
  const uploadCover = useUploadProjectCover();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasCover = !!project.cover_url;

  const handleCoverClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      fileInputRef.current?.click();
    },
    [],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      // Validate: images only, max 5MB
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) return;
      uploadCover.mutate({ projectId: project.id, file });
      // Reset input so same file can be re-selected
      e.target.value = "";
    },
    [project.id, uploadCover],
  );

  return (
    <button
      type="button"
      onClick={() => router.push(`/projetos/${project.id}`)}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg hover:border-primary/30 text-left"
    >
      {/* Thumbnail — custom cover or gradient */}
      <div
        className="relative h-28 flex items-center justify-center overflow-hidden"
        style={hasCover ? undefined : { background: nameToGradient(project.name ?? "") }}
      >
        {hasCover ? (
          <img
            src={project.cover_url!}
            alt={`Capa de ${project.name}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="text-3xl font-bold text-white/90 select-none">
            {getInitials(project.name ?? "P")}
          </span>
        )}

        {/* Upload cover overlay — visible on hover */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100"
          onClick={handleCoverClick}
        >
          <div className="flex items-center gap-1.5 rounded-md bg-black/50 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            <IconCamera className="size-3.5" />
            {hasCover ? "Trocar capa" : "Adicionar capa"}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Upload loading indicator */}
        {uploadCover.isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}

        {/* Progress overlay */}
        {progress && progress.total > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className={cn(
                "h-full transition-all",
                progress.pct === 100 ? "bg-green-400" : "bg-white/70",
              )}
              style={{ width: `${progress.pct}%` }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          {statusConfig && (
            <Badge
              variant="secondary"
              className="shrink-0 text-[10px]"
              style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
            >
              {statusConfig.label}
            </Badge>
          )}
        </div>

        {/* Progress text */}
        {progress && progress.total > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  progress.pct === 100 ? "bg-green-500" : "bg-blue-400",
                )}
                style={{ width: `${progress.pct}%` }}
              />
            </div>
            <span className="text-[10px] tabular-nums text-muted-foreground shrink-0">
              {progress.pct}%
            </span>
          </div>
        )}

        {/* BU + Owner */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {bus.map((bu) => {
            const buColor = BU_COLORS[bu];
            return (
              <Badge
                key={bu}
                variant="secondary"
                className="text-[10px] px-1.5 py-0"
                style={buColor ? { backgroundColor: buColor.bg, color: buColor.color } : undefined}
              >
                {bu}
              </Badge>
            );
          })}
          {project.owner_name && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-semibold">
                  {getInitials(project.owner_name)}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {project.owner_name}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </button>
  );
}

export function ProjectGallery({ projects }: ProjectGalleryProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {projects.map((project) => (
        <GalleryCard key={project.id} project={project} />
      ))}
    </div>
  );
}
