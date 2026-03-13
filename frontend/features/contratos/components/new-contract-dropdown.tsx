"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconPlus, IconBuilding, IconUsers, IconFileOff, IconTruck, IconPencil } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

interface NewContractDropdownProps {
  onSelect: (category: string) => void;
}

const options = [
  {
    key: "cliente",
    label: "Cliente",
    description: "Contrato de prestação de serviços",
    icon: IconBuilding,
  },
  {
    key: "equipe",
    label: "Equipe",
    description: "Freelancer, CLT ou PJ interno",
    icon: IconUsers,
  },
  {
    key: "distrato",
    label: "Distrato",
    description: "Rescisão de contrato vigente",
    icon: IconFileOff,
  },
  {
    key: "fornecedor",
    label: "Fornecedor",
    description: "Serviço ou produto terceirizado",
    icon: IconTruck,
  },
];

export function NewContractDropdown({ onSelect }: NewContractDropdownProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white gap-2">
          <IconPlus className="h-4 w-4" />
          Novo Contrato
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <DropdownMenuItem
              key={opt.key}
              onClick={() => onSelect(opt.key)}
              className="flex items-start gap-3 py-2.5"
            >
              <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground">
                  {opt.description}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push("/contratos/novo")}
          className="flex items-start gap-3 py-2.5"
        >
          <IconPencil className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Contrato Completo</p>
            <p className="text-xs text-muted-foreground">
              Escopo, signatarios e Clicksign
            </p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
