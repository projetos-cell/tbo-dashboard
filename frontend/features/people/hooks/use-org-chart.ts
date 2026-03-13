"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { getOrgChartData } from "@/features/people/services/org-chart";

export function useOrgChart() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["org-chart", tenantId],
    queryFn: () => getOrgChartData(supabase),
    staleTime: 1000 * 60 * 10,
    enabled: !!tenantId,
  });
}
