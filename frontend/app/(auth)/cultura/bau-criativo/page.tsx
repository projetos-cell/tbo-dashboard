"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

// Seed references per subcategory (static examples while Supabase table is not yet available)
const SEED_REFERENCES: Record<string, { name: string; url: string; description: string }[]> = {
  "sub-branding-moodboard": [
    { name: "Behance — Real Estate Branding", url: "https://www.behance.net/search/projects?search=real+estate+branding", description: "Portfólios de branding imobiliário de alto padrão" },
    { name: "Pinterest — Luxury Brand Identity", url: "https://www.pinterest.com/search/pins/?q=luxury+real+estate+branding", description: "Referências visuais de identidade premium" },
  ],
  "sub-branding-tipografia": [
    { name: "Google Fonts — Serif Collection", url: "https://fonts.google.com/?category=Serif", description: "Famílias tipográficas serifadas para branding premium" },
    { name: "Fonts In Use — Real Estate", url: "https://fontsinuse.com/search#q=real+estate", description: "Tipografia aplicada em projetos imobiliários reais" },
  ],
  "sub-3d-studios": [
    { name: "CGarchitect Awards", url: "https://awards.cgarchitect.com", description: "Melhores renders arquitetônicos do mundo" },
    { name: "Blur Studio Portfolio", url: "https://www.blur.com", description: "Referência global em animação 3D e visual effects" },
  ],
}

function getRefs(subcategoryId: string) {
  return SEED_REFERENCES[subcategoryId] ?? []
}

export default function BauCriativoPage() {
  const [search, setSearch] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(BAU_CRIATIVO.map((cat) => [cat.id, true]))
  )
  const [expandedRefs, setExpandedRefs] = useState<Record<string, boolean>>({})
  const [showContributeDialog, setShowContributeDialog] = useState(false)

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleRefs = (subcategoryId: string) => {
    setExpandedRefs((prev) => ({ ...prev, [subcategoryId]: !prev[subcategoryId] }))
  }

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
            <h1 className="text-2xl font-bold tracking-tight">Bau Criativo</h1>
            <p className="text-sm text-muted-foreground">
              Referencias, ferramentas e inspiracoes para o dia a dia criativo
            </p>
          </div>
        </div>
        <Button onClick={() => setShowContributeDialog(true)} className="gap-2">
          <IconPlus className="h-4 w-4" />
          Contribuir referencia
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
            Aprenda com quem ja fez. Fonte viva de referencias segmentadas por setor da TBO.
          </p>
        </CardContent>
      </Card>

      {/* Categories */}
      {filteredCategories.length === 0 ? (
        <EmptyState
          icon="search"
          title="Nenhuma subcategoria encontrada"
          description="Tente buscar por outro termo."
        />
      ) : (
        filteredCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => toggleCategory(category.id)}
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
                  {category.subcategories.map((sub) => {
                    const refs = getRefs(sub.id)
                    const isRefsExpanded = expandedRefs[sub.id] ?? false

                    return (
                      <Card key={sub.id} className="border-dashed">
                        <CardContent className="flex flex-col gap-3 pt-6">
                          <h3 className="font-semibold">{sub.name}</h3>
                          <p className="text-sm text-muted-foreground">{sub.description}</p>

                          {/* Reference list (expandable) */}
                          {refs.length > 0 && isRefsExpanded && (
                            <ul className="space-y-2">
                              {refs.map((ref) => (
                                <li
                                  key={ref.name}
                                  className="rounded-md border bg-muted/30 p-2 text-xs"
                                >
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
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-auto gap-2 self-start"
                            onClick={() => toggleRefs(sub.id)}
                          >
                            <IconExternalLink className="h-4 w-4" />
                            {isRefsExpanded
                              ? "Ocultar referencias"
                              : refs.length > 0
                                ? `Ver referencias (${refs.length})`
                                : "Ver referencias"}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
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
