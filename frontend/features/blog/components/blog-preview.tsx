"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconDeviceDesktop, IconDeviceTablet, IconDeviceMobile, IconSun, IconMoon } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type PreviewWidth = "desktop" | "tablet" | "mobile";
type PreviewTheme = "light" | "dark";

const WIDTHS: Record<PreviewWidth, string> = {
  desktop: "max-w-3xl",
  tablet: "max-w-[768px]",
  mobile: "max-w-[375px]",
};

interface BlogPreviewProps {
  title: string;
  excerpt: string | null;
  body: string;
  coverUrl: string | null;
  authorName: string | null;
  authorAvatarUrl: string | null;
  publishedAt: string | null;
  tags: string[];
}

export function BlogPreview({
  title,
  excerpt,
  body,
  coverUrl,
  authorName,
  authorAvatarUrl,
  publishedAt,
  tags,
}: BlogPreviewProps) {
  const [width, setWidth] = useState<PreviewWidth>("desktop");
  const [theme, setTheme] = useState<PreviewTheme>("light");
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const initials = authorName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function handleScroll() {
      if (!el) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      const max = scrollHeight - clientHeight;
      setScrollProgress(max > 0 ? (scrollTop / max) * 100 : 0);
    }
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={cn("flex flex-col h-full", theme === "dark" ? "dark" : "")}>
      {/* Preview controls */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b bg-background px-4 py-2">
        {/* Width controls */}
        <div className="flex items-center rounded-lg border bg-muted/30 p-0.5 gap-0.5">
          <button
            type="button"
            title="Desktop"
            onClick={() => setWidth("desktop")}
            className={cn(
              "p-1.5 rounded transition-colors",
              width === "desktop" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <IconDeviceDesktop className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Tablet"
            onClick={() => setWidth("tablet")}
            className={cn(
              "p-1.5 rounded transition-colors",
              width === "tablet" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <IconDeviceTablet className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Mobile"
            onClick={() => setWidth("mobile")}
            className={cn(
              "p-1.5 rounded transition-colors",
              width === "mobile" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <IconDeviceMobile className="h-3.5 w-3.5" />
          </button>
        </div>
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs gap-1"
          onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        >
          {theme === "light" ? (
            <><IconMoon className="h-3.5 w-3.5" /> Dark</>
          ) : (
            <><IconSun className="h-3.5 w-3.5" /> Light</>
          )}
        </Button>
      </div>

      {/* Reading progress bar */}
      <div className="h-0.5 bg-muted relative">
        <div
          className="absolute inset-y-0 left-0 bg-primary transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Scrollable content */}
      <div
        ref={containerRef}
        className={cn("flex-1 overflow-y-auto", theme === "dark" ? "bg-zinc-900" : "bg-background")}
      >
        <article className={cn("blog-preview mx-auto py-8 px-6", WIDTHS[width])}>
          {/* Cover image */}
          {coverUrl && (
            <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden mb-8">
              <Image
                src={coverUrl}
                alt={title || "Capa do artigo"}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs font-medium">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className={cn(
            "text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-4",
            theme === "dark" ? "text-zinc-100" : "text-foreground",
          )}>
            {title || "Titulo do artigo"}
          </h1>

          {/* Excerpt */}
          {excerpt && (
            <p className={cn("text-lg leading-relaxed mb-6", theme === "dark" ? "text-zinc-400" : "text-muted-foreground")}>
              {excerpt}
            </p>
          )}

          {/* Author & date */}
          <div className={cn(
            "flex items-center gap-3 mb-8 pb-8 border-b",
            theme === "dark" ? "border-zinc-700" : "",
          )}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={authorAvatarUrl ?? undefined} />
              <AvatarFallback className="text-xs">{initials ?? "?"}</AvatarFallback>
            </Avatar>
            <div>
              <p className={cn("text-sm font-medium", theme === "dark" ? "text-zinc-200" : "text-foreground")}>
                {authorName ?? "Autor"}
              </p>
              <p className={cn("text-xs", theme === "dark" ? "text-zinc-400" : "text-muted-foreground")}>
                {publishedAt
                  ? format(new Date(publishedAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Body */}
          <div
            className={cn("blog-prose", theme === "dark" ? "text-zinc-300" : "")}
            dangerouslySetInnerHTML={{ __html: body || "<p>Comece a escrever...</p>" }}
          />
        </article>
      </div>
    </div>
  );
}
