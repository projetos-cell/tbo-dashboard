"use client";

import { useState, Fragment } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  IconShield,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Database } from "@/lib/supabase/types";

type AuditLogRow = Database["public"]["Tables"]["audit_log"]["Row"];

const ACTION_COLORS: Record<string, { bg: string; color: string }> = {
  create: { bg: "#dcfce7", color: "#15803d" },
  insert: { bg: "#dcfce7", color: "#15803d" },
  update: { bg: "#dbeafe", color: "#1d4ed8" },
  delete: { bg: "#fee2e2", color: "#b91c1c" },
  remove: { bg: "#fee2e2", color: "#b91c1c" },
  status_change: { bg: "#fef9c3", color: "#a16207" },
  login: { bg: "#f3e8ff", color: "#7c3aed" },
  logout: { bg: "#f1f5f9", color: "#475569" },
};

interface AuditTableProps {
  logs: AuditLogRow[];
  isLoading: boolean;
}

export function AuditTable({ logs, isLoading }: AuditTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <EmptyState
        icon={IconShield}
        title="Nenhum registro encontrado"
        description="Ajuste os filtros ou aguarde novas ações no sistema."
      />
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30px]" />
            <TableHead>Data/Hora</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Ação</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Entidade</TableHead>
            <TableHead>Transição</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => {
            const isExpanded = expandedId === log.id;
            const actionStyle = ACTION_COLORS[log.action] ?? { bg: "#f1f5f9", color: "#475569" };

            return (
              <Fragment key={log.id}>
                <TableRow className="cursor-pointer" onClick={() => toggleExpand(log.id)}>
                  <TableCell>
                    {isExpanded ? (
                      <IconChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <IconChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">
                    {log.created_at
                      ? format(new Date(log.created_at), "dd MMM yyyy, HH:mm", { locale: ptBR })
                      : "—"}
                  </TableCell>
                  <TableCell className="font-medium">{log.user_name || "Sistema"}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      style={{ backgroundColor: actionStyle.bg, color: actionStyle.color }}
                    >
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">{log.entity_type}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{log.entity_name || log.entity_id}</TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {log.from_state || log.to_state ? (
                      <span>
                        {log.from_state && <Badge variant="secondary" className="mr-1 text-xs">{log.from_state}</Badge>}
                        {log.from_state && log.to_state && <span className="mx-1">→</span>}
                        {log.to_state && <Badge variant="secondary" className="text-xs">{log.to_state}</Badge>}
                      </span>
                    ) : "—"}
                  </TableCell>
                </TableRow>

                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={7} className="bg-gray-100/30 p-4">
                      <div className="space-y-3">
                        {log.reason && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Motivo</p>
                            <p className="text-sm">{log.reason}</p>
                          </div>
                        )}
                        {log.details && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Detalhes</p>
                            <pre className="text-xs bg-gray-100 rounded p-3 overflow-x-auto max-h-48">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.metadata && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Metadata</p>
                            <pre className="text-xs bg-gray-100 rounded p-3 overflow-x-auto max-h-48">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                        {!log.reason && !log.details && !log.metadata && (
                          <p className="text-sm text-gray-500">Nenhum detalhe adicional disponível.</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
