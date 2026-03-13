"use client";

import { IconHeart } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLike } from "@/features/tasks/hooks/use-like";
import type { LikeTarget } from "@/schemas/like";

interface LikeButtonProps {
  targetType: LikeTarget;
  targetId: string;
  /** Tamanho do botão. Default: "sm" */
  size?: "sm" | "xs";
  className?: string;
}

export function LikeButton({
  targetType,
  targetId,
  size = "sm",
  className,
}: LikeButtonProps) {
  const { isLiked, count, toggle, isPending } = useLike(targetType, targetId);

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          "shrink-0 transition-all",
          size === "xs" ? "h-6 w-6" : "h-7 w-7",
          isLiked && "text-red-500 hover:text-red-400"
        )}
        aria-label={isLiked ? "Descurtir" : "Curtir"}
        onClick={() => toggle()}
        disabled={isPending}
      >
        <IconHeart
          className={cn(
            "transition-all duration-150",
            size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5",
            isLiked
              ? "fill-current scale-110"
              : "fill-none scale-100 hover:scale-110"
          )}
          style={
            isLiked
              ? { animation: "like-pop 0.2s ease-out" }
              : undefined
          }
        />
      </Button>

      {count > 0 && (
        <span
          className={cn(
            "text-muted-foreground tabular-nums leading-none",
            size === "xs" ? "text-[10px]" : "text-xs",
            isLiked && "text-red-500"
          )}
        >
          {count}
        </span>
      )}

      <style>{`
        @keyframes like-pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.35); }
          100% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
