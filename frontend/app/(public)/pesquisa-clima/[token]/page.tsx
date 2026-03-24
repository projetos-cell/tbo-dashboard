"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ClimateSurveyForm } from "./survey-form";

interface TokenValidation {
  valid: boolean;
  status: "loading" | "ok" | "invalid" | "used" | "closed";
  tokenId?: string;
  surveyId?: string;
  surveyTitle?: string;
}

// Shared background gradient
function BgGradient() {
  return (
    <div
      className="pointer-events-none fixed inset-0 opacity-20"
      style={{
        background:
          "radial-gradient(ellipse 60% 40% at 50% 0%, #E85102 0%, transparent 70%)",
      }}
    />
  );
}

export default function PesquisaClimaPage() {
  const params = useParams<{ token: string }>();
  const [state, setState] = useState<TokenValidation>({
    valid: false,
    status: "loading",
  });

  useEffect(() => {
    async function validate() {
      try {
        const res = await fetch(`/api/pesquisa-clima/validate?token=${params.token}`);
        const data = await res.json();
        setState(data);
      } catch {
        setState({ valid: false, status: "invalid" });
      }
    }
    if (params.token) validate();
  }, [params.token]);

  // Disable right-click
  useEffect(() => {
    function block(e: MouseEvent) {
      e.preventDefault();
    }
    document.addEventListener("contextmenu", block);
    return () => document.removeEventListener("contextmenu", block);
  }, []);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <BgGradient />
        <div className="relative flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700"
            style={{ borderTopColor: "#E85102" }}
          />
          <p className="text-sm text-zinc-500">Carregando pesquisa...</p>
        </div>
      </div>
    );
  }

  if (state.status === "invalid") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
        <BgGradient />
        <div className="relative text-center space-y-3 max-w-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Link inválido</h1>
          <p className="text-zinc-400">
            Este link de pesquisa não foi encontrado ou já expirou. Verifique se copiou o link corretamente.
          </p>
        </div>
      </div>
    );
  }

  if (state.status === "closed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
        <BgGradient />
        <div className="relative text-center space-y-3 max-w-md">
          <h1 className="text-2xl font-bold text-white">Pesquisa encerrada</h1>
          <p className="text-zinc-400">
            Esta pesquisa de clima já foi encerrada. Obrigado pelo interesse!
          </p>
        </div>
      </div>
    );
  }

  if (state.status === "used") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
        <BgGradient />
        <div className="relative text-center space-y-3 max-w-md">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: "rgba(232, 81, 2, 0.15)" }}
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="#E85102" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Resposta já enviada</h1>
          <p className="text-zinc-400">
            Você já respondeu esta pesquisa de clima. Obrigado pela participação!
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClimateSurveyForm
      token={params.token}
      tokenId={state.tokenId!}
      surveyId={state.surveyId!}
      surveyTitle={state.surveyTitle!}
    />
  );
}
