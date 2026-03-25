"use client"

import {
  IconMicrophone,
  IconBook,
  IconBrandYoutube,
  IconWorld,
  IconBrandLinkedin,
  IconBrandInstagram,
  IconBrandBehance,
} from "@tabler/icons-react"
import { ContentCard } from "./cards/ContentCard"

const LINKEDIN_NEWSLETTER =
  "https://www.linkedin.com/newsletters/entre-lan%C3%A7amentos-e-narrativas-7317909290218876929/"
const YOUTUBE_URL = "https://www.youtube.com/@wearetbo"
const SITE_URL = "https://wearetbo.com.br/"
const LINKEDIN_URL = "https://www.linkedin.com/company/agenciatbo"
const INSTAGRAM_URL = "https://www.instagram.com/weare.tbo/"
const BEHANCE_URL = "https://www.behance.net/wearetbo"

export function ContentBentoGrid() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Conteúdos</h2>

      {/* auto-rows-[84px] + 2 colunas — cards compactos, todos mesma altura */}
      <div className="grid auto-rows-[84px] grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-2">
        <ContentCard
          title="Podcast"
          label="Áudio"
          description="Conversas sobre mercado imobiliário, branding e processo criativo."
          icon={IconMicrophone}
          gradient="bg-gradient-to-r from-[#0a1f1d] via-teal-950/80 to-slate-900/90"
          ctaLabel="Em breve"
          ctaIcon={IconMicrophone}
          status="Em breve"
        />

        <ContentCard
          title="Blog"
          label="Leitura"
          description="Artigos sobre branding, marketing e mercado imobiliário."
          icon={IconBook}
          gradient="bg-gradient-to-r from-emerald-950/90 via-teal-950/80 to-slate-900/90"
          ctaLabel="Ler newsletter"
          ctaIcon={IconBook}
          href={LINKEDIN_NEWSLETTER}
        />

        <ContentCard
          title="YouTube"
          label="Vídeo"
          description="Cases, bastidores e conteúdo TBO."
          icon={IconBrandYoutube}
          gradient="bg-gradient-to-r from-red-950/90 via-rose-950/80 to-slate-900/90"
          ctaLabel="Assistir"
          ctaIcon={IconBrandYoutube}
          href={YOUTUBE_URL}
        />

        <ContentCard
          title="Site TBO"
          label="Web"
          description="Portfólio de projetos, cases e apresentação institucional."
          icon={IconWorld}
          gradient="bg-gradient-to-r from-sky-950/90 via-cyan-950/80 to-slate-900/90"
          ctaLabel="Visitar site"
          ctaIcon={IconWorld}
          href={SITE_URL}
        />

        <ContentCard
          title="LinkedIn"
          label="Rede profissional"
          description="Novidades, posicionamento e cultura da TBO no LinkedIn."
          icon={IconBrandLinkedin}
          gradient="bg-gradient-to-r from-blue-950/90 via-[#0a1f1d]/80 to-slate-900/90"
          ctaLabel="Seguir"
          ctaIcon={IconBrandLinkedin}
          href={LINKEDIN_URL}
        />

        <ContentCard
          title="Instagram"
          label="Social"
          description="Visual e bastidores do trabalho criativo da TBO."
          icon={IconBrandInstagram}
          gradient="bg-gradient-to-r from-pink-950/90 via-[#0a1f1d]/80 to-slate-900/90"
          ctaLabel="Seguir"
          ctaIcon={IconBrandInstagram}
          href={INSTAGRAM_URL}
        />

        <ContentCard
          title="Behance"
          label="Portfólio"
          description="Cases e projetos criativos da TBO com processo e resultado."
          icon={IconBrandBehance}
          gradient="bg-gradient-to-r from-blue-950/90 via-sky-950/80 to-slate-900/90"
          ctaLabel="Ver portfólio"
          ctaIcon={IconBrandBehance}
          href={BEHANCE_URL}
        />
      </div>
    </div>
  )
}
