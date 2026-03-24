"use client";

import { useState } from "react";
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4">
      {/* Background gradient accent */}
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, #E85102 0%, transparent 70%)",
        }}
      />

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
          <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
            {SURVEY_INTRO.body.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
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
          <div className="flex items-center justify-center gap-3 text-xs text-zinc-600">
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
