"use client";

import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconTrash,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { WebsiteProject } from "../types";

interface ProjectEditorHeaderProps {
  mode: "create" | "edit";
  project?: WebsiteProject;
  isSaving: boolean;
  onDelete: () => void;
}

export function ProjectEditorHeader({
  mode,
  project,
  isSaving,
  onDelete,
}: ProjectEditorHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur py-3 -mx-6 px-6 border-b">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => router.push("/website-admin/projetos")}
        >
          <IconArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">
            {mode === "create" ? "Novo Projeto" : project?.name ?? "Editar"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {mode === "create"
              ? "Preencha as informações do projeto"
              : `Última edição: ${new Date(project?.updated_at ?? "").toLocaleDateString("pt-BR")}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {mode === "edit" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
              >
                <IconTrash className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser desfeita. O projeto será removido
                  permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <Button type="submit" size="sm" disabled={isSaving}>
          <IconDeviceFloppy className="h-4 w-4 mr-1" />
          {isSaving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
}
