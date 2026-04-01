"use client";

import { useState, useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared";
import { useFaqs } from "@/features/helpdesk/hooks/use-helpdesk";
import { IconSearch, IconHelp } from "@tabler/icons-react";

export function FaqSection() {
  const { data: faqs = [], isLoading } = useFaqs();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return faqs;
    const q = search.toLowerCase();
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
    );
  }, [faqs, search]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof faqs> = {};
    for (const faq of filtered) {
      if (!map[faq.category]) map[faq.category] = [];
      map[faq.category].push(faq);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar nas perguntas frequentes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon={IconHelp}
          title="Nenhuma resposta encontrada"
          description={
            search
              ? "Tente outros termos ou abra um chamado."
              : "Nenhuma FAQ cadastrada ainda."
          }
        />
      )}

      {!isLoading && grouped.map(([category, items]) => (
        <div key={category} className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground capitalize">
            {category}
          </p>
          <Accordion type="multiple" className="rounded-md border">
            {items.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="border-b last:border-b-0">
                <AccordionTrigger className="px-4 text-sm text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
}
