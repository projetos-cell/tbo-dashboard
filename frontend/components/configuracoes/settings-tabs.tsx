"use client";

import { SETTINGS_TABS, type SettingsTabId } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { User, Palette, Users, Shield, Plug } from "lucide-react";

const ICONS: Record<string, React.ElementType> = {
  user: User,
  palette: Palette,
  plug: Plug,
  users: Users,
  shield: Shield,
};

interface SettingsTabsProps {
  active: SettingsTabId;
  onChange: (id: SettingsTabId) => void;
  isAdmin: boolean;
}

export function SettingsTabs({ active, onChange, isAdmin }: SettingsTabsProps) {
  const adminOnly = new Set(["usuarios", "audit", "integracoes"]);
  const tabs = SETTINGS_TABS.filter(
    (t) => !adminOnly.has(t.id) || isAdmin,
  );

  return (
    <nav className="flex flex-col gap-1">
      {tabs.map((tab) => {
        const Icon = ICONS[tab.icon] ?? User;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left",
              active === tab.id
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
