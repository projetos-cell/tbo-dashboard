"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, type ReactNode } from "react";
import { ThemeProvider } from "@/components/themes";
import { Toaster } from "sonner";
import { CommandPalette } from "@/components/shared/command-palette";
import { ProjectSearchDialog } from "@/features/projects/components/project-search-dialog";
import { useOverdueCheck } from "@/hooks/use-overdue-check";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const [searchOpen, setSearchOpen] = useState(false);

  // A03 — Check overdue tasks and reminders on session start
  useOverdueCheck();

  // Listen for custom event from command palette
  useEffect(() => {
    const handler = () => setSearchOpen(true);
    window.addEventListener("open-task-search", handler);
    return () => window.removeEventListener("open-task-search", handler);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CommandPalette>
          {children}
        </CommandPalette>
        <ProjectSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        <Toaster richColors position="bottom-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
