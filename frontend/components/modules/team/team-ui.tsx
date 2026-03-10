import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RoleSlug } from "@/lib/permissions";

// ────────────────────────────────────────────────────
// Role display config
// ────────────────────────────────────────────────────

export const ROLE_CONFIG: Record<
  RoleSlug,
  { label: string; description: string; className: string }
> = {
  founder: {
    label: "Founder",
    description: "Acesso total — Owner + Admin",
    className: "bg-brand/15 text-brand border-brand/30",
  },
  diretoria: {
    label: "Diretoria",
    description: "Gerencia modulos e equipe",
    className:
      "bg-violet-500/15 text-violet-700 border-violet-500/30 dark:text-violet-400",
  },
  lider: {
    label: "Lider",
    description: "Lidera squad e execucao",
    className:
      "bg-sky-500/15 text-sky-700 border-sky-500/30 dark:text-sky-400",
  },
  colaborador: {
    label: "Colaborador",
    description: "Acesso padrao — execucao e visualizacao",
    className:
      "bg-gray-500/15 text-gray-600 border-gray-500/30 dark:text-gray-400",
  },
};

// ────────────────────────────────────────────────────
// Role Badge
// ────────────────────────────────────────────────────

type RoleBadgeProps = {
  role: RoleSlug;
  className?: string;
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role];
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

// ────────────────────────────────────────────────────
// Status Badge
// ────────────────────────────────────────────────────

type StatusBadgeProps = {
  isActive: boolean;
  className?: string;
};

export function StatusBadge({ isActive, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        isActive
          ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400"
          : "bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400",
        className
      )}
    >
      {isActive ? "Ativo" : "Inativo"}
    </Badge>
  );
}

// ────────────────────────────────────────────────────
// User Avatar
// ────────────────────────────────────────────────────

type UserAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function UserAvatar({
  name,
  avatarUrl,
  size = "md",
}: UserAvatarProps) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={cn("rounded-full object-cover", sizeClasses[size])}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground",
        sizeClasses[size]
      )}
    >
      {initials}
    </div>
  );
}
