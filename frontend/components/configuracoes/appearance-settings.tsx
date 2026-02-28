"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Sun, Moon, Monitor } from "lucide-react";

type ThemeMode = "light" | "dark" | "system";

const THEMES = [
  { id: "light" as const, label: "Claro", icon: Sun },
  { id: "dark" as const, label: "Escuro", icon: Moon },
  { id: "system" as const, label: "Sistema", icon: Monitor },
];

function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(mode: ThemeMode) {
  const resolved = mode === "system" ? getSystemPreference() : mode;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function AppearanceSettings() {
  const [theme, setThemeState] = useState<ThemeMode>("system");

  useEffect(() => {
    const stored = localStorage.getItem("tbo-theme") as ThemeMode | null;
    const mode = stored ?? "system";
    setThemeState(mode);
    applyTheme(mode);
  }, []);

  // Listen for system preference changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem("tbo-theme", mode);
    applyTheme(mode);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tema</CardTitle>
        <CardDescription>Escolha entre tema claro, escuro ou automático do sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <Label className="mb-3 block text-sm font-medium">Modo de exibição</Label>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((t) => {
            const Icon = t.icon;
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors",
                  active
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
