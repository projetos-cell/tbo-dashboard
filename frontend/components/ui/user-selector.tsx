"use client";

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export interface UserOption {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

interface UserSelectorSingleProps {
  mode: "single";
  selected: string | null;
  onChange: (userId: string | null) => void;
  users: UserOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface UserSelectorMultiProps {
  mode: "multi";
  selected: string[];
  onChange: (userIds: string[]) => void;
  users: UserOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

type UserSelectorProps = UserSelectorSingleProps | UserSelectorMultiProps;

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserSelector(props: UserSelectorProps) {
  const { users, placeholder = "Selecionar...", className, disabled } = props;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const selectedUsers = useMemo(() => {
    const ids =
      props.mode === "single"
        ? props.selected
          ? [props.selected]
          : []
        : props.selected;
    return ids.map((id) => users.find((u) => u.id === id)).filter(Boolean) as UserOption[];
  }, [props, users]);

  const handleSelect = (userId: string) => {
    if (props.mode === "single") {
      props.onChange(props.selected === userId ? null : userId);
      setOpen(false);
    } else {
      const isSelected = props.selected.includes(userId);
      props.onChange(
        isSelected
          ? props.selected.filter((id) => id !== userId)
          : [...props.selected, userId]
      );
    }
  };

  const isSelected = (userId: string) => {
    if (props.mode === "single") return props.selected === userId;
    return props.selected.includes(userId);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "justify-between font-normal",
            !selectedUsers.length && "text-muted-foreground",
            className
          )}
        >
          <span className="flex items-center gap-1.5 truncate">
            {selectedUsers.length === 0 && placeholder}
            {props.mode === "single" && selectedUsers.length === 1 && (
              <UserChip user={selectedUsers[0]} />
            )}
            {props.mode === "multi" && selectedUsers.length > 0 && (
              <span className="flex items-center gap-1 flex-wrap">
                {selectedUsers.slice(0, 3).map((u) => (
                  <Badge key={u.id} variant="secondary" className="gap-1 text-xs py-0">
                    {u.full_name?.split(" ")[0] || u.email}
                    <X
                      className="size-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(u.id);
                      }}
                    />
                  </Badge>
                ))}
                {selectedUsers.length > 3 && (
                  <Badge variant="secondary" className="text-xs py-0">
                    +{selectedUsers.length - 3}
                  </Badge>
                )}
              </span>
            )}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8"
            />
          </div>
        </div>
        <ScrollArea className="max-h-60">
          <div className="p-1">
            {filtered.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhum usuário encontrado
              </p>
            )}
            {filtered.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer",
                  "hover:bg-accent hover:text-accent-foreground",
                  isSelected(user.id) && "bg-accent/50"
                )}
              >
                <Avatar className="size-6">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate text-left">
                  {user.full_name || user.email || "Sem nome"}
                </span>
                {isSelected(user.id) && (
                  <Check className="size-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function UserChip({ user }: { user: UserOption }) {
  return (
    <span className="flex items-center gap-1.5">
      <Avatar className="size-5">
        <AvatarImage src={user.avatar_url || undefined} />
        <AvatarFallback className="text-[9px]">
          {getInitials(user.full_name)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate">{user.full_name || user.email}</span>
    </span>
  );
}
