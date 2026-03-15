"use client";

import { useState } from "react";
import { IconArchive, IconBell, IconBellOff, IconBellRinging, IconPlus, IconVolume, IconVolumeOff, IconX } from "@tabler/icons-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
} from "@/components/ui/alert-dialog";
import {
  useChannelMembers,
  useUpdateChannel,
  useArchiveChannel,
  useAddChannelMembers,
  useRemoveChannelMember,
  useUpdateMemberRole,
} from "@/features/chat/hooks/use-chat";
import { useProfiles } from "@/features/people/hooks/use-people";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { useAuthStore } from "@/stores/auth-store";
import { hasPermission, type RoleSlug } from "@/lib/permissions";
import type { ChannelRow } from "@/features/chat/services/chat";
import { ChannelAddMembersPanel } from "./channel-add-members-panel";
import { ChannelMembersList } from "./channel-members-list";
import { useNotificationPref } from "@/features/chat/hooks/use-notification-prefs";
import { cn } from "@/lib/utils";
import type { NotifSetting } from "@/features/chat/services/chat-notification-prefs";
import { Switch } from "@/components/ui/switch";

interface ChannelSettingsDrawerProps {
  channel: ChannelRow;
  soundEnabled?: boolean;
  onToggleSound?: (enabled: boolean) => void;
}

