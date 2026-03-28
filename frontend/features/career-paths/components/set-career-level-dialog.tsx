"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  useCareerPaths,
  useCareerPath,
  usePromotePersonCareer,
  useUpdatePersonCareerLevel,
  usePersonCareer,
} from "@/features/career-paths/hooks/use-career-paths";
import { TRACK_TYPE_META } from "@/features/career-paths/utils/career-constants";
import { hasMinRole } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";

// ── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  pathId: z.string().min(1, "Selecione o núcleo"),
  levelId: z.string().min(1, "Selecione o nível"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Props ────────────────────────────────────────────────────────────────────

interface SetCareerLevelDialogProps {
  profileId: string;
  personName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export function SetCareerLevelDialog({
  profileId,
  personName,
  open,
  onOpenChange,
}: SetCareerLevelDialogProps) {
  const role = useAuthStore((s) => s.role);
  const canPromote = hasMinRole(role, "lider");
  const canManage = hasMinRole(role, "diretoria");

  const { data: paths } = useCareerPaths();
  const { data: career } = usePersonCareer(profileId);
  const promoteMutation = usePromotePersonCareer();
  const updateMutation = useUpdatePersonCareerLevel();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { pathId: "", levelId: "", notes: "" },
  });

  const selectedPathId = form.watch("pathId");
  const { data: selectedPath } = useCareerPath(selectedPathId || null);

  // Pré-preenche com dados atuais da pessoa
  useEffect(() => {
    if (career && open) {
      form.reset({
        pathId: career.career_path_id ?? "",
        levelId: career.career_level_id ?? "",
        notes: "",
      });
    }
  }, [career, open, form]);

  // Reseta levelId quando muda o path
  const [prevPathId, setPrevPathId] = useState(selectedPathId);
  useEffect(() => {
    if (selectedPathId !== prevPathId) {
      form.setValue("levelId", "");
      setPrevPathId(selectedPathId);
    }
  }, [selectedPathId, prevPathId, form]);

  if (!canPromote) return null;

  async function onSubmit(values: FormValues) {
    try {
      const selectedLevelId = values.levelId;
      const fromLevelId = career?.career_level_id ?? null;
      const isPromotion =
        fromLevelId !== selectedLevelId && fromLevelId !== null;

      if (isPromotion && canPromote) {
        await promoteMutation.mutateAsync({
          profileId,
          fromLevelId,
          toLevelId: selectedLevelId,
          pathId: values.pathId,
          notes: values.notes || undefined,
        });
        toast.success("Promoção registrada com sucesso.");
      } else {
        // Primeira atribuição ou correção manual (diretoria+)
        if (!canManage) {
          toast.error("Sem permissão para esta ação.");
          return;
        }
        await updateMutation.mutateAsync({
          profileId,
          levelId: selectedLevelId,
          pathId: values.pathId,
        });
        toast.success("Nível de carreira atualizado.");
      }
      onOpenChange(false);
    } catch {
      toast.error("Erro ao atualizar. Tente novamente.");
    }
  }

  const isLoading = promoteMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Trilha de Carreira — {personName}
          </DialogTitle>
        </DialogHeader>

        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Núcleo */}
            <FormField
              control={form.control}
              name="pathId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Núcleo</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o núcleo..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(paths ?? []).map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.icon} {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nível — agrupado por trilha */}
            {selectedPath && (
              <FormField
                control={form.control}
                name="levelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível atual</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-72">
                        {selectedPath.career_tracks.map((track) => {
                          const meta =
                            TRACK_TYPE_META[
                              track.track_type as keyof typeof TRACK_TYPE_META
                            ];
                          return (
                            <SelectGroup key={track.id}>
                              <SelectLabel className="flex items-center gap-1.5 text-xs">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${meta?.dot ?? "bg-gray-400"}`}
                                />
                                {track.name}
                              </SelectLabel>
                              {track.career_levels.map((level) => (
                                <SelectItem key={level.id} value={level.id}>
                                  {level.name}
                                  {level.is_transition_point && " ↕"}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Notas (só para promoções) */}
            {career?.career_level_id && (
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Observações{" "}
                      <span className="text-muted-foreground font-normal">
                        (opcional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Motivo da promoção, contexto..."
                        rows={3}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {career?.career_level_id ? "Registrar promoção" : "Definir nível"}
              </Button>
            </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
