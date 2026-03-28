"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PromotionConfirmDialog } from "./promotion-confirm-dialog";
import { CareerTrackSelectItems } from "./career-track-select-items";
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
import { careerLevelSchema, type CareerLevelFormValues as FormValues } from "@/features/career-paths/utils/career-level-schema";
import { hasMinRole } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";

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

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(careerLevelSchema),
    defaultValues: { pathId: "", levelId: "", notes: "" },
  });

  const selectedPathId = form.watch("pathId");
  const { data: selectedPath } = useCareerPath(selectedPathId || null);

  // Pré-preenche com dados atuais da pessoa quando abre
  useEffect(() => {
    if (career && open) {
      form.reset({
        pathId: career.career_path_id ?? "",
        levelId: career.career_level_id ?? "",
        notes: "",
      });
    }
  }, [career, open, form]);

  if (!canPromote) return null;

  function handlePathChange(newPathId: string, onChange: (v: string) => void) {
    onChange(newPathId);
    form.setValue("levelId", "");
  }

  // Resolve o nome do nível selecionado para exibir na confirmação
  function getSelectedLevelName(levelId: string): string {
    if (!selectedPath) return levelId;
    for (const track of selectedPath.career_tracks) {
      const found = track.career_levels.find((l) => l.id === levelId);
      if (found) return found.name;
    }
    return levelId;
  }

  function getSelectedPathName(pathId: string): string {
    return paths?.find((p) => p.id === pathId)?.name ?? pathId;
  }

  function handleFormSubmit(values: FormValues) {
    const fromLevelId = career?.career_level_id ?? null;
    const isPromotion = fromLevelId !== values.levelId && fromLevelId !== null;

    // Promoção requer confirmação
    if (isPromotion) {
      setPendingValues(values);
      setConfirmOpen(true);
      return;
    }

    executeSubmit(values);
  }

  async function executeSubmit(values: FormValues) {
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
        if (!canManage && fromLevelId !== null) {
          toast.error("Sem permissão para esta ação.");
          return;
        }
        await updateMutation.mutateAsync({
          profileId,
          levelId: selectedLevelId,
          pathId: values.pathId,
          previousLevelId: career?.career_level_id ?? null,
          previousPathId: career?.career_path_id ?? null,
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Trilha de Carreira — {personName}
            </DialogTitle>
            <DialogDescription>
              Defina ou atualize o nível de carreira desta pessoa.
            </DialogDescription>
          </DialogHeader>

          <Form form={form} onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              {/* Núcleo */}
              <FormField
                control={form.control}
                name="pathId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Núcleo</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => handlePathChange(v, field.onChange)}
                    >
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
                          <CareerTrackSelectItems tracks={selectedPath.career_tracks} />
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

      <PromotionConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        personName={personName}
        fromLevelName={career?.level?.name}
        toLevelName={pendingValues ? getSelectedLevelName(pendingValues.levelId) : ""}
        pathName={pendingValues ? getSelectedPathName(pendingValues.pathId) : ""}
        onConfirm={() => {
          setConfirmOpen(false);
          if (pendingValues) executeSubmit(pendingValues);
          setPendingValues(null);
        }}
        onCancel={() => setPendingValues(null)}
      />
    </>
  );
}
