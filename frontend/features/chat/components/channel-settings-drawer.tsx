"use client";

import { useState, useEffect } from "react";
import { IconArchive, IconBell, IconBellOff, IconBellRinging, IconClock, IconPlus, IconSpeakerphone, IconUpload, IconVolume, IconVolumeOff, IconX } from "@tabler/icons-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { setChannelUploadLimit, DEFAULT_MAX_FILE_SIZE_MB } from "@/features/chat/services/chat-attachments";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

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

  type ChannelSettings = { is_read_only?: boolean; who_can_post?: "everyone" | "admins" };
  const parsedSettings = (channel.settings ?? {}) as ChannelSettings;

  const [name, setName] = useState(channel.name ?? "");
  const [description, setDescription] = useState(channel.description ?? "");
  const [isReadOnly, setIsReadOnly] = useState(parsedSettings.is_read_only ?? false);
  const [whoCanPost, setWhoCanPost] = useState<"everyone" | "admins">(parsedSettings.who_can_post ?? "everyone");
  const [autoArchiveDays, setAutoArchiveDays] = useState(
    String((channel as unknown as { auto_archive_days?: number }).auto_archive_days ?? 0)
  );
  // #42 — Upload limit
  const channelMaxMb = (channel as unknown as { max_file_size_mb?: number | null }).max_file_size_mb;
  const [uploadLimitMb, setUploadLimitMb] = useState(
    String(channelMaxMb ?? DEFAULT_MAX_FILE_SIZE_MB)
  );
  const [savingLimit, setSavingLimit] = useState(false);

  // Reset upload limit when channel changes
  useEffect(() => {
    const mb = (channel as unknown as { max_file_size_mb?: number | null }).max_file_size_mb;
    setUploadLimitMb(String(mb ?? DEFAULT_MAX_FILE_SIZE_MB));
  }, [channel.id]); // eslint-disable-line react-hooks/exhaustive-deps
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
    const newSettings: ChannelSettings = { is_read_only: isReadOnly, who_can_post: isReadOnly ? "admins" : whoCanPost };
    updateChannel.mutate({
      id: channel.id,
      updates: {
        name: name.trim(),
        description: description.trim() || null,
        settings: newSettings,
        auto_archive_days: parseInt(autoArchiveDays, 10),
      } as never,
    });
  }

  async function handleSaveUploadLimit() {
    const mb = parseInt(uploadLimitMb, 10);
    if (isNaN(mb) || mb < 1 || mb > 100) {
      toast.error("Limite inválido. Use entre 1 e 100 MB.");
      return;
    }
    setSavingLimit(true);
    try {
      await setChannelUploadLimit(createClient(), channel.id, mb);
      toast.success(`Limite de upload definido: ${mb} MB`);
    } catch {
      toast.error("Erro ao salvar limite de upload");
    } finally {
      setSavingLimit(false);
    }
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
            {/* #29 — Read-only / Announcement mode (channel type only) */}
            {canEdit && (channel.type === "channel" || channel.type === "private") && (
              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <IconSpeakerphone size={15} className="text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium">Modo somente leitura</span>
                  </div>
                  <Switch
                    checked={isReadOnly}
                    onCheckedChange={setIsReadOnly}
                    aria-label="Ativar modo somente leitura"
                  />
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  {isReadOnly
                    ? "Apenas administradores e criadores podem enviar mensagens."
                    : "Todos os membros podem enviar mensagens."}
                </p>
                {!isReadOnly && (
                  <div className="pl-6 space-y-1">
                    <Label className="text-xs">Quem pode postar</Label>
                    <div className="flex gap-2">
                      {(["everyone", "admins"] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setWhoCanPost(opt)}
                          className={cn(
                            "flex-1 rounded-md border px-2 py-1 text-xs transition-colors text-center",
                            whoCanPost === opt
                              ? "border-primary bg-primary/5 text-foreground font-medium"
                              : "hover:bg-muted text-muted-foreground",
                          )}
                        >
                          {opt === "everyone" ? "Todos" : "Só admins"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* #32 — Auto-archive */}
            {canEdit && (
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm">
                  <IconClock size={14} className="text-muted-foreground" />
                  Auto-arquivar por inatividade
                </Label>
                <Select value={autoArchiveDays} onValueChange={setAutoArchiveDays}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Desativado</SelectItem>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="14">14 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Canal será arquivado automaticamente se não houver novas mensagens neste período.
                </p>
              </div>
            )}
            {/* #42 — Upload limit per channel (founder/diretoria only) */}
            {canEdit && (
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm">
                  <IconUpload size={14} className="text-muted-foreground" />
                  Limite de upload
                </Label>
                <div className="flex gap-2">
                  <Select value={uploadLimitMb} onValueChange={setUploadLimitMb}>
                    <SelectTrigger className="h-9 text-sm flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 MB</SelectItem>
                      <SelectItem value="5">5 MB</SelectItem>
                      <SelectItem value="10">10 MB (padrão)</SelectItem>
                      <SelectItem value="25">25 MB</SelectItem>
                      <SelectItem value="50">50 MB</SelectItem>
                      <SelectItem value="100">100 MB</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveUploadLimit}
                    disabled={savingLimit}
                    className="shrink-0"
                  >
                    {savingLimit ? "..." : "Salvar"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tamanho máximo por arquivo neste canal.
                </p>
              </div>
            )}

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
