"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Users,
  Calendar,
  DollarSign,
  Briefcase,
  Building2,
  FileText,
  Target,
  MessageSquare,
  Settings,
  LogOut,
  HeartHandshake,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { NAV_ITEMS } from "@/lib/constants";

const ICON_MAP: Record<string, React.ElementType> = {
  "folder-kanban": FolderKanban,
  "layout-dashboard": LayoutDashboard,
  "list-checks": ListChecks,
  users: Users,
  calendar: Calendar,
  "dollar-sign": DollarSign,
  briefcase: Briefcase,
  "building-2": Building2,
  "file-text": FileText,
  target: Target,
  "message-square": MessageSquare,
  settings: Settings,
  "heart-handshake": HeartHandshake,
};

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const modules = useAuthStore((s) => s.modules);

  const canSee = (module: string) =>
    modules.includes("*") || modules.includes(module);

  // Filter migrated routes by role
  const visibleNav = NAV_ITEMS.filter((item) => canSee(item.module));

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            T
          </div>
          <span className="font-semibold text-lg">TBO</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Migrated modules */}
        {visibleNav.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Módulos</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleNav.map((item) => {
                  const Icon = ICON_MAP[item.icon] ?? FolderKanban;
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.href}>
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
