"use client"

import * as React from "react"
import { IconCheck, IconSelector, IconX } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface UserOption {
  id: string
  full_name: string
  avatar_url?: string | null
}

interface UserSelectorSingle {
  mode: "single"
  selected: string | null
  onChange: (id: string | null) => void
  users: UserOption[]
  placeholder?: string
  className?: string
}

interface UserSelectorMulti {
  mode: "multi"
  selected: string[]
  onChange: (ids: string[]) => void
  users: UserOption[]
  placeholder?: string
  className?: string
}

type UserSelectorProps = UserSelectorSingle | UserSelectorMulti

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function UserSelector(props: UserSelectorProps) {
  const { mode, users, placeholder = "Selecionar usuário", className } = props
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const selectedIds: string[] =
    mode === "single"
      ? props.selected
        ? [props.selected]
        : []
      : props.selected

  const filtered = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (id: string) => {
    if (mode === "single") {
      props.onChange(props.selected === id ? null : id)
      setOpen(false)
    } else {
      const next = selectedIds.includes(id)
        ? selectedIds.filter((s) => s !== id)
        : [...selectedIds, id]
      props.onChange(next)
    }
  }

  const removeOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (mode === "single") {
      props.onChange(null)
    } else {
      props.onChange(selectedIds.filter((s) => s !== id))
    }
  }

  const selectedUsers = selectedIds
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean) as UserOption[]

  const triggerLabel =
    selectedUsers.length === 0 ? (
      <span className="text-muted-foreground">{placeholder}</span>
    ) : mode === "single" ? (
      <div className="flex items-center gap-1.5 min-w-0">
        <Avatar className="size-5 shrink-0">
          <AvatarImage src={selectedUsers[0].avatar_url ?? undefined} />
          <AvatarFallback className="text-[10px]">
            {getInitials(selectedUsers[0].full_name)}
          </AvatarFallback>
        </Avatar>
        <span className="truncate text-sm">{selectedUsers[0].full_name}</span>
      </div>
    ) : (
      <div className="flex items-center gap-1 flex-wrap min-w-0">
        {selectedUsers.slice(0, 3).map((u) => (
          <span
            key={u.id}
            className="inline-flex items-center gap-0.5 bg-muted rounded px-1 py-0.5 text-xs"
          >
            {u.full_name.split(" ")[0]}
            <button
              type="button"
              onClick={(e) => removeOne(u.id, e)}
              className="ml-0.5 hover:text-destructive"
            >
              <IconX className="size-2.5" />
            </button>
          </span>
        ))}
        {selectedUsers.length > 3 && (
          <span className="text-xs text-muted-foreground">
            +{selectedUsers.length - 3}
          </span>
        )}
      </div>
    )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between gap-1.5 font-normal", className)}
        >
          <span className="min-w-0 flex-1 text-left">{triggerLabel}</span>
          <IconSelector className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <div className="p-2 border-b">
          <input
            autoFocus
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-48 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-3">
              Nenhum resultado
            </p>
          ) : (
            filtered.map((user) => {
              const isSelected = selectedIds.includes(user.id)
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggle(user.id)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-sm hover:bg-muted/60 transition-colors"
                >
                  <Avatar className="size-6 shrink-0">
                    <AvatarImage src={user.avatar_url ?? undefined} />
                    <AvatarFallback className="text-[10px]">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-left truncate">{user.full_name}</span>
                  {isSelected && (
                    <IconCheck className="size-3.5 text-primary shrink-0" />
                  )}
                </button>
              )
            })
          )}
        </div>
        {mode === "multi" && selectedIds.length > 0 && (
          <div className="border-t p-1.5">
            <button
              type="button"
              onClick={() => props.onChange([])}
              className="w-full text-xs text-muted-foreground hover:text-foreground text-center py-1"
            >
              Limpar seleção
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
