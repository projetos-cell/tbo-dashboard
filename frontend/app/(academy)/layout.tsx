import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AcademySidebar } from "@/components/layout/academy-sidebar"
import { Header } from "@/components/layout/header"
import { RoleLoader } from "@/features/auth/components/role-loader"
import { PreviewInitializer } from "@/features/diagnostico/components/preview-initializer"
import { createClient } from "@/lib/supabase/server"
import { canAccessModule, SUPER_ADMIN_EMAILS, type RoleSlug } from "@/lib/permissions"

export const dynamic = "force-dynamic"

export default async function AcademyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check for preview mode — allow guest access
  const cookieStore = await cookies()
  const referer = (await headers()).get("referer") ?? ""
  const isPreviewAccess = referer.includes("/diagnostico") || cookieStore.get("academy_preview")?.value === "true"

  if (!user && !isPreviewAccess) {
    redirect("/login")
  }

  // Fetch role from tenant_members (guest = colaborador with preview flag)
  let role: RoleSlug = "colaborador"
  let isGuest = false

  if (!user) {
    isGuest = true
  } else if (SUPER_ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) {
    role = "founder"
  } else {
    const { data: member } = await supabase
      .from("tenant_members")
      .select("roles ( slug )")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle()
    const slug = (member as Record<string, unknown>)?.roles as { slug: string } | null
    if (slug?.slug) {
      role = slug.slug as RoleSlug
    }
  }

  if (!isGuest && !canAccessModule(role, "academy")) {
    redirect("/dashboard")
  }

  const sidebarCookie = cookieStore.get("sidebar_state")
  const defaultOpen = sidebarCookie ? sidebarCookie.value === "true" : true

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      {!isGuest && <RoleLoader />}
      <PreviewInitializer />
      <AcademySidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
