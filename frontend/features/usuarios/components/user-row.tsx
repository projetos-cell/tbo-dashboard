"use client"

import { useState } from "react"
import Link from "next/link"
import {
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  IconDotsVertical,
  IconUser,
  IconEdit,
  IconBan,
  IconCheck,
  IconTrash,
} from "@tabler/icons-react"
import { useToast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { ROLE_LABELS, ROLE_COLORS, STATUS_LABELS, STATUS_COLORS, type User } from "../types"
import { formatRelativeDate } from "../utils/format-date"

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

interface UserRowProps {
  user: User
  selected: boolean
  onToggle: () => void
}

export function UserRow({ user, selected, onToggle }: UserRowProps) {
  const { toast } = useToast()
  const [confirmSuspend, setConfirmSuspend] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleEdit() {
    toast({
      title: "Edição em breve",
      description: "A edição de perfil será implementada em breve.",
    })
  }

  function handleSuspend() {
    const action = user.status === "suspenso" ? "ativado" : "suspenso"
    toast({
      title: `Usuário ${action}`,
      description: `${user.name} foi ${action} com sucesso.`,
    })
    setConfirmSuspend(false)
  }

  function handleDelete() {
    toast({
      title: "Usuário removido",
      description: `${user.name} foi removido do sistema.`,
      variant: "destructive",
    })
    setConfirmDelete(false)
  }

  return (
    <>
      {/* Dialogs render via portal — safe inside table context */}
      <ConfirmDialog
        open={confirmSuspend}
        onOpenChange={setConfirmSuspend}
        title={user.status === "suspenso" ? "Ativar usuário?" : "Suspender usuário?"}
        description={
          user.status === "suspenso"
            ? `${user.name} voltará a ter acesso ao sistema.`
            : `${user.name} perderá o acesso ao sistema. Você pode reverter isso a qualquer momento.`
        }
        confirmLabel={user.status === "suspenso" ? "Ativar" : "Suspender"}
        variant={user.status === "suspenso" ? "default" : "destructive"}
        onConfirm={handleSuspend}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Excluir usuário?"
        description={`Esta ação não pode ser desfeita. ${user.name} será removido permanentemente do sistema.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDelete}
      />

      <TableRow className="group transition-colors hover:bg-muted/50">
        <TableCell>
          <Checkbox
            checked={selected}
            onCheckedChange={onToggle}
            aria-label={`Selecionar ${user.name}`}
          />
        </TableCell>
        <TableCell>
          <Link href={`/usuarios/${user.id}`} className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              {user.avatar && <AvatarImage src={user.avatar} />}
              <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </Link>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={ROLE_COLORS[user.role]}>
            {ROLE_LABELS[user.role]}
          </Badge>
        </TableCell>
        <TableCell className="text-sm">{user.department}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[user.status]}`} />
            <span className="text-sm">{STATUS_LABELS[user.status]}</span>
          </div>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {formatRelativeDate(user.lastActive)}
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
              >
                <IconDotsVertical className="h-4 w-4" />
                <span className="sr-only">Ações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/usuarios/${user.id}`}>
                  <IconUser className="mr-2 h-4 w-4" />
                  Ver Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <IconEdit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setConfirmSuspend(true)}>
                {user.status === "suspenso" ? (
                  <>
                    <IconCheck className="mr-2 h-4 w-4" />
                    Ativar
                  </>
                ) : (
                  <>
                    <IconBan className="mr-2 h-4 w-4" />
                    Suspender
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    </>
  )
}
