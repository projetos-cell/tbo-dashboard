"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface UserOption {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  email?: string | null;
}

interface UserSelectorSingleProps {
  mode: "single";
  selected: string | null;
  onChange: (id: string | null) => void;
  users: UserOption[];
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

interface UserSelectorMultiProps {
  mode: "multi";
  selected: string[];
  onChange: (ids: string[]) => void;
  users: UserOption[];
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

type UserSelectorProps = UserSelectorSingleProps | UserSelectorMultiProps;

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

function UserAvatar({ user, size = "sm" }: { user: UserOption; size?: "sm" | "xs" }) {
  const sz = size === "xs" ? "h-5 w-5 text-[9px]" : "h-6 w-6 text-[10px]";
  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.full_name}
        className={cn("rounded-full object-cover", sz)}
      />
    );
  }
  return (
    <span className={cn("flex items-center justify-center rounded-full bg-tbo-orange/15 font-semibold text-tbo-orange", sz)}>
      {initials(user.full_name)}
    </span>
  );
}

export function UserSelector(props: UserSelectorProps) {
  const { users, className, placeholder = "Selecionar", disabled } = props;
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    if (open) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  const filtered = search
    ? users.filter((u) => u.full_name.toLowerCase().includes(search.toLowerCase()))
    : users;

  const isSelected = (id: string) => {
    if (props.mode === "single") return props.selected === id;
    return (props.selected as string[]).includes(id);
  };

  const handleSelect = (id: string) => {
    if (props.mode === "single") {
      props.onChange(props.selected === id ? null : id);
      setOpen(false);
    } else {
      const cur = props.selected as string[];
      props.onChange(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
    }
  };

  const selectedUsers =
    props.mode === "single"
      ? users.filter((u) => u.id === props.selected)
      : users.filter((u) => (props.selected as string[]).includes(u.id));

  return (
    <div ref={ref} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cn(
          "flex min-h-[2rem] w-full items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-sm shadow-sm transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        {selectedUsers.length > 0 ? (
          <span className="flex items-center gap-1 flex-wrap">
            {selectedUsers.map((u) => (
              <span key={u.id} className="flex items-center gap-1">
                <UserAvatar user={u} size="xs" />
                {props.mode === "single" && (
                  <span className="text-xs truncate max-w-[120px]">{u.full_name}</span>
                )}
              </span>
            ))}
            {props.mode === "multi" && selectedUsers.length > 0 && (
              <span className="text-xs text-gray-500">
                {selectedUsers.length === 1
                  ? selectedUsers[0].full_name
                  : `${selectedUsers.length} selecionados`}
              </span>
            )}
          </span>
        ) : (
          <span className="text-gray-500 text-xs">{placeholder}</span>
        )}
        <svg className="ml-auto h-3.5 w-3.5 flex-shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full min-w-[200px] rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="p-2 border-b border-gray-200">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-tbo-orange"
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-2 py-3 text-center text-xs text-gray-500">Nenhum usuário encontrado</p>
            ) : (
              filtered.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelect(user.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-gray-100",
                    isSelected(user.id) && "bg-gray-100/60 font-medium"
                  )}
                >
                  <UserAvatar user={user} />
                  <span className="truncate">{user.full_name}</span>
                  {isSelected(user.id) && (
                    <svg className="ml-auto h-3.5 w-3.5 text-tbo-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
