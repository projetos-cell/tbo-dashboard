import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import type { RoleSlug } from "@/lib/permissions";

interface AuthState {
  user: User | null;
  tenantId: string | null;
  isLoading: boolean;

  // RBAC fields
  role: RoleSlug | null;
  roleLabel: string | null;
  modules: string[];

  // Setters
  setUser: (user: User | null) => void;
  setTenantId: (tenantId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setRole: (role: RoleSlug, label: string, modules: string[]) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tenantId: null,
  isLoading: true,
  role: null,
  roleLabel: null,
  modules: [],

  setUser: (user) =>
    set({
      user,
      tenantId: user?.user_metadata?.tenant_id ?? null,
    }),
  setTenantId: (tenantId) => set({ tenantId }),
  setLoading: (isLoading) => set({ isLoading }),
  setRole: (role, roleLabel, modules) => set({ role, roleLabel, modules }),
  clear: () =>
    set({
      user: null,
      tenantId: null,
      isLoading: false,
      role: null,
      roleLabel: null,
      modules: [],
    }),
}));
