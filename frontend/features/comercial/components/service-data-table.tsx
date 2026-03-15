"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BU_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/features/comercial/lib/format-currency";
import { IconDotsVertical, IconPencil, IconArchive, IconTrash } from "@tabler/icons-react";
import type { ServiceRow } from "@/features/comercial/services/services-catalog";

const SERVICE_TYPE_LABELS: Record<string, string> = {
  fee_mensal: "Fee Mensal",
  projeto: "Projeto",
  hora: "Hora",
  pacote: "Pacote",
};

const SERVICE_UNIT_LABELS: Record<string, string> = {
  unidade: "un",
  hora: "h",
  mes: "/mes",
  pacote: "pct",
  projeto: "proj",
};

const SERVICE_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Ativo", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  draft: { label: "Rascunho", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  archived: { label: "Arquivado", color: "#9ca3af", bg: "rgba(156,163,175,0.12)" },
};

interface ServiceDataTableProps {
  services: ServiceRow[];
  onEdit: (service: ServiceRow) => void;
  onArchive: (service: ServiceRow) => void;
  onDelete: (service: ServiceRow) => void;
}

export function ServiceDataTable({
  services,
  onEdit,
  onArchive,
  onDelete,
}: ServiceDataTableProps) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Servico</th>
            <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">BU</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Preco Base</th>
            <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground lg:table-cell">Margem</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground w-12" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {services.map((service) => {
            const statusCfg = SERVICE_STATUS_CONFIG[service.status];
            const buColor = service.bu ? BU_COLORS[service.bu] : null;

            return (
              <tr
                key={service.id}
                className="cursor-pointer transition-colors hover:bg-muted/30"
                onClick={() => onEdit(service)}
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{service.name}</div>
                  {service.description && (
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {service.description}
                    </div>
                  )}
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  {service.bu && buColor ? (
                    <Badge
                      variant="secondary"
                      style={{ backgroundColor: buColor.bg, color: buColor.color }}
                    >
                      {service.bu}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-muted-foreground">
                    {SERVICE_TYPE_LABELS[service.type] ?? service.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">
                  {formatCurrency(service.base_price)}
                  <span className="text-xs text-muted-foreground ml-0.5">
                    {SERVICE_UNIT_LABELS[service.unit] ?? ""}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-right lg:table-cell tabular-nums">
                  {service.margin_pct > 0 ? `${service.margin_pct}%` : "—"}
                </td>
                <td className="px-4 py-3">
                  {statusCfg && (
                    <Badge
                      variant="secondary"
                      style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
                    >
                      {statusCfg.label}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <IconDotsVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(service);
                        }}
                      >
                        <IconPencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchive(service);
                        }}
                      >
                        <IconArchive className="mr-2 h-4 w-4" />
                        {service.status === "archived" ? "Reativar" : "Arquivar"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(service);
                        }}
                      >
                        <IconTrash className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
        {services.length} {services.length === 1 ? "servico" : "servicos"}
      </div>
    </div>
  );
}
