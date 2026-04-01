"use client";

import { useRef, useCallback, useState } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
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
  IconLock,
  IconQuote,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  coverImageUrl: string | null;
  personalMessage: string | null;
  isFirstAccess: boolean;
  accessPassword: string | null;
}

// ── Constants ──────────────────────────────────────────────
const EASE_OUT = [0.0, 0.0, 0.2, 1] as const;
const CURTAIN_EASE = [0.76, 0, 0.24, 1] as const;

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

function getDirectDownloadUrl(url: string): string | null {
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`;
  }
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && !url.includes("/folders/")) {
    return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
  }
  return null;
}

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

// ── Password Screen ────────────────────────────────────────
function PasswordScreen({
  accessPassword,
  onUnlock,
}: {
  accessPassword: string;
  onUnlock: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (password.trim().toLowerCase() === accessPassword.toLowerCase()) {
        onUnlock();
      } else {
        setError(true);
      }
    },
    [password, accessPassword, onUnlock],
  );

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8 sm:p-10 text-center max-w-sm w-full"
      >
        <Image
          src="/logo-tbo.svg"
          alt="TBO"
          width={80}
          height={32}
          className="h-7 w-auto mx-auto opacity-50 mb-8"
        />

        <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-5">
          <IconLock size={24} className="text-zinc-400" />
        </div>

        <h2 className="text-lg font-bold text-zinc-900 mb-1">
          Entrega protegida
        </h2>
        <p className="text-sm text-zinc-500 mb-6">
          Digite a senha de acesso fornecida pela TBO.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="password"
            placeholder="Senha de acesso"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            className={`text-center h-11 ${error ? "border-red-400 focus-visible:ring-red-400" : ""}`}
            autoFocus
          />
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500"
            >
              Senha incorreta. Tente novamente.
            </motion.p>
          )}
          <Button
            type="submit"
            className="w-full h-11 bg-[#18181B] hover:bg-zinc-800 text-white"
          >
            Acessar entrega
          </Button>
        </form>

        <p className="text-[10px] text-zinc-400 mt-8">
          TBO | Lançamentos Imobiliários
        </p>
      </motion.div>
    </div>
  );
}

// ── Reveal Animation (first access) ───────────────────────
function RevealAnimation({
  projectName,
  onComplete,
}: {
  projectName: string | null;
  onComplete: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 pointer-events-none"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top curtain */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1/2 bg-zinc-900 z-50"
        initial={{ y: 0 }}
        animate={{ y: "-100%" }}
        transition={{ duration: 0.8, delay: 2.2, ease: CURTAIN_EASE }}
      />

      {/* Bottom curtain */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1/2 bg-zinc-900 z-50"
        initial={{ y: 0 }}
        animate={{ y: "100%" }}
        transition={{ duration: 0.8, delay: 2.2, ease: CURTAIN_EASE }}
        onAnimationComplete={onComplete}
      />

      {/* Center content */}
      <div className="absolute inset-0 z-[51] flex flex-col items-center justify-center bg-zinc-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center"
        >
          <Image
            src="/logo-tbo-dark.svg"
            alt="TBO"
            width={100}
            height={40}
            className="h-8 w-auto opacity-60 mb-6"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="text-white text-2xl sm:text-3xl font-bold tracking-tight"
          >
            {projectName ?? "Seu projeto"}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.2 }}
            className="text-white/40 text-sm mt-2 tracking-widest uppercase"
          >
            está pronto
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 1.5 }}
            className="w-16 h-[2px] bg-[#E85102] mt-4 origin-center"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Hero Section ────────────────────────────────────────────
function HeroSection({
  projectName,
  clientCompany,
  heroSubtitle,
  accentColor,
  coverImageUrl,
}: {
  projectName: string | null;
  clientCompany: string | null;
  heroSubtitle: string | null;
  accentColor: string;
  coverImageUrl: string | null;
}) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  const letters = (projectName ?? "Projeto").split("");

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white"
    >
      {/* Background: cover image with parallax OR gradient orbs */}
      {coverImageUrl ? (
        <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
          <Image
            src={coverImageUrl}
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-white/40" />
        </motion.div>
      ) : (
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
      )}

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
          <a href="https://wearetbo.com.br" target="_blank" rel="noopener noreferrer">
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
  accentColor,
}: {
  description: string | null;
  deliveryDate: string | null;
  clientCompany: string | null;
  deliveredBy: string | null;
  accentColor: string;
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
        {/* Version/Date Badge */}
        {deliveryDate && (
          <div className="flex justify-center mb-6">
            <Badge
              className="text-xs font-medium tracking-wide px-4 py-1.5 rounded-full border-0"
              style={{
                backgroundColor: `${accentColor}15`,
                color: accentColor,
              }}
            >
              Versão Final &middot; {formatDate(deliveryDate)}
            </Badge>
          </div>
        )}

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

// ── Personal Message Section ────────────────────────────────
function PersonalMessageSection({
  message,
  author,
  accentColor,
}: {
  message: string;
  author: string | null;
  accentColor: string;
}) {
  return (
    <section className="py-8 sm:py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
        className="max-w-2xl mx-auto"
      >
        <div className="relative bg-white rounded-2xl border border-zinc-200 p-8 sm:p-10">
          {/* Decorative quote */}
          <div className="absolute -top-4 left-8">
            <IconQuote
              size={36}
              className="rotate-180"
              style={{ color: `${accentColor}40` }}
            />
          </div>

          <p className="text-lg sm:text-xl text-zinc-700 leading-relaxed font-light italic mt-2">
            {message}
          </p>

          {author && (
            <div className="flex items-center gap-3 mt-6">
              <div
                className="w-8 h-[2px]"
                style={{ background: accentColor }}
              />
              <p className="text-sm font-semibold text-zinc-600">{author}</p>
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
        e.preventDefault();
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = "";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
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
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: `${accentColor}12` }}
      >
        <Icon
          size={28}
          className="transition-colors duration-300"
          style={{ color: accentColor }}
        />
      </div>

      <h3 className="text-lg font-semibold text-zinc-900 mt-5">
        {deliverable.title}
      </h3>
      {deliverable.description && (
        <p className="text-sm text-zinc-500 mt-2 leading-relaxed line-clamp-3">
          {deliverable.description}
        </p>
      )}

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
            Entregáveis
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
          className={`grid gap-4 sm:gap-6 ${
            deliverables.length === 1
              ? "grid-cols-1 max-w-md mx-auto"
              : "grid-cols-1 md:grid-cols-2"
          }`}
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

// ── Footer ──────────────────────────────────────────────────
function FooterSection() {
  return (
    <footer className="border-t border-zinc-200 py-12 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-5">
        <a href="https://wearetbo.com.br" target="_blank" rel="noopener noreferrer">
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
        <p className="text-sm text-zinc-500 text-center max-w-xs leading-relaxed">
          Aproveite e conheça mais o nosso website e nossos serviços.
        </p>
        <a
          href="https://wearetbo.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-zinc-300 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:border-zinc-400 transition-all"
        >
          Visitar wearetbo.com.br
          <IconExternalLink size={14} />
        </a>
        <p className="text-xs text-zinc-400 mt-2">
          contato@agenciatbo.com.br
        </p>
        <p className="text-[10px] text-zinc-300">
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
  coverImageUrl,
  personalMessage,
  isFirstAccess,
  accessPassword,
}: DeliveryViewProps) {
  void clientName;
  void title;

  const [unlocked, setUnlocked] = useState(false);
  const [revealComplete, setRevealComplete] = useState(!isFirstAccess);

  // Password gate — blocks everything until unlocked
  if (accessPassword && !unlocked) {
    return (
      <PasswordScreen
        accessPassword={accessPassword}
        onUnlock={() => setUnlocked(true)}
      />
    );
  }

  return (
    <main className="relative">
      {/* First-access reveal animation */}
      <AnimatePresence>
        {!revealComplete && (
          <RevealAnimation
            projectName={projectName}
            onComplete={() => setRevealComplete(true)}
          />
        )}
      </AnimatePresence>

      <HeroSection
        projectName={projectName}
        clientCompany={clientCompany}
        heroSubtitle={heroSubtitle}
        accentColor={accentColor}
        coverImageUrl={coverImageUrl}
      />

      <ContextSection
        description={description}
        deliveryDate={deliveryDate}
        clientCompany={clientCompany}
        deliveredBy={deliveredBy}
        accentColor={accentColor}
      />

      {personalMessage && (
        <PersonalMessageSection
          message={personalMessage}
          author={deliveredBy}
          accentColor={accentColor}
        />
      )}

      <DeliverablesSection
        deliverables={deliverables}
        accentColor={accentColor}
      />

      <FooterSection />
    </main>
  );
}
