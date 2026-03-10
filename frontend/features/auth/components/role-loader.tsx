"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
import { fetchUserRole } from "@/features/auth/services/auth";

/**
 * Client component that loads the user's role from Supabase on mount
 * and stores it in the auth Zustand store.
 *
 * Renders nothing — purely a side-effect component.
 */
export function RoleLoader() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const tenantId = useAuthStore((s) => s.tenantId);
  const setRole = useAuthStore((s) => s.setRole);
  const setUser = useAuthStore((s) => s.setUser);
  const setTenantId = useAuthStore((s) => s.setTenantId);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    const supabase = createClient();

    // 1. Hydrate the user from Supabase session if not already set
    async function hydrate() {
      const {
        data: { user: sessionUser },
      } = await supabase.auth.getUser();

      if (sessionUser && !user) {
        setUser(sessionUser);
      }

      const activeUser = sessionUser ?? user;
      if (!activeUser) {
        setLoading(false);
        return;
      }

      // 2. Load role if not yet fetched
      if (!role) {
        const info = await fetchUserRole(
          supabase,
          activeUser.id,
          activeUser.email
        );
        setRole(info.roleSlug, info.roleLabel, info.modules);

        // 3. Reconcile tenantId: tenant_members is source of truth
        if (info.tenantId && info.tenantId !== tenantId) {
          setTenantId(info.tenantId);
        }
      }

      setLoading(false);
    }

    hydrate();
  }, [user, role, tenantId, setUser, setRole, setTenantId, setLoading]);

  return null;
}
