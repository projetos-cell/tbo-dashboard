"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { IconCheck, IconCircle } from "@tabler/icons-react"
import type { User } from "../types"

interface ProfileCompletionProps {
  user: User
}

interface CheckItem {
  label: string
  completed: boolean
}

function getChecklist(user: User): CheckItem[] {
  return [
    { label: "Foto de perfil", completed: !!user.avatar },
    { label: "Telefone", completed: !!user.phone },
    { label: "Localização", completed: !!user.location },
    { label: "Bio", completed: !!user.bio },
    { label: "Skills (3+)", completed: user.skills.length >= 3 },
    { label: "Email verificado", completed: true },
  ]
}

export function ProfileCompletion({ user }: ProfileCompletionProps) {
  const checklist = getChecklist(user)
  const completed = checklist.filter((c) => c.completed).length
  const total = checklist.length
  const percentage = Math.round((completed / total) * 100)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Completude do Perfil
          </CardTitle>
          <span className="text-sm font-semibold">{percentage}%</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={percentage} />
        <ul className="space-y-2">
          {checklist.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-2 text-sm"
            >
              {item.completed ? (
                <IconCheck className="h-4 w-4 text-green-500" />
              ) : (
                <IconCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span
                className={
                  item.completed ? "text-muted-foreground" : "font-medium"
                }
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
