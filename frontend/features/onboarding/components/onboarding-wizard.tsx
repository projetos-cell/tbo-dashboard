"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { StepWelcome } from "./steps/step-welcome";
import { StepProfile } from "./steps/step-profile";
import { StepTour } from "./steps/step-tour";
import { useSkipOnboarding, useCompleteOnboarding } from "../hooks/use-onboarding";

const TOTAL_STEPS = 3;

interface OnboardingWizardProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingWizard({ open, onClose }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);

  // Profile state lifted here so it persists across step navigation
  const [fullName, setFullName] = useState("");
  const [cargo, setCargo] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const skip = useSkipOnboarding();
  const complete = useCompleteOnboarding();

  const isLoading = skip.isPending || complete.isPending;

  function handleSkip() {
    skip.mutate(undefined, {
      onSuccess: () => {
        onClose();
        toast.info("Complete seu perfil depois em Configurações.");
      },
    });
  }

  function handleFinish() {
    complete.mutate(
      { fullName, cargo, avatarFile },
      {
        onSuccess: () => {
          onClose();
          toast.success("Perfil configurado. Bem-vindo ao TBO OS!");
        },
        onError: () => {
          toast.error("Erro ao salvar perfil. Tente novamente.");
        },
      },
    );
  }

  function handleAvatarChange(file: File, preview: string) {
    setAvatarFile(file);
    setAvatarPreview(preview);
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg gap-0 p-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        <div className="p-6">
          {/* Step indicator */}
          <div className="flex gap-1.5 mb-6">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i + 1 <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <StepWelcome
              onNext={() => setStep(2)}
              onSkip={handleSkip}
            />
          )}

          {step === 2 && (
            <StepProfile
              fullName={fullName}
              cargo={cargo}
              avatarFile={avatarFile}
              avatarPreview={avatarPreview}
              onFullNameChange={setFullName}
              onCargoChange={setCargo}
              onAvatarChange={handleAvatarChange}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
              onSkip={handleSkip}
              isLoading={isLoading}
            />
          )}

          {step === 3 && (
            <StepTour
              onFinish={handleFinish}
              onBack={() => setStep(2)}
              onSkip={handleSkip}
              isLoading={isLoading}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
