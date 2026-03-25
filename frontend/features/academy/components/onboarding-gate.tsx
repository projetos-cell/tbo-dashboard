"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { OnboardingWizard } from "./onboarding-wizard"
import { useAcademyEntitlement } from "@/features/academy/hooks/use-academy-entitlement"

async function checkOnboardingStatus(): Promise<boolean> {
  const supabase = createClient()
  const { data: session } = await supabase.auth.getSession()
  if (!session.session) return true // Guest → skip wizard

  const metadata = session.session.user.user_metadata as Record<string, unknown>
  return metadata?.academy_onboarding_completed === true
}

export function OnboardingGate() {
  const [dismissed, setDismissed] = useState(false)
  const { entitlement, isLoading: entitlementLoading } = useAcademyEntitlement()

  const { data: completed, isLoading: statusLoading } = useQuery({
    queryKey: ["academy-onboarding"],
    queryFn: checkOnboardingStatus,
    staleTime: Infinity,
  })

  const isLoading = entitlementLoading || statusLoading

  // Only show wizard if: has active entitlement, hasn't completed onboarding, not dismissed
  const shouldShow =
    !isLoading && !completed && !dismissed && entitlement !== null

  if (!shouldShow) return null

  return <OnboardingWizard onComplete={() => setDismissed(true)} />
}
