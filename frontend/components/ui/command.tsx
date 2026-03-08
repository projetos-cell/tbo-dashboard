"use client"

import * as React from "react"
import { SearchIcon, CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  InputGroup,
  InputGroupAddon,
} from "@/components/ui/input-group"

// ─── Context ──────────────────────────────────────────────────────────────────

type CommandCtxValue = {
  search: string
  setSearch: React.Dispatch<React.SetStateAction<string>>
  filter: (value: string, search: string) => boolean
  selectedId: string | null
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>
  // null = not yet counted (prevents flash on initial mount)
  visibleCount: number | null
  setVisibleCount: React.Dispatch<React.SetStateAction<number | null>>
}

const CommandCtx = React.createContext<CommandCtxValue | null>(null)

function useCommandCtx() {
  const ctx = React.useContext(CommandCtx)
  if (!ctx) throw new Error("Command components must be used within <Command>")
  return ctx
}

// ─── Command ──────────────────────────────────────────────────────────────────

type CommandProps = React.ComponentProps<"div"> & {
  filter?: (value: string, search: string) => boolean
  shouldFilter?: boolean
}

function Command({
  className,
  children,
  filter: filterProp,
  shouldFilter = true,
  ...props
}: CommandProps) {
  const [search, setSearch] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [visibleCount, setVisibleCount] = React.useState<number | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const defaultFilter = React.useCallback(
    (value: string, s: string) => !s || value.toLowerCase().includes(s.toLowerCase()),
    []
  )
  const passThrough = React.useCallback(() => true, [])
  const filter = shouldFilter ? (filterProp ?? defaultFilter) : passThrough

  // Reset selection when search changes
  React.useEffect(() => {
    setSelectedId(null)
  }, [search])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!containerRef.current) return
      const items = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(
          '[data-slot="command-item"]:not([data-disabled="true"])'
        )
      )
      if (!items.length) return

      const currentIdx = items.findIndex((el) => el.dataset.selected === "true")

      if (e.key === "ArrowDown") {
        e.preventDefault()
        const next = items[currentIdx === -1 ? 0 : Math.min(currentIdx + 1, items.length - 1)]
        setSelectedId(next?.id ?? null)
        next?.scrollIntoView({ block: "nearest" })
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        const next = items[currentIdx <= 0 ? items.length - 1 : currentIdx - 1]
        setSelectedId(next?.id ?? null)
        next?.scrollIntoView({ block: "nearest" })
      } else if (e.key === "Enter" && currentIdx !== -1) {
        e.preventDefault()
        items[currentIdx]?.click()
      }
    },
    []
  )

  return (
    <CommandCtx.Provider
      value={{ search, setSearch, filter, selectedId, setSelectedId, visibleCount, setVisibleCount }}
    >
      <div
        ref={containerRef}
        data-slot="command"
        className={cn(
          "bg-popover text-popover-foreground flex size-full flex-col overflow-hidden rounded-xl! p-1",
          className
        )}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    </CommandCtx.Provider>
  )
}

// ─── CommandDialog ────────────────────────────────────────────────────────────

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = false,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, "children"> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
  children: React.ReactNode
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn(
          "top-1/3 translate-y-0 overflow-hidden rounded-xl! p-0",
          className
        )}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

// ─── CommandInput ─────────────────────────────────────────────────────────────

type CommandInputProps = Omit<React.ComponentProps<"input">, "onChange"> & {
  value?: string
  onValueChange?: (value: string) => void
}

function CommandInput({ className, value, onValueChange, ...props }: CommandInputProps) {
  const { setSearch } = useCommandCtx()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setSearch(v)
    onValueChange?.(v)
  }

  return (
    <div data-slot="command-input-wrapper" className="p-1 pb-0">
      <InputGroup className="bg-input/30 border-input/30 h-8! rounded-lg! shadow-none! *:data-[slot=input-group-addon]:pl-2!">
        <input
          data-slot="command-input"
          className={cn(
            "w-full text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          value={value}
          onChange={handleChange}
          {...props}
        />
        <InputGroupAddon>
          <SearchIcon className="size-4 shrink-0 opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

// ─── CommandList ──────────────────────────────────────────────────────────────

function CommandList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command-list"
      className={cn(
        "no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none",
        className
      )}
      {...props}
    />
  )
}

// ─── CommandEmpty ─────────────────────────────────────────────────────────────

function CommandEmpty({ className, ...props }: React.ComponentProps<"div">) {
  const { visibleCount } = useCommandCtx()

  // null = initial state before items are counted; treat as "has items"
  if (visibleCount === null || visibleCount > 0) return null

  return (
    <div
      data-slot="command-empty"
      className={cn("py-6 text-center text-sm", className)}
      {...props}
    />
  )
}

// ─── CommandGroup ─────────────────────────────────────────────────────────────

type CommandGroupProps = React.ComponentProps<"div"> & {
  heading?: React.ReactNode
}

function CommandGroup({ className, children, heading, ...props }: CommandGroupProps) {
  return (
    <div
      data-slot="command-group"
      className={cn("text-foreground overflow-hidden p-1", className)}
      {...props}
    >
      {heading && (
        <div
          data-slot="command-group-heading"
          className="text-muted-foreground px-2 py-1.5 text-xs font-medium"
        >
          {heading}
        </div>
      )}
      {children}
    </div>
  )
}

// ─── CommandSeparator ─────────────────────────────────────────────────────────

function CommandSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  )
}

// ─── CommandItem ──────────────────────────────────────────────────────────────

type CommandItemProps = React.ComponentProps<"div"> & {
  value?: string
  disabled?: boolean
  onSelect?: (value: string) => void
  keywords?: string[]
}

function CommandItem({
  className,
  children,
  value = "",
  disabled = false,
  onSelect,
  keywords = [],
  ...props
}: CommandItemProps) {
  const { filter, search, selectedId, setSelectedId, setVisibleCount } = useCommandCtx()
  const id = React.useId()

  const matches = !disabled && [value, ...keywords].some((term) => filter(term, search))
  const isSelected = selectedId === id

  // Track visibility for CommandEmpty using layout effect so there's no flash
  React.useLayoutEffect(() => {
    if (disabled) return
    setVisibleCount((prev) => (prev === null ? (matches ? 1 : 0) : prev + (matches ? 1 : 0)))
    return () => {
      setVisibleCount((prev) => (prev === null ? null : prev - (matches ? 1 : 0)))
    }
  }, [matches, disabled, setVisibleCount])

  if (!matches) return null

  return (
    <div
      id={id}
      data-slot="command-item"
      data-selected={isSelected ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      className={cn(
        "data-[selected]:bg-muted data-[selected]:text-foreground data-[selected]:*:[svg]:text-foreground group/command-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none in-data-[slot=dialog-content]:rounded-lg! data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      aria-disabled={disabled}
      onClick={() => {
        if (!disabled) {
          setSelectedId(id)
          onSelect?.(value)
        }
      }}
      onMouseEnter={() => {
        if (!disabled) setSelectedId(id)
      }}
      {...props}
    >
      {children}
      <CheckIcon className="ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100" />
    </div>
  )
}

// ─── CommandShortcut ──────────────────────────────────────────────────────────

function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground group-data-[selected=true]/command-item:text-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
