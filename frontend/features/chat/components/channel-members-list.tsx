"use client";

import { IconShield, IconShieldCheck, IconUserMinus } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChannelMember {
  user_id: string;
  role?: string | null;
}

interface ChannelMembersListProps {
  members: ChannelMember[];
  isLoading: boolean;
  currentUserId: string | undefined;
  canEdit: boolean;
  profileName: (uid: string) => string;
  onToggleRole: (memberId: string, currentRole: string) => void;
  onRemoveMember: (memberId: string) => void;
}

export function ChannelMembersList({
  members,
  isLoading,
  currentUserId,
  canEdit,
  profileName,
  onToggleRole,
  onRemoveMember,
}: ChannelMembersListProps) {
  if (isLoading) {
    return <p className="text-xs text-muted-foreground">Carregando...</p>;
  }

  return (
    <ScrollArea className="h-52 rounded border">
      <div className="p-1">
        {members.map((m) => {
          const isMe = m.user_id === currentUserId;
          const name = profileName(m.user_id);
          const isAdmin = m.role === "admin";

          return (
            <div
              key={m.user_id}
              className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50 transition-colors"
            >
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium shrink-0">
                {name.charAt(0).toUpperCase()}
              </div>
              <span className="truncate flex-1">{name}</span>
              {isMe && (
                <span className="text-[10px] text-muted-foreground">(você)</span>
              )}
              <Badge variant={isAdmin ? "default" : "outline"} className="text-[10px] h-5 px-1.5">
                {isAdmin ? "admin" : "membro"}
              </Badge>
              {canEdit && !isMe && (
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    title={isAdmin ? "Rebaixar para membro" : "Promover a admin"}
                    onClick={() => onToggleRole(m.user_id, m.role ?? "member")}
                  >
                    {isAdmin ? (
                      <IconShield className="h-3 w-3" />
                    ) : (
                      <IconShieldCheck className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:text-red-500"
                    title="Remover do canal"
                    onClick={() => onRemoveMember(m.user_id)}
                  >
                    <IconUserMinus className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
