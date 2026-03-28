"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconAlertTriangle, IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import type { Database } from "@/lib/supabase/types";

type SyncLogRow = Database["public"]["Tables"]["sync_logs"]["Row"];

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "--";
  return new Date(dateStr).toLocaleString("pt-BR");
}

interface ErrorTableProps {
  errors: SyncLogRow[];
  isLoading: boolean;
}

export function ErrorTable({ errors, isLoading }: ErrorTableProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <IconAlertTriangle className="h-4 w-4 text-gray-500" />
        Ultimos Erros
      </h2>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : errors.length === 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servico</TableHead>
                  <TableHead>Erro</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <IconCircleCheck className="mb-2 h-8 w-8 text-green-500/60" />
                      <p className="text-sm text-gray-500">
                        Nenhum erro registrado recentemente.
                      </p>
                      <p className="text-xs text-gray-500/70 mt-1">
                        Todos os servicos estao operando normalmente.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servico</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errors.map((err) => (
                  <TableRow key={err.id}>
                    <TableCell className="capitalize font-medium">
                      {err.provider}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {err.entity_type ?? "sync"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDateTime(err.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        <IconCircleX className="mr-1 h-3 w-3" />
                        Erro
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
