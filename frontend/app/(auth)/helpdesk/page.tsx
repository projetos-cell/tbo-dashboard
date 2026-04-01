"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState, EmptyState } from "@/components/shared";
import { RBACGuard } from "@/components/rbac-guard";
import { HelpdeskKpiCards } from "@/features/helpdesk/components/helpdesk-kpi-cards";
import { TicketCard } from "@/features/helpdesk/components/ticket-card";
import { TicketDetail } from "@/features/helpdesk/components/ticket-detail";
import { TicketForm } from "@/features/helpdesk/components/ticket-form";
import { FaqSection } from "@/features/helpdesk/components/faq-section";
import { useTickets } from "@/features/helpdesk/hooks/use-helpdesk";
import { useAuthStore } from "@/stores/auth-store";
import { IconPlus, IconSearch, IconTicket } from "@tabler/icons-react";
import type { HelpdeskTicket, TicketStatus } from "@/features/helpdesk/services/helpdesk";

type TabValue = "meus" | "todos" | "faq";

const STATUS_FILTERS: { value: TicketStatus | "all"; label: string }[] = [
  { value: "all",         label: "Todos"        },
  { value: "aberto",      label: "Abertos"      },
  { value: "em_andamento",label: "Em andamento" },
  { value: "aguardando",  label: "Aguardando"   },
  { value: "resolvido",   label: "Resolvidos"   },
  { value: "fechado",     label: "Fechados"     },
];

function TicketGrid({
  myOnly,
  statusFilter,
  search,
}: {
  myOnly: boolean;
  statusFilter: TicketStatus | "all";
  search: string;
}) {
  const [selected, setSelected] = useState<HelpdeskTicket | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const userId = useAuthStore((s) => s.user?.id);

  const { data: tickets = [], isLoading, isError, refetch } = useTickets({
    status: statusFilter !== "all" ? statusFilter : undefined,
    my_only: myOnly,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return tickets;
    const q = search.toLowerCase();
    return tickets.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [tickets, search]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState message="Erro ao carregar chamados" onRetry={() => refetch()} />;
  }

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={IconTicket}
        title={myOnly ? "Você não tem chamados" : "Nenhum chamado encontrado"}
        description={
          myOnly
            ? "Abra um chamado se precisar de suporte técnico."
            : "Nenhum chamado corresponde aos filtros aplicados."
        }
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onClick={() => {
              setSelected(ticket);
              setDetailOpen(true);
            }}
          />
        ))}
      </div>

      <TicketDetail
        ticket={selected}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelected(null);
        }}
      />
    </>
  );
}

export default function HelpdeskPage() {
  const [tab, setTab] = useState<TabValue>("meus");
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const role = useAuthStore((s) => s.role) ?? "colaborador";
  const isStaff = ["founder", "diretoria", "lider"].includes(role);

  return (
    <RBACGuard minRole="colaborador">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">IT Helpdesk</h1>
            <p className="text-muted-foreground">
              Suporte técnico interno — abra chamados e acompanhe seu status.
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)} className="gap-1.5 shrink-0">
            <IconPlus className="h-4 w-4" />
            Abrir chamado
          </Button>
        </div>

        {/* KPIs (staff only) */}
        {isStaff && <HelpdeskKpiCards />}

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
          <TabsList>
            <TabsTrigger value="meus">Meus chamados</TabsTrigger>
            {isStaff && <TabsTrigger value="todos">Todos os chamados</TabsTrigger>}
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          {(tab === "meus" || tab === "todos") && (
            <div className="mt-4 space-y-3">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative max-w-xs flex-1">
                  <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar chamados..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Status pills */}
              <div className="flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                      statusFilter === f.value
                        ? "bg-foreground text-background border-foreground"
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <TabsContent value="meus" className="mt-4">
            <TicketGrid
              myOnly
              statusFilter={statusFilter}
              search={search}
            />
          </TabsContent>

          {isStaff && (
            <TabsContent value="todos" className="mt-4">
              <TicketGrid
                myOnly={false}
                statusFilter={statusFilter}
                search={search}
              />
            </TabsContent>
          )}

          <TabsContent value="faq" className="mt-4">
            <FaqSection />
          </TabsContent>
        </Tabs>

        <TicketForm open={formOpen} onOpenChange={setFormOpen} />
      </div>
    </RBACGuard>
  );
}
