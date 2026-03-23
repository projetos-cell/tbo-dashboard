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

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
          <p className="text-sm text-zinc-400">Carregando pesquisa...</p>
        </div>
      </div>
    );
  }

  if (state.status === "invalid") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
        <div className="text-center space-y-3 max-w-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Link inválido</h1>
          <p className="text-zinc-500">
            Este link de pesquisa não foi encontrado ou já expirou. Verifique se copiou o link corretamente.
          </p>
        </div>
      </div>
    );
  }

  if (state.status === "closed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
        <div className="text-center space-y-3 max-w-md">
          <h1 className="text-2xl font-bold text-zinc-900">Pesquisa encerrada</h1>
          <p className="text-zinc-500">
            Esta pesquisa de clima já foi encerrada. Obrigado pelo interesse!
          </p>
        </div>
      </div>
    );
  }

  if (state.status === "used") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
        <div className="text-center space-y-3 max-w-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Resposta já enviada</h1>
          <p className="text-zinc-500">
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
