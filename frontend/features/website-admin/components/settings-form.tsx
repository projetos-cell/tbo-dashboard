"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconDeviceFloppy,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandYoutube,
  IconBrandBehance,
  IconBrandVimeo,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useWebsiteSettings,
  useUpdateWebsiteSettings,
} from "../hooks/use-website-settings";
import {
  websiteSettingsSchema,
  type WebsiteSettingsFormValues,
} from "../schemas/website-schemas";

export function SettingsForm() {
  const { data: settings, isLoading } = useWebsiteSettings();
  const update = useUpdateWebsiteSettings();

  const form = useForm<WebsiteSettingsFormValues>({
    resolver: zodResolver(websiteSettingsSchema) as never,
    defaultValues: {
      site_title: "TBO",
      site_description: "",
      logo_url: null,
      favicon_url: null,
      social_links: {},
      contact_email: null,
      contact_phone: null,
      contact_address: null,
      analytics_id: null,
    },
  });

  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        site_title: settings.site_title,
        site_description: settings.site_description ?? "",
        logo_url: settings.logo_url,
        favicon_url: settings.favicon_url,
        social_links: settings.social_links ?? {},
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        contact_address: settings.contact_address,
        analytics_id: settings.analytics_id,
      });
    }
  }, [settings, form]);

  const onSubmit = (values: WebsiteSettingsFormValues) => {
    update.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dados gerais do site, SEO, contato e redes sociais
          </p>
        </div>
        <Button type="submit" size="sm" disabled={update.isPending}>
          <IconDeviceFloppy className="h-4 w-4 mr-1" />
          {update.isPending ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      {/* Geral */}
      <div className="rounded-lg border p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Geral
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="site_title">Nome do Site</Label>
            <Input id="site_title" {...form.register("site_title")} />
            {form.formState.errors.site_title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.site_title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="analytics_id">Google Analytics ID</Label>
            <Input
              id="analytics_id"
              {...form.register("analytics_id")}
              placeholder="G-XXXXXXXXXX"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="site_description">Descrição do Site (SEO)</Label>
          <Textarea
            id="site_description"
            {...form.register("site_description")}
            placeholder="Descrição geral para mecanismos de busca"
            className="min-h-[80px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="logo_url">URL do Logo</Label>
            <Input
              id="logo_url"
              {...form.register("logo_url")}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="favicon_url">URL do Favicon</Label>
            <Input
              id="favicon_url"
              {...form.register("favicon_url")}
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* Contato */}
      <div className="rounded-lg border p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Contato
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact_email">E-mail</Label>
            <Input
              id="contact_email"
              type="email"
              {...form.register("contact_email")}
              placeholder="contato@wearetbo.com.br"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_phone">Telefone</Label>
            <Input
              id="contact_phone"
              {...form.register("contact_phone")}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_address">Endereço</Label>
          <Textarea
            id="contact_address"
            {...form.register("contact_address")}
            placeholder="Rua, número — Bairro, Cidade/UF"
            className="min-h-[60px]"
          />
        </div>
      </div>

      {/* Redes Sociais */}
      <div className="rounded-lg border p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Redes Sociais
        </h2>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <IconBrandInstagram className="h-5 w-5 text-muted-foreground shrink-0" />
            <Input
              {...form.register("social_links.instagram")}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div className="flex items-center gap-3">
            <IconBrandLinkedin className="h-5 w-5 text-muted-foreground shrink-0" />
            <Input
              {...form.register("social_links.linkedin")}
              placeholder="https://linkedin.com/company/..."
            />
          </div>
          <div className="flex items-center gap-3">
            <IconBrandYoutube className="h-5 w-5 text-muted-foreground shrink-0" />
            <Input
              {...form.register("social_links.youtube")}
              placeholder="https://youtube.com/@..."
            />
          </div>
          <div className="flex items-center gap-3">
            <IconBrandBehance className="h-5 w-5 text-muted-foreground shrink-0" />
            <Input
              {...form.register("social_links.behance")}
              placeholder="https://behance.net/..."
            />
          </div>
          <div className="flex items-center gap-3">
            <IconBrandVimeo className="h-5 w-5 text-muted-foreground shrink-0" />
            <Input
              {...form.register("social_links.vimeo")}
              placeholder="https://vimeo.com/..."
            />
          </div>
        </div>
      </div>
    </form>
  );
}
