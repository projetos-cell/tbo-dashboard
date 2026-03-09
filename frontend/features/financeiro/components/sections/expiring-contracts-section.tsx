"use client";

import type { FounderDashboardSnapshot } from "@/features/founder-dashboard/services/founder-dashboard";
import { fmt } from "@/features/financeiro/lib/formatters";

type ExpiringContract = FounderDashboardSnapshot["expiringContracts"][number];

interface Props {
  contracts: ExpiringContract[];
}

export function ExpiringContractsSection({ contracts }: Props) {
  if (contracts.length === 0) return null;

  return (
    <div>
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Contratos a Vencer (60 dias)
      </h2>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {contracts.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {c.title}
                </p>
                <p className="text-xs text-gray-500">{c.client}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-sm font-medium text-gray-900">
                  {fmt(c.monthlyValue)}/mês
                </p>
                <p
                  className={`text-xs font-medium ${
                    c.daysRemaining <= 15
                      ? "text-red-600"
                      : c.daysRemaining <= 30
                        ? "text-amber-600"
                        : "text-gray-500"
                  }`}
                >
                  {c.daysRemaining} dias restantes
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
