"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IconLoader2 } from "@tabler/icons-react";
import {
  CreateReviewProjectSchema,
  type CreateReviewProjectInput,
} from "@/features/review/schemas/review-project.schema";
import {
  useCreateReviewProject,
  useUpdateReviewProject,
} from "@/features/review/hooks/use-review-projects";
import type { ReviewProject } from "@/features/review/types";

interface ReviewProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ReviewProject | null;
}

export function ReviewProjectForm({
  open,
  onOpenChange,
  project,
}: ReviewProjectFormProps) {
  const isEditing = !!project;
  const createMut = useCreateReviewProject();
  const updateMut = useUpdateReviewProject();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateReviewProjectInput>({
    resolver: zodResolver(CreateReviewProjectSchema),
    defaultValues: {
      name: project?.name ?? "",
      client_name: project?.client_name ?? "",
      description: project?.description ?? "",
      project_id: project?.project_id ?? null,
    },
  });

  const isPending = createMut.isPending || updateMut.isPending;

  function onSubmit(data: CreateReviewProjectInput) {
    if (isEditing && project) {
      updateMut.mutate(
        { id: project.id, updates: data },
        { onSuccess: () => { reset(); onOpenChange(false); } }
      );
    } else {
      createMut.mutate(data, {
        onSuccess: () => { reset(); onOpenChange(false); },
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Projeto" : "Novo Projeto de Review"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome do Projeto *</Label>
            <Input
              id="name"
              placeholder="Ex: Fachada Torre A — R01"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="client_name">Cliente</Label>
            <Input
              id="client_name"
              placeholder="Nome do cliente"
              {...register("client_name")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Breve descrição do projeto..."
              rows={3}
              {...register("description")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => { reset(); onOpenChange(false); }}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? "Salvar" : "Criar Projeto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