export function ChannelSettingsDrawer({ channel, soundEnabled = true, onToggleSound }: ChannelSettingsDrawerProps) {
  const open = useChatStore((s) => s.isChannelSettingsOpen);
  const setOpen = useChatStore((s) => s.setChannelSettingsOpen);
  const setSelectedChannelId = useChatStore((s) => s.setSelectedChannelId);

  const userId = useAuthStore((s) => s.user?.id);
  const userRole = useAuthStore((s) => s.role) as RoleSlug | null;
  const canEdit = hasPermission(userRole, "chat.manage_channels") || channel.created_by === userId;

  const [name, setName] = useState(channel.name ?? "");
  const [description, setDescription] = useState(channel.description ?? "");
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedNewMembers, setSelectedNewMembers] = useState<string[]>([]);

  const { data: members, isLoading: loadingMembers } = useChannelMembers(open ? channel.id : null);
  const { data: profiles } = useProfiles();
  const updateChannel = useUpdateChannel();
  const archiveChannel = useArchiveChannel();
  const { pref: notifPref, setPref: setNotifPref, isPending: notifPending } = useNotificationPref(open ? channel.id : null);
  const addMembers = useAddChannelMembers();
  const removeMember = useRemoveChannelMember();
  const updateRole = useUpdateMemberRole();

  const memberIds = new Set(members?.map((m) => m.user_id) ?? []);

  function profileName(uid: string) {
    return profiles?.find((p) => p.id === uid)?.full_name ?? uid.slice(0, 8);
  }

  function handleSaveInfo() {
    if (!name.trim()) return;
    updateChannel.mutate({ id: channel.id, updates: { name: name.trim(), description: description.trim() || null } as never });
  }

  function handleArchive() {
    archiveChannel.mutate(channel.id, { onSuccess: () => { setSelectedChannelId(null); setOpen(false); } });
  }

  function handleAddMembers() {
    if (selectedNewMembers.length === 0) return;
    addMembers.mutate(
      { channelId: channel.id, userIds: selectedNewMembers },
      { onSuccess: () => { setSelectedNewMembers([]); setIsAddingMembers(false); setMemberSearch(""); } },
    );
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
          {/* Channel info */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="cs-name">Nome</Label>
              <Input id="cs-name" value={name} onChange={(e) => setName(e.target.value)} disabled={!canEdit} maxLength={60} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cs-desc">Descrição</Label>
              <Input id="cs-desc" value={description} onChange={(e) => setDescription(e.target.value)} disabled={!canEdit} maxLength={200} placeholder="Sobre o que é esse canal?" />
            </div>
            {canEdit && (
              <Button size="sm" onClick={handleSaveInfo} disabled={!name.trim() || updateChannel.isPending}>
                {updateChannel.isPending ? "Salvando..." : "Salvar"}
              </Button>
            )}
          </div>

          <Separator />

          {/* Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Membros {members ? `(${members.length})` : ""}</Label>
              {canEdit && (
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setIsAddingMembers(!isAddingMembers)}>
                  {isAddingMembers ? <><IconX className="h-3 w-3" /> Fechar</> : <><IconPlus className="h-3 w-3" /> Adicionar</>}
                </Button>
              )}
            </div>

            {isAddingMembers && (
              <ChannelAddMembersPanel
                profiles={profiles ?? []}
                memberIds={memberIds}
                selectedNewMembers={selectedNewMembers}
                memberSearch={memberSearch}
                isAdding={addMembers.isPending}
                onSearchChange={setMemberSearch}
                onToggleMember={(id) => setSelectedNewMembers((prev) => [...prev, id])}
                onRemoveSelected={(id) => setSelectedNewMembers((prev) => prev.filter((m) => m !== id))}
                onConfirm={handleAddMembers}
              />
            )}

            <ChannelMembersList
              members={members ?? []}
              isLoading={loadingMembers}
              currentUserId={userId}
              canEdit={canEdit}
              profileName={profileName}
              onToggleRole={(memberId, currentRole) => {
                updateRole.mutate({ channelId: channel.id, memberId, role: (currentRole === "admin" ? "member" : "admin") as "admin" | "member" });
              }}
              onRemoveMember={(memberId) => removeMember.mutate({ channelId: channel.id, memberId })}
            />
          </div>

          {/* Notification preferences */}
          <Separator />
          <div className="space-y-3">
            <Label className="text-sm font-medium">Notificações</Label>

            {/* Global sound toggle (#10) */}
            {onToggleSound && (
              <button
                type="button"
                onClick={() => onToggleSound(!soundEnabled)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors text-left",
                  "hover:bg-muted",
                )}
              >
                {soundEnabled ? (
                  <IconVolume size={16} className="shrink-0 text-primary" />
                ) : (
                  <IconVolumeOff size={16} className="shrink-0 text-muted-foreground" />
                )}
                <span className="flex-1 min-w-0">
                  <span className="block font-medium">Som de notificação</span>
                  <span className="block text-xs text-muted-foreground">
                    Aplica-se a todos os canais
                  </span>
                </span>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={onToggleSound}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Ativar som de notificação"
                />
              </button>
            )}

            <div className="grid gap-1.5">
              {(
                [
                  { value: "all", label: "Todas as mensagens", desc: "Notificado em cada nova mensagem", Icon: IconBellRinging },
                  { value: "mentions", label: "Apenas @menções", desc: "Notificado quando você é mencionado", Icon: IconBell },
                  { value: "nothing", label: "Nenhuma", desc: "Sem notificações neste canal", Icon: IconBellOff },
                ] as { value: NotifSetting; label: string; desc: string; Icon: typeof IconBell }[]
              ).map(({ value, label, desc, Icon }) => (
                <button
                  key={value}
                  type="button"
                  disabled={notifPending}
                  onClick={() => setNotifPref(value)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors text-left",
                    notifPref === value
                      ? "border-primary bg-primary/5 text-foreground"
                      : "hover:bg-muted text-muted-foreground",
                  )}
                >
                  <Icon size={16} className={cn("shrink-0", notifPref === value && "text-primary")} />
                  <span className="flex-1 min-w-0">
                    <span className="block font-medium">{label}</span>
                    <span className="block text-xs text-muted-foreground">{desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Danger zone */}
          {canEdit && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium text-red-500">Zona de perigo</Label>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-1.5">
                      <IconArchive className="h-3.5 w-3.5" />
                      Arquivar Canal
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Arquivar canal?</AlertDialogTitle>
                      <AlertDialogDescription>
                        O canal &quot;{channel.name}&quot; será arquivado e não aparecerá mais na lista. As mensagens serão preservadas.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleArchive}>Arquivar</AlertDialogAction>
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
