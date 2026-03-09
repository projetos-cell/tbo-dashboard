"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PeopleTimeline } from "@/features/people/components/people-timeline";
import { usePeopleEvents } from "@/features/people/hooks/use-people-events";
import { useProfiles } from "@/features/people/hooks/use-people";
import type { PeopleEventType, EventSeverity, PeopleEventsFilter } from "@/features/people/services/people-events";

// ---------------------------------------------------------------------------
// Event type & severity options for filters
// ---------------------------------------------------------------------------

const EVENT_TYPE_OPTIONS: { value: PeopleEventType; label: string }[] = [
  { value: "auto_task_created", label: "Tarefa automática" },
  { value: "one_on_one_completed", label: "1:1 realizado" },
  { value: "pdi_updated", label: "PDI atualizado" },
  { value: "performance_changed", label: "Performance alterada" },
  { value: "status_changed", label: "Status alterado" },
  { value: "recognition_received", label: "Reconhecimento" },
  { value: "overload_detected", label: "Sobrecarga detectada" },
];

const SEVERITY_OPTIONS: { value: EventSeverity; label: string }[] = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Atenção" },
  { value: "critical", label: "Crítico" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PessoasTimelinePage() {
  const [personId, setPersonId] = useState<string | undefined>();
  const [eventType, setEventType] = useState<PeopleEventType | undefined>();
  const [severity, setSeverity] = useState<EventSeverity | undefined>();

  const filters: PeopleEventsFilter = useMemo(
    () => ({
      ...(personId ? { personId } : {}),
      ...(eventType ? { eventType } : {}),
      ...(severity ? { severity } : {}),
    }),
    [personId, eventType, severity]
  );

  const { data: events, isLoading } = usePeopleEvents(filters, 200);
  const { data: profiles } = useProfiles();

  // Build name map for displaying person names
  const personNames = useMemo(() => {
    const map: Record<string, string> = {};
    if (profiles) {
      for (const p of profiles) {
        map[p.id] = p.full_name ?? "Sem nome";
      }
    }
    return map;
  }, [profiles]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Timeline</h1>
        <p className="text-gray-500">
          Histórico de eventos organizacionais por pessoa
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={personId ?? "__all__"}
          onValueChange={(v) => setPersonId(v === "__all__" ? undefined : v)}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Todas as pessoas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas as pessoas</SelectItem>
            {(profiles ?? []).map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.full_name ?? "Sem nome"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={eventType ?? "__all__"}
          onValueChange={(v) =>
            setEventType(v === "__all__" ? undefined : (v as PeopleEventType))
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos os tipos</SelectItem>
            {EVENT_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={severity ?? "__all__"}
          onValueChange={(v) =>
            setSeverity(v === "__all__" ? undefined : (v as EventSeverity))
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Severidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas</SelectItem>
            {SEVERITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Eventos recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <PeopleTimeline
            events={events ?? []}
            isLoading={isLoading}
            showPersonName
            personNames={personNames}
          />
        </CardContent>
      </Card>
    </div>
  );
}
