"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  IconChevronUp,
  IconLogout,
  IconMoon,
  IconSettings,
  IconSun,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/hooks/use-logout";

const ROLE_LABELS: Record<string, string> = {
  founder: "Founder",
  diretoria: "Diretoria",
  lider: "Líder",
  colaborador: "Colaborador",
};

export function SidebarUserFooter() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const logout = useLogout();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    if (document.startViewTransition) {
      document.startViewTransition(() => setTheme(next));
    } else {
      setTheme(next);
    }
  }, [theme, setTheme]);

  if (!user) return null;

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const fullName = (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "Usuário";
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const roleLabel = role ? ROLE_LABELS[role] || role : "";
  const isDark = mounted && theme === "dark";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="group/user w-full gap-3 rounded-xl transition-colors duration-150 hover:bg-sidebar-accent/60 data-[state=open]:bg-sidebar-accent/60"
            >
              {/* Avatar with online indicator */}
              <div className="relative">
                <Avatar className="size-8 rounded-lg shadow-sm">
                  <AvatarImage src={avatarUrl} alt={fullName} />
                  <AvatarFallback className="rounded-lg bg-sidebar-accent text-[11px] font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
              </div>

              {/* Name + role */}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate leading-tight">
                  {fullName}
                </p>
                {roleLabel && (
                  <p className="text-[10px] text-muted-foreground/70 truncate leading-none mt-0.5">
                    {roleLabel}
                  </p>
                )}
              </div>

              <IconChevronUp className="size-4 text-muted-foreground/50 transition-transform duration-200 group-data-[state=open]/user:rotate-180" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="top"
            align="start"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl"
          >
            {/* User info header */}
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Avatar className="size-9 rounded-lg">
                <AvatarImage src={avatarUrl} alt={fullName} />
                <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/configuracoes" className="gap-2">
                <IconSettings className="size-4" />
                Configurações
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={toggleTheme} className="gap-2">
              {isDark ? (
                <IconSun className="size-4" />
              ) : (
                <IconMoon className="size-4" />
              )}
              {isDark ? "Modo claro" : "Modo escuro"}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={logout} className="gap-2 text-destructive focus:text-destructive">
              <IconLogout className="size-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
