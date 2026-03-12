"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { uploadAvatar } from "@/features/configuracoes/services/settings";
import {
  getOnboardingStatus,
  skipOnboarding,
  completeOnboarding,
} from "@/features/onboarding/services/onboarding";

export function useOnboardingStatus() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["onboarding-status", userId],
    queryFn: () => getOnboardingStatus(supabase, userId!),
    enabled: !!userId,
    staleTime: Infinity, // status only changes when user acts
  });
}

export function useSkipOnboarding() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => skipOnboarding(supabase, userId!),
    onSuccess: () => {
      qc.setQueryData(["onboarding-status", userId], {
        firstLoginCompleted: true,
        wizardCompleted: false,
      });
    },
  });
}

export function useCompleteOnboarding() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fullName,
      cargo,
      avatarFile,
    }: {
      fullName: string;
      cargo: string;
      avatarFile: File | null;
    }) => {
      let avatarUrl: string | undefined;
      if (avatarFile && userId) {
        avatarUrl = await uploadAvatar(supabase, userId, avatarFile);
      }
      await completeOnboarding(supabase, userId!, {
        full_name: fullName || undefined,
        cargo: cargo || undefined,
        avatar_url: avatarUrl,
      });
    },
    onSuccess: () => {
      qc.setQueryData(["onboarding-status", userId], {
        firstLoginCompleted: true,
        wizardCompleted: true,
      });
      qc.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });
}
