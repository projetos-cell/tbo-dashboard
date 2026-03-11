"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PDIAction {
  id: string;
  action: string;
  competency: string;
  deadline: string;
  status: "pending" | "in_progress" | "completed";
}

interface PDIActionTableProps {
  actions: PDIAction[];
  onComplete?: (actionId: string) => void;
}

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  pending: { label: "Pendente", class: "bg-yellow-500/10 text-yellow-600" },
  in_progress: { label: "Em andamento", class: "bg-blue-500/10 text-blue-500" },
  completed: { label: "Concluída", class: "bg-green-500/10 text-green-600" },
};

const DEFAULT_ACTIONS: PDIAction[] = [
  { id: "1", action: "Estudar tendências de branding imobiliário", competency: "Branding", deadline: "2026-04-01", status: "in_progress" },
  { id: "2", action: "Curso de renderização 3D arquitetônica", competency: "3D", deadline: "2026-05-15", status: "pending" },
  { id: "3", action: "Analisar cases de marketing de lançamento", competency: "Marketing", deadline: "2026-03-30", status: "pending" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function PDIActionTable({ actions, onComplete }: PDIActionTableProps) {
  const data = actions.length > 0 ? actions : DEFAULT_ACTIONS;

  return (
    <div className="rounded-2xl border border-border/30 bg-secondary/20 backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-border/30">
            <TableHead className="w-10" />
            <TableHead>Ação</TableHead>
            <TableHead className="hidden md:table-cell">Área</TableHead>
            <TableHead className="hidden sm:table-cell">Prazo</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            const status = STATUS_MAP[item.status];
            return (
              <TableRow key={item.id} className="border-border/20">
                <TableCell>
                  <Checkbox
                    checked={item.status === "completed"}
                    onCheckedChange={() => onComplete?.(item.id)}
                    aria-label={`Marcar "${item.action}" como concluída`}
                  />
                </TableCell>
                <TableCell className="font-medium">{item.action}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {item.competency && (
                    <Badge variant="outline">{item.competency}</Badge>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                  {formatDate(item.deadline)}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={status.class}>
                    {status.label}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
