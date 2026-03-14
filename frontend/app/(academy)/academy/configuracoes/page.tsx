"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconBell, IconClock, IconTarget } from "@tabler/icons-react"

export default function AcademyConfiguracoesPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Preferências"
        description="Configure sua experiência de aprendizado"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <IconBell className="size-4" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Lembrete diário</Label>
              <p className="text-xs text-muted-foreground">
                Receba um lembrete para estudar todos os dias
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Novos cursos</Label>
              <p className="text-xs text-muted-foreground">
                Seja notificado quando novos cursos forem publicados
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Conquistas</Label>
              <p className="text-xs text-muted-foreground">
                Notificações de medalhas e certificados
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <IconTarget className="size-4" />
            Metas de Aprendizado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Meta semanal de módulos</Label>
            <Select defaultValue="5">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 módulos por semana</SelectItem>
                <SelectItem value="5">5 módulos por semana</SelectItem>
                <SelectItem value="7">7 módulos por semana</SelectItem>
                <SelectItem value="10">10 módulos por semana</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tempo diário de estudo</Label>
            <Select defaultValue="30">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <IconClock className="size-4" />
            Horário Preferido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Melhor horário para estudar</Label>
            <Select defaultValue="morning">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Manhã (8h - 12h)</SelectItem>
                <SelectItem value="afternoon">Tarde (13h - 17h)</SelectItem>
                <SelectItem value="evening">Noite (18h - 22h)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button>Salvar Preferências</Button>
    </div>
  )
}
