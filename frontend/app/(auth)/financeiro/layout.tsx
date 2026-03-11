"use client";

import { PrintButton } from "@/features/financeiro/components/print-button";

export default function FinanceiroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-0">
      <div className="flex justify-end mb-2 no-print">
        <PrintButton />
      </div>
      {children}
    </div>
  );
}
