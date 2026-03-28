"use client";

import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  IconUser,
  IconEdit,
  IconTrash,
  IconPlus,
  IconLogin,
  IconEye,
  IconShield,
  IconArrowRight,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AuditLogWithUser } from "@/features/audit-log/services/audit-log";

const ACTION_CONFIG: Record<string, { icon: typeof IconEdit; color: string; label: string }> = {
  create: { icon: IconPlus, color: "text-green-600", label: "Criou" },
  insert: { icon: IconPlus, color: "text-green-600", label: "Criou" },
  update: { icon: IconEdit, color: "text-blue-600", label: "Editou" },
  delete: { icon: IconTrash, color: "text-red-600", label: "Excluiu" },
  login: { icon: IconLogin, color: "text-purple-600", label: "Login" },
  logout: { icon: IconLogin, color: "text-gray-500", label: "Logout" },
  view: { icon: IconEye, color: "text-gray-600", label: "Visualizou" },
  access: { icon: IconShield, color: "text-amber-600", label: "Acessou" },
};

function getActionConfig(action: string) {
  const lower = action.toLowerCase();
  for (const [key, config] of Object.entries(ACTION_CONFIG)) {
    if (lower.includes(key)) return config;
  }
  return { icon: IconArrowRight, color: "text-gray-500", label: action };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatEntityType(type: string | null): string {
  if (!type) return "";
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface AuditLogTimelineProps {
  entries: AuditLogWithUser[];
  isLoading: boolean;
}

export function AuditLogTimeline({ entries, isLoading }: AuditLogTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="size-9 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) return null;

  // Group by date
  const grouped = new Map<string, AuditLogWithUser[]>();
  for (const entry of entries) {
    const dateKey = entry.created_at
      ? format(new Date(entry.created_at), "yyyy-MM-dd")
      : "unknown";
    const existing = grouped.get(dateKey) ?? [];
    existing.push(entry);
    grouped.set(dateKey, existing);
  }

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {Array.from(grouped.entries()).map(([dateKey, items]) => (
          <div key={dateKey}>
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                {dateKey === "unknown"
                  ? "Data desconhecida"
                  : format(new Date(dateKey), "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </h3>
            </div>

            <div className="space-y-1">
              {items.map((entry) => {
                const config = getActionConfig(entry.action);
                const ActionIcon = config.icon;
                const userName = entry.profile?.full_name ?? "Sistema";
                const metadata = entry.metadata as Record<string, unknown> | null;
                const details = entry.details as Record<string, unknown> | null;

                return (
                  <div
                    key={entry.id}
                    className="group flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors"
                  >
                    {/* Avatar */}
                    <Avatar className="size-8 shrink-0 mt-0.5">
                      {entry.profile?.avatar_url && (
                        <AvatarImage src={entry.profile.avatar_url} alt={userName} />
                      )}
                      <AvatarFallback className="text-xs">
                        {userName === "Sistema" ? (
                          <IconShield className="size-4" />
                        ) : (
                          getInitials(userName)
                        )}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{userName}</span>
                        <ActionIcon className={`size-3.5 ${config.color}`} />
                        <span className="text-sm text-muted-foreground">
                          {config.label}
                        </span>
                        {entry.entity_type && (
                          <Badge variant="outline" className="text-[10px] font-normal">
                            {formatEntityType(entry.entity_type)}
                          </Badge>
                        )}
                      </div>

                      {/* Metadata preview */}
                      {(metadata || details) && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-md cursor-help">
                              {summarizeMetadata(metadata, details)}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" align="start" className="max-w-sm">
                            <pre className="text-xs whitespace-pre-wrap">
                              {JSON.stringify(metadata ?? details, null, 2)}
                            </pre>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>

                    {/* Timestamp */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 mt-1">
                          {entry.created_at
                            ? formatDistanceToNow(new Date(entry.created_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })
                            : "—"}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {entry.created_at
                          ? format(new Date(entry.created_at), "dd/MM/yyyy HH:mm:ss")
                          : "—"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}

function summarizeMetadata(
  metadata: Record<string, unknown> | null,
  details: Record<string, unknown> | null
): string {
  const source = metadata ?? details;
  if (!source) return "";

  // Try common patterns
  if (typeof source.description === "string") return source.description;
  if (typeof source.name === "string") return source.name;
  if (typeof source.title === "string") return source.title;
  if (typeof source.email === "string") return source.email;
  if (typeof source.path === "string") return source.path;
  if (typeof source.url === "string") return source.url;

  // Changes diff
  if (source.changes && typeof source.changes === "object") {
    const keys = Object.keys(source.changes);
    if (keys.length > 0) return `Campos alterados: ${keys.join(", ")}`;
  }

  // Fallback: first string value
  for (const val of Object.values(source)) {
    if (typeof val === "string" && val.length < 100) return val;
  }

  return `${Object.keys(source).length} campos`;
}
