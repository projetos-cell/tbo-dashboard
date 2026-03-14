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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRsmPosts, useDeleteRsmPost } from "@/hooks/use-rsm";
import { EmptyState } from "@/components/shared";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/hooks/use-toast";

const POST_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  scheduled: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export function RsmTabPosts() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const { data: posts = [], isLoading } = useRsmPosts(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );
  const deleteMutation = useDeleteRsmPost();

  function handleNovoPost() {
    toast({ title: "Em breve", description: "Formulário de criação de post em desenvolvimento." });
  }

  function handleEditar() {
    toast({ title: "Em breve", description: "Edição de post em desenvolvimento." });
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
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="scheduled">Agendado</SelectItem>
            <SelectItem value="published">Publicado</SelectItem>
            <SelectItem value="failed">Falhou</SelectItem>
          </SelectContent>
        </Select>
        <Button className="ml-3 shrink-0" onClick={handleNovoPost}>
          <IconPlus className="mr-1.5 h-4 w-4" />
          Novo Post
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={IconChartBar}
          title="Nenhum post encontrado"
          description="Crie o primeiro post para publicar nas redes sociais."
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titulo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Publicado</TableHead>
                <TableHead>Agendado</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    {post.title ?? "(Sem titulo)"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{post.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        POST_STATUS_COLORS[post.status] ?? "bg-gray-100 text-gray-800"
                      }
                    >
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {post.published_date
                      ? format(new Date(post.published_date), "dd/MM/yyyy", { locale: ptBR })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {post.scheduled_date
                      ? format(new Date(post.scheduled_date), "dd/MM/yyyy", { locale: ptBR })
                      : "-"}
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
                          onClick={() => setPendingDelete(post.id)}
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
        title="Excluir post"
        description="Tem certeza que deseja excluir este post? Esta acao nao pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={() => {
          if (pendingDelete) deleteMutation.mutate(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
