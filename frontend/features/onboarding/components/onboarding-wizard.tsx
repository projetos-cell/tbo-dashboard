"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { StepWelcome } from "./steps/step-welcome";
import { StepProfile } from "./steps/step-profile";
import { StepPreferences } from "./steps/step-preferences";
import { StepTour } from "./steps/step-tour";
import { useCompleteOnboarding } from "../hooks/use-onboarding";
import type { ProfileStepValues, PreferencesStepValues } from "../schemas/onboarding-schemas";

const TOTAL_STEPS = 4;

interface OnboardingWizardProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingWizard({ open, onClose }: OnboardingWizardProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const [step, setStep] = useState(1);
  const [prefilled, setPrefilled] = useState(false);

  // Lifted state for profile
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Form values persisted across steps
  const [profileValues, setProfileValues] = useState<ProfileStepValues>({
    fullName: "",
    cargo: "",
    department: "",
    phone: "",
  });
  const [preferencesValues, setPreferencesValues] = useState<PreferencesStepValues>({
    theme: "system",
    notificationsEnabled: true,
  });

  const complete = useCompleteOnboarding();

  // Pre-fill from existing profile data (e.g. Google OAuth metadata)
  useEffect(() => {
    if (!open || !userId || prefilled) return;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("full_name, cargo, avatar_url, department, phone")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (data) {
          const row = data as Record<string, unknown>;
          setProfileValues((prev) => ({
            ...prev,
            fullName: (row.full_name as string) ?? prev.fullName,
            cargo: (row.cargo as string) ?? prev.cargo,
            department: (row.department as string) ?? prev.department,
            phone: (row.phone as string) ?? prev.phone,
          }));
          if (row.avatar_url) setAvatarPreview(row.avatar_url as string);
        }
        setPrefilled(true);
      });
  }, [open, userId, prefilled]);

  function handleAvatarChange(file: File, preview: string) {
    setAvatarFile(file);
    setAvatarPreview(preview);
  }

  function handleProfileSubmit(values: ProfileStepValues) {
    setProfileValues(values);
    setStep(3);
  }

  function handlePreferencesSubmit(values: PreferencesStepValues) {
    setPreferencesValues(values);
    setStep(4);
  }

  function handleFinish() {
    complete.mutate(
      {
        fullName: profileValues.fullName,
        cargo: profileValues.cargo,
        avatarFile,
        department: profileValues.department,
        phone: profileValues.phone,
        theme: preferencesValues.theme,
        notificationsEnabled: preferencesValues.notificationsEnabled,
      },
      {
        onSuccess: () => {
          onClose();
          toast.success("Perfil configurado! Vamos conhecer a plataforma.");
        },
        onError: (err) => {
          toast.error(`Erro ao salvar perfil: ${err.message}`);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg gap-0 p-0 overflow-hidden [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        <div className="p-6">
          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-6">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i + 1 <= step
                    ? "bg-primary w-4"
                    : "bg-muted w-1.5"
                }`}
              />
            ))}
            <span className="ml-auto text-xs text-muted-foreground">
              {step}/{TOTAL_STEPS}
            </span>
          </div>

          {step === 1 && <StepWelcome onNext={() => setStep(2)} />}

          {step === 2 && (
            <StepProfile
              defaultValues={profileValues}
              avatarPreview={avatarPreview}
              onAvatarChange={handleAvatarChange}
              onSubmit={handleProfileSubmit}
              onBack={() => setStep(1)}
              isLoading={false}
            />
          )}

          {step === 3 && (
            <StepPreferences
              defaultValues={preferencesValues}
              onSubmit={handlePreferencesSubmit}
              onBack={() => setStep(2)}
              isLoading={false}
            />
          )}

          {step === 4 && (
            <StepTour
              onFinish={handleFinish}
              onBack={() => setStep(3)}
              isLoading={complete.isPending}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
