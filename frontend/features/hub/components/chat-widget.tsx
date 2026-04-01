"use client";

import Link from "next/link";
import { IconArrowUpRight, IconMessage } from "@tabler/icons-react";

export function ChatWidget() {
  return (
    <Link href="/chat" className="block group">
      <div className="relative overflow-hidden p-5 rounded-2xl bg-foreground/75 backdrop-blur-[16px] backdrop-saturate-[180%] border border-white/[0.08] shadow-[0_8px_32px_rgba(15,15,15,0.15)]">
        {/* Decorative circles */}
        <div className="absolute inset-0 opacity-[0.06]">
          <div className="absolute -top-6 -right-6 size-24 border-2 border-white rounded-full" />
          <div className="absolute bottom-1 left-1 size-10 border-2 border-white rounded-full" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 flex items-center justify-center rounded-xl bg-hub-orange/20">
              <IconMessage className="size-5 text-hub-orange" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Chat</h3>
              <p className="text-[11px] text-white/50">Mensagens e canais</p>
            </div>
          </div>

          <div className="w-full py-2 text-center text-[11px] font-semibold uppercase tracking-[0.1em] rounded-lg transition-colors bg-white/[0.08] group-hover:bg-white/15 text-hub-orange">
            Abrir Chat
            <IconArrowUpRight className="inline size-3 ml-1 -mt-px" />
          </div>
        </div>
      </div>
    </Link>
  );
}
