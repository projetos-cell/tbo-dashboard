"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { User } from "../types"

interface ProfileSkillsProps {
  user: User
}

export function ProfileSkills({ user }: ProfileSkillsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Skills</CardTitle>
      </CardHeader>
      <CardContent>
        {user.skills.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma skill adicionada.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
