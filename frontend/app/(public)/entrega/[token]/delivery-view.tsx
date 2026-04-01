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
  IconDownload,
  IconLock,
  IconArrowDown,
  IconArrowRight,
} from "@tabler/icons-react";
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
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

// ── Password Screen ────────────────────────────────────────
function PasswordScreen({
  accessPassword,
  onUnlock,
  coverImageUrl,
}: {
  accessPassword: string;
  onUnlock: () => void;
  coverImageUrl: string | null;
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
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background */}
      {coverImageUrl ? (
        <div className="absolute inset-0 z-0">
          <Image src={coverImageUrl} alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-zinc-900/70 backdrop-blur-sm" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-zinc-900" />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="relative z-10 text-center max-w-sm w-full"
      >
        <Image
          src="/logo-tbo-dark.svg"
          alt="TBO"
          width={80}
          height={32}
          className="h-7 w-auto mx-auto opacity-60 mb-10"
        />

        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
          <IconLock size={20} className="text-white/50" />
        </div>

        <h2 className="text-lg font-semibold text-white mb-1">
          Entrega protegida
        </h2>
        <p className="text-sm text-white/40 mb-8">
          Digite a senha de acesso fornecida pela TBO.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="password"
            placeholder="Senha de acesso"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            className={`text-center h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-white/30 ${error ? "border-red-400" : ""}`}
            autoFocus
          />
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-red-400"
            >
              Senha incorreta. Tente novamente.
            </motion.p>
          )}
          <Button type="submit" className="w-full h-12 bg-white text-zinc-900 hover:bg-white/90 font-semibold">
            Acessar entrega
          </Button>
        </form>

        <p className="text-[10px] text-white/20 mt-10">
          TBO | Lançamentos Imobiliários
        </p>
      </motion.div>
    </div>
  );
}

// ── Reveal Animation ───────────────────────────────────────
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
      <motion.div
        className="absolute top-0 left-0 right-0 h-1/2 bg-zinc-900 z-50"
        initial={{ y: 0 }}
        animate={{ y: "-100%" }}
        transition={{ duration: 0.8, delay: 2.2, ease: CURTAIN_EASE }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1/2 bg-zinc-900 z-50"
        initial={{ y: 0 }}
        animate={{ y: "100%" }}
        transition={{ duration: 0.8, delay: 2.2, ease: CURTAIN_EASE }}
        onAnimationComplete={onComplete}
      />
      <div className="absolute inset-0 z-[51] flex flex-col items-center justify-center bg-zinc-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center"
        >
          <Image src="/logo-tbo-dark.svg" alt="TBO" width={100} height={40} className="h-8 w-auto opacity-60 mb-6" />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="text-white text-2xl sm:text-4xl font-bold tracking-tight"
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

// ── Hero ────────────────────────────────────────────────────
function HeroSection({
  projectName,
  clientCompany,
  heroSubtitle,
  accentColor,
  coverImageUrl,
  deliveryDate,
}: {
  projectName: string | null;
  clientCompany: string | null;
  heroSubtitle: string | null;
  accentColor: string;
  coverImageUrl: string | null;
  deliveryDate: string | null;
}) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={heroRef} className="relative h-screen flex flex-col justify-end overflow-hidden">
      {/* Background */}
      {coverImageUrl ? (
        <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
          <Image src={coverImageUrl} alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
        </motion.div>
      ) : (
        <div className="absolute inset-0 z-0 bg-zinc-900" />
      )}

      {/* Top bar — logo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute top-0 left-0 right-0 z-20 p-6 sm:p-8 flex items-center justify-between"
      >
        <a href="https://wearetbo.com.br" target="_blank" rel="noopener noreferrer">
          <Image
            src="/logo-tbo-dark.svg"
            alt="TBO | Lançamentos Imobiliários"
            width={100}
            height={40}
            className="h-7 sm:h-8 w-auto opacity-70 hover:opacity-100 transition-opacity"
            priority
          />
        </a>
        {deliveryDate && (
          <span className="text-[11px] text-white/40 tracking-wider uppercase hidden sm:block">
            Versão Final &middot; {formatDate(deliveryDate)}
          </span>
        )}
      </motion.div>

      {/* Bottom content */}
      <motion.div
        style={{ opacity: contentOpacity }}
        className="relative z-10 px-6 sm:px-10 pb-16 sm:pb-20 max-w-5xl"
      >
        {heroSubtitle && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-xs sm:text-sm text-white/40 tracking-widest uppercase mb-4"
          >
            {heroSubtitle}
          </motion.p>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-5xl sm:text-7xl md:text-8xl font-bold text-white tracking-tight leading-[0.9]"
        >
          {projectName ?? "Projeto"}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="flex items-center gap-4 mt-6"
        >
          {clientCompany && (
            <span className="text-sm sm:text-base text-white/50 font-light">{clientCompany}</span>
          )}
          <div className="w-8 h-[1px]" style={{ background: accentColor }} />
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.4 }}
          className="mt-12"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <IconArrowDown size={18} className="text-white/20" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── Content Body ────────────────────────────────────────────
