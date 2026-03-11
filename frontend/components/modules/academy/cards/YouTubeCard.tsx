"use client";

import { IconBrandYoutube, IconExternalLink } from "@tabler/icons-react";

const YOUTUBE_URL = "https://www.youtube.com/@wearetbo";

export function YouTubeCard() {
  return (
    <a
      href={YOUTUBE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative col-span-1 overflow-hidden rounded-3xl border border-white/5 bg-secondary/20 p-6 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
    >
      <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
        <IconExternalLink className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex h-full flex-col items-center justify-center py-8">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
          <IconBrandYoutube className="h-7 w-7 text-red-500" />
        </div>
        <h3 className="text-xl font-bold">YouTube</h3>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Cases, bastidores e conteúdo TBO.
        </p>
      </div>
    </a>
  );
}
