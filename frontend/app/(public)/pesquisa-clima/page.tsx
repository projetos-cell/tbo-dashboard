"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  SURVEY_INTRO,
  SURVEY_SECTIONS,
  SURVEY_QUESTIONS,
} from "@/features/pesquisa-clima/constants";

export default function PesquisaClimaEntryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Disable right-click
  useEffect(() => {
    function block(e: MouseEvent) { e.preventDefault(); }
    document.addEventListener("contextmenu", block);
    return () => document.removeEventListener("contextmenu", block);
  }, []);

  async function handleStart() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/pesquisa-clima/start", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao iniciar pesquisa.");
        return;
      }

      if (data.token) {
        router.push(`/pesquisa-clima/${data.token}`);
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4 overflow-hidden">
      {/* Japanese gradient background — full bleed, smooth accelerated motion */}
      <style>{`
        @keyframes jp-orbit-1 {
          0%   { transform: translate(0, 0) scale(1) rotate(0deg); }
          14%  { transform: translate(12%, -14%) scale(1.18) rotate(4deg); }
          32%  { transform: translate(-6%, -8%) scale(0.92) rotate(-2deg); }
          48%  { transform: translate(-16%, 10%) scale(1.1) rotate(-5deg); }
          67%  { transform: translate(8%, 16%) scale(0.88) rotate(3deg); }
          83%  { transform: translate(14%, -4%) scale(1.14) rotate(-1deg); }
          100% { transform: translate(0, 0) scale(1) rotate(0deg); }
        }
        @keyframes jp-orbit-2 {
          0%   { transform: translate(0, 0) scale(1.05) rotate(0deg); }
          18%  { transform: translate(-14%, -10%) scale(0.9) rotate(-4deg); }
          36%  { transform: translate(-8%, 14%) scale(1.2) rotate(2deg); }
          52%  { transform: translate(16%, 6%) scale(0.88) rotate(5deg); }
          71%  { transform: translate(10%, -12%) scale(1.12) rotate(-3deg); }
          88%  { transform: translate(-4%, -6%) scale(1.02) rotate(1deg); }
          100% { transform: translate(0, 0) scale(1.05) rotate(0deg); }
        }
        @keyframes jp-orbit-3 {
          0%   { transform: translate(0, 0) scale(1); }
          22%  { transform: translate(10%, 14%) scale(1.22) rotate(3deg); }
          41%  { transform: translate(-14%, 6%) scale(0.86) rotate(-4deg); }
          58%  { transform: translate(-8%, -12%) scale(1.14) rotate(2deg); }
          76%  { transform: translate(12%, -6%) scale(0.92) rotate(-2deg); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes jp-orbit-4 {
          0%   { transform: translate(0, 0) scale(1) rotate(0deg); }
          16%  { transform: translate(-12%, -8%) scale(1.16) rotate(-3deg); }
          35%  { transform: translate(6%, -16%) scale(0.9) rotate(5deg); }
          53%  { transform: translate(14%, 10%) scale(1.08) rotate(-4deg); }
          72%  { transform: translate(-6%, 14%) scale(0.94) rotate(2deg); }
          89%  { transform: translate(-14%, 2%) scale(1.12) rotate(-1deg); }
          100% { transform: translate(0, 0) scale(1) rotate(0deg); }
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Base: near-black */}
        <div className="absolute inset-0 bg-zinc-950" />

        {/* Orange blob */}
        <div className="absolute h-[72vh] w-[58vw] top-[5%] left-[30%]" style={{
          background: "radial-gradient(circle at 50% 50%, rgba(220, 100, 30, 0.95) 0%, rgba(200, 75, 15, 0.4) 45%, transparent 70%)",
          animation: "jp-orbit-1 8s cubic-bezier(0.4, 0, 0.2, 1) infinite",
          filter: "blur(50px)",
        }} />

        {/* Cream highlight — top-right to balance */}
        <div className="absolute h-[52vh] w-[46vw] top-[-10%] right-[-10%]" style={{
          background: "radial-gradient(circle at 50% 50%, rgba(240, 228, 210, 0.8) 0%, rgba(220, 200, 170, 0.2) 45%, transparent 65%)",
          animation: "jp-orbit-2 11s cubic-bezier(0.4, 0, 0.2, 1) infinite",
          filter: "blur(45px)",
        }} />

        {/* Dark plum — bottom */}
        <div className="absolute h-[58vh] w-[65vw] bottom-[-12%] left-[0%]" style={{
          background: "radial-gradient(circle at 50% 50%, rgba(55, 20, 28, 0.9) 0%, rgba(70, 30, 35, 0.25) 50%, transparent 70%)",
          animation: "jp-orbit-3 9s cubic-bezier(0.4, 0, 0.2, 1) infinite",
          filter: "blur(50px)",
        }} />

        {/* Sienna accent — fast */}
        <div className="absolute h-[46vh] w-[39vw] top-[25%] right-[0%]" style={{
          background: "radial-gradient(circle at 50% 50%, rgba(180, 70, 15, 0.7) 0%, rgba(150, 55, 10, 0.15) 50%, transparent 70%)",
          animation: "jp-orbit-4 7s cubic-bezier(0.4, 0, 0.2, 1) infinite",
          filter: "blur(55px)",
        }} />

        {/* Grain */}
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.06'/%3E%3C/svg%3E")`,
          opacity: 0.45,
        }} />

        {/* Radial overlay — darker at center (card area), lighter at edges */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.25) 100%)",
        }} />
      </div>

      <div className="relative w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/logo-tbo-dark.svg"
            alt="TBO"
            width={120}
            height={40}
            priority
          />
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 md:p-8 shadow-2xl backdrop-blur-sm space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#E85102" }}
            >
              {SURVEY_INTRO.edition}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {SURVEY_INTRO.title}
            </h1>
          </div>

          {/* Body */}
          <div className="space-y-4 leading-relaxed">
            {SURVEY_INTRO.body.split("\n\n").map((paragraph, i) => (
              <p key={i} className={i === 0 ? "text-base text-zinc-300" : "text-sm text-zinc-400"}>{paragraph}</p>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-800" />

          {/* Anonymity badge */}
          <div className="flex items-start gap-3 rounded-xl bg-zinc-800/60 p-4">
            <div
              className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ background: "rgba(232, 81, 2, 0.15)" }}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#E85102"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {SURVEY_INTRO.anonymity}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            type="button"
            onClick={handleStart}
            disabled={loading}
            className="w-full rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #E85102 0%, #EC7602 100%)",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Preparando...
              </span>
            ) : (
              SURVEY_INTRO.cta
            )}
          </button>

          {/* Meta */}
          <div className="flex items-center justify-center gap-3 text-xs text-zinc-500">
            <span>{SURVEY_SECTIONS.length} seções</span>
            <span className="text-zinc-700">·</span>
            <span>{SURVEY_QUESTIONS.length} perguntas</span>
            <span className="text-zinc-700">·</span>
            <span>~9 min</span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-zinc-700">
          Powered by TBO OS
        </p>
      </div>
    </div>
  );
}
