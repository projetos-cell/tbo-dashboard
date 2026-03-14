"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { IconArrowLeft, IconArrowRight, IconSend } from "@tabler/icons-react";

// ── STEPS constant ───────────────────────────────────

export const INVITE_STEPS = [
  { id: "info", title: "Informacoes", description: "Nome e e-mail do novo membro" },
  { id: "role", title: "Permissoes", description: "Nivel de acesso no TBO OS" },
  { id: "confirm", title: "Confirmar", description: "Revise antes de enviar o convite" },
] as const;

// ── Step progress indicator ──────────────────────────

export function InviteStepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex gap-2 py-2">
      {INVITE_STEPS.map((s, i) => (
        <div
          key={s.id}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i <= currentStep ? "bg-brand" : "bg-muted"
          }`}
        />
      ))}
    </div>
  );
}

// ── Navigation footer ────────────────────────────────

export function InviteStepFooter({
  step,
  isPending,
  onBack,
  onNext,
  onSubmit,
}: {
  step: number;
  isPending: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  const isLast = step === INVITE_STEPS.length - 1;

  return (
    <DialogFooter className="gap-2 sm:gap-0">
      {step > 0 && (
        <Button type="button" variant="ghost" onClick={onBack}>
          <IconArrowLeft size={16} className="mr-1" />
          Voltar
        </Button>
      )}
      {!isLast ? (
        <Button type="button" onClick={onNext}>
          Proximo
          <IconArrowRight size={16} className="ml-1" />
        </Button>
      ) : (
        <Button type="button" disabled={isPending} onClick={onSubmit}>
          {isPending ? (
            "Enviando..."
          ) : (
            <>
              <IconSend size={16} className="mr-1" />
              Enviar convite
            </>
          )}
        </Button>
      )}
    </DialogFooter>
  );
}
