"use client"

import { IconSearch } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { COURSE_CATEGORIES } from "../data/mock-courses"
import type { CourseLevel, CourseStatus } from "../types"

type StatusFilter = CourseStatus | "todos"

interface CoursesFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  level: string
  onLevelChange: (value: string) => void
  status: StatusFilter
  onStatusChange: (value: StatusFilter) => void
}

const LEVEL_OPTIONS: { value: CourseLevel | "todos"; label: string }[] = [
  { value: "todos", label: "Todos os niveis" },
  { value: "iniciante", label: "Iniciante" },
  { value: "intermediario", label: "Intermediario" },
  { value: "avancado", label: "Avancado" },
]

export function CoursesFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  level,
  onLevelChange,
  status,
  onStatusChange,
}: CoursesFiltersProps) {
  return (
    <div className="space-y-4">
      <Tabs
        value={status}
        onValueChange={(v) => onStatusChange(v as StatusFilter)}
      >
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="em_andamento">Em Andamento</TabsTrigger>
          <TabsTrigger value="concluido">Concluidos</TabsTrigger>
          <TabsTrigger value="nao_iniciado">Nao Iniciados</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas categorias</SelectItem>
            {COURSE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={level} onValueChange={onLevelChange}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Nivel" />
          </SelectTrigger>
          <SelectContent>
            {LEVEL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
