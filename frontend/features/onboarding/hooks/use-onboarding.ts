"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { uploadAvatar } from "@/features/configuracoes/services/settings";
import {
  getOnboardingStatus,
  skipOnboarding,
  completeOnboarding,
  getOnboardingChecklist,
  toggleChecklistTask,
  getQuizProgress,
  submitQuizDay,
  type ChecklistProgress,
  type QuizProgress,
  type QuizDayResult,
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
      department,
      phone,
      theme,
      notificationsEnabled,
    }: {
      fullName: string;
      cargo: string;
      avatarFile: File | null;
      department?: string;
      phone?: string;
      theme?: string;
      notificationsEnabled?: boolean;
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

      // Save extra profile fields
      const extraUpdates: Record<string, unknown> = {};
      if (department) extraUpdates.department = department;
      if (phone) extraUpdates.phone = phone;
      if (theme || notificationsEnabled !== undefined) {
        extraUpdates.preferences = {
          theme: theme ?? "system",
          notifications_enabled: notificationsEnabled ?? true,
        };
      }
      if (Object.keys(extraUpdates).length > 0) {
        await supabase
          .from("profiles")
          .update(extraUpdates as never)
          .eq("id", userId!);
      }
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

// ── Onboarding Checklist hooks ──────────────────────────────────────────────

export function useOnboardingChecklist() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["onboarding-checklist", userId],
    queryFn: () => getOnboardingChecklist(supabase, userId!),
    enabled: !!userId,
  });
}

// ── Quiz hooks ──────────────────────────────────────────────────────────────

export function useQuizProgress() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["onboarding-quiz", userId],
    queryFn: () => getQuizProgress(supabase, userId!),
    enabled: !!userId,
  });
}

export function useSubmitQuiz() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      dayKey,
      result,
      currentProgress,
    }: {
      dayKey: string;
      result: QuizDayResult;
      currentProgress: QuizProgress;
    }) => submitQuizDay(supabase, userId!, dayKey, result, currentProgress),
    onMutate: async ({ dayKey, result, currentProgress }) => {
      await qc.cancelQueries({ queryKey: ["onboarding-quiz", userId] });
      const previous = qc.getQueryData<QuizProgress>([
        "onboarding-quiz",
        userId,
      ]);
      qc.setQueryData(["onboarding-quiz", userId], {
        ...currentProgress,
        [dayKey]: result,
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["onboarding-quiz", userId], context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["onboarding-quiz", userId] });
    },
  });
}

export function useToggleChecklistTask() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      currentChecklist,
    }: {
      taskId: string;
      currentChecklist: ChecklistProgress;
    }) => toggleChecklistTask(supabase, userId!, taskId, currentChecklist),
    onMutate: async ({ taskId, currentChecklist }) => {
      await qc.cancelQueries({ queryKey: ["onboarding-checklist", userId] });
      const previous = qc.getQueryData<ChecklistProgress>([
        "onboarding-checklist",
        userId,
      ]);

      const optimistic = { ...currentChecklist };
      if (optimistic[taskId]?.completed) {
        delete optimistic[taskId];
      } else {
        optimistic[taskId] = {
          completed: true,
          completed_at: new Date().toISOString(),
        };
      }
      qc.setQueryData(["onboarding-checklist", userId], optimistic);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["onboarding-checklist", userId], context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["onboarding-checklist", userId] });
    },
  });
}
