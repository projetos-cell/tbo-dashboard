"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  IconPlayerPlay,
  IconPlayerStop,
  IconClock,
  IconClockHour4,
} from "@tabler/icons-react";
import { useAuthStore } from "@/stores/auth-store";
import {
  useTaskTimeEntries,
  useRunningTimer,
  useStartTimer,
  useStopTimer,
} from "../hooks/use-task-advanced";
import type { TimeEntry } from "../hooks/use-task-advanced";

function formatDuration(startedAt: string, endedAt?: string | null): string {
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  const totalSeconds = Math.floor((end - start) / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatMinutes(minutes: number | null): string {
  if (!minutes) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

interface TaskTimeTrackerProps {
  taskId: string;
}

export function TaskTimeTracker({ taskId }: TaskTimeTrackerProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const { data: entries, isLoading } = useTaskTimeEntries(taskId);
  const { data: runningTimer } = useRunningTimer(userId);
  const startTimer = useStartTimer();
  const stopTimer = useStopTimer();

  const [tick, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isRunningThisTask = runningTimer?.task_id === taskId;

  useEffect(() => {
    if (isRunningThisTask) {
      intervalRef.current = setInterval(() => setTick((t) => t + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunningThisTask]);

  const totalMinutes = (entries ?? []).reduce(
    (sum, e) => sum + (e.duration_minutes ?? 0),
    0,
  );

  const handleToggle = () => {
    if (isRunningThisTask && runningTimer) {
      stopTimer.mutate(runningTimer.id);
    } else {
      startTimer.mutate({ task_id: taskId, user_id: userId! });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <IconClockHour4 size={16} className="text-muted-foreground" />
        <h3 className="text-sm font-semibold">Controle de Tempo</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          Total: {formatMinutes(totalMinutes)}
        </span>
      </div>

      {/* Timer display */}
      <div className="rounded-lg border bg-card p-4 text-center">
        {isRunningThisTask && runningTimer ? (
          <div className="space-y-2">
            <div className="font-mono text-3xl font-bold tabular-nums text-green-600">
              {formatDuration(runningTimer.started_at)}
            </div>
            <p className="text-xs text-muted-foreground">Cronômetro em execução</p>
          </div>
        ) : runningTimer && !isRunningThisTask ? (
          <p className="text-xs text-amber-600">
            Você tem um cronômetro rodando em outra tarefa. Iniciá-lo aqui vai pausar aquele.
          </p>
        ) : (
          <div className="space-y-1">
            <div className="font-mono text-3xl font-bold tabular-nums text-muted-foreground">
              00:00:00
            </div>
            <p className="text-xs text-muted-foreground">Pronto para iniciar</p>
          </div>
        )}
      </div>

      <Button
        onClick={handleToggle}
        disabled={startTimer.isPending || stopTimer.isPending || !userId}
        className={`w-full ${isRunningThisTask ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} text-white`}
        size="sm"
      >
        {isRunningThisTask ? (
          <>
            <IconPlayerStop size={14} className="mr-2" />
            Parar
          </>
        ) : (
          <>
            <IconPlayerPlay size={14} className="mr-2" />
            Iniciar
          </>
        )}
      </Button>

      {/* Entries list */}
      {entries && entries.length > 0 && (
        <>
          <Separator />
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Registros ({entries.length})
            </p>
            <ul className="max-h-48 space-y-1.5 overflow-y-auto">
              {entries.map((entry: TimeEntry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <IconClock size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.started_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-medium">
                    {entry.is_running
                      ? formatDuration(entry.started_at)
                      : formatMinutes(entry.duration_minutes)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
