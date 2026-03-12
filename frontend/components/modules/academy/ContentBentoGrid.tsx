"use client"

import {
  IconMicrophone,
  IconBook,
  IconBrandYoutube,
  IconWorld,
  IconBrandLinkedin,
  IconBrandInstagram,
} from "@tabler/icons-react"
import { ContentCard } from "./cards/ContentCard"

const LINKEDIN_NEWSLETTER =
  "https://www.linkedin.com/newsletters/entre-lan%C3%A7amentos-e-narrativas-7317909290218876929/"
const YOUTUBE_URL = "https://www.youtube.com/@wearetbo"
const SITE_URL = "https://wearetbo.com.br/"
const LINKEDIN_URL = "https://www.linkedin.com/company/agenciatbo"
const INSTAGRAM_URL = "https://instagram.com/agenciatbo"

export function ContentBentoGrid() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Conteúdos</h2>

      {/* auto-rows-[260px] garante altura uniforme em todos os cards */}
      <div className="grid auto-rows-[260px] grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        <ContentCard
          title="Podcast"
          label="Áudio"
          description="Conversas sobre mercado imobiliário, branding e processo criativo."
          icon={IconMicrophone}
          gradient="bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-secondary/20"
          ctaLabel="Em breve"
          ctaIcon={IconMicrophone}
          status="Em breve"
        />

        <ContentCard
          title="Blog"
          label="Leitura"
          description="Artigos sobre branding, marketing e mercado imobiliário."
          icon={IconBook}
          gradient="bg-gradient-to-br from-emerald-900/40 via-teal-900/20 to-secondary/20"
          ctaLabel="Ler newsletter"
          ctaIcon={IconBook}
          href={LINKEDIN_NEWSLETTER}
        />

        <ContentCard
          title="YouTube"
          label="Vídeo"
          description="Cases, bastidores e conteúdo TBO."
          icon={IconBrandYoutube}
          gradient="bg-gradient-to-br from-red-900/40 via-rose-900/20 to-secondary/20"
          ctaLabel="Assistir"
          ctaIcon={IconBrandYoutube}
          href={YOUTUBE_URL}
        />

        <ContentCard
          title="Site TBO"
          label="Web"
          description="Portfólio de projetos, cases e apresentação institucional."
          icon={IconWorld}
          gradient="bg-gradient-to-br from-sky-900/40 via-cyan-900/20 to-secondary/20"
          ctaLabel="Visitar site"
          ctaIcon={IconWorld}
          href={SITE_URL}
        />

        <ContentCard
          title="LinkedIn"
          label="Rede profissional"
          description="Novidades, posicionamento e cultura da TBO no LinkedIn."
          icon={IconBrandLinkedin}
          gradient="bg-gradient-to-br from-blue-900/50 via-indigo-900/30 to-secondary/20"
          ctaLabel="Seguir"
          ctaIcon={IconBrandLinkedin}
          href={LINKEDIN_URL}
        />

        <ContentCard
          title="Instagram"
          label="Social"
          description="Visual e bastidores do trabalho criativo da TBO."
          icon={IconBrandInstagram}
          gradient="bg-gradient-to-br from-pink-900/40 via-purple-900/30 to-secondary/20"
          ctaLabel="Seguir"
          ctaIcon={IconBrandInstagram}
          href={INSTAGRAM_URL}
        />
      </div>
    </div>
  )
}