function ContentBody({
  description,
  deliveryDate,
  deliveredBy,
  personalMessage,
  deliverables,
  accentColor,
}: {
  description: string | null;
  deliveryDate: string | null;
  deliveredBy: string | null;
  personalMessage: string | null;
  deliverables: Deliverable[];
  accentColor: string;
}) {
  return (
    <section className="relative bg-white">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-20 sm:py-28">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        >
          {deliveryDate && (
            <p className="text-xs tracking-widest uppercase mb-8" style={{ color: accentColor }}>
              Entrega final &middot; {formatDate(deliveryDate)}
            </p>
          )}

          {description && (
            <p className="text-xl sm:text-2xl text-zinc-700 leading-relaxed font-light">
              {description}
            </p>
          )}

          {deliveredBy && (
            <p className="text-sm text-zinc-400 mt-4">
              Entregue por {deliveredBy}
            </p>
          )}

          <div className="w-12 h-[1px] bg-zinc-200 mt-10 mb-10" />
        </motion.div>

        {/* Personal message */}
        {personalMessage && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="mb-16 pl-6 border-l-2"
            style={{ borderColor: `${accentColor}40` }}
          >
            <p className="text-lg text-zinc-600 leading-relaxed italic">
              &ldquo;{personalMessage}&rdquo;
            </p>
          </motion.div>
        )}

        {/* Deliverables */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          <p className="text-xs tracking-widest text-zinc-400 uppercase mb-8">
            Entregáveis &middot; {deliverables.length} {deliverables.length === 1 ? "item" : "itens"}
          </p>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="space-y-3"
          >
            {deliverables.map((d, i) => (
              <DeliverableRow key={`${d.title}-${i}`} deliverable={d} accentColor={accentColor} index={i} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Deliverable Row ─────────────────────────────────────────
function DeliverableRow({
  deliverable,
  accentColor,
  index,
}: {
  deliverable: Deliverable;
  accentColor: string;
  index: number;
}) {
  const Icon = TYPE_ICONS[deliverable.type] ?? IconExternalLink;

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
      className="group flex items-start gap-5 p-5 sm:p-6 rounded-xl border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50/50 transition-all duration-300"
    >
      {/* Number */}
      <span className="text-[11px] font-mono text-zinc-300 mt-1 shrink-0 w-5 text-right">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accentColor}10` }}
      >
        <Icon size={20} style={{ color: accentColor }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors">
          {deliverable.title}
        </h3>
        {deliverable.description && (
          <p className="text-sm text-zinc-400 mt-1 leading-relaxed line-clamp-2">
            {deliverable.description}
          </p>
        )}
      </div>

      {/* Action */}
      <div className="shrink-0 mt-1">
        {downloadUrl ? (
          <IconDownload size={16} className="text-zinc-300 group-hover:text-zinc-600 transition-colors" />
        ) : (
          <IconArrowRight size={16} className="text-zinc-300 group-hover:text-zinc-600 transition-colors" />
        )}
      </div>
    </motion.a>
  );
}

// ── Footer ──────────────────────────────────────────────────
function FooterSection() {
  return (
    <footer className="bg-zinc-900 py-16 sm:py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
          <div>
            <a href="https://wearetbo.com.br" target="_blank" rel="noopener noreferrer">
              <Image
                src="/logo-tbo-dark.svg"
                alt="TBO | Lançamentos Imobiliários"
                width={80}
                height={32}
                className="h-7 w-auto opacity-50 hover:opacity-80 transition-opacity"
              />
            </a>
            <p className="text-sm text-white/30 mt-4 max-w-xs leading-relaxed">
              Aproveite e conheça mais o nosso website e nossos serviços.
            </p>
            <a
              href="https://wearetbo.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors mt-4"
            >
              wearetbo.com.br
              <IconArrowRight size={14} />
            </a>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/20">contato@agenciatbo.com.br</p>
            <p className="text-[10px] text-white/10 mt-1">Gerado pelo TBO OS</p>
          </div>
        </div>
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

  if (accessPassword && !unlocked) {
    return (
      <PasswordScreen
        accessPassword={accessPassword}
        onUnlock={() => setUnlocked(true)}
        coverImageUrl={coverImageUrl}
      />
    );
  }

  return (
    <main className="relative">
      <AnimatePresence>
        {!revealComplete && (
          <RevealAnimation projectName={projectName} onComplete={() => setRevealComplete(true)} />
        )}
      </AnimatePresence>

      <HeroSection
        projectName={projectName}
        clientCompany={clientCompany}
        heroSubtitle={heroSubtitle}
        accentColor={accentColor}
        coverImageUrl={coverImageUrl}
        deliveryDate={deliveryDate}
      />

      <ContentBody
        description={description}
        deliveryDate={deliveryDate}
        deliveredBy={deliveredBy}
        personalMessage={personalMessage}
        deliverables={deliverables}
        accentColor={accentColor}
      />

      <FooterSection />
    </main>
  );
}
