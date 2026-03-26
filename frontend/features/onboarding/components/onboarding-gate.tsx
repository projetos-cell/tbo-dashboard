"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { IconX, IconRocket } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
import { useOnboardingStatus } from "../hooks/use-onboarding";
import { OnboardingWizard } from "./onboarding-wizard";
import { ProductTour } from "./product-tour";

/**
 * Orchestrates the full onboarding experience:
 *
 * 1. !wizardCompleted → MANDATORY full-screen blocker with wizard
 * 2. Wizard completes → Launch Product Tour (React Joyride)
 * 3. Tour completes → Show checklist banner (dismissable)
 */
export function OnboardingGate({ children }: { children?: React.ReactNode }) {
  const userId = useAuthStore((s) => s.user?.id);
  const isAuthLoading = useAuthStore((s) => s.isLoading);

  const { data: status, isLoading } = useOnboardingStatus();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [tourChecked, setTourChecked] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Auto-open wizard when onboarding is not completed
  useEffect(() => {
    if (!isLoading && status && !status.wizardCompleted) {
      setWizardOpen(true);
    }
  }, [isLoading, status]);

  // Check if product tour was already completed
  useEffect(() => {
    if (!userId || !status?.wizardCompleted || tourChecked) return;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("module_tours_completed")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        const tours = (data?.module_tours_completed as Record<string, boolean>) ?? {};
        if (tours.onboarding_main) {
          setTourCompleted(true);
        }
        setTourChecked(true);
      });
  }, [userId, status?.wizardCompleted, tourChecked]);

  // When wizard closes (completed), start the product tour
  const handleWizardClose = useCallback(() => {
    setWizardOpen(false);
    // Small delay to let the app render before starting the tour
    setTimeout(() => setRunTour(true), 300);
  }, []);

  const handleTourComplete = useCallback(() => {
    setRunTour(false);
    setTourCompleted(true);
  }, []);

  // Don't render until auth + profile are ready
  if (!userId || isAuthLoading || isLoading || !status) {
    return <>{children}</>;
  }

  // Onboarding NOT completed → MANDATORY blocker
  if (!status.wizardCompleted) {
    return (
      <>
        {/* Full-screen blocker behind the wizard dialog */}
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm" />
        <OnboardingWizard open={wizardOpen} onClose={handleWizardClose} />
      </>
    );
  }

  // Wizard done, tour not yet completed → show tour
  const showTour = !tourCompleted && tourChecked;

  // Wizard + tour done → show checklist banner (dismissable)
  const showChecklistBanner = tourCompleted && !bannerDismissed;

  return (
    <>
      {showChecklistBanner && (
        <div className="flex items-center gap-3 border-b bg-primary/5 px-4 py-2.5 text-sm">
          <IconRocket className="h-4 w-4 shrink-0 text-primary" />
          <span className="flex-1 text-muted-foreground">
            Continue seu onboarding — complete o checklist de 5 dias.
          </span>
          <Button variant="default" size="sm" className="h-7 text-xs" asChild>
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
      )}
      {children}
      {showTour && (
        <ProductTour run={runTour} onComplete={handleTourComplete} />
      )}
    </>
  );
}
