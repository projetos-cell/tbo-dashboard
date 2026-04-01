"use client";

import { useRef, useCallback } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  IconFolder,
  IconFileTypePdf,
  IconRuler,
  IconPhoto,
  IconVideo,
  IconExternalLink,
  IconFileZip,
  IconChevronDown,
  IconDownload,
  IconCalendar,
  IconBuilding,
  IconUser,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

// ── Types ──────────────────────────────────────────────────
interface Deliverable {
  title: string;
  description: string;
  type: string;
  url: string;
  icon?: string;
  file_size?: string;
}

interface DeliveryViewProps {
  title: string;
  description: string | null;
  clientName: string | null;
  clientCompany: string | null;
  projectName: string | null;
  deliveredBy: string | null;
  deliveryDate: string | null;
  deliverables: Deliverable[];
  heroSubtitle: string | null;
  accentColor: string;
}

// ── Constants ──────────────────────────────────────────────
const EASE_OUT = [0.0, 0.0, 0.2, 1] as const;

const TYPE_ICONS: Record<string, typeof IconFolder> = {
  folder: IconFolder,
  pdf: IconFileTypePdf,
  dwg: IconRuler,
  image: IconPhoto,
  video: IconVideo,
  link: IconExternalLink,
  zip: IconFileZip,
};

const TYPE_LABELS: Record<string, string> = {
  folder: "Pasta",
  pdf: "PDF",
  dwg: "DWG",
  image: "Imagem",
  video: "Vídeo",
  link: "Link",
  zip: "ZIP",
};

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Convert Google Drive share/view URLs into direct download URLs.
 * For folder URLs or non-Drive URLs, returns null (open externally).
 */
