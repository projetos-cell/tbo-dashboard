"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  IconBriefcase,
  IconListCheck,
  IconUser,
  IconCurrencyDollar,
  IconArrowRight,
  IconLayoutDashboard,
  IconTarget,
  IconMessage,
  IconCalendar,
  IconSettings,
  IconFileText,
  IconTruck,
  IconBuilding,
  IconHeartHandshake,
  IconSpeakerphone,
  IconChartBar,
  IconBookmark,
  IconWorld,
  IconUsers,
  IconShield,
  IconHistory,
} from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { PINNED_NAV_ITEMS, SIDEBAR_NAV_GROUPS } from "@/lib/navigation";

// ── Icon map for nav items ─────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  "layout-dashboard": IconLayoutDashboard,
  briefcase: IconBriefcase,
  "list-checks": IconListCheck,
  "message-square": IconMessage,
  "dollar-sign": IconCurrencyDollar,
  "building-2": IconBuilding,
  "file-text": IconFileText,
  truck: IconTruck,
  users: IconUsers,
  "heart-handshake": IconHeartHandshake,
  target: IconTarget,
  speakerphone: IconSpeakerphone,
  "bar-chart-3": IconChartBar,
  "book-marked": IconBookmark,
  copy: IconFileText,
  map: IconFileText,
  world: IconWorld,
  "users-cog": IconUsers,
  settings: IconSettings,
  shield: IconShield,
  history: IconHistory,
  calendar: IconCalendar,
  "clipboard-check": IconFileText,
};

// ── Dynamic search hook ────────────────────────────────
function useGlobalSearch(query: string) {
  const debouncedQuery = useDebouncedValue(query, 250);

  return useQuery({
    queryKey: ["global-search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return { projects: [], tasks: [], people: [], deals: [] };
      }

      const supabase = createClient();
      const term = `%${debouncedQuery}%`;

      const [projectsRes, tasksRes, peopleRes, dealsRes] = await Promise.all([
        supabase
          .from("projects")
          .select("id, name, status")
          .ilike("name", term)
          .limit(5),
        supabase
          .from("os_tasks")
          .select("id, title, status, project_id")
          .ilike("title", term)
          .limit(5),
        supabase
          .from("profiles")
          .select("id, full_name, role, avatar_url")
          .ilike("full_name", term)
          .limit(5),
        supabase
          .from("crm_deals")
          .select("id, name")
          .ilike("name", term)
          .limit(5),
      ]);

      return {
        projects: projectsRes.data ?? [],
        tasks: tasksRes.data ?? [],
        people: peopleRes.data ?? [],
        deals: dealsRes.data ?? [],
      };
    },
    enabled: !!debouncedQuery && debouncedQuery.length >= 2,
    staleTime: 30_000,
  });
}

function useDebouncedValue(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ── Main component ─────────────────────────────────────
export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const modules = useAuthStore((s) => s.modules);

  const canSee = useCallback(
    (module: string) => modules.includes("*") || modules.includes(module),
    [modules],
  );

  const { data: results } = useGlobalSearch(search);

  // Flatten all nav items from navigation.ts
  const allNavItems = useMemo(() => {
    const items = [...PINNED_NAV_ITEMS];
    for (const group of SIDEBAR_NAV_GROUPS) {
      for (const item of group.items) {
        items.push(item);
        if (item.subItems) {
          for (const sub of item.subItems) {
            items.push({
              href: sub.href,
              label: sub.label,
              icon: item.icon,
              module: item.module,
            });
          }
        }
      }
    }
    return items;
  }, []);

  const visibleNavItems = useMemo(
    () => allNavItems.filter((item) => canSee(item.module)),
    [allNavItems, canSee],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSelect(href: string) {
    setOpen(false);
    setSearch("");
    router.push(href);
  }

  const hasResults =
    results &&
    (results.projects.length > 0 ||
      results.tasks.length > 0 ||
      results.people.length > 0 ||
      results.deals.length > 0);

  return (
    <CommandDialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setSearch("");
      }}
      title="Busca Global"
      description="Busque por paginas, projetos, tarefas, pessoas ou deals"
    >
      <CommandInput
        placeholder="Buscar paginas, projetos, tarefas, pessoas..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        {/* Dynamic results — projects */}
        {results && results.projects.length > 0 && (
          <CommandGroup heading="Projetos">
            {results.projects.map((p) => (
              <CommandItem
                key={`project-${p.id}`}
                value={`projeto ${p.name}`}
                onSelect={() => handleSelect(`/projetos/${p.id}`)}
              >
                <IconBriefcase className="size-4 text-muted-foreground" />
                <span className="flex-1 truncate">{p.name}</span>
                <CommandShortcut>
                  <IconArrowRight className="size-3" />
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Dynamic results — tasks */}
        {results && results.tasks.length > 0 && (
          <CommandGroup heading="Tarefas">
            {results.tasks.map((t) => (
              <CommandItem
                key={`task-${t.id}`}
                value={`tarefa ${t.title}`}
                onSelect={() =>
                  handleSelect(
                    t.project_id
                      ? `/projetos/${t.project_id}?task=${t.id}`
                      : `/tarefas?task=${t.id}`,
                  )
                }
              >
                <IconListCheck className="size-4 text-muted-foreground" />
                <span className="flex-1 truncate">{t.title}</span>
                <CommandShortcut>
                  <IconArrowRight className="size-3" />
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Dynamic results — people */}
        {results && results.people.length > 0 && (
          <CommandGroup heading="Pessoas">
            {results.people.map((p) => (
              <CommandItem
                key={`person-${p.id}`}
                value={`pessoa ${p.full_name}`}
                onSelect={() =>
                  handleSelect(`/usuarios/${p.id}`)
                }
              >
                <IconUser className="size-4 text-muted-foreground" />
                <span className="flex-1 truncate">{p.full_name}</span>
                {p.role && (
                  <span className="text-xs text-muted-foreground">
                    {p.role}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Dynamic results — deals */}
        {results && results.deals.length > 0 && (
          <CommandGroup heading="Deals">
            {results.deals.map((d) => (
              <CommandItem
                key={`deal-${d.id}`}
                value={`deal ${d.name}`}
                onSelect={() => handleSelect(`/comercial?deal=${d.id}`)}
              >
                <IconCurrencyDollar className="size-4 text-muted-foreground" />
                <span className="flex-1 truncate">{d.name}</span>
                <CommandShortcut>
                  <IconArrowRight className="size-3" />
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Separator between dynamic & static results */}
        {hasResults && <CommandSeparator />}

        {/* Static nav pages */}
        <CommandGroup heading="Paginas">
          {visibleNavItems.map((item) => {
            const NavIcon = ICON_MAP[item.icon] ?? IconArrowRight;
            return (
              <CommandItem
                key={item.href}
                value={item.label}
                onSelect={() => handleSelect(item.href)}
              >
                <NavIcon className="size-4 text-muted-foreground" />
                <span>{item.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
