"use client";

import { AcademyLayout } from "@/components/modules/academy/AcademyLayout";
import { AIChatHero } from "@/components/modules/academy/AIChatHero";
import { ContentBentoGrid } from "@/components/modules/academy/ContentBentoGrid";
import { FreeMaterialsSection } from "@/components/modules/academy/FreeMaterialsSection";
import { PDISection } from "@/components/modules/academy/PDISection";
import { RewardsSection } from "@/components/modules/academy/RewardsSection";
import { OKRProgressSection } from "@/components/modules/academy/OKRProgressSection";

export default function DashboardPage() {
  return (
    <AcademyLayout>
      {/* Hero — Greeting + AI Chat */}
      <AIChatHero />

      {/* Content Bento Grid — Podcast, Blog, YouTube, Social */}
      <ContentBentoGrid />

      {/* Materiais TBO */}
      <FreeMaterialsSection />

      {/* PDI + Rewards side by side on large screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PDISection />
        <RewardsSection />
      </div>

      {/* OKRs do usuário */}
      <OKRProgressSection />
    </AcademyLayout>
  );
}
