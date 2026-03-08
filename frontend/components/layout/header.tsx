"use client";

import { SidebarTrigger } from "@/components/tbo-ui/sidebar";
import { Separator } from "@/components/tbo-ui/separator";
import { useUser } from "@/hooks/use-user";
import { Avatar, AvatarFallback } from "@/components/tbo-ui/avatar";
import { Button } from "@/components/tbo-ui/button";
import { Search } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CommandSearch } from "@/components/layout/command-search";

export function Header() {
  const { user } = useUser();

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "TB";

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
            className="hidden sm:flex gap-2 text-gray-500"
            onClick={() => {
              document.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true }),
              );
            }}
          >
            <Search className="h-3.5 w-3.5" />
            <span className="text-xs">Buscar...</span>
            <kbd className="pointer-events-none ml-1 inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-xs font-medium text-gray-500">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          <span className="text-sm text-gray-500 hidden md:inline">
            {user?.email}
          </span>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </div>
      </header>
      <CommandSearch />
    </>
  );
}
