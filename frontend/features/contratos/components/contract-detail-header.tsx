"use client";

import { Badge } from "@/components/ui/badge";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { Database } from "@/lib/supabase/types";
import {
  CONTRACT_STATUS,
  CONTRACT_CATEGORY,
  CONTRACT_TYPE,
  type ContractStatusKey,
  type ContractCategoryKey,
} from "@/lib/constants";

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];

interface ContractDetailHeaderProps {
  contract: ContractRow;
}

export function ContractDetailHeader({ contract }: ContractDetailHeaderProps) {
  const statusConfig =
    CONTRACT_STATUS[contract.status as ContractStatusKey] ?? {
      label: contract.status ?? "—",
      color: "#6b7280",
      bg: "rgba(107,114,128,0.12)",
    };

  const categoryConfig = contract.category
    ? CONTRACT_CATEGORY[contract.category as ContractCategoryKey]
    : undefined;

  const typeConfig = contract.type
    ? CONTRACT_TYPE[contract.type as keyof typeof CONTRACT_TYPE]
    : undefined;

  const daysRemaining = contract.end_date
    ? Math.ceil((new Date(contract.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpiring =
    contract.status === "active" &&
    daysRemaining !== null &&
    daysRemaining >= 0 &&
    daysRemaining <= 30;

  const isExpired =
    contract.status === "active" &&
    daysRemaining !== null &&
    daysRemaining < 0;

  return (
    <div className="px-6 pt-6 pb-4 border-b border-border/50">
      <SheetHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <SheetTitle className="text-left text-lg leading-tight flex-1">
            {contract.title}
          </SheetTitle>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge
            variant="secondary"
            className="text-xs px-2 py-0.5"
            style={{
              backgroundColor: statusConfig.bg,
              color: statusConfig.color,
            }}
          >
            {statusConfig.label}
          </Badge>
          {categoryConfig && (
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5"
              style={{
                backgroundColor: categoryConfig.bg,
                color: categoryConfig.color,
              }}
            >
              {categoryConfig.label}
            </Badge>
          )}
          {typeConfig && (
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              {typeConfig.label}
            </Badge>
          )}
          {isExpiring && daysRemaining !== null && (
            <Badge
              variant="secondary"
              className="gap-1 text-xs px-2 py-0.5 bg-amber-500/10 text-amber-600 border-amber-200"
            >
              <IconAlertTriangle className="h-3 w-3" />
              {daysRemaining}d restantes
            </Badge>
          )}
          {isExpired && (
            <Badge
              variant="destructive"
              className="gap-1 text-xs px-2 py-0.5"
            >
              <IconAlertTriangle className="h-3 w-3" />
              Vencido
            </Badge>
          )}
        </div>
      </SheetHeader>
    </div>
  );
}
