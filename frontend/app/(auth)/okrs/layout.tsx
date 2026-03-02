"use client";

import { ModuleSidebar } from "@/components/layout/module-sidebar";
import { OKRS_NAV_ITEMS } from "@/lib/constants";

export default function OKRsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full -m-4 md:-m-6">
      <ModuleSidebar
        title="OKRs"
        items={OKRS_NAV_ITEMS}
        basePath="/okrs"
      />
      <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
    </div>
  );
}
