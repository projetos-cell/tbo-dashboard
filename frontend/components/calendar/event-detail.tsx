"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { CalendarEvent } from "@/services/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Clock,
  MapPin,
  Users,
  Trash2,
  ExternalLink,
} from "lucide-react";

interface EventDetailProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (id: string) => void;
}

export function EventDetail({
  event,
  open,
  onOpenChange,
  onDelete,
}: EventDetailProps) {
  if (!event) return null;

  const start = new Date(event.startAt);
  const end = new Date(event.endAt);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{event.title}</SheetTitle>
          <SheetDescription className="sr-only">
            Detalhes do evento
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-4">
          {/* Time */}
          <div className="flex items-start gap-2 text-sm">
            <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              {event.isAllDay ? (
                <span>
                  Dia inteiro &mdash;{" "}
                  {format(start, "dd MMM yyyy", { locale: ptBR })}
                </span>
              ) : (
                <>
                  <p>
                    {format(start, "EEEE, dd MMM yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-muted-foreground">
                    {format(start, "HH:mm")} – {format(end, "HH:mm")}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
          )}

          {/* Organizer */}
          {event.organizer && (
            <div className="flex items-start gap-2 text-sm">
              <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span>{event.organizer}</span>
            </div>
          )}

          {/* Source */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {event.source === "google" ? "Google Calendar" : "Manual"}
            </Badge>
          </div>

          {/* Description */}
          {event.description && (
            <>
              <Separator />
              <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                {event.description}
              </div>
            </>
          )}

          {/* Actions */}
          <Separator />
          <div className="flex gap-2">
            {event.googleEventId && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://calendar.google.com/calendar/event?eid=${event.googleEventId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Abrir no Google
                </a>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(event.id)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Excluir
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
