"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { RequireRole } from "@/features/auth/components/require-role";
import { useAuthStore } from "@/stores/auth-store";
import { SettingsTabs } from "@/features/configuracoes/components/settings-tabs";
import { ProfileForm } from "@/features/configuracoes/components/profile-form";
import { AppearanceSettings } from "@/features/configuracoes/components/appearance-settings";
import { NotificationsSettings } from "@/features/configuracoes/components/notifications-settings";
import { WorkspaceSettings } from "@/features/configuracoes/components/workspace-settings";
import { NotionSync } from "@/features/configuracoes/components/notion-sync";
import { UserManagement } from "@/features/configuracoes/components/user-management";
import { AuditLogTable } from "@/features/configuracoes/components/audit-log-table";
import { FirefliesPanel } from "@/features/integrations/components/fireflies-panel";
import type { SettingsTabId } from "@/lib/constants";

const VALID_TABS: SettingsTabId[] = [
  "perfil",
  "aparencia",
  "notificacoes",
  "workspace",
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
  const isAdmin = role === "admin";

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
          {activeTab === "notificacoes" && <NotificationsSettings />}
          {activeTab === "workspace" && isAdmin && <WorkspaceSettings />}
          {activeTab === "integracoes" && isAdmin && (
            <div className="space-y-8">
              <NotionSync />
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
    <RequireRole minRole="colaborador">
      <SettingsContent />
    </RequireRole>
  );
}
