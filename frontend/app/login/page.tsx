"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function TboOrbits() {
  return (
    <div className="tbo-orbits" aria-hidden="true">
      {/* Orbit ring (visible track) */}
      <div className="orbit-ring" />

      {/* Circle 1 — top-left, gray */}
      <div className="orbit-path orbit-1">
        <div className="circle c1" />
      </div>

      {/* Circle 2 — bottom-left, gray */}
      <div className="orbit-path orbit-2">
        <div className="circle c2" />
      </div>

      {/* Circle 3 — bottom-right, gray */}
      <div className="orbit-path orbit-3">
        <div className="circle c3" />
      </div>

      {/* Center connector — orange gradient (the TBO "spark") */}
      <div className="center-spark" />

      <style jsx>{`
        .tbo-orbits {
          position: relative;
          width: 120px;
          height: 120px;
        }
        .orbit-ring {
          position: absolute;
          inset: 8px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.04);
        }
        .orbit-path {
          position: absolute;
          inset: 0;
          animation: spin 3s linear infinite;
        }
        .orbit-1 { animation-delay: 0s; }
        .orbit-2 { animation-delay: -1s; }
        .orbit-3 { animation-delay: -2s; }
        .circle {
          position: absolute;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          box-shadow: 0 0 20px rgba(255,98,0,0.15);
        }
        .c1 {
          background: #e0e0e0;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
        }
        .c2 {
          background: #c8c8c8;
          bottom: 8px;
          left: 12px;
        }
        .c3 {
          background: #d4d4d4;
          bottom: 8px;
          right: 12px;
        }
        .center-spark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e85102, #ec7602);
          box-shadow: 0 0 24px rgba(232,81,2,0.4), 0 0 60px rgba(232,81,2,0.15);
          animation: sparkPulse 2s ease-in-out infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes sparkPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-tbo-orange/[0.03] blur-[100px] animate-[ambientPulse_4s_ease-in-out_infinite]" />
      </div>

      <div className="relative flex flex-col items-center gap-8">
        {/* TBO Orbiting Circles */}
        <div className="opacity-0 animate-[fadeInScale_0.6s_ease-out_forwards]">
          <TboOrbits />
        </div>

        {/* Brand text */}
        <div className="flex flex-col items-center gap-1 opacity-0 animate-[fadeIn_0.5s_ease-out_0.3s_forwards]">
          <span className="text-lg font-bold tracking-widest text-white/80">TBO</span>
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/20 font-light">Gestão & Operações</span>
        </div>

        {/* Progress bar */}
        <div className="w-40 h-[2px] rounded-full bg-white/[0.06] overflow-hidden opacity-0 animate-[fadeIn_0.3s_ease-out_0.5s_forwards]">
          <div className="h-full rounded-full bg-gradient-to-r from-tbo-orange/60 via-tbo-orange to-tbo-orange/60 animate-[loadBar_2.2s_ease-in-out_forwards]" />
        </div>

        {/* Status text */}
        <p className="text-xs font-light text-white/25 tracking-wide opacity-0 animate-[fadeIn_0.4s_ease-out_0.7s_forwards]">
          Preparando seu ambiente
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes loadBar {
          0% { width: 0%; }
          20% { width: 30%; }
          50% { width: 60%; }
          75% { width: 85%; }
          100% { width: 100%; }
        }
        @keyframes ambientPulse {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // Traduzir mensagens de erro comuns
      const messages: Record<string, string> = {
        "Invalid login credentials": "Email ou senha incorretos.",
        "Email not confirmed": "Confirme seu email antes de entrar.",
        "Too many requests": "Muitas tentativas. Aguarde um momento.",
      };
      setError(messages[authError.message] ?? authError.message);
      setLoading(false);
      return;
    }

    // Login OK — mostrar splash antes de redirecionar
    setShowSplash(true);
    setTimeout(() => {
      router.push("/projetos");
      router.refresh();
    }, 2200);
  }

  async function handleGoogleLogin() {
    setError(null);
    setGoogleLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setGoogleLoading(false);
    }
  }

  if (showSplash) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">TBO Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Entre com suas credenciais</p>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {googleLoading ? "Redirecionando..." : "Continuar com Google"}
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">ou</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-tbo-orange/40 focus:border-tbo-orange transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-900"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-tbo-orange/40 focus:border-tbo-orange transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
              <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="relative w-full rounded-lg bg-tbo-orange px-4 py-2.5 text-sm font-medium text-white hover:bg-tbo-orange/90 disabled:cursor-not-allowed transition-all duration-200 overflow-hidden"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Autenticando...
              </span>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
