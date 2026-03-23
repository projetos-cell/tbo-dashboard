"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconTrophy, IconArrowRight, IconFolder, IconCalendar, IconCurrencyReal } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";

// ── Types ────────────────────────────────────────────────

interface DealWonData {
  dealId: string;
  dealName: string;
  company: string;
  contact: string;
  contactEmail: string;
  value: number;
  services: string[];
  ownerName: string;
  projectId: string | null;
  projectCode: string | null;
  closedAt: string;
}

// ── Confetti burst ───────────────────────────────────────

function fireConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  const colors = ["#ff6200", "#ff9133", "#ffad66", "#0a0a0a", "#ffffff"];

  // Initial big burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors,
    zIndex: 9999,
  });

  // Continuous smaller bursts
  const interval = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(interval);
      return;
    }

    confetti({
      particleCount: 30,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
      zIndex: 9999,
    });
    confetti({
      particleCount: 30,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
      zIndex: 9999,
    });
  }, 250);
}

// ── Component ────────────────────────────────────────────

export function DealWonDrawer({
  open,
  onOpenChange,
  dealId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId: string | null;
}) {
  const router = useRouter();
  const [data, setData] = useState<DealWonData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDealData = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data: deal } = await supabase
        .from("crm_deals")
        .select("*")
        .eq("id", id)
        .single();

      if (!deal) return;

      // Find project created from this deal
      const { data: project } = await supabase
        .from("projects")
        .select("id, code")
        .eq("source", "deal_automation")
        .ilike("name", `%${deal.company}%`)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setData({
        dealId: deal.id,
        dealName: deal.name,
        company: deal.company ?? "",
        contact: deal.contact ?? "",
        contactEmail: deal.contact_email ?? "",
        value: Number(deal.value) || 0,
        services: deal.services ?? [],
        ownerName: deal.owner_name ?? "",
        projectId: project?.id ?? null,
        projectCode: project?.code ?? null,
        closedAt: deal.updated_at ?? deal.created_at ?? "",
      });
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && dealId) {
      fetchDealData(dealId);
    }
    if (!open) {
      setData(null);
    }
  }, [open, dealId, fetchDealData]);

  useEffect(() => {
    if (open && data) {
      const timer = setTimeout(fireConfetti, 200);
      return () => clearTimeout(timer);
    }
  }, [open, data]);

  const formattedValue = data
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(data.value)
    : "";

  const closedDate = data?.closedAt
    ? new Date(data.closedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : "";

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-lg">
        <DrawerHeader className="text-center pb-2">
          {/* Trophy icon with orange glow */}
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#fff4ec] to-[#ffe5cc]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6200] to-[#ff9133] shadow-lg shadow-[#ff6200]/30">
              <IconTrophy className="h-7 w-7 text-white" strokeWidth={2} />
            </div>
          </div>

          <DrawerTitle className="text-2xl font-extrabold tracking-tight">
            Deal Fechado!
          </DrawerTitle>
          <DrawerDescription className="text-muted-foreground">
            Mais um projeto conquistado pela TBO
          </DrawerDescription>
        </DrawerHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#ff6200] border-t-transparent" />
          </div>
        ) : data ? (
          <div className="px-6 pb-2 space-y-5">
            {/* Company + Project name */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground">{data.company}</h3>
              <p className="text-sm text-muted-foreground">{data.dealName.replace(data.company + " — ", "").replace(data.company + " - ", "")}</p>
            </div>

            {/* Value hero */}
            <div className="rounded-xl bg-gradient-to-br from-[#fff4ec] to-[#ffe5cc] border border-[#ffad66]/30 p-5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#993b00]">Valor do Contrato</p>
              <p className="mt-1 text-3xl font-black text-[#ff6200] tracking-tight">{formattedValue}</p>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <IconCurrencyReal className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Responsável</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-foreground">{data.ownerName}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <IconCalendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Fechamento</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-foreground">{closedDate}</p>
              </div>
            </div>

            {/* Contact */}
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Contato</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{data.contact}</p>
              <p className="text-xs text-muted-foreground">{data.contactEmail}</p>
            </div>

            {/* Services */}
            {data.services.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {data.services.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs font-medium">
                    {s}
                  </Badge>
                ))}
              </div>
            )}

            {/* Project code badge */}
            {data.projectCode && (
              <div className="flex items-center justify-center gap-2">
                <IconFolder className="h-4 w-4 text-[#ff6200]" strokeWidth={1.5} />
                <span className="text-sm font-bold text-[#ff6200]">{data.projectCode}</span>
                <span className="text-xs text-muted-foreground">criado automaticamente</span>
              </div>
            )}
          </div>
        ) : null}

        <DrawerFooter className="flex-row gap-3 pt-2">
          <DrawerClose asChild>
            <Button variant="outline" className="flex-1">
              Fechar
            </Button>
          </DrawerClose>
          {data?.projectId && (
            <Button
              className="flex-1 bg-[#ff6200] hover:bg-[#cc4e00] text-white font-semibold"
              onClick={() => {
                onOpenChange(false);
                router.push(`/projetos?id=${data.projectId}`);
              }}
            >
              Ver Projeto
              <IconArrowRight className="ml-1 h-4 w-4" strokeWidth={2} />
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
