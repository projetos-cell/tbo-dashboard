"use client";

import { Badge } from "@/components/tbo-ui/badge";
import { Button } from "@/components/tbo-ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/tbo-ui/table";
import { getPdiStatusBadgeProps, formatDate } from "@/lib/pdi-utils";
import { Eye } from "lucide-react";
import type { PdiRow } from "@/services/pdi";

interface PdiTableProps {
  pdis: PdiRow[];
  profileMap: Map<string, string>;
  onSelect: (pdi: PdiRow) => void;
}

export function PdiTable({ pdis, profileMap, onSelect }: PdiTableProps) {
  if (pdis.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
        Nenhum PDI encontrado.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Colaborador</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Atualizado</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {pdis.map((pdi) => {
            const { label, style } = getPdiStatusBadgeProps(pdi.status);
            return (
              <TableRow
                key={pdi.id}
                className="cursor-pointer"
                onClick={() => onSelect(pdi)}
              >
                <TableCell className="font-medium">{pdi.title || "Sem título"}</TableCell>
                <TableCell className="text-gray-500">
                  {profileMap.get(pdi.person_id) ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs" style={style}>
                    {label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {pdi.last_updated_at ? formatDate(pdi.last_updated_at) : "—"}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
