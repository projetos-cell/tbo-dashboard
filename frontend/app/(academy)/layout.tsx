import { cookies } from "next/headers"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AcademySidebar } from "@/components/layout/academy-sidebar"
import { Header } from "@/components/layout/header"
import { RoleLoader } from "@/features/auth/components/role-loader"

export const dynamic = "force-dynamic"

export default async function AcademyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const sidebarCookie = cookieStore.get("sidebar_state")
  const defaultOpen = sidebarCookie ? sidebarCookie.value === "true" : true

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <RoleLoader />
      <AcademySidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
