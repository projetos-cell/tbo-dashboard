"use client";

import { useAuthStore } from "@/stores/auth-store";

/**
 * Returns the current tenant_id.
 * All Supabase queries should use this to enforce tenant isolation.
 */
export function useTenant() {
  const tenantId = useAuthStore((state) => state.tenantId);

  if (!tenantId) {
    throw new Error("Tenant ID not available. User may not be authenticated.");
  }

  return tenantId;
}

/**
 * Safe version that returns null instead of throwing.
 */
export function useTenantSafe() {
  return useAuthStore((state) => state.tenantId);
}
