"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  DollarSign,
  Building2,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import { CONTRACT_STATUS, type ContractStatusKey } from "@/lib/constants";

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];

interface ContractDetailDialogProps {
  contract: ContractRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (contract: ContractRow) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function ContractDetailDialog({
  contract,
  open,
  onOpenChange,
  onEdit,
}: ContractDetailDialogProps) {
  if (!contract) return null;

  const statusConfig =
    CONTRACT_STATUS[contract.status as ContractStatusKey] ?? {
      label: contract.status,
      color: "#6b7280",
      bg: "rgba(107,114,128,0.12)",
    };

  const isExpiring =
    contract.status === "ativo" &&
    contract.end_date &&
    (new Date(contract.end_date).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24) <=
      30;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-left">{contract.title}</SheetTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              style={{
                backgroundColor: statusConfig.bg,
                color: statusConfig.color,
              }}
            >
              {statusConfig.label}
            </Badge>
            {isExpiring && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Expirando
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Person */}
          <div className="space-y-2 text-sm">
            {contract.person_name && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{contract.person_name}</span>
              </div>
            )}
          </div>

          {/* Dates & Value */}
          <Separator />
          <div className="space-y-2 text-sm">
            {contract.monthly_value != null && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {formatCurrency(contract.monthly_value)}
                </span>
              </div>
            )}
            {contract.start_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Início:{" "}
                  {new Date(contract.start_date).toLocaleDateString("pt-BR")}
                </span>
              </div>
            )}
            {contract.end_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Término:{" "}
                  {new Date(contract.end_date).toLocaleDateString("pt-BR")}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {contract.description && (
            <>
              <Separator />
              <div className="space-y-1 text-sm">
                <h4 className="font-medium">Descrição</h4>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {contract.description}
                </p>
              </div>
            </>
          )}

          {/* File link */}
          {contract.file_url && (
            <>
              <Separator />
              <Button variant="outline" className="w-full gap-2" asChild>
                <a
                  href={contract.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver Arquivo do Contrato
                </a>
              </Button>
            </>
          )}

          {/* Actions */}
          {onEdit && (
            <>
              <Separator />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onEdit(contract)}
              >
                Editar Contrato
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
