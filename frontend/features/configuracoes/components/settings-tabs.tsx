"use client";

import { SETTINGS_TABS, type SettingsTabId } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  IconUser,
  IconPalette,
  IconBell,
  IconBuilding,
  IconPlugConnected,
  IconUsers,
  IconShieldCheck,
} from "@tabler/icons-react";

const ICONS: Record<string, React.ElementType> = {
  user: IconUser,
  palette: IconPalette,
  bell: IconBell,
  building: IconBuilding,
  plug: IconPlugConnected,
  users: IconUsers,
  shield: IconShieldCheck,
};

const ADMIN_TABS = new Set(["workspace", "usuarios", "audit", "integracoes"]);
const FOUNDER_TABS = new Set(["workspace"]);

interface SettingsTabsProps {
  active: SettingsTabId;
  onChange: (id: SettingsTabId) => void;
  isAdmin: boolean;
  isFounder: boolean;
}

export function SettingsTabs({ active, onChange, isAdmin, isFounder }: SettingsTabsProps) {
  const visibleTabs = SETTINGS_TABS.filter((t) => {
    if (FOUNDER_TABS.has(t.id)) return isFounder;
    if (ADMIN_TABS.has(t.id)) return isAdmin;
    return true;
  });

  const pessoalTabs = visibleTabs.filter((t) => t.group === "pessoal");
  const adminTabs = visibleTabs.filter((t) => t.group === "admin");

  return (
    <nav className="flex flex-col gap-1">
      <TabGroup tabs={pessoalTabs} active={active} onChange={onChange} />

      {adminTabs.length > 0 && (
        <>
          <div className="mt-4 mb-1 px-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Administração
            </p>
          </div>
          <TabGroup tabs={adminTabs} active={active} onChange={onChange} />
        </>
      )}
    </nav>
  );
}

function TabGroup({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly { id: SettingsTabId; label: string; icon: string }[];
  active: SettingsTabId;
  onChange: (id: SettingsTabId) => void;
}) {
  return (
    <>
      {tabs.map((tab) => {
        const Icon = ICONS[tab.icon] ?? IconUser;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-all text-left w-full group",
              isActive
                ? "bg-orange-50 text-tbo-orange dark:bg-orange-950/20 dark:text-orange-400"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon
              size={16}
              className={cn(
                "shrink-0 transition-colors",
                isActive ? "text-tbo-orange dark:text-orange-400" : "group-hover:text-foreground",
              )}
            />
            <span className="truncate">{tab.label}</span>
            {isActive && (
              <div className="ml-auto w-1 h-4 rounded-full bg-tbo-orange dark:bg-orange-400" />
            )}
          </button>
        );
      })}
    </>
  );
}
