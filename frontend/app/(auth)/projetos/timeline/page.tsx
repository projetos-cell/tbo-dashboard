"use client";

import { useState, useMemo } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { PROJECT_STATUS, BU_COLORS } from "@/lib/constants";
import { RequireRole } from "@/features/auth/components/require-role";
import {
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  addMonths,
  subMonths,
  format,
  differenceInDays,
  isWithinInterval,
  max as maxDate,
  min as minDate,
  parseISO,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProjectBar {
  id: string;
  name: string;
  status: string;
  bus: string[];
  ownerName: string | null;
  start: Date;
  end: Date;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStatusColor(status: string): string {
  const cfg = PROJECT_STATUS[status as keyof typeof PROJECT_STATUS];
  return cfg?.color ?? "#6b7280";
}

function getBuColor(bu: string): string {
  return BU_COLORS[bu]?.color ?? "#6b7280";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProjetosTimeline() {
  const router = useRouter();
  const { data: projects, isLoading } = useProjects();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterBu, setFilterBu] = useState<string>("all");

  // Time window: 3 months centered on current
  const rangeStart = startOfMonth(subMonths(currentDate, 1));
  const rangeEnd = endOfMonth(addMonths(currentDate, 1));
  const totalDays = differenceInDays(rangeEnd, rangeStart) + 1;

  // Week markers
  const weeks = useMemo(
    () =>
      eachWeekOfInterval(
        { start: rangeStart, end: rangeEnd },
        { weekStartsOn: 1 }
      ),
    [rangeStart.getTime(), rangeEnd.getTime()]
  );

  // Available BUs
  const allBus = useMemo(() => {
    if (!projects) return [];
    const set = new Set<string>();
    projects.forEach((p) => {
      const bus = (p.bus as string[] | null) ?? [];
      bus.forEach((b) => set.add(b));
    });
    return Array.from(set).sort();
  }, [projects]);

  // Filter + map to ProjectBar
  const bars: ProjectBar[] = useMemo(() => {
    if (!projects) return [];
    return projects
      .filter((p) => {
        if (filterBu !== "all") {
          const bus = (p.bus as string[] | null) ?? [];
          if (!bus.includes(filterBu)) return false;
        }
        return true;
      })
      .map((p) => {
        const start = p.due_date_start ? parseISO(p.due_date_start) : new Date();
        const end = p.due_date_end ? parseISO(p.due_date_end) : start;
        return {
          id: p.id,
          name: p.name,
          status: p.status ?? "em_andamento",
          bus: (p.bus as string[] | null) ?? [],
          ownerName: p.owner_name,
          start,
          end: end < start ? start : end,
        };
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [projects, filterBu]);

  // Group by BU
  const groupedByBu = useMemo(() => {
    const groups = new Map<string, ProjectBar[]>();
    bars.forEach((bar) => {
      const key = bar.bus[0] ?? "Sem BU";
      const list = groups.get(key) ?? [];
      list.push(bar);
      groups.set(key, list);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [bars]);

  const getBarStyle = (bar: ProjectBar) => {
    const clampedStart = maxDate([bar.start, rangeStart]);
    const clampedEnd = minDate([bar.end, rangeEnd]);
    const leftDays = differenceInDays(clampedStart, rangeStart);
    const widthDays = differenceInDays(clampedEnd, clampedStart) + 1;
    const leftPct = (leftDays / totalDays) * 100;
    const widthPct = (widthDays / totalDays) * 100;

    return {
      left: `${leftPct}%`,
      width: `${Math.max(widthPct, 1)}%`,
    };
  };

  const isVisible = (bar: ProjectBar) => {
    return (
      bar.end >= rangeStart && bar.start <= rangeEnd
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  return (
    <RequireRole module="projetos">
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Timeline</h1>
          <p className="text-sm text-muted-foreground">
            Visão temporal de todos os projetos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterBu} onValueChange={setFilterBu}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <IconFilter className="mr-1.5 size-3.5 text-muted-foreground" />
              <SelectValue placeholder="Filtrar BU" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as BUs</SelectItem>
              {allBus.map((bu) => (
                <SelectItem key={bu} value={bu}>
                  {bu}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Timeline header: navigation + week columns */}
      <div className="overflow-hidden rounded-lg border border-border/60 bg-background">
        {/* Month nav */}
        <div className="flex items-center justify-between border-b border-border/40 px-4 py-2">
          <Button variant="ghost" size="icon" className="size-7" onClick={() => setCurrentDate((d) => subMonths(d, 1))}>
            <IconChevronLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-3 text-sm font-medium">
            {[subMonths(currentDate, 1), currentDate, addMonths(currentDate, 1)].map((m, i) => (
              <span
                key={i}
                className={cn(
                  "capitalize",
                  i === 1 ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {format(m, "MMMM yyyy", { locale: ptBR })}
              </span>
            ))}
          </div>
          <Button variant="ghost" size="icon" className="size-7" onClick={() => setCurrentDate((d) => addMonths(d, 1))}>
            <IconChevronRight className="size-4" />
          </Button>
        </div>

        {/* Week headers */}
        <div className="relative border-b border-border/40">
          <div className="flex">
            <div className="w-[200px] shrink-0 border-r border-border/40 px-3 py-1.5 text-[10px] font-medium uppercase text-muted-foreground">
              Projeto
            </div>
            <div className="relative flex-1">
              <div className="flex">
                {weeks.map((w, i) => {
                  const wEnd = endOfWeek(w, { weekStartsOn: 1 });
                  const isNow = isWithinInterval(new Date(), { start: w, end: wEnd });
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex-1 border-r border-border/20 px-1 py-1.5 text-center text-[10px] text-muted-foreground",
                        isNow && "bg-primary/5 font-medium text-primary"
                      )}
                    >
                      {format(w, "dd MMM", { locale: ptBR })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bars */}
        <div className="max-h-[600px] overflow-y-auto">
          {groupedByBu.length === 0 && (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              Nenhum projeto encontrado
            </div>
          )}
          {groupedByBu.map(([buName, buBars]) => (
            <div key={buName}>
              {/* BU group header */}
              <div className="flex items-center gap-2 border-b border-border/30 bg-muted/30 px-3 py-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: getBuColor(buName) }}
                />
                <span className="text-xs font-medium">{buName}</span>
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  {buBars.length}
                </Badge>
              </div>

              {/* Project rows */}
              {buBars.map((bar) => (
                <div
                  key={bar.id}
                  className="group flex border-b border-border/20 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => router.push(`/projetos/${bar.id}`)}
                >
                  {/* Name column */}
                  <div className="w-[200px] shrink-0 border-r border-border/30 px-3 py-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block truncate text-xs font-medium">{bar.name}</span>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
                        <p className="font-medium">{bar.name}</p>
                        <p className="text-muted-foreground">
                          {format(bar.start, "dd/MM")} → {format(bar.end, "dd/MM/yyyy")}
                        </p>
                        {bar.ownerName && <p className="text-muted-foreground">{bar.ownerName}</p>}
                      </TooltipContent>
                    </Tooltip>
                    <span className="text-[10px] text-muted-foreground">
                      {bar.ownerName ?? "Sem responsável"}
                    </span>
                  </div>

                  {/* Bar area */}
                  <div className="relative flex-1 py-1.5">
                    {isVisible(bar) && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 h-5 rounded-full transition-shadow group-hover:shadow-md"
                        style={{
                          ...getBarStyle(bar),
                          backgroundColor: getStatusColor(bar.status),
                          opacity: 0.85,
                        }}
                      >
                        <span className="absolute inset-0 flex items-center justify-center truncate px-2 text-[10px] font-medium text-white">
                          {bar.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
    </RequireRole>
  );
}
