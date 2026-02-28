"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock } from "lucide-react";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AgendaSummary() {
  // This is a placeholder that will be connected to real calendar data
  // For now, show a "go to agenda" prompt
  const today = new Date();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <CalendarDays className="h-4 w-4 text-blue-500" />
          Agenda
        </CardTitle>
        <Link
          href="/agenda"
          className="text-sm text-muted-foreground hover:underline"
        >
          Ver agenda
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {format(today, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </p>
                <p className="text-xs text-muted-foreground">
                  Acesse a agenda para ver seus compromissos
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Link
              href="/agenda"
              className="rounded-lg border p-2 text-center transition-colors hover:bg-muted/50"
            >
              <p className="text-lg font-bold text-blue-600">
                {format(today, "dd")}
              </p>
              <p className="text-xs text-muted-foreground">Hoje</p>
            </Link>
            <Link
              href="/agenda"
              className="rounded-lg border p-2 text-center transition-colors hover:bg-muted/50"
            >
              <p className="text-lg font-bold">
                {format(addDays(today, 1), "dd")}
              </p>
              <p className="text-xs text-muted-foreground">Amanha</p>
            </Link>
            <Link
              href="/agenda"
              className="rounded-lg border p-2 text-center transition-colors hover:bg-muted/50"
            >
              <p className="text-lg font-bold">
                {format(addDays(today, 2), "dd")}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(addDays(today, 2), "EEE", { locale: ptBR })}
              </p>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
