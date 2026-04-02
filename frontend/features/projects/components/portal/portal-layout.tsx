"use client";

import { cn } from "@/lib/utils";

interface PortalLayoutProps {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  main: React.ReactNode;
  rightPanel?: React.ReactNode;
  sidebarCollapsed?: boolean;
}

export function PortalLayout({
  header,
  sidebar,
  main,
  rightPanel,
  sidebarCollapsed = false,
}: PortalLayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-zinc-50/50">
      {/* Header */}
      {header}

      {/* Body: sidebar + main + right panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden lg:block">
          {sidebar}
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-6 py-6 lg:px-8">
            {main}
          </div>
        </main>

        {/* Right panel (optional) */}
        {rightPanel && (
          <div className="hidden w-80 flex-shrink-0 border-l bg-white xl:flex xl:flex-col">
            {rightPanel}
          </div>
        )}
      </div>
    </div>
  );
}
