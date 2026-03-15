"use client";

import {
  IconChevronDown,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PROJECT_STATUS, type ProjectStatusKey } from "@/lib/constants";

interface ProjectStatusBadgeProps {
  status: string;
  onChange: (status: string) => void;
  editable?: boolean;
}

export function ProjectStatusBadge({
  status,
  onChange,
  editable = true,
}: ProjectStatusBadgeProps) {
  const cfg = PROJECT_STATUS[status as ProjectStatusKey];

  const badge = (
    <Badge
      className="cursor-pointer select-none gap-1.5 rounded-full border-border/50 px-2.5 py-0.5 text-xs"
      variant="outline"
      style={
        cfg
          ? { backgroundColor: cfg.bg, color: cfg.color, borderColor: "transparent" }
          : undefined
      }
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: cfg?.color }}
      />
      {cfg?.label ?? status}
      {editable && <IconChevronDown className="size-3 opacity-50" />}
    </Badge>
  );

  if (!editable) return badge;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{badge}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        {Object.entries(PROJECT_STATUS).map(([key, c]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onChange(key)}
            className="gap-2"
          >
            <div
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: c.color }}
            />
            {c.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
