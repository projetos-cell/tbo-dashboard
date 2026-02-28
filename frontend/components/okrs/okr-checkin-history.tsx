"use client";

import { ArrowRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCheckins } from "@/hooks/use-okrs";

interface OkrCheckinHistoryProps {
  keyResultId: string;
}

function confidenceLabel(value: string | null): {
  label: string;
  color: string;
} {
  const num = parseFloat(value ?? "0");
  if (num >= 0.8) return { label: "Alta", color: "#16a34a" };
  if (num >= 0.5) return { label: "Media", color: "#d97706" };
  if (num >= 0.3) return { label: "Baixa", color: "#dc2626" };
  return { label: "Muito baixa", color: "#dc2626" };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function OkrCheckinHistory({ keyResultId }: OkrCheckinHistoryProps) {
  const { data: checkins, isLoading } = useCheckins(keyResultId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!checkins || checkins.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Nenhum check-in registrado.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Historico de Check-ins</h4>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Data</TableHead>
            <TableHead className="text-xs">Valor</TableHead>
            <TableHead className="text-xs">Confianca</TableHead>
            <TableHead className="text-xs">Observacoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {checkins.map((ci) => {
            const conf = confidenceLabel(ci.confidence);
            return (
              <TableRow key={ci.id}>
                <TableCell className="text-xs whitespace-nowrap">
                  {formatDate(ci.created_at)}
                </TableCell>
                <TableCell className="text-xs">
                  <span className="inline-flex items-center gap-1">
                    {ci.previous_value ?? 0}
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    {ci.new_value}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: conf.color, color: conf.color }}
                  >
                    {conf.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                  {ci.notes || "-"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
