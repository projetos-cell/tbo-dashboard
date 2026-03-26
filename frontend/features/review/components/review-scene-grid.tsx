"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { IconLoader2, IconPlus } from "@tabler/icons-react";
import { ReviewSceneCard } from "./review-scene-card";
import { SCENE_TYPE_CONFIG } from "@/features/review/constants";
import {
  CreateReviewSceneSchema,
} from "@/features/review/schemas/review-scene.schema";
import type { CreateReviewSceneInput } from "@/features/review/schemas/review-scene.schema";
import { useCreateScene } from "@/features/review/hooks/use-review-scenes";
import type { ReviewScene } from "@/features/review/types";
import type { ReviewSceneType } from "@/features/review/types";

interface SceneFormValues {
  name: string;
  description?: string;
  scene_type: ReviewSceneType;
}

interface ReviewSceneGridProps {
  projectId: string;
  scenes: ReviewScene[];
}

export function ReviewSceneGrid({ projectId, scenes }: ReviewSceneGridProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const createMut = useCreateScene(projectId);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SceneFormValues>({
    defaultValues: { scene_type: "still" },
  });

  function onSubmit(data: SceneFormValues) {
    const validated = CreateReviewSceneSchema.parse(data) as CreateReviewSceneInput;
    createMut.mutate(validated, {
      onSuccess: () => {
        reset();
        setDialogOpen(false);
      },
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          Cenas{scenes.length > 0 && ` (${scenes.length})`}
        </h2>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <IconPlus className="mr-1.5 h-4 w-4" />
          Adicionar Cena
        </Button>
      </div>

      {scenes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma cena ainda</p>
          <Button
            variant="link"
            size="sm"
            className="mt-1"
            onClick={() => setDialogOpen(true)}
          >
            Adicionar primeira cena
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {scenes.map((scene) => (
            <ReviewSceneCard key={scene.id} scene={scene} projectId={projectId} />
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(v) => {
          if (!v) reset();
          setDialogOpen(v);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Cena</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="scene-name">Nome da Cena *</Label>
              <Input
                id="scene-name"
                placeholder="Ex: Fachada Principal, Living, Suíte Master..."
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="scene-type">Tipo</Label>
              <Select
                defaultValue="still"
                onValueChange={(val) =>
                  setValue("scene_type", val as CreateReviewSceneInput["scene_type"])
                }
              >
                <SelectTrigger id="scene-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SCENE_TYPE_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="scene-desc">Descrição</Label>
              <Textarea
                id="scene-desc"
                placeholder="Descrição opcional da cena..."
                rows={2}
                {...register("description")}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setDialogOpen(false);
                }}
                disabled={createMut.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createMut.isPending}>
                {createMut.isPending && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Adicionar Cena
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
