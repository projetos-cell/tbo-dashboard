import { RoleLoader } from "@/features/auth/components/role-loader";
import { OnboardingGate } from "@/features/onboarding/components/onboarding-gate";
import { HubHeader } from "./_components/hub-header";

export const dynamic = "force-dynamic";

export default function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <RoleLoader />
      <HubHeader />
      <OnboardingGate>
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-12">
          {children}
        </main>
      </OnboardingGate>
    </div>
  );
}
