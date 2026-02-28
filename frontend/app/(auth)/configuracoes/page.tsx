"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { RequireRole } from "@/components/auth/require-role";
import { useAuthStore } from "@/stores/auth-store";
import { SettingsTabs } from "@/components/configuracoes/settings-tabs";
import { ProfileForm } from "@/components/configuracoes/profile-form";
import { AppearanceSettings } from "@/components/configuracoes/appearance-settings";
import { NotionSync } from "@/components/configuracoes/notion-sync";
import { UserManagement } from "@/components/configuracoes/user-management";
import { AuditLogTable } from "@/components/configuracoes/audit-log-table";
import { RdStationPanel } from "@/components/integrations/rd-station-panel";
import { FirefliesPanel } from "@/components/integrations/fireflies-panel";
import type { SettingsTabId } from "@/lib/constants";

const VALID_TABS: SettingsTabId[] = [
  "perfil",
  "aparencia",
  "integracoes",
  "usuarios",
  "audit",
];

function SettingsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as SettingsTabId | null;
  const initialTab =
    tabParam && VALID_TABS.includes(tabParam) ? tabParam : "perfil";
  const [activeTab, setActiveTab] = useState<SettingsTabId>(initialTab);
  const role = useAuthStore((s) => s.role);
  const isAdmin = role === "admin" || role === "founder" || role === "po";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-sm">
          Gerencie seu perfil, aparência e configurações do sistema
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-52 shrink-0">
          <SettingsTabs
            active={activeTab}
            onChange={setActiveTab}
            isAdmin={isAdmin}
          />
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "perfil" && <ProfileForm />}
          {activeTab === "aparencia" && <AppearanceSettings />}
          {activeTab === "integracoes" && isAdmin && (
            <div className="space-y-8">
              <NotionSync />
              <RdStationPanel />
              <FirefliesPanel />
            </div>
          )}
          {activeTab === "usuarios" && isAdmin && <UserManagement />}
          {activeTab === "audit" && isAdmin && <AuditLogTable />}
        </div>
      </div>
    </div>
  );
}

export default function ConfiguracoesPage() {
  return (
    <RequireRole allowed={["admin", "po", "member", "cs", "freelancer"]}>
      <SettingsContent />
    </RequireRole>
  );
}
