"use client";

import { PodcastCard } from "./cards/PodcastCard";
import { BlogCard } from "./cards/BlogCard";
import { YouTubeCard } from "./cards/YouTubeCard";
import { SocialLinks } from "./cards/SocialLinks";

export function ContentBentoGrid() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Conteúdos</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
        <PodcastCard />
        <BlogCard />
        <YouTubeCard />
        <SocialLinks />
      </div>
    </div>
  );
}
