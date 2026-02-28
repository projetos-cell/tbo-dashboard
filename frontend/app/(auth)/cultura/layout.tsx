"use client";

import { CulturaSidebar } from "@/components/cultura/cultura-sidebar";

export default function CulturaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full -m-4 md:-m-6">
      <CulturaSidebar />
      <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
    </div>
  );
}
