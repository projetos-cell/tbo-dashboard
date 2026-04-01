import { TabErrorBoundary } from "@/components/shared";

export default function RewardsLayout({ children }: { children: React.ReactNode }) {
  return (
    <TabErrorBoundary fallbackLabel="TBO Rewards">
      {children}
    </TabErrorBoundary>
  );
}
