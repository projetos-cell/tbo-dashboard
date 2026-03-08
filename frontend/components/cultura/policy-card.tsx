"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  MoreHorizontal,
  Pencil,
  Eye,
  Archive,
  Copy,
  CalendarClock,
  Scale,
  Users,
  Briefcase,
  Landmark,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/tbo-ui/card";
import { Badge } from "@/components/tbo-ui/badge";
import { Button } from "@/components/tbo-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/tbo-ui/dropdown-menu";
import { POLICY_CATEGORIES, POLICY_STATUS } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type PolicyRow = Database["public"]["Tables"]["policies"]["Row"];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  etica: Scale,
  pessoas: Users,
  comercial: Briefcase,
  governanca: Landmark,
  compliance: ShieldCheck,
};

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' fill='none'%3E%3Crect width='80' height='80' rx='8' fill='%23f1f5f9'/%3E%3Cpath d='M28 52V28h24v24H28z' stroke='%2394a3b8' stroke-width='1.5'/%3E%3Cpath d='M34 40l4-4 4 4 6-6' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

interface PolicyCardProps {
  policy: PolicyRow;
  onView?: (policy: PolicyRow) => void;
  onEdit?: (policy: PolicyRow) => void;
  onArchive?: (policy: PolicyRow) => void;
  onDuplicate?: (policy: PolicyRow) => void;
  canEdit?: boolean;
}

export function PolicyCard({
  policy,
  onView,
  onEdit,
  onArchive,
  onDuplicate,
  canEdit = false,
}: PolicyCardProps) {
  const catDef =
    POLICY_CATEGORIES[policy.category as keyof typeof POLICY_CATEGORIES];
  const statusDef =
    POLICY_STATUS[policy.status as keyof typeof POLICY_STATUS];
  const Icon = CATEGORY_ICONS[policy.category] || FileText;

  const isOverdue =
    policy.next_review_at && new Date(policy.next_review_at) < new Date();

  return (
    <Card
      className="group hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView?.(policy)}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
            {policy.image_url ? (
              <img
                src={policy.image_url}
                alt={policy.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: catDef?.bg || "rgba(107,114,128,0.12)" }}
              >
                <Icon
                  className="size-6"
                  style={{ color: catDef?.color || "#6b7280" }}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-medium truncate">
                {policy.title}
              </h3>
            </div>

            {policy.summary && (
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                {policy.summary}
              </p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              {catDef && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0"
                  style={{ color: catDef.color, borderColor: catDef.color }}
                >
                  {catDef.label}
                </Badge>
              )}
              {statusDef && policy.status !== "active" && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0"
                  style={{ color: statusDef.color }}
                >
                  {statusDef.label}
                </Badge>
              )}
              {policy.version > 1 && (
                <span className="text-[10px] text-gray-500">
                  v{policy.version}
                </span>
              )}
              {policy.next_review_at && (
                <span
                  className={`text-[10px] flex items-center gap-0.5 ${
                    isOverdue ? "text-red-500" : "text-gray-500"
                  }`}
                >
                  <CalendarClock className="size-3" />
                  {format(new Date(policy.next_review_at), "dd/MM/yyyy")}
                </span>
              )}
            </div>
          </div>

          {/* Actions menu */}
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  aria-label="Acoes"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => onView?.(policy)}>
                  <Eye className="size-4 mr-2" />
                  Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(policy)}>
                  <Pencil className="size-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate?.(policy)}>
                  <Copy className="size-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {policy.status !== "archived" && (
                  <DropdownMenuItem
                    onClick={() => onArchive?.(policy)}
                    className="text-red-500"
                  >
                    <Archive className="size-4 mr-2" />
                    Arquivar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
