"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconSparkles, IconX, IconRocket } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStatus } from "../hooks/use-onboarding";
import { OnboardingWizard } from "./onboarding-wizard";

/**
 * Orchestrates onboarding visibility:
 *
 * - wizardCompleted = true  → show onboarding checklist banner (if incomplete)
 * - !firstLoginCompleted    → open wizard immediately (first visit)
 * - firstLoginCompleted && !wizardCompleted → show "retomar wizard" banner
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

  // Everything done — nothing to show
  if (status.wizardCompleted && bannerDismissed) return null;

  // Wizard completed → show banner linking to /onboarding checklist
  if (status.wizardCompleted && !bannerDismissed) {
    return (
      <div className="flex items-center gap-3 border-b bg-primary/5 px-4 py-2.5 text-sm">
        <IconRocket className="h-4 w-4 shrink-0 text-primary" />
        <span className="flex-1 text-muted-foreground">
          Continue seu onboarding — complete o checklist de 5 dias.
        </span>
        <Button
          variant="default"
          size="sm"
          className="h-7 text-xs"
          asChild
        >
          <Link href="/onboarding">Ir para Onboarding</Link>
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
    );
  }

  // First login skipped → show retomar wizard banner
  const showWizardBanner = status.firstLoginCompleted && !status.wizardCompleted && !bannerDismissed;

  return (
    <>
      {showWizardBanner && (
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
