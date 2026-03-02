"use client";

import { useState } from "react";
import { z } from "zod";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  POLICY_CATEGORIES,
  type PolicyCategoryKey,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

const TiptapEditor = dynamic(
  () =>
    import("@/components/editor/tiptap-editor").then((m) => ({
      default: m.TiptapEditor,
    })),
  {
    ssr: false,
    loading: () => <div className="h-32 animate-pulse rounded-lg bg-muted" />,
  }
);

type PolicyRow = Database["public"]["Tables"]["policies"]["Row"];

const step1Schema = z.object({
  title: z.string().min(1, "Titulo e obrigatorio"),
  category: z.string().min(1, "Categoria e obrigatoria"),
  summary: z
    .string()
    .min(10, "Resumo deve ter pelo menos 10 caracteres")
    .max(320, "Resumo deve ter no maximo 320 caracteres"),
});

const step2Schema = z.object({
  content_md: z.string().optional(),
});

export interface PolicyFormData {
  title: string;
  category: string;
  summary: string;
  image_url: string;
  content_md: string;
  status: string;
  owner_user_id: string;
  effective_date: string;
  review_cycle_days: number | null;
  change_note: string;
}

interface PolicyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy?: PolicyRow | null;
  onSave: (data: PolicyFormData) => Promise<void>;
  canPublish?: boolean;
}

export function PolicyForm({
  open,
  onOpenChange,
  policy,
  onSave,
  canPublish = false,
}: PolicyFormProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1 fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("governanca");
  const [summary, setSummary] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Step 2 fields
  const [contentMd, setContentMd] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [reviewCycleDays, setReviewCycleDays] = useState<string>("");
  const [changeNote, setChangeNote] = useState("");

  const isEditing = !!policy;

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setStep(1);
      setTitle(policy?.title || "");
      setCategory(policy?.category || "governanca");
      setSummary(policy?.summary || "");
      setImageUrl(policy?.image_url || "");
      setContentMd(policy?.content_md || "");
      setEffectiveDate(policy?.effective_date || "");
      setReviewCycleDays(
        policy?.review_cycle_days ? String(policy.review_cycle_days) : ""
      );
      setChangeNote("");
      setErrors({});
    }
    onOpenChange(isOpen);
  };

  const validateStep1 = () => {
    const result = step1Schema.safeParse({
      title: title.trim(),
      category,
      summary: summary.trim(),
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSave = async (status: string) => {
    if (step === 1 && !validateStep1()) return;

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        category,
        summary: summary.trim(),
        image_url: imageUrl.trim(),
        content_md: contentMd,
        status,
        owner_user_id: "",
        effective_date: effectiveDate,
        review_cycle_days: reviewCycleDays ? parseInt(reviewCycleDays, 10) : null,
        change_note: changeNote.trim(),
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Politica" : "Nova Politica"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Passo 1 de 2 — Identidade da politica"
              : "Passo 2 de 2 — Conteudo e governanca"}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex gap-2 mb-2">
          <div
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              step >= 1 ? "bg-primary" : "bg-muted"
            )}
          />
          <div
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              step >= 2 ? "bg-primary" : "bg-muted"
            )}
          />
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label>Titulo *</Label>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors((p) => ({ ...p, title: "" }));
                }}
                placeholder="Ex.: Politica Antiassedio"
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label>Categoria *</Label>
              <div className="flex flex-wrap gap-1.5">
                {(
                  Object.entries(POLICY_CATEGORIES) as [
                    PolicyCategoryKey,
                    (typeof POLICY_CATEGORIES)[PolicyCategoryKey],
                  ][]
                ).map(([key, def]) => (
                  <Badge
                    key={key}
                    variant={category === key ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    style={
                      category === key
                        ? { backgroundColor: def.color, color: "#fff" }
                        : {}
                    }
                    onClick={() => setCategory(key)}
                  >
                    {def.label}
                  </Badge>
                ))}
              </div>
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category}</p>
              )}
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <Label>Imagem do card (URL)</Label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Opcional. Se vazio, sera usado um placeholder.
              </p>
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Resumo *</Label>
                <span
                  className={cn(
                    "text-xs",
                    summary.length > 320
                      ? "text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  {summary.length}/320
                </span>
              </div>
              <Textarea
                value={summary}
                onChange={(e) => {
                  setSummary(e.target.value);
                  setErrors((p) => ({ ...p, summary: "" }));
                }}
                placeholder="Resumo que aparecera no card (240-320 caracteres recomendados)"
                rows={3}
              />
              {errors.summary && (
                <p className="text-xs text-destructive">{errors.summary}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Content editor */}
            <div className="space-y-1.5">
              <Label>Conteudo da politica</Label>
              <TiptapEditor
                content={contentMd}
                onChange={setContentMd}
                placeholder="Escreva o conteudo completo da politica..."
                minHeight="min-h-[250px]"
              />
            </div>

            {/* Governance fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Data de vigencia</Label>
                <Input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Ciclo de revisao (dias)</Label>
                <Select
                  value={reviewCycleDays || "none"}
                  onValueChange={(val) =>
                    setReviewCycleDays(val === "none" ? "" : val)
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Sem ciclo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem ciclo</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                    <SelectItem value="180">180 dias</SelectItem>
                    <SelectItem value="365">365 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Change note (editing only) */}
            {isEditing && (
              <div className="space-y-1.5">
                <Label>Nota da revisao</Label>
                <Input
                  value={changeNote}
                  onChange={(e) => setChangeNote(e.target.value)}
                  placeholder="O que mudou nesta versao?"
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex gap-2 sm:gap-2">
          {step === 2 && (
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              disabled={saving}
            >
              Voltar
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          {step === 1 ? (
            <Button onClick={handleNext}>Proximo</Button>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => handleSave("draft")}
                disabled={saving}
              >
                Salvar rascunho
              </Button>
              {canPublish && (
                <Button
                  onClick={() => handleSave("active")}
                  disabled={saving}
                >
                  Publicar
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
