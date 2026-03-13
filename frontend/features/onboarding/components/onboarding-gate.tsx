"use client";

import { useState, useEffect } from "react";
import { IconSparkles, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStatus } from "../hooks/use-onboarding";
import { OnboardingWizard } from "./onboarding-wizard";

/**
 * Renders nothing visible itself — purely orchestrates wizard visibility.
 *
 * Logic:
 * - wizardCompleted = true  → nothing
 * - !firstLoginCompleted    → open wizard immediately (first visit)
 * - firstLoginCompleted && !wizardCompleted → show "retomar" banner
 */
export function OnboardingGate() {
  const userId = useAuthStore((s) => s.user?.id);
  const isAuthLoading = useAuthStore((s) => s.isLoading);

  const { data: status, isLoading } = useOnboardingStatus();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Auto-open on first ever visit
  useEffect(() => {
    if (!isLoading && status && !status.firstLoginCompleted) {
      setWizardOpen(true);
    }
  }, [isLoading, status]);

  // Don't render until auth + profile are ready
  if (!userId || isAuthLoading || isLoading || !status) return null;

  // Wizard fully completed — nothing to show
  if (status.wizardCompleted) return null;

  const showBanner = status.firstLoginCompleted && !status.wizardCompleted && !bannerDismissed;

  return (
    <>
      {showBanner && (
        <div className="flex items-center gap-3 border-b bg-muted/50 px-4 py-2.5 text-sm">
          <IconSparkles className="h-4 w-4 shrink-0 text-primary" />
          <span className="flex-1 text-muted-foreground">
            Seu perfil está incompleto.
          </span>
          <Button
            variant="default"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setWizardOpen(true)}
          >
            Retomar configuração
          </Button>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fechar aviso"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
      )}

      <OnboardingWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />
    </>
  );
}
