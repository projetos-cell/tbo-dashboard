"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FolderPlus,
  ListPlus,
  CalendarPlus,
  Users,
  FileText,
  MessageSquare,
} from "lucide-react";

const actions = [
  { label: "Novo Projeto", href: "/projetos?action=new", icon: FolderPlus, color: "text-blue-600 bg-blue-50" },
  { label: "Nova Tarefa", href: "/tarefas?action=new", icon: ListPlus, color: "text-amber-600 bg-amber-50" },
  { label: "Novo Evento", href: "/agenda?action=new", icon: CalendarPlus, color: "text-green-600 bg-green-50" },
  { label: "Clientes", href: "/clientes", icon: Users, color: "text-purple-600 bg-purple-50" },
  { label: "Contratos", href: "/contratos", icon: FileText, color: "text-orange-600 bg-orange-50" },
  { label: "Chat", href: "/chat", icon: MessageSquare, color: "text-pink-600 bg-pink-50" },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Acoes Rapidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50"
              >
                <div className={`rounded-md p-1.5 ${action.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-medium">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
