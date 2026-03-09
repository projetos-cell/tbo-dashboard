"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  useFinanceDRE,
  useDreSettings,
} from "@/features/financeiro/hooks/use-finance";

const DreTable = dynamic(
  () =>
    import("@/features/financeiro/components/dre-table").then((m) => ({
      default: m.DreTable,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] animate-pulse rounded-xl bg-gray-100" />
    ),
  }
);

const DreSettingsModal = dynamic(
  () =>
    import("@/features/financeiro/components/dre-settings-modal").then(
      (m) => ({ default: m.DreSettingsModal })
    ),
  { ssr: false }
);

export function DreSection() {
  const [dreSettingsOpen, setDreSettingsOpen] = useState(false);
  const { data: dreData, isLoading: dreLoading } = useFinanceDRE(7);
  const { data: dreSettings } = useDreSettings();

  return (
    <div>
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        DRE Simplificado
      </h2>
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <DreTable
          data={dreData}
          isLoading={dreLoading}
          onConfigureClick={() => setDreSettingsOpen(true)}
        />
      </div>
      <DreSettingsModal
        open={dreSettingsOpen}
        onClose={() => setDreSettingsOpen(false)}
        currentTaxRate={dreSettings?.tax_rate ?? 15}
      />
    </div>
  );
}
