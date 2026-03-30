"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Global keyboard shortcuts for TBO OS.
 *
 * Hotkeys:
 *  /         → Focus search (Cmd+K)
 *  G then D  → Go to Dashboard
 *  G then P  → Go to Projetos
 *  G then T  → Go to Tarefas
 *  G then C  → Go to Chat
 *  G then F  → Go to Financeiro
 *  G then O  → Go to OKRs
 *  G then E  → Go to Pessoas
 *  G then S  → Go to Configuracoes
 */

const GO_MAP: Record<string, string> = {
  d: "/dashboard",
  p: "/projetos",
  t: "/tarefas",
  c: "/chat",
  f: "/financeiro",
  o: "/okrs",
  e: "/pessoas",
  s: "/configuracoes",
  m: "/marketing",
  r: "/relatorios",
  k: "/comercial",
};

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}

export function useGlobalHotkeys() {
  const router = useRouter();

  useEffect(() => {
    let waitingForGo = false;
    let goTimer: ReturnType<typeof setTimeout> | null = null;

    function onKeyDown(e: KeyboardEvent) {
      // Skip if inside input fields
      if (isInputFocused()) return;
      // Skip if modifier keys held (except for Cmd+K which is handled by CommandSearch)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();

      // "/" → Open search
      if (key === "/" && !waitingForGo) {
        e.preventDefault();
        document.dispatchEvent(
          new KeyboardEvent("keydown", { key: "k", metaKey: true }),
        );
        return;
      }

      // "G" → Start go-to sequence
      if (key === "g" && !waitingForGo) {
        waitingForGo = true;
        goTimer = setTimeout(() => {
          waitingForGo = false;
        }, 1000);
        return;
      }

      // Second key after "G"
      if (waitingForGo) {
        waitingForGo = false;
        if (goTimer) clearTimeout(goTimer);

        const href = GO_MAP[key];
        if (href) {
          e.preventDefault();
          router.push(href);
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (goTimer) clearTimeout(goTimer);
    };
  }, [router]);
}
