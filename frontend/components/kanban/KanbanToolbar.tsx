"use client";

import { useState } from "react";
import { IconSearch, IconAdjustmentsHorizontal, IconPlus, IconUserPlus } from "@tabler/icons-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AssignUsersDialog } from "./AssignUsersDialog";

// ---------------------------------------------------------------------------
// Filter config
// ---------------------------------------------------------------------------

const STATUS_OPTIONS = [
  { id: "completed", label: "Completed" },
  { id: "in-progress", label: "In Progress" },
  { id: "not-started", label: "Not Started" },
];

const PRIORITY_OPTIONS = [
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
];

const ASSIGNEE_OPTIONS = [
  {
    id: "marco",
    label: "Marco Aurélio",
    avatarUrl: "https://ui-avatars.com/api/?name=Marco+Aurelio&background=F97316&color=fff",
  },
  {
    id: "ana",
    label: "Ana Beatriz",
    avatarUrl: "https://ui-avatars.com/api/?name=Ana+Beatriz&background=F97316&color=fff",
  },
  {
    id: "rafael",
    label: "Rafael Torres",
    avatarUrl: "https://ui-avatars.com/api/?name=Rafael+Torres&background=111827&color=fff",
  },
];

// Mock members shown in the avatar stack
const MEMBER_AVATARS = [
  {
    name: "Marco Aurélio",
    url: "https://ui-avatars.com/api/?name=Marco+Aurelio&background=F97316&color=fff",
  },
  {
    name: "Ana Beatriz",
    url: "https://ui-avatars.com/api/?name=Ana+Beatriz&background=6366F1&color=fff",
  },
  {
    name: "Rafael Torres",
    url: "https://ui-avatars.com/api/?name=Rafael+Torres&background=111827&color=fff",
  },
  {
    name: "Lúcia Menezes",
    url: "https://ui-avatars.com/api/?name=Lucia+Menezes&background=10B981&color=fff",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function KanbanToolbar() {
  const [search, setSearch] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  return (
    <div className="flex items-center justify-between gap-3">
      {/* ------------------------------------------------------------------ */}
      {/* Left — Search                                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative w-64">
        <IconSearch className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="h-9 pl-8 text-sm"
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Right — avatar stack + controls                                      */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center gap-2">
        {/* Avatar stack + extra count */}
        <div className="flex items-center">
          {MEMBER_AVATARS.map((m, i) => (
            <Avatar
              key={m.name}
              className="ring-background h-7 w-7 ring-2"
              style={{ marginLeft: i === 0 ? 0 : "-8px" }}
              title={m.name}
            >
              <AvatarImage src={m.url} alt={m.name} />
              <AvatarFallback className="text-[10px]">
                {m.name
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          ))}
          <Badge variant="secondary" className="ml-1 h-5 min-w-[24px] rounded-full px-1.5 text-xs tabular-nums">
            +5
          </Badge>
        </div>

        {/* Add Assignee */}
        <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => setAssignDialogOpen(true)}>
          <IconUserPlus className="h-3.5 w-3.5" />
          Add Assignee
        </Button>

        {/* Filters — Popover with search + categories */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <IconAdjustmentsHorizontal className="h-3.5 w-3.5" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-0" sideOffset={6}>
            {/* Filter search */}
            <div className="p-3">
              <div className="relative">
                <IconSearch className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
                <Input
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  placeholder="Search filters..."
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>

            <Separator />

            {/* Status */}
            <div className="p-3">
              <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wide uppercase">Status</p>
              <div className="flex flex-col gap-2">
                {STATUS_OPTIONS.filter((o) => o.label.toLowerCase().includes(filterSearch.toLowerCase())).map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <Checkbox id={`status-${opt.id}`} />
                    <Label htmlFor={`status-${opt.id}`} className="cursor-pointer text-sm font-normal">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Priority */}
            <div className="p-3">
              <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wide uppercase">Priority</p>
              <div className="flex flex-col gap-2">
                {PRIORITY_OPTIONS.filter((o) => o.label.toLowerCase().includes(filterSearch.toLowerCase())).map(
                  (opt) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <Checkbox id={`priority-${opt.id}`} />
                      <Label htmlFor={`priority-${opt.id}`} className="cursor-pointer text-sm font-normal">
                        {opt.label}
                      </Label>
                    </div>
                  ),
                )}
              </div>
            </div>

            <Separator />

            {/* Assigned To */}
            <div className="p-3">
              <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wide uppercase">
                Assigned To
              </p>
              <div className="flex flex-col gap-2">
                {ASSIGNEE_OPTIONS.filter((o) => o.label.toLowerCase().includes(filterSearch.toLowerCase())).map(
                  (opt) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <Checkbox id={`assignee-${opt.id}`} />
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={opt.avatarUrl} alt={opt.label} />
                        <AvatarFallback className="text-[8px]">
                          {opt.label
                            .split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <Label htmlFor={`assignee-${opt.id}`} className="cursor-pointer text-sm font-normal">
                        {opt.label}
                      </Label>
                    </div>
                  ),
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Add Board — dark/primary */}
        <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 h-9 gap-1.5">
          <IconPlus className="h-3.5 w-3.5" />
          Add Board
        </Button>
      </div>

      {/* Assign Users Dialog */}
      <AssignUsersDialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen} />
    </div>
  );
}
