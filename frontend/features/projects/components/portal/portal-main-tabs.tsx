"use client";

import {
  IconFolder,
  IconChecklist,
  IconChartBar,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type PortalTabId = "files" | "tasks" | "reports";

interface PortalMainTabsProps {
  activeTab: PortalTabId;
  onTabChange: (tab: PortalTabId) => void;
}

const TABS: { key: PortalTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "files", label: "Arquivos", icon: IconFolder },
  { key: "tasks", label: "Tarefas & Progresso", icon: IconChecklist },
  { key: "reports", label: "Relatorios", icon: IconChartBar },
];

export function PortalMainTabs({ activeTab, onTabChange }: PortalMainTabsProps) {
  return (
    <div className="flex gap-3">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "flex flex-1 flex-col items-center gap-2 rounded-xl border-2 px-6 py-5 text-sm font-medium transition-all",
              isActive
                ? "border-orange-200 bg-orange-50/60 text-orange-700 shadow-sm"
                : "border-zinc-100 bg-white text-zinc-500 hover:border-zinc-200 hover:bg-zinc-50"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                isActive ? "bg-orange-100" : "bg-zinc-100"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-orange-600" : "text-zinc-400")} />
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
