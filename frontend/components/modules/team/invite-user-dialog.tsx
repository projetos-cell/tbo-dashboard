"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { InviteUserSchema, type InviteUserInput } from "@/schemas/team";
import { useInviteTeamMember } from "@/hooks/use-team";
import { ROLE_HIERARCHY, type RoleSlug } from "@/lib/permissions";
import {
  INVITE_STEPS,
  InviteStepIndicator,
  InviteStepFooter,
} from "./invite-steps";
import {
  InviteStepInfo,
  InviteStepRole,
  InviteStepConfirm,
} from "./invite-step-content";

type InviteUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserRole: RoleSlug;
};

export function InviteUserDialog({
  open,
  onOpenChange,
  currentUserRole,
}: InviteUserDialogProps) {
  const [step, setStep] = useState(0);
  const invite = useInviteTeamMember();

  const form = useForm<InviteUserInput>({
    resolver: zodResolver(InviteUserSchema),
    defaultValues: { email: "", full_name: "", role: "colaborador", department: "" },
  });

  const assignableRoles = (
    ["founder", "diretoria", "lider", "colaborador"] as const
  ).filter((role) =>
    currentUserRole === "founder" ? true : ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[role],
  );

  function handleClose() {
    form.reset();
    setStep(0);
    onOpenChange(false);
  }

  async function handleNext() {
    if (step === 0) {
      const valid = await form.trigger(["full_name", "email"]);
      if (!valid) return;
    }
    if (step === 1) {
      const valid = await form.trigger(["role"]);
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, INVITE_STEPS.length - 1));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: InviteUserInput) {
    try {
      await invite.mutateAsync(data);
      handleClose();
    } catch {
      // Toast de erro tratado pelo mutation
    }
  }

  const values = form.watch();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Convidar membro</DialogTitle>
          <DialogDescription>
            Passo {step + 1} de {INVITE_STEPS.length} — {INVITE_STEPS[step].description}
          </DialogDescription>
        </DialogHeader>

        <InviteStepIndicator currentStep={step} />

        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {step === 0 && <InviteStepInfo control={form.control} />}
          {step === 1 && (
            <InviteStepRole control={form.control} assignableRoles={assignableRoles} />
          )}
          {step === 2 && <InviteStepConfirm values={values} />}

          <InviteStepFooter
            step={step}
            isPending={invite.isPending}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={form.handleSubmit(onSubmit)}
          />
        </Form>
      </DialogContent>
    </Dialog>
  );
}
