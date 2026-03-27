"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { IconPlus, IconTrash, IconGripVertical } from "@tabler/icons-react";
import type { ServiceRow } from "@/features/comercial/services/services-catalog";

export interface ProposalItemDraft {
  id?: string; // undefined = new
  service_id: string | null;
  title: string;
  description: string;
  bu: string;
  quantity: number;
  unit_price: number;
  discount_pct: number;
  observations: string;
}

interface Props {
  items: ProposalItemDraft[];
  services: ServiceRow[];
  onChange: (items: ProposalItemDraft[]) => void;
}

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function itemSubtotal(item: ProposalItemDraft) {
  return item.quantity * item.unit_price * (1 - item.discount_pct / 100);
}

const BU_ORDER = ["Digital 3D", "Branding", "Marketing", "Audiovisual", "Gamificação", "Interiores"];

export function ProposalItemsEditor({ items, services, onChange }: Props) {
  const [addBu, setAddBu] = useState<string>("");
  const [addServiceId, setAddServiceId] = useState<string>("");

  const servicesByBU = useMemo(() => {
    const map = new Map<string, ServiceRow[]>();
    for (const s of services.filter((s) => s.status === "active")) {
      const bu = s.bu ?? "Outros";
      if (!map.has(bu)) map.set(bu, []);
      map.get(bu)!.push(s);
    }
    return map;
  }, [services]);

  const buOptions = useMemo(() => {
    const fromServices = Array.from(servicesByBU.keys());
    const ordered = BU_ORDER.filter((b) => fromServices.includes(b));
    const rest = fromServices.filter((b) => !BU_ORDER.includes(b));
    return [...ordered, ...rest];
  }, [servicesByBU]);

  const filteredServices = useMemo(
    () => (addBu ? (servicesByBU.get(addBu) ?? []) : []),
    [addBu, servicesByBU],
  );

  function handleAddService() {
    const svc = services.find((s) => s.id === addServiceId);
    if (!svc) return;
    const draft: ProposalItemDraft = {
      service_id: svc.id,
      title: svc.name,
      description: svc.description ?? "",
      bu: svc.bu ?? "",
      quantity: 1,
      unit_price: svc.base_price,
      discount_pct: 0,
      observations: "",
    };
    onChange([...items, draft]);
    setAddServiceId("");
  }

  function handleAddManual() {
    onChange([
      ...items,
      {
        service_id: null,
        title: "Serviço personalizado",
        description: "",
        bu: "",
        quantity: 1,
        unit_price: 0,
        discount_pct: 0,
        observations: "",
      },
    ]);
  }

  function updateItem(index: number, patch: Partial<ProposalItemDraft>) {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      {/* Add from catalog */}
      <div className="rounded-lg border border-dashed p-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Adicionar do catálogo</p>
        <div className="flex gap-2 flex-wrap">
          <Select value={addBu} onValueChange={(v) => { setAddBu(v); setAddServiceId(""); }}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="BU..." />
            </SelectTrigger>
            <SelectContent>
              {buOptions.map((b) => (
                <SelectItem key={b} value={b} className="text-xs">{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={addServiceId}
            onValueChange={setAddServiceId}
            disabled={!addBu}
          >
            <SelectTrigger className="flex-1 min-w-48 h-8 text-xs">
              <SelectValue placeholder={addBu ? "Selecione o serviço..." : "Escolha uma BU primeiro"} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="text-xs">{addBu}</SelectLabel>
                {filteredServices.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">
                    {s.name} — {formatBRL(s.base_price)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            type="button"
            size="sm"
            className="h-8"
            disabled={!addServiceId}
            onClick={handleAddService}
          >
            <IconPlus className="h-3.5 w-3.5 mr-1" />
            Adicionar
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-muted-foreground"
            onClick={handleAddManual}
          >
            + Item manual
          </Button>
        </div>
      </div>

      {/* Items list */}
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum item adicionado. Selecione serviços do catálogo ou adicione manualmente.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="rounded-lg border bg-card p-3 space-y-2">
              {/* Row 1: drag handle + title + bu + remove */}
              <div className="flex items-start gap-2">
                <IconGripVertical className="h-4 w-4 text-muted-foreground/40 mt-1 shrink-0 cursor-grab" />
                <div className="flex-1 space-y-1.5">
                  <Input
                    value={item.title}
                    onChange={(e) => updateItem(index, { title: e.target.value })}
                    className="h-7 text-sm font-medium border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="Nome do serviço"
                  />
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, { description: e.target.value })}
                    className="h-6 text-xs border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-muted-foreground"
                    placeholder="Descrição (opcional)"
                  />
                </div>
                {item.bu && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {item.bu}
                  </Badge>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => removeItem(index)}
                >
                  <IconTrash className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Row 2: qty, unit_price, discount, subtotal */}
              <div className="flex items-end gap-3 flex-wrap pl-6">
                <div className="space-y-0.5">
                  <Label className="text-xs text-muted-foreground">Qtd</Label>
                  <Input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={item.quantity}
                    onChange={(e) => updateItem(index, { quantity: parseFloat(e.target.value) || 1 })}
                    className="h-7 w-16 text-xs"
                  />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-xs text-muted-foreground">Preço unit. (R$)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={100}
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, { unit_price: parseFloat(e.target.value) || 0 })}
                    className="h-7 w-28 text-xs"
                  />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-xs text-muted-foreground">Desconto (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={item.discount_pct}
                    onChange={(e) => updateItem(index, { discount_pct: parseFloat(e.target.value) || 0 })}
                    className="h-7 w-20 text-xs"
                  />
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-muted-foreground">Subtotal</p>
                  <p className="text-sm font-semibold">{formatBRL(itemSubtotal(item))}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
