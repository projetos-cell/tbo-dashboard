"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteProject } from "@/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PROJECT_STATUS, type ProjectStatusKey } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  const deleteProject = useDeleteProject();
  const { toast } = useToast();

  function handleDelete(project: Project) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir "${project.name}"?`
    );
    if (!confirmed) return;
    deleteProject.mutate(project.id, {
      onSuccess: () => {
        toast({ title: "Excluído", description: `"${project.name}" foi removido.` });
      },
      onError: () => {
        toast({ title: "Erro", description: "Não foi possível excluir.", variant: "destructive" });
      },
    });
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="w-[130px]">Status</TableHead>
            <TableHead className="hidden md:table-cell">Construtora</TableHead>
            <TableHead className="hidden lg:table-cell">Responsavel</TableHead>
            <TableHead className="hidden lg:table-cell w-[110px]">
              Prazo
            </TableHead>
            <TableHead className="w-[40px]" />
            <TableHead className="w-[40px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Nenhum projeto encontrado.
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => {
              const status =
                PROJECT_STATUS[project.status as ProjectStatusKey];
              return (
                <TableRow key={project.id} className="cursor-pointer">
                  <TableCell>
                    <Link
                      href={`/projetos/${project.id}`}
                      className="font-medium hover:underline"
                    >
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {status && (
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        style={{
                          backgroundColor: status.bg,
                          color: status.color,
                        }}
                      >
                        {status.label}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {project.construtora || "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {project.owner_name || "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                    {project.due_date_end
                      ? format(new Date(project.due_date_end), "dd MMM yyyy", {
                          locale: ptBR,
                        })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {project.notion_url && (
                      <a
                        href={project.notion_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project);
                      }}
                      disabled={deleteProject.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
