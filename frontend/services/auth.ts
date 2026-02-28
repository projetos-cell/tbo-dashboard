import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type RoleSlug,
  DEFAULT_ROLE,
  isSuperAdmin,
  getModulesForRole,
} from "@/lib/permissions";

export interface UserRoleInfo {
  roleSlug: RoleSlug;
  roleLabel: string;
  modules: string[];
}

/**
 * Fetch the authenticated user's role from `tenant_members` → `roles`.
 *
 * Falls back to DEFAULT_ROLE ("member") when:
 * - The query fails (no Supabase creds, network error)
 * - The user has no tenant_members record
 *
 * Super-admin emails are always promoted to "admin" regardless of DB value.
 */
export async function fetchUserRole(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string,
  userEmail?: string | null
): Promise<UserRoleInfo> {
  // Super-admin override — hardcoded emails always get admin
  if (isSuperAdmin(userEmail)) {
    return {
      roleSlug: "admin",
      roleLabel: "Admin",
      modules: getModulesForRole("admin"),
    };
  }

  try {
    // Query tenant_members joined with roles to get the slug.
    // Uses `any` for the client generic because tenant_members/roles
    // are not yet in the generated Database types.
    const { data, error } = await supabase
      .from("tenant_members")
      .select("roles ( slug, label )")
      .eq("user_id", userId)
      .eq("is_active", true)
      .limit(1)
      .single();

    if (error || !data) {
      return buildDefault();
    }

    // Supabase returns the joined row as an object (single relation)
    const role = (data as Record<string, unknown>).roles as {
      slug: string;
      label: string;
    } | null;
    if (!role?.slug) {
      return buildDefault();
    }

    const slug = mapDbSlugToRole(role.slug);
    return {
      roleSlug: slug,
      roleLabel: role.label ?? slug,
      modules: getModulesForRole(slug),
    };
  } catch {
    return buildDefault();
  }
}

/**
 * Map any DB role slug to one of the 5 frontend roles.
 * The DB has 18 specific slugs (e.g. "3d-artist", "design", "video-editor")
 * but the frontend groups them into broader categories.
 */
function mapDbSlugToRole(dbSlug: string): RoleSlug {
  const mapping: Record<string, RoleSlug> = {
    // Direct matches
    admin: "admin",
    founder: "admin",
    po: "po",
    manager: "po",
    cs: "cs",
    "customer-success": "cs",
    guest: "freelancer",
    freelancer: "freelancer",
    // Specialist roles → member
    member: "member",
    design: "member",
    "3d-artist": "member",
    "video-editor": "member",
    copywriter: "member",
    developer: "member",
    "social-media": "member",
    "motion-designer": "member",
    photographer: "member",
    illustrator: "member",
  };

  return mapping[dbSlug] ?? DEFAULT_ROLE;
}

function buildDefault(): UserRoleInfo {
  return {
    roleSlug: DEFAULT_ROLE,
    roleLabel: "Membro",
    modules: getModulesForRole(DEFAULT_ROLE),
  };
}
