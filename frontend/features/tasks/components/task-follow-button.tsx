"use client";

import { useMemo } from "react";
import { IconBell, IconBellOff } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/auth-store";
import {
  useTaskFollowers,
  useFollowTask,
  useUnfollowTask,
} from "@/features/tasks/hooks/use-task-followers";

interface TaskFollowButtonProps {
  taskId: string;
  showCount?: boolean;
}

export function TaskFollowButton({ taskId, showCount }: TaskFollowButtonProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const { data: followers = [] } = useTaskFollowers(taskId);
  const follow = useFollowTask();
  const unfollow = useUnfollowTask();

  const isFollowing = useMemo(
    () => followers.some((f) => f.user_id === userId),
    [followers, userId],
  );

  const handleToggle = () => {
    if (isFollowing) {
      unfollow.mutate(taskId);
    } else {
      follow.mutate(taskId);
    }
  };

  const isPending = follow.isPending || unfollow.isPending;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isFollowing ? "secondary" : "outline"}
          size="sm"
          className="gap-1.5 text-xs"
          onClick={handleToggle}
          disabled={isPending}
        >
          {isFollowing ? (
            <IconBell className="size-3.5 text-primary" />
          ) : (
            <IconBellOff className="size-3.5" />
          )}
          {isFollowing ? "Seguindo" : "Seguir"}
          {showCount && followers.length > 0 && (
            <span className="ml-0.5 text-muted-foreground">
              ({followers.length})
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isFollowing
          ? "Deixar de seguir — parar de receber notificacoes"
          : "Seguir — receber notificacoes sobre mudancas"}
      </TooltipContent>
    </Tooltip>
  );
}
