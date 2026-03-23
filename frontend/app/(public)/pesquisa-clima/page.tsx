"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SURVEY_INTRO, SURVEY_SECTIONS, SURVEY_QUESTIONS } from "@/features/pesquisa-clima/constants";

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
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 p-4 pt-12 md:pt-20">
      <div className="w-full max-w-lg space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center">
            <span className="text-white text-xs font-bold">TBO</span>
          </div>
          <span className="text-sm font-medium text-zinc-400">
            Pesquisa de Clima
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8 shadow-sm space-y-5">
          <h1 className="text-xl md:text-2xl font-bold text-zinc-900">
            {SURVEY_INTRO.title}
          </h1>

          <div className="space-y-4 text-sm text-zinc-600 leading-relaxed">
            <p className="font-medium text-zinc-900">{SURVEY_INTRO.greeting}</p>
            {SURVEY_INTRO.body.split("\n\n").map((paragraph, i) => (
              <p
                key={i}
                dangerouslySetInnerHTML={{
                  __html: paragraph.replace(
                    /\*\*(.*?)\*\*/g,
                    '<strong class="text-zinc-900">$1</strong>'
                  ),
                }}
              />
            ))}
          </div>

          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 flex items-start gap-2">
            <svg
              className="h-5 w-5 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>
              <strong>100% anônima.</strong> Nenhum dado pessoal é coletado.
              Suas respostas não são vinculadas à sua identidade.
            </span>
          </div>

          <p className="text-sm font-semibold text-zinc-900">
            {SURVEY_INTRO.cta}
          </p>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleStart}
            disabled={loading}
            className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Preparando..." : "Começar pesquisa"}
          </button>

          <div className="flex items-center justify-center gap-4 text-xs text-zinc-400">
            <span>{SURVEY_SECTIONS.length} seções</span>
            <span>·</span>
            <span>{SURVEY_QUESTIONS.length} perguntas</span>
            <span>·</span>
            <span>~9 min</span>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-300">Powered by TBO OS</p>
      </div>
    </div>
  );
}
