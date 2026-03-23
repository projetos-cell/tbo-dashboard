"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/stores/auth-store";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function DynamicGreeting() {
  const user = useAuthStore((s) => s.user);

  const name = useMemo(() => {
    if (!user) return "";
    const fullName = user.user_metadata?.full_name as string | undefined;
    if (fullName) return fullName.split(" ")[0];
    return user.email?.split("@")[0] ?? "";
  }, [user]);

  const greeting = getGreeting();

  return (
    <div className="space-y-2">
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
        {greeting}, {name}!
      </h1>
    </div>
  );
}
