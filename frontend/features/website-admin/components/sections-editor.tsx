"use client";

import { useState, useEffect } from "react";
import {
  IconLayoutDashboard,
  IconInfoCircle,
  IconBriefcase,
  IconMail,
  IconPlus,
  IconEye,
  IconEyeOff,
  IconChevronDown,
  IconChevronUp,
  IconPhoto,
  IconLink,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  useWebsiteSections,
  useUpdateWebsiteSection,
  useSeedDefaultSections,
} from "../hooks/use-website-sections";
import { PAGE_LABELS } from "../types";
import type { WebsiteSection } from "../types";

const PAGE_ICONS: Record<string, React.ReactNode> = {
  home: <IconLayoutDashboard className="h-4 w-4" />,
  about: <IconInfoCircle className="h-4 w-4" />,
  services: <IconBriefcase className="h-4 w-4" />,
  contact: <IconMail className="h-4 w-4" />,
};

const PAGES = ["home", "about", "services", "contact"];

export function SectionsEditor() {
  const [activePage, setActivePage] = useState("home");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Seções do Site</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Edite o conteúdo de cada página diretamente aqui
        </p>
      </div>

      <Tabs value={activePage} onValueChange={setActivePage}>
        <TabsList className="w-full justify-start">
          {PAGES.map((page) => (
            <TabsTrigger key={page} value={page} className="gap-1.5">
              {PAGE_ICONS[page]}
              {PAGE_LABELS[page] ?? page}
            </TabsTrigger>
          ))}
        </TabsList>

        {PAGES.map((page) => (
          <TabsContent key={page} value={page} className="mt-4">
            <PageSections page={page} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function PageSections({ page }: { page: string }) {
  const { data: sections, isLoading } = useWebsiteSections(page);
  const seed = useSeedDefaultSections();

  // Auto-seed default sections if page has none
  useEffect(() => {
    if (!isLoading && sections && sections.length === 0) {
      seed.mutate(page);
    }
  }, [isLoading, sections, page, seed]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Carregando seções padrão...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <SectionCard key={section.id} section={section} />
      ))}
    </div>
  );
}

function SectionCard({ section }: { section: WebsiteSection }) {
  const [isOpen, setIsOpen] = useState(false);
  const update = useUpdateWebsiteSection();

  const [title, setTitle] = useState(section.title ?? "");
  const [subtitle, setSubtitle] = useState(section.subtitle ?? "");
  const [mediaUrl, setMediaUrl] = useState(section.media_url ?? "");
  const [ctaLabel, setCtaLabel] = useState(section.cta_label ?? "");
  const [ctaUrl, setCtaUrl] = useState(section.cta_url ?? "");
  const [bodyText, setBodyText] = useState(
    (section.content as Record<string, string>)?.body ?? "",
  );
  const [isVisible, setIsVisible] = useState(section.is_visible);

  const isDirty =
    title !== (section.title ?? "") ||
    subtitle !== (section.subtitle ?? "") ||
    mediaUrl !== (section.media_url ?? "") ||
    ctaLabel !== (section.cta_label ?? "") ||
    ctaUrl !== (section.cta_url ?? "") ||
    bodyText !== ((section.content as Record<string, string>)?.body ?? "") ||
    isVisible !== section.is_visible;

  const handleSave = () => {
    update.mutate({
      id: section.id,
      data: {
        title: title || null,
        subtitle: subtitle || null,
        media_url: mediaUrl || null,
        cta_label: ctaLabel || null,
        cta_url: ctaUrl || null,
        content: { ...(section.content as Record<string, unknown>), body: bodyText },
        is_visible: isVisible,
      },
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border bg-card overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {isVisible ? (
                  <IconEye className="h-4 w-4 text-green-500" />
                ) : (
                  <IconEyeOff className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium text-sm">
                  {section.title ?? section.section_key}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                {section.section_key}
              </span>
              {isDirty && (
                <span className="text-[10px] text-amber-500 font-medium">
                  alterado
                </span>
              )}
            </div>
            {isOpen ? (
              <IconChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <IconChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t p-4 space-y-4">
            {/* Visibility toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-sm">Visível no site</Label>
              <Switch
                checked={isVisible}
                onCheckedChange={setIsVisible}
              />
            </div>

            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Título</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título da seção"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Subtítulo</Label>
                <Input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Subtítulo ou tagline"
                />
              </div>
            </div>

            {/* Body content */}
            <div className="space-y-1.5">
              <Label className="text-xs">Conteúdo</Label>
              <Textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Texto principal da seção..."
                className="min-h-[100px]"
              />
            </div>

            {/* Media & CTA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <IconPhoto className="h-3 w-3" />
                  URL da Imagem/Mídia
                </Label>
                <Input
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <IconLink className="h-3 w-3" />
                  CTA
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                    placeholder="Texto do botão"
                    className="flex-1"
                  />
                  <Input
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="URL"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Save */}
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={!isDirty || update.isPending}
              >
                {update.isPending ? "Salvando..." : "Salvar seção"}
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