function getDirectDownloadUrl(url: string): string | null {
  // Match /file/d/FILE_ID/ pattern
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`;
  }
  // Match ?id=FILE_ID pattern
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && !url.includes("/folders/")) {
    return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
  }
  // Folder or non-Drive URLs — cannot direct download
  return null;
}

/** Returns true if the deliverable type supports direct download */
function isDownloadable(type: string): boolean {
  return ["pdf", "dwg", "image", "zip", "video"].includes(type);
}

// ── Stagger Variants ────────────────────────────────────────
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

// ── Hero Section ────────────────────────────────────────────
function HeroSection({
  projectName,
  clientCompany,
  heroSubtitle,
  accentColor,
}: {
  projectName: string | null;
  clientCompany: string | null;
  heroSubtitle: string | null;
  accentColor: string;
}) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const letters = (projectName ?? "Projeto").split("");

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white"
    >
      {/* Subtle gradient orbs — light mode */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.08] blur-[140px] animate-[drift1_20s_ease-in-out_infinite]"
          style={{ background: accentColor, top: "10%", right: "10%" }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[120px] animate-[drift2_25s_ease-in-out_infinite]"
          style={{ background: "#e0dcd8", bottom: "10%", left: "5%" }}
        />
        <div
          className="absolute w-[300px] h-[300px] rounded-full opacity-[0.06] blur-[100px] animate-[drift3_18s_ease-in-out_infinite]"
          style={{ background: accentColor, top: "40%", left: "40%" }}
        />
      </div>

      {/* Content */}
      <motion.div
        style={{ y: contentY, opacity }}
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
      >
        {/* TBO Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: EASE_OUT }}
          className="mb-12 flex flex-col items-center"
        >
          <a href="https://agenciatbo.com.br" target="_blank" rel="noopener noreferrer">
            <Image
              src="/logo-tbo.svg"
              alt="TBO | Lançamentos Imobiliários"
              width={120}
              height={48}
              className="h-10 w-auto opacity-60 hover:opacity-80 transition-opacity"
              priority
            />
          </a>
          <p className="text-[10px] tracking-[0.25em] text-zinc-400 uppercase mt-2">
            think, build, own
          </p>
        </motion.div>

        {/* Project name — letter stagger */}
        <div className="flex flex-wrap justify-center gap-0" aria-label={projectName ?? "Projeto"}>
          {letters.map((letter, i) => (
            <motion.span
              key={`${letter}-${i}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.5 + i * 0.035,
                ease: EASE_OUT,
              }}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-zinc-900"
              style={{ display: "inline-block", whiteSpace: "pre" }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </div>

        {/* Client */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.9, ease: EASE_OUT }}
          className="text-lg sm:text-xl text-zinc-400 mt-6 font-light tracking-wide"
        >
          {clientCompany ?? ""}
        </motion.p>

        {/* Subtitle */}
        {heroSubtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.1, ease: EASE_OUT }}
            className="text-sm text-zinc-400 mt-3 tracking-widest uppercase"
          >
            {heroSubtitle}
          </motion.p>
        )}

        {/* Accent divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 1.3, ease: EASE_OUT }}
          className="w-24 h-[2px] mx-auto mt-8 origin-center"
          style={{ background: accentColor }}
        />

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.4 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <IconChevronDown size={24} className="text-zinc-300" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── Context Section ──────────────────────────────────────────
function ContextSection({
  description,
  deliveryDate,
  clientCompany,
  deliveredBy,
}: {
  description: string | null;
  deliveryDate: string | null;
  clientCompany: string | null;
  deliveredBy: string | null;
}) {
  return (
    <section className="py-20 sm:py-28 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
        className="max-w-2xl mx-auto text-center"
      >
        <p className="text-xs tracking-[0.3em] text-zinc-400 uppercase mb-6">
          Sobre esta entrega
        </p>

        {description && (
          <p className="text-lg sm:text-xl text-zinc-600 leading-relaxed font-light">
            {description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap justify-center gap-6 mt-10">
          {deliveryDate && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <IconCalendar size={16} />
              <span>{formatDate(deliveryDate)}</span>
            </div>
          )}
          {clientCompany && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <IconBuilding size={16} />
              <span>{clientCompany}</span>
            </div>
          )}
          {deliveredBy && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <IconUser size={16} />
              <span>{deliveredBy}</span>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}

// ── Deliverable Card ─────────────────────────────────────────
function DeliverableCard({
  deliverable,
  accentColor,
}: {
  deliverable: Deliverable;
  accentColor: string;
}) {
  const Icon = TYPE_ICONS[deliverable.type] ?? IconExternalLink;
  const typeLabel = TYPE_LABELS[deliverable.type] ?? deliverable.type;

  const canDownload = isDownloadable(deliverable.type);
  const directUrl = getDirectDownloadUrl(deliverable.url);
  const downloadUrl = canDownload && directUrl ? directUrl : null;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (downloadUrl) {
        // Trigger direct download via hidden anchor
        e.preventDefault();
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = "";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      // For folders/links: default <a> behaviour (open in new tab)
    },
    [downloadUrl],
  );

  return (
    <motion.a
      href={downloadUrl ?? deliverable.url}
      target={downloadUrl ? undefined : "_blank"}
      rel="noopener noreferrer"
      onClick={handleClick}
      variants={staggerItem}
      whileHover={{
        y: -6,
        transition: { duration: 0.25 },
      }}
      className="group block rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:border-zinc-300"
    >
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-300"
        style={{
          backgroundColor: `${accentColor}12`,
        }}
      >
        <Icon
          size={28}
          className="transition-colors duration-300"
          style={{ color: accentColor }}
        />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-zinc-900 mt-5">
        {deliverable.title}
      </h3>
      {deliverable.description && (
        <p className="text-sm text-zinc-500 mt-2 leading-relaxed line-clamp-3">
          {deliverable.description}
        </p>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-6">
        <Badge
          variant="outline"
          className="text-[10px] uppercase tracking-widest border-zinc-200 text-zinc-400 bg-transparent"
        >
          {typeLabel}
          {deliverable.file_size && ` · ${deliverable.file_size}`}
        </Badge>
        <div className="flex items-center gap-1 text-zinc-400 group-hover:text-zinc-700 transition-colors duration-300">
          {downloadUrl ? (
            <>
              <IconDownload size={14} />
              <span className="text-xs font-medium">Baixar</span>
            </>
          ) : (
            <>
              <span className="text-xs font-medium">Acessar</span>
              <IconExternalLink size={14} />
            </>
          )}
        </div>
      </div>
    </motion.a>
  );
}

// ── Deliverables Section ─────────────────────────────────────
function DeliverablesSection({
  deliverables,
  accentColor,
}: {
  deliverables: Deliverable[];
  accentColor: string;
}) {
  return (
    <section className="py-16 sm:py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-[0.3em] text-zinc-400 uppercase mb-3">
            Entregaveis
          </p>
          <p className="text-sm text-zinc-400">
            {deliverables.length}{" "}
            {deliverables.length === 1 ? "item" : "itens"} disponíveis
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
        >
          {deliverables.map((d, i) => (
            <DeliverableCard
              key={`${d.title}-${i}`}
              deliverable={d}
              accentColor={accentColor}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── CTA Section ──────────────────────────────────────────────
function CTASection({
  deliverables,
  accentColor,
}: {
  deliverables: Deliverable[];
  accentColor: string;
}) {
  // Find first downloadable or fallback to first deliverable
  const primary = deliverables.find(
    (d) => isDownloadable(d.type) && getDirectDownloadUrl(d.url),
  ) ?? deliverables[0];
  if (!primary) return null;

  const directUrl = getDirectDownloadUrl(primary.url);
  const isDownload = !!directUrl;
  const href = directUrl ?? primary.url;

  return (
    <section className="py-20 sm:py-28 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
        className="text-center max-w-lg mx-auto"
      >
        <p className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          Pronto para acessar?
        </p>
        <p className="text-sm text-zinc-500 mb-10">
          {isDownload
            ? "Clique abaixo para baixar os arquivos diretamente."
            : "Clique abaixo para abrir todos os arquivos do projeto."}
        </p>

        <motion.a
          href={href}
          {...(isDownload ? { download: "" } : { target: "_blank", rel: "noopener noreferrer" })}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-3 px-10 py-4 rounded-full text-white font-semibold text-base transition-shadow duration-500"
          style={{
            background: accentColor,
            boxShadow: `0 4px 24px ${accentColor}30`,
          }}
        >
          <IconDownload size={20} />
          {isDownload ? "Baixar Entrega" : "Acessar Entrega"}
        </motion.a>
      </motion.div>
    </section>
  );
}

// ── Footer ──────────────────────────────────────────────────
function FooterSection() {
  return (
    <footer className="border-t border-zinc-200 py-10 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
        <a href="https://agenciatbo.com.br" target="_blank" rel="noopener noreferrer">
          <Image
            src="/logo-tbo.svg"
            alt="TBO | Lançamentos Imobiliários"
            width={80}
            height={32}
            className="h-7 w-auto opacity-40 hover:opacity-60 transition-opacity"
          />
        </a>
        <p className="text-[11px] text-zinc-400 tracking-wide">
          TBO | Lançamentos Imobiliários
        </p>
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <a
            href="https://agenciatbo.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-600 transition-colors"
          >
            agenciatbo.com.br
          </a>
          <span className="text-zinc-300">·</span>
          <span>contato@agenciatbo.com.br</span>
        </div>
        <p className="text-[10px] text-zinc-300 mt-1">
          Este link de entrega foi gerado pelo TBO OS.
        </p>
      </div>
    </footer>
  );
}

// ── Main View ────────────────────────────────────────────────
export function DeliveryView({
  title,
  description,
  clientName,
  clientCompany,
  projectName,
  deliveredBy,
  deliveryDate,
  deliverables,
  heroSubtitle,
  accentColor,
}: DeliveryViewProps) {
  // Suppress unused var warning
  void clientName;
  void title;

  return (
    <main className="relative">
      <HeroSection
        projectName={projectName}
        clientCompany={clientCompany}
        heroSubtitle={heroSubtitle}
        accentColor={accentColor}
      />

      <ContextSection
        description={description}
        deliveryDate={deliveryDate}
        clientCompany={clientCompany}
        deliveredBy={deliveredBy}
      />

      <DeliverablesSection
        deliverables={deliverables}
        accentColor={accentColor}
      />

      <CTASection
        deliverables={deliverables}
        accentColor={accentColor}
      />

      <FooterSection />
    </main>
  );
}
