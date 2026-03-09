"use client";

import { useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/use-user";
import { useProfile } from "@/features/configuracoes/hooks/use-settings";
import { useAuthStore } from "@/stores/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, LogOut, Settings, User } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CommandSearch } from "@/components/layout/command-search";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const router = useRouter();
  const { user } = useUser();
  const { data: profile } = useProfile();
  const roleLabel = useAuthStore((s) => s.roleLabel);

  const displayName = profile?.full_name || user?.email || "Usuario";
  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : user?.email
      ? user.email.slice(0, 2).toUpperCase()
      : "TB";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 !h-4" />
        <Breadcrumbs />
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden gap-2 text-gray-500 sm:flex"
            onClick={() => {
              document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
            }}
          >
            <Search className="h-3.5 w-3.5" />
            <span className="text-xs">Buscar...</span>
            <kbd className="pointer-events-none ml-1 inline-flex h-5 items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-xs font-medium text-gray-500 select-none">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus-visible:ring-ring flex items-center gap-2 rounded-full outline-none focus-visible:ring-2">
                <span className="text-muted-foreground hidden text-sm md:inline">{displayName}</span>
                <Avatar className="h-8 w-8">
                  {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={displayName} />}
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm leading-none font-medium">{displayName}</p>
                  {user?.email && <p className="text-muted-foreground text-xs leading-none">{user.email}</p>}
                  {roleLabel && <p className="text-muted-foreground text-xs leading-none">{roleLabel}</p>}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push("/configuracoes")}>
                  <Settings className="h-4 w-4" />
                  <span>Configuracoes</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/configuracoes")}>
                  <User className="h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <CommandSearch />
    </>
  );
}
