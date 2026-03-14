"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconPlus,
  IconDots,
  IconPencil,
  IconTrash,
  IconChartBar,
} from "@tabler/icons-react";
import { useRsmIdeas, useDeleteRsmIdea } from "@/hooks/use-rsm";
import { EmptyState } from "@/components/shared";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/hooks/use-toast";

const IDEA_STATUS_COLORS: Record<string, string> = {
  nova: "bg-blue-100 text-blue-800",
  aprovada: "bg-green-100 text-green-800",
  rejeitada: "bg-red-100 text-red-800",
  em_producao: "bg-yellow-100 text-yellow-800",
  publicada: "bg-emerald-100 text-emerald-800",
};

export function RsmTabIdeias() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const { data: ideas = [], isLoading } = useRsmIdeas(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );
  const deleteMutation = useDeleteRsmIdea();

  function handleNovaIdeia() {
    toast({ title: "Em breve", description: "Formulário de criação de ideia em desenvolvimento." });
  }

  function handleEditar() {
    toast({ title: "Em breve", description: "Edição de ideia em desenvolvimento." });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="nova">Nova</SelectItem>
            <SelectItem value="aprovada">Aprovada</SelectItem>
            <SelectItem value="rejeitada">Rejeitada</SelectItem>
            <SelectItem value="em_producao">Em Producao</SelectItem>
            <SelectItem value="publicada">Publicada</SelectItem>
          </SelectContent>
        </Select>
        <Button className="ml-3 shrink-0" onClick={handleNovaIdeia}>
          <IconPlus className="mr-1.5 h-4 w-4" />
          Nova Ideia
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded" />
          ))}
        </div>
      ) : ideas.length === 0 ? (
        <EmptyState
          icon={IconChartBar}
          title="Nenhuma ideia encontrada"
          description="Registre ideias de conteúdo para transformar em posts."
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titulo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsavel</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {ideas.map((idea) => (
                <TableRow key={idea.id}>
                  <TableCell className="font-medium">{idea.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{idea.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        IDEA_STATUS_COLORS[idea.status] ?? "bg-gray-100 text-gray-800"
                      }
                    >
                      {idea.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {idea.assigned_to ?? "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <IconDots className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleEditar}>
                          <IconPencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => setPendingDelete(idea.id)}
                        >
                          <IconTrash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => { if (!open) setPendingDelete(null); }}
        title="Excluir ideia"
        description="Tem certeza que deseja excluir esta ideia? Esta acao nao pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={() => {
          if (pendingDelete) deleteMutation.mutate(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
