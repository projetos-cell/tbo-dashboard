import { cookies } from "next/headers";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { RoleLoader } from "@/features/auth/components/role-loader";
import { OnboardingGate } from "@/features/onboarding/components/onboarding-gate";
import { ChatUnreadProvider } from "@/components/layout/chat-unread-provider";

export const dynamic = "force-dynamic";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sidebarCookie = cookieStore.get("sidebar_state");
  // Default to open when no cookie is set
  const defaultOpen = sidebarCookie ? sidebarCookie.value === "true" : true;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <RoleLoader />
      <ChatUnreadProvider />
      <AppSidebar />
      <SidebarInset>
        <Header />
        <OnboardingGate>
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">{children}</main>
        </OnboardingGate>
      </SidebarInset>
    </SidebarProvider>
  );
}
