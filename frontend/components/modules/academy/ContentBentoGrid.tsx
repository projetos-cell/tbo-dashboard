"use client"

import { IconMicrophone, IconBook, IconBrandYoutube } from "@tabler/icons-react"
import { ContentCard } from "./cards/ContentCard"
import { SocialLinks } from "./cards/SocialLinks"

const LINKEDIN_NEWSLETTER =
  "https://www.linkedin.com/newsletters/entre-lan%C3%A7amentos-e-narrativas-7317909290218876929/"
const YOUTUBE_URL = "https://www.youtube.com/@wearetbo"

export function ContentBentoGrid() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Conteúdos</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {/* Podcast — card grande, col-span-2, row-span-2 */}
        <ContentCard
          title="Podcast"
          label="Áudio"
          description="Conversas sobre mercado imobiliário, branding e processo criativo."
          icon={IconMicrophone}
          gradient="bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-secondary/20"
          ctaLabel="Em breve"
          ctaIcon={IconMicrophone}
          status="Em breve"
          className="col-span-1 row-span-2 md:col-span-2"
        />

        {/* Blog */}
        <ContentCard
          title="Blog"
          label="Leitura"
          description="Artigos sobre branding, marketing e mercado imobiliário."
          icon={IconBook}
          gradient="bg-gradient-to-br from-emerald-900/40 via-teal-900/20 to-secondary/20"
          ctaLabel="Ler newsletter"
          ctaIcon={IconBook}
          href={LINKEDIN_NEWSLETTER}
          className="col-span-1"
        />

        {/* YouTube */}
        <ContentCard
          title="YouTube"
          label="Vídeo"
          description="Cases, bastidores e conteúdo TBO."
          icon={IconBrandYoutube}
          gradient="bg-gradient-to-br from-red-900/40 via-rose-900/20 to-secondary/20"
          ctaLabel="Assistir"
          ctaIcon={IconBrandYoutube}
          href={YOUTUBE_URL}
          className="col-span-1"
        />

        <SocialLinks />
      </div>
    </div>
  )
}
