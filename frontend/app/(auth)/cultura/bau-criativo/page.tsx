"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  IconPalette,
  IconSearch,
  IconChevronDown,
  IconChevronUp,
  IconExternalLink,
  IconPlus,
  IconBox,
} from "@tabler/icons-react"
import { BAU_CRIATIVO } from "@/features/cultura/data/cultura-notion-seed"
import { EmptyState } from "@/components/shared"
import { BauContributeDialog } from "@/features/cultura/components/bau-contribute-dialog"
import { useBauReferences } from "@/features/cultura/hooks/use-bau-criativo"

// ─── SubcategoryCard — fetches refs from Supabase when expanded ──────────────

interface SubcategoryCardProps {
  sub: { id: string; name: string; description: string }
}

function SubcategoryCard({ sub }: SubcategoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { data: refs = [], isLoading } = useBauReferences(sub.id, isExpanded)

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col gap-3 pt-6">
        <h3 className="font-semibold">{sub.name}</h3>
        <p className="text-sm text-muted-foreground">{sub.description}</p>

        {isExpanded && (
          isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ) : refs.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              Nenhuma referência aprovada ainda.
            </p>
          ) : (
            <ul className="space-y-2">
              {refs.map((ref) => (
                <li key={ref.name} className="rounded-md border bg-muted/30 p-2 text-xs">
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    <IconExternalLink className="h-3 w-3 shrink-0" />
                    {ref.name}
                  </a>
                  <p className="text-muted-foreground mt-0.5">{ref.description}</p>
                </li>
              ))}
            </ul>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          className="mt-auto gap-2 self-start"
          onClick={() => setIsExpanded((v) => !v)}
        >
          <IconExternalLink className="h-4 w-4" />
          {isExpanded ? "Ocultar referências" : "Ver referências"}
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function BauCriativoPage() {
  const [search, setSearch] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(BAU_CRIATIVO.map((cat) => [cat.id, true]))
  )
  const [showContributeDialog, setShowContributeDialog] = useState(false)

  const filteredCategories = BAU_CRIATIVO.map((category) => ({
    ...category,
    subcategories: category.subcategories.filter(
      (sub) =>
        sub.name.toLowerCase().includes(search.toLowerCase()) ||
        sub.description.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((category) => category.subcategories.length > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <IconBox className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Baú Criativo</h1>
            <p className="text-sm text-muted-foreground">
              Referências, ferramentas e inspirações para o dia a dia criativo
            </p>
          </div>
        </div>
        <Button onClick={() => setShowContributeDialog(true)} className="gap-2">
          <IconPlus className="h-4 w-4" />
          Contribuir referência
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar subcategorias..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Intro callout */}
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
        <CardContent className="flex items-start gap-3 pt-6">
          <IconPalette className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-900 dark:text-amber-200">
            Aprenda com quem já fez. Fonte viva de referências segmentadas por setor da TBO.
          </p>
        </CardContent>
      </Card>

      {/* Categories */}
      {filteredCategories.length === 0 ? (
        <EmptyState
          icon={IconSearch}
          title="Nenhuma subcategoria encontrada"
          description="Tente buscar por outro termo."
          cta={
            search
              ? { label: "Limpar busca", onClick: () => setSearch("") }
              : undefined
          }
        />
      ) : (
        filteredCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() =>
                setExpandedCategories((prev) => ({ ...prev, [category.id]: !prev[category.id] }))
              }
            >
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span>{category.emoji}</span>
                  {category.name}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {category.subcategories.length}
                  </Badge>
                </CardTitle>
                {expandedCategories[category.id] ? (
                  <IconChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <IconChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            {expandedCategories[category.id] && (
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {category.subcategories.map((sub) => (
                    <SubcategoryCard key={sub.id} sub={sub} />
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))
      )}

      <BauContributeDialog
        open={showContributeDialog}
        onOpenChange={setShowContributeDialog}
      />
    </div>
  )
}
