"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CommandSearch } from "@/components/layout/command-search";
import {
  ThemeToggle,
  NotificationBell,
  SearchButton,
  UserAvatar,
} from "@/components/layout/header-parts";

export function Header() {
  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/40 bg-background/80 px-4 backdrop-blur-sm">
        {/* Left — Sidebar trigger + Breadcrumbs */}
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 !h-4" />
        <Breadcrumbs />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right — Search, Theme, Notifications, Avatar */}
        <div className="flex items-center gap-5">
          <SearchButton />
          <ThemeToggle />
          <NotificationBell />
          <UserAvatar />
        </div>
      </header>
      <CommandSearch />
    </>
  );
}
