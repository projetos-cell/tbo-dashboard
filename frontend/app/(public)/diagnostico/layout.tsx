export const dynamic = "force-dynamic"

export default function DiagnosticoPublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#f4f4f2]">
      {/* Topbar */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-black/5 bg-white/80 px-6 backdrop-blur-sm md:px-12">
        <div className="flex items-center gap-5">
          <span className="text-sm font-extrabold tracking-tight uppercase">
            TBO <span className="text-[#b8f724]">Academy</span>
          </span>
          <div className="h-4 w-px bg-black/10" />
          <span className="text-[11px] font-normal tracking-[1.5px] uppercase text-zinc-400">
            Diagnóstico de Maturidade
          </span>
        </div>
        <span className="text-[9px] font-semibold tracking-[1.5px] uppercase rounded bg-[#b8f724]/10 px-3 py-1 text-[#7da01a]">
          Beta v1.0
        </span>
      </header>

      <main className="pt-14">{children}</main>
    </div>
  )
}
