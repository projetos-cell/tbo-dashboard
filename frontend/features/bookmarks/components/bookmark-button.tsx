"use client";

import { IconBookmark, IconBookmarkFilled } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onToggle: (e: React.MouseEvent) => void;
  className?: string;
  size?: "xs" | "sm" | "md";
}

const SIZE_MAP = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
};

export function BookmarkButton({
  isBookmarked,
  onToggle,
  className,
  size = "sm",
}: BookmarkButtonProps) {
  const iconSize = SIZE_MAP[size];

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus-visible:opacity-100 shrink-0",
        isBookmarked && "opacity-100",
        className,
      )}
      title={isBookmarked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      aria-label={isBookmarked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      {isBookmarked ? (
        <IconBookmarkFilled className={cn(iconSize, "text-amber-500")} />
      ) : (
        <IconBookmark
          className={cn(iconSize, "text-muted-foreground hover:text-amber-500 transition-colors")}
        />
      )}
    </button>
  );
}
