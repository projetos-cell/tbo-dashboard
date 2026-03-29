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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { useUpdateProject, useAddProjectMember, useProjectMembers } from "@/features/projects/hooks/use-projects";
import { useProfiles } from "@/features/people/hooks/use-people";
import { useAuthStore } from "@/stores/auth-store";

const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then((m) => ({ default: m.RichTextEditor })),
  { ssr: false, loading: () => <div className="h-[120px] animate-pulse rounded-md bg-muted" /> },
);
const RichTextViewer = dynamic(
  () => import("@/components/ui/rich-text-editor").then((m) => ({ default: m.RichTextViewer })),
  { ssr: false },
);

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
  const addMember = useAddProjectMember();
  const { data: projectMembers } = useProjectMembers(projectId);
  const { data: profiles } = useProfiles();
  const tenantId = useAuthStore((s) => s.tenantId);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addMemberSearch, setAddMemberSearch] = useState("");
  const addMemberInputRef = useRef<HTMLInputElement>(null);

  const memberIds = useMemo(
    () => new Set((projectMembers ?? []).map((m) => m.user_id)),
    [projectMembers],
  );

  const availableProfiles = useMemo(() => {
    if (!profiles) return [];
    const q = addMemberSearch.toLowerCase();
    return profiles.filter(
      (p) => p.full_name && !memberIds.has(p.id) && (!q || p.full_name.toLowerCase().includes(q)),
    );
  }, [profiles, memberIds, addMemberSearch]);

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
              <RichTextEditor
                value={notesValue}
                onChange={setNotesValue}
                placeholder="Descreva o projeto..."
                minHeight={100}
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
              <div className="hover:bg-muted/30 rounded-md px-1 py-0.5 -mx-1 transition-colors">
                <RichTextViewer content={projectNotes} />
              </div>
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
              <AddMemberButton
                open={addMemberOpen}
                onOpenChange={(o) => { setAddMemberOpen(o); if (!o) setAddMemberSearch(""); }}
                search={addMemberSearch}
                onSearchChange={setAddMemberSearch}
                inputRef={addMemberInputRef}
                availableProfiles={availableProfiles}
                onAdd={(p) => {
                  if (!tenantId || !currentUserId) return;
                  addMember.mutate({ projectId, userId: p.id, tenantId, grantedBy: currentUserId });
                  setAddMemberOpen(false);
                  setAddMemberSearch("");
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground italic">
                Nenhum membro neste projeto.
              </p>
              <AddMemberButton
                open={addMemberOpen}
                onOpenChange={(o) => { setAddMemberOpen(o); if (!o) setAddMemberSearch(""); }}
                search={addMemberSearch}
                onSearchChange={setAddMemberSearch}
                inputRef={addMemberInputRef}
                availableProfiles={availableProfiles}
                onAdd={(p) => {
                  if (!tenantId || !currentUserId) return;
                  addMember.mutate({ projectId, userId: p.id, tenantId, grantedBy: currentUserId });
                  setAddMemberOpen(false);
                  setAddMemberSearch("");
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metas + Arquivos — inline compacto quando vazio */}
      <div className="flex flex-col gap-2 rounded-lg border border-border/40 bg-background px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <IconTarget className="size-3.5" />
          <span>Metas Conectadas</span>
          <span className="ml-auto text-[11px]">Nenhuma</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <IconFile className="size-3.5" />
          <span>Arquivos Recentes</span>
          <span className="ml-auto text-[11px]">Nenhum</span>
        </div>
      </div>
    </div>
  );
}

// ─── Inline add member popover ──────────────────────────────────────────────

interface ProfileItem {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

function AddMemberButton({
  open,
  onOpenChange,
  search,
  onSearchChange,
  inputRef,
  availableProfiles,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  onSearchChange: (s: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  availableProfiles: ProfileItem[];
  onAdd: (p: ProfileItem) => void;
}) {
  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (o) setTimeout(() => inputRef.current?.focus(), 50);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 text-muted-foreground/50 hover:border-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          <IconPlus className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start" sideOffset={4}>
        <div className="border-b border-border/60 p-2">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar membro..."
            className="h-7 w-full rounded border-0 bg-muted/40 px-2 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto p-1">
          {availableProfiles.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              Nenhum usuário disponível
            </p>
          ) : (
            availableProfiles.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onAdd(p)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
              >
                <Avatar className="size-6">
                  {p.avatar_url && <AvatarImage src={p.avatar_url} />}
                  <AvatarFallback className="text-[10px]">
                    {getInitials(p.full_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-xs">{p.full_name}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
