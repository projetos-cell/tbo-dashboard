"use client";

import {
  IconClipboardList,
  IconUser,
  IconTarget,
  IconFile,
  IconPencil,
  IconCheck,
  IconPlus,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useRef, useEffect } from "react";
import { useUpdateProject } from "@/features/projects/hooks/use-projects";

const AVATAR_COLORS = [
  { bg: "#d1e8fb", text: "#0c447c" },
  { bg: "#faeeda", text: "#633806" },
  { bg: "#eaf3de", text: "#27500a" },
  { bg: "#fbeaf0", text: "#72243e" },
  { bg: "#e1f5ee", text: "#085041" },
  { bg: "#e8e0f5", text: "#4a2174" },
];

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

interface EnrichedMember {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  cargo: string | null;
}

interface OverviewLeftColumnProps {
  projectId: string;
  projectNotes: string | null;
  enrichedMembers: EnrichedMember[];
  onOpenMembers?: () => void;
}

export function OverviewLeftColumn({
  projectId,
  projectNotes,
  enrichedMembers,
  onOpenMembers,
}: OverviewLeftColumnProps) {
  const updateProject = useUpdateProject();
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const notesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingNotes && notesRef.current) {
      notesRef.current.focus();
      notesRef.current.style.height = "auto";
      notesRef.current.style.height = notesRef.current.scrollHeight + "px";
    }
  }, [editingNotes]);

  function handleSaveNotes() {
    const trimmed = notesValue.trim();
    updateProject.mutate({
      id: projectId,
      updates: { notes: trimmed || null } as never,
    });
    setEditingNotes(false);
  }

  return (
    <div className="space-y-4">
      {/* Descricao do Projeto (editavel) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconClipboardList className="size-4 text-muted-foreground" />
              Descricao do Projeto
            </CardTitle>
            {!editingNotes && (
              <button
                type="button"
                onClick={() => {
                  setNotesValue(projectNotes ?? "");
                  setEditingNotes(true);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <IconPencil className="size-3.5" />
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingNotes ? (
            <div className="space-y-2">
              <textarea
                ref={notesRef}
                value={notesValue}
                onChange={(e) => {
                  setNotesValue(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setEditingNotes(false);
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSaveNotes();
                }}
                className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring min-h-[80px]"
                placeholder="Descreva o projeto..."
              />
              <div className="flex items-center gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setEditingNotes(false)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={handleSaveNotes}
                  disabled={updateProject.isPending}
                >
                  <IconCheck className="size-3" />
                  Salvar
                </Button>
              </div>
            </div>
          ) : projectNotes ? (
            <button
              type="button"
              onClick={() => {
                setNotesValue(projectNotes);
                setEditingNotes(true);
              }}
              className="w-full text-left"
            >
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed hover:bg-muted/30 rounded-md px-1 py-0.5 -mx-1 transition-colors">
                {projectNotes}
              </p>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setNotesValue("");
                setEditingNotes(true);
              }}
              className="w-full text-left"
            >
              <p className="text-sm text-muted-foreground italic hover:bg-muted/30 rounded-md px-1 py-0.5 -mx-1 transition-colors">
                Clique para adicionar uma descricao...
              </p>
            </button>
          )}
        </CardContent>
      </Card>

      {/* Membros do Projeto */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconUser className="size-4 text-muted-foreground" />
              Membros do Projeto
            </CardTitle>
            {onOpenMembers && (
              <button
                type="button"
                onClick={onOpenMembers}
                className="text-xs font-medium text-[#e85102] hover:underline"
              >
                Gerenciar
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {enrichedMembers.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {enrichedMembers.map((member, i) => {
                const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                return (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar className="size-10">
                      {member.avatar_url && <AvatarImage src={member.avatar_url} />}
                      <AvatarFallback
                        className="text-xs font-semibold"
                        style={{ backgroundColor: color.bg, color: color.text }}
                      >
                        {getInitials(member.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {member.full_name?.split(" ")[0]}
                      </p>
                      {member.cargo && (
                        <p className="text-xs text-muted-foreground truncate">
                          {member.cargo}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              {onOpenMembers && (
                <button
                  type="button"
                  onClick={onOpenMembers}
                  className="flex size-10 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 text-muted-foreground/50 hover:border-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  <IconPlus className="size-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground italic">
                Nenhum membro neste projeto.
              </p>
              {onOpenMembers && (
                <button
                  type="button"
                  onClick={onOpenMembers}
                  className="flex size-10 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 text-muted-foreground/50 hover:border-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  <IconPlus className="size-4" />
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metas Conectadas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <IconTarget className="size-4 text-muted-foreground" />
            Metas Conectadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            Nenhuma meta conectada a este projeto.
          </p>
        </CardContent>
      </Card>

      {/* Arquivos Recentes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <IconFile className="size-4 text-muted-foreground" />
            Arquivos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            Nenhum arquivo adicionado a este projeto.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
