"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  IconEdit,
  IconMail,
  IconPhone,
  IconMapPin,
} from "@tabler/icons-react"
import { ROLE_LABELS, ROLE_COLORS, STATUS_LABELS, STATUS_COLORS, type User } from "../types"
import { getInitials } from "../utils/get-initials"

interface ProfileHeaderProps {
  user: User
  onEdit?: () => void
}

export function ProfileHeader({ user, onEdit }: ProfileHeaderProps) {
  const completionRate =
    user.stats.tasks > 0
      ? Math.round((user.stats.completedTasks / user.stats.tasks) * 100)
      : 0

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-20 w-20">
            {user.avatar && <AvatarImage src={user.avatar} />}
            <AvatarFallback className="text-lg font-medium">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <h2 className="mt-3 text-lg font-semibold">{user.name}</h2>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="outline" className={ROLE_COLORS[user.role]}>
              {ROLE_LABELS[user.role]}
            </Badge>
            <div className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${STATUS_COLORS[user.status]}`}
              />
              <span className="text-xs text-muted-foreground">
                {STATUS_LABELS[user.status]}
              </span>
            </div>
          </div>
          {user.cargo && (
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {user.cargo}
            </p>
          )}
          <p className="mt-0.5 text-xs text-muted-foreground">
            {user.department}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x text-center">
          <div>
            <p className="text-lg font-semibold">{user.stats.projects}</p>
            <p className="text-xs text-muted-foreground">Projetos</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{user.stats.tasks}</p>
            <p className="text-xs text-muted-foreground">Tarefas</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">Conclusão</p>
          </div>
        </div>

        {/* Contact info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <IconMail className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-2 text-sm">
              <IconPhone className="h-4 w-4 text-muted-foreground" />
              <span>{user.phone}</span>
            </div>
          )}
          {user.location && (
            <div className="flex items-center gap-2 text-sm">
              <IconMapPin className="h-4 w-4 text-muted-foreground" />
              <span>{user.location}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" size="sm" onClick={onEdit}>
            <IconEdit className="mr-1.5 h-4 w-4" />
            Editar Perfil
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`mailto:${user.email}`}>
              <IconMail className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
