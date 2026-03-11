"use client";

import { IconBook, IconExternalLink } from "@tabler/icons-react";

const LINKEDIN_NEWSLETTER =
  "https://www.linkedin.com/newsletters/entre-lan%C3%A7amentos-e-narrativas-7317909290218876929/";

export function BlogCard() {
  return (
    <a
      href={LINKEDIN_NEWSLETTER}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative col-span-1 overflow-hidden rounded-3xl border border-white/5 bg-secondary/30 p-6 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
    >
      <span className="absolute right-4 top-4 flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Leitura
        <IconExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
      </span>
      <div className="flex h-full flex-col justify-end pt-8">
        <IconBook className="mb-3 h-8 w-8 text-primary/60" />
        <h3 className="mb-1 text-xl font-bold">Blog</h3>
        <p className="text-sm text-muted-foreground">
          Artigos sobre branding, marketing e mercado imobiliário.
        </p>
      </div>
    </a>
  );
}
