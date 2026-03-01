"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MEETING_STATUS, MEETING_CATEGORIES } from "@/lib/constants";
import { useUpdateMeeting, useDeleteMeeting } from "@/hooks/use-meetings";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ExternalLink,
  MoreHorizontal,
  Trash2,
  Eye,
  Video,
} from "lucide-react";

type MeetingRow = Database["public"]["Tables"]["meetings"]["Row"];

interface MeetingsListProps {
  meetings: MeetingRow[];
  onSelect: (meeting: MeetingRow) => void;
}

export function MeetingsList({ meetings, onSelect }: MeetingsListProps) {
  const updateMeeting = useUpdateMeeting();
  const deleteMeeting = useDeleteMeeting();

  if (meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <Video className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium">Nenhuma reuniao encontrada</p>
        <p className="text-xs text-muted-foreground">
          Ajuste os filtros ou crie uma nova reuniao.
        </p>
      </div>
    );
  }

  const handleStatusChange = (meetingId: string, status: string) => {
    updateMeeting.mutate({ id: meetingId, updates: { status } });
  };

  const handleDelete = (meetingId: string) => {
    deleteMeeting.mutate(meetingId);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titulo</TableHead>
          <TableHead className="hidden md:table-cell">Data/Hora</TableHead>
          <TableHead className="hidden md:table-cell">Duracao</TableHead>
          <TableHead className="hidden lg:table-cell">Participantes</TableHead>
          <TableHead className="hidden md:table-cell">Status</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {meetings.map((meeting) => {
          const statusCfg =
            MEETING_STATUS[meeting.status as keyof typeof MEETING_STATUS];
          const categoryCfg = meeting.category
            ? MEETING_CATEGORIES[meeting.category]
            : null;
          const participantCount = meeting.participants?.length ?? 0;

          return (
            <TableRow
              key={meeting.id}
              className="cursor-pointer"
              onClick={() => onSelect(meeting)}
            >
              <TableCell>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate font-medium">
                    {meeting.title}
                  </span>
                  {categoryCfg && (
                    <Badge
                      variant="outline"
                      className="text-[10px] shrink-0"
                      style={{ color: categoryCfg.color, borderColor: categoryCfg.color }}
                    >
                      {categoryCfg.label}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {meeting.date ? (
                  <div className="text-sm text-muted-foreground">
                    <span>
                      {format(
                        new Date(meeting.date + "T12:00:00"),
                        "dd MMM yyyy",
                        { locale: ptBR }
                      )}
                    </span>
                    {meeting.time && (
                      <span className="ml-1.5 text-xs">
                        {meeting.time.slice(0, 5)}
                      </span>
                    )}
                  </div>
                ) : (
                  "\u2014"
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {meeting.duration_minutes ? (
                  <span className="text-sm text-muted-foreground">
                    {meeting.duration_minutes} min
                  </span>
                ) : (
                  "\u2014"
                )}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {participantCount > 0 ? (
                  <span className="text-sm text-muted-foreground">
                    {participantCount} participante
                    {participantCount !== 1 ? "s" : ""}
                  </span>
                ) : (
                  "\u2014"
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {statusCfg && (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: statusCfg.bg,
                      color: statusCfg.color,
                    }}
                  >
                    {statusCfg.label}
                  </Badge>
                )}
              </TableCell>

              {/* Context menu */}
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Acoes"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Acoes</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(meeting);
                        }}
                      >
                        <Eye className="size-3.5 mr-2" />
                        Ver detalhes
                      </DropdownMenuItem>
                      {meeting.meeting_link && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(meeting.meeting_link!, "_blank");
                          }}
                        >
                          <ExternalLink className="size-3.5 mr-2" />
                          Abrir link
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Status</DropdownMenuLabel>
                      {Object.entries(MEETING_STATUS).map(([key, cfg]) => (
                        <DropdownMenuItem
                          key={key}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(meeting.id, key);
                          }}
                        >
                          <span
                            className="size-2 rounded-full mr-2 shrink-0"
                            style={{ backgroundColor: cfg.color }}
                          />
                          {cfg.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(meeting.id);
                      }}
                    >
                      <Trash2 className="size-3.5 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
