"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconClock, IconWorld } from "@tabler/icons-react";
import {
  WorkspaceLogoUpload,
  TIMEZONES,
  type WorkspacePrefs,
} from "./workspace-settings-parts";

interface WorkspaceIdentityCardProps {
  workspace: WorkspacePrefs;
  logoInitials: string;
  uploading: boolean;
  uploadError: string | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChange: (key: keyof WorkspacePrefs, value: string) => void;
  titleIcon: React.ReactNode;
}

export function WorkspaceIdentityCard({
  workspace,
  logoInitials,
  uploading,
  uploadError,
  onUpload,
  onChange,
  titleIcon,
}: WorkspaceIdentityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {titleIcon}
          Identidade do Workspace
        </CardTitle>
        <CardDescription>
          Nome, logo e informações públicas da agência no TBO OS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <WorkspaceLogoUpload
          logoUrl={workspace.logo_url}
          logoInitials={logoInitials}
          uploading={uploading}
          uploadError={uploadError}
          onUpload={onUpload}
        />

        <Separator />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ws_name">Nome da agência</Label>
            <Input
              id="ws_name"
              value={workspace.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Ex: TBO Agência"
              maxLength={80}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ws_tagline">Tagline</Label>
            <Input
              id="ws_tagline"
              value={workspace.tagline}
              onChange={(e) => onChange("tagline", e.target.value)}
              placeholder="Ex: Construindo marcas que importam"
              maxLength={120}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ws_website" className="flex items-center gap-1.5">
              <IconWorld size={12} className="text-muted-foreground" />
              Website
            </Label>
            <Input
              id="ws_website"
              value={workspace.website}
              onChange={(e) => onChange("website", e.target.value)}
              placeholder="https://agenciatbo.com.br"
              type="url"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ws_timezone" className="flex items-center gap-1.5">
              <IconClock size={12} className="text-muted-foreground" />
              Fuso horário
            </Label>
            <Select value={workspace.timezone} onValueChange={(v) => onChange("timezone", v)}>
              <SelectTrigger id="ws_timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
