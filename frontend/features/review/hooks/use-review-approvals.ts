"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import {
  getApprovalsByVersion,
  submitApproval,
} from "@/features/review/services/review-approvals";
import type { SubmitApprovalInput } from "@/features/review/schemas/review-approval.schema";

export function useReviewApprovals(versionId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["review-approvals", versionId],
    queryFn: () => getApprovalsByVersion(supabase, versionId!),
    enabled: !!versionId && !!tenantId,
    staleTime: 30 * 1000,
  });
}

export function useSubmitApproval(versionId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const tenantId = useAuthStore((s) => s.tenantId);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (input: SubmitApprovalInput) =>
      submitApproval(supabase, {
        ...input,
        version_id: versionId,
        tenant_id: tenantId!,
        user_id: user?.id ?? "",
        user_name: user?.user_metadata?.full_name ?? user?.email ?? "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-approvals", versionId] });
      toast({ title: "Aprovação registrada" });
    },
    onError: () => {
      toast({ title: "Erro ao registrar aprovação", variant: "destructive" });
    },
  });
}
