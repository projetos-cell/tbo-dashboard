"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PolicyFormIdentity } from "./policy-form-identity";
import { PolicyFormContent } from "./policy-form-content";
import type { Database } from "@/lib/supabase/types";

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
              step >= 1 ? "bg-tbo-orange" : "bg-gray-100"
            )}
          />
          <div
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              step >= 2 ? "bg-tbo-orange" : "bg-gray-100"
            )}
          />
        </div>

        {step === 1 ? (
          <PolicyFormIdentity
            title={title}
            onTitleChange={(v) => {
              setTitle(v);
              setErrors((p) => ({ ...p, title: "" }));
            }}
            category={category}
            onCategoryChange={setCategory}
            summary={summary}
            onSummaryChange={(v) => {
              setSummary(v);
              setErrors((p) => ({ ...p, summary: "" }));
            }}
            imageUrl={imageUrl}
            onImageUrlChange={setImageUrl}
            errors={errors}
          />
        ) : (
          <PolicyFormContent
            contentMd={contentMd}
            onContentMdChange={setContentMd}
            effectiveDate={effectiveDate}
            onEffectiveDateChange={setEffectiveDate}
            reviewCycleDays={reviewCycleDays}
            onReviewCycleDaysChange={setReviewCycleDays}
            changeNote={changeNote}
            onChangeNoteChange={setChangeNote}
            isEditing={isEditing}
          />
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
