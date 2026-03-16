"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { StepWelcome } from "./steps/step-welcome";
import { StepProfile } from "./steps/step-profile";
import { StepTour } from "./steps/step-tour";
import { useCompleteOnboarding } from "../hooks/use-onboarding";

const TOTAL_STEPS = 3;

interface OnboardingWizardProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingWizard({ open, onClose }: OnboardingWizardProps) {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id);
  const [step, setStep] = useState(1);

  // Profile state lifted here so it persists across step navigation
  const [fullName, setFullName] = useState("");
  const [cargo, setCargo] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  const complete = useCompleteOnboarding();

  // Pre-fill from existing profile data
  useEffect(() => {
    if (!open || !userId || prefilled) return;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("full_name, cargo, avatar_url")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (data) {
          const row = data as Record<string, unknown>;
          if (row.full_name) setFullName(row.full_name as string);
          if (row.cargo) setCargo(row.cargo as string);
          if (row.avatar_url) setAvatarPreview(row.avatar_url as string);
        }
        setPrefilled(true);
      });
  }, [open, userId, prefilled]);

  function handleFinish() {
    complete.mutate(
      { fullName, cargo, avatarFile },
      {
        onSuccess: () => {
          onClose();
          toast.success("Perfil configurado! Agora vamos ao seu onboarding.");
          router.push("/onboarding");
        },
        onError: (err) => {
          toast.error(`Erro ao salvar perfil: ${err.message}`);
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
              isLoading={complete.isPending}
            />
          )}

          {step === 3 && (
            <StepTour
              onFinish={handleFinish}
              onBack={() => setStep(2)}
              isLoading={complete.isPending}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
