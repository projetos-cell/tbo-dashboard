"use client";

import { useState } from "react";
import {
  Shield,
  ShieldCheck,
  UserMinus,
  Archive,
  Search,
  Plus,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/tbo-ui/sheet";
import { Input } from "@/components/tbo-ui/input";
import { Button } from "@/components/tbo-ui/button";
import { Label } from "@/components/tbo-ui/label";
import { Badge } from "@/components/tbo-ui/badge";
import { ScrollArea } from "@/components/tbo-ui/scroll-area";
import { Separator } from "@/components/tbo-ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/tbo-ui/alert-dialog";
import {
  useChannelMembers,
  useUpdateChannel,
  useArchiveChannel,
  useAddChannelMembers,
  useRemoveChannelMember,
  useUpdateMemberRole,
} from "@/hooks/use-chat";
import { useProfiles } from "@/hooks/use-people";
import { useChatStore } from "@/stores/chat-store";
import { useAuthStore } from "@/stores/auth-store";
import { hasPermission, type RoleSlug } from "@/lib/permissions";
import type { ChannelRow } from "@/services/chat";

interface ChannelSettingsDrawerProps {
  channel: ChannelRow;
}

export function ChannelSettingsDrawer({ channel }: ChannelSettingsDrawerProps) {
  const open = useChatStore((s) => s.isChannelSettingsOpen);
  const setOpen = useChatStore((s) => s.setChannelSettingsOpen);
  const setSelectedChannelId = useChatStore((s) => s.setSelectedChannelId);

  const userId = useAuthStore((s) => s.user?.id);
  const userRole = useAuthStore((s) => s.role) as RoleSlug | null;

  const canManage = hasPermission(userRole, "chat.manage_channels");
  const isCreator = channel.created_by === userId;
  const canEdit = canManage || isCreator;

  const [name, setName] = useState(channel.name ?? "");
  const [description, setDescription] = useState(channel.description ?? "");
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedNewMembers, setSelectedNewMembers] = useState<string[]>([]);

  const { data: members, isLoading: loadingMembers } = useChannelMembers(
    open ? channel.id : null,
  );
  const { data: profiles } = useProfiles();
  const updateChannel = useUpdateChannel();
  const archiveChannel = useArchiveChannel();
  const addMembers = useAddChannelMembers();
  const removeMember = useRemoveChannelMember();
  const updateRole = useUpdateMemberRole();

  const memberIds = new Set(members?.map((m) => m.user_id) ?? []);

  const filteredProfiles = (profiles ?? []).filter((p) => {
    if (memberIds.has(p.id)) return false;
    if (selectedNewMembers.includes(p.id)) return false;
    if (!memberSearch) return true;
    return (
      p.full_name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
      p.email?.toLowerCase().includes(memberSearch.toLowerCase())
    );
  });

  function profileName(uid: string) {
    return profiles?.find((p) => p.id === uid)?.full_name ?? uid.slice(0, 8);
  }

  function handleSaveInfo() {
    if (!name.trim()) return;
    updateChannel.mutate({
      id: channel.id,
      updates: {
        name: name.trim(),
        description: description.trim() || null,
      } as never,
    });
  }

  function handleArchive() {
    archiveChannel.mutate(channel.id, {
      onSuccess: () => {
        setSelectedChannelId(null);
        setOpen(false);
      },
    });
  }

  function handleAddMembers() {
    if (selectedNewMembers.length === 0) return;
    addMembers.mutate(
      { channelId: channel.id, userIds: selectedNewMembers },
      {
        onSuccess: () => {
          setSelectedNewMembers([]);
          setIsAddingMembers(false);
          setMemberSearch("");
        },
      },
    );
  }

  function handleRemoveMember(memberId: string) {
    removeMember.mutate({ channelId: channel.id, memberId });
  }

  function handleToggleRole(memberId: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "member" : "admin";
    updateRole.mutate({
      channelId: channel.id,
      memberId,
      role: newRole as "admin" | "member",
    });
  }

  function handleClose() {
    setOpen(false);
    setIsAddingMembers(false);
    setSelectedNewMembers([]);
    setMemberSearch("");
  }

  return (
    <Sheet open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <SheetContent className="sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Configurações do Canal</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Channel Info */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="cs-name">Nome</Label>
              <Input
                id="cs-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!canEdit}
                maxLength={60}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cs-desc">Descrição</Label>
              <Input
                id="cs-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canEdit}
                maxLength={200}
                placeholder="Sobre o que é esse canal?"
              />
            </div>
            {canEdit && (
              <Button
                size="sm"
                onClick={handleSaveInfo}
                disabled={!name.trim() || updateChannel.isPending}
              >
                {updateChannel.isPending ? "Salvando..." : "Salvar"}
              </Button>
            )}
          </div>

          <Separator />

          {/* Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Membros {members ? `(${members.length})` : ""}
              </Label>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setIsAddingMembers(!isAddingMembers)}
                >
                  {isAddingMembers ? (
                    <>
                      <X className="h-3 w-3" /> Fechar
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3" /> Adicionar
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Add members panel */}
            {isAddingMembers && (
              <div className="space-y-2 rounded-md border p-2">
                {selectedNewMembers.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedNewMembers.map((id) => (
                      <Badge key={id} variant="secondary" className="gap-1 pr-1">
                        {profileName(id)}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedNewMembers((p) =>
                              p.filter((m) => m !== id),
                            )
                          }
                          className="ml-0.5 rounded-full hover:bg-gray-100-foreground/20 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-500" />
                  <Input
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Buscar pessoas..."
                    className="pl-8 h-9"
                  />
                </div>

                <ScrollArea className="h-28 rounded border">
                  <div className="p-1">
                    {filteredProfiles.length === 0 ? (
                      <p className="text-xs text-gray-500 p-2 text-center">
                        Nenhum resultado
                      </p>
                    ) : (
                      filteredProfiles.slice(0, 20).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() =>
                            setSelectedNewMembers((prev) => [...prev, p.id])
                          }
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-100 transition-colors"
                        >
                          <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium shrink-0">
                            {(p.full_name ?? "?").charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate text-xs">{p.full_name}</span>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>

                <Button
                  size="sm"
                  className="w-full h-8 text-xs"
                  onClick={handleAddMembers}
                  disabled={
                    selectedNewMembers.length === 0 || addMembers.isPending
                  }
                >
                  {addMembers.isPending
                    ? "Adicionando..."
                    : `Adicionar ${selectedNewMembers.length} membro(s)`}
                </Button>
              </div>
            )}

            {/* Members list */}
            {loadingMembers ? (
              <p className="text-xs text-gray-500">Carregando...</p>
            ) : (
              <ScrollArea className="h-52 rounded border">
                <div className="p-1">
                  {(members ?? []).map((m) => {
                    const isMe = m.user_id === userId;
                    const memberName = profileName(m.user_id);
                    const isAdmin = m.role === "admin";

                    return (
                      <div
                        key={m.user_id}
                        className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-100/50 transition-colors"
                      >
                        <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium shrink-0">
                          {memberName.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate flex-1">{memberName}</span>
                        {isMe && (
                          <span className="text-[10px] text-gray-500">
                            (você)
                          </span>
                        )}
                        <Badge
                          variant={isAdmin ? "default" : "outline"}
                          className="text-[10px] h-5 px-1.5"
                        >
                          {isAdmin ? "admin" : "membro"}
                        </Badge>

                        {canEdit && !isMe && (
                          <div className="flex items-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              title={
                                isAdmin
                                  ? "Rebaixar para membro"
                                  : "Promover a admin"
                              }
                              onClick={() =>
                                handleToggleRole(m.user_id, m.role ?? "member")
                              }
                            >
                              {isAdmin ? (
                                <Shield className="h-3 w-3" />
                              ) : (
                                <ShieldCheck className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500 hover:text-red-500"
                              title="Remover do canal"
                              onClick={() => handleRemoveMember(m.user_id)}
                            >
                              <UserMinus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Danger zone */}
          {canEdit && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium text-red-500">
                  Zona de perigo
                </Label>
                <AlertDialog>
                  <AlertDialogTrigger>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1.5"
                    >
                      <Archive className="h-3.5 w-3.5" />
                      Arquivar Canal
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Arquivar canal?</AlertDialogTitle>
                      <AlertDialogDescription>
                        O canal &quot;{channel.name}&quot; será arquivado e não
                        aparecerá mais na lista. As mensagens serão preservadas.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleArchive}>
                        Arquivar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
