"use client";

import { useState, useMemo, useCallback } from "react";
import {
  IconTool,
  IconSearch,
  IconInfoCircle,
  IconCheck,
  IconCopy,
  IconEye,
  IconEyeOff,
  IconKey,
  IconMail,
  IconExternalLink,
  IconLock,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import {
  FERRAMENTAS_CATEGORIAS,
  FERRAMENTAS_BOAS_PRATICAS,
  type TBOToolCredential,
} from "@/features/cultura/data/cultura-notion-seed";

function CredentialRow({ cred }: { cred: TBOToolCredential }) {
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copiado!`);
    });
  }, []);

  const methodBadge = {
    google: { label: "Google", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    email: { label: "E-mail/Senha", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    corporativo: { label: "Corporativo", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  }[cred.method];

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <IconKey className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">{cred.label}</span>
        </div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${methodBadge.color}`}>
          {methodBadge.label}
        </span>
      </div>

      {/* Email */}
      <div className="flex items-center gap-2">
        <IconMail className="size-3.5 text-muted-foreground shrink-0" />
        <code className="text-xs bg-background px-2 py-1 rounded flex-1 font-mono">
          {cred.email}
        </code>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => copyToClipboard(cred.email, "E-mail")}
        >
          <IconCopy className="size-3" />
        </Button>
      </div>

      {/* Password */}
      {cred.password && (
        <div className="flex items-center gap-2">
          <IconLock className="size-3.5 text-muted-foreground shrink-0" />
          <code className="text-xs bg-background px-2 py-1 rounded flex-1 font-mono">
            {showPassword ? cred.password : "••••••••••••"}
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => setShowPassword((p) => !p)}
          >
            {showPassword ? <IconEyeOff className="size-3" /> : <IconEye className="size-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => copyToClipboard(cred.password!, "Senha")}
          >
            <IconCopy className="size-3" />
          </Button>
        </div>
      )}

      {/* URL */}
      {cred.url && (
        <div className="flex items-center gap-2">
          <IconExternalLink className="size-3.5 text-muted-foreground shrink-0" />
          <a
            href={cred.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate"
          >
            {cred.url}
          </a>
        </div>
      )}

      {/* Notes */}
      {cred.notes && (
        <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
          {cred.notes}
        </p>
      )}
    </div>
  );
}

function ToolCard({ tool }: { tool: (typeof FERRAMENTAS_CATEGORIAS)[number]["tools"][number] }) {
  const [open, setOpen] = useState(false);
  const hasCredentials = tool.credentials && tool.credentials.length > 0;
  const hasPassword = tool.credentials?.some((c) => c.password);

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium">{tool.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
          </div>
          {hasPassword && (
            <Badge variant="outline" className="text-[10px] shrink-0 border-amber-300 text-amber-600 dark:text-amber-400">
              <IconKey className="size-2.5 mr-0.5" />
              Senha
            </Badge>
          )}
        </div>

        {hasCredentials && (
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full h-7 text-xs gap-1.5">
                <IconKey className="size-3" />
                {open ? "Ocultar acesso" : "Ver acesso"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              {tool.credentials!.map((cred, idx) => (
                <CredentialRow key={idx} cred={cred} />
              ))}
              {tool.accessNotes && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-md px-2.5 py-1.5 leading-relaxed">
                  ⚠️ {tool.accessNotes}
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

export default function FerramentasPage() {
  const [search, setSearch] = useState("");

  const filteredCategorias = useMemo(() => {
    if (!search.trim()) return FERRAMENTAS_CATEGORIAS;
    const q = search.toLowerCase();
    return FERRAMENTAS_CATEGORIAS.map((cat) => ({
      ...cat,
      tools: cat.tools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.tools.length > 0);
  }, [search]);

  const totalTools = FERRAMENTAS_CATEGORIAS.reduce(
    (acc, cat) => acc + cat.tools.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <IconTool className="size-5" />
            Guia de Ferramentas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ferramentas oficiais, credenciais de acesso e boas praticas
          </p>
        </div>
        <Badge variant="secondary">{totalTools} ferramentas</Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar ferramentas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      {/* Boas Praticas */}
      {!search.trim() && (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <IconInfoCircle className="size-4 text-blue-600 dark:text-blue-400" />
              Boas Praticas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-1.5">
              {FERRAMENTAS_BOAS_PRATICAS.map((pratica, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <IconCheck className="size-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <span>{pratica}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      {filteredCategorias.length > 0 ? (
        filteredCategorias.map((cat) => (
          <section key={cat.id} className="space-y-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <span>{cat.emoji}</span>
              {cat.name}
              <Badge variant="outline" className="text-xs font-normal">
                {cat.tools.length}
              </Badge>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cat.tools.map((tool) => (
                <ToolCard key={tool.name} tool={tool} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <IconTool className="size-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhuma ferramenta encontrada para &ldquo;{search}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
