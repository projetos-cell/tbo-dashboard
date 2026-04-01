import { Header } from "@/components/layout/header";
import { RoleLoader } from "@/features/auth/components/role-loader";
import { OnboardingGate } from "@/features/onboarding/components/onboarding-gate";
import { ChatUnreadProvider } from "@/components/layout/chat-unread-provider";
import { GlobalHotkeysProvider } from "@/components/layout/global-hotkeys-provider";

export const dynamic = "force-dynamic";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <RoleLoader />
      <ChatUnreadProvider />
      <GlobalHotkeysProvider />
      <Header />
      <OnboardingGate>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">{children}</main>
      </OnboardingGate>
    </div>
  );
}
