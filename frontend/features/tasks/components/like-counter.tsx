"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLike } from "@/features/tasks/hooks/use-like";
import type { LikeTarget, Like } from "@/schemas/like";
import { cn } from "@/lib/utils";

// ─── Profile name lookup ────────────────────────────────

function useProfileNames(userIds: string[]) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["profiles", "names", userIds],
    queryFn: async () => {
      if (userIds.length === 0) return {} as Record<string, string>;
      const { data, error } = await supabase
        .from("profiles" as never)
        .select("id, full_name")
        .in("id", userIds);
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const row of (data ?? []) as { id: string; full_name: string }[]) {
        map[row.id] = row.full_name ?? "Usuário";
      }
      return map;
    },
    enabled: userIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Tooltip content ────────────────────────────────────

function LikeNamesTooltip({ likes }: { likes: Like[] }) {
  const MAX = 10;
  const shown = likes.slice(0, MAX);
  const extra = likes.length - MAX;
  const userIds = shown.map((l) => l.user_id);
  const { data: names = {} } = useProfileNames(userIds);

  const lines = shown.map((l) => names[l.user_id] ?? "Usuário");

  return (
    <div className="text-xs space-y-0.5">
      {lines.map((name, i) => (
        <div key={i}>{name}</div>
      ))}
      {extra > 0 && (
        <div className="text-muted-foreground">+{extra} outros</div>
      )}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────

interface LikeCounterProps {
  targetType: LikeTarget;
  targetId: string;
  className?: string;
}

export function LikeCounter({
  targetType,
  targetId,
  className,
}: LikeCounterProps) {
  const { likes, count, isLiked } = useLike(targetType, targetId);

  if (count === 0) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "text-xs tabular-nums cursor-default",
            isLiked ? "text-red-500" : "text-muted-foreground",
            className
          )}
        >
          {count}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">
        <LikeNamesTooltip likes={likes} />
      </TooltipContent>
    </Tooltip>
  );
}
