"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";

// ---------------------------------------------------------------------------
// Mock users
// ---------------------------------------------------------------------------

const MOCK_USERS = [
  {
    id: "marco",
    name: "Marco Aurélio",
    email: "marco@tbo.com",
    avatarUrl: "https://ui-avatars.com/api/?name=Marco+Aurelio&background=F97316&color=fff",
  },
  {
    id: "ana",
    name: "Ana Beatriz",
    email: "ana@tbo.com",
    avatarUrl: "https://ui-avatars.com/api/?name=Ana+Beatriz&background=6366F1&color=fff",
  },
  {
    id: "rafael",
    name: "Rafael Torres",
    email: "rafael@tbo.com",
    avatarUrl: "https://ui-avatars.com/api/?name=Rafael+Torres&background=111827&color=fff",
  },
  {
    id: "lucia",
    name: "Lúcia Menezes",
    email: "lucia@tbo.com",
    avatarUrl: "https://ui-avatars.com/api/?name=Lucia+Menezes&background=10B981&color=fff",
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AssignUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AssignUsersDialog({ open, onOpenChange }: AssignUsersDialogProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = MOCK_USERS.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()),
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleAssign() {
    // TODO: persist assignments to Supabase
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Assign Users</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user..."
            className="pl-8"
          />
        </div>

        {/* User list */}
        <div className="flex flex-col gap-1">
          {filtered.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => toggle(user.id)}
              className="hover:bg-muted flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors"
            >
              <Checkbox
                checked={selected.has(user.id)}
                onCheckedChange={() => toggle(user.id)}
                onClick={(e) => e.stopPropagation()}
              />
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="text-xs">
                  {user.name
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm leading-tight font-medium">{user.name}</p>
                <p className="text-muted-foreground truncate text-xs">{user.email}</p>
              </div>
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={selected.size === 0}>
            Assign{selected.size > 0 ? ` (${selected.size})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
